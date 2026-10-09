import { useState, type ReactNode } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  CalendarCheck,
  Globe,
  KeyRound,
  LogOut,
  MapPin,
  Menu,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useExploreSearch } from "@/context/ExploreSearchContext"
import { BrandLogo } from "@/components/shared/BrandLogo"
import { ExploreSearchBar } from "@/components/employee/ExploreSearchBar"
import { ExploreTopNav } from "@/components/employee/ExploreTopNav"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getEmployeeProfileImage } from "@/utils/entityImages"
import { cn } from "@/lib/utils"

export type EmployeeHeaderVariant = "browse" | "results" | "minimal"

interface EmployeeAirbnbHeaderProps {
  variant?: EmployeeHeaderVariant
  pinnedDestination?: string
  onMenuClick?: () => void
  onSignOut: () => void
}

function HeaderActions({
  displayName,
  avatarUrl,
  initial,
  onSignOut,
  navigate,
  className,
}: {
  displayName: string
  avatarUrl: string
  initial: string
  onSignOut: () => void
  navigate: ReturnType<typeof useNavigate>
  className?: string
}) {
  return (
    <div className={cn("flex items-center justify-end gap-1 sm:gap-2", className)}>
      <Button variant="ghost" size="icon" className="hidden size-10 rounded-full sm:inline-flex">
        <Globe className="size-[18px]" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex items-center gap-2 rounded-full border border-border/80 bg-card py-1.5 pl-3 pr-1.5 shadow-sm transition-shadow hover:shadow-[var(--shadow-airbnb)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="size-4 text-foreground" />
            <Avatar className="size-8">
              <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />
              <AvatarFallback className="bg-muted text-xs font-semibold">{initial}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 rounded-2xl p-1.5 shadow-[var(--shadow-airbnb)]">
          <DropdownMenuItem className="rounded-xl" onClick={() => navigate("/employee/bookings")}>
            <CalendarCheck className="mr-2 size-4" />
            My trips
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl" onClick={() => navigate("/employee/locations")}>
            <MapPin className="mr-2 size-4" />
            Browse guest houses
          </DropdownMenuItem>
          <DropdownMenuItem className="rounded-xl" onClick={() => navigate("/employee/access")}>
            <KeyRound className="mr-2 size-4" />
            Digital access
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="rounded-xl text-destructive focus:text-destructive"
            onClick={onSignOut}
          >
            <LogOut className="mr-2 size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function LogoLink({ className, children }: { className?: string; children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { resetSearch } = useExploreSearch()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    resetSearch()
    if (location.pathname !== "/employee") {
      navigate("/employee")
      return
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <Link
      to="/employee"
      onClick={handleClick}
      className={cn("shrink-0 transition-opacity hover:opacity-90", className)}
    >
      {children}
    </Link>
  )
}

export function EmployeeAirbnbHeader({
  variant = "browse",
  pinnedDestination,
  onMenuClick,
  onSignOut,
}: EmployeeAirbnbHeaderProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchOpen, setSearchOpen] = useState(false)
  const [, setHasDestination] = useState(false)

  const displayName = user?.name ?? "Employee"
  const avatarUrl = getEmployeeProfileImage(displayName, user?.id)
  const initial = displayName.charAt(0).toUpperCase()

  const browseMode = variant === "browse" && !searchOpen
  const resultsMode = variant === "results" && !searchOpen
  const minimalMode = variant === "minimal"
  const searchFocused = (variant === "browse" || variant === "results") && searchOpen

  return (
    <header
      className={cn(
        "explore-airbnb-header sticky top-0 z-50 border-b border-border/70 bg-background",
        browseMode && "explore-header--browse",
        (resultsMode || searchFocused) && variant === "results" && "explore-header--results",
        searchFocused && variant === "browse" && "explore-header--focused z-[60]"
      )}
    >
      {minimalMode ? (
        <div className="mx-auto flex h-16 w-full max-w-[1760px] items-center gap-3 px-4 sm:px-6 lg:px-10">
          {onMenuClick && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 rounded-full"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          )}
          <LogoLink>
            <BrandLogo size="sm" showText subtitle="" />
          </LogoLink>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-10 rounded-full" asChild>
              <Link to="/employee/bookings">
                <CalendarCheck className="size-[18px]" />
              </Link>
            </Button>
          </div>
        </div>
      ) : browseMode ? (
        <div className="mx-auto w-full max-w-[1760px] px-4 sm:px-6 lg:px-10">
          <div className="relative flex min-h-[5rem] items-center justify-between pt-3">
            <div className="flex items-center gap-3">
              {onMenuClick && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-10 shrink-0 rounded-full md:hidden"
                  onClick={onMenuClick}
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              )}
              <LogoLink>
                <BrandLogo size="sm" showText subtitle="" />
              </LogoLink>
            </div>

            <ExploreTopNav className="pointer-events-none absolute left-1/2 -translate-x-1/2 [&_a]:pointer-events-auto" />

            <HeaderActions
              displayName={displayName}
              avatarUrl={avatarUrl}
              initial={initial}
              onSignOut={onSignOut}
              navigate={navigate}
            />
          </div>

          <div className="flex justify-center pb-5 pt-2">
            <ExploreSearchBar
              className="w-full max-w-[53rem]"
              variant="browse"
              onOpenChange={setSearchOpen}
              onHasDestinationChange={setHasDestination}
            />
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "mx-auto flex w-full max-w-[1760px] items-center px-4 sm:px-6 lg:px-10",
            searchFocused ? "min-h-[5.5rem] justify-center py-4" : "h-20 py-0"
          )}
        >
          <div
            className={cn(
              "w-full",
              searchFocused
                ? "flex max-w-[52rem] justify-center"
                : "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:gap-4"
            )}
          >
            {!searchFocused && (
              <div className="flex items-center gap-2 justify-self-start sm:gap-3">
                {onMenuClick && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-10 shrink-0 rounded-full lg:hidden"
                    onClick={onMenuClick}
                    aria-label="Open menu"
                  >
                    <Menu className="size-5" />
                  </Button>
                )}
                <LogoLink>
                  <BrandLogo size="sm" showText subtitle="" className="hidden sm:flex" />
                  <BrandLogo size="sm" className="sm:hidden" />
                </LogoLink>
              </div>
            )}

            <div className="min-w-0 justify-self-center w-full max-w-[52rem]">
              <ExploreSearchBar
                className="w-full"
                variant="compact"
                pinnedDestination={pinnedDestination}
                onOpenChange={setSearchOpen}
                onHasDestinationChange={setHasDestination}
              />
            </div>

            {!searchFocused && (
              <HeaderActions
                displayName={displayName}
                avatarUrl={avatarUrl}
                initial={initial}
                onSignOut={onSignOut}
                navigate={navigate}
                className="justify-self-end"
              />
            )}
          </div>
        </div>
      )}
    </header>
  )
}
