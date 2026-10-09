import { useMemo, useState } from "react"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import {
  BadgeCheck,
  Building2,
  Clock3,
  HandCoins,
  Percent,
  Wallet,
} from "lucide-react"
import { ExecutiveMetricTile } from "@/components/drilldown/companies-executive-panel"
import { FilterToolbar } from "@/components/drilldown/filter-toolbar"
import {
  PageHero,
  PageShell,
  SectionCard,
} from "@/components/drilldown/page-shell"
import { ReportSectionIntro } from "@/components/drilldown/report-shell"
import {
  financeMetricIds,
  getFinanceMetricDetail,
  type FinanceMetricId,
} from "@/data/finance-drilldown-data"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/finance/$metricId")({
  component: FinanceMetricDetailPage,
})

const metricIcons = {
  "available-fund": Wallet,
  "approved-liability": BadgeCheck,
  "previous-returns": HandCoins,
  "net-payable": Clock3,
  "equitable-ratio": Percent,
} as const

function FinanceMetricDetailPage() {
  const { metricId } = Route.useParams()
  const detail = getFinanceMetricDetail(metricId)
  if (!detail) throw notFound()

  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")

  const Icon = metricIcons[metricId as FinanceMetricId] ?? Wallet

  const filters = useMemo(
    () => [
      { value: "all", label: "All companies" },
      ...detail.rows.map((r) => ({
        value: r.id,
        label: r.title.split(" ")[0] ?? r.title,
      })),
    ],
    [detail.rows],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return detail.rows.filter((r) => {
      if (filter !== "all" && r.id !== filter) return false
      if (!q) return true
      return (
        r.title.toLowerCase().includes(q) ||
        r.subtitle.toLowerCase().includes(q)
      )
    })
  }, [detail.rows, filter, query])

  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow={detail.eyebrow}
        title={detail.metric.label}
        description={detail.description}
        icon={Icon}
        backTo="/"
        backLabel="Back to overview"
        accent={detail.accent}
      />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {detail.highlights.map((h, i) => (
          <ExecutiveMetricTile
            key={h.label}
            label={h.label}
            value={h.value}
            hint={h.hint}
            icon={Icon}
            color={h.color}
            soft={h.soft}
            style={{ animationDelay: `${i * 55}ms` }}
          />
        ))}
      </ul>

      <SectionCard className="stagger-in">
        <div className="mb-5 flex flex-col gap-4 border-b border-border/50 pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <ReportSectionIntro title={detail.sectionTitle} />
            <FilterToolbar
              search={query}
              onSearchChange={setQuery}
              searchPlaceholder="Search fraudulent entities…"
              searchLabel="Search fraudulent entities"
              filters={filters}
              filterValue={filter}
              onFilterChange={setFilter}
              filterLabel="Filter companies"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {financeMetricIds.map((id) => {
              const m = getFinanceMetricDetail(id)?.metric
              if (!m) return null
              const active = id === metricId
              return (
                <Link
                  key={id}
                  to="/finance/$metricId"
                  params={{ metricId: id }}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "text-white"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  style={active ? { background: detail.accent } : undefined}
                >
                  {m.label.split(" ").slice(0, 3).join(" ")}
                  {m.label.split(" ").length > 3 ? "…" : ""}
                </Link>
              )
            })}
          </div>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r, i) => {
            const cardClass = cn(
              "group relative flex h-full flex-col gap-1.5 overflow-hidden rounded-lg border border-black/[0.05] bg-card p-2.5 transition-colors",
              "hover:bg-muted/30 dark:border-white/[0.08] dark:bg-[#141c2c] dark:hover:bg-[#182233]",
            )

            const body = (
              <>
                <div className="flex items-center gap-2">
                  <div
                    className="flex size-7 shrink-0 items-center justify-center rounded-md text-white"
                    style={{
                      background: `linear-gradient(145deg, ${r.accent}, ${r.accent}cc)`,
                    }}
                  >
                    <Building2 className="size-3.5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {r.title}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {r.subtitle}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[8px] font-semibold tracking-wide text-muted-foreground uppercase">
                      {r.primaryLabel}
                    </p>
                    <p
                      className="font-display text-sm font-semibold tabular-nums leading-tight"
                      style={{ color: r.accent }}
                    >
                      {r.primary}
                    </p>
                  </div>
                </div>

                <div className="h-1 overflow-hidden rounded-full bg-muted/70 dark:bg-white/[0.06]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(Math.min(r.barPercent, 100), 4)}%`,
                      background: r.accent,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {r.secondaryLabel}{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {r.secondary}
                    </span>
                  </span>
                  {r.tertiary != null && (
                    <span className="shrink-0 text-muted-foreground">
                      {r.tertiaryLabel}{" "}
                      <span className="font-semibold tabular-nums text-foreground">
                        {r.tertiary}
                      </span>
                    </span>
                  )}
                </div>
              </>
            )

            return (
              <li
                key={r.id}
                className="stagger-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {r.companyId ? (
                  <Link
                    to="/companies/$companyId"
                    params={{ companyId: r.companyId }}
                    className={cardClass}
                  >
                    {body}
                  </Link>
                ) : (
                  <div className={cardClass}>{body}</div>
                )}
              </li>
            )
          })}
          {filtered.length === 0 && (
            <li className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground sm:col-span-2 lg:col-span-3">
              No rows match this search
            </li>
          )}
        </ul>
      </SectionCard>

    </PageShell>
  )
}
