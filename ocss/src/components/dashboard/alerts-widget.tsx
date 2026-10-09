import {
  AlertTriangle,
  Bell,
  CalendarClock,
  ChevronRight,
  Copy,
  FileWarning,
  List,
  MessageSquareWarning,
} from "lucide-react"
import { Link } from "@tanstack/react-router"
import { alerts } from "@/data/dashboard-data"
import { cn } from "@/lib/utils"

const severityTheme = {
  critical: {
    bar: "bg-destructive",
    card: "bg-destructive/[0.06] ring-destructive/15",
    icon: "bg-destructive/15 text-destructive",
    badge: "bg-destructive text-white",
  },
  warning: {
    bar: "bg-[#f59e0b]",
    card: "bg-[#f59e0b]/[0.07] ring-[#f59e0b]/20",
    icon: "bg-[#f59e0b]/15 text-[#d97706] dark:text-[#fbbf24]",
    badge: "bg-[#f59e0b] text-white",
  },
  info: {
    bar: "bg-[#3b82f6]",
    card: "bg-[#3b82f6]/[0.07] ring-[#3b82f6]/20",
    icon: "bg-[#3b82f6]/15 text-[#1d4ed8] dark:text-[#93c5fd]",
    badge: "bg-[#3b82f6] text-white",
  },
} as const

const titleIcons = [Copy, FileWarning, MessageSquareWarning, FileWarning, CalendarClock]

export function AlertsWidget({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="alerts-heading"
      className={cn(
        "dashboard-panel stagger-in flex h-full flex-col overflow-hidden p-4 sm:p-5",
        className,
      )}
      style={{ animationDelay: "180ms" }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            id="alerts-heading"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            Needs your attention
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Problems and deadlines that need action soon
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-semibold text-destructive ring-1 ring-destructive/20">
          <Bell className="size-3.5" />
          {alerts.length} active
        </span>
      </div>

      <ul className="thin-scroll mb-4 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-0.5">
        {alerts.map((alert, index) => {
          const theme = severityTheme[alert.severity]
          const TitleIcon = titleIcons[index] ?? AlertTriangle

          return (
            <li key={alert.id}>
              <Link
                to="/alerts/$alertId"
                params={{ alertId: alert.id }}
                className={cn(
                  "group relative flex w-full gap-3 overflow-hidden rounded-2xl p-3 text-left ring-1 transition-all",
                  "hover:-translate-y-0.5 hover:shadow-md",
                  theme.card,
                )}
              >
                <span className={cn("absolute inset-y-0 left-0 w-1", theme.bar)} />

                <span
                  className={cn(
                    "ml-1.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
                    theme.icon,
                  )}
                >
                  <TitleIcon className="size-4.5" />
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase",
                        theme.badge,
                      )}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {alert.detail}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold tabular-nums text-foreground">
                      {alert.count.toLocaleString("en-IN")}{" "}
                      {alert.count === 1 ? "item" : "items"}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      {alert.time}
                      <ChevronRight className="size-3.5 opacity-50 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>

      <Link
        to="/alerts/$alertId"
        params={{ alertId: alerts[0]?.id ?? "a1" }}
        className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-primary/10 dark:text-primary dark:hover:bg-primary/15"
      >
        <List className="size-4" />
        View all alerts
        <ChevronRight className="size-4 opacity-60" />
      </Link>
    </section>
  )
}
