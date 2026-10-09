import { createFileRoute, Link } from "@tanstack/react-router";
import gsap from "gsap";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Gauge,
  Hammer,
  MapPin,
  Sparkles,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useLayoutEffect, useMemo, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { dashboardKpiIconWrapClass } from "@/lib/dashboard-kpi-icon";
import { db, useDbVersion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/management/analytics/")({
  head: () => ({ meta: [{ title: "Analytics — PMIS" }] }),
  component: AnalyticsPage,
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

const SLA_AREA_GRADIENT_ID = "mgmt-analytics-velocity-fill";
const APPROVAL_AREA_GRADIENT_ID = "mgmt-analytics-approval-fill";

function glassCardClass(extra?: string) {
  return cn(
    "rounded-2xl border border-border/50 bg-card/80 shadow-lg shadow-black/[0.04] ring-1 ring-foreground/[0.04] backdrop-blur-xl dark:bg-card/70 dark:shadow-black/20",
    extra,
  );
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

function kpiGlassCardClass(extra?: string) {
  return cn(
    "rounded-3xl border border-border/50 bg-card/80 shadow-lg shadow-black/5 ring-1 ring-foreground/[0.04] backdrop-blur-xl dark:bg-card/70 dark:shadow-black/20",
    extra,
  );
}

const KPI_CARD_MIN_H = "min-h-[7.25rem]";
const KPI_FOOTER_MIN_H = "min-h-[2.25rem]";

function AnalyticsPage() {
  useDbVersion();
  const reduceMotion = useReducedMotion();
  const reduced = Boolean(reduceMotion);
  const projects = db.listProjects();

  const onTrack = projects.filter((p) => p.slaStatus === "On Track").length;
  const atRisk = projects.filter((p) => p.slaStatus === "At Risk").length;
  const breached = projects.filter((p) => p.slaStatus === "Breached").length;
  const total = projects.length || 1;
  const compliance = Math.round((onTrack / total) * 100);

  const totalCap = projects.reduce((s, p) => s + p.capacityMW, 0);
  const completed = projects.filter((p) => p.status === "Completed");
  const completedCount = completed.length;
  const completedMw = completed.reduce((s, p) => s + p.capacityMW, 0);
  const inExecution = projects.filter((p) => p.status === "In Execution").length;
  const avgCap = projects.length ? Math.round(totalCap / projects.length) : 0;

  const trend = useMemo(
    () =>
      ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m, i) => ({
        month: m,
        applications: 4 + i * 2,
        approvals: 2 + i,
      })),
    [],
  );

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
      ["Submitted", "Under Review", "Query Raised", "Approved", "In Execution", "Completed", "Rejected"].map((s) => ({
        name: s,
        count: projects.filter((p) => p.status === s).length,
      })),
    [projects],
  );

  /** State-wise project counts with capacity, ranked. */
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

  const complianceRing = [{ name: "compliance", value: compliance, fill: "var(--primary)" }];

  return (
    <AppShell role="management">
      <div className="space-y-6">
        {/* Hero */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-primary shadow-sm">
                <Sparkles className="size-3" aria-hidden />
                Executive analytics
              </div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                <span className="bg-gradient-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">
                  Programme analytics
                </span>
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                SLA posture, approval velocity, and technology mix — designed for briefings with a high-contrast palette
                suitable for government oversight.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="h-10 w-fit gap-1.5 rounded-xl shadow-sm">
              <Link to="/management/projects">
                <ArrowLeft className="size-4" aria-hidden />
                Back to projects
              </Link>
            </Button>
          </div>
        </motion.section>

        {/* Portfolio KPIs — approver / management dashboard card pattern */}
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          className="relative grid items-stretch gap-2 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Portfolio KPIs"
        >
          <div className="flex h-full min-h-0 flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
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
              label: "Completed",
              valueDisplay: <CountUp value={completedCount} reduced={reduced} />,
              sub: `${completedMw} MW delivered`,
              icon: CheckCircle2,
              iconTone: "emerald" as const,
            },
          ].map((k) => (
            <div
              key={k.label}
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
        </motion.section>

        {/* SLA summary — original task-kpi strip */}
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="SLA summary">
          {(
            [
              {
                key: "compliance",
                label: "SLA compliance",
                value: `${compliance}%`,
                sub: `${onTrack} of ${projects.length} on track`,
                tone: "task-tone-milestone",
                icon: Gauge,
              },
              {
                key: "ontrack",
                label: "On track",
                value: onTrack,
                sub: "Within SLA window",
                tone: "task-tone-allotment",
                icon: CheckCircle2,
              },
              {
                key: "atrisk",
                label: "At risk",
                value: atRisk,
                sub: "Approaching SLA breach",
                tone: "task-tone-waiting",
                icon: AlertTriangle,
              },
              {
                key: "breached",
                label: "Breached",
                value: breached,
                sub: "Past SLA — needs escalation",
                tone: "task-tone-issue",
                icon: XCircle,
              },
            ] as const
          ).map((tile, i) => {
            const Icon: LucideIcon = tile.icon;
            return (
              <motion.div
                key={tile.key}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: reduceMotion ? 0 : i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className={cn("task-kpi cursor-default text-left", tile.tone)}
              >
                <div className="flex items-center gap-3">
                  <span className="task-kpi-icon flex size-11 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{tile.label}</p>
                    <p className="task-kpi-text mt-0.5 text-2xl font-bold leading-none tabular-nums">{tile.value}</p>
                    <p className="mt-1 truncate text-[10.5px] text-muted-foreground">{tile.sub}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Compliance ring + Approval velocity */}
        <section className="grid gap-4 lg:grid-cols-12">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: reduceMotion ? 0 : 0.18 }}
            className={cn(glassCardClass("lg:col-span-5"))}
          >
            <div className="border-b border-border/50 bg-gradient-to-br from-emerald-500/[0.08] via-card to-chart-2/[0.04] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                  <Gauge className="size-4" aria-hidden />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">SLA compliance</h3>
                  <p className="text-[11px] text-muted-foreground">Share of projects within their SLA window</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="grid items-center gap-4 sm:grid-cols-[auto_1fr]">
                {/* radial ring */}
                <div className="relative mx-auto size-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      innerRadius="74%"
                      outerRadius="100%"
                      data={complianceRing}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                      <RadialBar
                        background={{ fill: "color-mix(in_oklch, var(--muted) 65%, transparent)" }}
                        dataKey="value"
                        cornerRadius={12}
                        fill="var(--primary)"
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Compliance</p>
                    <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">
                      {compliance}
                      <span className="ml-0.5 text-base font-semibold text-muted-foreground">%</span>
                    </p>
                  </div>
                </div>

                {/* legend / breakdown */}
                <ul className="flex flex-col gap-2 text-xs">
                  {(
                    [
                      { label: "On track", value: onTrack, dot: "bg-emerald-500", chip: "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" },
                      { label: "At risk", value: atRisk, dot: "bg-amber-500", chip: "bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" },
                      { label: "Breached", value: breached, dot: "bg-rose-500", chip: "bg-rose-500/15 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300" },
                    ] as const
                  ).map((row) => {
                    const pct = Math.round((row.value / total) * 100);
                    return (
                      <li
                        key={row.label}
                        className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-background/60 px-3 py-2"
                      >
                        <span className={cn("size-2 shrink-0 rounded-full", row.dot)} aria-hidden />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-foreground">{row.label}</p>
                            <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums", row.chip)}>
                              {pct}%
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted/60">
                              <div className={cn("h-full", row.dot)} style={{ width: `${Math.max(pct, 3)}%` }} aria-hidden />
                            </div>
                            <span className="text-[10.5px] tabular-nums text-muted-foreground">{row.value}</span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: reduceMotion ? 0 : 0.24 }}
            className={cn(glassCardClass("lg:col-span-7"))}
          >
            <div className="border-b border-border/50 bg-gradient-to-br from-primary/[0.07] via-card to-chart-2/[0.04] px-5 py-3.5">
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                    <TrendingUp className="size-4" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-foreground">Approval velocity</h3>
                    <p className="text-[11px] text-muted-foreground">Applications submitted vs approvals — last 6 months</p>
                  </div>
                </div>
                <div className="hidden items-center gap-3 text-[10.5px] sm:flex">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-primary" aria-hidden />
                    Applications
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
                    Approvals
                  </span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div
                className="h-[260px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/40"
                role="img"
                aria-label="Area chart of monthly applications and approvals"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
                    <defs>
                      <linearGradient id={SLA_AREA_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.32} />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                      </linearGradient>
                      <linearGradient id={APPROVAL_AREA_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.32} />
                        <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={32} allowDecimals={false} />
                    <RechartsTooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg border border-border/60 bg-card/95 px-2.5 py-2 text-xs shadow-md backdrop-blur-sm">
                            <p className="font-semibold text-foreground">{label}</p>
                            {payload.map((p) => {
                              const key = String(p.dataKey ?? "");
                              return (
                                <p key={key} className="mt-0.5 flex items-center gap-1.5 text-[11px] tabular-nums text-muted-foreground">
                                  <span
                                    className="size-2 rounded-full"
                                    style={{ background: p.color }}
                                    aria-hidden
                                  />
                                  <span className="capitalize">{key}</span>
                                  <span className="font-semibold text-foreground">{p.value}</span>
                                </p>
                              );
                            })}
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="applications"
                      stroke="var(--primary)"
                      strokeWidth={2.25}
                      fill={`url(#${SLA_AREA_GRADIENT_ID})`}
                      dot={{ r: 3.5, strokeWidth: 2, stroke: "var(--background)", fill: "var(--primary)" }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="approvals"
                      stroke="var(--chart-2)"
                      strokeWidth={2.25}
                      fill={`url(#${APPROVAL_AREA_GRADIENT_ID})`}
                      dot={{ r: 3.5, strokeWidth: 2, stroke: "var(--background)", fill: "var(--chart-2)" }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Status bar + capacity donut + states */}
        <section className="grid gap-4 lg:grid-cols-12">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: reduceMotion ? 0 : 0.3 }}
            className={cn(glassCardClass("lg:col-span-5"))}
          >
            <div className="border-b border-border/50 bg-gradient-to-br from-rose-500/[0.06] via-card to-primary/[0.04] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <BarChart3 className="size-4" aria-hidden />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">Projects by status</h3>
                  <p className="text-[11px] text-muted-foreground">Volume across delivery stages</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div
                className="h-[280px] w-full [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/40"
                role="img"
                aria-label="Bar chart of project counts by status"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byStatus} margin={{ top: 8, right: 8, left: 4, bottom: 60 }} barCategoryGap="22%" maxBarSize={48}>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      axisLine={false}
                      interval={0}
                      height={60}
                      angle={-26}
                      dy={10}
                      dx={-2}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 10 }} allowDecimals={false} tickLine={false} axisLine={false} width={32} />
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
                              <span className="font-medium text-foreground">{row.count}</span> project{row.count === 1 ? "" : "s"}
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
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: reduceMotion ? 0 : 0.36 }}
            className={cn(glassCardClass("lg:col-span-4"))}
          >
            <div className="border-b border-border/50 bg-gradient-to-br from-violet-500/[0.07] via-card to-chart-2/[0.04] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300">
                  <Zap className="size-4" aria-hidden />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">Capacity by technology</h3>
                  <p className="text-[11px] text-muted-foreground">Total MW across solar, wind, and hybrid</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <ResponsiveContainer width="100%" height={280}>
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
                            <span className="font-medium text-foreground">{row.value} MW</span> · {row.count} project{row.count === 1 ? "" : "s"}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: reduceMotion ? 0 : 0.42 }}
            className={cn(glassCardClass("lg:col-span-3"))}
          >
            <div className="border-b border-border/50 bg-gradient-to-br from-sky-500/[0.07] via-card to-primary/[0.04] px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300">
                  <MapPin className="size-4" aria-hidden />
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">Top states</h3>
                  <p className="text-[11px] text-muted-foreground">By project count</p>
                </div>
              </div>
            </div>
            <div className="p-4">
              {byState.length === 0 ? (
                <p className="px-2 py-8 text-center text-xs text-muted-foreground">No state data available.</p>
              ) : (
                <ul className="space-y-2.5">
                  {byState.map((row, i) => {
                    const pct = Math.round((row.count / topStateMax) * 100);
                    return (
                      <li key={row.state} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="inline-flex items-center gap-1.5 truncate">
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
          </motion.div>
        </section>

        {/* SLA breakdown insight cards */}
        <section className="grid gap-3 md:grid-cols-3" aria-label="SLA breakdown">
          {(
            [
              {
                key: "ontrack",
                title: "On track",
                value: onTrack,
                desc: "Projects progressing within their SLA window. Routine monitoring suffices.",
                tone: "task-tone-milestone",
                icon: CheckCircle2,
                accent: "from-emerald-500/15 via-card to-emerald-500/[0.04]",
              },
              {
                key: "atrisk",
                title: "At risk",
                value: atRisk,
                desc: "Projects approaching SLA breach. L1 nudges should fire automatically.",
                tone: "task-tone-waiting",
                icon: AlertTriangle,
                accent: "from-amber-500/15 via-card to-amber-500/[0.04]",
              },
              {
                key: "breached",
                title: "Breached",
                value: breached,
                desc: "Projects past their SLA. L2 escalations are auto-routed for review.",
                tone: "task-tone-issue",
                icon: XCircle,
                accent: "from-rose-500/15 via-card to-rose-500/[0.04]",
              },
            ] as const
          ).map((card, i) => {
            const Icon: LucideIcon = card.icon;
            const pct = Math.round((card.value / total) * 100);
            return (
              <motion.div
                key={card.key}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.5 + i * 0.06 }}
                className={cn(
                  "relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 p-5 shadow-sm ring-1 ring-foreground/[0.04] backdrop-blur-xl dark:bg-card/70",
                  card.tone,
                )}
              >
                <div
                  className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90", card.accent)}
                  aria-hidden
                />
                <div className="relative flex items-start gap-3">
                  <span className="task-kpi-icon flex size-12 shrink-0 items-center justify-center rounded-xl">
                    <Icon className="size-5.5" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">{card.title}</p>
                    <div className="mt-0.5 flex items-baseline gap-2">
                      <p className="text-3xl font-bold tabular-nums tracking-tight text-foreground">{card.value}</p>
                      <span className="text-xs font-semibold tabular-nums text-muted-foreground">{pct}%</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{card.desc}</p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted/60">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          card.key === "ontrack" && "bg-emerald-500",
                          card.key === "atrisk" && "bg-amber-500",
                          card.key === "breached" && "bg-rose-500",
                        )}
                        style={{ width: `${Math.max(pct, 4)}%` }}
                        aria-hidden
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* Footnote */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          transition={{ duration: 0.3, delay: reduceMotion ? 0 : 0.65 }}
          className="rounded-xl border border-dashed border-primary/20 bg-primary/[0.04] px-4 py-3 text-[11px] text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
            <Activity className="size-3.5 text-primary" aria-hidden />
            Insight
          </span>
          <span className="ml-2">
            Compliance computed from on-track projects vs total. Approval velocity is illustrative monthly trend; replace with
            warehouse data in production.
          </span>
        </motion.div>
      </div>
    </AppShell>
  );
}
