import type { ComponentType } from "react"
import { Link, useLocation } from "react-router-dom"
import homesNavIcon from "@/assets/nav-home-icon.png"
import locationsNavIcon from "@/assets/nav-locations-icon.png"
import { cn } from "@/lib/utils"

interface NavTab {
  label: string
  href: string
  icon: ComponentType<{ className?: string }>
}

function HomesNavIcon({ className }: { className?: string }) {
  return (
    <img
      src={homesNavIcon}
      alt=""
      aria-hidden
      className={cn("size-8 shrink-0 object-contain", className)}
    />
  )
}

function LocationsNavIcon({ className }: { className?: string }) {
  return (
    <img
      src={locationsNavIcon}
      alt=""
      aria-hidden
      className={cn("size-8 shrink-0 object-contain", className)}
    />
  )
}

function TripsNavIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8 shrink-0", className)} aria-hidden>
      <rect x="6" y="11" width="20" height="14" rx="2.5" fill="#484848" stroke="#222" strokeWidth="1" />
      <path
        d="M10 11V9a6 6 0 0 1 12 0v2"
        fill="none"
        stroke="#222"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <rect x="6" y="14" width="20" height="3" fill="#222" opacity="0.15" />
      <rect x="13" y="19" width="6" height="4" rx="1" fill="#FF385C" />
      <circle cx="11" cy="24" r="1.2" fill="#717171" />
      <circle cx="21" cy="24" r="1.2" fill="#717171" />
    </svg>
  )
}

const TABS: NavTab[] = [
  { label: "Homes", href: "/employee", icon: HomesNavIcon },
  { label: "Locations", href: "/employee/locations", icon: LocationsNavIcon },
  { label: "Trips", href: "/employee/bookings", icon: TripsNavIcon },
]

function isTabActive(pathname: string, href: string) {
  if (href === "/employee") return pathname === "/employee"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function ExploreTopNav({ className }: { className?: string }) {
  const location = useLocation()

  return (
    <nav
      className={cn("hidden items-center justify-center gap-6 lg:gap-10 md:flex", className)}
      aria-label="Primary"
    >
      {TABS.map((tab) => {
        const active = isTabActive(location.pathname, tab.href)
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            to={tab.href}
            className={cn(
              "group flex min-w-[5.5rem] flex-col items-center transition-colors",
              active ? "text-foreground" : "text-[#717171] hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2 px-1 py-2.5">
              <Icon />
              <span className={cn("text-sm leading-none", active ? "font-semibold" : "font-medium")}>
                {tab.label}
              </span>
            </span>
            <span
              className={cn(
                "h-[3px] w-full rounded-t-sm transition-colors",
                active ? "bg-foreground" : "bg-transparent group-hover:bg-border"
              )}
              aria-hidden
            />
          </Link>
        )
      })}
    </nav>
  )
}
