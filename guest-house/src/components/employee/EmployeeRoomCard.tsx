import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { BedDouble, Check, Wifi } from "lucide-react"
import type { Room } from "@/types"
import { getBookingImage } from "@/utils/entityImages"
import { formatCurrency } from "@/utils/format"
import { cn } from "@/lib/utils"

interface EmployeeRoomCardProps {
  room: Room
  linkTo?: string
  nights?: number
}

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  "Wi-Fi": Wifi,
  AC: Wifi,
  TV: Wifi,
  "Smart TV": Wifi,
}

export function EmployeeRoomCard({ room, linkTo, nights = 1 }: EmployeeRoomCardProps) {
  const [imageSrc, setImageSrc] = useState(getBookingImage(room.id))
  const nightsLabel = nights === 1 ? "1 night" : `${nights} nights`
  const totalPrice = room.price * nights

  useEffect(() => {
    setImageSrc(getBookingImage(room.id))
  }, [room.id])

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]",
        !room.available && "opacity-75"
      )}
    >
      <div className="relative aspect-[5/3] overflow-hidden bg-muted">
        <img
          src={imageSrc}
          alt={`Room ${room.number}`}
          loading="lazy"
          onError={() => setImageSrc(getBookingImage(`${room.id}-alt`))}
          className={cn(
            "h-full w-full object-cover transition-transform duration-300",
            room.available && "group-hover:scale-[1.03]"
          )}
        />
        <span
          className={cn(
            "absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold shadow-sm",
            room.available
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80"
              : "bg-muted text-muted-foreground ring-1 ring-border/80"
          )}
        >
          {room.available ? "Available" : "Booked"}
        </span>
        <span className="absolute right-3 top-3 rounded-md bg-card/95 px-2.5 py-1 text-xs font-semibold text-foreground shadow-sm">
          {room.type}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <BedDouble className="size-4 shrink-0 text-primary" />
              <h3 className="truncate text-lg font-semibold text-foreground">Room {room.number}</h3>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Sleeps {room.capacity} · Government employee rate
            </p>
          </div>
        </div>

        <ul className="mt-4 space-y-2">
          {room.amenities.slice(0, 4).map((amenity) => {
            const Icon = AMENITY_ICONS[amenity] ?? Check
            return (
              <li key={amenity} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="size-3.5 shrink-0 text-foreground/70" />
                {amenity}
              </li>
            )
          })}
        </ul>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-border/60 pt-4">
          <div>
            <p className="text-[15px] text-foreground">
              <span className="font-semibold">{formatCurrency(totalPrice)}</span>
              <span className="font-normal text-muted-foreground"> for {nightsLabel}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(room.price)} per night
            </p>
          </div>

          {room.available && linkTo ? (
            <Link
              to={linkTo}
              className="explore-search-btn shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
            >
              Reserve
            </Link>
          ) : (
            <span className="shrink-0 rounded-lg border border-border/80 px-5 py-2.5 text-sm font-medium text-muted-foreground">
              Unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
