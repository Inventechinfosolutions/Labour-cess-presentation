import { useEffect, useMemo, useState } from "react"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { Building2, Landmark } from "lucide-react"
import {
  CompanyDetailMetrics,
  CompanySchemesIntro,
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
import { feCompanies, schemeIdFromName } from "@/data/kpi-drilldown-data"
import { formatINR, formatNumber, formatPercent } from "@/lib/format"

export const Route = createFileRoute("/companies/$companyId/")({
  component: CompanyDetailPage,
})

const PAGE_SIZE = 4

function CompanyDetailPage() {
  const { companyId } = Route.useParams()
  const company = feCompanies.find((c) => c.id === companyId)

  const [view, setView] = useState<EntityView>("table")
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [page, setPage] = useState(1)

  const schemes = company?.schemes ?? []

  const schemeFilters = useMemo(
    () => [
      { value: "all", label: "All" },
      ...schemes.map((s, i) => ({
        value: s.name,
        label: `S${i + 1}`,
      })),
    ],
    [schemes],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return schemes.filter((s) => {
      if (filter !== "all" && s.name !== filter) return false
      if (!q) return true
      return s.name.toLowerCase().includes(q)
    })
  }, [schemes, filter, query])

  useEffect(() => {
    setPage(1)
  }, [filter, query, companyId])

  useEffect(() => {
    setQuery("")
    setFilter("all")
    setView("table")
    setPage(1)
  }, [companyId])

  useEffect(() => {
    const max = getTotalPages(filtered.length, PAGE_SIZE)
    if (page > max) setPage(max)
  }, [filtered.length, page])

  const paged = useMemo(
    () => getPageItems(filtered, page, PAGE_SIZE),
    [filtered, page],
  )

  if (!company) throw notFound()

  const filteredAmount =
    filtered.reduce((s, scheme) => s + scheme.amount, 0) || company.totalAmount

  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow="Settlement · Fraudulent entity"
        title={company.name}
        description="Depositors, deposits, asset recovery, and every scheme operated by this fraudulent entity under the settlement programme."
        icon={Landmark}
        backTo="/companies"
        backLabel="All fraudulent entities"
        accent={company.accent}
      />

      <CompanyDetailMetrics company={company} />

      <SectionCard className="stagger-in">
        <div className="mb-5 flex flex-col gap-4 border-b border-border/50 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <CompanySchemesIntro
            count={filtered.length}
            totalAmount={filteredAmount}
          />
          <FilterToolbar
            search={query}
            onSearchChange={setQuery}
            searchPlaceholder="Search schemes…"
            searchLabel="Search schemes"
            filters={schemeFilters}
            filterValue={filter}
            onFilterChange={setFilter}
            filterLabel="Filter schemes"
            trailing={<ViewToggle view={view} onChange={setView} />}
          />
        </div>

        {view === "card" ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paged.map((s, i) => {
              const sharePct =
                company.totalAmount > 0
                  ? (s.amount / company.totalAmount) * 100
                  : 0
              const schemeIndex =
                company.schemes.findIndex((x) => x.name === s.name) + 1
              return (
                <li
                  key={s.name}
                  className="stagger-in"
                  style={{ animationDelay: `${i * 55}ms` }}
                >
                  <EntityCard
                    layout="card"
                    to="/companies/$companyId/schemes/$schemeId"
                    params={{
                      companyId: company.id,
                      schemeId: schemeIdFromName(s.name),
                    }}
                    accent={company.accent}
                    icon={Building2}
                    title={s.name}
                    badge={`Scheme ${schemeIndex}`}
                    metrics={[
                      {
                        value: formatNumber(s.investors),
                        label: "depositors affected",
                        emphasize: true,
                      },
                      {
                        value: formatINR(s.amount),
                        label: "deposited",
                      },
                      {
                        value: formatPercent(sharePct),
                        label: "of total",
                      },
                    ]}
                  />
                </li>
              )
            })}
            {filtered.length === 0 && (
              <li className="rounded-md border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                No schemes match this search
              </li>
            )}
          </ul>
        ) : (
          <EntityTable
            emptyLabel="No schemes match this search"
            columns={[
              { key: "depositors", header: "Depositors", align: "right" },
              { key: "deposited", header: "Deposited", align: "right" },
              { key: "share", header: "Share", align: "right" },
            ]}
            rows={paged.map((s) => {
              const sharePct =
                company.totalAmount > 0
                  ? (s.amount / company.totalAmount) * 100
                  : 0
              const schemeIndex =
                company.schemes.findIndex((x) => x.name === s.name) + 1
              return {
                id: s.name,
                to: "/companies/$companyId/schemes/$schemeId" as const,
                params: {
                  companyId: company.id,
                  schemeId: schemeIdFromName(s.name),
                },
                accent: company.accent,
                icon: Building2,
                title: s.name,
                subtitle: `${formatNumber(s.investors)} depositors affected · Scheme ${schemeIndex}`,
                cells: {
                  depositors: {
                    value: formatNumber(s.investors),
                    emphasize: true,
                  },
                  deposited: { value: formatINR(s.amount) },
                  share: { value: formatPercent(sharePct) },
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
