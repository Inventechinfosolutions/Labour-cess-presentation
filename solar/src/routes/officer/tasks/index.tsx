import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { AppShell } from "@/components/AppShell";
import { SLABadge } from "@/components/Bits";
import { TaskRegisterToolbar } from "@/components/TaskRegisterToolbar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  ListChecks,
  ListTodo,
  Rocket,
  Target,
} from "lucide-react";
import {
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
  DataListPaginationFooter,
  useDataListPagination,
  type DataListViewMode,
} from "@/components/DataListPage";
import { db, formatDate, relativeTime, useDbVersion } from "@/lib/hooks";
import {
  listOfficerOpportunityTasks,
  type OfficerOpportunityTask,
} from "@/lib/officer-tasks";
import type { Project } from "@/lib/types";
import { metricTileToneAt } from "@/lib/dashboard-kpi-icon";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

const MotionMetricCard = motion(AdminMetricCard);

export const Route = createFileRoute("/officer/tasks/")({
  head: () => ({ meta: [{ title: "Tasks — PMIS" }] }),
  component: OfficerTasksPage,
});

type OfficerTaskKind = "review" | "milestone" | "commissioning";

type OfficerRow =
  | { kind: "review"; task: OfficerOpportunityTask }
  | { kind: "milestone"; project: Project }
  | { kind: "commissioning"; project: Project };

type IconCmp = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

function getOfficerMeta(row: OfficerRow): {
  label: string;
  chip: string;
  icon: IconCmp;
  tone: string;
  cta: string;
} {
  switch (row.kind) {
    case "review":
      return {
        label: "Application review",
        chip: "Review",
        icon: ClipboardList as IconCmp,
        tone: "task-tone-query",
        cta: "Evaluate",
      };
    case "milestone":
      return {
        label: "Milestone verification",
        chip: "Milestone",
        icon: Target as IconCmp,
        tone: "task-tone-milestone",
        cta: "Verify",
      };
    case "commissioning":
      return {
        label: "Commissioning check",
        chip: "Commissioning",
        icon: Rocket as IconCmp,
        tone: "task-tone-commissioning",
        cta: "Review project",
      };
  }
}

function OfficerTasksPage() {
  const dbv = useDbVersion();
  const reduceMotion = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<OfficerTaskKind | "all">("all");
  const [view, setView] = useState<DataListViewMode>("table");

  const tasks = useMemo<OfficerRow[]>(() => {
    const reviewTasks = listOfficerOpportunityTasks().map((t) => ({
      kind: "review" as const,
      task: t,
    }));
    const milestoneTasks = db
      .listProjects()
      .filter((p) => p.status === "In Execution")
      .filter(
        (p) =>
          p.milestones.some((m) => m.status === "Submitted") ||
          (!!p.fullMilestonesSubmittedAt && !p.fullMilestonesApprovedAt),
      )
      .map((p) => ({ kind: "milestone" as const, project: p }));
    const commissioningTasks = db
      .listProjects()
      .filter((p) => p.status === "Commissioning Submitted")
      .map((p) => ({ kind: "commissioning" as const, project: p }));
    return [...reviewTasks, ...milestoneTasks, ...commissioningTasks].sort((a, b) => {
      const aTime =
        a.kind === "review"
          ? new Date(a.task.latestUpdatedAt).getTime()
          : new Date(a.project.lastUpdated).getTime();
      const bTime =
        b.kind === "review"
          ? new Date(b.task.latestUpdatedAt).getTime()
          : new Date(b.project.lastUpdated).getTime();
      return bTime - aTime;
    });
  }, [dbv]);

  const counts = useMemo(() => {
    const c: Record<OfficerTaskKind, number> = {
      review: 0,
      milestone: 0,
      commissioning: 0,
    };
    for (const t of tasks) {
      if (t.kind !== "review") {
        c[t.kind]++;
      } else {
        c.review++;
      }
    }
    return c;
  }, [tasks]);

  const filtered = useMemo(() => {
    return tasks.filter((row) => {
      if (kind === "review" && row.kind !== "review") return false;
      if (kind === "milestone" && row.kind !== "milestone") return false;
      if (kind === "commissioning" && row.kind !== "commissioning") return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      if (row.kind === "review") {
        const t = row.task;
        return (
          t.displayTitle.toLowerCase().includes(s) || t.ref.toLowerCase().includes(s)
        );
      }
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

  const renderTaskSummary = (row: OfficerRow) => {
    if (row.kind === "review") {
      const t = row.task;
      return `${t.projectCount} application${t.projectCount === 1 ? "" : "s"} · ${t.taskStatusLabel}`;
    }
    if (row.kind === "commissioning") {
      const p = row.project;
      return p.commissioningNote
        ? `IPP submitted for final commissioning · “${p.commissioningNote}”`
        : "IPP submitted for final commissioning";
    }
    const p = row.project;
    const submittedCount = p.milestones.filter((m) => m.status === "Submitted").length;
    if (p.fullMilestonesSubmittedAt && !p.fullMilestonesApprovedAt) {
      return "Awaiting officer full-package approval from submitted milestones";
    }
    return `Awaiting officer verification · Submitted milestones: ${submittedCount}`;
  };

  return (
    <AppShell role="officer">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="Task register"
              count={filtered.length}
              description="Search, filter, and open application reviews or project tasks."
            />
          }
        />

        <div
          className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
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
                k: "review" as const,
                label: "Reviews",
                icon: ClipboardList,
                footerBadge: "Queue",
                footer: "Application reviews",
              },
              {
                k: "milestone" as const,
                label: "Milestones",
                icon: Target,
                footerBadge: "Execution",
                footer: "Milestone verification",
              },
              {
                k: "commissioning" as const,
                label: "Commissioning",
                icon: Rocket,
                footerBadge: "Final",
                footer: "Commissioning checks",
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
            searchPlaceholder="Search task or project…"
            searchAriaLabel="Search tasks"
            view={view}
            onViewChange={setView}
            filterSlot={
              <Select
                value={kind}
                onValueChange={(v) => setKind(v as OfficerTaskKind | "all")}
              >
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
                  <SelectItem value="review">Application reviews</SelectItem>
                  <SelectItem value="milestone">Milestone verification</SelectItem>
                  <SelectItem value="commissioning">Commissioning checks</SelectItem>
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
                  {paged.map((row, i) => {
                    const meta = getOfficerMeta(row);
                    const Icon = meta.icon;
                    const sl = (safePage - 1) * pageSize + i + 1;
                    const slaDue =
                      row.kind === "review"
                        ? row.task.slaDueDate
                        : row.project.slaDueDate;
                    const slaStatus =
                      row.kind === "review"
                        ? row.task.slaStatus
                        : row.project.slaStatus;
                    const updatedAt =
                      row.kind === "review"
                        ? row.task.latestUpdatedAt
                        : row.project.lastUpdated;

                    const title =
                      row.kind === "review" ? row.task.displayTitle : row.project.name;
                    const subtitle =
                      row.kind === "review"
                        ? row.task.ref
                        : row.project.opportunityName;

                    return (
                      <motion.tr
                        key={
                          row.kind === "review"
                            ? `review-${row.task.opportunityId}`
                            : `${row.kind}-${row.project.id}`
                        }
                        initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={{ delay: reduceMotion ? 0 : i * 0.015 }}
                        className="app-data-table-body-row transition"
                      >
                        <td className="p-3 text-xs tabular-nums text-muted-foreground">{sl}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={cn(
                                "task-card-icon flex size-9 shrink-0 items-center justify-center rounded-lg",
                                meta.tone,
                              )}
                            >
                              <Icon className="size-4" aria-hidden />
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold text-foreground">{title}</p>
                              <p className={cn(
                                row.kind === "review" ? "font-mono text-[11px] text-primary" : "text-xs text-muted-foreground",
                              )}
                              >
                                {subtitle}
                              </p>
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
                          <p className="text-xs text-muted-foreground">{renderTaskSummary(row)}</p>
                          {row.kind === "review" ? (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Status:{" "}
                              <span className="font-medium text-foreground">{row.task.taskStatusLabel}</span>
                            </p>
                          ) : null}
                        </td>
                        <td className="p-3">
                          <SLABadge status={slaStatus} />
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            Due {formatDate(slaDue)}
                          </div>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{relativeTime(updatedAt)}</td>
                        <td className="p-3 text-right">
                          {row.kind === "review" ? (
                            <Button asChild size="sm" className="h-8 rounded-lg">
                              <Link
                                to="/officer/tasks/evaluate/$opportunityId"
                                params={{ opportunityId: row.task.opportunityId }}
                                search={{}}
                              >
                                Open
                              </Link>
                            </Button>
                          ) : (
                            <Button asChild size="sm" className="h-8 rounded-lg">
                              <Link to="/officer/projects/$id" params={{ id: row.project.id }}>
                                Open
                              </Link>
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
                {paged.map((row, i) => {
                  const meta = getOfficerMeta(row);
                  const Icon = meta.icon;
                  const slaStatus =
                    row.kind === "review"
                      ? row.task.slaStatus
                      : row.project.slaStatus;
                  const updatedAt =
                    row.kind === "review"
                      ? row.task.latestUpdatedAt
                      : row.project.lastUpdated;

                  const title =
                    row.kind === "review" ? row.task.displayTitle : row.project.name;
                  const subtitle =
                    row.kind === "review"
                      ? row.task.ref
                      : row.project.opportunityName;

                  return (
                    <motion.div
                      key={
                        row.kind === "review"
                          ? `review-${row.task.opportunityId}`
                          : `${row.kind}-${row.project.id}`
                      }
                      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: reduceMotion ? 0 : i * 0.025,
                        ease: [0.22, 1, 0.36, 1],
                      }}
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
                            {title}
                          </p>
                          <p
                            className={cn(
                              "truncate text-[11.5px]",
                              row.kind === "review"
                                ? "font-mono text-primary"
                                : "text-muted-foreground",
                            )}
                          >
                            {subtitle}
                          </p>
                        </div>
                      </div>
                      <p className="text-[12px] leading-snug text-foreground/85">{renderTaskSummary(row)}</p>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                        <SLABadge status={slaStatus} />
                        <span className="text-[11px] text-muted-foreground">{relativeTime(updatedAt)}</span>
                      </div>
                      {row.kind === "review" ? (
                        <Button asChild size="sm" className="group h-9 rounded-lg font-semibold">
                          <Link
                            to="/officer/tasks/evaluate/$opportunityId"
                            params={{ opportunityId: row.task.opportunityId }}
                            search={{}}
                          >
                            <span className="flex items-center gap-1.5">
                              {meta.cta}
                              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                            </span>
                          </Link>
                        </Button>
                      ) : (
                        <Button asChild size="sm" className="group h-9 rounded-lg font-semibold">
                          <Link to="/officer/projects/$id" params={{ id: row.project.id }}>
                            <span className="flex items-center gap-1.5">
                              {meta.cta}
                              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                            </span>
                          </Link>
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
                  ? "Application reviews, milestone submissions, and commissioning checks will appear here."
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
