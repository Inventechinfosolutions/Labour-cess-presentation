import { MapPin, Star } from "lucide-react"
import type { Site } from "@/types"
import { getSiteListingImage } from "@/utils/entityImages"
import { cn } from "@/lib/utils"

interface BookingSiteHeroProps {
  site: Site
  className?: string
}

export function BookingSiteHero({ site, className }: BookingSiteHeroProps) {
  return (
    <div
      className={cn(
        "relative mb-8 overflow-hidden rounded-2xl border border-border/60 shadow-sm",
        className
      )}
    >
      <div className="relative aspect-[21/9] min-h-[180px] sm:aspect-[3/1]">
        <img
          src={getSiteListingImage(site.id)}
          alt={site.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0 text-white">
              <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{site.name}</h2>
              <p className="mt-1.5 flex items-start gap-1.5 text-sm text-white/85">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>{site.address}</span>
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-sm font-semibold text-foreground shadow-sm">
              <Star className="size-3.5 fill-foreground text-foreground" />
              {site.rating.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 divide-x divide-border/60 border-t border-border/60 bg-card">
        <div className="px-4 py-3 text-center sm:px-6 sm:py-4">
          <p className="text-lg font-semibold text-foreground sm:text-xl">{site.buildingsCount}</p>
          <p className="text-xs text-muted-foreground sm:text-sm">Buildings</p>
        </div>
        <div className="px-4 py-3 text-center sm:px-6 sm:py-4">
          <p className="text-lg font-semibold text-foreground sm:text-xl">{site.availableRooms}</p>
          <p className="text-xs text-muted-foreground sm:text-sm">Rooms free</p>
        </div>
        <div className="px-4 py-3 text-center sm:px-6 sm:py-4">
          <p className="text-lg font-semibold text-foreground sm:text-xl">{site.occupancy}%</p>
          <p className="text-xs text-muted-foreground sm:text-sm">Occupancy</p>
        </div>
      </div>
    </div>
  )
}
