import { Link } from "react-router-dom"
import { BrandMark } from "@/components/shared/BrandLogo"
import { cn } from "@/lib/utils"

interface LandingHostHeaderProps {
  scrolled?: boolean
}

export function LandingHostHeader({ scrolled = false }: LandingHostHeaderProps) {
  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 border-b bg-white transition-shadow duration-200",
        scrolled ? "border-border/60 shadow-sm" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-6 sm:px-10 lg:px-12">
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <BrandMark size="sm" className="shadow-sm shadow-primary/20" />
          <span className="hidden text-lg font-bold tracking-tight text-[#222222] sm:inline">
            GovGuestHouse
          </span>
        </Link>

        <Link
          to="/login"
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
        >
          Book now
        </Link>
      </div>
    </header>
  )
}
