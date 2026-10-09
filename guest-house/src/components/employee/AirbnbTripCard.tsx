import { Link } from "react-router-dom"
import { Calendar, MapPin } from "lucide-react"
import type { Booking } from "@/types"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatCurrency, formatDate } from "@/utils/format"
import { getBookingImage } from "@/utils/entityImages"

interface AirbnbTripCardProps {
  booking: Booking
  linkTo?: string
}

export function AirbnbTripCard({ booking, linkTo }: AirbnbTripCardProps) {
  const content = (
    <article className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-airbnb)] transition-shadow hover:shadow-[var(--shadow-airbnb-hover)]">
      <div className="flex flex-col sm:flex-row">
        <div className="relative aspect-[16/10] w-full shrink-0 sm:aspect-auto sm:h-auto sm:w-48 md:w-56">
          <img
            src={getBookingImage(booking.id)}
            alt={booking.siteName}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{booking.id}</p>
                <h3 className="mt-1 truncate text-lg font-semibold">{booking.siteName}</h3>
              </div>
              <StatusBadge status={booking.status} />
            </div>
            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">
                  {booking.buildingName} · Room {booking.roomNumber}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-3.5 shrink-0" />
                <span>
                  {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
                </span>
              </div>
            </div>
          </div>
          <p className="mt-4 text-base font-semibold">{formatCurrency(booking.totalAmount)}</p>
        </div>
      </div>
    </article>
  )

  if (linkTo) return <Link to={linkTo}>{content}</Link>
  return content
}
