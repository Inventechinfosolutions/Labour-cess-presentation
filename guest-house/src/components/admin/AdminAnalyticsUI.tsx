import type { CSSProperties, ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: "12px",
    border: "1px solid oklch(0.91 0.002 106)",
    boxShadow: "0 6px 16px rgba(0,0,0,0.08)",
    fontSize: "12px",
  },
}

interface AdminChartCardProps {
  title: string
  description?: string
  children: ReactNode
  className?: string
  action?: ReactNode
  icon?: LucideIcon
  tone?: ChartCardTone
}

export type ChartCardTone = "coral" | "blue" | "green" | "amber" | "violet" | "rose" | "slate"

const CHART_CARD_TONES: Record<
  ChartCardTone,
  { header: string; icon: string; border: string }
> = {
  coral: {
    header: "bg-primary/10",
    icon: "bg-primary text-primary-foreground",
    border: "border-primary/20",
  },
  blue: {
    header: "bg-sky-100 dark:bg-sky-950/40",
    icon: "bg-sky-500 text-white",
    border: "border-sky-200 dark:border-sky-800",
  },
  green: {
    header: "bg-emerald-100 dark:bg-emerald-950/40",
    icon: "bg-emerald-500 text-white",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  amber: {
    header: "bg-amber-100 dark:bg-amber-950/40",
    icon: "bg-amber-500 text-white",
    border: "border-amber-200 dark:border-amber-800",
  },
  violet: {
    header: "bg-violet-100 dark:bg-violet-950/40",
    icon: "bg-violet-500 text-white",
    border: "border-violet-200 dark:border-violet-800",
  },
  rose: {
    header: "bg-rose-100 dark:bg-rose-950/40",
    icon: "bg-rose-500 text-white",
    border: "border-rose-200 dark:border-rose-800",
  },
  slate: {
    header: "bg-slate-100 dark:bg-slate-800/40",
    icon: "bg-slate-500 text-white",
    border: "border-slate-200 dark:border-slate-700",
  },
}

export function AdminChartCard({
  title,
  description,
  children,
  className,
  action,
  icon: Icon,
  tone = "coral",
}: AdminChartCardProps) {
  const styles = CHART_CARD_TONES[tone]

  return (
    <div className={cn("admin-card chart-card flex flex-col gap-0 overflow-hidden py-0", className)}>
      <div
        className={cn(
          "flex items-center justify-between gap-2 border-b px-4 py-2.5",
          styles.header,
          styles.border
        )}
      >
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon && (
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg",
                styles.icon
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-tight text-foreground">{title}</h3>
            {description && (
              <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

export type AdminIconTone = "coral" | "blue" | "green" | "amber" | "violet" | "rose" | "slate" | "teal"

export type StatChipTone = AdminIconTone

const ADMIN_ICON_TONES: Record<AdminIconTone, { bg: string; icon: string }> = {
  coral: { bg: "bg-primary/10", icon: "text-primary" },
  blue: { bg: "bg-sky-100 dark:bg-sky-950/50", icon: "text-sky-600 dark:text-sky-400" },
  green: { bg: "bg-emerald-100 dark:bg-emerald-950/50", icon: "text-emerald-600 dark:text-emerald-400" },
  amber: { bg: "bg-amber-100 dark:bg-amber-950/50", icon: "text-amber-600 dark:text-amber-400" },
  violet: { bg: "bg-violet-100 dark:bg-violet-950/50", icon: "text-violet-600 dark:text-violet-400" },
  rose: { bg: "bg-rose-100 dark:bg-rose-950/50", icon: "text-rose-600 dark:text-rose-400" },
  slate: { bg: "bg-slate-100 dark:bg-slate-800/50", icon: "text-slate-600 dark:text-slate-400" },
  teal: { bg: "bg-teal-100 dark:bg-teal-950/50", icon: "text-teal-600 dark:text-teal-400" },
}

interface AdminHeroMetricProps {
  label: string
  value: ReactNode
  hint?: string
  trend?: string
  trendUp?: boolean
  icon?: LucideIcon
  iconTone?: AdminIconTone
}

export function AdminHeroMetric({
  label,
  value,
  hint,
  trend,
  trendUp = true,
  icon: Icon,
  iconTone = "coral",
}: AdminHeroMetricProps) {
  const tone = ADMIN_ICON_TONES[iconTone]

  return (
    <div className="admin-hero-metric rounded-2xl border border-border/40 bg-card p-4 shadow-[var(--shadow-airbnb)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {Icon && (
          <div className={cn("flex size-8 items-center justify-center rounded-lg", tone.bg)}>
            <Icon className={cn("size-4", tone.icon)} strokeWidth={1.75} />
          </div>
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {(hint || trend) && (
        <p className="mt-1 text-xs">
          {trend && (
            <span className={cn("font-medium", trendUp ? "text-emerald-600" : "text-muted-foreground")}>
              {trend}
            </span>
          )}
          {trend && hint && <span className="text-muted-foreground"> · </span>}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </p>
      )}
    </div>
  )
}

interface AdminStatChipProps {
  label: string
  value: ReactNode
  icon?: LucideIcon
  iconTone?: StatChipTone
  className?: string
}

export function AdminStatChip({ label, value, icon: Icon, iconTone = "coral", className }: AdminStatChipProps) {
  const tone = ADMIN_ICON_TONES[iconTone]

  return (
    <div
      className={cn(
        "flex min-w-[9.5rem] shrink-0 items-center gap-3 rounded-xl border border-border/40 bg-muted/30 px-3.5 py-2.5",
        className
      )}
    >
      {Icon && (
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", tone.bg)}>
          <Icon className={cn("size-3.5", tone.icon)} strokeWidth={1.75} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold tabular-nums text-foreground">{value}</p>
      </div>
    </div>
  )
}

interface AdminHorizontalMarqueeProps {
  children: ReactNode
  className?: string
  duration?: number
}

export function AdminHorizontalMarquee({
  children,
  className,
  duration = 28,
}: AdminHorizontalMarqueeProps) {
  return (
    <div className={cn("admin-marquee relative mb-8 overflow-hidden", className)}>
      <div
        className="admin-marquee-track flex w-max gap-2"
        style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
      >
        <div className="flex shrink-0 gap-2">{children}</div>
        <div className="flex shrink-0 gap-2" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  )
}

export function AdminSectionHeading({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

export function AdminOccupancyRow({
  label,
  value,
  sublabel,
}: {
  label: string
  value: number
  sublabel?: string
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="min-w-0">
          <span className="font-medium text-foreground">{label}</span>
          {sublabel && (
            <span className="ml-1.5 text-xs text-muted-foreground">{sublabel}</span>
          )}
        </div>
        <span className="shrink-0 tabular-nums font-semibold">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}

export function AdminInsightTile({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-muted/25 p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function AdminRankRow({
  rank,
  title,
  subtitle,
  value,
  barValue,
}: {
  rank: number
  title: string
  subtitle?: string
  value: string
  barValue: number
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{title}</p>
            {subtitle && (
              <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums">{value}</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary/80"
            style={{ width: `${Math.min(100, barValue)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
