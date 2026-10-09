import type { LucideIcon } from "lucide-react"
import { AnimatedCounter } from "@/components/shared/AnimatedCounter"
import { cn } from "@/lib/utils"

interface DashboardWidgetProps {
  title: string
  value: number
  suffix?: string
  icon: LucideIcon
  description?: string
  trend?: string
  className?: string
}

export function DashboardWidget({
  title,
  value,
  suffix = "",
  icon: Icon,
  description,
  trend,
  className,
}: DashboardWidgetProps) {
  return (
    <div className={cn("admin-stat-card dashboard-widget", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="size-5 text-primary" strokeWidth={1.75} />
        </div>
        {trend && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
            {trend}
          </span>
        )}
      </div>
      <p className="mt-5 text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-[1.75rem] font-semibold tracking-tight text-foreground">
        <AnimatedCounter value={value} suffix={suffix} duration={1.5} />
      </p>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
