import { Building2, Scale } from "lucide-react"
import { dashboardMeta } from "@/data/dashboard-data"
import { GlobalSearch } from "@/components/dashboard/global-search"
import { ThemeToggle } from "@/components/dashboard/theme-toggle"
import { Badge } from "@/components/ui/badge"

export function DashboardHeader() {
  return (
    <header className="stagger-in sticky top-0 z-40 border-b border-border/50 bg-[color-mix(in_srgb,var(--background)_82%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl navy-panel shadow-lg">
              <Scale className="size-6 text-gold" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-semibold tracking-tight text-navy dark:text-foreground sm:text-3xl">
                  {dashboardMeta.shortTitle}
                </h1>
                <Badge className="rounded-lg bg-gold/15 text-gold ring-1 ring-gold/30 hover:bg-gold/20">
                  Executive Dashboard
                </Badge>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success ring-1 ring-success/25">
                  <span className="live-pulse size-1.5 rounded-full bg-success" />
                  Live
                </span>
              </div>
              <p className="font-display text-sm font-medium text-foreground/80 sm:text-base">
                {dashboardMeta.title}
              </p>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <Building2 className="size-3.5 shrink-0" />
                <span>{dashboardMeta.authority}</span>
                <span className="text-border">·</span>
                <span>Updated {dashboardMeta.lastUpdated}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        <GlobalSearch />
      </div>
    </header>
  )
}
