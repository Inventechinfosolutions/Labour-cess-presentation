import { useMemo, useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  CalendarCheck,
  Home,
  KeyRound,
  MapPin,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { ExploreSearchProvider } from "@/context/ExploreSearchContext"
import { EmployeeAirbnbHeader, type EmployeeHeaderVariant } from "@/components/employee/EmployeeAirbnbHeader"
import { AppSidebar } from "@/components/shared/AppSidebar"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { getSiteSearchLabel } from "@/utils/siteCoordinates"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Explore", href: "/employee", icon: Home },
  { label: "Locations", href: "/employee/locations", icon: MapPin },
  { label: "Trips", href: "/employee/bookings", icon: CalendarCheck },
  { label: "Access", href: "/employee/access", icon: KeyRound },
]

function isBrowseLayoutRoute(pathname: string) {
  return pathname === "/employee" || pathname === "/employee/locations"
}

function getHeaderVariant(pathname: string): EmployeeHeaderVariant {
  if (isBrowseLayoutRoute(pathname)) return "browse"
  if (
    pathname.startsWith("/employee/locations/") ||
    pathname.startsWith("/employee/booking/") ||
    pathname === "/employee/payment"
  ) {
    return "results"
  }
  return "minimal"
}

function getPinnedDestination(pathname: string) {
  const match = pathname.match(/^\/employee\/locations\/([^/]+)/)
  if (!match) return undefined
  return getSiteSearchLabel(match[1])
}

export function EmployeeExploreLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const browseLayout = isBrowseLayoutRoute(location.pathname)
  const headerVariant = getHeaderVariant(location.pathname)
  const pinnedDestination = getPinnedDestination(location.pathname)

  const handleSignOut = () => {
    logout()
    navigate("/")
  }

  const mobileNavItems = useMemo(() => NAV_ITEMS, [])

  return (
    <ExploreSearchProvider>
    <div className="employee-explore-shell flex h-svh min-h-0 flex-col overflow-hidden bg-background">
      <EmployeeAirbnbHeader
        variant={headerVariant}
        pinnedDestination={pinnedDestination}
        onMenuClick={() => setMobileOpen(true)}
        onSignOut={handleSignOut}
      />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[min(100%,300px)] border-r-0 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Employee navigation</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col pt-10">
            <AppSidebar
              items={NAV_ITEMS}
              title="Employee portal"
              homeHref="/employee"
              variant="employee"
              onSignOut={handleSignOut}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <main
        className={cn(
          "min-h-0 flex-1 overflow-x-hidden",
          browseLayout ? "flex flex-col overflow-hidden" : "overflow-y-auto pb-20 lg:pb-0"
        )}
      >
        {browseLayout ? (
          <Outlet />
        ) : (
          <div className="explore-content-padded mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
            <Outlet />
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/80 bg-card shadow-[0_-2px_16px_rgba(0,0,0,0.06)] lg:hidden">
        <div className="flex justify-around px-1 py-2">
          {mobileNavItems.map((item) => {
            const active =
              item.href === "/employee"
                ? location.pathname === "/employee"
                : location.pathname === item.href || location.pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-colors",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("size-5", active && "stroke-[2.25]")} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
    </ExploreSearchProvider>
  )
}
