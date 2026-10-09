import {
  BadgeCheck,
  ChevronRight,
  Clock3,
  HandCoins,
  Percent,
  Wallet,
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { financialMetrics } from "@/data/dashboard-data"
import { formatINR, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"

const rowTheme = {
  navy: {
    accent: "#0ea5e9",
    iconBg: "bg-[#0ea5e9]/10 text-[#0284c7] dark:text-[#7dd3fc]",
  },
  info: {
    accent: "#3b82f6",
    iconBg: "bg-[#3b82f6]/10 text-[#1d4ed8] dark:text-[#93c5fd]",
  },
  success: {
    accent: "#16a34a",
    iconBg: "bg-[#16a34a]/10 text-[#15803d] dark:text-[#6ee7b7]",
  },
  gold: {
    accent: "#f59e0b",
    iconBg: "bg-[#f59e0b]/10 text-[#d97706] dark:text-[#fcd34d]",
  },
  warning: {
    accent: "#f43f5e",
    iconBg: "bg-[#f43f5e]/10 text-[#e11d48] dark:text-[#fda4af]",
  },
} as const

const metricIcons = {
  "available-fund": Wallet,
  "approved-liability": BadgeCheck,
  "previous-returns": HandCoins,
  "net-payable": Clock3,
  "equitable-ratio": Percent,
} as const

export function FinancialSummary({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="financial-heading"
      className={cn("dashboard-panel stagger-in flex h-full flex-col p-3 sm:p-4", className)}
      style={{ animationDelay: "120ms" }}
    >
      <div className="mb-2 sm:mb-3">
          <h2
            id="financial-heading"
            className="font-display text-xs font-semibold tracking-tight text-foreground sm:text-sm"
          >
            Funds Available for Settlement
          </h2>
          <p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">
            Overview of available funds, approved claims, and settlement distribution
          </p>
      </div>

      <ul className="min-h-0 flex-1 space-y-0.5">
        {financialMetrics.map((metric, index) => {
          const Icon = metricIcons[metric.id as keyof typeof metricIcons] ?? Wallet
          const theme = rowTheme[metric.tone]
          const display =
            metric.format === "percent"
              ? formatPercent(metric.value)
              : formatINR(metric.value)

          return (
            <li key={metric.id}>
              <Link
                to="/finance/$metricId"
                params={{ metricId: metric.id }}
                className="group flex w-full items-center gap-2 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-muted/60 sm:gap-2.5 sm:px-2 sm:py-2"
                style={{ animationDelay: `${140 + index * 40}ms` }}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-9",
                    theme.iconBg,
                  )}
                >
                  <Icon className="size-3.5 sm:size-4" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-foreground sm:text-[13px]">
                    {metric.label}
                  </p>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="funnel-bar h-full rounded-full"
                      style={{
                        width: `${Math.max(metric.barPercent, 8)}%`,
                        background: theme.accent,
                        animationDelay: `${180 + index * 45}ms`,
                      }}
                    />
                  </div>
                </div>

                <p className="shrink-0 font-display text-xs font-semibold tabular-nums text-foreground sm:text-sm">
                  {display}
                </p>
                <ChevronRight className="hidden size-3.5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 sm:block" />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
