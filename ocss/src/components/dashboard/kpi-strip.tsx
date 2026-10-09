import { Link } from "@tanstack/react-router"
import {
  Building2,
  HandCoins,
  IndianRupee,
  Scale,
  Users,
  Wallet,
  FileStack,
} from "lucide-react"
import type { KpiItem } from "@/data/dashboard-data"
import { kpiData } from "@/data/dashboard-data"
import { useCountUp } from "@/hooks/use-count-up"
import { formatKpiValue } from "@/lib/format"
import { cn } from "@/lib/utils"

const icons = {
  fes: Building2,
  depositors: Users,
  investments: Wallet,
  claims: FileStack,
  liability: Scale,
  recovered: IndianRupee,
  settled: HandCoins,
} as const

const kpiRoutes = {
  fes: "/companies",
  depositors: "/victims",
  investments: "/companies",
  claims: "/claims",
  liability: "/reports/settlement",
  recovered: "/assets",
  settled: "/reports/payments",
} as const

type DrillableKpiId = keyof typeof kpiRoutes

function isDrillableKpi(id: string): id is DrillableKpiId {
  return id in kpiRoutes
}

/** Soft pastel card surfaces — easy to scan, friendly UX */
const accentTheme: Record<
  KpiItem["accent"],
  { color: string; soft: string; softDark: string; iconBg: string }
> = {
  cyan: {
    color: "#3b82f6",
    soft: "linear-gradient(160deg, #eff6ff 0%, #ffffff 70%)",
    softDark: "linear-gradient(160deg, rgba(59,130,246,0.18) 0%, rgba(20,28,44,1) 75%)",
    iconBg: "#dbeafe",
  },
  success: {
    color: "#22c55e",
    soft: "linear-gradient(160deg, #ecfdf5 0%, #ffffff 70%)",
    softDark: "linear-gradient(160deg, rgba(34,197,94,0.16) 0%, rgba(20,28,44,1) 75%)",
    iconBg: "#dcfce7",
  },
  gold: {
    color: "#f59e0b",
    soft: "linear-gradient(160deg, #fffbeb 0%, #ffffff 70%)",
    softDark: "linear-gradient(160deg, rgba(245,158,11,0.16) 0%, rgba(20,28,44,1) 75%)",
    iconBg: "#fef3c7",
  },
  violet: {
    color: "#0ea5e9",
    soft: "linear-gradient(160deg, #f0f9ff 0%, #ffffff 70%)",
    softDark: "linear-gradient(160deg, rgba(14,165,233,0.16) 0%, rgba(20,28,44,1) 75%)",
    iconBg: "#e0f2fe",
  },
  rose: {
    color: "#f43f5e",
    soft: "linear-gradient(160deg, #fff1f2 0%, #ffffff 70%)",
    softDark: "linear-gradient(160deg, rgba(244,63,94,0.16) 0%, rgba(20,28,44,1) 75%)",
    iconBg: "#ffe4e6",
  },
}

function KpiCard({ item, index }: { item: KpiItem; index: number }) {
  const Icon = icons[item.id as keyof typeof icons] ?? IndianRupee
  const theme = accentTheme[item.accent]
  const animated = useCountUp(item.value, 1000 + index * 80)
  const display =
    item.format === "percent"
      ? formatKpiValue(Number(animated.toFixed(1)), item.format)
      : formatKpiValue(Math.round(animated), item.format)
  const href = isDrillableKpi(item.id) ? kpiRoutes[item.id] : undefined

  const content = (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{ background: theme.soft }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{ background: theme.softDark }}
      />
      <div className="relative flex min-w-0 items-center gap-1.5">
        <div
          className="flex size-6 shrink-0 items-center justify-center rounded-md transition-transform duration-200 group-hover:scale-105 sm:size-7 dark:brightness-110"
          style={{ background: theme.iconBg, color: theme.color }}
        >
          <Icon className="size-3 sm:size-3.5" strokeWidth={2} />
        </div>
        <p className="line-clamp-2 text-[9px] font-semibold leading-tight tracking-wide text-slate-500 uppercase sm:text-[10px] dark:text-slate-400">
          {item.label}
        </p>
      </div>

      <div className="relative mt-1 min-w-0">
        <p
          className="font-display text-base leading-none font-semibold tracking-tight tabular-nums sm:text-lg"
          style={{ color: theme.color }}
        >
          {display}
        </p>
      </div>
    </>
  )

  const shellClass =
    "group relative block overflow-hidden rounded-lg border border-black/[0.04] bg-white p-2 text-left shadow-[0_1px_8px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_4px_16px_rgba(15,23,42,0.08)] sm:p-2.5 dark:border-white/[0.06] dark:bg-[#141c2c] dark:shadow-[0_4px_16px_rgba(0,0,0,0.25)]"

  if (href) {
    return (
      <Link
        to={href}
        className={cn(
          shellClass,
          "w-full cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        )}
        aria-label={`Open ${item.label} page`}
      >
        {content}
      </Link>
    )
  }

  return <article className={shellClass}>{content}</article>
}

export function KpiStrip() {
  return (
    <section aria-labelledby="kpi-heading" className="space-y-1.5 sm:space-y-2">
      <div className="min-w-0">
        <h2
          id="kpi-heading"
          className="font-display text-xs font-semibold tracking-tight text-foreground sm:text-sm"
        >
          Overview
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 sm:gap-2 lg:grid-cols-7">
        {kpiData.map((item, index) => (
          <div
            key={item.id}
            className="stagger-in min-w-0"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <KpiCard item={item} index={index} />
          </div>
        ))}
      </div>
    </section>
  )
}
