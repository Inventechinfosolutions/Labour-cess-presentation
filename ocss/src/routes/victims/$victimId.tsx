import { createFileRoute, notFound } from "@tanstack/react-router"
import {
  IndianRupee,
  Gem,
  Scale,
  Users,
  Wallet,
} from "lucide-react"
import { ExecutiveMetricTile } from "@/components/drilldown/companies-executive-panel"
import {
  IdentityPanel,
  InvestmentList,
} from "@/components/drilldown/person-bits"
import {
  PageHero,
  PageShell,
  SectionCard,
} from "@/components/drilldown/page-shell"
import { victimRecords } from "@/data/kpi-drilldown-data"
import { formatINR, formatNumber, formatPercent } from "@/lib/format"

export const Route = createFileRoute("/victims/$victimId")({
  component: VictimDetailPage,
})

const ACCENT = "#6366f1"

function VictimDetailPage() {
  const { victimId } = Route.useParams()
  const victim = victimRecords.find((v) => v.id === victimId)
  if (!victim) throw notFound()

  const deposited = victim.investments.reduce((s, i) => s + i.invested, 0)
  const returns = victim.investments.reduce((s, i) => s + i.returnsTaken, 0)
  const outstanding = Math.max(0, deposited - returns)
  const returnRate = deposited > 0 ? (returns / deposited) * 100 : 0
  const entities = new Set(victim.investments.map((i) => i.companyId)).size

  const metrics = [
    {
      id: "deposited",
      label: "Total deposits",
      value: formatINR(deposited, false),
      hint: `Across ${formatNumber(victim.investments.length)} scheme${victim.investments.length === 1 ? "" : "s"}`,
      icon: Wallet,
      color: "#f59e0b",
      soft: "#fef3c7",
    },
    {
      id: "returns",
      label: "Returns already received",
      value: formatINR(returns, false),
      hint: `${formatPercent(returnRate)} of total deposits`,
      icon: IndianRupee,
      color: "#16a34a",
      soft: "#dcfce7",
    },
    {
      id: "owed",
      label: "Outstanding liability",
      value: formatINR(outstanding, false),
      hint: "Deposits minus returns received",
      icon: Scale,
      color: "#f43f5e",
      soft: "#ffe4e6",
    },
    {
      id: "entities",
      label: "Fraudulent entities",
      value: formatNumber(entities),
      hint: `${formatNumber(victim.investments.length)} scheme${victim.investments.length === 1 ? "" : "s"} held`,
      icon: Gem,
      color: ACCENT,
      soft: "#e0e7ff",
    },
  ] as const

  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow="Settlement"
        title="Depositor profile"
        description="Deposits with fraudulent entities, returns already received, and outstanding liability."
        icon={Users}
        backTo="/victims"
        backLabel="All depositors"
        accent={ACCENT}
      />

      <IdentityPanel
        className="stagger-in shadow-[0_1px_4px_rgba(15,23,42,0.02)]"
        name={victim.name}
        customerId={victim.customerId}
        pan={victim.pan}
        aadhaar={victim.aadhaar}
        district={victim.district}
        accent={ACCENT}
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
              Deposit records
            </h2>
            <span className="inline-flex items-center rounded-md bg-[#eef2ff] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#4338ca] uppercase dark:bg-[#312e81]/40 dark:text-indigo-300">
              {victim.investments.length} scheme
              {victim.investments.length === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Open a scheme to see other depositors affected by the same plan.
          </p>
        </div>

        {victim.investments.length > 0 ? (
          <InvestmentList investments={victim.investments} />
        ) : (
          <div className="rounded-md border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
            No deposit records for this depositor
          </div>
        )}
      </SectionCard>
    </PageShell>
  )
}
