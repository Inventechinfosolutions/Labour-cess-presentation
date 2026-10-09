import { createFileRoute, Link } from "@tanstack/react-router";
import gsap from "gsap";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  FileCheck2,
  GitBranch,
  Layers,
  ListChecks,
  LineChart as LineChartIcon,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  DataListFilterButton,
  DataListPageShell,
  DataListPaginationFooter,
  useDataListPagination,
} from "@/components/DataListPage";
import { TaskRegisterSearchInput } from "@/components/TaskRegisterToolbar";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { db, formatDate, useDbVersion, useSession } from "@/lib/hooks";
import { dashboardKpiIconWrapClass, type DashboardKpiIconTone } from "@/lib/dashboard-kpi-icon";
import { opportunityLandSearchBlob } from "@/lib/opportunity-land-display";
import type { Role } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — PMIS" }] }),
  component: AdminDashboard,
});

const ADMIN_DASH_KPI_SECONDARY_ICON_TONES: DashboardKpiIconTone[] = [
  "emerald",
  "sky",
  "violet",
];

const DASHBOARD_ROLE_ORDER: Role[] = ["admin", "management", "officer", "approver", "ipp"];

const DASHBOARD_ROLE_META: Record<
  Role,
  {
    title: string;
    hint: string;
    dotClass: string;
  }
> = {
  admin: {
    title: "Administrator",
    hint: "Catalogue, workflows, and publishing",
    dotClass: "bg-emerald-500",
  },
  management: {
    title: "Management",
    hint: "Portfolio oversight & reporting",
    dotClass: "bg-sky-500",
  },
  officer: {
    title: "Desk officer",
    hint: "Checklist QC and desk decisions",
    dotClass: "bg-amber-500",
  },
  approver: {
    title: "Approver",
    hint: "Authorisation gates & sign-off",
    dotClass: "bg-violet-500",
  },
  ipp: {
    title: "IPP",
    hint: "Applications and milestone delivery",
    dotClass: "bg-rose-500",
  },
};

const WORKFLOW_PLAN_STEPS = [
  {
    id: "intake",
    title: "Application intake",
    body: "IPP submits eligibility, capacity, location, and the evidence pack.",
  },
  {
    id: "review",
    title: "Desk validation",
    body: "Officer verifies mandatory documents against scheme checklists.",
  },
  {
    id: "approval",
    title: "Approval gate",
    body: "Approver clears statutory conditions and locks the pathway.",
  },
  {
    id: "delivery",
    title: "Execution & commissioning",
    body: "Milestones from construction through testing to COD handover.",
  },
] as const;

const adminQuickLinks = [
  {
    to: "/admin/checklists",
    title: "Document checklists",
    description: "Tech bundles.",
    icon: ListChecks,
  },
  {
    to: "/admin/project-types",
    title: "Project types",
    description: "Template depth.",
    icon: Layers,
  },
  {
    to: "/admin/workflows",
    title: "Workflows",
    description: "Gates & SLAs.",
    icon: GitBranch,
  },
  {
    to: "/admin/users",
    title: "Users & roles",
    description: "Role access.",
    icon: UserRound,
  },
] as const;

/** Mirrors `/admin/checklists` bundles for the dashboard preview card. */
const DOCUMENT_CHECKLIST_SETS = [
  {
    name: "Solar — standard",
    docs: ["Company registration", "Technical capability", "Financial statements (3 yrs)", "Past project experience"],
  },
  {
    name: "Wind — standard",
    docs: ["Company registration", "Wind resource assessment", "Land title / lease", "Environmental clearance"],
  },
  {
    name: "Hybrid — standard",
    docs: ["Company registration", "Technical capability", "Financial statements", "Hybrid plant experience"],
  },
] as const;

/** Unique fill id for Reminders area chart (single instance on admin dashboard). */
const REMINDER_AREA_GRADIENT_ID = "admin-reminder-days-area-fill";

/** Mirrors `/admin/project-types` seed templates for the dashboard preview card. */
const PROJECT_TYPES_PREVIEW = [
  { id: "pt-1", name: "Solar PV — utility scale", milestones: 5, checklist: 6 },
  { id: "pt-2", name: "Onshore wind", milestones: 6, checklist: 7 },
  { id: "pt-3", name: "Solar–wind hybrid", milestones: 6, checklist: 8 },
  { id: "pt-4", name: "Rooftop solar — aggregated", milestones: 4, checklist: 4 },
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
      duration: 1.05,
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

function adminQuickLinkIconWrapClass(idx: number) {
  return cn(
    "flex size-10 shrink-0 items-center justify-center rounded-xl border",
    idx === 0 && "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    idx === 1 && "border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-400",
    idx === 2 && "border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    idx === 3 && "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400",
  );
}

/** Horizontal GSAP marquee for configuration shortcuts; falls back to a static grid when motion is reduced. */
function AdminQuickLinksSection({ reduced }: { reduced: boolean }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useLayoutEffect(() => {
    if (reduced) return;
    const track = trackRef.current;
    const block = blockRef.current;
    if (!track || !block) return;

    const run = () => {
      tweenRef.current?.kill();
      const w = block.offsetWidth;
      if (w < 1) return;
      gsap.set(track, { x: 0, y: 0 });
      tweenRef.current = gsap.to(track, {
        x: -w,
        y: 0,
        duration: Math.max(18, w / 55),
        ease: "none",
        repeat: -1,
      });
    };

    run();
    const ro = new ResizeObserver(run);
    ro.observe(block);
    return () => {
      ro.disconnect();
      tweenRef.current?.kill();
      tweenRef.current = null;
    };
  }, [reduced]);

  const pauseMarquee = () => tweenRef.current?.pause();
  const resumeMarquee = () => tweenRef.current?.resume();

  const gridSection = (
    <div className="relative grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {adminQuickLinks.map((item, idx) => (
        <Link
          key={item.to}
          to={item.to}
          className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Card
            className={cn(
              glassCardClass("h-full py-4 transition-all duration-300"),
              "hover:border-primary/25 hover:shadow-lg",
            )}
          >
            <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-0">
              <div className={adminQuickLinkIconWrapClass(idx)}>
                <item.icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <CardTitle className="text-sm leading-snug">{item.title}</CardTitle>
                <CardDescription className="text-[0.7rem] leading-relaxed">{item.description}</CardDescription>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );

  if (reduced) {
    return (
      <section aria-label="Configuration shortcuts" className="relative">
        {gridSection}
      </section>
    );
  }

  const stack = (suffix: string) =>
    adminQuickLinks.map((item, idx) => (
      <Link
        key={`${item.to}-${suffix}`}
        to={item.to}
        className="group block w-[min(85vw,17.5rem)] shrink-0 rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-[15.75rem]"
      >
        <Card
          className={cn(
            glassCardClass("py-4 transition-[border-color,box-shadow] duration-300"),
            "hover:border-primary/25 hover:shadow-lg",
          )}
        >
          <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-0">
            <div className={adminQuickLinkIconWrapClass(idx)}>
              <item.icon className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <CardTitle className="text-sm leading-snug">{item.title}</CardTitle>
              <CardDescription className="text-[0.7rem] leading-relaxed">{item.description}</CardDescription>
            </div>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary" />
          </CardHeader>
        </Card>
      </Link>
    ));

  return (
    <section aria-label="Configuration shortcuts" className="relative">
      <div
        className="relative overflow-hidden py-1"
        onPointerEnter={pauseMarquee}
        onPointerLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) resumeMarquee();
        }}
        onFocusCapture={pauseMarquee}
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) resumeMarquee();
        }}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-muted/50 to-transparent dark:from-background/80"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-10 bg-gradient-to-l from-muted/50 to-transparent dark:from-background/80"
          aria-hidden
        />
        <div className="relative w-full overflow-x-hidden overflow-y-visible py-1">
          <div
            ref={trackRef}
            className="flex w-max flex-row flex-nowrap gap-3 will-change-transform"
          >
            <div ref={blockRef} className="flex flex-row flex-nowrap gap-3">
              {stack("a")}
            </div>
            <div className="flex flex-row flex-nowrap gap-3">{stack("b")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Compact shared heights so KPI cards stay aligned but smaller. */
const KPI_CARD_MIN_H = "min-h-[7.25rem]";
const KPI_FOOTER_MIN_H = "min-h-[2.25rem]";

function AdminDashboard() {
  const user = useSession();
  useDbVersion();
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const kpiWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const midRefs = useRef<(HTMLDivElement | null)[]>([]);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bottomRefs = useRef<(HTMLDivElement | null)[]>([]);
  /** Animate rows via tbody query — avoids stale per-index refs and stuck opacity after gsap revert. */
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const oppSearchRef = useRef<HTMLInputElement>(null);

  const opps = db.listOpportunities();
  const projects = db.listProjects();
  const users = db.listUsers();

  const [oppSearch, setOppSearch] = useState("");
  const [oppStatus, setOppStatus] = useState<string>("all");
  const [oppType, setOppType] = useState<string>("all");

  const opportunitiesNewestFirst = useMemo(() => [...opps].reverse(), [opps]);

  const opportunitiesFiltered = useMemo(() => {
    return opportunitiesNewestFirst.filter((o) => {
      if (oppStatus !== "all" && o.status !== oppStatus) return false;
      if (oppType !== "all" && o.type !== oppType) return false;
      const s = oppSearch.trim().toLowerCase();
      if (!s) return true;
      return (
        o.name.toLowerCase().includes(s) ||
        o.code.toLowerCase().includes(s) ||
        (o.referenceCode?.toLowerCase().includes(s) ?? false) ||
        o.state.toLowerCase().includes(s) ||
        o.district.toLowerCase().includes(s) ||
        opportunityLandSearchBlob(o).toLowerCase().includes(s)
      );
    });
  }, [opportunitiesNewestFirst, oppSearch, oppStatus, oppType]);

  const oppResetKey = `${oppSearch}\0${oppStatus}\0${oppType}`;
  const {
    pageSize: oppPageSize,
    setPageSize: setOppPageSize,
    safePage: oppSafePage,
    pageCount: oppPageCount,
    paged: oppPaged,
    start: oppStart,
    end: oppEnd,
    setPage: setOppPage,
    goFirst: oppGoFirst,
    goLast: oppGoLast,
    goPrev: oppGoPrev,
    goNext: oppGoNext,
  } = useDataListPagination(opportunitiesFiltered, oppResetKey);

  const oppFilterBadgeCount =
    (oppStatus !== "all" ? 1 : 0) + (oppType !== "all" ? 1 : 0);

  const oppTableAnimKey = useMemo(
    () =>
      `${oppSafePage}\0${oppPageSize}\0${oppResetKey}\0${oppPaged.map((o) => o.id).join(",")}`,
    [oppSafePage, oppPageSize, oppResetKey, oppPaged],
  );

  const published = opps.filter((o) => o.status === "Published").length;
  const draft = opps.filter((o) => o.status === "Draft").length;
  const closed = opps.filter((o) => o.status === "Closed").length;

  const usersByRole = useMemo(() => {
    const counts: Record<Role, number> = {
      admin: 0,
      management: 0,
      officer: 0,
      approver: 0,
      ipp: 0,
    };
    for (const u of users) {
      counts[u.role] += 1;
    }
    return counts;
  }, [users]);

  const closingSoon = useMemo(() => {
    return [...opps]
      .filter((o) => o.status !== "Closed")
      .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
      .slice(0, 5);
  }, [opps]);

  const reminderGraphData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return closingSoon.map((o, i) => {
      const end = new Date(o.endDate);
      end.setHours(0, 0, 0, 0);
      const daysLeft = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / 86400000));
      const tickLabel = end.toLocaleString("en-IN", { month: "short", day: "numeric" });
      return {
        id: o.id,
        order: i + 1,
        tickLabel,
        fullName: o.name,
        code: o.code,
        daysLeft,
        closeDate: o.endDate,
      };
    });
  }, [closingSoon]);

  const weekHeights = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const p of projects) {
      counts[new Date(p.lastUpdated).getDay()] += 1;
    }
    const max = Math.max(...counts, 1);
    return counts.map((c) => Math.max(14, Math.round((c / max) * 100)));
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
      gsap.from(barRefs.current.filter(Boolean), {
        scaleY: 0,
        transformOrigin: "50% 100%",
        duration: 0.7,
        stagger: 0.07,
        ease: "power2.out",
        delay: 0.25,
      });
      gsap.from(bottomRefs.current.filter(Boolean), {
        opacity: 0,
        y: 16,
        duration: 0.48,
        stagger: 0.1,
        ease: "power3.out",
        delay: 0.18,
      });
    }, rootRef);
    return () => ctx.revert();
  }, [reduced, opps.length, projects.length]);

  useLayoutEffect(() => {
    if (reduced) return;
    const tbody = tableBodyRef.current;
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll<HTMLTableRowElement>("tr"));
    if (rows.length === 0) return;
    const tween = gsap.fromTo(
      rows,
      { opacity: 0, y: 12 },
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: { each: 0.05, from: "start" },
        ease: "power2.out",
        overwrite: "auto",
      },
    );
    return () => {
      tween.kill();
    };
  }, [reduced, oppTableAnimKey]);

  if (!user) return null;

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <AppShell role="admin">
      <DataListPageShell>
        <TooltipProvider delayDuration={200}>
          <div
            ref={rootRef}
            className="relative space-y-6 rounded-3xl border border-border/40 bg-gradient-to-b from-muted/50 via-background to-background p-4 shadow-inner sm:p-6"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-48 rounded-t-3xl bg-gradient-to-b from-primary/[0.06] to-transparent"
              aria-hidden
            />

            <header className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  <span className="bg-gradient-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">
                    Dashboard
                  </span>
                </h1>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                  Plan, prioritise, and accomplish your tasks with ease.
                </p>
              </div>
            </header>

            <section
              aria-label="Scheme register metrics"
              className="relative grid items-stretch gap-2 sm:grid-cols-2 xl:grid-cols-4"
            >
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
                          Opportunities
                        </p>
                        <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight">
                          <CountUp value={opps.length} reduced={reduced} />
                        </p>
                      </div>
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15 ring-1 ring-primary-foreground/25">
                        <TrendingUp className="size-3.5" aria-hidden />
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex flex-wrap items-end gap-1.5 text-[0.65rem] text-primary-foreground/90",
                        KPI_FOOTER_MIN_H,
                      )}
                    >
                      <Badge className="border-0 px-1.5 py-0 text-[0.65rem] leading-tight bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/25">
                        {published} published
                      </Badge>
                      <span className="text-primary-foreground/75">Across the register</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {(
                [
                  {
                    label: "Published windows",
                    value: published,
                    sub: "Live publication windows",
                    icon: ArrowUpRight,
                    tone: "default" as const,
                  },
                  {
                    label: "Draft schemes",
                    value: draft,
                    sub: "Awaiting publish",
                    icon: Briefcase,
                    tone: "default" as const,
                  },
                  {
                    label: "Users in directory",
                    value: users.length,
                    sub: "Role-based access directory",
                    icon: Users,
                    tone: "default" as const,
                  },
                ] as const
              ).map((k, i) => (
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
                        <div className={dashboardKpiIconWrapClass(ADMIN_DASH_KPI_SECONDARY_ICON_TONES[i] ?? "cyan")}>
                          <k.icon aria-hidden />
                        </div>
                      </div>
                      <p
                        className={cn(
                          "flex items-end truncate whitespace-nowrap text-[0.65rem] leading-snug text-chart-2",
                          KPI_FOOTER_MIN_H,
                        )}
                      >
                        {k.sub}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </section>

            <p className="text-center text-[0.65rem] text-muted-foreground">
              {closed} scheme{closed === 1 ? "" : "s"} closed in the register
            </p>

            <section className="relative grid gap-4 lg:grid-cols-12" aria-label="Analytics and schemes">
              <div
                ref={(el) => {
                  midRefs.current[0] = el;
                }}
                className="lg:col-span-5"
              >
                <Card className={glassCardClass()}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Project analytics</CardTitle>
                    <CardDescription className="text-xs">
                      Desk activity by weekday from project last updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex h-44 items-end justify-between gap-1.5 px-1 pt-2">
                      {weekHeights.map((h, i) => {
                        const variant = i % 3;
                        return (
                          <Tooltip key={i}>
                            <TooltipTrigger asChild>
                              <div className="flex flex-1 flex-col items-center gap-2">
                                <div className="relative flex h-36 w-full max-w-[2.25rem] items-end justify-center">
                                  <div
                                    ref={(el) => {
                                      barRefs.current[i] = el;
                                    }}
                                    className={cn(
                                      "w-full max-w-8 cursor-default rounded-full",
                                      variant === 0 && "bg-primary",
                                      variant === 1 && "bg-chart-2/90",
                                      variant === 2 &&
                                        "bg-[repeating-linear-gradient(-45deg,color-mix(in_oklch,var(--color-chart-4)_55%,transparent)_0px,color-mix(in_oklch,var(--color-chart-4)_55%,transparent)_5px,transparent_5px,transparent_10px)]",
                                    )}
                                    style={{ height: `${h}%` }}
                                  />
                                </div>
                                <span className="text-[0.65rem] font-medium text-muted-foreground">{dayLabels[i]}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">
                              {h}% activity
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div
                ref={(el) => {
                  midRefs.current[1] = el;
                }}
                className="lg:col-span-4"
              >
                <Card className={glassCardClass()}>
                  <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        <LineChartIcon className="size-4" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base">Reminders</CardTitle>
                        <CardDescription className="text-xs">
                          Line graph: days left until close, ordered by deadline
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="shrink-0 rounded-xl text-xs">
                      <Link to="/admin/opportunities">
                        Register
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {reminderGraphData.length > 0 ? (
                      <div className="space-y-2">
                        <div
                          className="h-[220px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/40"
                          role="img"
                          aria-label="Line graph of days until application close by close date"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={reminderGraphData}
                              margin={{ top: 8, right: 8, left: 0, bottom: 4 }}
                            >
                              <defs>
                                <linearGradient id={REMINDER_AREA_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
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
                                  value: "Close date",
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
                                  const row = payload[0].payload as (typeof reminderGraphData)[number];
                                  return (
                                    <div className="rounded-lg border border-border/60 bg-card/95 px-2.5 py-2 text-xs shadow-md backdrop-blur-sm">
                                      <p className="font-semibold leading-snug text-foreground">{row.fullName}</p>
                                      <p className="mt-1 tabular-nums text-muted-foreground">
                                        {row.code} · {row.daysLeft} day{row.daysLeft === 1 ? "" : "s"} left
                                      </p>
                                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                                        Closes {formatDate(row.closeDate)}
                                      </p>
                                    </div>
                                  );
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="daysLeft"
                                stroke="var(--primary)"
                                strokeWidth={2}
                                fill={`url(#${REMINDER_AREA_GRADIENT_ID})`}
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
                          Points follow upcoming deadlines (left = soonest). Hover for scheme details.
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No open scheme windows in the mock register.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div
                ref={(el) => {
                  midRefs.current[2] = el;
                }}
                className="lg:col-span-3"
              >
                <Card className={glassCardClass()}>
                  <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
                    <div className="flex min-w-0 items-start gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="size-4" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base">User roles</CardTitle>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="shrink-0 rounded-xl text-xs">
                      <Link to="/admin/users">
                        Directory
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="px-0 pb-1">
                    <ScrollArea className="h-[220px] px-4">
                      <ul className="space-y-2 pr-3 pb-1" aria-label="Users by role">
                        {DASHBOARD_ROLE_ORDER.map((role, idx) => {
                          const meta = DASHBOARD_ROLE_META[role];
                          const n = usersByRole[role];
                          return (
                            <li key={role}>
                              {idx > 0 ? <Separator className="mb-2 bg-border/40" /> : null}
                              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-muted/15 px-3 py-2.5 transition-colors hover:bg-muted/25">
                                <div className="flex min-w-0 items-center gap-2.5">
                                  <span
                                    className={cn("size-2.5 shrink-0 rounded-full ring-2 ring-background", meta.dotClass)}
                                    aria-hidden
                                  />
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold leading-tight text-foreground">{meta.title}</p>
                                    <p className="mt-0.5 text-[0.65rem] leading-snug text-muted-foreground">{meta.hint}</p>
                                  </div>
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="shrink-0 tabular-nums text-[0.65rem] font-semibold"
                                >
                                  {n}
                                </Badge>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </section>

            <AdminQuickLinksSection reduced={reduced} />

            <section className="relative grid gap-4 lg:grid-cols-12" aria-label="Document checklists and progress">
              <div
                ref={(el) => {
                  bottomRefs.current[0] = el;
                }}
                className="lg:col-span-5"
              >
                <Card className={glassCardClass()}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-start gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <FileCheck2 className="size-4" aria-hidden />
                      </div>
                      <div>
                        <CardTitle className="text-base">Document checklists</CardTitle>
                        <CardDescription className="text-xs">
                          Evidence bundles IPPs must satisfy by technology
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="shrink-0 rounded-xl">
                      <Link to="/admin/checklists">
                        View all
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {DOCUMENT_CHECKLIST_SETS.map((set) => (
                      <div
                        key={set.name}
                        className="rounded-xl border border-border/50 bg-muted/20 px-3 py-2.5"
                      >
                        <p className="text-xs font-semibold text-foreground">{set.name}</p>
                        <ul className="mt-1.5 space-y-1 text-[0.65rem] leading-snug text-muted-foreground">
                          {set.docs.slice(0, 2).map((d) => (
                            <li key={d} className="flex gap-1.5">
                              <span className="mt-1 size-1 shrink-0 rounded-full bg-chart-2" aria-hidden />
                              <span className="min-w-0">{d}</span>
                            </li>
                          ))}
                          {set.docs.length > 2 ? (
                            <li className="text-[0.6rem] text-muted-foreground/90">
                              +{set.docs.length - 2} more in full list
                            </li>
                          ) : null}
                        </ul>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div
                ref={(el) => {
                  bottomRefs.current[1] = el;
                }}
                className="lg:col-span-4"
              >
                <Card className={glassCardClass()}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex items-start gap-2.5">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-sky-500/25 bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        <Layers className="size-4" aria-hidden />
                      </div>
                      <div>
                        <CardTitle className="text-base">Project types</CardTitle>
                        <CardDescription className="text-xs">
                          Milestone depth and checklist counts per technology template
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild className="shrink-0 rounded-xl">
                      <Link to="/admin/project-types">
                        View all
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {PROJECT_TYPES_PREVIEW.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/20 px-3 py-2"
                      >
                        <p className="min-w-0 truncate text-xs font-medium text-foreground">{t.name}</p>
                        <div className="shrink-0 text-right text-[0.6rem] leading-tight tabular-nums text-muted-foreground">
                          <div>{t.milestones} milestones</div>
                          <div>{t.checklist} checklist items</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div
                ref={(el) => {
                  bottomRefs.current[2] = el;
                }}
                className="lg:col-span-3"
              >
                <Card
                  className={cn(
                    glassCardClass("overflow-hidden py-0"),
                    "border-primary/20 bg-gradient-to-b from-muted/30 via-card/90 to-card",
                  )}
                >
                  <div className="border-b border-border/50 bg-[linear-gradient(110deg,color-mix(in_oklch,var(--primary)_10%,transparent),transparent)] px-4 py-3.5 sm:px-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/10 text-violet-600 dark:text-violet-400">
                          <GitBranch className="size-4" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base">Workflow plan</CardTitle>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild className="shrink-0 rounded-xl text-xs">
                        <Link to="/admin/workflows">
                          Edit
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                  <CardContent className="px-4 py-4 sm:px-5">
                    <ol className="relative space-y-0" aria-label="Standard workflow stages">
                      {WORKFLOW_PLAN_STEPS.map((step, i) => (
                        <li key={step.id} className="relative flex gap-3 pb-4 last:pb-0">
                          {i < WORKFLOW_PLAN_STEPS.length - 1 ? (
                            <span
                              className="absolute top-[2.125rem] left-[15px] bottom-0 w-px bg-border/80"
                              aria-hidden
                            />
                          ) : null}
                          <span
                            className={cn(
                              "relative z-[1] flex size-8 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold tabular-nums text-primary-foreground shadow-sm ring-2 ring-background",
                              i === 0 && "bg-emerald-500",
                              i === 1 && "bg-sky-500",
                              i === 2 && "bg-amber-500",
                              i === 3 && "bg-violet-500",
                              i > 3 && "bg-rose-500",
                            )}
                          >
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1 pt-0.5">
                            <p className="text-xs font-semibold leading-tight text-foreground">{step.title}</p>
                            <p className="mt-1 text-[0.65rem] leading-relaxed text-muted-foreground">{step.body}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-1 border-t border-border/40 pt-3 text-[0.65rem] leading-snug text-muted-foreground">
                      Custom pipelines can attach SLAs per stage in workflow settings.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Card className={cn(glassCardClass("overflow-hidden p-0"))} aria-labelledby="admin-opps-heading">
              <div className="border-b border-border/60 bg-gradient-to-r from-muted/50 via-card/50 to-primary/[0.06] px-4 py-4 sm:px-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 shrink-0">
                    <h1 id="admin-opps-heading" className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                      Recent opportunities
                    </h1>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Newest first — search and filters on the right, then paginate in the table
                    </p>
                  </div>
                  <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end lg:max-w-[min(100%,40rem)] lg:pl-4">
                    <TaskRegisterSearchInput
                      searchRef={oppSearchRef}
                      query={oppSearch}
                      onQueryChange={setOppSearch}
                      searchPlaceholder="Search scheme, code, ref, location…"
                      searchAriaLabel="Search opportunities"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <DataListFilterButton activeCount={oppFilterBadgeCount} />
                      </PopoverTrigger>
                      <PopoverContent className="w-80" align="end">
                        <div className="space-y-3">
                          <p className="text-sm font-medium">Filter results</p>
                          <div className="space-y-2">
                            <Label htmlFor="dash-opp-status" className="text-xs text-muted-foreground">
                              Status
                            </Label>
                            <Select value={oppStatus} onValueChange={setOppStatus}>
                              <SelectTrigger id="dash-opp-status" className="h-9 w-full" aria-label="Status">
                                <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">All statuses</SelectItem>
                                <SelectItem value="Draft">Draft</SelectItem>
                                <SelectItem value="Published">Published</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dash-opp-type" className="text-xs text-muted-foreground">
                              Type
                            </Label>
                            <Select value={oppType} onValueChange={setOppType}>
                              <SelectTrigger id="dash-opp-type" className="h-9 w-full" aria-label="Type">
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
                    <Button variant="ghost" size="sm" asChild className="shrink-0 rounded-xl sm:self-center">
                      <Link to="/admin/opportunities">
                        View all
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="app-data-table-grid w-full min-w-[680px] text-xs">
                  <thead>
                    <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
                      <th className="w-11 px-2 py-2.5 text-center tabular-nums">Sl.</th>
                      <th className="px-4 py-2.5">Code</th>
                      <th className="px-3 py-2.5">Ref</th>
                      <th className="px-3 py-2.5">Name</th>
                      <th className="px-3 py-2.5">Capacity</th>
                      <th className="px-3 py-2.5">Closes</th>
                      <th className="px-3 py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody ref={tableBodyRef}>
                    {oppPaged.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          No opportunities match your search or filters.
                        </td>
                      </tr>
                    ) : (
                      oppPaged.map((o, rowIdx) => (
                        <tr key={o.id} className="app-data-table-body-row transition">
                          <td className="px-2 py-3 text-center tabular-nums text-muted-foreground">
                            {(oppSafePage - 1) * oppPageSize + rowIdx + 1}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{o.code}</td>
                          <td className="px-3 py-3 font-mono text-[11px] text-foreground">
                            {o.referenceCode ?? <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-3 py-3 font-medium text-foreground">{o.name}</td>
                          <td className="px-3 py-3 tabular-nums">{o.capacityMW} MW</td>
                          <td className="px-3 py-3 text-muted-foreground">{formatDate(o.endDate)}</td>
                          <td className="px-3 py-3">
                            <Badge variant="secondary" className="text-[10px] font-medium">
                              {o.status}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <DataListPaginationFooter
                filteredLength={opportunitiesFiltered.length}
                safePage={oppSafePage}
                pageCount={oppPageCount}
                pageSize={oppPageSize}
                onPageSizeChange={setOppPageSize}
                onPageChange={setOppPage}
                goFirst={oppGoFirst}
                goLast={oppGoLast}
                goPrev={oppGoPrev}
                goNext={oppGoNext}
                start={oppStart}
                end={oppEnd}
              />
            </Card>
          </div>
        </TooltipProvider>
      </DataListPageShell>
    </AppShell>
  );
}

