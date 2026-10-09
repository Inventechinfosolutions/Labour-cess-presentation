import { parseISO } from "date-fns"
import type { DateRange } from "react-day-picker"

function parseDateParam(value: string | null) {
  if (!value) return undefined
  const parsed = parseISO(value)
  return Number.isNaN(parsed.getTime()) ? undefined : parsed
}

export function resolveTripDetails(
  searchParams: URLSearchParams,
  dateRange: DateRange | undefined,
  searchGuests: number,
  maxGuests?: number
) {
  const checkIn = parseDateParam(searchParams.get("checkIn")) ?? dateRange?.from
  const checkOut = parseDateParam(searchParams.get("checkOut")) ?? dateRange?.to

  const guestsParam = searchParams.get("guests")
  const parsedGuests = guestsParam ? parseInt(guestsParam, 10) : searchGuests
  const guestCount = Math.max(1, Number.isNaN(parsedGuests) ? 1 : parsedGuests)
  const cappedGuests = maxGuests ? Math.min(guestCount, maxGuests) : guestCount

  return {
    checkIn,
    checkOut,
    guests: String(cappedGuests),
    isPrefilled: Boolean(checkIn && checkOut),
  }
}
