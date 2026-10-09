import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  Bell,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Settings,
  Sun,
  Users,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/hooks/useTheme"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { getAdminProfileImage, getEmployeeProfileImage } from "@/utils/entityImages"
import { cn } from "@/lib/utils"

const ADMIN_BREADCRUMB_MAP: Record<string, string> = {
  admin: "Today",
  sites: "Sites",
  buildings: "Buildings",
  floors: "Floors",
  rooms: "Rooms",
  inventory: "Inventory",
  users: "Guests",
  bookings: "Bookings",
  "booking-override": "Overrides",
  checkin: "Check-in",
  checkout: "Check-out",
  occupancy: "Occupancy",
  access: "Access",
  payments: "Payments",
  reports: "Reports",
  audit: "Activity log",
  roles: "Team access",
  settings: "Settings",
  analytics: "Insights",
}

const EMPLOYEE_BREADCRUMB_MAP: Record<string, string> = {
  employee: "Home",
  locations: "Locations",
  bookings: "My bookings",
  access: "Digital access",
  book: "Book room",
  payment: "Payment",
  checkin: "Check-in",
  success: "Confirmation",
}

const ADMIN_NOTIFICATIONS = [
  { id: "1", title: "New booking needs approval", time: "2m ago", unread: true },
  { id: "2", title: "Payment received — ₹4,248", time: "15m ago", unread: true },
  { id: "3", title: "Late check-in — Room 203", time: "1h ago", unread: false },
  { id: "4", title: "Refund request submitted", time: "2h ago", unread: false },
]

const EMPLOYEE_NOTIFICATIONS = [
  { id: "1", title: "Booking confirmed — Mysuru GH", time: "1h ago", unread: true },
  { id: "2", title: "Check-in opens tomorrow at 2 PM", time: "3h ago", unread: true },
  { id: "3", title: "Digital key ready for Room 204", time: "Yesterday", unread: false },
  { id: "4", title: "Payment receipt available", time: "2 days ago", unread: false },
]

interface AdminTopBarProps {
  portal?: "admin" | "employee"
  onSignOut: () => void
  onMenuClick?: () => void
}

export function AdminTopBar({ portal = "admin", onSignOut, onMenuClick }: AdminTopBarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isEmployee = portal === "employee"
  const displayName = user?.name ?? (isEmployee ? "Employee" : "Admin")
  const displayEmail = user?.email ?? (isEmployee ? "employee@govguesthouse.in" : "admin@govguesthouse.in")
  const avatarUrl = isEmployee
    ? getEmployeeProfileImage(displayName, user?.id)
    : getAdminProfileImage(displayName)
  const initial = displayName.charAt(0).toUpperCase()
  const roleLabel = isEmployee ? "Employee" : "Super Admin"
  const breadcrumbMap = isEmployee ? EMPLOYEE_BREADCRUMB_MAP : ADMIN_BREADCRUMB_MAP
  const demoNotifications = isEmployee ? EMPLOYEE_NOTIFICATIONS : ADMIN_NOTIFICATIONS
  const unread = demoNotifications.filter((n) => n.unread).length

  const segments = location.pathname.split("/").filter(Boolean)
  const crumbs = segments.map((seg, i) => ({
    label: breadcrumbMap[seg] ?? seg.replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }))

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-[4.25rem] items-center gap-3 px-4 sm:px-5 lg:px-8">
        {onMenuClick && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 rounded-full lg:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </Button>
        )}

        <nav className="hidden min-w-0 items-center gap-1.5 text-sm md:flex" aria-label="Breadcrumb">
          {crumbs.map((crumb) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {crumb.href !== crumbs[0].href && (
                <ChevronRight className="size-3.5 text-muted-foreground/70" />
              )}
              {crumb.isLast ? (
                <span className="truncate font-semibold text-foreground">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.href}
                  className="truncate text-muted-foreground transition-colors hover:text-foreground hover:underline"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative size-10 rounded-full">
                <Bell className="size-[18px]" />
                {unread > 0 && (
                  <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 rounded-2xl p-0 shadow-[var(--shadow-airbnb)]">
              <div className="border-b border-border/60 px-4 py-4">
                <p className="font-semibold">Notifications</p>
                <p className="text-xs text-muted-foreground">{unread} unread</p>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {demoNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "border-b border-border/40 px-4 py-3.5 last:border-0",
                      n.unread && "bg-primary/[0.04]"
                    )}
                  >
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.time}</p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="icon"
            className="size-10 rounded-full"
            onClick={toggleTheme}
          >
            {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group flex max-w-[12.5rem] items-center gap-2.5 rounded-full border border-border/60 bg-card py-1 pl-1 pr-2.5 shadow-sm transition-all hover:border-border hover:shadow-[var(--shadow-airbnb)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:border-primary/30 data-[state=open]:shadow-[var(--shadow-airbnb)] sm:max-w-none sm:pr-3"
              >
                <Avatar className="size-9 shrink-0 ring-2 ring-primary/15 transition-transform group-hover:scale-[1.03]">
                  <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden min-w-0 flex-1 text-left sm:block">
                  <p className="truncate text-sm font-semibold leading-tight text-foreground">
                    {displayName}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground">{roleLabel}</p>
                </div>
                <ChevronDown className="hidden size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 sm:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 overflow-hidden rounded-2xl p-0 shadow-[var(--shadow-airbnb)]"
            >
              <div className="flex items-center gap-3 border-b border-border/60 bg-muted/30 px-4 py-4">
                <Avatar className="size-12 shrink-0 ring-2 ring-primary/20">
                  <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{displayEmail}</p>
                  <span className="mt-1.5 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    {roleLabel}
                  </span>
                </div>
              </div>
              <div className="p-1.5">
                {isEmployee ? (
                  <>
                    <DropdownMenuItem
                      className="gap-2.5 rounded-xl px-3 py-2.5"
                      onClick={() => navigate("/employee/bookings")}
                    >
                      <CalendarCheck className="size-4 text-muted-foreground" />
                      My bookings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2.5 rounded-xl px-3 py-2.5"
                      onClick={() => navigate("/employee/locations")}
                    >
                      <MapPin className="size-4 text-muted-foreground" />
                      Browse locations
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      className="gap-2.5 rounded-xl px-3 py-2.5"
                      onClick={() => navigate("/admin/settings")}
                    >
                      <Settings className="size-4 text-muted-foreground" />
                      Account settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="gap-2.5 rounded-xl px-3 py-2.5"
                      onClick={() => navigate("/admin/roles")}
                    >
                      <Users className="size-4 text-muted-foreground" />
                      Team & permissions
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  className="gap-2.5 rounded-xl px-3 py-2.5 text-destructive focus:text-destructive"
                  onClick={onSignOut}
                >
                  <LogOut className="size-4" />
                  Log out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
