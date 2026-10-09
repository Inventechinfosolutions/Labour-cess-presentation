import { createFileRoute, Link } from "@tanstack/react-router";
import gsap from "gsap";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Eye,
  Hammer,
  LineChart as LineChartIcon,
  MapPin,
  Sparkles,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  DataListFilterButton,
  DataListPageShell,
  DataListPaginationFooter,
  DataListSearchField,
  useDataListPagination,
} from "@/components/DataListPage";
import { AppShell } from "@/components/AppShell";
import { SLABadge, StatusBadge } from "@/components/Bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dashboardKpiIconWrapClass } from "@/lib/dashboard-kpi-icon";
import { db, formatDate, relativeTime, useDbVersion, useSession } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/management/")({
  head: () => ({ meta: [{ title: "Management — PMIS" }] }),
  component: ManagementDashboard,
});

const TYPE_COLORS = ["var(--chart-2)", "var(--chart-4)", "var(--chart-3)"] as const;
const STATUS_BAR_FILLS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--primary)",
  "var(--muted-foreground)",
] as const;

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

/** Matches approver / IPP dashboard KPI tile chrome */
function kpiGlassCardClass(extra?: string) {
  return cn(
    "rounded-3xl border border-border/50 bg-card/80 shadow-lg shadow-black/5 ring-1 ring-foreground/[0.04] backdrop-blur-xl dark:bg-card/70 dark:shadow-black/20",
    extra,
  );
}

function glassCardClass(extra?: string) {
  return cn(
    "rounded-2xl border border-border/50 bg-card/80 shadow-lg shadow-black/[0.04] ring-1 ring-foreground/[0.04] backdrop-blur-xl dark:bg-card/70 dark:shadow-black/20",
    extra,
  );
}

const KPI_CARD_MIN_H = "min-h-[7.25rem]";
const KPI_FOOTER_MIN_H = "min-h-[2.25rem]";

function ManagementDashboard() {
  const user = useSession();
  useDbVersion();
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const kpiWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const midRefs = useRef<(HTMLDivElement | null)[]>([]);

  const projects = user ? db.listProjects() : [];

  const totalCap = projects.reduce((s, p) => s + p.capacityMW, 0);
  const commissioned = projects.filter((p) => p.status === "Commissioned");
  const commissionedMw = commissioned.reduce((s, p) => s + p.capacityMW, 0);
  const inExecution = projects.filter((p) => p.status === "In Execution").length;
  const inReview = projects.filter((p) => ["Submitted", "Under Review"].includes(p.status)).length;
  const breached = projects.filter((p) => p.slaStatus === "Breached").length;
  const avgCap = projects.length ? Math.round(totalCap / projects.length) : 0;

  const byType = useMemo(
    () =>
      ["Solar", "Wind", "Hybrid"].map((t) => ({
        name: t,
        value: projects.filter((p) => p.type === t).reduce((s, p) => s + p.capacityMW, 0),
        count: projects.filter((p) => p.type === t).length,
      })),
    [projects],
  );

  const byStatus = useMemo(
    () =>
      [
        "Submitted",
        "Under Review",
        "Query Raised",
        "Approved",
        "In Execution",
        "Completed",
        "Commissioned",
        "Rejected",
      ].map((s) => ({
        name: s,
        count: projects.filter((p) => p.status === s).length,
      })),
    [projects],
  );

  /** State-wise project counts. */
  const byState = useMemo(() => {
    const map = new Map<string, { count: number; capacity: number }>();
    for (const p of projects) {
      const cur = map.get(p.state) ?? { count: 0, capacity: 0 };
      map.set(p.state, { count: cur.count + 1, capacity: cur.capacity + p.capacityMW });
    }
    return Array.from(map.entries())
      .map(([state, v]) => ({ state, count: v.count, capacity: v.capacity }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [projects]);
  const topStateMax = byState[0]?.count ?? 1;

  const dominantType = useMemo(() => {
    return [...byType].sort((a, b) => b.value - a.value)[0] ?? null;
  }, [byType]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (typeFilter !== "all" && p.type !== typeFilter) return false;
      const s = search.trim().toLowerCase();
      if (!s) return true;
      return (
        p.name.toLowerCase().includes(s) ||
        p.ippName.toLowerCase().includes(s) ||
        p.state.toLowerCase().includes(s) ||
        p.district.toLowerCase().includes(s)
      );
    });
  }, [projects, search, statusFilter, typeFilter]);

  const resetKey = `${search}\0${statusFilter}\0${typeFilter}`;
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
  } = useDataListPagination(filtered, resetKey);

  const filterCount = (statusFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0);

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
  }, [reduced, projects.length]);

  if (!user) return null;

  return (
    <AppShell role="management">
      <DataListPageShell>
        <div ref={rootRef} className="space-y-6">
          {/* Hero */}
          <header className="relative">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-background/70 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-primary shadow-sm backdrop-blur">
                  <Sparkles className="size-3" aria-hidden />
                  Programme oversight
                </div>
                <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                  <span className="bg-gradient-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">
                    Dashboard
                  </span>
                </h1>
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                  Portfolio health, delivery throughput, and technology mix across the national programme — all in one view.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button asChild variant="outline" size="sm" className="h-10 gap-1.5 rounded-xl shadow-sm">
                  <Link to="/management/projects">
                    <Briefcase className="size-4" aria-hidden />
                    Portfolio register
                  </Link>
                </Button>
                <Button asChild size="sm" className="h-10 gap-1.5 rounded-xl shadow-sm">
                  <Link to="/management/analytics">
                    <BarChart3 className="size-4" aria-hidden />
                    Open analytics
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          {/* KPI strip — approver dashboard card pattern */}
          <section className="relative grid items-stretch gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="Management KPIs">
            <div
              ref={(el) => {
                kpiWrapRefs.current[0] = el;
              }}
              className="flex h-full min-h-0 flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
            >
              <Card
                className={cn(
                  kpiGlassCardClass(`flex h-full ${KPI_CARD_MIN_H} flex-col border-primary/20 py-0`),
                  "bg-gradient-to-br from-primary via-primary/92 to-chart-2 text-primary-foreground shadow-xl ring-primary/20",
                )}
              >
                <CardContent className="flex min-h-0 flex-1 flex-col justify-between gap-2 px-4 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-primary-foreground/80">
                        Projects
                      </p>
                      <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight">
                        <CountUp value={projects.length} reduced={reduced} />
                      </p>
                    </div>
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/25">
                      <Briefcase className="size-3.5" aria-hidden />
                    </div>
                  </div>
                  <div className={cn("flex flex-wrap items-end gap-1.5 text-[0.65rem] text-primary-foreground/90", KPI_FOOTER_MIN_H)}>
                    <Badge className="border-0 px-1.5 py-0 text-[0.65rem] leading-tight bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/25">
                      National portfolio
                    </Badge>
                    <span className="text-primary-foreground/75">Programme total</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {[
              {
                label: "Total capacity",
                valueDisplay: (
                  <>
                    <span className="tabular-nums">
                      {totalCap.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
                    </span>
                    <span className="ml-1 text-base font-semibold text-muted-foreground">MW</span>
                  </>
                ),
                sub: `~${avgCap} MW per project`,
                icon: Zap,
                iconTone: "violet" as const,
              },
              {
                label: "In execution",
                valueDisplay: <CountUp value={inExecution} reduced={reduced} />,
                sub: "Active construction / delivery",
                icon: Hammer,
                iconTone: "sky" as const,
              },
              {
                label: "Commissioned",
                valueDisplay: <CountUp value={commissioned.length} reduced={reduced} />,
                sub: `${commissionedMw} MW commissioned`,
                icon: CheckCircle2,
                iconTone: "emerald" as const,
              },
            ].map((k, i) => (
              <div
                key={k.label}
                ref={(el) => {
                  kpiWrapRefs.current[i + 1] = el;
                }}
                className="flex h-full min-h-0 flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
              >
                <Card className={cn(kpiGlassCardClass(`flex h-full ${KPI_CARD_MIN_H} flex-col py-0`))}>
                  <CardContent className="flex min-h-0 flex-1 flex-col justify-between gap-2 px-4 py-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          {k.label}
                        </p>
                        <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                          {k.valueDisplay}
                        </p>
                      </div>
                      <div className={dashboardKpiIconWrapClass(k.iconTone)}>
                        <k.icon aria-hidden />
                      </div>
                    </div>
                    <p className={cn("flex items-end text-[0.65rem] leading-snug text-chart-2", KPI_FOOTER_MIN_H)}>{k.sub}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </section>

          {/* Charts row */}
          <section className="grid gap-4 lg:grid-cols-12" aria-label="Portfolio charts">
            <div
              ref={(el) => {
                midRefs.current[0] = el;
              }}
              className={cn(glassCardClass("lg:col-span-7"))}
            >
              <div className="border-b border-border/50 bg-gradient-to-br from-rose-500/[0.06] via-card to-primary/[0.04] px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                      <BarChart3 className="size-4" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold tracking-tight text-foreground">Projects by status</h3>
                      <p className="text-[11px] text-muted-foreground">
                        Volume across delivery stages — hover columns for exact counts.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="shrink-0 rounded-xl text-xs">
                    <Link to="/management/projects">
                      Register
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="p-5">
                <div
                  className="h-[260px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/40"
                  role="img"
                  aria-label="Bar chart of project counts by status"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={byStatus}
                      margin={{ top: 8, right: 8, left: 4, bottom: 56 }}
                      barCategoryGap="22%"
                      barGap={10}
                      maxBarSize={48}
                    >
                      <CartesianGrid strokeDasharray="4 4" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        height={56}
                        angle={-26}
                        dy={10}
                        dx={-2}
                        textAnchor="end"
                      />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        width={32}
                      />
                      <RechartsTooltip
                        cursor={{
                          fill: "rgba(96, 165, 250, 0.22)",
                          stroke: "rgba(147, 197, 253, 0.45)",
                          strokeWidth: 1,
                        }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const row = payload[0].payload as { name: string; count: number };
                          return (
                            <div className="rounded-lg border border-border/60 bg-card/95 px-2.5 py-2 text-xs shadow-md backdrop-blur-sm">
                              <p className="font-semibold text-foreground">{row.name}</p>
                              <p className="mt-1 tabular-nums text-muted-foreground">
                                <span className="font-medium text-foreground">{row.count}</span> project
                                {row.count === 1 ? "" : "s"}
                              </p>
                            </div>
                          );
                        }}
                      />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {byStatus.map((_, i) => (
                          <Cell key={`status-bar-${i}`} fill={STATUS_BAR_FILLS[i % STATUS_BAR_FILLS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div
              ref={(el) => {
                midRefs.current[1] = el;
              }}
              className={cn(glassCardClass("lg:col-span-5"))}
            >
              <div className="border-b border-border/50 bg-gradient-to-br from-violet-500/[0.07] via-card to-chart-2/[0.04] px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300">
                    <Zap className="size-4" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">Capacity by technology</h3>
                    <p className="text-[11px] text-muted-foreground">Solar, wind, and hybrid mix (MW)</p>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={byType}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={56}
                      outerRadius={88}
                      paddingAngle={2}
                      stroke="var(--card)"
                      strokeWidth={2}
                    >
                      {byType.map((_, i) => (
                        <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const row = payload[0].payload as { name: string; value: number; count: number };
                        return (
                          <div className="rounded-lg border border-border/60 bg-card/95 px-2.5 py-2 text-xs shadow-md backdrop-blur-sm">
                            <p className="font-semibold text-foreground">{row.name}</p>
                            <p className="mt-1 tabular-nums text-muted-foreground">
                              <span className="font-medium text-foreground">{row.value} MW</span> · {row.count} project
                              {row.count === 1 ? "" : "s"}
                            </p>
                          </div>
                        );
                      }}
                    />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* Insight + states row */}
          <section className="grid gap-4 lg:grid-cols-12" aria-label="Portfolio insights">
            <div
              ref={(el) => {
                midRefs.current[2] = el;
              }}
              className={cn(glassCardClass("lg:col-span-7"))}
            >
              <div className="border-b border-border/50 bg-gradient-to-br from-primary/[0.06] via-card to-chart-2/[0.04] px-5 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                    <Activity className="size-4" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">Portfolio highlights</h3>
                    <p className="text-[11px] text-muted-foreground">Key signals across the programme</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
                {(
                  [
                    {
                      key: "review",
                      label: "In review",
                      value: inReview,
                      desc: "Submitted and under desk scrutiny.",
                      icon: LineChartIcon,
                      tone: "from-sky-500/15 via-card to-sky-500/[0.04]",
                      iconClass: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
                    },
                    {
                      key: "execution",
                      label: "In execution",
                      value: inExecution,
                      desc: "Active construction & delivery.",
                      icon: Hammer,
                      tone: "from-amber-500/15 via-card to-amber-500/[0.04]",
                      iconClass: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                    },
                    {
                      key: "commissioned",
                      label: "Commissioned",
                      value: commissioned.length,
                      desc: `${commissionedMw} MW officially commissioned.`,
                      icon: CheckCircle2,
                      tone: "from-emerald-500/15 via-card to-emerald-500/[0.04]",
                      iconClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    },
                    {
                      key: "breached",
                      label: "SLA breached",
                      value: breached,
                      desc: "Past SLA — auto-routed for L2.",
                      icon: AlertTriangle,
                      tone: "from-rose-500/15 via-card to-rose-500/[0.04]",
                      iconClass: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                    },
                  ] as const
                ).map((card) => {
                  const Icon: LucideIcon = card.icon;
                  return (
                    <div
                      key={card.key}
                      className="relative overflow-hidden rounded-xl border border-border/60 bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
                    >
                      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90", card.tone)} aria-hidden />
                      <div className="relative flex items-start gap-3">
                        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl border", card.iconClass)}>
                          <Icon className="size-5" aria-hidden />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">{card.label}</p>
                          <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-foreground">
                            <CountUp value={card.value} reduced={reduced} />
                          </p>
                          <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{card.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {dominantType ? (
                  <div className="relative overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-primary/10 via-card to-chart-2/[0.06] p-4 shadow-sm sm:col-span-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                          Dominant technology
                        </p>
                        <p className="mt-0.5 flex items-baseline gap-2">
                          <span className="text-xl font-bold tracking-tight text-foreground">{dominantType.name}</span>
                          <span className="text-xs font-semibold text-primary">
                            {totalCap > 0 ? Math.round((dominantType.value / totalCap) * 100) : 0}% of capacity
                          </span>
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {dominantType.value} MW across {dominantType.count} project
                          {dominantType.count === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                        <Sparkles className="size-5" aria-hidden />
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div
              ref={(el) => {
                midRefs.current[3] = el;
              }}
              className={cn(glassCardClass("lg:col-span-5"))}
            >
              <div className="border-b border-border/50 bg-gradient-to-br from-sky-500/[0.07] via-card to-primary/[0.04] px-5 py-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300">
                      <MapPin className="size-4" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight text-foreground">Top states</h3>
                      <p className="text-[11px] text-muted-foreground">By project count and capacity</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="shrink-0 rounded-xl text-xs">
                    <Link to="/management/projects">
                      All
                      <ArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="p-4">
                {byState.length === 0 ? (
                  <p className="px-2 py-8 text-center text-xs text-muted-foreground">No state data available.</p>
                ) : (
                  <ul className="space-y-3">
                    {byState.map((row, i) => {
                      const pct = Math.round((row.count / topStateMax) * 100);
                      return (
                        <li key={row.state} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="inline-flex min-w-0 items-center gap-1.5">
                              <span
                                className={cn(
                                  "inline-flex size-5 items-center justify-center rounded-md text-[10px] font-bold tabular-nums",
                                  i === 0
                                    ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                    : i === 1
                                      ? "bg-slate-300/40 text-slate-700 dark:bg-slate-500/30 dark:text-slate-200"
                                      : i === 2
                                        ? "bg-orange-500/20 text-orange-700 dark:text-orange-300"
                                        : "bg-muted text-muted-foreground",
                                )}
                              >
                                {i + 1}
                              </span>
                              <span className="truncate font-semibold text-foreground">{row.state}</span>
                            </span>
                            <span className="shrink-0 text-[10.5px] tabular-nums text-muted-foreground">
                              <span className="font-semibold text-foreground">{row.count}</span> · {row.capacity} MW
                            </span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-primary to-chart-2"
                              style={{ width: `${Math.max(pct, 4)}%` }}
                              aria-hidden
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </section>

          {/* Portfolio register */}
          <section
            className={cn(glassCardClass("overflow-hidden p-0"))}
            aria-labelledby="management-projects-heading"
          >
            <div className="border-b border-border/60 bg-gradient-to-r from-primary/[0.06] via-card to-chart-2/[0.04] px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 shrink-0">
                  <h2 id="management-projects-heading" className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                    Portfolio register
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Search and filter all projects by status and technology.
                  </p>
                </div>
                <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:max-w-[min(100%,40rem)] lg:pl-4">
                  <DataListSearchField
                    value={search}
                    onChange={setSearch}
                    placeholder="Search portfolio…"
                    ariaLabel="Search portfolio"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <DataListFilterButton activeCount={filterCount} />
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-3">
                        <p className="text-sm font-medium">Filter results</p>
                        <div className="space-y-2">
                          <Label htmlFor="mgmt-status" className="text-xs text-muted-foreground">
                            Status
                          </Label>
                          <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger id="mgmt-status" className="h-9 w-full" aria-label="Status">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All statuses</SelectItem>
                              <SelectItem value="Submitted">Submitted</SelectItem>
                              <SelectItem value="Under Review">Under Review</SelectItem>
                              <SelectItem value="Query Raised">Query Raised</SelectItem>
                              <SelectItem value="Approved">Approved</SelectItem>
                              <SelectItem value="In Execution">In Execution</SelectItem>
                              <SelectItem value="Completed">Completed</SelectItem>
                              <SelectItem value="Commissioned">Commissioned</SelectItem>
                              <SelectItem value="Rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mgmt-type" className="text-xs text-muted-foreground">
                            Type
                          </Label>
                          <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger id="mgmt-type" className="h-9 w-full" aria-label="Type">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All types</SelectItem>
                              <SelectItem value="Solar">Solar</SelectItem>
                              <SelectItem value="Wind">Wind</SelectItem>
                              <SelectItem value="Hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="app-data-table-grid w-full min-w-[900px] text-xs">
                <thead>
                  <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
                    <th className="w-10 px-2 py-2.5 text-center tabular-nums">Sl.</th>
                    <th className="px-4 py-2.5">Project</th>
                    <th className="px-3 py-2.5">IPP</th>
                    <th className="px-3 py-2.5">Type</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">SLA</th>
                    <th className="px-3 py-2.5">Updated</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No records match your search or filters.
                      </td>
                    </tr>
                  ) : (
                    paged.map((p, i) => (
                      <tr key={p.id} className="app-data-table-body-row transition">
                        <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">
                          {(safePage - 1) * pageSize + i + 1}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{p.name}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {p.state} · {p.district}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{p.ippName}</td>
                        <td className="px-3 py-3 text-muted-foreground">{p.type}</td>
                        <td className="px-3 py-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="px-3 py-3">
                          <SLABadge status={p.slaStatus} />
                          <div className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(p.slaDueDate)}</div>
                        </td>
                        <td className="px-3 py-3 text-muted-foreground">{relativeTime(p.lastUpdated)}</td>
                        <td className="px-3 py-3 text-right">
                          <Button variant="ghost" size="icon" className="size-8 shrink-0" asChild title="View application">
                            <Link to="/management/projects/$id" params={{ id: p.id }}>
                              <Eye className="size-4" aria-hidden />
                              <span className="sr-only">View application</span>
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <DataListPaginationFooter
              filteredLength={filtered.length}
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
          </section>
        </div>
      </DataListPageShell>
    </AppShell>
  );
}
