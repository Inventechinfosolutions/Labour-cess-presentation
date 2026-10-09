import { Link } from "react-router-dom"
import { ArrowRight, Building2, ChevronRight, Layers } from "lucide-react"
import type { Building } from "@/types"
import { getBuildingImage } from "@/utils/entityImages"
import { cn } from "@/lib/utils"

interface EmployeeBuildingCardProps {
  building: Building
  linkTo: string
  variant?: "grid" | "list"
}

export function EmployeeBuildingCard({
  building,
  linkTo,
  variant = "list",
}: EmployeeBuildingCardProps) {
  const availability = 100 - building.occupancy
  const openRooms = Math.round((building.totalRooms * availability) / 100)

  if (variant === "grid") {
    return (
      <Link
        to={linkTo}
        className="group block overflow-hidden rounded-xl bg-card transition-shadow hover:shadow-[0_6px_20px_rgba(0,0,0,0.1)]"
      >
        <div className="relative aspect-[20/19] overflow-hidden rounded-xl bg-muted">
          <img
            src={getBuildingImage(building.id)}
            alt={building.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <span className="absolute left-3 top-3 rounded-md bg-card/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
            {building.floors} floors
          </span>
        </div>
        <div className="pt-3">
          <h3 className="truncate text-[15px] font-semibold text-foreground">{building.name}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {building.totalRooms} rooms · {availability}% available
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={linkTo}
      className="group flex gap-4 rounded-xl border border-border/60 p-4 transition-all hover:border-border hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)] sm:gap-5 sm:p-5"
    >
      <div className="relative size-[88px] shrink-0 overflow-hidden rounded-lg bg-muted sm:size-[112px]">
        <img
          src={getBuildingImage(building.id)}
          alt={building.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground sm:text-lg">{building.name}</h3>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Layers className="size-3.5" />
                {building.floors} floors
              </span>
              <span className="inline-flex items-center gap-1">
                <Building2 className="size-3.5" />
                {building.totalRooms} rooms
              </span>
            </p>
          </div>
          <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-foreground">
            <span className="font-semibold">{openRooms} rooms</span>
            <span className="text-muted-foreground"> available now</span>
          </p>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
              availability >= 50
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : availability >= 25
                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                  : "bg-red-500/10 text-red-700 dark:text-red-400"
            )}
          >
            {availability}% open
          </span>
        </div>

        <p className="mt-3 text-sm font-semibold text-foreground underline-offset-4 group-hover:underline">
          View floors
          <ArrowRight className="ml-1 inline size-3.5" />
        </p>
      </div>
    </Link>
  )
}
