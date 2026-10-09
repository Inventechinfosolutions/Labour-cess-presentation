import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
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
  CirclePlus,
  Eye,
  FilePenLine,
  ListChecks,
  Pencil,
  Rocket,
} from "lucide-react";
import {
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
  DataListPaginationFooter,
  useDataListPagination,
  type DataListViewMode,
} from "@/components/DataListPage";
import { pageLoadEpochMs } from "@/lib/dates";
import { formatOpportunityLandAddressReadOnly, opportunityLandSearchBlob } from "@/lib/opportunity-land-display";
import { db, formatDate, useDbVersion } from "@/lib/hooks";
import type { Opportunity } from "@/lib/types";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { metricTileToneAt } from "@/lib/dashboard-kpi-icon";
import { cn } from "@/lib/utils";

const MotionMetricCard = motion(AdminMetricCard);

export const Route = createFileRoute("/admin/opportunities/")({
  head: () => ({ meta: [{ title: "Opportunities — PMIS" }] }),
  component: AO,
});

function AO() {
  const dbv = useDbVersion();
  const reduceMotion = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const listNewestFirst = useMemo(() => [...db.listOpportunities()].reverse(), [dbv]);
  const [view, setView] = useState<DataListViewMode>("card");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | Opportunity["status"]>("all");
  const [type, setType] = useState<"all" | Opportunity["type"]>("all");

  const filtered = useMemo(() => {
    return listNewestFirst.filter((o) => {
      if (status !== "all" && o.status !== status) return false;
      if (type !== "all" && o.type !== type) return false;
      if (q.trim()) {
        const s = q.toLowerCase();
        return (
          o.name.toLowerCase().includes(s) ||
          o.code.toLowerCase().includes(s) ||
          (o.referenceCode?.toLowerCase().includes(s) ?? false) ||
          o.state.toLowerCase().includes(s) ||
          o.district.toLowerCase().includes(s) ||
          opportunityLandSearchBlob(o).toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [listNewestFirst, q, status, type]);

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

  type StatusKpi = "all" | "Draft" | "Published" | "Closed";

  const counts = useMemo(() => {
    const c: Record<StatusKpi, number> = {
      all: listNewestFirst.length,
      Draft: 0,
      Published: 0,
      Closed: 0,
    };
    for (const o of listNewestFirst) c[o.status]++;
    return c;
  }, [listNewestFirst]);

  return (
    <AppShell role="admin">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="Opportunities"
              count={filtered.length}
              description="Manage opportunities from one register."
            />
          }
          right={
            <Button asChild className="h-10 gap-1.5">
              <Link to="/admin/opportunities/create">
                <CirclePlus className="size-4" aria-hidden />
                Create
              </Link>
            </Button>
          }
        />

        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Opportunity status summary"
        >
          {(
            [
              {
                key: "all",
                label: "All",
                icon: FilePenLine,
                footerBadge: "Register",
                footer: "Full scheme list",
              },
              {
                key: "Draft",
                label: "Draft",
                icon: Pencil,
                footerBadge: "Pre-publish",
                footer: "Not yet visible to IPPs",
              },
              {
                key: "Published",
                label: "Published",
                icon: Rocket,
                footerBadge: "Live",
                footer: "Open for applications",
              },
              {
                key: "Closed",
                label: "Closed",
                icon: Eye,
                footerBadge: "Archive",
                footer: "Closed to new intake",
              },
            ] as const
          ).map((tile, i) => {
            const Icon = tile.icon;
            const count = counts[tile.key as StatusKpi];
            const pressed = status === tile.key;
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
                onClick={() => setStatus(pressed ? "all" : (tile.key as Opportunity["status"] | "all"))}
                aria-pressed={pressed}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: reduceMotion ? 0 : i * 0.04, ease: [0.22, 1, 0.36, 1] }}
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
            searchPlaceholder="Search scheme, code, ref, location…"
            searchAriaLabel="Search opportunities"
            view={view}
            onViewChange={setView}
            filterSlot={
              <>
                <Select value={status} onValueChange={(v) => setStatus(v as "all" | Opportunity["status"])}>
                  <SelectTrigger
                    aria-label="Status filter"
                    className={cn(
                      "h-10 w-auto min-w-[10.5rem] shrink-0 rounded-full border-border bg-background px-3 shadow-sm",
                      status !== "all" && "border-primary/35 ring-1 ring-primary/20",
                    )}
                  >
                    <ListChecks className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={type} onValueChange={(v) => setType(v as "all" | Opportunity["type"])}>
                  <SelectTrigger
                    aria-label="Type filter"
                    className={cn(
                      "h-10 w-auto min-w-[10.5rem] shrink-0 rounded-full border-border bg-background px-3 shadow-sm",
                      type !== "all" && "border-primary/35 ring-1 ring-primary/20",
                    )}
                  >
                    <ListChecks className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
                    <SelectValue placeholder="Type" />
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
              <table className="app-data-table-grid w-full min-w-[960px] text-sm">
                <thead>
                  <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
                    <th className="w-11 px-2 py-3 text-center tabular-nums">Sl.</th>
                    <th className="px-3 py-3">Ref</th>
                    <th className="px-3 py-3">Scheme</th>
                    <th className="px-3 py-3">Location</th>
                    <th className="px-3 py-2.5">Type</th>
                    <th className="px-3 py-2.5">Capacity</th>
                    <th className="px-3 py-2.5">Closes</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((o, i) => (
                    <motion.tr
                      key={o.id}
                      initial={reduceMotion ? false : { opacity: 0, y: -10 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.2,
                        delay: reduceMotion ? 0 : i * 0.02,
                      }}
                      className="app-data-table-body-row transition"
                    >
                      <td className="w-11 px-2 py-3 text-center text-xs tabular-nums text-muted-foreground">
                        {(safePage - 1) * pageSize + i + 1}
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-primary">
                        {o.referenceCode ?? "—"}
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-foreground">{o.name}</div>
                        <div className="text-[11px] text-muted-foreground">{o.code}</div>
                      </td>
                      <td className="max-w-[220px] px-3 py-3 text-xs text-muted-foreground">
                        <span className="line-clamp-2">{formatOpportunityLandAddressReadOnly(o)}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={cn("opp-browse-table-type", o.type === "Solar" && "opp-browse-table-type--Solar", o.type === "Wind" && "opp-browse-table-type--Wind", o.type === "Hybrid" && "opp-browse-table-type--Hybrid")}>{o.type}</span>
                      </td>
                      <td className="px-3 py-3 tabular-nums text-muted-foreground">
                        {o.capacityMinMW != null && o.capacityMinMW > 0
                          ? `${o.capacityMinMW}–${o.capacityMW}`
                          : o.capacityMW}{" "}
                        MW
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {formatDate(o.endDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            o.status === "Published" && "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
                            o.status === "Draft" &&
                              "bg-muted text-muted-foreground",
                            o.status === "Closed" &&
                              "bg-secondary text-secondary-foreground",
                          )}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button asChild size="sm" variant="outline" className="h-8 rounded-lg">
                            <Link to="/admin/opportunities/edit/$id" params={{ id: o.id }}>
                              <Pencil className="mr-1.5 size-3.5" />
                              Edit
                            </Link>
                          </Button>
                          <Button asChild size="sm" className="h-8 rounded-lg">
                            <Link to="/admin/opportunities/$id" params={{ id: o.id }}>
                              View
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {paged.map((o, i) => {
                  const total = Math.max(1, new Date(o.endDate).getTime() - new Date(o.startDate).getTime());
                  const elapsed = Math.max(0, pageLoadEpochMs - new Date(o.startDate).getTime());
                  const pct = Math.min(100, Math.round((elapsed / total) * 100));
                  const daysLeft = Math.max(0, Math.round((new Date(o.endDate).getTime() - pageLoadEpochMs) / 86400000));
                  return (
                    <motion.article
                    key={o.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: reduceMotion ? 0 : i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                    className={cn("opp-browse-card group", o.type === "Wind" ? "opp-browse-card--Wind" : o.type === "Hybrid" ? "opp-browse-card--Hybrid" : "opp-browse-card--Solar")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{o.code}</p>
                        {o.referenceCode ? (
                          <p className="mt-0.5 font-mono text-[11px] font-semibold text-primary">{o.referenceCode}</p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1", o.type === "Solar" && "bg-amber-500/10 text-amber-900 ring-amber-500/25 dark:bg-amber-500/14 dark:text-amber-100", o.type === "Wind" && "bg-sky-500/10 text-sky-900 ring-sky-500/25 dark:bg-sky-500/14 dark:text-sky-100", o.type === "Hybrid" && "bg-violet-500/10 text-violet-900 ring-violet-500/25 dark:bg-violet-500/14 dark:text-violet-100")}>
                          {o.type}
                        </span>
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            o.status === "Published" && "bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
                            o.status === "Draft" && "bg-muted text-muted-foreground",
                            o.status === "Closed" && "bg-secondary text-secondary-foreground",
                          )}
                        >
                          {o.status}
                        </span>
                      </div>
                    </div>

                    <h3 className="pr-1 text-[1.0625rem] font-bold leading-snug tracking-tight text-foreground sm:text-lg">
                      {o.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {o.state}
                      {o.district ? ` · ${o.district}` : ""} · {o.capacityMW} MW
                    </p>

                    <div className="opp-browse-card-land">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Land</div>
                      <p className="mt-1 line-clamp-3 whitespace-pre-line text-[11.5px] leading-snug text-foreground/90">
                        {formatOpportunityLandAddressReadOnly(o)}
                      </p>
                    </div>

                    <div className="mt-1">
                      <div className="flex items-baseline justify-between text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground/80">Application window</span>
                        <span className="tabular-nums text-foreground/70">
                          {daysLeft === 0 ? "Closes today" : `${daysLeft}d left`}
                        </span>
                      </div>
                      <div className="opp-browse-progress-track mt-1.5">
                        <div className="opp-browse-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        Closes <span className="font-medium text-foreground">{formatDate(o.endDate)}</span>
                      </p>
                    </div>

                    <div className="mt-1 grid grid-cols-2 gap-2">
                      <Button asChild size="sm" variant="outline" className="h-9 rounded-lg">
                        <Link to="/admin/opportunities/edit/$id" params={{ id: o.id }}>
                          <Pencil className="mr-1.5 size-3.5" />
                          Edit
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="group h-9 rounded-lg font-semibold">
                        <Link to="/admin/opportunities/$id" params={{ id: o.id }}>
                          <span className="flex items-center gap-1.5">
                            View
                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
                          </span>
                        </Link>
                      </Button>
                    </div>
                  </motion.article>
                  );
                })}
              </div>
            </div>
          )}

          {paged.length === 0 && (
            <div className="px-4 py-16 text-center sm:px-6">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted ring-1 ring-border shadow-sm">
                <FilePenLine className="size-8 text-muted-foreground/80" aria-hidden />
              </div>
              <p className="text-base font-semibold text-foreground">No opportunities match</p>
              <p className="mt-1 max-w-md mx-auto text-sm text-muted-foreground">
                Try broadening your search or clearing filters.
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
