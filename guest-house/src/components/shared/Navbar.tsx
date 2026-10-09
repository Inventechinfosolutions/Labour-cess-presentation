import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { LogOut, Menu } from "lucide-react"
import { BrandMark } from "@/components/shared/BrandLogo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/context/AuthContext"

const LANDING_NAV = [
  { href: "#about", label: "About" },
  { href: "#locations", label: "Locations" },
  { href: "#how", label: "How it works" },
  { href: "#notices", label: "Notices" },
] as const

interface NavbarProps {
  variant?: "landing" | "app"
  lightHero?: boolean
}

export function Navbar({ variant = "landing", lightHero = false }: NavbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (variant !== "landing") return
    const onScroll = () => setScrolled(window.scrollY > 18)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [variant])

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const isLanding = variant === "landing"
  const useSolidNav = isLanding && (scrolled || lightHero)

  return (
    <header
      className={
        isLanding
          ? `landing-navbar fixed left-0 right-0 top-0 z-50 h-14 transition-all duration-500 [transform:translateZ(0)] ${
              useSolidNav
                ? `border-b border-border/50 bg-background/90 shadow-[0_1px_0_0_var(--border)] backdrop-blur-2xl backdrop-saturate-150 ${
                    scrolled ? "landing-navbar--scrolled" : "landing-navbar--light-hero"
                  }`
                : "border-b border-transparent bg-transparent backdrop-blur-0"
            }`
          : "sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-lg"
      }
      style={isLanding ? { WebkitBackdropFilter: "saturate(1.1) blur(20px)" } : undefined}
    >
      <div className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark size="sm" className="shadow-sm shadow-primary/20" />
          <div className="hidden sm:block">
            <p className="landing-navbar__brand-text text-sm font-bold leading-none">GovGuestHouse</p>
            <p className="landing-navbar__brand-sub text-[10px]">Booking Platform</p>
          </div>
        </Link>

        {isLanding ? (
          <>
            <nav
              className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 md:flex"
              aria-label="Primary"
            >
              {LANDING_NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="landing-navbar__link text-sm transition"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="landing-navbar__link hidden rounded-md px-3 py-1.5 text-sm transition lg:inline-flex"
            >
              Sign In
            </Link>
            <Link
              to="/login"
              className="landing-navbar__cta inline-flex h-9 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition hover:brightness-110"
            >
              Get started
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="landing-navbar__menu-btn inline-flex size-9 items-center justify-center rounded-md transition sm:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="landing-navbar__sheet w-64">
                <nav className="mt-8 flex flex-col gap-1">
                  {LANDING_NAV.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="landing-navbar__mobile-link rounded-md px-3 py-2 text-sm"
                    >
                      {item.label}
                    </a>
                  ))}
                  <div className="my-2 border-t border-border/50" />
                  <Link to="/login" className="landing-navbar__mobile-link rounded-md px-3 py-2 text-sm">
                    Sign In
                  </Link>
                  <Link
                    to="/login"
                    className="landing-navbar__mobile-cta inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground"
                  >
                    Get started
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {user.name}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-1.5 size-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
