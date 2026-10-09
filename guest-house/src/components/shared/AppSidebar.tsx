import { useEffect, useMemo, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { ChevronDown, LogOut } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { BrandMark } from "@/components/shared/BrandLogo"
import { getAdminProfileImage, getEmployeeProfileImage } from "@/utils/entityImages"
import { cn } from "@/lib/utils"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface NavGroup {
  id: string
  label: string
  icon?: LucideIcon
  items: NavItem[]
}

type SidebarVariant = "default" | "admin" | "employee"

interface AppSidebarProps {
  items?: NavItem[]
  groups?: NavGroup[]
  title: string
  subtitle?: string
  homeHref: string
  onNavigate?: () => void
  onSignOut?: () => void
  className?: string
  variant?: SidebarVariant
}

function isAirbnbSidebar(variant: SidebarVariant) {
  return variant === "admin" || variant === "employee"
}

export function isNavActive(pathname: string, href: string) {
  if (href === "/employee" || href === "/admin") {
    return pathname === href
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

function groupHasActiveItem(pathname: string, group: NavGroup) {
  return group.items.some((item) => isNavActive(pathname, item.href))
}

export function flattenNavGroups(groups: NavGroup[]): NavItem[] {
  return groups.flatMap((g) => g.items)
}

function NavLink({
  item,
  active,
  onNavigate,
  nested = false,
  variant = "default",
}: {
  item: NavItem
  active: boolean
  onNavigate?: () => void
  nested?: boolean
  variant?: SidebarVariant
}) {
  const isAdmin = isAirbnbSidebar(variant)

  return (
    <Link
      to={item.href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-2.5 rounded-xl py-2 text-sm font-medium leading-snug transition-colors",
        nested ? "px-3" : "px-3",
        isAdmin
          ? active
            ? "bg-muted text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          : active
            ? "bg-primary-foreground/28 font-semibold text-primary-foreground ring-2 ring-primary-foreground/50 shadow-sm shadow-black/25"
            : "text-primary-foreground/80 hover:bg-primary-foreground/14 hover:text-primary-foreground"
      )}
    >
      {isAdmin ? (
        <item.icon
          className={cn(
            "size-[18px] shrink-0 transition-colors",
            active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
          )}
        />
      ) : (
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-md border transition",
            nested ? "size-7" : "size-8",
            active
              ? "border-primary-foreground/45 bg-primary-foreground/35 text-primary-foreground shadow-sm shadow-black/20"
              : "border-primary-foreground/15 bg-primary-foreground/10 text-primary-foreground/75 group-hover:border-primary-foreground/25 group-hover:bg-primary-foreground/16 group-hover:text-primary-foreground"
          )}
        >
          <item.icon className={nested ? "size-3.5" : "size-4"} />
        </span>
      )}
      <span className="truncate">{item.label}</span>
      {active && isAdmin && (
        <span className="ml-auto size-1.5 shrink-0 rounded-full bg-primary" />
      )}
      {active && !isAdmin && (
        <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground shadow-md shadow-black/35" />
      )}
    </Link>
  )
}

function SidebarNavGroups({
  groups,
  onNavigate,
  variant = "default",
}: {
  groups: NavGroup[]
  onNavigate?: () => void
  variant?: SidebarVariant
}) {
  const location = useLocation()
  const isAdmin = isAirbnbSidebar(variant)
  const activeGroupId = useMemo(
    () => groups.find((g) => groupHasActiveItem(location.pathname, g))?.id ?? null,
    [groups, location.pathname]
  )

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const group of groups) {
      initial[group.id] = groupHasActiveItem(location.pathname, group)
    }
    return initial
  })

  useEffect(() => {
    if (activeGroupId) {
      setOpenGroups((prev) => ({ ...prev, [activeGroupId]: true }))
    }
  }, [activeGroupId])

  return (
    <div className="flex flex-col gap-0.5">
      {groups.map((group) => {
        const isOpen = openGroups[group.id] ?? false
        const hasActive = groupHasActiveItem(location.pathname, group)

        return (
          <Collapsible
            key={group.id}
            open={isOpen}
            onOpenChange={(open) => setOpenGroups((prev) => ({ ...prev, [group.id]: open }))}
          >
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-colors",
                  isAdmin
                    ? cn(
                        "text-xs font-semibold tracking-wide",
                        hasActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      )
                    : cn(
                        "text-[0.7rem] font-bold uppercase tracking-[0.08em]",
                        hasActive
                          ? "bg-primary-foreground/12 text-primary-foreground"
                          : "text-primary-foreground/65 hover:bg-primary-foreground/10 hover:text-primary-foreground/90"
                      )
                )}
              >
                {group.icon && (
                  <group.icon className={cn("size-3.5 shrink-0", isAdmin ? "opacity-60" : "opacity-80")} />
                )}
                <span className="flex-1 truncate">{group.label}</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 shrink-0 opacity-60 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
              <div
                className={cn(
                  "flex flex-col gap-0.5 py-1",
                  isAdmin ? "ml-1 pl-2" : "ml-1 border-l border-primary-foreground/15 pl-1.5"
                )}
              >
                {group.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={isNavActive(location.pathname, item.href)}
                    onNavigate={onNavigate}
                    nested
                    variant={variant}
                  />
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </div>
  )
}

export function AppSidebar({
  items,
  groups,
  title,
  subtitle,
  homeHref,
  onNavigate,
  onSignOut,
  className,
  variant = "default",
}: AppSidebarProps) {
  const location = useLocation()
  const { user } = useAuth()
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() ?? "?"
  const isAdmin = isAirbnbSidebar(variant)
  const profileImage = user
    ? variant === "admin"
      ? getAdminProfileImage(user.name)
      : getEmployeeProfileImage(user.name, user.id)
    : undefined

  return (
    <div className={cn("flex h-full min-h-0 flex-1 flex-col", className)}>
      <div className="border-b border-border/60 p-4 pb-3">
        <Link
          to={homeHref}
          onClick={onNavigate}
          className={cn(
            "group flex items-center gap-3 transition-opacity hover:opacity-90",
            !isAdmin &&
              "rounded-lg border border-primary-foreground/18 bg-primary-foreground/10 p-2 ring-1 ring-primary-foreground/12 hover:border-primary-foreground/28 hover:bg-primary-foreground/14"
          )}
        >
          <BrandMark
            size={isAdmin ? "md" : "sm"}
            className={cn(
              isAdmin
                ? "shadow-md"
                : "shadow-md shadow-black/25 ring-primary-foreground/15"
            )}
          />
          <div className="min-w-0 leading-tight">
            <div
              className={cn(
                "truncate font-semibold tracking-tight",
                isAdmin ? "text-base text-foreground" : "text-xs font-medium text-sidebar-foreground"
              )}
            >
              {isAdmin ? "Guest House" : "GovGuestHouse"}
            </div>
            <div
              className={cn(
                "truncate",
                isAdmin
                  ? "text-xs text-muted-foreground"
                  : "text-[10px] font-medium uppercase tracking-[0.1em] text-sidebar-foreground/85"
              )}
            >
              {variant === "admin"
                ? "Host dashboard"
                : variant === "employee"
                  ? "Employee portal"
                  : title}
            </div>
          </div>
        </Link>
        {subtitle && !isAdmin && (
          <p className="mt-2.5 text-[11px] leading-snug text-sidebar-foreground/60">{subtitle}</p>
        )}
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto p-3"
        aria-label={`${title} navigation`}
      >
        {groups ? (
          <SidebarNavGroups groups={groups} onNavigate={onNavigate} variant={variant} />
        ) : (
          items?.map((item) => {
            const active = isNavActive(location.pathname, item.href)
            return (
              <NavLink
                key={item.href}
                item={item}
                active={active}
                onNavigate={onNavigate}
                variant={variant}
              />
            )
          })
        )}
      </nav>

      <div className={cn("border-t p-3", isAdmin ? "border-border/60" : "border-primary-foreground/15 p-2")}>
        {user && (
          <div className="flex items-center gap-3 rounded-xl px-1 py-1.5">
            <Avatar
              className={cn(
                "size-9 shrink-0",
                isAdmin
                  ? "ring-1 ring-border"
                  : "ring-1 ring-primary-foreground/15"
              )}
            >
              <AvatarImage src={profileImage} alt={user.name} className="object-cover" />
              <AvatarFallback
                className={cn(
                  "text-xs font-semibold",
                  isAdmin
                    ? "bg-muted text-foreground"
                    : "bg-primary-foreground/22 text-sidebar-primary-foreground"
                )}
              >
                {initial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "truncate text-sm font-medium",
                  isAdmin ? "text-foreground" : "text-xs text-sidebar-foreground"
                )}
              >
                {user.name}
              </div>
              <div
                className={cn(
                  "truncate capitalize",
                  isAdmin ? "text-xs text-muted-foreground" : "text-[11px] text-sidebar-foreground/60"
                )}
              >
                {user.role}
              </div>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            onSignOut?.()
            onNavigate?.()
          }}
          className={cn(
            "mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            isAdmin
              ? "border border-border text-foreground hover:bg-muted"
              : "border border-primary-foreground/18 bg-primary-foreground/10 text-xs text-sidebar-foreground/90 hover:border-primary-foreground/28 hover:bg-primary-foreground/16 hover:text-sidebar-foreground"
          )}
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}

export function MobileNav({
  items,
  variant = "default",
}: {
  items: NavItem[]
  variant?: "default" | "admin"
}) {
  const location = useLocation()
  const isAdmin = variant === "admin"

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t bg-card lg:hidden",
        isAdmin
          ? "border-border/80 shadow-[0_-2px_16px_rgba(0,0,0,0.06)]"
          : "border-border shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      )}
    >
      <div className="flex justify-around px-1 py-2">
        {items.slice(0, 5).map((item) => {
          const active = isNavActive(location.pathname, item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors",
                active
                  ? isAdmin
                    ? "text-primary"
                    : "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("size-5", active && isAdmin && "stroke-[2.5]")} />
              <span className="max-w-[4rem] truncate">{item.label.split(" ")[0]}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
