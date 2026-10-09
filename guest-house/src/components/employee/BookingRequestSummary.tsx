import { Link } from "react-router-dom"
import { format, parseISO } from "date-fns"
import { Star } from "lucide-react"
import type { BookingDraft, Room, Site } from "@/types"
import { calculateNights, formatCurrency } from "@/utils/format"

function formatStayDates(checkIn: string, checkOut: string) {
  const start = parseISO(checkIn)
  const end = parseISO(checkOut)
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${format(start, "d")}–${format(end, "d MMM yyyy")}`
  }
  return `${format(start, "d MMM")} – ${format(end, "d MMM yyyy")}`
}

interface BookingRequestSummaryProps {
  draft: BookingDraft
  room: Room
  site: Site
  imageSrc: string
  changeHref: string
}

export function BookingRequestSummary({
  draft,
  room,
  site,
  imageSrc,
  changeHref,
}: BookingRequestSummaryProps) {
  const nights = calculateNights(draft.checkIn, draft.checkOut)
  const nightsLabel = nights === 1 ? "1 night" : `${nights} nights`
  const pricePerNight = Math.round(draft.roomCharges / nights)
  const guestLabel = draft.guests === 1 ? "1 guest" : `${draft.guests} guests`

  const cancelBefore = parseISO(draft.checkIn)
  cancelBefore.setDate(cancelBefore.getDate() - 2)

  return (
    <div className="rounded-xl border border-border/80 bg-card p-6 shadow-[0_6px_16px_rgba(0,0,0,0.06)]">
      <div className="flex gap-4">
        <div className="size-[72px] shrink-0 overflow-hidden rounded-lg bg-muted">
          <img src={imageSrc} alt={`Room ${room.number}`} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-foreground">
            {site.name} · Room {room.number}
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="size-3.5 fill-foreground text-foreground" />
            {site.rating.toFixed(2)} · {room.type}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4 border-t border-border/60 pt-6 text-sm">
        <div>
          <p className="font-semibold text-foreground">Free cancellation</p>
          <p className="mt-1 leading-relaxed text-muted-foreground">
            Cancel before {format(cancelBefore, "d MMM, h:mm a")} for a full refund.{" "}
            <button type="button" className="font-semibold text-foreground underline underline-offset-2">
              Full policy
            </button>
          </p>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">Dates</p>
            <p className="mt-0.5 text-muted-foreground">
              {formatStayDates(draft.checkIn, draft.checkOut)}
            </p>
          </div>
          <Link
            to={changeHref}
            className="shrink-0 text-sm font-semibold text-foreground underline underline-offset-2"
          >
            Change
          </Link>
        </div>

        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">Guests</p>
            <p className="mt-0.5 capitalize text-muted-foreground">{guestLabel}</p>
          </div>
          <Link
            to={changeHref}
            className="shrink-0 text-sm font-semibold text-foreground underline underline-offset-2"
          >
            Change
          </Link>
        </div>
      </div>

      <div className="mt-6 border-t border-border/60 pt-6">
        <p className="text-base font-semibold text-foreground">Price details</p>
        <ul className="mt-4 space-y-3 text-sm">
          <li className="flex justify-between gap-4">
            <span className="text-muted-foreground underline decoration-dotted underline-offset-2">
              {nightsLabel} × {formatCurrency(pricePerNight)}
            </span>
            <span className="shrink-0 text-foreground">{formatCurrency(draft.roomCharges)}</span>
          </li>
          <li className="flex justify-between gap-4">
            <span className="text-muted-foreground">Taxes (18% GST)</span>
            <span className="shrink-0 text-foreground">{formatCurrency(draft.taxes)}</span>
          </li>
        </ul>

        <div className="mt-4 flex justify-between border-t border-border/60 pt-4 text-base font-semibold text-foreground">
          <span>Total INR</span>
          <span>{formatCurrency(draft.totalAmount)}</span>
        </div>

        <button
          type="button"
          className="mt-3 text-sm font-semibold text-foreground underline underline-offset-2"
        >
          Price breakdown
        </button>
      </div>
    </div>
  )
}
