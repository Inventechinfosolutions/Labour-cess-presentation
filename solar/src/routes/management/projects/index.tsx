import { createFileRoute, Link } from "@tanstack/react-router";
import { Eye, Globe2, Layers2, ListChecks, Sun, Wind } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { AppShell } from "@/components/AppShell";
import { SLABadge, StatusBadge } from "@/components/Bits";
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
import { Button } from "@/components/ui/button";
import { TaskRegisterToolbar } from "@/components/TaskRegisterToolbar";
import { RegisterProjectBrowseCard } from "@/components/RegisterProjectBrowseCard";
import { ippTechnologyMetricTone } from "@/lib/dashboard-kpi-icon";
import { db, useDbVersion } from "@/lib/hooks";
import { resolveOpportunityReference } from "@/lib/opportunity-reference";
import type { Opportunity, ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const MotionMetricCard = motion(AdminMetricCard);

export const Route = createFileRoute("/management/projects/")({
  head: () => ({ meta: [{ title: "All projects — PMIS" }] }),
  component: ProjectsPage,
});

const STATUS_OPTIONS: Array<ProjectStatus | "all"> = [
  "all",
  "Draft",
  "Submitted",
  "Under Review",
  "Query Raised",
  "Approved",
  "Rejected",
  "In Execution",
  "Completed",
  "Ready for Commissioning",
  "Commissioning Submitted",
  "Commissioned",
];

const PORTFOLIO_TYPE_TILES: {
  key: "all" | Opportunity["type"];
  label: string;
  icon: typeof Globe2;
  footerBadge: string;
  footer: string;
}[] = [
  {
    key: "all",
    label: "All types",
    icon: Globe2,
    footerBadge: "Portfolio",
    footer: "Whole programme register",
  },
  {
    key: "Solar",
    label: "Solar",
    icon: Sun,
    footerBadge: "PV",
    footer: "Solar projects",
  },
  {
    key: "Wind",
    label: "Wind",
    icon: Wind,
    footerBadge: "Onshore",
    footer: "Wind projects",
  },
  {
    key: "Hybrid",
    label: "Hybrid",
    icon: Layers2,
    footerBadge: "Mixed",
    footer: "Hybrid projects",
  },
];

function ProjectsPage() {
  const dbv = useDbVersion();
  const reduceMotion = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [view, setView] = useState<DataListViewMode>("card");

  const allProjects = useMemo(() => db.listProjects(), [dbv]);

  const typeCounts = useMemo(() => {
    const c: Record<"all" | Opportunity["type"], number> = {
      all: allProjects.length,
      Solar: 0,
      Wind: 0,
      Hybrid: 0,
    };
    for (const p of allProjects) {
      if (p.type === "Solar") c.Solar++;
      else if (p.type === "Wind") c.Wind++;
      else if (p.type === "Hybrid") c.Hybrid++;
    }
    return c;
  }, [allProjects]);

  const filtered = useMemo(() => {
    return db.listProjects().filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (type !== "all" && p.type !== type) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      return (
        p.name.toLowerCase().includes(s) ||
        p.ippName.toLowerCase().includes(s) ||
        p.opportunityName.toLowerCase().includes(s) ||
        p.state.toLowerCase().includes(s)
      );
    });
  }, [dbv, q, status, type]);

  const resetKey = `${q}\0${status}\0${type}`;
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
    (status !== "all" ? 1 : 0) + (type !== "all" ? 1 : 0);

  return (
    <AppShell role="management">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="All projects"
              count={filtered.length}
              description="Portfolio register — status, SLA, and geography"
            />
          }
        />

        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Projects by technology"
        >
          {PORTFOLIO_TYPE_TILES.map((tile, i) => {
            const Icon = tile.icon;
            const count = typeCounts[tile.key];
            const isAll = tile.key === "all";
            const pressed = isAll ? type === "all" : type === tile.key;
            return (
              <MotionMetricCard
                key={tile.key}
                label={tile.label}
                value={count}
                icon={Icon}
                iconTone={ippTechnologyMetricTone(tile.key)}
                footer={tile.footer}
                footerBadge={tile.footerBadge}
                active={pressed}
                onClick={() => {
                  if (tile.key === "all") setType("all");
                  else setType(pressed ? "all" : tile.key);
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
            searchPlaceholder="Search project, IPP, state…"
            searchAriaLabel="Search projects"
            view={view}
            onViewChange={setView}
            filterSlot={
              <>
                <Popover>
                  <PopoverTrigger asChild>
                    <DataListFilterButton activeCount={filterBadgeCount} />
                  </PopoverTrigger>
                  <PopoverContent className="w-80" align="end">
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Filter results</p>
                      <div className="space-y-2">
                        <Label htmlFor="mgmt-proj-status" className="text-xs text-muted-foreground">
                          Status
                        </Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger
                            id="mgmt-proj-status"
                            className={cn(
                              "h-10 w-full rounded-full border-border bg-background px-3 shadow-sm",
                              status !== "all" && "border-primary/35 ring-1 ring-primary/20",
                            )}
                            aria-label="Project status"
                          >
                            <ListChecks className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((st) => (
                              <SelectItem key={st} value={st}>
                                {st === "all" ? "All statuses" : st}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="mgmt-proj-type" className="text-xs text-muted-foreground">
                          Type
                        </Label>
                        <Select value={type} onValueChange={setType}>
                          <SelectTrigger
                            id="mgmt-proj-type"
                            className={cn(
                              "h-10 w-full rounded-full border-border bg-background px-3 shadow-sm",
                              type !== "all" && "border-primary/35 ring-1 ring-primary/20",
                            )}
                            aria-label="Technology type"
                          >
                            <ListChecks className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
                            <SelectValue />
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
                <Link
                  to="/management/analytics"
                  className="inline-flex h-10 shrink-0 items-center rounded-lg border border-border bg-background px-3 text-xs font-semibold text-primary shadow-sm ring-1 ring-border transition-colors hover:bg-accent"
                >
                  Analytics →
                </Link>
              </>
            }
          />

          {view === "table" ? (
            <div className="overflow-x-auto">
              <table className="app-data-table-grid w-full min-w-[800px] text-xs">
                <thead>
                  <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
                    <th className="w-11 px-3 py-2.5 text-center tabular-nums">
                      Sl.
                    </th>
                    <th className="px-4 py-2.5">Project</th>
                    <th className="px-3 py-2.5">IPP</th>
                    <th className="px-3 py-2.5">Type</th>
                    <th className="px-3 py-2.5">Capacity</th>
                    <th className="px-3 py-2.5">State</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-4 py-2.5">SLA</th>
                    <th className="w-12 px-2 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={reduceMotion ? false : { opacity: 0, y: -10 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{ delay: reduceMotion ? 0 : i * 0.02 }}
                      className="app-data-table-body-row transition"
                    >
                      <td className="px-3 py-3 text-center text-[11px] tabular-nums text-muted-foreground">
                        {(safePage - 1) * pageSize + i + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">
                        {p.name}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {p.ippName}
                      </td>
                      <td className="px-3 py-3">{p.type}</td>
                      <td className="px-3 py-3 tabular-nums text-muted-foreground">
                        {p.capacityMW} MW
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {p.state}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-4 py-3">
                        <SLABadge status={p.slaStatus} />
                      </td>
                      <td className="px-2 py-3 text-center">
                        <Button variant="ghost" size="icon" className="size-8 shrink-0" asChild title="View application">
                          <Link to="/management/projects/$id" params={{ id: p.id }}>
                            <Eye className="size-4" aria-hidden />
                            <span className="sr-only">View application</span>
                          </Link>
                        </Button>
                      </td>
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
                        footer={
                          <Button variant="outline" size="sm" className="w-full rounded-lg" asChild>
                            <Link to="/management/projects/$id" params={{ id: p.id }}>
                              <Eye className="mr-1.5 size-3.5" aria-hidden />
                              View
                            </Link>
                          </Button>
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
