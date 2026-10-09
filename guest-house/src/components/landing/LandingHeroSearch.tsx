import { Link } from "react-router-dom"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface LandingHeroSearchProps {
  className?: string
}

export function LandingHeroSearch({ className }: LandingHeroSearchProps) {
  return (
    <Link
      to="/login"
      className={cn(
        "group flex w-full items-center gap-3 rounded-full border border-border bg-card py-3 pl-3 pr-4 shadow-[0_1px_2px_rgba(0,0,0,0.06),0_4px_16px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] sm:py-3.5 sm:pl-3.5",
        className,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
        <Search className="size-4" strokeWidth={2.75} aria-hidden />
      </span>
      <span className="min-w-0 truncate text-sm font-medium text-foreground sm:text-[15px]">
        Bengaluru · Guest house · Add dates
      </span>
    </Link>
  )
}
