import { useMemo, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  Building2,
  IndianRupee,
  Percent,
  Scale,
  Wallet,
} from "lucide-react"
import { ExecutiveMetricTile } from "@/components/drilldown/companies-executive-panel"
import { EntityTable } from "@/components/drilldown/entity-table"
import { FilterToolbar } from "@/components/drilldown/filter-toolbar"
import {
  type EntityView,
  PageHero,
  PageShell,
  SectionCard,
  ViewToggle,
} from "@/components/drilldown/page-shell"
import { EntityCard } from "@/components/drilldown/entity-card"
import { ReportSectionIntro } from "@/components/drilldown/report-shell"
import { financialMetrics } from "@/data/dashboard-data"
import { feCompanies, kpiLabels } from "@/data/kpi-drilldown-data"
import { formatINR, formatNumber, formatPercent } from "@/lib/format"

export const Route = createFileRoute("/reports/settlement")({
  component: SettlementReportPage,
})

function SettlementReportPage() {
  const [view, setView] = useState<EntityView>("table")
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")

  const companyFilters = useMemo(
    () => [
      { value: "all", label: "All" },
      ...feCompanies.map((c) => ({ value: c.id, label: c.shortName })),
    ],
    [],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...feCompanies]
      .filter((c) => {
        if (filter !== "all" && c.id !== filter) return false
        if (!q) return true
        return (
          c.name.toLowerCase().includes(q) ||
          c.shortName.toLowerCase().includes(q)
        )
      })
      .sort((a, b) => b.liability - a.liability)
  }, [filter, query])

  const pool = useMemo(() => {
    const recovered = feCompanies.reduce((s, c) => s + c.recovered, 0)
    const settled = feCompanies.reduce((s, c) => s + c.settled, 0)
    const liability = feCompanies.reduce((s, c) => s + c.liability, 0)
    const remaining = Math.max(0, liability - settled)
    return { recovered, settled, liability, remaining }
  }, [])

  const cashReady = financialMetrics.find((m) => m.id === "available-fund")
  const equitable = financialMetrics.find((m) => m.id === "equitable-ratio")
  const netPayable = financialMetrics.find((m) => m.id === "net-payable")
  const approved = financialMetrics.find((m) => m.id === "approved-liability")
  const previousReturns = financialMetrics.find((m) => m.id === "previous-returns")

  const metrics = [
    {
      id: "approved",
      label: approved?.label ?? "Total Approved Settlement Amount",
      value: formatINR(approved?.value ?? 0),
      hint: "Across all fraudulent entities",
      icon: Wallet,
      color: "#3b82f6",
      soft: "#dbeafe",
    },
    {
      id: "returns",
      label: previousReturns?.label ?? "Amount Already Received by Depositors",
      value: formatINR(previousReturns?.value ?? 0),
      hint: "Pre-settlement payouts by fraudulent entities",
      icon: IndianRupee,
      color: "#16a34a",
      soft: "#dcfce7",
    },
    {
      id: "left",
      label: netPayable?.label ?? "Outstanding Settlement Liability",
      value: formatINR(netPayable?.value ?? pool.remaining),
      hint: "Approved liability yet to be funded",
      icon: Scale,
      color: "#f43f5e",
      soft: "#ffe4e6",
    },
    {
      id: "cash",
      label: cashReady?.label ?? "Funds Available for Immediate Settlement",
      value: formatINR(cashReady?.value ?? 0),
      hint: "Available for disbursement now",
      icon: Wallet,
      color: "#16a34a",
      soft: "#dcfce7",
    },
    {
      id: "ratio",
      label: equitable?.label ?? "Settlement Distribution Percentage",
      value: formatPercent(equitable?.value ?? 34.5),
      hint: "Current equitable distribution %",
      icon: Percent,
      color: "#0ea5e9",
      soft: "#e0f2fe",
    },
    {
      id: "gross",
      label: kpiLabels.liability,
      value: formatINR(pool.liability),
      hint: "Gross exposure across all entities",
      icon: Scale,
      color: "#f59e0b",
      soft: "#fef3c7",
    },
  ] as const

  const maxLiability = Math.max(...filtered.map((c) => c.liability), 1)

  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow="CSMS · Detailed report"
        title="Settlement report"
        description="How recovered funds are allocated across fraudulent entities and outstanding settlement liability to depositors."
        icon={Wallet}
        backTo="/reports"
        backLabel="Back to detailed reports"
        accent="#f59e0b"
      />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((m, i) => (
          <ExecutiveMetricTile
            key={m.id}
            {...m}
            style={{ animationDelay: `${i * 55}ms` }}
          />
        ))}
      </ul>

      <SectionCard className="stagger-in">
        <div className="mb-5 border-b border-border/50 pb-4">
          <ReportSectionIntro
            title="Liability vs disbursement by fraudulent entity"
            countLabel={`${filtered.length} entities`}
            description="Outstanding liability compared with amounts already disbursed to depositors."
            accent="#b45309"
            soft="#fef3c7"
          />
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c, i) => {
            const paidPct =
              c.liability > 0 ? (c.settled / c.liability) * 100 : 0
            return (
              <li
                key={c.id}
                className="stagger-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Link
                  to="/companies/$companyId"
                  params={{ companyId: c.id }}
                  className="group flex h-full flex-col rounded-md border border-black/[0.05] bg-white p-3.5 transition-all hover:border-amber-300/60 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-[#141c2c]"
                >
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ background: c.accent }}
                    />
                    <p className="truncate font-display text-sm font-semibold text-foreground">
                      {c.name}
                    </p>
                  </div>
                  <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 text-xs tabular-nums">
                    <span className="text-muted-foreground">
                      Liability{" "}
                      <span className="font-semibold text-foreground">
                        {formatINR(c.liability)}
                      </span>
                    </span>
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      {formatPercent(paidPct)} paid
                    </span>
                  </div>
                  <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted/70 dark:bg-white/[0.06]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(c.liability / maxLiability) * 100}%`,
                        background: `linear-gradient(90deg, ${c.accent}, ${c.accent}99)`,
                      }}
                    />
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </SectionCard>

      <SectionCard className="stagger-in">
        <div className="mb-5 flex flex-col gap-4 border-b border-border/50 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <ReportSectionIntro
            title="Fraudulent entity settlement ledger"
            countLabel={`${filtered.length} listed`}
            description="Recovered assets, paid amounts, and remaining liability."
            accent="#b45309"
            soft="#fef3c7"
          />
          <FilterToolbar
            search={query}
            onSearchChange={setQuery}
            searchPlaceholder="Search fraudulent entities…"
            searchLabel="Search fraudulent entities"
            filters={companyFilters}
            filterValue={filter}
            onFilterChange={setFilter}
            filterLabel="Filter companies"
            trailing={<ViewToggle view={view} onChange={setView} />}
          />
        </div>

        {view === "card" ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c, i) => (
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
                  badge={`${formatNumber(c.victims)} depositors`}
                  metrics={[
                    {
                      value: formatINR(c.settled),
                      label: "paid out",
                      emphasize: true,
                    },
                    { value: formatINR(c.recovered), label: "recovered" },
                    { value: formatINR(c.liability), label: "liability" },
                    {
                      value: formatINR(Math.max(0, c.liability - c.settled)),
                      label: "left",
                    },
                  ]}
                />
              </li>
            ))}
          </ul>
        ) : (
          <EntityTable
            emptyLabel="No companies match this search"
            columns={[
              { key: "recovered", header: "Recovered", align: "right" },
              { key: "paid", header: "Paid out", align: "right" },
              { key: "liability", header: "Liability", align: "right" },
              { key: "left", header: "Still left", align: "right" },
            ]}
            rows={filtered.map((c) => ({
              id: c.id,
              to: "/companies/$companyId" as const,
              params: { companyId: c.id },
              accent: c.accent,
              icon: Building2,
              title: c.name,
              subtitle: c.shortName,
              cells: {
                recovered: { value: formatINR(c.recovered) },
                paid: { value: formatINR(c.settled), emphasize: true },
                liability: { value: formatINR(c.liability) },
                left: {
                  value: formatINR(Math.max(0, c.liability - c.settled)),
                },
              },
            }))}
          />
        )}
      </SectionCard>

    </PageShell>
  )
}
