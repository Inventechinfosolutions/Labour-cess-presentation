import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { AppShell } from "@/components/AppShell";
import { SLABadge } from "@/components/Bits";
import { TaskRegisterToolbar } from "@/components/TaskRegisterToolbar";
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgeCheck, CheckCircle2 } from "lucide-react";
import {
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
  DataListPaginationFooter,
  useDataListPagination,
  type DataListViewMode,
} from "@/components/DataListPage";
import { formatDate, relativeTime, useDbVersion } from "@/lib/hooks";
import { listApproverOpportunityTasks } from "@/lib/approver-tasks";
import { metricTileToneAt } from "@/lib/dashboard-kpi-icon";
import { cn } from "@/lib/utils";
import type { ComponentType } from "react";

const MotionMetricCard = motion(AdminMetricCard);

export const Route = createFileRoute("/approver/tasks/")({
  head: () => ({ meta: [{ title: "Approver Tasks — PMIS" }] }),
  component: ApproverTasksPage,
});

type IconCmp = ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

const APPROVER_TONE = "task-tone-query";

function getApproverRowMeta() {
  return {
    label: "Final approval",
    chip: "Approval",
    icon: BadgeCheck as IconCmp,
    tone: APPROVER_TONE,
    cta: "Open evaluation",
  };
}

function ApproverTasksPage() {
  const dbv = useDbVersion();
  const reduceMotion = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [view, setView] = useState<DataListViewMode>("table");

  const tasks = useMemo(() => listApproverOpportunityTasks(), [dbv]);

  const filtered = useMemo(() => {
    if (!q.trim()) return tasks;
    const s = q.toLowerCase();
    return tasks.filter(
      (t) =>
        t.displayTitle.toLowerCase().includes(s) ||
        t.ref.toLowerCase().includes(s),
    );
  }, [tasks, q]);

  const resetKey = q;
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

  const renderDetails = (t: (typeof tasks)[number]) =>
    `${t.projectCount} application${t.projectCount === 1 ? "" : "s"} · Awaiting your action`;

  return (
    <AppShell role="approver">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="Task register"
              count={filtered.length}
              description="Search and open opportunity-level approval tasks forwarded by the officer."
            />
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Tasks summary">
          <MotionMetricCard
            className="sm:col-span-2 lg:col-span-4"
            label="Final approvals"
            value={tasks.length}
            icon={BadgeCheck}
            iconTone={metricTileToneAt(0)}
            footer="Forwarded by officer — awaiting your sign-off"
            footerBadge="Approver"
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <div className="app-data-panel overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <TaskRegisterToolbar
            searchRef={searchRef}
            query={q}
            onQueryChange={setQ}
            searchPlaceholder="Search task or ref…"
            searchAriaLabel="Search approver tasks"
            view={view}
            onViewChange={setView}
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
                  {paged.map((t, i) => {
                    const meta = getApproverRowMeta();
                    const Icon = meta.icon;
                    const sl = (safePage - 1) * pageSize + i + 1;
                    return (
                      <motion.tr
                        key={t.opportunityId}
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
                              <p className="font-semibold text-foreground">{t.displayTitle}</p>
                              <p className="font-mono text-[11px] text-primary">{t.ref}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={cn("task-table-pill", meta.tone)}>
                            <Icon className="size-3" aria-hidden />
                            {meta.chip}
                          </span>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">{renderDetails(t)}</td>
                        <td className="p-3">
                          <SLABadge status={t.slaStatus} />
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            Due {formatDate(t.slaDueDate)}
                          </div>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
                          {relativeTime(t.latestUpdatedAt)}
                        </td>
                        <td className="p-3 text-right">
                          <Button asChild size="sm" className="h-8 rounded-lg">
                            <Link
                              to="/approver/tasks/evaluate/$opportunityId"
                              params={{ opportunityId: t.opportunityId }}
                            >
                              Open
                            </Link>
                          </Button>
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
                {paged.map((t, i) => {
                  const meta = getApproverRowMeta();
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={t.opportunityId}
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
                            {t.displayTitle}
                          </p>
                          <p className="truncate font-mono text-[11.5px] text-primary">{t.ref}</p>
                        </div>
                      </div>
                      <p className="text-[12px] leading-snug text-foreground/85">{renderDetails(t)}</p>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                        <SLABadge status={t.slaStatus} />
                        <span className="text-[11px] text-muted-foreground">{relativeTime(t.latestUpdatedAt)}</span>
                      </div>
                      <Button asChild size="sm" className="group h-9 rounded-lg font-semibold">
                        <Link
                          to="/approver/tasks/evaluate/$opportunityId"
                          params={{ opportunityId: t.opportunityId }}
                        >
                          <span className="flex items-center gap-1.5">
                            {meta.cta}
                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                          </span>
                        </Link>
                      </Button>
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
                  ? "Forwarded officer submissions will appear here."
                  : "Try clearing your search."}
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
