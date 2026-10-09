import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  Banknote,
  IndianRupee,
  Landmark,
  Timer,
  XCircle,
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
import { getBankPaymentRows } from "@/data/report-data"
import { kpiLabels, programmeTotals } from "@/data/kpi-drilldown-data"
import { formatINR, formatNumber } from "@/lib/format"

export const Route = createFileRoute("/reports/payments")({
  component: PaymentReportPage,
})

const statusAccent = {
  Paid: "#16a34a",
  Queued: "#f59e0b",
  Processing: "#3b82f6",
  Failed: "#f43f5e",
} as const

function PaymentReportPage() {
  const rows = useMemo(() => getBankPaymentRows(), [])
  const [view, setView] = useState<EntityView>("table")
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")

  const filters = [
    { value: "all", label: "All statuses" },
    { value: "Paid", label: "Paid" },
    { value: "Queued", label: "Queued" },
    { value: "Processing", label: "Processing" },
    { value: "Failed", label: "Failed" },
  ]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false
      if (!q) return true
      return (
        r.name.toLowerCase().includes(q) ||
        r.claimId.toLowerCase().includes(q) ||
        r.utr.toLowerCase().includes(q) ||
        r.bank.toLowerCase().includes(q) ||
        r.customerId.toLowerCase().includes(q)
      )
    })
  }, [rows, filter, query])

  const stats = useMemo(() => {
    const paid = rows.filter((r) => r.status === "Paid")
    const queued = rows.filter((r) => r.status === "Queued")
    const failed = rows.filter((r) => r.status === "Failed")
    const paidAmount = paid.reduce((s, r) => s + r.amount, 0)
    return {
      paid: paid.length,
      queued: queued.length,
      failed: failed.length,
      paidAmount,
    }
  }, [rows])

  const metrics = [
    {
      id: "paid-amt",
      label: kpiLabels.settled,
      value: formatINR(programmeTotals.settled),
      hint: `${formatNumber(stats.paid)} sample credits in register`,
      icon: IndianRupee,
      color: "#16a34a",
      soft: "#dcfce7",
    },
    {
      id: "paid-n",
      label: "Paid transfers",
      value: formatNumber(stats.paid),
      hint: "UTR acknowledged by bank",
      icon: Banknote,
      color: "#0ea5e9",
      soft: "#e0f2fe",
    },
    {
      id: "queued",
      label: "Queued / processing",
      value: formatNumber(stats.queued + rows.filter((r) => r.status === "Processing").length),
      hint: "Waiting for bank acknowledgement",
      icon: Timer,
      color: "#f59e0b",
      soft: "#fef3c7",
    },
    {
      id: "failed",
      label: "Failed credits",
      value: formatNumber(stats.failed),
      hint: "Need re-push or account correction",
      icon: XCircle,
      color: "#f43f5e",
      soft: "#ffe4e6",
    },
  ] as const

  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow="CSMS · Detailed report"
        title="Bank payment report"
        description="Amounts disbursed to depositors with bank details and UTR references for reconciliation."
        icon={Landmark}
        backTo="/reports"
        backLabel="Back to detailed reports"
        accent="#0ea5e9"
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
            title="Payment register"
            countLabel={`${filtered.length} transfers`}
            description="Search by name, claim ID, bank, or UTR. Open the claim for full deposit context."
            accent="#0369a1"
            soft="#e0f2fe"
          />
          <FilterToolbar
            search={query}
            onSearchChange={setQuery}
            searchPlaceholder="Search name, UTR, bank…"
            searchLabel="Search payments"
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
                  accent={statusAccent[r.status]}
                  icon={Landmark}
                  title={r.name}
                  badge={r.status}
                  metrics={[
                    {
                      value: formatINR(r.amount, false),
                      label: "amount",
                      emphasize: true,
                    },
                    { value: r.bank, label: "bank" },
                    { value: r.utr, label: "UTR" },
                    { value: r.paidOn, label: "paid on" },
                  ]}
                />
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="rounded-md border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                No payments match this search
              </li>
            )}
          </ul>
        ) : (
          <EntityTable
            emptyLabel="No payments match this search"
            columns={[
              { key: "amount", header: "Amount", align: "right" },
              { key: "bank", header: "Bank", align: "left" },
              { key: "account", header: "Account", align: "right" },
              { key: "utr", header: "UTR", align: "right" },
              { key: "status", header: "Status", align: "right" },
            ]}
            rows={filtered.map((r) => ({
              id: r.id,
              to: "/claims/$claimId" as const,
              params: { claimId: r.claimRecordId },
              accent: statusAccent[r.status],
              icon: Landmark,
              title: r.name,
              subtitle: `${r.claimId} · ${r.paidOn}`,
              badge: r.status,
              cells: {
                amount: {
                  value: formatINR(r.amount, false),
                  emphasize: true,
                },
                bank: { value: r.bank },
                account: { value: r.accountMasked },
                utr: { value: r.utr },
                status: { value: r.status },
              },
            }))}
          />
        )}
      </SectionCard>

    </PageShell>
  )
}
