import { useEffect, useMemo, useState } from "react"
import { createFileRoute, notFound } from "@tanstack/react-router"
import {
  Gem,
  MapPin,
  Users,
  Wallet,
} from "lucide-react"
import { ExecutiveMetricTile } from "@/components/drilldown/companies-executive-panel"
import { EntityCard } from "@/components/drilldown/entity-card"
import { EntityTable } from "@/components/drilldown/entity-table"
import { FilterToolbar } from "@/components/drilldown/filter-toolbar"
import {
  getPageItems,
  getTotalPages,
  ListPagination,
} from "@/components/drilldown/list-pagination"
import {
  type EntityView,
  PageHero,
  PageShell,
  SectionCard,
  ViewToggle,
} from "@/components/drilldown/page-shell"
import {
  findCompanyScheme,
  getSchemeDepositors,
} from "@/data/kpi-drilldown-data"
import { formatINR, formatNumber, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"

export const Route = createFileRoute(
  "/companies/$companyId/schemes/$schemeId",
)({
  component: SchemeDetailPage,
})

const PAGE_SIZE = 4

function SchemeDetailPage() {
  const { companyId, schemeId } = Route.useParams()
  const match = findCompanyScheme(companyId, schemeId)

  const [view, setView] = useState<EntityView>("table")
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [page, setPage] = useState(1)

  const depositors = useMemo(
    () =>
      match
        ? getSchemeDepositors(match.company.id, match.scheme.name)
        : [],
    [match],
  )

  const districts = useMemo(() => {
    const set = new Set(depositors.map((d) => d.district))
    return [...set].sort()
  }, [depositors])

  const districtFilters = useMemo(
    () => [
      { value: "all", label: "All districts" },
      ...districts.map((d) => ({ value: d, label: d })),
    ],
    [districts],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return depositors.filter((d) => {
      if (filter !== "all" && d.district !== filter) return false
      if (!q) return true
      return (
        d.name.toLowerCase().includes(q) ||
        d.customerId.toLowerCase().includes(q) ||
        d.pan.toLowerCase().includes(q) ||
        d.aadhaar.toLowerCase().includes(q) ||
        d.district.toLowerCase().includes(q)
      )
    })
  }, [depositors, filter, query])

  useEffect(() => {
    setPage(1)
  }, [filter, query, companyId, schemeId])

  useEffect(() => {
    setQuery("")
    setFilter("all")
    setView("table")
    setPage(1)
  }, [companyId, schemeId])

  useEffect(() => {
    const max = getTotalPages(filtered.length, PAGE_SIZE)
    if (page > max) setPage(max)
  }, [filtered.length, page])

  const paged = useMemo(
    () => getPageItems(filtered, page, PAGE_SIZE),
    [filtered, page],
  )

  if (!match) throw notFound()

  const { company, scheme } = match
  const sharePct =
    company.totalAmount > 0 ? (scheme.amount / company.totalAmount) * 100 : 0
  const totalDeposited = depositors.reduce((s, d) => s + d.invested, 0)
  const totalReturns = depositors.reduce((s, d) => s + d.returnsTaken, 0)

  const metrics = [
    {
      id: "depositors",
      label: "Depositors affected",
      value: formatNumber(scheme.investors),
      hint: "Depositors registered under this scheme",
      icon: Users,
      color: "#0ea5e9",
      soft: "#e0f2fe",
    },
    {
      id: "deposited",
      label: "Total deposited",
      value: formatINR(scheme.amount),
      hint: `${formatPercent(sharePct)} of ${company.shortName} exposure`,
      icon: Wallet,
      color: "#f59e0b",
      soft: "#fef3c7",
    },
    {
      id: "returns",
      label: "Returns received",
      value: formatINR(totalReturns),
      hint: `${formatINR(totalDeposited)} deposited under listed records`,
      icon: Gem,
      color: "#16a34a",
      soft: "#dcfce7",
    },
  ] as const

  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow={`${company.name} · Scheme`}
        title={scheme.name}
        description="Depositors affected by this scheme — search by name, PAN, Aadhaar, or district, then open a record for full deposit detail."
        icon={Gem}
        backTo="/companies/$companyId"
        backParams={{ companyId: company.id }}
        backLabel={company.name}
        accent={company.accent}
      />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((m, i) => (
          <ExecutiveMetricTile
            key={m.id}
            label={m.label}
            value={m.value}
            hint={m.hint}
            icon={m.icon}
            color={m.color}
            soft={m.soft}
            style={{ animationDelay: `${i * 55}ms` }}
          />
        ))}
      </ul>

      <SectionCard className="stagger-in">
        <div className="mb-5 flex flex-col gap-4 border-b border-border/50 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
                Depositors in this plan
              </h2>
              <span className="inline-flex items-center rounded-md bg-[#eff6ff] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#1d4ed8] uppercase dark:bg-[#1e3a5f]/50 dark:text-sky-300">
                {filtered.length} shown
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Depositor records for {scheme.name}. Totals above reflect
              the full scheme; this list shows depositors in the current view.
            </p>
          </div>
          <FilterToolbar
            search={query}
            onSearchChange={setQuery}
            searchPlaceholder="Search depositors…"
            searchLabel="Search depositors"
            filters={districtFilters}
            filterValue={filter}
            onFilterChange={setFilter}
            filterLabel="Filter by district"
            trailing={<ViewToggle view={view} onChange={setView} />}
          />
        </div>

        {view === "card" ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paged.map((d, i) => (
              <li
                key={d.id}
                className="stagger-in"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <EntityCard
                  layout="card"
                  to="/victims/$victimId"
                  params={{ victimId: d.id }}
                  accent={company.accent}
                  icon={Users}
                  title={d.name}
                  badge={d.district}
                  metrics={[
                    {
                      value: formatINR(d.invested, false),
                      label: "deposited",
                      emphasize: true,
                    },
                    {
                      value: formatINR(d.returnsTaken, false),
                      label: "returns",
                    },
                    { value: d.customerId, label: "customer" },
                    { value: d.pan, label: "PAN" },
                  ]}
                />
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="rounded-md border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                No depositors match this search
              </li>
            )}
          </ul>
        ) : (
          <EntityTable
            emptyLabel="No depositors match this search"
            columns={[
              { key: "district", header: "District", align: "left" },
              { key: "deposited", header: "Deposited", align: "right" },
              { key: "returns", header: "Returns", align: "right" },
              { key: "customer", header: "Customer ID", align: "right" },
            ]}
            rows={paged.map((d) => ({
              id: d.id,
              to: "/victims/$victimId" as const,
              params: { victimId: d.id },
              accent: company.accent,
              icon: Users,
              title: d.name,
              subtitle: d.pan,
              badge: d.district,
              cells: {
                district: { value: d.district },
                deposited: {
                  value: formatINR(d.invested, false),
                  emphasize: true,
                },
                returns: { value: formatINR(d.returnsTaken, false) },
                customer: { value: d.customerId },
              },
            }))}
          />
        )}

        <ListPagination
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
        />

        {filtered.length > 0 && (
          <p
            className={cn(
              "mt-3 flex items-center gap-1.5 text-xs text-muted-foreground",
            )}
          >
            <MapPin className="size-3.5" />
            Open a depositor to see full identity and all deposit records.
          </p>
        )}
      </SectionCard>
    </PageShell>
  )
}
