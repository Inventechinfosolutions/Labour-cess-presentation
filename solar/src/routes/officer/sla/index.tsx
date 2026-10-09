import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  LayoutGrid,
  ListChecks,
  ShieldAlert,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { AppShell } from "@/components/AppShell";
import { SLABadge } from "@/components/Bits";
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
import { db, useDbVersion, formatDate } from "@/lib/hooks";
import { resolveOpportunityReference } from "@/lib/opportunity-reference";
import type { SLAStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const MotionMetricCard = motion(AdminMetricCard);

type SlaSearch = { focus?: "at-risk" | "breached" };

export const Route = createFileRoute("/officer/sla/")({
  head: () => ({ meta: [{ title: "SLA Tracking — PMIS" }] }),
  validateSearch: (raw: Record<string, unknown>): SlaSearch => {
    const f = raw.focus;
    if (f === "at-risk") return { focus: "at-risk" };
    if (f === "breached") return { focus: "breached" };
    return {};
  },
  component: SLA,
});

const SLA_OPTIONS: Array<SLAStatus | "all"> = [
  "all",
  "On Track",
  "At Risk",
  "Breached",
];

const SLA_TRACK_TILES: {
  key: SLAStatus | "all";
  label: string;
  icon: typeof LayoutGrid;
  footerBadge: string;
  footer: string;
}[] = [
  {
    key: "all",
    label: "All active",
    icon: LayoutGrid,
    footerBadge: "Portfolio",
    footer: "Sorted by due date",
  },
  {
    key: "On Track",
    label: "On track",
    icon: Activity,
    footerBadge: "SLA",
    footer: "Within window",
  },
  {
    key: "At Risk",
    label: "At risk",
    icon: AlertTriangle,
    footerBadge: "Watch",
    footer: "Needs attention",
  },
  {
    key: "Breached",
    label: "Breached",
    icon: ShieldAlert,
    footerBadge: "Urgent",
    footer: "Past due date",
  },
];

function SLA() {
  const dbv = useDbVersion();
  const navigate = useNavigate();
  const { focus } = Route.useSearch();
  const reduceMotion = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [slaFilter, setSlaFilter] = useState<string>("all");
  const [view, setView] = useState<DataListViewMode>("card");

  const base = useMemo(
    () =>
      db
        .listProjects()
        .filter(
          (p) =>
            p.status !== "Draft" &&
            p.status !== "Approved" &&
            p.status !== "Completed",
        ),
    [dbv],
  );

  const slaCounts = useMemo(() => {
    const c: Record<SLAStatus | "all", number> = {
      all: base.length,
      "On Track": 0,
      "At Risk": 0,
      Breached: 0,
    };
    for (const p of base) {
      if (p.slaStatus === "On Track") c["On Track"]++;
      else if (p.slaStatus === "At Risk") c["At Risk"]++;
      else if (p.slaStatus === "Breached") c.Breached++;
    }
    return c;
  }, [base]);

  const filtered = useMemo(() => {
    let rows = base;
    if (focus === "at-risk") {
      rows = rows.filter((p) => p.slaStatus === "At Risk");
    } else if (focus === "breached") {
      rows = rows.filter((p) => p.slaStatus === "Breached");
    } else if (slaFilter !== "all") {
      rows = rows.filter((p) => p.slaStatus === slaFilter);
    }

    if (!q.trim()) {
      return [...rows].sort(
        (a, b) =>
          new Date(a.slaDueDate).getTime() - new Date(b.slaDueDate).getTime(),
      );
    }
    const s = q.toLowerCase();
    return rows
      .filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.ippName.toLowerCase().includes(s) ||
          p.stage.toLowerCase().includes(s) ||
          p.opportunityName.toLowerCase().includes(s),
      )
      .sort(
        (a, b) =>
          new Date(a.slaDueDate).getTime() - new Date(b.slaDueDate).getTime(),
      );
  }, [base, focus, slaFilter, q]);

  const resetKey = `${q}\0${slaFilter}\0${focus ?? ""}`;
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
    focus ? 0 : slaFilter !== "all" ? 1 : 0;

  const description =
    focus === "at-risk"
      ? "Projects with SLA at risk (from dashboard)"
      : focus === "breached"
        ? "Projects with SLA breached (from dashboard)"
        : "Active projects sorted by SLA due date";

  return (
    <AppShell role="officer">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="SLA Tracking"
              count={filtered.length}
              description={description}
            />
          }
        />

        {focus ? (
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
                navigate({ to: "/officer/sla", search: {} });
                setSlaFilter("all");
              }}
            >
              Clear filter
            </Button>
          </div>
        ) : null}

        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Projects by SLA status"
        >
          {SLA_TRACK_TILES.map((tile, i) => {
            const Icon = tile.icon;
            const count = slaCounts[tile.key];
            const isAll = tile.key === "all";
            const pressed = isAll
              ? !focus && slaFilter === "all"
              : focus === "at-risk"
                ? tile.key === "At Risk"
                : focus === "breached"
                  ? tile.key === "Breached"
                  : slaFilter === tile.key;
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
                  navigate({ to: "/officer/sla", search: {} });
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

        <div className="app-data-panel overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <TaskRegisterToolbar
            toolbarTitle="Register"
            searchRef={searchRef}
            query={q}
            onQueryChange={setQ}
            searchPlaceholder="Search project, IPP, stage…"
            searchAriaLabel="Search SLA list"
            view={view}
            onViewChange={setView}
            filterSlot={
              !focus ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <DataListFilterButton activeCount={filterBadgeCount} />
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Filter results</p>
                      <div className="space-y-2">
                        <Label htmlFor="off-sla-status" className="text-xs text-muted-foreground">
                          SLA status
                        </Label>
                        <Select value={slaFilter} onValueChange={setSlaFilter}>
                          <SelectTrigger
                            id="off-sla-status"
                            className={cn(
                              "h-10 w-full rounded-full border-border bg-background px-3 shadow-sm",
                              slaFilter !== "all" && "border-primary/35 ring-1 ring-primary/20",
                            )}
                            aria-label="SLA status filter"
                          >
                            <ListChecks className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SLA_OPTIONS.map((st) => (
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
              ) : undefined
            }
          />

          {view === "table" ? (
            <div className="overflow-x-auto">
              <table className="app-data-table-grid w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
                    <th className="w-11 p-3 text-center tabular-nums">Sl.</th>
                    <th className="p-3 text-left">Project</th>
                    <th className="p-3 text-left">IPP</th>
                    <th className="p-3 text-left">SLA</th>
                    <th className="p-3 text-left">Due date</th>
                    <th className="p-3 text-left">Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={reduceMotion ? false : { opacity: 0, y: -10 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{ delay: reduceMotion ? 0 : i * 0.015 }}
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
                        <div className="text-xs text-muted-foreground">
                          {p.opportunityName}
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{p.ippName}</td>
                      <td className="p-3">
                        <SLABadge status={p.slaStatus} />
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {formatDate(p.slaDueDate)}
                      </td>
                      <td className="p-3 text-muted-foreground">{p.stage}</td>
                    </motion.tr>
                  ))}
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
                        middle={
                          <div className="opp-browse-card-land">
                            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                              Stage
                            </div>
                            <p className="mt-1 text-[11.5px] font-medium leading-snug text-foreground">{p.stage}</p>
                            <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{p.opportunityName}</p>
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
              No projects match your search or filters.
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
