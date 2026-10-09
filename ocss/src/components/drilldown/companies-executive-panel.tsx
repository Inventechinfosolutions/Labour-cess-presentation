import {
  Building2,
  Gem,
  IndianRupee,
  Scale,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react"
import type { FeCompany } from "@/data/kpi-drilldown-data"
import { feCompanies, kpiLabels } from "@/data/kpi-drilldown-data"
import { formatINR, formatNumber, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"

export function ExecutiveMetricTile({
  label,
  value,
  icon: Icon,
  color,
  soft,
  className,
  style,
}: {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  color: string
  soft: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <li
      className={cn(
        "stagger-in group relative overflow-hidden rounded-md border border-black/[0.05] bg-white p-4 dark:border-white/[0.08] dark:bg-[#141c2c]",
        className,
      )}
      style={style}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90 dark:opacity-40"
        style={{
          background: `linear-gradient(145deg, ${soft} 0%, transparent 68%)`,
        }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-md text-white"
            style={{
              background: `linear-gradient(145deg, ${color}, ${color}cc)`,
            }}
          >
            <Icon className="size-5" strokeWidth={1.9} />
          </div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase leading-snug">
            {label}
          </p>
        </div>
        <TrendingUp className="size-4 shrink-0 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <p
        className="relative mt-3 font-display text-[1.65rem] leading-none font-semibold tracking-tight tabular-nums"
        style={{ color }}
      >
        {value}
      </p>
    </li>
  )
}

export function CompaniesExecutivePanel({
  totalVictims,
  totalAmount,
  totalRecovered,
}: {
  totalVictims: number
  totalAmount: number
  totalRecovered: number
}) {
  const recoveryRate = totalAmount > 0 ? (totalRecovered / totalAmount) * 100 : 0

  const metrics = [
    {
      id: "entities",
      label: kpiLabels.fes,
      value: formatNumber(feCompanies.length),
      hint: "Under KPID proceedings",
      icon: Building2,
      color: "#3b82f6",
      soft: "#dbeafe",
    },
    {
      id: "victims",
      label: kpiLabels.depositors,
      value: formatNumber(totalVictims),
      hint: "Registered in the system",
      icon: Users,
      color: "#0ea5e9",
      soft: "#e0f2fe",
    },
    {
      id: "deposited",
      label: kpiLabels.investments,
      value: formatINR(totalAmount),
      hint: "Deposited by depositors",
      icon: Scale,
      color: "#f59e0b",
      soft: "#fef3c7",
    },
    {
      id: "recovered",
      label: kpiLabels.recovered,
      value: formatINR(totalRecovered),
      hint: `${formatPercent(recoveryRate)} of deposits`,
      icon: IndianRupee,
      color: "#16a34a",
      soft: "#dcfce7",
    },
  ] as const

  return (
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
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </ul>
  )
}

export function CompanyDetailMetrics({ company }: { company: FeCompany }) {
  const recoveryRate =
    company.totalAmount > 0
      ? (company.recovered / company.totalAmount) * 100
      : 0
  const settleRate =
    company.recovered > 0 ? (company.settled / company.recovered) * 100 : 0

  const metrics = [
    {
      id: "victims",
      label: "Depositors affected",
      value: formatNumber(company.victims),
      hint: "Depositors linked to this entity",
      icon: Users,
      color: "#0ea5e9",
      soft: "#e0f2fe",
    },
    {
      id: "deposited",
      label: "Total deposits",
      value: formatINR(company.totalAmount),
      hint: "Gross exposure under schemes",
      icon: Wallet,
      color: "#f59e0b",
      soft: "#fef3c7",
    },
    {
      id: "claims",
      label: "Claims filed",
      value: formatNumber(company.claims),
      hint: "Settlement programme filings",
      icon: Scale,
      color: "#3b82f6",
      soft: "#dbeafe",
    },
    {
      id: "owed",
      label: "Outstanding liability",
      value: formatINR(company.liability),
      hint: "Outstanding liability",
      icon: Building2,
      color: "#f43f5e",
      soft: "#ffe4e6",
    },
    {
      id: "recovered",
      label: kpiLabels.recovered,
      value: formatINR(company.recovered),
      hint: `${formatPercent(recoveryRate)} of deposits`,
      icon: IndianRupee,
      color: "#16a34a",
      soft: "#dcfce7",
    },
    {
      id: "settled",
      label: kpiLabels.settled,
      value: formatINR(company.settled),
      hint: `${formatPercent(settleRate)} of recovered`,
      icon: Gem,
      color: "#059669",
      soft: "#d1fae5",
    },
  ] as const

  return (
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
  )
}

export function CompanySchemesIntro({
  count,
  totalAmount,
  className,
}: {
  count: number
  totalAmount: number
  className?: string
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Schemes under this entity
        </h2>
        <span className="inline-flex items-center rounded-md bg-[#eff6ff] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#1d4ed8] uppercase dark:bg-[#1e3a5f]/50 dark:text-sky-300">
          {count} scheme{count === 1 ? "" : "s"}
        </span>
      </div>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        {formatINR(totalAmount)} deposited across these schemes. Open a scheme to
        see depositors affected and deposit records.
      </p>
    </div>
  )
}

export function CompanyDirectoryIntro({
  count,
  totalAmount,
  className,
}: {
  count: number
  totalAmount: number
  className?: string
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-xl font-semibold tracking-tight text-foreground">
          Fraudulent entity directory
        </h2>
        <span className="inline-flex items-center rounded-md bg-[#eff6ff] px-2 py-0.5 text-[11px] font-bold tracking-wide text-[#1d4ed8] uppercase dark:bg-[#1e3a5f]/50 dark:text-sky-300">
          {count} listed
        </span>
      </div>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        {formatINR(totalAmount)} deposited across these entities. Open a fraudulent entity for
        schemes, depositors, claims, and recovery detail.
      </p>
    </div>
  )
}
