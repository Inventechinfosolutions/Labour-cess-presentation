import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CircleDot,
  Handshake,
  LayoutGrid,
  MapPinned,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { AppShell } from "@/components/AppShell";
import { SLABadge } from "@/components/Bits";
import { Button } from "@/components/ui/button";
import {
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
  DataListPaginationFooter,
  useDataListPagination,
  type DataListViewMode,
} from "@/components/DataListPage";
import { RegisterProjectBrowseCard } from "@/components/RegisterProjectBrowseCard";
import { TaskRegisterToolbar } from "@/components/TaskRegisterToolbar";
import { getApproverStage, approverStageLabel } from "@/components/ProjectDetail";
import { metricTileToneAt } from "@/lib/dashboard-kpi-icon";
import { db, useDbVersion, formatDate } from "@/lib/hooks";
import { resolveOpportunityReference } from "@/lib/opportunity-reference";
import { cn } from "@/lib/utils";

const MotionMetricCard = motion(AdminMetricCard);

type ApproverSeg = "all" | "early" | "awaiting" | "execution";

function approverSegmentForStage(stage: ReturnType<typeof getApproverStage>): ApproverSeg | null {
  if (stage === "review" || stage === "allotment") return "early";
  if (stage === "awaitingIpp") return "awaiting";
  if (stage === "milestones" || stage === "done") return "execution";
  return null;
}

const APPROVER_SEG_TILES: {
  key: ApproverSeg;
  label: string;
  icon: typeof LayoutGrid;
  footerBadge: string;
  footer: string;
}[] = [
  {
    key: "all",
    label: "Full queue",
    icon: LayoutGrid,
    footerBadge: "Queue",
    footer: "Every approver item",
  },
  {
    key: "early",
    label: "Review & allotment",
    icon: CircleDot,
    footerBadge: "Gate",
    footer: "Decision & access draft",
  },
  {
    key: "awaiting",
    label: "Awaiting IPP",
    icon: Handshake,
    footerBadge: "IPP",
    footer: "Acceptance window",
  },
  {
    key: "execution",
    label: "Milestones",
    icon: MapPinned,
    footerBadge: "Execution",
    footer: "Proofs & closure",
  },
];

const STAGE_TONE: Record<ReturnType<typeof getApproverStage>, string> = {
  review: "border-border bg-muted text-muted-foreground",
  allotment: "border-primary/40 bg-primary/10 text-primary",
  awaitingIpp: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  milestones: "border-chart-3/40 bg-chart-3/10 text-chart-3",
  done: "border-chart-4/40 bg-chart-4/10 text-chart-4",
};

export const Route = createFileRoute("/approver/queue/")({
  head: () => ({ meta: [{ title: "Approval Queue — PMIS" }] }),
  component: AQ,
});

function AQ() {
  const dbv = useDbVersion();
  const reduceMotion = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [approverSeg, setApproverSeg] = useState<ApproverSeg>("all");
  const [view, setView] = useState<DataListViewMode>("card");

  const base = useMemo(
    () =>
      db.listProjects().filter(
        (p) =>
          p.workflow.some((w) => w.role === "approver" && w.status === "current") ||
          // keep recently-completed approvals visible so the approver can see
          // them flip to "Completed" before they cycle out of the queue
          (p.approverMilestonesSubmittedAt &&
            p.workflow.some((w) => w.role === "approver" && w.status === "completed")),
      ),
    [dbv],
  );

  const segCounts = useMemo(() => {
    const c = { all: base.length, early: 0, awaiting: 0, execution: 0 };
    for (const p of base) {
      const seg = approverSegmentForStage(getApproverStage(p));
      if (seg === "early") c.early++;
      else if (seg === "awaiting") c.awaiting++;
      else if (seg === "execution") c.execution++;
    }
    return c;
  }, [base]);

  const filtered = useMemo(() => {
    let rows = base;
    if (approverSeg === "early") {
      rows = base.filter((p) => {
        const st = getApproverStage(p);
        return st === "review" || st === "allotment";
      });
    } else if (approverSeg === "awaiting") {
      rows = base.filter((p) => getApproverStage(p) === "awaitingIpp");
    } else if (approverSeg === "execution") {
      rows = base.filter((p) => {
        const st = getApproverStage(p);
        return st === "milestones" || st === "done";
      });
    }
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.ippName.toLowerCase().includes(s) ||
        p.opportunityName.toLowerCase().includes(s),
    );
  }, [base, approverSeg, q]);

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
  } = useDataListPagination(filtered, `${q}\0${approverSeg}`);

  return (
    <AppShell role="approver">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="Approval Queue"
              count={filtered.length}
              description="Approver workflow — review, send access allotment, await IPP acceptance, then submit execution milestones."
            />
          }
        />

        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Approvals by workflow stage"
        >
          {APPROVER_SEG_TILES.map((tile, i) => {
            const Icon = tile.icon;
            const count = segCounts[tile.key];
            const isAll = tile.key === "all";
            const pressed = isAll ? approverSeg === "all" : approverSeg === tile.key;
            return (
              <MotionMetricCard
                key={tile.key}
                label={tile.label}
                value={count}
                icon={Icon}
                iconTone={metricTileToneAt(i)}
                footer={tile.footer}
                footerBadge={tile.footerBadge}
                active={pressed}
                onClick={() => {
                  if (tile.key === "all") {
                    setApproverSeg("all");
                    return;
                  }
                  setApproverSeg(pressed ? "all" : tile.key);
                }}
                aria-pressed={pressed}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: reduceMotion ? 0 : i * 0.04,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            );
          })}
        </div>

        <div className="app-data-panel overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <TaskRegisterToolbar
            toolbarTitle="Register"
            searchRef={searchRef}
            query={q}
            onQueryChange={setQ}
            searchPlaceholder="Search project or IPP…"
            searchAriaLabel="Search approval queue"
            view={view}
            onViewChange={setView}
          />

          {view === "table" ? (
            <div className="overflow-x-auto">
              <table className="app-data-table-grid w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
                    <th className="w-11 p-3 text-center tabular-nums">Sl.</th>
                    <th className="p-3 text-left">Project</th>
                    <th className="p-3 text-left">IPP</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Stage</th>
                    <th className="p-3 text-left">SLA</th>
                    <th className="p-3 text-left">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p, i) => {
                    const stage = getApproverStage(p);
                    return (
                      <motion.tr
                        key={p.id}
                        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
                        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={{ delay: reduceMotion ? 0 : i * 0.02 }}
                        className="app-data-table-body-row transition"
                      >
                        <td className="p-3 text-center text-xs tabular-nums text-muted-foreground">
                          {(safePage - 1) * pageSize + i + 1}
                        </td>
                        <td className="p-3">
                          <Link
                            to="/approver/projects/$id"
                            params={{ id: p.id }}
                            className="font-medium hover:text-primary"
                          >
                            {p.name}
                          </Link>
                        </td>
                        <td className="p-3 text-muted-foreground">{p.ippName}</td>
                        <td className="p-3">
                          {p.type} · {p.capacityMW}MW
                        </td>
                        <td className="p-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                              STAGE_TONE[stage],
                            )}
                          >
                            {approverStageLabel(stage)}
                          </span>
                        </td>
                        <td className="p-3">
                          <SLABadge status={p.slaStatus} />
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {formatDate(p.slaDueDate)}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {paged.map((p, i) => {
                  const stage = getApproverStage(p);
                  const opp = db.getOpportunity(p.opportunityId);
                  const schemeCode = opp?.code?.trim() || "—";
                  const schemeRef = opp
                    ? resolveOpportunityReference(opp, db.listOpportunities())
                    : undefined;
                  return (
                    <motion.div
                      key={p.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: reduceMotion ? 0 : i * 0.03,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="h-full"
                    >
                      <RegisterProjectBrowseCard
                        project={p}
                        schemeCode={schemeCode}
                        schemeRef={schemeRef}
                        middle={
                          <div className="opp-browse-card-land">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                              Approver stage
                            </div>
                            <span
                              className={cn(
                                "mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                                STAGE_TONE[stage],
                              )}
                            >
                              {approverStageLabel(stage)}
                            </span>
                          </div>
                        }
                        footer={
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            <Button asChild className="group col-span-2 h-9 rounded-lg font-semibold">
                              <Link to="/approver/projects/$id" params={{ id: p.id }}>
                                <span className="flex items-center justify-center gap-1.5">
                                  Open project
                                  <ArrowRight
                                    className="size-3.5 transition-transform group-hover:translate-x-1"
                                    aria-hidden
                                  />
                                </span>
                              </Link>
                            </Button>
                          </div>
                        }
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {paged.length === 0 && (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground sm:px-5">
              No items in the approval queue match your search.
            </p>
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
