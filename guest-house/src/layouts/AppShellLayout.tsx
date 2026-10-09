import { useMemo, useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { AdminTopBar } from "@/components/admin/AdminTopBar"
import {
  AppSidebar,
  MobileNav,
  flattenNavGroups,
  type NavGroup,
  type NavItem,
} from "@/components/shared/AppSidebar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface AppShellLayoutProps {
  navItems?: NavItem[]
  navGroups?: NavGroup[]
  title: string
  subtitle: string
  homeHref: string
  variant?: "default" | "admin" | "employee"
}

export function AppShellLayout({
  navItems,
  navGroups,
  title,
  subtitle,
  homeHref,
  variant = "default",
}: AppShellLayoutProps) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAdmin = variant === "admin"
  const isEmployee = variant === "employee"
  const isAppShell = isAdmin || isEmployee

  const mobileNavItems = useMemo(() => {
    if (navGroups) {
      const flat = flattenNavGroups(navGroups)
      const priority = ["/admin", "/admin/bookings", "/admin/sites", "/admin/checkin", "/admin/payments"]
      const picked = priority
        .map((href) => flat.find((item) => item.href === href))
        .filter((item): item is NavItem => !!item)
      if (picked.length >= 5) return picked.slice(0, 5)
      const rest = flat.filter((item) => !priority.includes(item.href))
      return [...picked, ...rest].slice(0, 5)
    }
    if (navItems && isEmployee) {
      return navItems.slice(0, 5)
    }
    return navItems ?? []
  }, [navGroups, navItems, isEmployee])

  const handleSignOut = () => {
    logout()
    navigate("/")
  }

  const asideClass = "app-sidebar-rail"

  const sidebarProps = {
    title,
    subtitle,
    homeHref,
    onSignOut: handleSignOut,
    variant: isAppShell ? (isEmployee ? ("employee" as const) : ("admin" as const)) : ("default" as const),
    ...(navGroups ? { groups: navGroups } : { items: navItems ?? [] }),
  }

  return (
    <div
      className={cn(
        "flex h-svh min-h-0 overflow-hidden",
        isAppShell ? "admin-shell bg-background" : "bg-muted/25"
      )}
    >
      <aside className={cn(asideClass, "hidden shrink-0 lg:flex")} aria-label="Navigation">
        <AppSidebar {...sidebarProps} />
      </aside>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
        {isAppShell ? (
          <AdminTopBar
            portal={isEmployee ? "employee" : "admin"}
            onSignOut={handleSignOut}
            onMenuClick={() => setMobileOpen(true)}
          />
        ) : null}

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className={cn(asideClass, "w-[min(100%,300px)] border-r-0 p-0")}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{title} navigation</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col pt-10">
              <AppSidebar
                {...sidebarProps}
                onNavigate={() => setMobileOpen(false)}
              />
            </div>
          </SheetContent>
        </Sheet>

        <main className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-20 lg:pb-0">
          <div className={cn("app-content", isAppShell && "py-6 sm:py-8")}>
            <Outlet />
          </div>
        </main>
      </div>

      <MobileNav items={mobileNavItems} variant={isAppShell ? "admin" : "default"} />
    </div>
  )
}
