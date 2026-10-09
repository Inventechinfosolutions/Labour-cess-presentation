import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import gsap from "gsap";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BellRing,
  CheckCircle2,
  Clock,
  FileText,
  LineChart as LineChartIcon,
  ListTodo,
  MessageSquareWarning,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  DataListFilterButton,
  DataListPageShell,
  DataListPaginationFooter,
  DataListSearchField,
  useDataListPagination,
} from "@/components/DataListPage";
import { AppShell } from "@/components/AppShell";
import { NotificationMarqueeStrip } from "@/components/NotificationMarquee";
import { SLABadge, StatusBadge } from "@/components/Bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dashboardKpiIconWrapClass } from "@/lib/dashboard-kpi-icon";
import { db, formatDate, relativeTime, useDbVersion, useSession } from "@/lib/hooks";
import { appPath, cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  ReferenceLine,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  type BarShapeProps,
} from "recharts";

/** Unique fill id for IPP SLA area chart (dashboard). */
const IPP_SLA_AREA_GRADIENT_ID = "ipp-sla-days-area-fill";

/** SVG pattern ids — milestone Days-to-due capsule stripes (alternate bars). */
const MILE_BAR_STRIPE_PRIMARY = "ipp-mile-bar-stripe-primary";
const MILE_BAR_STRIPE_SOON = "ipp-mile-bar-stripe-soon";
const MILE_BAR_STRIPE_LATE = "ipp-mile-bar-stripe-late";

type MilestoneBarPayload = {
  daysToDue: number;
  barVariant: "solid" | "stripe";
};

/** Rounded capsule column (vertical bar chart) matching reference visuals. */
function MilestoneCapsuleBar(props: BarShapeProps) {
  const { x = 0, y = 0, width: w = 0, height: rawH = 0 } = props;

  const payload = props.payload as MilestoneBarPayload | undefined;
  const days = payload?.daysToDue ?? 0;
  const variant = payload?.barVariant ?? "solid";

  const solidFill =
    days < 0 ? "var(--destructive)" : days <= 7 ? "var(--chart-4)" : "var(--primary)";
  const stripeUrl =
    days < 0
      ? MILE_BAR_STRIPE_LATE
      : days <= 7
        ? MILE_BAR_STRIPE_SOON
        : MILE_BAR_STRIPE_PRIMARY;

  const h = Math.abs(rawH);
  const top = rawH < 0 ? y + rawH : y;

  /** Inset narrows capsule + adds visual gap between neighbours */
  const inset = Math.max(3, Math.min(w * 0.11, 6));
  const innerW = Math.max(w - inset * 2, 10);
  const innerX = x + (w - innerW) / 2;
  const rx = Math.min(innerW / 2, h / 2, 22);

  if (innerW <= 0 || h <= 1) return null;

  const fill = variant === "stripe" ? `url(#${stripeUrl})` : solidFill;

  return (
    <g className="recharts-bar-rectangle">
      <rect
        x={innerX}
        y={top}
        width={innerW}
        height={h}
        rx={rx}
        ry={rx}
        fill={fill}
        className="cursor-pointer transition-opacity hover:opacity-90 dark:hover:opacity-95"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={days < 0 ? 0 : 1}
      />
    </g>
  );
}

export const Route = createFileRoute("/ipp/")({
  head: () => ({ meta: [{ title: "IPP Dashboard — PMIS" }] }),
  component: IPPDash,
});

function usePrefersReducedMotion() {
  const [v, setV] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fn = () => setV(mq.matches);
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);
  return v;
}

function CountUp({
  value,
  reduced,
  className,
}: {
  value: number;
  reduced: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.textContent = String(value);
      return;
    }
    const state = { n: 0 };
    const tween = gsap.to(state, {
      n: value,
      duration: 0.9,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = String(Math.round(state.n));
      },
    });
    return () => {
      tween.kill();
    };
  }, [value, reduced]);

  return (
    <span ref={ref} className={className} suppressHydrationWarning>
      {reduced ? value : 0}
    </span>
  );
}

function glassCardClass(extra?: string) {
  return cn(
    "rounded-3xl border border-border/50 bg-card/80 shadow-lg shadow-black/5 ring-1 ring-foreground/[0.04] backdrop-blur-xl dark:bg-card/70 dark:shadow-black/20",
    extra,
  );
}

const KPI_CARD_MIN_H = "min-h-[7.25rem]";
const KPI_FOOTER_MIN_H = "min-h-[2.25rem]";

function IPPDash() {
  const user = useSession();
  const navigate = useNavigate();
  const dbVersion = useDbVersion();
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const kpiWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const midRefs = useRef<(HTMLDivElement | null)[]>([]);

  if (!user) return null;

  const projects = db.listProjects({ ippId: user.id });
  const queries = projects.flatMap((p) =>
    p.queries.filter((q) => q.status === "Open").map((q) => ({ q, p })),
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      const s = search.trim().toLowerCase();
      if (!s) return true;
      return (
        p.name.toLowerCase().includes(s) ||
        p.opportunityName.toLowerCase().includes(s) ||
        p.stage.toLowerCase().includes(s)
      );
    });
  }, [projects, search, statusFilter]);

  const resetKey = `${search}\0${statusFilter}`;
  const {
    pageSize,
    setPageSize,
    safePage,
    pageCount,
    paged,
    start,
    end,
    setPage,
    goFirst,
    goLast,
    goPrev,
    goNext,
  } = useDataListPagination(filteredProjects, resetKey);

  const statusBadgeCount = statusFilter !== "all" ? 1 : 0;

  const approvedOrExecuting = projects.filter((p) =>
    ["Approved", "In Execution", "Completed"].includes(p.status),
  ).length;
  const inReview = projects.filter((p) =>
    ["Submitted", "Under Review", "Query Raised"].includes(p.status),
  ).length;
  const openDrafts = projects.filter((p) => p.status === "Draft").length;

  const recentActivity = useMemo(
    () => [...projects].sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).slice(0, 5),
    [projects],
  );

  /** Top upcoming milestones across all projects, sorted by due date. */
  const upcomingMilestones = useMemo(() => {
    return projects
      .flatMap((p) =>
        p.milestones.map((m) => ({
          projectId: p.id,
          projectName: p.name,
          opportunityName: p.opportunityName,
          milestone: m,
        })),
      )
      .filter((row) => row.milestone.status !== "Completed" && row.milestone.status !== "Verified")
      .sort((a, b) => new Date(a.milestone.dueDate).getTime() - new Date(b.milestone.dueDate).getTime())
      .slice(0, 8);
  }, [projects]);

  const allNotifications = useMemo(
    () => [...db.listNotifications(user.id)].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [user.id, dbVersion],
  );
  const unreadNotifications = useMemo(
    () => allNotifications.filter((n) => !n.read).length,
    [allNotifications],
  );

  const milestonePieData = useMemo(() => {
    const all = projects.flatMap((p) => p.milestones);
    if (all.length === 0) return [];
    const counts = new Map<string, number>();
    for (const m of all) {
      counts.set(m.status, (counts.get(m.status) ?? 0) + 1);
    }
    const meta = [
      { status: "Not Started", label: "Not started", fill: "var(--chart-5)" },
      { status: "In Progress", label: "In progress", fill: "var(--chart-1)" },
      { status: "Submitted", label: "Submitted", fill: "var(--chart-3)" },
      { status: "Verified", label: "Verified", fill: "var(--chart-2)" },
      { status: "Completed", label: "Completed", fill: "var(--chart-4)" },
    ];
    return meta
      .map((m) => ({ name: m.label, value: counts.get(m.status) ?? 0, fill: m.fill }))
      .filter((d) => d.value > 0);
  }, [projects]);

  const milestoneCompletionPct = useMemo(() => {
    const all = projects.flatMap((p) => p.milestones);
    if (all.length === 0) return null;
    const done = all.filter((m) => m.status === "Verified" || m.status === "Completed").length;
    return Math.round((done / all.length) * 100);
  }, [projects]);

  const upcomingMilestoneBarData = useMemo(() => {
    return upcomingMilestones.slice(0, 6).map((row, i) => {
      const due = new Date(row.milestone.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);
      const daysToDue = Math.ceil((due.getTime() - today.getTime()) / 86400000);
      const shortName =
        row.milestone.name.length > 26 ? `${row.milestone.name.slice(0, 25)}…` : row.milestone.name;
      const label = `#${row.milestone.sequence} ${shortName}`;
      const projTick =
        row.projectName.length > 14 ? `${row.projectName.slice(0, 13)}…` : row.projectName;
      const axisLabel = `${i + 1}. #${row.milestone.sequence} · ${projTick}`;
      /** Alternate capsule fill: solid vs diagonal stripes (reference UI). */
      const barVariant: MilestoneBarPayload["barVariant"] = i % 2 === 1 ? "stripe" : "solid";
      return {
        label,
        axisLabel,
        daysToDue,
        barVariant,
        fullName: row.milestone.name,
        projectName: row.projectName,
        projectId: row.projectId,
        dueDate: row.milestone.dueDate,
        milestoneStatus: row.milestone.status,
      };
    });
  }, [upcomingMilestones]);

  const slaFocusGraphData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const candidates = [...projects]
      .filter((p) => p.status !== "Completed" && p.slaDueDate)
      .sort((a, b) => new Date(a.slaDueDate).getTime() - new Date(b.slaDueDate).getTime())
      .slice(0, 6);

    return candidates.map((p, i) => {
      const due = new Date(p.slaDueDate);
      due.setHours(0, 0, 0, 0);
      const rawDays = Math.ceil((due.getTime() - today.getTime()) / 86400000);
      const tickLabel = due.toLocaleString("en-IN", { month: "short", day: "numeric" });
      return {
        id: p.id,
        order: i + 1,
        tickLabel,
        fullName: p.name,
        opportunityName: p.opportunityName,
        projectStatus: p.status,
        slaStatus: p.slaStatus,
        daysLeft: Math.max(0, rawDays),
        rawDays,
        closeDate: p.slaDueDate,
      };
    });
  }, [projects]);

  useLayoutEffect(() => {
    if (reduced || !rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(kpiWrapRefs.current.filter(Boolean), {
        opacity: 0,
        y: 22,
        duration: 0.55,
        stagger: 0.09,
        ease: "power3.out",
      });
      gsap.from(midRefs.current.filter(Boolean), {
        opacity: 0,
        y: 18,
        duration: 0.5,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.12,
      });
    }, rootRef);
    return () => ctx.revert();
  }, [reduced, projects.length, queries.length]);

  return (
    <AppShell role="ipp">
      <DataListPageShell>
        <div
          ref={rootRef}
          className="relative space-y-6 rounded-3xl border border-border/40 bg-gradient-to-b from-muted/50 via-background to-background p-4 shadow-inner sm:p-6"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-48 rounded-t-3xl bg-gradient-to-b from-primary/[0.06] to-transparent"
            aria-hidden
          />

          <header className="relative flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              <span className="bg-gradient-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Track your applications, SLA commitments, and open officer queries in one place.
            </p>
          </header>

          <section aria-label="IPP metrics" className="relative grid items-stretch gap-2 sm:grid-cols-2 xl:grid-cols-4">
            <div
              ref={(el) => {
                kpiWrapRefs.current[0] = el;
              }}
              className="flex h-full min-h-0 flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <Card
                className={cn(
                  glassCardClass(`flex h-full ${KPI_CARD_MIN_H} flex-col border-primary/20 py-0`),
                  "bg-gradient-to-br from-primary via-primary/92 to-chart-2 text-primary-foreground shadow-xl ring-primary/20",
                )}
              >
                <CardContent className="flex min-h-0 flex-1 flex-col justify-between gap-2 px-4 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-primary-foreground/80">
                        Applications
                      </p>
                      <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight">
                        <CountUp value={projects.length} reduced={reduced} />
                      </p>
                    </div>
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/25">
                      <FileText className="size-3.5" aria-hidden />
                    </div>
                  </div>
                  <div className={cn("flex flex-wrap items-end gap-1.5 text-[0.65rem] text-primary-foreground/90", KPI_FOOTER_MIN_H)}>
                    <Badge className="border-0 px-1.5 py-0 text-[0.65rem] leading-tight bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/25">
                      {openDrafts} drafts
                    </Badge>
                    <span className="text-primary-foreground/75">Portfolio total</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {[
              {
                label: "Approved / executing",
                value: approvedOrExecuting,
                sub: "Approved, in execution, completed",
                icon: CheckCircle2,
                iconTone: "emerald" as const,
              },
              {
                label: "In review",
                value: inReview,
                sub: "Submitted and under scrutiny",
                icon: ArrowUpRight,
                iconTone: "indigo" as const,
              },
              {
                label: "Open queries",
                value: queries.length,
                sub: "Require response from your team",
                icon: MessageSquareWarning,
                iconTone: "amber" as const,
              },
            ].map((k, i) => (
              <div
                key={k.label}
                ref={(el) => {
                  kpiWrapRefs.current[i + 1] = el;
                }}
                className="flex h-full min-h-0 flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                <Card className={cn(glassCardClass(`flex h-full ${KPI_CARD_MIN_H} flex-col py-0`))}>
                  <CardContent className="flex min-h-0 flex-1 flex-col justify-between gap-2 px-4 py-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {k.label}
                        </p>
                        <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                          <CountUp value={k.value} reduced={reduced} />
                        </p>
                      </div>
                      <div className={dashboardKpiIconWrapClass(k.iconTone)}>
                        <k.icon aria-hidden />
                      </div>
                    </div>
                    <p className={cn("flex items-end text-[0.65rem] leading-snug text-chart-2", KPI_FOOTER_MIN_H)}>
                      {k.sub}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </section>

          <section className="relative grid gap-4 lg:grid-cols-12" aria-label="SLA and activity">
            <div
              ref={(el) => {
                midRefs.current[0] = el;
              }}
              className="lg:col-span-7"
            >
              <Card className={glassCardClass()}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <LineChartIcon className="size-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base">SLA focus</CardTitle>
                      <CardDescription className="text-xs">
                        Line graph: days left until SLA due, ordered by deadline
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="shrink-0 rounded-xl text-xs">
                    <Link to="/ipp/applications">
                      Applications
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="pt-0">
                  {slaFocusGraphData.length > 0 ? (
                    <div className="space-y-2">
                      <div
                        className="h-[220px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/40"
                        role="img"
                        aria-label="Area chart of days until SLA due date by due date"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            data={slaFocusGraphData}
                            margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                          >
                            <defs>
                              <linearGradient id={IPP_SLA_AREA_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.32} />
                                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" horizontal vertical />
                            <XAxis
                              dataKey="tickLabel"
                              tick={{ fontSize: 10 }}
                              tickLine={false}
                              axisLine={false}
                              interval={0}
                              height={44}
                              tickMargin={6}
                              label={{
                                value: "Due date",
                                position: "insideBottom",
                                offset: -4,
                                style: { fontSize: 10, fill: "var(--muted-foreground)" },
                              }}
                            />
                            <YAxis
                              tick={{ fontSize: 10 }}
                              allowDecimals={false}
                              tickLine={false}
                              axisLine={false}
                              width={36}
                              domain={[0, "auto"]}
                              label={{
                                value: "Days left",
                                angle: -90,
                                position: "insideLeft",
                                style: { fontSize: 10, fill: "var(--muted-foreground)" },
                              }}
                            />
                            <RechartsTooltip
                              content={(props) => {
                                const { active, payload } = props;
                                if (!active || !payload?.length) return null;
                                const row = payload[0].payload as (typeof slaFocusGraphData)[number];
                                const overdue = row.rawDays < 0;
                                const daysPhrase = overdue
                                  ? `${Math.abs(row.rawDays)} day${Math.abs(row.rawDays) === 1 ? "" : "s"} overdue`
                                  : `${row.rawDays} day${row.rawDays === 1 ? "" : "s"} left`;
                                return (
                                  <div className="rounded-lg border border-border/60 bg-card/95 px-2.5 py-2 text-xs shadow-md backdrop-blur-sm">
                                    <p className="font-semibold leading-snug text-foreground">{row.fullName}</p>
                                    <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
                                      {row.opportunityName}
                                    </p>
                                    <p className="mt-1 flex flex-wrap items-center gap-1.5">
                                      <SLABadge status={row.slaStatus} />
                                      <span className="tabular-nums text-muted-foreground">{daysPhrase}</span>
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                      Due {formatDate(row.closeDate)}
                                    </p>
                                    <a
                                      href={appPath(
                                        row.projectStatus === "Draft"
                                          ? `/ipp/applications/${row.id}`
                                          : `/ipp/projects/${row.id}`,
                                      )}
                                      className="mt-2 inline-flex items-center gap-0.5 text-[11px] font-semibold text-primary hover:gap-1"
                                    >
                                      Open application
                                      <ArrowUpRight className="size-3" />
                                    </a>
                                  </div>
                                );
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="daysLeft"
                              stroke="var(--primary)"
                              strokeWidth={2}
                              fill={`url(#${IPP_SLA_AREA_GRADIENT_ID})`}
                              dot={{
                                r: 4,
                                strokeWidth: 2,
                                stroke: "var(--background)",
                                fill: "var(--primary)",
                              }}
                              activeDot={{ r: 5, strokeWidth: 0 }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-center text-[0.65rem] text-muted-foreground">
                        Points follow upcoming deadlines (left = soonest). Hover for application details.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 border border-dashed border-border/60 py-12 text-center">
                      <Clock className="size-5 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">No active SLA items found.</p>
                      <Button variant="outline" size="sm" asChild className="mt-2 rounded-xl text-xs">
                        <Link to="/ipp/applications">Browse applications</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div
              ref={(el) => {
                midRefs.current[1] = el;
              }}
              className="lg:col-span-5"
            >
              <Card className={glassCardClass()}>
                <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-2">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/35 bg-gradient-to-br from-cyan-400/35 via-sky-500/18 to-blue-600/12 text-cyan-900 shadow-sm shadow-cyan-500/15 ring-1 ring-cyan-500/10 dark:from-cyan-500/28 dark:via-sky-600/18 dark:to-blue-950/40 dark:text-cyan-50 dark:border-cyan-400/30 dark:ring-cyan-400/10"
                    aria-hidden
                  >
                    <Activity className="size-4" strokeWidth={2.25} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <CardTitle className="text-base">Recent Opportunities</CardTitle>
                    <CardDescription className="text-xs">
                      Latest updated opportunities
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentActivity.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No activity yet.</p>
                  ) : (
                    recentActivity.map((p) => (
                      <a
                        key={p.id}
                        href={appPath(p.status === "Draft" ? `/ipp/applications/${p.id}` : `/ipp/projects/${p.id}`)}
                        className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 py-2 hover:bg-muted/35"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-foreground">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{relativeTime(p.lastUpdated)}</p>
                        </div>
                        <ArrowUpRight className="size-3.5 shrink-0 text-primary" aria-hidden />
                      </a>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          <section aria-label="Notifications" className="relative">
            <div
              ref={(el) => {
                midRefs.current[2] = el;
              }}
            >
              <div className="relative flex flex-col gap-3">
                <div className="flex flex-row items-start gap-3">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-rose-500/35 bg-gradient-to-br from-rose-400/35 via-rose-500/18 to-pink-600/12 text-rose-900 shadow-sm shadow-rose-500/15 ring-1 ring-rose-500/10 dark:from-rose-500/28 dark:via-rose-600/18 dark:to-pink-950/40 dark:text-rose-50 dark:border-rose-400/30 dark:ring-rose-400/10"
                    aria-hidden
                  >
                    <BellRing className="size-4" strokeWidth={2.25} />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold leading-none text-foreground">Notifications</p>
                      {unreadNotifications > 0 ? (
                        <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold tabular-nums text-white shadow-sm">
                          {unreadNotifications}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Scrolling feed — hover or focus to pause.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <NotificationMarqueeStrip notifications={allNotifications} reduced={reduced} />
                  {allNotifications.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/20 px-3 py-6 text-center">
                      <Bell className="size-5 text-muted-foreground/60" aria-hidden />
                      <p className="text-xs text-muted-foreground">You&apos;re all caught up.</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className="relative grid gap-4 lg:grid-cols-12" aria-label="Milestones overview">
            <div
              ref={(el) => {
                midRefs.current[3] = el;
              }}
              className="lg:col-span-12"
            >
              <Card className={glassCardClass()}>
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/35 bg-gradient-to-br from-emerald-400/35 via-emerald-500/18 to-green-700/12 text-emerald-900 shadow-sm shadow-emerald-500/15 ring-1 ring-emerald-500/10 dark:from-emerald-500/28 dark:via-emerald-600/18 dark:to-green-950/40 dark:text-emerald-50 dark:border-emerald-400/30 dark:ring-emerald-400/10"
                      aria-hidden
                    >
                      <ListTodo className="size-5" strokeWidth={2.25} />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-base">Upcoming milestones</CardTitle>
                      <CardDescription className="text-xs">
                        Status mix across your milestones and horizon for the next dues — click a bar to open the project.
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="shrink-0 rounded-xl text-xs">
                    <Link to="/ipp/milestones">
                      All milestones
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {milestonePieData.length === 0 && upcomingMilestoneBarData.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 bg-muted/20 px-4 py-10 text-center">
                      <ListTodo className="size-6 text-muted-foreground/60" aria-hidden />
                      <p className="text-sm font-medium text-foreground">No active milestones</p>
                      <p className="text-xs text-muted-foreground">
                        Milestones appear once your projects move into execution.
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-12">
                      <div className="flex flex-col rounded-2xl border border-border/45 bg-muted/15 p-4 lg:col-span-4 dark:bg-muted/10">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Portfolio mix
                        </p>
                        {milestonePieData.length > 0 ? (
                          <>
                            <div className="relative mx-auto mt-2 h-[196px] w-full max-w-[220px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={milestonePieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={58}
                                    outerRadius={82}
                                    paddingAngle={2}
                                    dataKey="value"
                                    strokeWidth={2}
                                    stroke="var(--background)"
                                  >
                                    {milestonePieData.map((entry, i) => (
                                      <Cell key={i} fill={entry.fill} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip
                                    content={({ active, payload }) => {
                                      if (!active || !payload?.length) return null;
                                      const row = payload[0];
                                      return (
                                        <div className="rounded-lg border border-border/60 bg-card/95 px-2 py-1.5 text-[11px] shadow-md backdrop-blur-sm">
                                          <span className="font-medium">{String(row.name)}</span>
                                          <span className="tabular-nums text-muted-foreground">
                                            {": "}
                                            {String(row.value)}
                                          </span>
                                        </div>
                                      );
                                    }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pt-1">
                                {milestoneCompletionPct !== null ? (
                                  <>
                                    <span className="text-2xl font-bold tabular-nums text-foreground">
                                      {milestoneCompletionPct}%
                                    </span>
                                    <span className="text-[10px] font-medium text-muted-foreground">Done</span>
                                  </>
                                ) : null}
                              </div>
                            </div>
                            <ul className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 border-t border-border/40 pt-3">
                              {milestonePieData.map((s) => (
                                <li
                                  key={s.name}
                                  className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
                                >
                                  <span
                                    className="size-2 shrink-0 rounded-full ring-2 ring-background"
                                    style={{ background: s.fill }}
                                  />
                                  <span className="font-medium text-foreground">{s.name}</span>
                                  <span className="tabular-nums">({s.value})</span>
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : (
                          <p className="mt-6 pb-10 text-center text-sm text-muted-foreground">
                            No milestone records on your portfolio yet.
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col rounded-2xl border border-border/45 bg-card/60 p-4 lg:col-span-8 dark:bg-card/40">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Days to due (nearest)
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Negative = overdue · Columns open the project workspace
                        </p>
                        {upcomingMilestoneBarData.length > 0 ? (
                          <div
                            className="mt-3 h-[min(320px,46vh)] w-full min-h-[220px] [&_.recharts-cartesian-grid_line]:stroke-border/35 [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground"
                            role="img"
                            aria-label="Nearest milestone deadlines by days to due date"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={upcomingMilestoneBarData}
                                margin={{ top: 12, right: 8, left: 4, bottom: 56 }}
                                barCategoryGap="22%"
                                barGap={10}
                              >
                                <defs>
                                  <pattern
                                    id={MILE_BAR_STRIPE_PRIMARY}
                                    width="8"
                                    height="8"
                                    patternUnits="userSpaceOnUse"
                                    patternTransform="rotate(-42)"
                                  >
                                    <rect width="8" height="8" fill="var(--primary)" />
                                    <rect x={0} y={0} width="3.4" height="12" fill="white" opacity={0.34} />
                                  </pattern>
                                  <pattern
                                    id={MILE_BAR_STRIPE_SOON}
                                    width="8"
                                    height="8"
                                    patternUnits="userSpaceOnUse"
                                    patternTransform="rotate(-42)"
                                  >
                                    <rect width="8" height="8" fill="var(--chart-4)" />
                                    <rect x={0} y={0} width="3.4" height="12" fill="white" opacity={0.32} />
                                  </pattern>
                                  <pattern
                                    id={MILE_BAR_STRIPE_LATE}
                                    width="8"
                                    height="8"
                                    patternUnits="userSpaceOnUse"
                                    patternTransform="rotate(-42)"
                                  >
                                    <rect width="8" height="8" fill="var(--destructive)" />
                                    <rect x={0} y={0} width="3.4" height="12" fill="white" opacity={0.28} />
                                  </pattern>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                  dataKey="axisLabel"
                                  tick={{ fontSize: 9 }}
                                  tickLine={false}
                                  axisLine={false}
                                  interval={0}
                                  height={48}
                                  angle={-32}
                                  dy={6}
                                  dx={-4}
                                  textAnchor="end"
                                />
                                <YAxis
                                  type="number"
                                  tick={{ fontSize: 10 }}
                                  tickLine={false}
                                  axisLine={false}
                                  domain={["dataMin - 6", "dataMax + 10"]}
                                  width={36}
                                  label={{
                                    value: "Days to due",
                                    angle: -90,
                                    position: "insideLeft",
                                    style: { fontSize: 10, fill: "var(--muted-foreground)" },
                                    offset: 4,
                                  }}
                                />
                                <ReferenceLine y={0} stroke="var(--border)" strokeDasharray="4 4" />
                                <RechartsTooltip
                                  cursor={false}
                                  content={({ active, payload }) => {
                                    if (!active || !payload?.length) return null;
                                    const row = payload[0].payload as (typeof upcomingMilestoneBarData)[number];
                                    const rel =
                                      row.daysToDue < 0
                                        ? `${Math.abs(row.daysToDue)}d overdue`
                                        : row.daysToDue === 0
                                          ? "Due today"
                                          : `${row.daysToDue}d left`;
                                    return (
                                      <div className="relative inline-block pb-2">
                                        <div className="max-w-[15rem] rounded-xl bg-zinc-900 px-3 py-2.5 text-[11px] leading-snug text-white shadow-xl ring-1 ring-white/10 dark:bg-zinc-950">
                                          <p className="font-semibold">{row.fullName}</p>
                                          <p className="mt-1 text-zinc-300">{row.projectName}</p>
                                          <p className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1 text-zinc-400">
                                            <span>Due {formatDate(row.dueDate)}</span>
                                            <span className="font-semibold tabular-nums text-white">{rel}</span>
                                          </p>
                                        </div>
                                        <div
                                          className="pointer-events-none absolute left-1/2 top-full z-10 h-0 w-0 -translate-x-1/2 border-x-[8px] border-t-[10px] border-x-transparent border-t-zinc-900 dark:border-t-zinc-950"
                                          aria-hidden
                                        />
                                      </div>
                                    );
                                  }}
                                />
                                <Bar
                                  dataKey="daysToDue"
                                  cursor="pointer"
                                  shape={(barProps: BarShapeProps) => <MilestoneCapsuleBar {...barProps} />}
                                  onClick={(e: { payload?: { projectId?: string } }) => {
                                    const id = e?.payload?.projectId;
                                    if (id) void navigate({ href: `/ipp/projects/${id}` });
                                  }}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : milestonePieData.length > 0 ? (
                          <div className="mt-8 flex flex-1 flex-col items-center justify-center gap-2 pb-8 text-center text-sm text-muted-foreground">
                            <CheckCircle2 className="size-8 text-emerald-500/80" aria-hidden />
                            <p>No open upcoming deadlines — all tracked milestones are complete or verified.</p>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          <Card className={cn(glassCardClass("overflow-hidden p-0"))} aria-labelledby="ipp-projects-heading">
            <div className="border-b border-border/60 bg-gradient-to-r from-muted/50 via-card/50 to-primary/[0.06] px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 shrink-0">
                  <h2 id="ipp-projects-heading" className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                    My applications
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Search and filter your application portfolio with current stage and SLA visibility.
                  </p>
                </div>
                <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:max-w-[min(100%,40rem)] lg:pl-4">
                  <DataListSearchField
                    value={search}
                    onChange={setSearch}
                    placeholder="Search applications…"
                    ariaLabel="Search applications"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <DataListFilterButton activeCount={statusBadgeCount} />
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Filter results</p>
                        <div className="space-y-2">
                          <Label htmlFor="ipp-dashboard-status" className="text-xs text-muted-foreground">
                            Status
                          </Label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger id="ipp-dashboard-status" className="h-9 w-full" aria-label="Status">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All statuses</SelectItem>
                              <SelectItem value="Draft">Draft</SelectItem>
                              <SelectItem value="Submitted">Submitted</SelectItem>
                              <SelectItem value="Under Review">Under Review</SelectItem>
                              <SelectItem value="Query Raised">Query Raised</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="In Execution">In Execution</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button variant="ghost" size="sm" asChild className="shrink-0 rounded-xl sm:self-center">
                    <Link to="/ipp/applications">
                      View all
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="app-data-table-grid w-full min-w-[760px] text-xs">
                <thead>
                  <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
                    <th className="w-11 px-2 py-2.5 text-center tabular-nums">Sl.</th>
                    <th className="px-4 py-2.5">Project</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Stage</th>
                    <th className="px-3 py-2.5">SLA</th>
                    <th className="px-3 py-2.5">Updated</th>
                    <th className="px-4 py-2.5 text-right" />
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No applications match your search or filters.
                      </td>
                    </tr>
                  ) : (
                    paged.map((p, rowIdx) => (
                      <tr key={p.id} className="app-data-table-body-row transition">
                        <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">
                          {(safePage - 1) * pageSize + rowIdx + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{p.name}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">{p.opportunityName}</div>
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{p.stage}</td>
                        <td className="px-3 py-3">
                          <SLABadge status={p.slaStatus} />
                          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="size-3" aria-hidden />
                            {formatDate(p.slaDueDate)}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{relativeTime(p.lastUpdated)}</td>
                        <td className="px-4 py-3 text-right">
                          <a
                            href={appPath(p.status === "Draft" ? `/ipp/applications/${p.id}` : `/ipp/projects/${p.id}`)}
                            className="inline-flex items-center gap-0.5 text-xs font-medium text-primary transition hover:gap-1"
                          >
                            Open
                            <ArrowUpRight className="size-3" aria-hidden />
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <DataListPaginationFooter
              filteredLength={filteredProjects.length}
              safePage={safePage}
              pageCount={pageCount}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              onPageChange={setPage}
              goFirst={goFirst}
              goLast={goLast}
              goPrev={goPrev}
              goNext={goNext}
              start={start}
              end={end}
            />
          </Card>
        </div>
      </DataListPageShell>
    </AppShell>
  );
}
