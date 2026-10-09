import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TaskRegisterToolbar } from "@/components/TaskRegisterToolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminMetricCard } from "@/components/AdminMetricCard";
import { ippTechnologyMetricTone } from "@/lib/dashboard-kpi-icon";
import { ArrowRight, Globe2, Layers2, ListChecks, Sun, Wind } from "lucide-react";
import {
  DataListPageHeaderRow,
  DataListPageHeading,
  DataListPageShell,
  DataListPaginationFooter,
  useDataListPagination,
  type DataListViewMode,
} from "@/components/DataListPage";
import { pageLoadEpochMs } from "@/lib/dates";
import {
  formatOpportunityLandAddressReadOnly,
  opportunityLandSearchBlob,
} from "@/lib/opportunity-land-display";
import { db, formatDate, useDbVersion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@/lib/types";

const MotionMetricCard = motion(AdminMetricCard);

export const Route = createFileRoute("/ipp/opportunities/")({
  head: () => ({ meta: [{ title: "Opportunities — PMIS" }] }),
  component: Opps,
});

type OppTypeFilter = "all" | Opportunity["type"];

type KpiKey = "all" | "Solar" | "Wind" | "Hybrid";

const KPI_DEF: {
  key: KpiKey;
  label: string;
  icon: typeof Globe2;
  footerBadge: string;
  footer: string;
}[] = [
  {
    key: "all",
    label: "All schemes",
    icon: Globe2,
    footerBadge: "Directory",
    footer: "Published schemes only",
  },
  {
    key: "Solar",
    label: "Solar",
    icon: Sun,
    footerBadge: "PV",
    footer: "Photovoltaic opportunities",
  },
  {
    key: "Wind",
    label: "Wind",
    icon: Wind,
    footerBadge: "Onshore",
    footer: "Wind generation focus",
  },
  {
    key: "Hybrid",
    label: "Hybrid",
    icon: Layers2,
    footerBadge: "Mixed",
    footer: "Solar + wind bundles",
  },
];

function cardToneClass(type: Opportunity["type"]): string {
  if (type === "Wind") return "opp-browse-card--Wind";
  if (type === "Hybrid") return "opp-browse-card--Hybrid";
  return "opp-browse-card--Solar";
}

function tableTypeClass(type: Opportunity["type"]): string {
  if (type === "Wind") return "opp-browse-table-type--Wind";
  if (type === "Hybrid") return "opp-browse-table-type--Hybrid";
  return "opp-browse-table-type--Solar";
}

function Opps() {
  const dbv = useDbVersion();
  const reduceMotion = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [type, setType] = useState<OppTypeFilter>("all");
  const [view, setView] = useState<DataListViewMode>("card");

  const published = useMemo(() => {
    return [...db.listOpportunities().filter((o) => o.status === "Published")].reverse();
  }, [dbv]);

  const counts = useMemo(() => {
    const c: Record<KpiKey, number> = {
      all: published.length,
      Solar: 0,
      Wind: 0,
      Hybrid: 0,
    };
    for (const o of published) {
      if (o.type === "Solar") c.Solar++;
      else if (o.type === "Wind") c.Wind++;
      else if (o.type === "Hybrid") c.Hybrid++;
    }
    return c;
  }, [published]);

  const filtered = useMemo(() => {
    return published
      .filter((o) => type === "all" || o.type === type)
      .filter((o) => {
        if (!q.trim()) return true;
        const s = q.toLowerCase();
        return (
          o.name.toLowerCase().includes(s) ||
          o.state.toLowerCase().includes(s) ||
          (o.referenceCode?.toLowerCase().includes(s) ?? false) ||
          opportunityLandSearchBlob(o).toLowerCase().includes(s)
        );
      });
  }, [published, q, type]);

  const resetKey = `${q}\0${type}`;
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

  return (
    <AppShell role="ipp">
      <DataListPageShell>
        <DataListPageHeaderRow
          left={
            <DataListPageHeading
              title="Opportunities"
              count={filtered.length}
              description="Curated renewable schemes open for application — refine by technology, search by location or reference, then open a scheme to apply."
            />
          }
        />

        <div
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Opportunities by technology"
        >
          {KPI_DEF.map((tile, i) => {
            const Icon = tile.icon;
            const count = counts[tile.key];
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
            toolbarTitle="Directory"
            searchRef={searchRef}
            query={q}
            onQueryChange={setQ}
            searchPlaceholder="Search name, state, ref, or land…"
            searchAriaLabel="Search opportunities"
            view={view}
            onViewChange={setView}
            filterSlot={
              <Select
                value={type}
                onValueChange={(v) => setType(v as OppTypeFilter)}
              >
                <SelectTrigger
                  aria-label="Technology filter"
                  className={cn(
                    "h-10 w-auto min-w-[10.75rem] shrink-0 rounded-full border-border bg-background px-3 shadow-sm sm:min-w-[12rem]",
                    type !== "all" && "border-primary/35 ring-1 ring-primary/20",
                  )}
                >
                  <ListChecks className="mr-2 size-4 shrink-0 opacity-70" aria-hidden />
                  <SelectValue placeholder="Technology" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="all">All technologies</SelectItem>
                  <SelectItem value="Solar">Solar</SelectItem>
                  <SelectItem value="Wind">Wind</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          {view === "table" ? (
            <div className="overflow-x-auto">
              <table className="app-data-table-grid w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="app-data-table-head-row text-left text-[0.6rem] font-semibold uppercase tracking-wider">
                    <th className="w-11 px-2 py-3 text-center tabular-nums">Sl.</th>
                    <th className="px-3 py-3">Ref</th>
                    <th className="px-3 py-3">Scheme</th>
                    <th className="px-3 py-3">Location</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-3 py-3">MW</th>
                    <th className="px-3 py-3">Closes</th>
                    <th className="px-3 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((o, i) => (
                    <motion.tr
                      key={o.id}
                      initial={reduceMotion ? false : { opacity: 0, y: -6 }}
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
                        <span className={cn("opp-browse-table-type", tableTypeClass(o.type))}>{o.type}</span>
                      </td>
                      <td className="px-3 py-3 tabular-nums text-muted-foreground">{o.capacityMW}</td>
                      <td className="px-3 py-3 text-muted-foreground">{formatDate(o.endDate)}</td>
                      <td className="px-3 py-3 text-right">
                        <Link
                          to="/ipp/opportunities/$id"
                          params={{ id: o.id }}
                          className="inline-flex items-center justify-end gap-1 text-sm font-semibold text-primary no-underline transition hover:underline"
                        >
                          View
                          <ArrowRight className="size-3.5 opacity-80" aria-hidden />
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
                {paged.map((o, i) => {
                  const total = Math.max(
                    1,
                    new Date(o.endDate).getTime() - new Date(o.startDate).getTime(),
                  );
                  const elapsed = Math.max(
                    0,
                    pageLoadEpochMs - new Date(o.startDate).getTime(),
                  );
                  const pct = Math.min(100, Math.round((elapsed / total) * 100));
                  const daysLeft = Math.max(
                    0,
                    Math.round(
                      (new Date(o.endDate).getTime() - pageLoadEpochMs) / 86400000,
                    ),
                  );
                  const urgencyLabel =
                    daysLeft === 0 ? "Closes today" : daysLeft <= 7 ? `${daysLeft}d left · closing soon` : `${daysLeft}d left`;

                  return (
                    <motion.article
                      key={o.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: reduceMotion ? 0 : i * 0.035,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className={cn("opp-browse-card group", cardToneClass(o.type))}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                            {o.code}
                          </p>
                          {o.referenceCode ? (
                            <p className="mt-0.5 font-mono text-[11px] font-semibold text-primary">
                              {o.referenceCode}
                            </p>
                          ) : null}
                        </div>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1",
                            o.type === "Solar" &&
                              "bg-amber-500/10 text-amber-900 ring-amber-500/25 dark:bg-amber-500/14 dark:text-amber-100",
                            o.type === "Wind" &&
                              "bg-sky-500/10 text-sky-900 ring-sky-500/25 dark:bg-sky-500/14 dark:text-sky-100",
                            o.type === "Hybrid" &&
                              "bg-violet-500/10 text-violet-900 ring-violet-500/25 dark:bg-violet-500/14 dark:text-violet-100",
                          )}
                        >
                          {o.type}
                        </span>
                      </div>

                      <h3 className="pr-1 text-[1.0625rem] font-bold leading-snug tracking-tight text-foreground sm:text-lg">
                        {o.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {o.state}
                        {o.district ? ` · ${o.district}` : ""} · {o.capacityMW} MW
                      </p>

                      <div className="opp-browse-card-land">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          Land
                        </div>
                        <p className="mt-1 line-clamp-3 whitespace-pre-line text-[11.5px] leading-snug text-foreground/90">
                          {formatOpportunityLandAddressReadOnly(o)}
                        </p>
                      </div>

                      <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">{o.description}</p>

                      <div className="mt-1">
                        <div className="flex items-baseline justify-between text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground/80">Application window</span>
                          <span className="tabular-nums text-foreground/70">{urgencyLabel}</span>
                        </div>
                        <div className="opp-browse-progress-track mt-1.5">
                          <div className="opp-browse-progress-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">
                          Closes <span className="font-medium text-foreground">{formatDate(o.endDate)}</span>
                        </p>
                      </div>

                      <Link
                        to="/ipp/opportunities/$id"
                        params={{ id: o.id }}
                        className="opp-browse-card-cta"
                      >
                        View scheme details
                        <ArrowRight className="size-4 shrink-0" aria-hidden />
                      </Link>
                    </motion.article>
                  );
                })}
              </div>
            </div>
          )}

          {paged.length === 0 && (
            <div className="px-4 py-16 text-center sm:px-6">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-muted ring-1 ring-border shadow-sm">
                <Globe2 className="size-8 text-muted-foreground/80" aria-hidden />
              </div>
              <p className="text-base font-semibold text-foreground">No schemes match</p>
              <p className="mt-1 max-w-md mx-auto text-sm text-muted-foreground">
                {published.length === 0
                  ? "There are no published opportunities right now."
                  : "Try a broader search or clear filters to see all published schemes."}
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
