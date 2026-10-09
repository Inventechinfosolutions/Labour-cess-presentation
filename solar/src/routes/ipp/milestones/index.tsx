import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ClipboardList,
  Clock,
  ListTodo,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  DataListPageShell,
  DataListPaginationFooter,
  useDataListPagination,
} from "@/components/DataListPage";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { db, useSession, useDbVersion, formatDate } from "@/lib/hooks";
import { milestoneProgressPercentFromProofs } from "@/lib/execution-milestones";
import type { Milestone, Project } from "@/lib/types";
import { appPath, cn } from "@/lib/utils";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";

export const Route = createFileRoute("/ipp/milestones/")({
  head: () => ({ meta: [{ title: "Milestones — PMIS" }] }),
  component: Mil,
});

function dayDiff(due: string): number {
  const d = new Date(due);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / 86400000);
}
function isDone(m: Milestone) { return m.status === "Verified" || m.status === "Completed"; }
function isActive(m: Milestone) { return m.status === "In Progress" || m.status === "Submitted"; }
function isOverdue(m: Milestone) { return !isDone(m) && dayDiff(m.dueDate) < 0; }

type FilterMode = "all" | "active" | "overdue" | "completed";

function glassCardClass(extra?: string) {
  return cn(
    "rounded-3xl border border-border/50 bg-card/80 shadow-lg shadow-black/5 ring-1 ring-foreground/[0.04] backdrop-blur-xl dark:bg-card/70 dark:shadow-black/20",
    extra,
  );
}

/** Premium SVG progress ring. */
function Ring({
  value,
  size = 84,
  stroke = 8,
  tone = "primary",
  showValue = true,
  small = false,
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: "primary" | "emerald" | "amber" | "rose";
  showValue?: boolean;
  small?: boolean;
}) {
  const v = Math.max(0, Math.min(100, value));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (v / 100) * c;
  const ringColor =
    tone === "emerald" ? "rgb(16 185 129)"
      : tone === "amber" ? "rgb(245 158 11)"
        : tone === "rose" ? "rgb(244 63 94)"
          : "var(--primary)";
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="color-mix(in srgb, currentColor 14%, transparent)" strokeWidth={stroke} className="text-muted-foreground" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      {showValue ? (
        <span className={cn("absolute font-bold tabular-nums tracking-tight text-foreground", small ? "text-sm" : "text-base")}>
          {v}<span className={cn("text-muted-foreground", small ? "text-[9px]" : "text-[11px]")}>%</span>
        </span>
      ) : null}
    </div>
  );
}

function dueLabel(m: Milestone): { label: string; tone: string } {
  if (isDone(m)) return { label: "Completed", tone: "text-emerald-700 dark:text-emerald-300" };
  const d = dayDiff(m.dueDate);
  if (d < 0) {
    const n = Math.abs(d);
    return { label: `${n} day${n === 1 ? "" : "s"} overdue`, tone: "text-rose-700 dark:text-rose-300" };
  }
  if (d === 0) return { label: "Due today", tone: "text-amber-700 dark:text-amber-300" };
  if (d <= 3) return { label: `${d} day${d === 1 ? "" : "s"} left`, tone: "text-amber-700 dark:text-amber-300" };
  return { label: `${d} days left`, tone: "text-muted-foreground" };
}

function ProjectCard({ project, idx, reduceMotion }: { project: Project; idx: number; reduceMotion: boolean | null }) {
  const sortedMs = [...project.milestones].sort((a, b) => a.sequence - b.sequence);
  const total = sortedMs.length;
  const awaitingSetup = !!project.ippAccessAcceptedAt && !project.approverMilestonesSubmittedAt && total === 0;
  const done = sortedMs.filter(isDone).length;
  const overdueLocal = sortedMs.filter(isOverdue).length;
  const activeMilestone =
    sortedMs.find(isActive) ??
    sortedMs.find(isOverdue) ??
    sortedMs.find((m) => !isDone(m)) ??
    sortedMs[sortedMs.length - 1];
  const projectPct = total ? Math.round((done / total) * 100) : 0;
  const ringTone: "rose" | "emerald" | "primary" | "amber" =
    overdueLocal > 0 ? "rose" : projectPct >= 100 ? "emerald" : projectPct > 0 ? "primary" : "amber";

  const activePct = activeMilestone ? milestoneProgressPercentFromProofs(activeMilestone) : 0;
  const activeDue = activeMilestone ? dueLabel(activeMilestone) : null;

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: reduceMotion ? 0 : 0.04 + idx * 0.04, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:shadow-md"
    >
      <div
        className={cn(
          "h-[3px] w-full",
          ringTone === "rose" ? "bg-gradient-to-r from-rose-400 to-rose-600"
            : ringTone === "emerald" ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
              : ringTone === "amber" ? "bg-gradient-to-r from-amber-400 to-amber-600"
                : "bg-gradient-to-r from-primary via-chart-2 to-primary",
        )}
        aria-hidden
      />
      <div className="flex items-start gap-4 px-5 pt-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-chart-2/10 text-primary ring-1 ring-primary/20">
          <Target className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <a
            href={appPath(awaitingSetup ? `/ipp/projects/${project.id}` : `/ipp/projects/${project.id}#milestones`)}
            className="group/link inline-flex max-w-full items-center gap-1 text-[15px] font-bold tracking-tight text-foreground hover:text-primary"
          >
            <span className="truncate">{project.name}</span>
            <ArrowUpRight className="size-3.5 shrink-0 opacity-0 transition group-hover/link:translate-x-0.5 group-hover/link:opacity-100" aria-hidden />
          </a>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{project.opportunityName}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              <Sparkles className="size-2.5" aria-hidden />
              {project.type}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-card px-2 py-0.5 text-[10px] font-semibold text-foreground">
              <CheckCircle2 className="size-2.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
              {done}/{total}
            </span>
            {overdueLocal > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/12 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-300">
                <AlertTriangle className="size-2.5" aria-hidden />
                {overdueLocal}
              </span>
            ) : null}
          </div>
        </div>
        <Ring value={projectPct} size={68} stroke={6} tone={ringTone} />
      </div>

      {sortedMs.length > 0 ? (
        <div className="relative mx-5 mt-5" aria-hidden>
          <div className="absolute left-2 right-2 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-border/70" />
          <div
            className="absolute left-2 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500 via-primary to-chart-2"
            style={{ width: `calc(${Math.max(projectPct, 2)}% * 0.96)` }}
          />
          <div className="relative flex items-center justify-between">
            {sortedMs.map((m) => (
              <span
                key={m.id}
                className={cn(
                  "z-[1] flex size-5 items-center justify-center rounded-full text-[9px] font-bold tabular-nums shadow-sm ring-2 ring-card",
                  isDone(m) ? "bg-emerald-500 text-white"
                    : isOverdue(m) ? "bg-rose-500 text-white"
                      : isActive(m) ? "bg-amber-500 text-white"
                        : "bg-muted text-muted-foreground",
                )}
                title={`M${m.sequence} · ${m.name}`}
              >
                {isDone(m) ? <CheckCircle2 className="size-2.5" /> : m.sequence}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {awaitingSetup ? (
        <div className="mx-5 mt-4 rounded-xl border border-primary/25 bg-primary/5 p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Senior approver stage</p>
          <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">Milestone setup in progress</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Access allotment is accepted. Senior approver will publish execution milestones for this application.
          </p>
        </div>
      ) : activeMilestone && !isDone(activeMilestone) ? (
        <div className="mx-5 mt-4 rounded-xl border border-border/50 bg-muted/[0.25] p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Up next</p>
              <p className="mt-0.5 truncate text-sm font-semibold tracking-tight text-foreground">
                M{activeMilestone.sequence} · {activeMilestone.name}
              </p>
            </div>
            {activeDue ? (
              <span className={cn("shrink-0 text-[10.5px] font-semibold", activeDue.tone)}>
                {activeDue.label}
              </span>
            ) : null}
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  isOverdue(activeMilestone)
                    ? "bg-gradient-to-r from-rose-500 to-amber-500"
                    : "bg-gradient-to-r from-primary to-chart-2",
                )}
                style={{ width: `${Math.max(activePct, 4)}%` }}
              />
            </div>
            <span className="shrink-0 text-xs font-bold tabular-nums text-foreground">{activePct}%</span>
          </div>
        </div>
      ) : (
        <div className="mx-5 mt-4 inline-flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <CheckCircle2 className="size-3.5" aria-hidden />
          All milestones verified
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border/40 bg-muted/[0.15] px-5 py-3">
        <p className="text-[11px] text-muted-foreground">
          {awaitingSetup ? (
            <>Waiting for milestone issue</>
          ) : (
            <><span className="font-bold text-foreground tabular-nums">{projectPct}%</span> complete</>
          )}
        </p>
        <motion.div
          animate={
            awaitingSetup
              ? undefined
              : { scale: [1, 1.06, 1] }
          }
          transition={
            awaitingSetup
              ? undefined
              : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 gap-1 rounded-lg border px-2.5 text-[11px] font-semibold transition-all duration-300 focus-visible:ring-primary/40",
              awaitingSetup
                ? "border-border/50 bg-muted/40 text-foreground hover:bg-muted/60"
                : "border-primary/45 bg-primary/12 text-primary shadow-sm shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary/18 hover:shadow-md hover:shadow-primary/30",
            )}
          >
            <a href={appPath(awaitingSetup ? `/ipp/projects/${project.id}` : `/ipp/projects/${project.id}#milestones`)}>
              {awaitingSetup ? "View setup status" : "Update milestone"}
              <ArrowRight className="size-3" aria-hidden />
            </a>
          </Button>
        </motion.div>
      </div>
    </motion.article>
  );
}

function Mil() {
  const user = useSession();
  useDbVersion();
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState<FilterMode>("all");

  if (!user) return null;
  const projects = db
    .listProjects({ ippId: user.id })
    .filter((p) => p.milestones.length > 0 || (!!p.ippAccessAcceptedAt && !p.approverMilestonesSubmittedAt));

  const allMs = useMemo(
    () => projects.flatMap((p) => p.milestones.map((m) => ({ ...m, projectId: p.id, projectName: p.name }))),
    [projects],
  );
  const totalMs = allMs.length;
  const completedMs = allMs.filter(isDone).length;
  const activeMs = allMs.filter(isActive).length;
  const overdueMs = allMs.filter(isOverdue).length;
  const pendingMs = totalMs - completedMs - activeMs - overdueMs;
  const overallPct = totalMs ? Math.round((completedMs / totalMs) * 100) : 0;

  /** Donut chart data — milestone status distribution */
  const statusData = useMemo(
    () => [
      { name: "Completed", value: completedMs, color: "rgb(16 185 129)" },
      { name: "In progress", value: activeMs, color: "rgb(245 158 11)" },
      { name: "Overdue", value: overdueMs, color: "rgb(244 63 94)" },
      { name: "Pending", value: Math.max(0, pendingMs), color: "rgb(148 163 184)" },
    ].filter((d) => d.value > 0),
    [completedMs, activeMs, overdueMs, pendingMs],
  );

  /** Upcoming deadlines — top 5 nearest non-completed */
  const upcomingDeadlines = useMemo(() => {
    return allMs
      .filter((m) => !isDone(m))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5);
  }, [allMs]);

  const filteredProjects = useMemo(() => {
    if (filter === "all") return projects;
    if (filter === "active") return projects.filter((p) => p.milestones.some(isActive));
    if (filter === "overdue") return projects.filter((p) => p.milestones.some(isOverdue));
    return projects.filter((p) => p.milestones.some(isDone));
  }, [projects, filter]);

  const counts: Record<FilterMode, number> = {
    all: projects.length,
    active: projects.filter((p) => p.milestones.some(isActive)).length,
    overdue: projects.filter((p) => p.milestones.some(isOverdue)).length,
    completed: projects.filter((p) => p.milestones.some(isDone)).length,
  };

  const {
    pageSize, setPageSize,
    safePage, pageCount,
    paged, start, end,
    setPage, goFirst, goLast, goPrev, goNext,
  } = useDataListPagination(filteredProjects, filter);

  return (
    <AppShell role="ipp">
      <DataListPageShell>
        {projects.length === 0 ? (
          <EmptyState
            title="No milestones yet"
            description="Milestones appear once your application is approved and the execution phase begins."
            icon={<ListTodo className="h-5 w-5" />}
          />
        ) : (
          <div className="relative space-y-6 rounded-3xl border border-border/40 bg-gradient-to-b from-muted/50 via-background to-background p-4 shadow-inner sm:p-6">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-48 rounded-t-3xl bg-gradient-to-b from-primary/[0.06] to-transparent"
              aria-hidden
            />
            {/* ---- Dashboard-style header ---- */}
            <motion.header
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col gap-1"
            >
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                <span className="bg-gradient-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">
                  Milestones
                </span>
              </h1>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Track verification progress, upcoming deadlines, and execution status across your portfolio.
              </p>
            </motion.header>

            {/* ---- KPI tiles ---- */}
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Milestone metrics">
              {(
                [
                  { key: "total", label: "Total", value: totalMs, sub: `${projects.length} project${projects.length === 1 ? "" : "s"}`, tone: "task-tone-query", icon: Target },
                  { key: "done", label: "Verified", value: completedMs, sub: `${overallPct}% of portfolio`, tone: "task-tone-milestone", icon: CheckCircle2 },
                  { key: "active", label: "In progress", value: activeMs, sub: "Currently active", tone: "task-tone-waiting", icon: Clock },
                  { key: "overdue", label: "Overdue", value: overdueMs, sub: overdueMs > 0 ? "Need attention" : "All on track", tone: overdueMs > 0 ? "task-tone-issue" : "task-tone-allotment", icon: AlertTriangle },
                ] as const
              ).map((tile, i) => {
                const Icon = tile.icon;
                return (
                  <motion.div
                    key={tile.key}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.32, delay: reduceMotion ? 0 : i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    className="flex h-full min-h-0 flex-col transition-transform duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <Card
                      className={cn(
                        glassCardClass("flex h-full min-h-[7.25rem] flex-col py-0"),
                        i === 0
                          ? "border-primary/20 bg-gradient-to-br from-primary via-primary/92 to-chart-2 text-primary-foreground shadow-xl ring-primary/20"
                          : "",
                      )}
                    >
                      <CardContent className="flex min-h-0 flex-1 flex-col justify-between gap-2 px-4 py-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p
                              className={cn(
                                "text-[0.6rem] font-semibold uppercase tracking-[0.12em]",
                                i === 0 ? "text-primary-foreground/80" : "text-muted-foreground",
                              )}
                            >
                              {tile.label}
                            </p>
                            <p
                              className={cn(
                                "mt-0.5 text-2xl font-semibold tabular-nums tracking-tight",
                                i === 0 ? "text-primary-foreground" : "text-foreground",
                              )}
                            >
                              {tile.value}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "flex size-9 shrink-0 items-center justify-center rounded-xl ring-1",
                              i === 0
                                ? "bg-primary-foreground/15 text-primary-foreground ring-primary-foreground/25"
                                : "border border-primary/25 bg-primary/10 text-primary ring-primary/15",
                            )}
                          >
                            <Icon className="size-4" aria-hidden />
                          </span>
                        </div>
                        <p
                          className={cn(
                            "text-[0.65rem] leading-snug",
                            i === 0 ? "text-primary-foreground/90" : "text-chart-2",
                          )}
                        >
                          {tile.sub}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </section>

            {/* ---- Charts row ---- */}
            <section className="grid gap-4 lg:grid-cols-12">
              {/* Status donut */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm lg:col-span-5"
              >
                <div className="border-b border-border/40 bg-gradient-to-br from-primary/[0.04] via-card to-chart-2/[0.03] px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                      <Zap className="size-4" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight text-foreground">Milestone status</h3>
                      <p className="text-[11px] text-muted-foreground">Distribution across the portfolio</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-[auto_1fr] items-center gap-4 p-5">
                  <div className="relative size-40">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={72}
                          paddingAngle={3}
                          stroke="var(--card)"
                          strokeWidth={2}
                        >
                          {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                        </Pie>
                        <RechartsTooltip
                          content={({ active, payload }) => {
                            if (!active || !payload?.length) return null;
                            const row = payload[0].payload as { name: string; value: number; color: string };
                            const pct = totalMs ? Math.round((row.value / totalMs) * 100) : 0;
                            return (
                              <div className="rounded-lg border border-border/60 bg-card/95 px-2.5 py-2 text-xs shadow-md backdrop-blur-sm">
                                <p className="flex items-center gap-1.5 font-semibold text-foreground">
                                  <span className="size-2 rounded-full" style={{ background: row.color }} aria-hidden />
                                  {row.name}
                                </p>
                                <p className="mt-1 tabular-nums text-muted-foreground">
                                  <span className="font-medium text-foreground">{row.value}</span> · {pct}%
                                </p>
                              </div>
                            );
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                      <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{totalMs}</p>
                      <p className="text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground">Milestones</p>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {statusData.map((d) => {
                      const pct = totalMs ? Math.round((d.value / totalMs) * 100) : 0;
                      return (
                        <li key={d.name} className="flex items-center gap-2 text-xs">
                          <span className="size-2.5 shrink-0 rounded-full" style={{ background: d.color }} aria-hidden />
                          <span className="flex-1 truncate font-medium text-foreground">{d.name}</span>
                          <span className="tabular-nums text-muted-foreground">{d.value}</span>
                          <span className="ml-1 inline-flex h-5 min-w-9 items-center justify-center rounded-full bg-muted/60 px-2 text-[10px] font-bold tabular-nums text-foreground">
                            {pct}%
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </motion.div>

              {/* Upcoming deadlines */}
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm lg:col-span-7"
              >
                <div className="flex items-center justify-between gap-3 border-b border-border/40 bg-gradient-to-br from-amber-500/[0.06] via-card to-primary/[0.04] px-5 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl border border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                      <TrendingUp className="size-4" aria-hidden />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight text-foreground">Upcoming deadlines</h3>
                      <p className="text-[11px] text-muted-foreground">Next 5 milestones to act on</p>
                    </div>
                  </div>
                </div>
                {upcomingDeadlines.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                    <CheckCircle2 className="size-6 text-emerald-500" aria-hidden />
                    <p className="text-sm font-semibold text-foreground">All caught up</p>
                    <p className="text-xs text-muted-foreground">No pending milestones in the queue.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-border/40">
                    {upcomingDeadlines.map((m) => {
                      const due = dueLabel(m);
                      const overdue = isOverdue(m);
                      const pct = milestoneProgressPercentFromProofs(m);
                      return (
                        <li key={`${m.projectId}_${m.id}`}>
                          <a
                            href={appPath(`/ipp/projects/${m.projectId}#milestones`)}
                            className="flex items-center gap-3 px-5 py-3 transition hover:bg-muted/20"
                          >
                            <span
                              className={cn(
                                "flex size-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold tabular-nums",
                                overdue ? "bg-rose-500 text-white"
                                  : isActive(m) ? "bg-amber-500 text-white"
                                    : "border border-border bg-card text-muted-foreground",
                              )}
                              aria-hidden
                            >
                              {m.sequence}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-foreground">{m.name}</p>
                              <p className="truncate text-[11px] text-muted-foreground">{m.projectName}</p>
                            </div>
                            <div className="hidden shrink-0 items-center gap-3 sm:flex">
                              <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={cn(
                                    "h-full rounded-full",
                                    overdue ? "bg-rose-500" : "bg-gradient-to-r from-primary to-chart-2",
                                  )}
                                  style={{ width: `${Math.max(pct, 4)}%` }}
                                />
                              </div>
                              <span className="text-[10.5px] font-bold tabular-nums text-foreground">{pct}%</span>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className={cn("text-[10.5px] font-semibold", due.tone)}>{due.label}</p>
                              <p className="text-[10px] tabular-nums text-muted-foreground">{formatDate(m.dueDate)}</p>
                            </div>
                            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" aria-hidden />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </motion.div>
            </section>

            {/* ---- Filter pill bar ---- */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {(
                  [
                    { key: "all", label: "All", icon: ListTodo },
                    { key: "active", label: "In progress", icon: Clock },
                    { key: "overdue", label: "Overdue", icon: AlertTriangle },
                    { key: "completed", label: "Has completed", icon: CheckCircle2 },
                  ] as const
                ).map((p) => {
                  const Icon = p.icon;
                  const isActiveFilter = filter === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setFilter(p.key as FilterMode)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all",
                        isActiveFilter
                          ? "border-primary/40 bg-primary/10 text-primary shadow-sm"
                          : "border-border/60 bg-card text-muted-foreground hover:border-border hover:bg-muted/40 hover:text-foreground",
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden />
                      {p.label}
                      <span className={cn(
                        "ml-0.5 inline-flex h-4.5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums",
                        isActiveFilter ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}>
                        {counts[p.key as FilterMode]}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-bold text-foreground tabular-nums">{filteredProjects.length}</span> of{" "}
                <span className="font-bold text-foreground tabular-nums">{projects.length}</span> projects
              </p>
            </div>

            {/* ---- Project cards grid ---- */}
            {paged.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/60 bg-muted/15 px-6 py-14 text-center">
                <ListTodo className="size-7 text-muted-foreground/60" aria-hidden />
                <p className="text-sm font-medium text-foreground">No projects match this filter</p>
                <p className="text-xs text-muted-foreground">Try a different filter to see other projects.</p>
                <Button variant="outline" size="sm" className="mt-2 rounded-xl" onClick={() => setFilter("all")}>
                  Show all
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {paged.map((project, idx) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    idx={idx}
                    reduceMotion={reduceMotion}
                  />
                ))}
              </div>
            )}

            {/* ---- Pagination ---- */}
            {filteredProjects.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
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
              </div>
            ) : null}

            {/* ---- Footer link to consolidated workspace ---- */}
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ClipboardList className="size-3.5" aria-hidden />
              Need full project history?
              <Link to="/ipp/projects" className="font-semibold text-primary hover:underline">
                Open the projects workspace →
              </Link>
            </p>
          </div>
        )}
      </DataListPageShell>
    </AppShell>
  );
}
