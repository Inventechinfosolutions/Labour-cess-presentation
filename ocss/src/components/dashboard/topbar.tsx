import { Bell, Menu, Shield } from "lucide-react"
import { dashboardMeta, userMeta } from "@/data/dashboard-data"
import { GlobalSearch } from "@/components/dashboard/global-search"
import { ThemeToggle } from "@/components/dashboard/theme-toggle"

export function Topbar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-white/80 backdrop-blur-xl dark:bg-[color-mix(in_srgb,var(--background)_80%,transparent)]">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 sm:gap-2.5 sm:px-5 lg:flex-nowrap lg:px-6">
        <button
          type="button"
          onClick={onMenu}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 lg:hidden dark:bg-muted dark:text-muted-foreground"
          aria-label="Open navigation"
        >
          <Menu className="size-4.5" />
        </button>

        <div className="min-w-0 flex-1 lg:max-w-xs xl:max-w-sm">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-9">
              <Shield className="size-3.5 sm:size-4" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold tracking-tight text-foreground sm:text-lg">
                {userMeta.name}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {userMeta.role}
              </p>
            </div>
          </div>
        </div>

        <div className="order-last w-full min-w-0 basis-full lg:order-none lg:mx-2 lg:w-auto lg:flex-1 lg:basis-auto">
          <GlobalSearch />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            className="relative flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-blue-50 hover:text-primary dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted"
            aria-label="Notifications"
          >
            <Bell className="size-4.5" />
            <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
              5
            </span>
          </button>

          <ThemeToggle />

          <div className="flex items-center gap-2 rounded-xl bg-slate-50 py-1 pl-1 pr-1 sm:pr-2.5 dark:bg-muted/50">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
              {userMeta.initials}
            </div>
            <div className="hidden leading-tight md:block">
              <p className="text-xs font-semibold text-foreground">{userMeta.name}</p>
              <p className="text-[10px] text-muted-foreground">{userMeta.role}</p>
            </div>
          </div>
        </div>
      </div>
      <p className="sr-only">{dashboardMeta.title}</p>
    </header>
  )
}
