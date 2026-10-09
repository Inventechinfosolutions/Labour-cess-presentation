import { Link } from "react-router-dom"
import { Calendar, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { formatCurrency, formatDate } from "@/utils/format"
import type { Booking } from "@/types"

interface BookingCardProps {
  booking: Booking
  linkTo?: string
}

export function BookingCard({ booking, linkTo }: BookingCardProps) {
  const content = (
    <Card className="hover-card border-border/60 transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{booking.id}</p>
            <h3 className="mt-1 font-semibold">{booking.siteName}</h3>
          </div>
          <StatusBadge status={booking.status} />
        </div>
        <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5" />
            <span>
              {booking.buildingName} · Room {booking.roomNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5" />
            <span>
              {formatDate(booking.checkIn)} — {formatDate(booking.checkOut)}
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm font-semibold text-primary">
          {formatCurrency(booking.totalAmount)}
        </p>
      </CardContent>
    </Card>
  )

  if (linkTo) return <Link to={linkTo}>{content}</Link>
  return content
}
