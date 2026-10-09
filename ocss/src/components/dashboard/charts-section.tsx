import {
  BarChart3,
  Building2,
  Calendar,
  ChevronDown,
  Gem,
  Landmark,
  Sun,
  Users,
  type LucideIcon,
} from "lucide-react"
import { formatINR, formatPercent } from "@/lib/format"
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"
import {
  assetRecovery,
  claimsByEntity,
  fundComparison,
} from "@/data/dashboard-data"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

const fundConfig = {
  liability: { label: "Outstanding liability to depositors", color: "#0ea5e9" },
  recovered: { label: "Recovered amount", color: "#16a34a" },
  paid: { label: "Amount disbursed", color: "#f59e0b" },
} satisfies ChartConfig

const companyIcons: Record<(typeof claimsByEntity)[number]["icon"], LucideIcon> = {
  gem: Gem,
  landmark: Landmark,
  building: Building2,
  sun: Sun,
  users: Users,
}

const CLAIMS_SCALE_MAX = 100_000
const CLAIMS_SCALE_TICKS = [0, 25_000, 50_000, 75_000, 100_000]

function ChartCard({
  title,
  subtitle,
  children,
  className,
  delay = 0,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <article
      className={cn("dashboard-panel stagger-in flex flex-col p-2.5 sm:p-3", className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="mb-1.5 flex flex-wrap items-start justify-between gap-1.5 sm:mb-2 sm:gap-2">
        <div className="flex min-w-0 items-start gap-1.5 sm:gap-2">
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary ring-1 ring-primary/20 sm:size-7">
            <BarChart3 className="size-3 sm:size-3.5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-xs font-semibold tracking-tight text-foreground sm:text-sm">
              {title}
            </h3>
            <p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">
              {subtitle}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-1 rounded-md bg-card px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground ring-1 ring-border/70 transition-colors hover:bg-muted sm:px-2 sm:text-[11px]"
        >
          <Calendar className="size-3 text-primary" />
          This Year
          <ChevronDown className="size-3" />
        </button>
      </div>
      {children}
    </article>
  )
}

export function ChartsSection() {
  return (
    <section aria-labelledby="charts-heading" className="space-y-2 sm:space-y-3">
      <div className="flex items-start gap-1.5 sm:gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-info/15 text-primary ring-1 ring-primary/20 sm:size-7">
          <BarChart3 className="size-3 sm:size-3.5" />
        </span>
        <div>
          <h2
            id="charts-heading"
            className="font-display text-xs font-semibold tracking-tight text-foreground sm:text-sm"
          >
            Charts & trends
          </h2>
          <p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">
            Amount by fraudulent entity, claim counts, and asset recovery
          </p>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-2 lg:items-stretch sm:gap-4">
        <ChartCard
          title="Fraudulent entity-wise amounts (₹ Crore)"
          subtitle="For each entity: outstanding liability, recovered amount, and amount disbursed"
          delay={140}
          className="h-full min-w-0"
        >
          <div className="chart-scroll flex-1">
            <div className="chart-scroll-inner">
              <ChartContainer config={fundConfig} className="aspect-[16/9] w-full min-h-0">
                <BarChart
                  data={fundComparison}
                  margin={{ left: 0, right: 4, top: 6, bottom: 0 }}
                  barCategoryGap="32%"
                  barGap={2}
                >
                  <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="0" />
                  <XAxis
                    dataKey="entity"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={28}
                    tick={{ fill: "#64748b", fontSize: 10 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="liability"
                    fill="var(--color-liability)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                  />
                  <Bar
                    dataKey="recovered"
                    fill="var(--color-recovered)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                  />
                  <Bar
                    dataKey="paid"
                    fill="var(--color-paid)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={18}
                  />
                </BarChart>
              </ChartContainer>
            </div>
          </div>
        </ChartCard>

        <ChartCard
          title="Claims per fraudulent entities"
          subtitle="Number of depositor claims filed against each fraudulent entity"
          delay={200}
          className="h-full min-w-0"
        >
          <ClaimsByCompanyChart />
        </ChartCard>
      </div>

      <AssetRecoveryFlow />
    </section>
  )
}

function ClaimsByCompanyChart() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Mobile: stacked rows */}
      <ul className="flex flex-1 flex-col justify-between gap-1 sm:hidden">
        {claimsByEntity.map((item) => {
          const Icon = companyIcons[item.icon]
          const widthPct = Math.min(100, (item.claims / CLAIMS_SCALE_MAX) * 100)
          return (
            <li key={item.name} className="flex flex-1 flex-col justify-center space-y-0.5">
              <div className="flex items-center gap-1.5">
                <div
                  className="flex size-5 shrink-0 items-center justify-center rounded-md"
                  style={{ backgroundColor: `${item.color}1a` }}
                >
                  <Icon className="size-2.5" style={{ color: item.color }} strokeWidth={2} />
                </div>
                <p className="min-w-0 flex-1 truncate text-[11px] font-semibold text-foreground">
                  {item.name}
                </p>
                <p className="shrink-0 text-[11px] font-semibold tabular-nums text-muted-foreground">
                  {item.claims.toLocaleString("en-IN")}
                </p>
              </div>
              <div className="h-1.5 overflow-hidden rounded bg-muted">
                <div
                  className="h-full rounded"
                  style={{ width: `${widthPct}%`, backgroundColor: item.color }}
                />
              </div>
            </li>
          )
        })}
      </ul>

      {/* Desktop: side-by-side bars */}
      <div className="hidden min-h-0 flex-1 flex-col sm:flex">
        <div className="flex min-h-0 flex-1 gap-0">
          <ul className="flex w-32 shrink-0 flex-col justify-between md:w-40">
            {claimsByEntity.map((item) => {
              const Icon = companyIcons[item.icon]
              return (
                <li key={item.name} className="flex min-h-0 flex-1 items-center gap-1.5 pr-2">
                  <div
                    className="flex size-5 shrink-0 items-center justify-center rounded-md"
                    style={{ backgroundColor: `${item.color}1a` }}
                  >
                    <Icon className="size-2.5" style={{ color: item.color }} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold leading-tight text-foreground">
                      {item.name}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="relative min-h-0 min-w-0 flex-1">
            <div className="relative mr-10 flex h-full flex-col md:mr-12">
              <div aria-hidden className="pointer-events-none absolute inset-0">
                <div className="absolute inset-y-0 left-0 w-px bg-border" />
                {CLAIMS_SCALE_TICKS.slice(1).map((tick) => (
                  <div
                    key={tick}
                    className="absolute inset-y-0 border-l border-dashed border-border/80"
                    style={{ left: `${(tick / CLAIMS_SCALE_MAX) * 100}%` }}
                  />
                ))}
              </div>

              <ul className="relative flex min-h-0 flex-1 flex-col justify-between">
                {claimsByEntity.map((item) => {
                  const widthPct = Math.min(100, (item.claims / CLAIMS_SCALE_MAX) * 100)
                  return (
                    <li key={item.name} className="relative flex min-h-0 flex-1 items-center">
                      <div
                        className="h-2.5 rounded"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: item.color,
                        }}
                      />
                      <span
                        className="absolute text-[10px] font-semibold tabular-nums text-muted-foreground"
                        style={{ left: `calc(${widthPct}% + 6px)` }}
                      >
                        {item.claims.toLocaleString("en-IN")}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-1.5 flex shrink-0">
          <div className="w-32 shrink-0 md:w-40" />
          <div className="relative min-w-0 flex-1">
            <div className="relative mr-10 h-3 border-t border-border md:mr-12">
              {CLAIMS_SCALE_TICKS.map((tick) => {
                const left = `${(tick / CLAIMS_SCALE_MAX) * 100}%`
                const align =
                  tick === 0
                    ? "translate-x-0"
                    : tick === CLAIMS_SCALE_MAX
                      ? "-translate-x-full"
                      : "-translate-x-1/2"
                return (
                  <span
                    key={tick}
                    className={cn(
                      "absolute top-0.5 text-[8px] tabular-nums text-muted-foreground",
                      align,
                    )}
                    style={{ left }}
                  >
                    {tick.toLocaleString("en-IN")}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function AssetRecoveryFlow() {
  const steps = [
    { ...assetRecovery[0], accent: "#0ea5e9" },
    { ...assetRecovery[1], accent: "#3b82f6" },
    { ...assetRecovery[2], accent: "#60a5fa" },
    { ...assetRecovery[3], accent: "#22c55e" },
  ]
  const seizedAmount = steps[0]?.amount ?? 1
  const cashReceived = steps[steps.length - 1]
  const conversion = (cashReceived.amount / seizedAmount) * 100

  return (
    <article
      className="dashboard-panel stagger-in p-2.5 sm:p-3"
      style={{ animationDelay: "260ms" }}
    >
      <div className="mb-1.5 flex flex-wrap items-start justify-between gap-1.5 sm:mb-2 sm:gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-xs font-semibold tracking-tight text-foreground sm:text-sm">
            From seized property to cash
          </h3>
          <p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">
            Property value tracked from takeover to cash received
          </p>
        </div>
        <p className="rounded-md bg-success/10 px-1.5 py-0.5 text-[10px] text-muted-foreground ring-1 ring-success/20 sm:px-2 sm:text-[11px]">
          Cash received:{" "}
          <span className="font-semibold text-success tabular-nums">
            {formatINR(cashReceived.amount)}
          </span>{" "}
          ({formatPercent(conversion)} of total)
        </p>
      </div>

      <ol className="space-y-1">
        {steps.map((step, index) => (
          <li key={step.stage} className="space-y-0.5">
            <div className="flex min-w-0 items-baseline justify-between gap-x-1.5">
              <p className="truncate text-[11px] font-semibold leading-tight text-foreground sm:text-xs">
                <span className="mr-1 text-muted-foreground tabular-nums">
                  {index + 1}.
                </span>
                {step.stage}
              </p>
              <div className="flex shrink-0 items-baseline gap-1.5">
                <span className="text-[11px] font-semibold tabular-nums text-foreground sm:text-xs">
                  {formatINR(step.amount)}
                </span>
                <span
                  className="text-[10px] font-semibold tabular-nums sm:text-[11px]"
                  style={{ color: step.accent }}
                >
                  {formatPercent(step.percent)}
                </span>
              </div>
            </div>

            <div className="relative h-2.5 overflow-hidden rounded bg-muted/60 ring-1 ring-border/40 sm:h-3">
              <div
                className="funnel-bar absolute inset-y-0 left-0 rounded"
                style={{
                  width: `${Math.max(step.percent, 3)}%`,
                  background: `linear-gradient(90deg, color-mix(in srgb, ${step.accent} 18%, transparent), color-mix(in srgb, ${step.accent} 42%, transparent))`,
                  borderRight: `1.5px solid color-mix(in srgb, ${step.accent} 65%, transparent)`,
                  animationDelay: `${index * 50}ms`,
                }}
              />
            </div>
          </li>
        ))}
      </ol>
    </article>
  )
}
