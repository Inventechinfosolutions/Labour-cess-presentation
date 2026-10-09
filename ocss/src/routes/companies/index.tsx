import { useEffect, useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { Building2, Landmark } from "lucide-react"
import { feCompanies, kpiLabels } from "@/data/kpi-drilldown-data"
import { formatINR, formatNumber, formatPercent } from "@/lib/format"
import {
  CompaniesExecutivePanel,
  CompanyDirectoryIntro,
} from "@/components/drilldown/companies-executive-panel"
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

export const Route = createFileRoute("/companies/")({
  component: CompaniesPage,
})

const PAGE_SIZE = 4

const companyFilters = [
  { value: "all", label: "All" },
  ...feCompanies.map((c) => ({ value: c.id, label: c.shortName })),
]

function CompaniesPage() {
  const [view, setView] = useState<EntityView>("table")
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [page, setPage] = useState(1)

  const totalVictims = feCompanies.reduce((s, c) => s + c.victims, 0)
  const totalAmount = feCompanies.reduce((s, c) => s + c.totalAmount, 0)
  const totalRecovered = feCompanies.reduce((s, c) => s + c.recovered, 0)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return feCompanies.filter((c) => {
      if (filter !== "all" && c.id !== filter) return false
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) ||
        c.shortName.toLowerCase().includes(q)
      )
    })
  }, [filter, query])

  useEffect(() => {
    setPage(1)
  }, [filter, query])

  useEffect(() => {
    const max = getTotalPages(filtered.length, PAGE_SIZE)
    if (page > max) setPage(max)
  }, [filtered.length, page])

  const paged = useMemo(
    () => getPageItems(filtered, page, PAGE_SIZE),
    [filtered, page],
  )

  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow="Settlement · Karnataka"
        title={kpiLabels.fes}
        description="Fraudulent entities under the settlement programme — depositors, deposits, and asset recovery."
        icon={Landmark}
        backTo="/"
        accent="#3b82f6"
      />

      <CompaniesExecutivePanel
        totalVictims={totalVictims}
        totalAmount={totalAmount}
        totalRecovered={totalRecovered}
      />

      <SectionCard className="stagger-in">
        <div className="mb-5 flex flex-col gap-4 border-b border-border/50 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <CompanyDirectoryIntro
            count={filtered.length}
            totalAmount={
              filtered.reduce((s, c) => s + c.totalAmount, 0) || totalAmount
            }
          />
          <FilterToolbar
            search={query}
            onSearchChange={setQuery}
            searchPlaceholder="Search fraudulent entities…"
            searchLabel="Search fraudulent entities"
            filters={companyFilters}
            filterValue={filter}
            onFilterChange={setFilter}
            filterLabel="Filter fraudulent entities"
            trailing={<ViewToggle view={view} onChange={setView} />}
          />
        </div>

        {view === "card" ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paged.map((c, i) => {
              const recoveryPct =
                c.totalAmount > 0 ? (c.recovered / c.totalAmount) * 100 : 0
              return (
                <li
                  key={c.id}
                  className="stagger-in"
                  style={{ animationDelay: `${i * 55}ms` }}
                >
                  <EntityCard
                    layout="card"
                    to="/companies/$companyId"
                    params={{ companyId: c.id }}
                    accent={c.accent}
                    icon={Building2}
                    title={c.name}
                    badge={`${c.schemes.length} scheme${c.schemes.length === 1 ? "" : "s"}`}
                    metrics={[
                      {
                        value: formatINR(c.recovered),
                        label: "recovered",
                        emphasize: true,
                      },
                      { value: formatNumber(c.victims), label: "depositors" },
                      { value: formatINR(c.totalAmount), label: "deposited" },
                      {
                        value: formatPercent(recoveryPct),
                        label: "recovery",
                      },
                    ]}
                  />
                </li>
              )
            })}
            {filtered.length === 0 && (
              <li className="rounded-md border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                No fraudulent entities match this search
              </li>
            )}
          </ul>
        ) : (
          <EntityTable
            emptyLabel="No fraudulent entities match this search"
            columns={[
              { key: "schemes", header: "Schemes", align: "right" },
              { key: "victims", header: "Depositors", align: "right" },
              { key: "deposited", header: "Deposited", align: "right" },
              { key: "recovered", header: "Recovered", align: "right" },
              { key: "rate", header: "Rate", align: "right" },
            ]}
            rows={paged.map((c) => {
              const recoveryPct =
                c.totalAmount > 0 ? (c.recovered / c.totalAmount) * 100 : 0
              return {
                id: c.id,
                to: "/companies/$companyId" as const,
                params: { companyId: c.id },
                accent: c.accent,
                icon: Building2,
                title: c.name,
                subtitle: c.shortName,
                cells: {
                  schemes: { value: String(c.schemes.length) },
                  victims: { value: formatNumber(c.victims) },
                  deposited: { value: formatINR(c.totalAmount) },
                  recovered: {
                    value: formatINR(c.recovered),
                    emphasize: true,
                  },
                  rate: { value: formatPercent(recoveryPct) },
                },
              }
            })}
          />
        )}

        <ListPagination
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
        />
      </SectionCard>
    </PageShell>
  )
}
