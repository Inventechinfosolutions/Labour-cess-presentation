import { useEffect, useState } from "react"
import {
  BadgeCheck,
  Banknote,
  Building2,
  ChevronsLeft,
  ChevronsRight,
  ClipboardCheck,
  Clock3,
  Database,
  FilePlus2,
  FileText,
  Gavel,
  LayoutDashboard,
  LineChart,
  LogOut,
  PieChart,
  ShieldAlert,
  Users,
  Wallet,
  X,
} from "lucide-react"
import { Link, useRouterState } from "@tanstack/react-router"
import type { NavIcon } from "@/data/dashboard-data"
import { dashboardMeta, navGroups, userMeta } from "@/data/dashboard-data"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn, publicUrl } from "@/lib/utils"

const SIDEBAR_COLLAPSED_KEY = "ocss-sidebar-collapsed"

const navIcons: Record<NavIcon, typeof LayoutDashboard> = {
  overview: LayoutDashboard,
  analytics: LineChart,
  registration: FilePlus2,
  entities: Building2,
  depositors: Users,
  claims: FileText,
  delayed: Clock3,
  verification: BadgeCheck,
  assessment: ClipboardCheck,
  settlement: Wallet,
  payments: Banknote,
  recovery: PieChart,
  alerts: ShieldAlert,
  reports: FileText,
  audit: Gavel,
  master: Database,
}

const navRoutes: Partial<
  Record<
    string,
    | "/"
    | "/claim-registration"
    | "/delayed-claims"
    | "/assessment"
    | "/companies"
    | "/victims"
    | "/claims"
    | "/assets"
    | "/reports"
  >
> = {
  overview: "/",
  "claim-registration": "/claim-registration",
  "delayed-claims": "/delayed-claims",
  assessment: "/assessment",
  entities: "/companies",
  depositors: "/victims",
  claims: "/claims",
  recovery: "/assets",
  reports: "/reports",
}

function pathMatches(pathname: string, to: string) {
  if (to === "/") return pathname === "/"
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function Sidebar({
  open,
  onClose,
  collapsed,
  onCollapsedChange,
}: {
  open: boolean
  onClose: () => void
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "bg-[var(--navy)] text-[var(--sidebar-foreground)]",
          "border-r border-[var(--sidebar-border)]",
          "transition-[width,transform] duration-300 ease-out lg:translate-x-0",
          collapsed ? "lg:w-[72px]" : "lg:w-[240px]",
          "w-[240px]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Edge collapse control */}
        <button
          type="button"
          onClick={() => onCollapsedChange(!collapsed)}
          className="absolute top-[52px] -right-3 z-20 hidden size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="size-3.5" />
          ) : (
            <ChevronsLeft className="size-3.5" />
          )}
        </button>

        {/* Brand */}
        <div
          className={cn(
            "relative overflow-hidden pb-4",
            collapsed ? "px-2 pt-3" : "px-4 pt-4",
          )}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-6 -top-8 size-28 rounded-full bg-[#2563eb]/25 blur-2xl"
          />
          <div
            className={cn(
              "relative flex items-center",
              collapsed ? "justify-center" : "gap-3",
            )}
          >
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 p-1 ring-1 ring-white/20 backdrop-blur-sm">
              <img
                src={publicUrl("karnataka-department-logo.png")}
                alt="Government of Karnataka emblem"
                className="size-full object-contain"
              />
            </div>
            {!collapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-[15px] font-semibold tracking-tight text-white">
                  {dashboardMeta.shortTitle}
                  <span className="mx-1 text-[#93c5fd]">·</span>
                  KPID
                </p>
                <p className="truncate text-[11px] text-slate-300">
                  Claim Settlement Management System
                </p>
              </div>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
              aria-label="Close navigation"
            >
              <X className="size-5" />
            </button>
          </div>
          {!collapsed ? (
            <p className="relative mt-3 text-[10px] font-medium tracking-wide text-slate-400">
              Karnataka · Competent Authority
            </p>
          ) : null}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 flex h-[3px]"
          >
            <span className="flex-1 bg-[#FF9933]" />
            <span className="flex-1 bg-white" />
            <span className="flex-1 bg-[#138808]" />
          </div>
        </div>

        {/* Nav */}
        <nav
          className={cn(
            "thin-scroll flex-1 space-y-5 overflow-y-auto py-4",
            collapsed ? "px-2" : "px-3",
          )}
        >
          {navGroups.map((group, gi) => (
            <div key={group.heading ?? `group-${gi}`} className="space-y-0.5">
              {group.heading && !collapsed ? (
                <p className="px-2.5 pb-1.5 text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                  {group.heading}
                </p>
              ) : null}
              {group.items.map((item) => {
                const Icon = navIcons[item.icon]
                const route = navRoutes[item.id]
                const isActive = route ? pathMatches(pathname, route) : false

                const content = (
                  <>
                    <Icon className="size-4 shrink-0" />
                    {!collapsed ? (
                      <>
                        <span className="flex-1 truncate text-left">
                          {item.label}
                        </span>
                        {item.badge ? (
                          <span
                            className={cn(
                              "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                              isActive
                                ? "bg-white/15 text-white"
                                : "bg-white/[0.06] text-slate-400",
                            )}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </>
                    ) : null}
                  </>
                )

                const linkClass = cn(
                  "nav-link w-full",
                  collapsed && "justify-center px-0",
                )

                const link = route ? (
                  <Link
                    to={route}
                    data-active={isActive}
                    onClick={onClose}
                    className={linkClass}
                    aria-label={item.label}
                  >
                    {content}
                  </Link>
                ) : (
                  <button
                    type="button"
                    data-active={isActive}
                    onClick={onClose}
                    className={linkClass}
                    aria-label={item.label}
                  >
                    {content}
                  </button>
                )

                if (!collapsed) {
                  return (
                    <div key={item.id}>{link}</div>
                  )
                }

                return (
                  <Tooltip key={item.id}>
                    <TooltipTrigger render={link} />
                    <TooltipContent side="right" sideOffset={8}>
                      {item.label}
                      {item.badge ? ` · ${item.badge}` : ""}
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div
          className={cn(
            "border-t border-white/[0.08]",
            collapsed ? "p-2" : "p-3",
          )}
        >
          {!collapsed ? (
            <>
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-2.5 py-2.5 ring-1 ring-white/10">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-[11px] font-bold tracking-wide text-white">
                  {userMeta.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {userMeta.name}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {userMeta.role}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="nav-link mt-1.5 w-full text-slate-400 hover:text-rose-300"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className="flex size-9 items-center justify-center rounded-full bg-[#2563eb] text-[11px] font-bold tracking-wide text-white">
                      {userMeta.initials}
                    </div>
                  }
                />
                <TooltipContent side="right" sideOffset={8}>
                  {userMeta.name} · {userMeta.role}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-rose-300"
                      aria-label="Sign out"
                    >
                      <LogOut className="size-4" />
                    </button>
                  }
                />
                <TooltipContent side="right" sideOffset={8}>
                  Sign out
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
      if (stored === "1") setCollapsed(true)
    } catch {
      /* ignore */
    }
  }, [])

  const onCollapsedChange = (next: boolean) => {
    setCollapsed(next)
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0")
    } catch {
      /* ignore */
    }
  }

  return { collapsed, onCollapsedChange }
}
