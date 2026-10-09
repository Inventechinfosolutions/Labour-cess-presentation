import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge, SLABadge } from "@/components/Bits";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
  DataListPaginationFooter,
  useDataListPagination,
  type DataListViewMode,
} from "@/components/DataListPage";
import { TaskRegisterToolbar } from "@/components/TaskRegisterToolbar";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { ippTechnologyMetricTone } from "@/lib/dashboard-kpi-icon";
import { pageLoadEpochMs } from "@/lib/dates";
import { formatOpportunityLandAddressReadOnly } from "@/lib/opportunity-land-display";
import { db, useSession, useDbVersion, formatDate, relativeTime } from "@/lib/hooks";
import type { Opportunity, Project, ProjectStatus } from "@/lib/types";
import { ArrowRight, Globe2, Layers2, ListChecks, Sun, Wind } from "lucide-react";
import { cn } from "@/lib/utils";

const MotionMetricCard = motion(AdminMetricCard);

type AppTypeFilter = "all" | Opportunity["type"];

const APP_TYPE_KPI_TILES = [
  {
    key: "all" as const,
    label: "All types",
    icon: Globe2,
    footerBadge: "Portfolio",
    footer: "Every application",
  },
  {
    key: "Solar" as const,
    label: "Solar",
    icon: Sun,
    footerBadge: "PV",
    footer: "Solar applications",
  },
  {
    key: "Wind" as const,
    label: "Wind",
    icon: Wind,
    footerBadge: "Onshore",
    footer: "Wind applications",
  },
  {
    key: "Hybrid" as const,
    label: "Hybrid",
    icon: Layers2,
    footerBadge: "Mixed",
    footer: "Hybrid applications",
  },
] as const;

export const Route = createFileRoute("/ipp/applications/")({
  head: () => ({ meta: [{ title: "My Applications — PMIS" }] }),
  component: Apps,
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
];

/** Same tonal variants as IPP Opportunities browse cards (`index.css`). */
function cardToneClass(type: Opportunity["type"]): string {
  if (type === "Wind") return "opp-browse-card--Wind";
  if (type === "Hybrid") return "opp-browse-card--Hybrid";
  return "opp-browse-card--Solar";
}

/** Progress fill width — milestones when active, otherwise status ladder. */
function applicationProgressPct(p: Project): number {
  if (p.milestones.length > 0) {
    const done = p.milestones.filter(
      (m) => m.status === "Verified" || m.status === "Completed",
    ).length;
    return Math.min(100, Math.round((done / Math.max(1, p.milestones.length)) * 100));
  }
  const ladder: Partial<Record<ProjectStatus, number>> = {
    Draft: 14,
    Submitted: 30,
    "Under Review": 46,
    "Query Raised": 54,
    Approved: 70,
    Rejected: 100,
    "In Execution": 84,
    Completed: 100,
    "Ready for Commissioning": 90,
    "Commissioning Submitted": 96,
    Commissioned: 100,
  };
  return ladder[p.status] ?? 38;
}

function Apps() {
  const user = useSession();
  useDbVersion();
  const reduceMotion = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [type, setType] = useState<AppTypeFilter>("all");
  const [view, setView] = useState<DataListViewMode>("table");

  const filtered = useMemo(() => {
    if (!user) return [];
    return db.listProjects({ ippId: user.id }).filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (type !== "all" && p.type !== type) return false;
      if (!q.trim()) return true;
      const s = q.toLowerCase();
      const ref = db.getOpportunity(p.opportunityId)?.referenceCode;
      return (
        p.name.toLowerCase().includes(s) ||
        p.opportunityName.toLowerCase().includes(s) ||
        (ref?.toLowerCase().includes(s) ?? false)
      );
    });
  }, [user, q, status, type]);

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

  const allMine = useMemo(
    () => (user ? db.listProjects({ ippId: user.id }) : []),
    [user],
  );

  const typeCounts = useMemo(() => {
    const c: Record<"all" | Opportunity["type"], number> = {
      all: allMine.length,
      Solar: 0,
      Wind: 0,
      Hybrid: 0,
    };
    for (const p of allMine) {
      if (p.type === "Solar") c.Solar++;
      else if (p.type === "Wind") c.Wind++;
      else if (p.type === "Hybrid") c.Hybrid++;
    }
    return c;
  }, [allMine]);

  if (!user) return null;

  return (
    <AppShell role="ipp">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="My Applications"
              count={filtered.length}
              description="Project applications and their review status — switch table or cards from the register toolbar, same as Opportunities."
            />
          }
        />

        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Applications by project type"
        >
          {APP_TYPE_KPI_TILES.map((tile, i) => {
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
            searchPlaceholder="Search project, scheme, or reference…"
            searchAriaLabel="Search applications"
            view={view}
            onViewChange={setView}
            filterSlot={
              <>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger
                    aria-label="Application status"
                    className={cn(
                      "h-10 w-auto min-w-[10.5rem] shrink-0 rounded-full border-border bg-background px-3 shadow-sm sm:min-w-[11rem]",
                      status !== "all" && "border-primary/35 ring-1 ring-primary/20",
                    )}
                  >
                    <ListChecks className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {STATUS_OPTIONS.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st === "all" ? "All statuses" : st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={type}
                  onValueChange={(v) => setType(v as AppTypeFilter)}
                >
                  <SelectTrigger
                    aria-label="Technology type"
                    className={cn(
                      "h-10 w-auto min-w-[10.5rem] shrink-0 rounded-full border-border bg-background px-3 shadow-sm sm:min-w-[12rem]",
                      type !== "all" && "border-primary/35 ring-1 ring-primary/20",
                    )}
                  >
                    <ListChecks className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
                    <SelectValue placeholder="Technology" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="Solar">Solar</SelectItem>
                    <SelectItem value="Wind">Wind</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </>
            }
          />

          {view === "table" ? (
            <div className="overflow-x-auto">
              <table className="app-data-table-grid w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
                    <th className="w-11 p-3 text-center tabular-nums">Sl.</th>
                    <th className="p-3 text-left">Project</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Stage</th>
                    <th className="p-3 text-left">SLA</th>
                    <th className="p-3 text-left">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((p, i) => {
                    const ref = db.getOpportunity(p.opportunityId)?.referenceCode;
                    return (
                      <motion.tr
                        key={p.id}
                        initial={reduceMotion ? false : { opacity: 0, y: -10 }}
                        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                        transition={{
                          delay: reduceMotion ? 0 : i * 0.02,
                        }}
                        className="app-data-table-body-row transition"
                      >
                        <td className="p-3 text-center text-xs tabular-nums text-muted-foreground">
                          {(safePage - 1) * pageSize + i + 1}
                        </td>
                        <td className="p-3">
                          <Link
                            to={
                              p.status === "Draft"
                                ? "/ipp/applications/$id"
                                : "/ipp/projects/$id"
                            }
                            params={{ id: p.id }}
                            className="font-medium text-primary hover:underline"
                          >
                            {p.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">
                            {p.opportunityName}
                          </div>
                          {ref ? (
                            <div className="mt-0.5 font-mono text-[11px] text-primary/90">
                              {ref}
                            </div>
                          ) : null}
                        </td>
                        <td className="p-3">{p.type}</td>
                        <td className="p-3">
                          <StatusBadge status={p.status} />
                        </td>
                        <td className="p-3 text-muted-foreground">{p.stage}</td>
                        <td className="p-3">
                          <SLABadge status={p.slaStatus} />
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {formatDate(p.slaDueDate)}
                          </div>
                        </td>
                        <td className="p-3 text-xs text-muted-foreground">
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
                {paged.map((project, i) => {
                  const opp = db.getOpportunity(project.opportunityId);
                  const ref = opp?.referenceCode;
                  const pct = applicationProgressPct(project);
                  const slaRemainingMs = Math.max(
                    0,
                    new Date(project.slaDueDate).getTime() - pageLoadEpochMs,
                  );
                  const daysToSla = Math.round(slaRemainingMs / 86400000);
                  const urgencyLabel =
                    slaRemainingMs <= 0
                      ? "SLA elapsed"
                      : daysToSla === 0
                        ? "Due today"
                        : daysToSla <= 3
                          ? `${daysToSla}d · act soon`
                          : `${daysToSla}d to SLA`;

                  const draftLink =
                    project.status === "Draft"
                      ? ("/ipp/applications/$id" as const)
                      : ("/ipp/projects/$id" as const);

                  return (
                    <motion.article
                      key={project.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: reduceMotion ? 0 : i * 0.035,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={cn("opp-browse-card group", cardToneClass(project.type))}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                            {opp?.code ?? "Scheme"}
                          </p>
                          {ref ? (
                            <p className="mt-0.5 font-mono text-[11px] font-semibold text-primary">
                              {ref}
                            </p>
                          ) : null}
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
                            project.type === "Solar" &&
                              "bg-amber-500/10 text-amber-900 ring-amber-500/25 dark:bg-amber-500/14 dark:text-amber-100",
                            project.type === "Wind" &&
                              "bg-sky-500/10 text-sky-900 ring-sky-500/25 dark:bg-sky-500/14 dark:text-sky-100",
                            project.type === "Hybrid" &&
                              "bg-violet-500/10 text-violet-900 ring-violet-500/25 dark:bg-violet-500/14 dark:text-violet-100",
                          )}
                        >
                          {project.type}
                        </span>
                      </div>

                      <h3 className="pr-1 text-[1.0625rem] font-bold leading-snug tracking-tight text-foreground sm:text-lg">
                        {project.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {project.state}
                        {project.district ? ` · ${project.district}` : ""} · {project.capacityMW} MW
                      </p>

                      <div className="opp-browse-card-land">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          {opp ? "Scheme land" : "Application site"}
                        </div>
                        <p className="mt-1 line-clamp-3 whitespace-pre-line text-[11.5px] leading-snug text-foreground/90">
                          {opp
                            ? formatOpportunityLandAddressReadOnly(opp)
                            : `${project.state}${project.district ? ` · ${project.district}` : ""}`}
                        </p>
                      </div>

                      <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">
                        {opp?.description?.trim()
                          ? opp.description
                          : `${project.status} — ${project.stage}`}
                      </p>

                      <div className="mt-1">
                        <div className="flex items-baseline justify-between text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground/80">Progress & SLA</span>
                          <span className="tabular-nums text-foreground/70">{urgencyLabel}</span>
                        </div>
                        <div className="opp-browse-progress-track mt-1.5">
                          <div className="opp-browse-progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">
                          SLA target{" "}
                          <span className="font-medium text-foreground">
                            {formatDate(project.slaDueDate)}
                          </span>
                          <span className="text-muted-foreground/90">
                            {" "}
                            · Updated {relativeTime(project.lastUpdated)}
                          </span>
                        </p>
                      </div>

                      <Link
                        to={draftLink}
                        params={{ id: project.id }}
                        className="opp-browse-card-cta"
                      >
                        {project.status === "Draft"
                          ? "Continue application"
                          : "Open application"}
                        <ArrowRight className="size-4 shrink-0" aria-hidden />
                      </Link>
                    </motion.article>
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
