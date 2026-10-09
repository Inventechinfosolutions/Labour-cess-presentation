import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  ListChecks,
  MessageSquareWarning,
  ShieldAlert,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { AppShell } from "@/components/AppShell";
import { SLABadge, StatusBadge } from "@/components/Bits";
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
import { db, formatDate, useDbVersion } from "@/lib/hooks";
import { resolveOpportunityReference } from "@/lib/opportunity-reference";
import type { Project, Query, SLAStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const MotionMetricCard = motion(AdminMetricCard);

export const Route = createFileRoute("/officer/queries/")({
  head: () => ({ meta: [{ title: "Raised queries — PMIS" }] }),
  component: RaisedQueries,
});

type QueryRow = { project: Project; query: Query };

const SLA_FILTER: Array<SLAStatus | "all"> = [
  "all",
  "On Track",
  "At Risk",
  "Breached",
];

const QUERY_SLA_TILES: {
  key: SLAStatus | "all";
  label: string;
  icon: typeof Activity;
  footerBadge: string;
  footer: string;
}[] = [
  {
    key: "all",
    label: "All open queries",
    icon: MessageSquareWarning,
    footerBadge: "Register",
    footer: "Every open query row",
  },
  {
    key: "On Track",
    label: "On track",
    icon: Activity,
    footerBadge: "SLA",
    footer: "Within committed window",
  },
  {
    key: "At Risk",
    label: "At risk",
    icon: AlertTriangle,
    footerBadge: "Watch",
    footer: "SLA needs attention",
  },
  {
    key: "Breached",
    label: "Breached",
    icon: ShieldAlert,
    footerBadge: "Urgent",
    footer: "Past committed due date",
  },
];

function RaisedQueries() {
  const dbv = useDbVersion();
  const reduceMotion = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [slaFilter, setSlaFilter] = useState<string>("all");
  const [view, setView] = useState<DataListViewMode>("card");

  const baseRows = useMemo(() => {
    const all = db.listProjects();
    const projects = all.filter(
      (p) =>
        p.status === "Query Raised" ||
        p.queries.some((qu) => qu.status === "Open"),
    );
    const rows: QueryRow[] = [];
    for (const p of projects) {
      const open = p.queries.filter((qu) => qu.status === "Open");
      for (const query of open) {
        rows.push({ project: p, query });
      }
    }
    return rows;
  }, [dbv]);

  const slaCounts = useMemo(() => {
    const c: Record<SLAStatus | "all", number> = {
      all: baseRows.length,
      "On Track": 0,
      "At Risk": 0,
      Breached: 0,
    };
    for (const { project: p } of baseRows) {
      if (p.slaStatus === "On Track") c["On Track"]++;
      else if (p.slaStatus === "At Risk") c["At Risk"]++;
      else if (p.slaStatus === "Breached") c.Breached++;
    }
    return c;
  }, [baseRows]);

  const filtered = useMemo(() => {
    return baseRows.filter(({ project: p, query: qu }) => {
      if (slaFilter !== "all" && p.slaStatus !== slaFilter) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return (
        p.name.toLowerCase().includes(s) ||
        p.ippName.toLowerCase().includes(s) ||
        qu.message.toLowerCase().includes(s) ||
        qu.raisedBy.toLowerCase().includes(s)
      );
    });
  }, [baseRows, q, slaFilter]);

  const resetKey = `${q}\0${slaFilter}`;
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

  const filterBadgeCount = slaFilter !== "all" ? 1 : 0;

  return (
    <AppShell role="officer">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="Raised queries"
              count={filtered.length}
              description="Open officer queries — follow up in the project workspace until the IPP resolves or closes them"
            />
          }
        />

        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Queries by SLA posture"
        >
          {QUERY_SLA_TILES.map((tile, i) => {
            const Icon = tile.icon;
            const count = slaCounts[tile.key];
            const isAll = tile.key === "all";
            const pressed = isAll ? slaFilter === "all" : slaFilter === tile.key;
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
                    setSlaFilter("all");
                    return;
                  }
                  setSlaFilter(pressed ? "all" : tile.key);
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

        {baseRows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-primary/20 bg-muted/20 px-6 py-16 text-center">
            <MessageSquareWarning
              className="mx-auto size-10 text-muted-foreground opacity-60"
              aria-hidden
            />
            <p className="mt-4 text-sm font-medium text-foreground">
              No open queries
            </p>
            <p className="mx-auto mt-1 max-w-md text-xs text-muted-foreground">
              When you raise a query from a project review, it will appear here
              until the IPP resolves it or the query is closed.
            </p>
            <Link
              to="/officer"
              className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              ← Back to dashboard
            </Link>
          </div>
        ) : (
          <div className="app-data-panel overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <TaskRegisterToolbar
              toolbarTitle="Register"
              searchRef={searchRef}
              query={q}
              onQueryChange={setQ}
              searchPlaceholder="Search project, IPP, or query text…"
              searchAriaLabel="Search raised queries"
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
                        <Label htmlFor="off-q-sla" className="text-xs text-muted-foreground">
                          SLA
                        </Label>
                        <Select value={slaFilter} onValueChange={setSlaFilter}>
                          <SelectTrigger
                            id="off-q-sla"
                            className={cn(
                              "h-10 w-full rounded-full border-border bg-background px-3 shadow-sm",
                              slaFilter !== "all" && "border-primary/35 ring-1 ring-primary/20",
                            )}
                            aria-label="SLA status"
                          >
                            <ListChecks className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SLA_FILTER.map((st) => (
                              <SelectItem key={st} value={st}>
                                {st === "all" ? "All SLA states" : st}
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
                <table className="app-data-table-grid w-full min-w-[900px] text-sm">
                  <thead>
                    <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
                      <th className="w-11 p-3 text-center tabular-nums">Sl.</th>
                      <th className="p-3 text-left">Project</th>
                      <th className="p-3 text-left">IPP</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">SLA</th>
                      <th className="p-3 text-left">Due</th>
                      <th className="p-3 text-left">Query</th>
                      <th className="p-3 text-left">Raised</th>
                      <th className="w-28 p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(({ project: p, query: qu }, i) => (
                      <motion.tr
                        key={`${p.id}-${qu.id}`}
                        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
                        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={{
                          delay: reduceMotion ? 0 : i * 0.015,
                        }}
                        className="app-data-table-body-row transition"
                      >
                        <td className="p-3 text-center text-xs tabular-nums text-muted-foreground">
                          {(safePage - 1) * pageSize + i + 1}
                        </td>
                        <td className="p-3">
                          <Link
                            to="/officer/projects/$id"
                            params={{ id: p.id }}
                            className="font-medium text-primary hover:underline"
                          >
                            {p.name}
                          </Link>
                        </td>
                        <td className="p-3 text-muted-foreground">{p.ippName}</td>
                        <td className="p-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="p-3">
                          <SLABadge status={p.slaStatus} />
                        </td>
                        <td className="p-3 text-xs text-muted-foreground tabular-nums">
                          {formatDate(p.slaDueDate)}
                        </td>
                        <td className="max-w-xs p-3">
                          <p className="line-clamp-2 text-sm text-foreground">
                            {qu.message}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            By {qu.raisedBy}
                          </p>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(qu.raisedAt)}
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            to="/officer/projects/$id"
                            params={{ id: p.id }}
                            className="text-sm font-medium text-primary hover:underline"
                          >
                            Open
                          </Link>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 sm:p-6">
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {paged.map(({ project: p, query: qu }, i) => {
                    const opp = db.getOpportunity(p.opportunityId);
                    const schemeCode = opp?.code?.trim() || "—";
                    const schemeRef = opp
                      ? resolveOpportunityReference(opp, db.listOpportunities())
                      : undefined;
                    return (
                      <motion.div
                        key={`${p.id}-${qu.id}`}
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
                                Query · {qu.status}
                              </div>
                              <p className="mt-1 line-clamp-4 text-[11.5px] leading-relaxed text-foreground">
                                {qu.message}
                              </p>
                              <p className="mt-1 text-[11px] text-muted-foreground">
                                {formatDate(qu.raisedAt)} · {qu.raisedBy}
                              </p>
                            </div>
                          }
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
                No queries match your search or SLA filter.
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
        )}
      </DataListPageShell>
    </AppShell>
  );
}
