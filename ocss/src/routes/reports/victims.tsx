import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  IndianRupee,
  MapPin,
  Scale,
  UserRound,
  Users,
  Wallet,
} from "lucide-react"
import { ExecutiveMetricTile } from "@/components/drilldown/companies-executive-panel"
import { EntityCard } from "@/components/drilldown/entity-card"
import { EntityTable } from "@/components/drilldown/entity-table"
import { FilterToolbar } from "@/components/drilldown/filter-toolbar"
import {
  type EntityView,
  PageHero,
  PageShell,
  SectionCard,
  ViewToggle,
} from "@/components/drilldown/page-shell"
import { ReportSectionIntro } from "@/components/drilldown/report-shell"
import { getVictimReportRows } from "@/data/report-data"
import { formatINR, formatNumber } from "@/lib/format"

export const Route = createFileRoute("/reports/victims")({
  component: VictimReportPage,
})

function VictimReportPage() {
  const rows = useMemo(() => getVictimReportRows(), [])
  const [view, setView] = useState<EntityView>("table")
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")

  const districts = useMemo(
    () => [...new Set(rows.map((r) => r.district))].sort(),
    [rows],
  )

  const filters = useMemo(
    () => [
      { value: "all", label: "All districts" },
      ...districts.map((d) => ({ value: d, label: d })),
    ],
    [districts],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (filter !== "all" && r.district !== filter) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.customerId.toLowerCase().includes(q) ||
        r.pan.toLowerCase().includes(q) ||
        r.primaryCompany.toLowerCase().includes(q)
      )
    })
  }, [rows, filter, query])

  const totals = useMemo(() => {
    const invested = filtered.reduce((s, r) => s + r.invested, 0)
    const returns = filtered.reduce((s, r) => s + r.returnsTaken, 0)
    const outstanding = filtered.reduce((s, r) => s + r.outstanding, 0)
    return { invested, returns, outstanding }
  }, [filtered])

  const metrics = [
    {
      id: "victims",
      label: "Depositors in report",
      value: formatNumber(filtered.length),
      hint: "Registered depositor profiles",
      icon: Users,
      color: "#6366f1",
      soft: "#e0e7ff",
    },
    {
      id: "invested",
      label: "Total deposits",
      value: formatINR(totals.invested, false),
      hint: "Across listed depositors",
      icon: Wallet,
      color: "#f59e0b",
      soft: "#fef3c7",
    },
    {
      id: "returns",
      label: "Returns taken",
      value: formatINR(totals.returns, false),
      hint: "Already received from fraudulent entities",
      icon: IndianRupee,
      color: "#16a34a",
      soft: "#dcfce7",
    },
    {
      id: "owed",
      label: "Still outstanding",
      value: formatINR(totals.outstanding, false),
      hint: "Deposited minus returns received",
      icon: Scale,
      color: "#f43f5e",
      soft: "#ffe4e6",
    },
  ] as const

  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow="CSMS · Detailed report"
        title="Report by depositor"
        description="Depositor-wise claim exposure — deposits, returns already received, and outstanding settlement liability."
        icon={UserRound}
        backTo="/reports"
        backLabel="Back to detailed reports"
        accent="#6366f1"
      />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m, i) => (
          <ExecutiveMetricTile
            key={m.id}
            {...m}
            style={{ animationDelay: `${i * 55}ms` }}
          />
        ))}
      </ul>

      <SectionCard className="stagger-in">
        <div className="mb-5 flex flex-col gap-4 border-b border-border/50 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <ReportSectionIntro
            title="Depositor-wise details"
            countLabel={`${filtered.length} depositors`}
            description="Open a depositor to see schemes, fraudulent entities, and identity used for claim matching."
            accent="#4338ca"
            soft="#eef2ff"
          />
          <FilterToolbar
            search={query}
            onSearchChange={setQuery}
            searchPlaceholder="Search name, PAN, customer ID…"
            searchLabel="Search depositors"
            filters={filters}
            filterValue={filter}
            onFilterChange={setFilter}
            filterLabel="Filter by district"
            trailing={<ViewToggle view={view} onChange={setView} />}
          />
        </div>

        {view === "card" ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((r, i) => (
              <li
                key={r.id}
                className="stagger-in"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <EntityCard
                  layout="card"
                  to="/victims/$victimId"
                  params={{ victimId: r.victimId }}
                  accent={r.accent}
                  icon={UserRound}
                  title={r.name}
                  badge={r.district}
                  metrics={[
                    {
                      value: formatINR(r.outstanding, false),
                      label: "outstanding",
                      emphasize: true,
                    },
                    { value: formatINR(r.invested, false), label: "deposited" },
                    { value: formatINR(r.returnsTaken, false), label: "returns" },
                    { value: r.primaryCompany, label: "entity" },
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
              { key: "owed", header: "Outstanding", align: "right" },
              { key: "schemes", header: "Schemes", align: "right" },
            ]}
            rows={filtered.map((r) => ({
              id: r.id,
              to: "/victims/$victimId" as const,
              params: { victimId: r.victimId },
              accent: r.accent,
              icon: MapPin,
              title: r.name,
              subtitle: `${r.customerId} · ${r.primaryCompany}`,
              cells: {
                district: { value: r.district },
                deposited: { value: formatINR(r.invested, false) },
                returns: { value: formatINR(r.returnsTaken, false) },
                owed: {
                  value: formatINR(r.outstanding, false),
                  emphasize: true,
                },
                schemes: { value: String(r.schemes) },
              },
            }))}
          />
        )}
      </SectionCard>

    </PageShell>
  )
}
