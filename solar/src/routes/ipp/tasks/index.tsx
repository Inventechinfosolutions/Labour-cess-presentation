import { createFileRoute } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState, type ComponentType } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { SLABadge } from "@/components/Bits";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { metricTileToneAt } from "@/lib/dashboard-kpi-icon";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Hourglass,
  KeyRound,
  ListChecks,
  ListTodo,
  MessageCircleQuestion,
  Rocket,
  Target,
} from "lucide-react";
import { TaskRegisterToolbar } from "@/components/TaskRegisterToolbar";
import {
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
  DataListPaginationFooter,
  useDataListPagination,
  type DataListViewMode,
} from "@/components/DataListPage";
import { db, formatDate, relativeTime, useDbVersion, useSession } from "@/lib/hooks";
import type { Project } from "@/lib/types";
import { appPath, cn } from "@/lib/utils";

const MotionMetricCard = motion(AdminMetricCard);

export const Route = createFileRoute("/ipp/tasks/")({
  head: () => ({ meta: [{ title: "IPP Tasks - PMIS" }] }),
  component: IppTasksPage,
});

type TaskKind =
  | "query"
  | "milestone"
  | "allotment"
  | "waitingApproverMilestone"
  | "commissioning";

type TaskRow = { type: TaskKind; project: Project };

type IconCmp = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

// Visual config per task kind — drives icon, label, tone class, and CTA copy.
function getTaskMeta(row: TaskRow) {
  const issue = row.type === "commissioning" && !!row.project.commissioningIssueNote;
  switch (row.type) {
    case "allotment":
      return {
        label: "Access allotment",
        chip: "Allotment",
        icon: KeyRound as IconCmp,
        tone: "task-tone-allotment",
        cta: "Review allotment",
      };
    case "waitingApproverMilestone":
      return {
        label: "Waiting on approver",
        chip: "Waiting",
        icon: Hourglass as IconCmp,
        tone: "task-tone-waiting",
        cta: "Waiting…",
      };
    case "query":
      return {
        label: "Officer query",
        chip: "Query",
        icon: MessageCircleQuestion as IconCmp,
        tone: "task-tone-query",
        cta: "Reply to query",
      };
    case "milestone":
      return {
        label: "Milestone update",
        chip: "Milestone",
        icon: Target as IconCmp,
        tone: "task-tone-milestone",
        cta: "Update milestone",
      };
    case "commissioning":
      return issue
        ? {
            label: "Commissioning issue",
            chip: "Issue",
            icon: AlertTriangle as IconCmp,
            tone: "task-tone-issue",
            cta: "Fix & resubmit",
          }
        : {
            label: "Ready for commissioning",
            chip: "Ready",
            icon: Rocket as IconCmp,
            tone: "task-tone-commissioning",
            cta: "Submit for commissioning",
          };
  }
}

function IppTasksPage() {
  const dbv = useDbVersion();
  const user = useSession();
  const reduceMotion = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<TaskKind | "all">("all");
  const [view, setView] = useState<DataListViewMode>("table");

  const tasks = useMemo<TaskRow[]>(() => {
    if (!user) return [];
    const queryTasks = db
      .listProjects({ ippId: user.id, status: "Query Raised" })
      .filter((p) => p.queries.some((qu) => qu.status === "Open"))
      .map((p) => ({ type: "query" as const, project: p }));

    const milestoneTasks = db
      .listProjects({ ippId: user.id, status: "In Execution" })
      .filter((p) => p.milestones.length > 0)
      .filter((p) => !!p.fullMilestonesApprovedAt)
      .filter((p) =>
        p.milestones.some(
          (m) => m.status !== "Submitted" && m.status !== "Completed",
        ),
      )
      .map((p) => ({ type: "milestone" as const, project: p }));

    const allotmentTasks = db
      .listProjects({ ippId: user.id })
      .filter((p) => !!p.accessAllotmentSentAt && !p.ippAccessAcceptedAt)
      .map((p) => ({ type: "allotment" as const, project: p }));

    const waitingApproverMilestoneTasks = db
      .listProjects({ ippId: user.id })
      .filter((p) => !!p.ippAccessAcceptedAt && !p.approverMilestonesSubmittedAt)
      .map((p) => ({ type: "waitingApproverMilestone" as const, project: p }));

    const commissioningTasks = db
      .listProjects({ ippId: user.id, status: "Ready for Commissioning" })
      .map((p) => ({ type: "commissioning" as const, project: p }));

    return [
      ...allotmentTasks,
      ...waitingApproverMilestoneTasks,
      ...queryTasks,
      ...milestoneTasks,
      ...commissioningTasks,
    ].sort(
      (a, b) =>
        new Date(b.project.lastUpdated).getTime() -
        new Date(a.project.lastUpdated).getTime(),
    );
  }, [user, dbv]);

  // Counts per type for KPI tiles
  const counts = useMemo(() => {
    const c: Record<TaskKind, number> = {
      query: 0,
      milestone: 0,
      allotment: 0,
      waitingApproverMilestone: 0,
      commissioning: 0,
    };
    for (const t of tasks) c[t.type]++;
    return c;
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((row) => {
      if (kind !== "all" && row.type !== kind) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      const p = row.project;
      return (
        p.name.toLowerCase().includes(s) ||
        p.opportunityName.toLowerCase().includes(s)
      );
    });
  }, [tasks, q, kind]);

  const resetKey = `${q}\0${kind}`;
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

  if (!user) return null;

  const renderTaskSummary = (row: TaskRow) => {
    const p = row.project;
    if (row.type === "allotment") return "Review approval and choose Accept or Reject.";
    if (row.type === "waitingApproverMilestone") return "Waiting for approver milestone setup.";
    if (row.type === "query") {
      const openCount = p.queries.filter((qu) => qu.status === "Open").length;
      return `${openCount} open quer${openCount === 1 ? "y" : "ies"} from officer`;
    }
    if (row.type === "commissioning") {
      return p.commissioningIssueNote
        ? "Officer raised an issue — fix and resubmit"
        : "Submit project for final commissioning";
    }
    const pendingCount = p.milestones.filter(
      (m) => m.status !== "Submitted" && m.status !== "Completed",
    ).length;
    return `${pendingCount} milestone${pendingCount === 1 ? "" : "s"} pending update`;
  };

  return (
    <AppShell role="ipp">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="Task register"
              count={filtered.length}
              description="Search, filter, and open a task for review."
            />
          }
        />

        {/* KPI strip — same metric card pattern as admin / IPP opportunities */}
        <div
          className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
          aria-label="Tasks by type"
        >
          {(
            [
              {
                k: "all" as const,
                label: "All tasks",
                icon: ListTodo,
                footerBadge: "Register",
                footer: "Every open action",
              },
              {
                k: "allotment" as const,
                label: "Allotments",
                icon: KeyRound,
                footerBadge: "Access",
                footer: "Accept or reject allotment",
              },
              {
                k: "query" as const,
                label: "Queries",
                icon: MessageCircleQuestion,
                footerBadge: "Officer",
                footer: "Reply to open queries",
              },
              {
                k: "milestone" as const,
                label: "Milestones",
                icon: Target,
                footerBadge: "Execution",
                footer: "Pending milestone updates",
              },
              {
                k: "commissioning" as const,
                label: "Commissioning",
                icon: Rocket,
                footerBadge: "Final",
                footer: "Ready or fix & resubmit",
              },
              {
                k: "waitingApproverMilestone" as const,
                label: "Waiting",
                icon: Hourglass,
                footerBadge: "Queue",
                footer: "Approver milestone setup",
              },
            ] as const
          ).map((tile, i) => {
            const Icon = tile.icon;
            const count = tile.k === "all" ? tasks.length : counts[tile.k];
            const active = kind === tile.k;
            return (
              <MotionMetricCard
                key={tile.k}
                label={tile.label}
                value={count}
                icon={Icon}
                iconTone={metricTileToneAt(i)}
                footer={tile.footer}
                footerBadge={tile.footerBadge}
                active={active}
                onClick={() => {
                  if (tile.k === "all") setKind("all");
                  else setKind(active ? "all" : tile.k);
                }}
                aria-pressed={active}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              />
            );
          })}
        </div>

        <div className="app-data-panel overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <TaskRegisterToolbar
            searchRef={searchRef}
            query={q}
            onQueryChange={setQ}
            searchPlaceholder="Search project…"
            searchAriaLabel="Search tasks"
            view={view}
            onViewChange={setView}
            filterSlot={
              <Select value={kind} onValueChange={(v) => setKind(v as TaskKind | "all")}>
                <SelectTrigger
                  aria-label="Task type filter"
                  className={cn(
                    "h-10 w-auto min-w-[10.75rem] shrink-0 rounded-full border-border bg-background px-3 shadow-sm sm:min-w-[12rem]",
                    kind !== "all" && "border-primary/35 ring-1 ring-primary/20",
                  )}
                >
                  <ListChecks className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
                  <SelectValue placeholder="Task type" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="allotment">Access allotments</SelectItem>
                  <SelectItem value="waitingApproverMilestone">Waiting on approver</SelectItem>
                  <SelectItem value="query">Officer queries</SelectItem>
                  <SelectItem value="milestone">Milestones</SelectItem>
                  <SelectItem value="commissioning">Commissioning</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          {view === "table" ? (
            <div className="overflow-x-auto">
              <table className="app-data-table-grid w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
                    <th className="w-10 p-3 text-left">Sl.</th>
                    <th className="p-3 text-left">Task</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Details</th>
                    <th className="p-3 text-left">SLA</th>
                    <th className="p-3 text-left">Updated</th>
                    <th className="w-28 p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((task, i) => {
                    const p = task.project;
                    const sl = (safePage - 1) * pageSize + i + 1;
                    const meta = getTaskMeta(task);
                    const Icon = meta.icon;
                    return (
                      <motion.tr
                        key={`${task.type}-${p.id}`}
                        initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={{ delay: reduceMotion ? 0 : i * 0.015 }}
                        className="app-data-table-body-row transition"
                      >
                        <td className="p-3 text-xs tabular-nums text-muted-foreground">{sl}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <span className={cn("task-card-icon flex size-9 shrink-0 items-center justify-center rounded-lg", meta.tone)}>
                              <Icon className="size-4" aria-hidden />
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.opportunityName}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={cn("task-table-pill", meta.tone)}>
                            <Icon className="size-3" aria-hidden />
                            {meta.chip}
                          </span>
                        </td>
                        <td className="p-3 text-sm">
                          <p className="text-xs text-muted-foreground">{renderTaskSummary(task)}</p>
                          {task.type === "allotment" ? (
                            <p className="mt-1 line-clamp-1 rounded-md border border-border/60 bg-card px-2 py-1 text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">Description:</span>{" "}
                              {task.project.approverApprovalDescription || "No description provided."}
                            </p>
                          ) : null}
                        </td>
                        <td className="p-3">
                          <SLABadge status={p.slaStatus} />
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            Due {formatDate(p.slaDueDate)}
                          </div>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {relativeTime(p.lastUpdated)}
                        </td>
                        <td className="p-3 text-right">
                          {task.type === "waitingApproverMilestone" ? (
                            <Button size="sm" variant="outline" className="h-8" disabled>
                              Waiting
                            </Button>
                          ) : (
                            <Button asChild size="sm" className="h-8 rounded-lg">
                              <a href={appPath(`/ipp/projects/${p.id}`)}>Open</a>
                            </Button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paged.map((task, i) => {
                  const p = task.project;
                  const meta = getTaskMeta(task);
                  const Icon = meta.icon;
                  const isWaiting = task.type === "waitingApproverMilestone";
                  return (
                    <motion.div
                      key={`${task.type}-${p.id}`}
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: reduceMotion ? 0 : i * 0.025, ease: [0.22, 1, 0.36, 1] }}
                      className={cn("task-card", meta.tone)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="task-card-icon flex size-10 shrink-0 items-center justify-center rounded-xl">
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className={cn("task-card-chip", meta.tone)}>
                            <Icon className="size-2.5" aria-hidden />
                            {meta.label}
                          </span>
                          <p className="mt-1.5 truncate text-[14px] font-bold leading-tight text-foreground">
                            {p.name}
                          </p>
                          <p className="truncate text-[11.5px] text-muted-foreground">
                            {p.opportunityName}
                          </p>
                        </div>
                      </div>

                      <p className="text-[12px] leading-snug text-foreground/85">
                        {renderTaskSummary(task)}
                      </p>

                      {task.type === "allotment" && task.project.approverApprovalDescription ? (
                        <p className="line-clamp-2 rounded-lg border border-border/50 bg-background/60 px-2.5 py-1.5 text-[11px] leading-snug text-muted-foreground">
                          <span className="font-semibold text-foreground/85">Note:</span>{" "}
                          {task.project.approverApprovalDescription}
                        </p>
                      ) : null}

                      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                        <SLABadge status={p.slaStatus} />
                        <span className="text-[11px] text-muted-foreground">
                          {relativeTime(p.lastUpdated)}
                        </span>
                      </div>

                      {isWaiting ? (
                        <Button size="sm" variant="outline" className="h-9 rounded-lg" disabled>
                          <Hourglass className="mr-1.5 size-3.5" aria-hidden />
                          Waiting for approver
                        </Button>
                      ) : (
                        <Button asChild size="sm" className="group h-9 rounded-lg font-semibold">
                          <a href={appPath(`/ipp/projects/${p.id}`)}>
                            <span className="flex items-center gap-1.5">
                              {meta.cta}
                              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                            </span>
                          </a>
                        </Button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {paged.length === 0 && (
            <div className="px-4 py-14 text-center sm:px-5">
              <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <CheckCircle2 className="size-7" aria-hidden />
              </div>
              <p className="text-base font-semibold text-foreground">
                {tasks.length === 0 ? "All caught up!" : "No matching tasks"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {tasks.length === 0
                  ? "Officer queries, milestones, and commissioning actions will land here."
                  : "Try clearing your search or filter."}
              </p>
            </div>
          )}

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
        </div>
      </DataListPageShell>
    </AppShell>
  );
}
