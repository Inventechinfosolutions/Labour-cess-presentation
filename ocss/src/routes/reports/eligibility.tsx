import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  BadgeCheck,
  ClipboardCheck,
  FileStack,
  Hourglass,
  ShieldX,
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
import { eligibilityOutcomes } from "@/data/dashboard-data"
import {
  type EligibilityStatus,
  getEligibilityReportRows,
} from "@/data/report-data"
import { formatINR, formatNumber } from "@/lib/format"

export const Route = createFileRoute("/reports/eligibility")({
  component: EligibilityReportPage,
})

const statusColor: Record<EligibilityStatus, string> = {
  Eligible: "#16a34a",
  "Not eligible": "#f43f5e",
  "Under assessment": "#f59e0b",
  "Documents pending": "#3b82f6",
}

function EligibilityReportPage() {
  const rows = useMemo(() => getEligibilityReportRows(), [])
  const [view, setView] = useState<EntityView>("table")
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")

  const filters = [
    { value: "all", label: "All statuses" },
    { value: "Eligible", label: "Eligible" },
    { value: "Not eligible", label: "Not eligible" },
    { value: "Under assessment", label: "Under assessment" },
    { value: "Documents pending", label: "Documents pending" },
  ]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.claimId.toLowerCase().includes(q) ||
        r.customerId.toLowerCase().includes(q) ||
        r.company.toLowerCase().includes(q)
      )
    })
  }, [rows, filter, query])

  const rowCounts = useMemo(() => {
    const eligible = rows.filter((r) => r.status === "Eligible").length
    const notEligible = rows.filter((r) => r.status === "Not eligible").length
    const waiting = rows.filter(
      (r) =>
        r.status === "Under assessment" || r.status === "Documents pending",
    ).length
    return { eligible, notEligible, waiting }
  }, [rows])

  const metrics = [
    {
      id: "eligible",
      label: eligibilityOutcomes[0].label,
      value: formatNumber(eligibilityOutcomes[0].count),
      hint: `${rowCounts.eligible} in current view · ${eligibilityOutcomes[0].hint}`,
      icon: BadgeCheck,
      color: "#16a34a",
      soft: "#dcfce7",
    },
    {
      id: "not",
      label: eligibilityOutcomes[1].label,
      value: formatNumber(eligibilityOutcomes[1].count),
      hint: `${rowCounts.notEligible} in current view · ${eligibilityOutcomes[1].hint}`,
      icon: ShieldX,
      color: "#f43f5e",
      soft: "#ffe4e6",
    },
    {
      id: "waiting",
      label: eligibilityOutcomes[2].label,
      value: formatNumber(eligibilityOutcomes[2].count),
      hint: `${rowCounts.waiting} in current view · ${eligibilityOutcomes[2].hint}`,
      icon: Hourglass,
      color: "#f59e0b",
      soft: "#fef3c7",
    },
    {
      id: "listed",
      label: "Claims in this view",
      value: formatNumber(filtered.length),
      hint: "Claims shown in the current filter",
      icon: FileStack,
      color: "#22c55e",
      soft: "#dcfce7",
    },
  ] as const

  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow="CSMS · Detailed report"
        title="Eligibility report"
        description="Who is eligible for settlement, who is not, and what is still pending officer assessment."
        icon={ClipboardCheck}
        backTo="/reports"
        backLabel="Back to detailed reports"
        accent="#22c55e"
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
            title="Claim eligibility register"
            countLabel={`${filtered.length} claims`}
            description="Filter by outcome status. Open a claim for deposits behind the assessment."
            accent="#15803d"
            soft="#dcfce7"
          />
          <FilterToolbar
            search={query}
            onSearchChange={setQuery}
            searchPlaceholder="Search claim, name, customer…"
            searchLabel="Search claims"
            filters={filters}
            filterValue={filter}
            onFilterChange={setFilter}
            filterLabel="Filter by status"
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
                  to="/claims/$claimId"
                  params={{ claimId: r.claimRecordId }}
                  accent={statusColor[r.status]}
                  icon={ClipboardCheck}
                  title={r.name}
                  badge={r.status}
                  metrics={[
                    {
                      value: formatINR(r.claimAmount, false),
                      label: "claim amount",
                      emphasize: true,
                    },
                    { value: r.claimId, label: "claim ID" },
                    { value: r.company, label: "entity" },
                    { value: r.district, label: "district" },
                  ]}
                />
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="rounded-md border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                No claims match this search
              </li>
            )}
          </ul>
        ) : (
          <EntityTable
            emptyLabel="No claims match this search"
            columns={[
              { key: "status", header: "Status", align: "left" },
              { key: "amount", header: "Claim amount", align: "right" },
              { key: "company", header: "Fraudulent entity", align: "left" },
              { key: "district", header: "District", align: "left" },
            ]}
            rows={filtered.map((r) => ({
              id: r.id,
              to: "/claims/$claimId" as const,
              params: { claimId: r.claimRecordId },
              accent: statusColor[r.status],
              icon: ClipboardCheck,
              title: r.name,
              subtitle: r.claimId,
              badge: r.status,
              cells: {
                status: { value: r.status },
                amount: {
                  value: formatINR(r.claimAmount, false),
                  emphasize: true,
                },
                company: { value: r.company },
                district: { value: r.district },
              },
            }))}
          />
        )}
      </SectionCard>

    </PageShell>
  )
}
