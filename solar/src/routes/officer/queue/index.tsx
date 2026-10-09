import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  ClipboardList,
  ListChecks,
  ListTodo,
  MessageSquareWarning,
  Rocket,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { AppShell } from "@/components/AppShell";
import { StatusBadge, SLABadge } from "@/components/Bits";
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
  DataListFilterButton,
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
  DataListPaginationFooter,
  useDataListPagination,
  type DataListViewMode,
} from "@/components/DataListPage";
import { RegisterProjectBrowseCard } from "@/components/RegisterProjectBrowseCard";
import { TaskRegisterToolbar } from "@/components/TaskRegisterToolbar";
import { metricTileToneAt } from "@/lib/dashboard-kpi-icon";
import { db, useDbVersion, formatDate, relativeTime } from "@/lib/hooks";
import { resolveOpportunityReference } from "@/lib/opportunity-reference";
import { cn } from "@/lib/utils";

const MotionMetricCard = motion(AdminMetricCard);

type QueueSearch = { focus?: "review" };

export const Route = createFileRoute("/officer/queue/")({
  head: () => ({ meta: [{ title: "Application Queue — PMIS" }] }),
  validateSearch: (raw: Record<string, unknown>): QueueSearch => ({
    focus: raw.focus === "review" ? "review" : undefined,
  }),
  component: Queue,
});

const STATUS_FILTERS = [
  "All",
  "Submitted",
  "Under Review",
  "Query Raised",
  "In Execution",
  "Completed",
  "Rejected",
] as const;

type QueueBucket = "all" | "review" | "queryRaised" | "executionClosed";

const QUEUE_BUCKET_TILES: {
  key: QueueBucket;
  label: string;
  icon: typeof ListTodo;
  footerBadge: string;
  footer: string;
}[] = [
  {
    key: "all",
    label: "All stages",
    icon: ListTodo,
    footerBadge: "Queue",
    footer: "Every active application",
  },
  {
    key: "review",
    label: "In review",
    icon: ClipboardList,
    footerBadge: "Officer",
    footer: "Submitted & under review",
  },
  {
    key: "queryRaised",
    label: "Queries open",
    icon: MessageSquareWarning,
    footerBadge: "Clarify",
    footer: "Query raised status",
  },
  {
    key: "executionClosed",
    label: "Execution & outcomes",
    icon: Rocket,
    footerBadge: "Later",
    footer: "Execution, completed, rejected",
  },
];

function Queue() {
  const dbv = useDbVersion();
  const navigate = useNavigate();
  const { focus } = Route.useSearch();
  const reduceMotion = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("All");
  const [statusBucket, setStatusBucket] = useState<QueueBucket>("all");
  const [view, setView] = useState<DataListViewMode>("card");

  const applyStatusFilter = (s: string) => {
    navigate({ to: "/officer/queue", search: {} });
    setStatusBucket("all");
    setFilter(s);
  };

  const all = useMemo(
    () => db.listProjects().filter((p) => p.status !== "Draft"),
    [dbv],
  );

  const bucketCounts = useMemo(() => {
    let review = 0;
    let queryRaised = 0;
    let executionClosed = 0;
    for (const p of all) {
      if (["Submitted", "Under Review"].includes(p.status)) review++;
      else if (p.status === "Query Raised") queryRaised++;
      else if (["In Execution", "Completed", "Rejected"].includes(p.status)) executionClosed++;
    }
    return { all: all.length, review, queryRaised, executionClosed };
  }, [all]);

  const filtered = useMemo(() => {
    let rows = all;
    if (focus === "review") {
      rows = rows.filter((p) => ["Submitted", "Under Review"].includes(p.status));
    } else if (statusBucket === "review") {
      rows = rows.filter((p) => ["Submitted", "Under Review"].includes(p.status));
    } else if (statusBucket === "queryRaised") {
      rows = rows.filter((p) => p.status === "Query Raised");
    } else if (statusBucket === "executionClosed") {
      rows = rows.filter((p) =>
        ["In Execution", "Completed", "Rejected"].includes(p.status),
      );
    } else if (filter !== "All") {
      rows = rows.filter((p) => p.status === filter);
    }

    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter((p) => {
      const opp = db.getOpportunity(p.opportunityId);
      const schemeCode = opp?.code?.trim().toLowerCase() ?? "";
      const schemeRef =
        opp
          ? resolveOpportunityReference(opp, db.listOpportunities())
              ?.toLowerCase() ?? ""
        : "";
      return (
        p.name.toLowerCase().includes(s) ||
        p.ippName.toLowerCase().includes(s) ||
        p.opportunityName.toLowerCase().includes(s) ||
        schemeCode.includes(s) ||
        schemeRef.includes(s)
      );
    });
  }, [all, focus, filter, q, statusBucket]);

  const resetKey = `${q}\0${filter}\0${focus ?? ""}\0${statusBucket}`;
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

  const filterBadgeCount =
    (filter !== "All" ? 1 : 0) +
    (focus === "review" ? 0 : 0) +
    (statusBucket !== "all" ? 1 : 0);

  const description =
    focus === "review"
      ? "Opportunities under review (submitted or in officer review)"
      : "Applications across all active workflow stages";

  return (
    <AppShell role="officer">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="Application Queue"
              count={filtered.length}
              description={description}
            />
          }
        />

        {focus === "review" ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-2 text-sm">
            <span className="text-muted-foreground">
              Filtered from dashboard KPI
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                navigate({ to: "/officer/queue", search: {} });
                setStatusBucket("all");
              }}
            >
              Clear filter
            </Button>
          </div>
        ) : null}

        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Applications by workflow stage"
        >
          {QUEUE_BUCKET_TILES.map((tile, i) => {
            const Icon = tile.icon;
            const count = bucketCounts[tile.key];
            const isAll = tile.key === "all";
            const pressed =
              !isAll &&
              (tile.key === "review"
                ? focus === "review" || statusBucket === "review"
                : statusBucket === tile.key);
            const allPressed = isAll && focus !== "review" && statusBucket === "all";
            return (
              <MotionMetricCard
                key={tile.key}
                label={tile.label}
                value={count}
                icon={Icon}
                iconTone={metricTileToneAt(i)}
                footer={tile.footer}
                footerBadge={tile.footerBadge}
                active={isAll ? allPressed : pressed}
                onClick={() => {
                  if (tile.key === "all") {
                    navigate({ to: "/officer/queue", search: {} });
                    setStatusBucket("all");
                    setFilter("All");
                    return;
                  }
                  navigate({ to: "/officer/queue", search: {} });
                  const isPressed =
                    tile.key === "review"
                      ? statusBucket === "review"
                      : statusBucket === tile.key;
                  if (isPressed) {
                    setStatusBucket("all");
                    setFilter("All");
                  } else {
                    setStatusBucket(tile.key);
                    setFilter("All");
                  }
                }}
                aria-pressed={isAll ? allPressed : pressed}
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
            searchPlaceholder="Search project, IPP, code, ref…"
            searchAriaLabel="Search application queue"
            view={view}
            onViewChange={setView}
            filterSlot={
              <Popover>
                <PopoverTrigger asChild>
                  <DataListFilterButton activeCount={filterBadgeCount} />
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Filter results</p>
                    <div className="space-y-2">
                      <Label htmlFor="off-q-status" className="text-xs text-muted-foreground">
                        Status
                      </Label>
                      <Select value={filter} onValueChange={applyStatusFilter}>
                        <SelectTrigger
                          id="off-q-status"
                          className={cn(
                            "h-10 w-full rounded-full border-border bg-background px-3 shadow-sm",
                            filter !== "All" && "border-primary/35 ring-1 ring-primary/20",
                          )}
                          aria-label="Application status"
                        >
                          <ListChecks className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_FILTERS.map((st) => (
                            <SelectItem key={st} value={st}>
                              {st}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            }
          />

          {view === "table" ? (
            <div className="overflow-x-auto">
              <table className="app-data-table-grid w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
                    <th className="w-12 p-3 text-center tabular-nums">Sl.no</th>
                    <th className="p-3 text-left">Code</th>
                    <th className="p-3 text-left">REF</th>
                    <th className="p-3 text-left">Project</th>
                    <th className="p-3 text-left">IPP</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">SLA</th>
                    <th className="p-3 text-left">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p, i) => {
                    const opp = db.getOpportunity(p.opportunityId);
                    const schemeCode = opp?.code?.trim() || "—";
                    const schemeRef = opp
                      ? resolveOpportunityReference(opp, db.listOpportunities())
                      : undefined;
                    return (
                      <motion.tr
                        key={p.id}
                        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
                        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={{
                          delay: reduceMotion ? 0 : i * 0.015,
                        }}
                        className="app-data-table-body-row transition"
                      >
                        <td className="p-3 text-center tabular-nums text-muted-foreground">
                          {(safePage - 1) * pageSize + i + 1}
                        </td>
                        <td className="p-3 font-mono text-xs font-medium">
                          {schemeCode}
                        </td>
                        <td className="p-3 font-mono text-xs">
                          <span className="font-semibold text-primary">
                            {schemeRef ?? "—"}
                          </span>
                        </td>
                        <td className="p-3">
                          <Link
                            to="/officer/projects/$id"
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
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="p-3">
                          <SLABadge status={p.slaStatus} />
                          <div className="text-xs text-muted-foreground">
                            {formatDate(p.slaDueDate)}
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {relativeTime(p.lastUpdated)}
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
                        footer={
                          <div className="mt-1 grid grid-cols-2 gap-2">
                            <Button asChild className="group col-span-2 h-9 rounded-lg font-semibold">
                              <Link to="/officer/projects/$id" params={{ id: p.id }}>
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
              No applications match your search or filters.
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
