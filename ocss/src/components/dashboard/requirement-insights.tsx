import {
  Building2,
  Calendar,
  Gem,
  ShieldCheck,
  Users,
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { claimWindows, safetyChecks } from "@/data/dashboard-data"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

const windowStatusLabel = {
  open: "Open now",
  "closing-soon": "Closing soon",
  closed: "Closed",
} as const

const windowStatusStyle = {
  open: "bg-[#22c55e]/12 text-[#16a34a] ring-[#22c55e]/20",
  "closing-soon": "bg-[#f59e0b]/12 text-[#f59e0b] ring-[#f59e0b]/25",
  closed: "bg-muted text-muted-foreground ring-border",
} as const

const windowStatusDot = {
  open: "bg-[#22c55e]",
  "closing-soon": "bg-[#f59e0b]",
  closed: "bg-muted-foreground",
} as const

const companyTheme = [
  {
    accent: "#0ea5e9",
    iconBg: "bg-[#0ea5e9]/12 text-[#0284c7]",
    Icon: Gem,
  },
  {
    accent: "#3b82f6",
    iconBg: "bg-[#3b82f6]/12 text-[#1d4ed8]",
    Icon: Building2,
  },
  {
    accent: "#f59e0b",
    iconBg: "bg-[#f59e0b]/12 text-[#f59e0b]",
    Icon: Building2,
  },
] as const

/** Project chart palette — teal, sky, green, amber, rose */
const safetyColors = ["#0ea5e9", "#3b82f6", "#22c55e", "#f59e0b", "#f43f5e"] as const

function ClaimWindowCard({
  item,
  index,
  duplicate = false,
}: {
  item: (typeof claimWindows)[number]
  index: number
  duplicate?: boolean
}) {
  const theme = companyTheme[index % companyTheme.length] ?? companyTheme[0]
  const CompanyIcon = theme.Icon

  return (
    <Link
      to="/claim-windows/$windowId"
      params={{ windowId: item.id }}
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : undefined}
      className="group relative flex w-[168px] shrink-0 flex-col gap-1 overflow-hidden rounded-lg bg-card p-2 text-left ring-1 ring-border/60 transition-all hover:bg-muted/40 hover:shadow-sm sm:w-[180px]"
    >
      <span
        className="absolute inset-y-0 left-0 w-0.5 rounded-l-lg"
        style={{ background: theme.accent }}
      />
      <div className="flex items-center justify-between gap-1.5 pl-1">
        <span
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md",
            theme.iconBg,
          )}
        >
          <CompanyIcon className="size-3" />
        </span>
        <span
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ring-1",
            windowStatusStyle[item.status],
          )}
        >
          <span
            className={cn("size-1 shrink-0 rounded-full", windowStatusDot[item.status])}
          />
          {windowStatusLabel[item.status]}
        </span>
      </div>
      <div className="min-w-0 pl-1">
        <p className="truncate text-[12px] font-semibold leading-tight text-foreground">
          {item.company}
        </p>
        <p className="mt-0.5 flex items-center gap-0.5 text-[10px] text-muted-foreground">
          <Calendar className="size-2.5 shrink-0" />
          <span className="truncate">
            {item.from} → {item.to}
          </span>
        </p>
        <p className="mt-0.5 flex items-center gap-0.5 text-[10px] font-medium tabular-nums text-foreground/80">
          <Users className="size-2.5 shrink-0" />
          <span className="truncate">{formatNumber(item.claimsReceived)} claims</span>
        </p>
      </div>
    </Link>
  )
}

export function RequirementInsights() {
  const half = [...claimWindows, ...claimWindows]
  const track = [...half, ...half]

  return (
    <section aria-labelledby="claim-windows-heading" className="space-y-2.5">
      <div className="px-0.5">
        <h2
          id="claim-windows-heading"
          className="font-display text-base font-semibold tracking-tight text-foreground"
        >
          Open claim notification windows
        </h2>
        <p className="text-xs text-muted-foreground">
          When depositors can file claims for each fraudulent entity
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-muted/30 py-2 ring-1 ring-border/50">
        <div className="animate-marquee-cards gap-2 px-2">
          {track.map((w, index) => (
            <ClaimWindowCard
              key={`${w.id}-${index}`}
              item={w}
              index={index % claimWindows.length}
              duplicate={index >= half.length}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export function SafetyChecksChart({ className }: { className?: string }) {
  const total = safetyChecks.reduce((sum, item) => sum + item.count, 0)
  const data = safetyChecks.map((item, index) => ({
    ...item,
    color: safetyColors[index % safetyColors.length],
    percent: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }))

  return (
    <article
      className={cn(
        "dashboard-panel stagger-in flex h-full flex-col p-3 sm:p-4",
        className,
      )}
      style={{ animationDelay: "120ms" }}
    >
      <div className="mb-1.5 flex items-start gap-1.5 sm:mb-2 sm:gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#0ea5e9]/12 text-[#0284c7] sm:size-7">
          <ShieldCheck className="size-3 sm:size-3.5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-xs font-semibold tracking-tight text-foreground sm:text-sm">
            Automated Validation & Duplicate Prevention
          </h3>
          <p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">
            Catches duplicate and mismatched depositor, claim, and payment records
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center gap-2 sm:gap-3">
        <div className="relative size-[128px] shrink-0 sm:size-[140px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[18%] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(59,130,246,0.14) 0%, rgba(139,92,246,0.08) 45%, transparent 72%)",
              boxShadow: "inset 0 0 28px rgba(59,130,246,0.12)",
            }}
          />
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {data.map((item) => (
                  <linearGradient
                    key={`grad-${item.id}`}
                    id={`safety-${item.id}`}
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                  >
                    <stop offset="0%" stopColor={item.color} stopOpacity={1} />
                    <stop offset="100%" stopColor={item.color} stopOpacity={0.72} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius="62%"
                outerRadius="88%"
                paddingAngle={3}
                cornerRadius={5}
                stroke="none"
                isAnimationActive
              >
                {data.map((item) => (
                  <Cell
                    key={item.id}
                    fill={`url(#safety-${item.id})`}
                    style={{
                      filter: `drop-shadow(0 2px 6px ${item.color}55)`,
                    }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="pointer-events-none absolute inset-[26%] flex flex-col items-center justify-center text-center sm:inset-[24%]">
            <span className="text-[6.5px] font-medium leading-[1.1] text-muted-foreground sm:text-[9px] sm:leading-tight">
              Total
              <span className="block sm:inline"> Validations</span>
            </span>
            <span className="mt-0.5 font-display text-[15px] font-semibold leading-none tracking-tight text-foreground tabular-nums sm:mt-0 sm:text-2xl">
              {formatNumber(total)}
            </span>
          </div>
        </div>

        <ul className="w-full min-w-0 flex-1 space-y-1 sm:space-y-1.5">
          {data.map((item) => (
            <li
              key={item.id}
              className="rounded-md bg-muted/30 px-1.5 py-1 ring-1 ring-border/40 sm:rounded-lg sm:bg-transparent sm:px-1 sm:py-0.5 sm:ring-0"
            >
              <div className="flex items-start gap-1.5 sm:gap-2">
                <span
                  className="mt-1 size-1.5 shrink-0 rounded-full ring-2 ring-white sm:mt-1 sm:size-2"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: `0 0 0 2px ${item.color}22`,
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold leading-snug text-foreground sm:text-[13px]">
                      {item.label}
                    </p>
                    <p className="shrink-0 text-xs font-semibold tabular-nums text-foreground sm:text-[13px]">
                      {formatNumber(item.count)}
                      <span className="ml-1 font-medium text-muted-foreground">
                        ({item.percent}%)
                      </span>
                    </p>
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[9px] leading-snug text-muted-foreground sm:text-[10px]">
                    {item.hint}
                  </p>
                  <div className="mt-0.5 h-0.5 overflow-hidden rounded-full bg-muted sm:mt-1 sm:h-1">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{
                        width: `${Math.max(item.percent, item.count > 0 ? 2 : 0)}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}
