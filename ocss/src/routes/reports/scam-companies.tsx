import { useMemo, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import {
  Building2,
  IndianRupee,
  FileBarChart2,
  Scale,
  Users,
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
import { feCompanies } from "@/data/kpi-drilldown-data"
import { formatINR, formatNumber, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/reports/scam-companies")({
  component: ScamCompanyReportPage,
})

function ScamCompanyReportPage() {
  const [view, setView] = useState<EntityView>("table")
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")

  const totals = useMemo(() => {
    const victims = feCompanies.reduce((s, c) => s + c.victims, 0)
    const claims = feCompanies.reduce((s, c) => s + c.claims, 0)
    const deposited = feCompanies.reduce((s, c) => s + c.totalAmount, 0)
    const recovered = feCompanies.reduce((s, c) => s + c.recovered, 0)
    const settled = feCompanies.reduce((s, c) => s + c.settled, 0)
    const liability = feCompanies.reduce((s, c) => s + c.liability, 0)
    return { victims, claims, deposited, recovered, settled, liability }
  }, [])

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
      .sort((a, b) => b.totalAmount - a.totalAmount)
  }, [filter, query])

  const maxDeposited = Math.max(...filtered.map((c) => c.totalAmount), 1)

  const metrics = [
    {
      id: "entities",
      label: "Fraudulent entities",
      value: formatNumber(feCompanies.length),
      hint: "Entities in this report",
      icon: Building2,
      color: "#0ea5e9",
      soft: "#e0f2fe",
    },
    {
      id: "claims",
      label: "Claims filed",
      value: formatNumber(totals.claims),
      hint: `${formatNumber(totals.victims)} depositors affected`,
      icon: Users,
      color: "#3b82f6",
      soft: "#dbeafe",
    },
    {
      id: "recovered",
      label: "Recovered amount",
      value: formatINR(totals.recovered),
      hint: `${formatPercent((totals.recovered / totals.deposited) * 100)} of deposits`,
      icon: IndianRupee,
      color: "#16a34a",
      soft: "#dcfce7",
    },
    {
      id: "paid",
      label: "Amount disbursed to depositors",
      value: formatINR(totals.settled),
      hint: `${formatINR(totals.liability)} still outstanding`,
      icon: Scale,
      color: "#f59e0b",
      soft: "#fef3c7",
    },
  ] as const

  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow="CSMS · Detailed report"
        title="Report by fraudulent entities"
        description="Claims, recovered amounts, and disbursements for each fraudulent entity under the Karnataka settlement programme."
        icon={FileBarChart2}
        backTo="/reports"
        backLabel="Back to detailed reports"
        accent="#0ea5e9"
      />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
        <div className="mb-5 border-b border-border/50 pb-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
              Exposure by fraudulent entity
            </h2>
            <span className="inline-flex items-center rounded-md bg-[#e0f2fe] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#0369a1] uppercase dark:bg-sky-500/15 dark:text-sky-300">
              {filtered.length} entities
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Deposited amount vs recovered assets — largest exposure first.
          </p>
        </div>

        <ul className="space-y-3">
          {filtered.map((c, i) => {
            const recoveryPct =
              c.totalAmount > 0 ? (c.recovered / c.totalAmount) * 100 : 0
            const widthPct = (c.totalAmount / maxDeposited) * 100
            return (
              <li
                key={c.id}
                className="stagger-in"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <Link
                  to="/companies/$companyId"
                  params={{ companyId: c.id }}
                  className="group block rounded-md border border-black/[0.05] bg-white p-3.5 transition-all hover:border-sky-300/60 hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-[#141c2c] dark:hover:border-sky-500/30"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ background: c.accent }}
                      />
                      <p className="truncate font-display text-sm font-semibold text-foreground">
                        {c.name}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs tabular-nums">
                      <span className="text-muted-foreground">
                        Deposited{" "}
                        <span className="font-semibold text-foreground">
                          {formatINR(c.totalAmount)}
                        </span>
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatPercent(recoveryPct)} recovered
                      </span>
                    </div>
                  </div>
                  <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted/70 dark:bg-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${widthPct}%`,
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
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
                Fraudulent entity-wise breakdown
              </h2>
              <span className="inline-flex items-center rounded-md bg-[#eff6ff] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#1d4ed8] uppercase dark:bg-[#1e3a5f]/50 dark:text-sky-300">
                {filtered.length} listed
              </span>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Claims, deposits, recovery, and disbursements — open a fraudulent entity for
              schemes and depositors.
            </p>
          </div>
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
            {filtered.map((c, i) => {
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
                    badge={`${formatPercent(recoveryPct)} recovery`}
                    metrics={[
                      {
                        value: formatINR(c.recovered),
                        label: "recovered",
                        emphasize: true,
                      },
                      { value: formatNumber(c.claims), label: "claims" },
                      { value: formatINR(c.totalAmount), label: "deposited" },
                      { value: formatINR(c.settled), label: "paid out" },
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
              { key: "claims", header: "Claims", align: "right" },
              { key: "deposited", header: "Deposited", align: "right" },
              { key: "recovered", header: "Recovered", align: "right" },
              { key: "paid", header: "Paid out", align: "right" },
              { key: "rate", header: "Recovery", align: "right" },
            ]}
            rows={filtered.map((c) => {
              const recoveryPct =
                c.totalAmount > 0 ? (c.recovered / c.totalAmount) * 100 : 0
              return {
                id: c.id,
                to: "/companies/$companyId" as const,
                params: { companyId: c.id },
                accent: c.accent,
                icon: Building2,
                title: c.name,
                subtitle: `${formatNumber(c.victims)} depositors`,
                cells: {
                  claims: { value: formatNumber(c.claims) },
                  deposited: { value: formatINR(c.totalAmount) },
                  recovered: {
                    value: formatINR(c.recovered),
                    emphasize: true,
                  },
                  paid: { value: formatINR(c.settled) },
                  rate: { value: formatPercent(recoveryPct) },
                },
              }
            })}
          />
        )}
      </SectionCard>

      <p
        className={cn(
          "rounded-md border border-dashed border-border/70 bg-muted/20 px-4 py-3 text-xs leading-relaxed text-muted-foreground",
        )}
      >
        This report summarises claims, asset recovery, and depositor disbursements by
        fraudulent entities under the Karnataka KPID settlement programme.
      </p>
    </PageShell>
  )
}
