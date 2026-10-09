import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/utils/format"

interface BookingStayPickerProps {
  checkIn?: Date
  checkOut?: Date
  guests: string
  maxGuests: number
  onCheckInChange: (date?: Date) => void
  onCheckOutChange: (date?: Date) => void
  onGuestsChange: (value: string) => void
}

export function BookingStayPicker({
  checkIn,
  checkOut,
  guests,
  maxGuests,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
}: BookingStayPickerProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
      <div className="grid grid-cols-2 divide-x divide-border/80">
        <div className="p-3 sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-foreground">
            Check-in
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "mt-1 h-auto w-full justify-start px-0 text-sm font-normal hover:bg-transparent",
                  !checkIn && "text-muted-foreground"
                )}
              >
                {checkIn ? format(checkIn, "dd MMM yyyy") : "Add date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkIn}
                onSelect={onCheckInChange}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="p-3 sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-wide text-foreground">
            Check-out
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "mt-1 h-auto w-full justify-start px-0 text-sm font-normal hover:bg-transparent",
                  !checkOut && "text-muted-foreground"
                )}
              >
                {checkOut ? format(checkOut, "dd MMM yyyy") : "Add date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={checkOut}
                onSelect={onCheckOutChange}
                disabled={(d) =>
                  d <= (checkIn ?? new Date(new Date().setHours(0, 0, 0, 0)))
                }
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="border-t border-border/80 p-3 sm:p-4">
        <p className="text-[10px] font-bold uppercase tracking-wide text-foreground">
          Guests
        </p>
        <Select value={guests} onValueChange={onGuestsChange}>
          <SelectTrigger className="mt-1 h-auto border-0 px-0 shadow-none focus:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: maxGuests }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                {i + 1} guest{i > 0 ? "s" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

interface BookingPriceWidgetProps {
  roomNumber: string
  roomType: string
  siteName: string
  imageSrc: string
  pricePerNight: number
  nights: number
  roomCharges: number | null
  taxes: number | null
  total: number | null
  canProceed: boolean
  onProceed: () => void
}

export function BookingPriceWidget({
  roomNumber,
  roomType,
  siteName,
  imageSrc,
  pricePerNight,
  nights,
  roomCharges,
  taxes,
  total,
  canProceed,
  onProceed,
}: BookingPriceWidgetProps) {
  const nightsLabel = nights === 1 ? "1 night" : `${nights} nights`

  return (
    <div className="rounded-xl border border-border/80 bg-card p-6 shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
      <div className="flex gap-4 border-b border-border/60 pb-5">
        <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
          <img src={imageSrc} alt={`Room ${roomNumber}`} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 pt-0.5">
          <p className="truncate text-sm font-semibold text-foreground">{siteName}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Room {roomNumber} · {roomType}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3 text-sm">
        {nights > 0 ? (
          <>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground underline decoration-dotted underline-offset-2">
                {formatCurrency(pricePerNight)} × {nightsLabel}
              </span>
              <span className="shrink-0 text-foreground">
                {roomCharges != null ? formatCurrency(roomCharges) : "—"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Taxes (18% GST)</span>
              <span className="shrink-0 text-foreground">
                {taxes != null ? formatCurrency(taxes) : "—"}
              </span>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">Add dates to see the total price</p>
        )}
      </div>

      {total != null && nights > 0 && (
        <div className="mt-4 flex justify-between border-t border-border/60 pt-4 text-base font-semibold text-foreground">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      )}

      <button
        type="button"
        disabled={!canProceed}
        onClick={onProceed}
        className="explore-search-btn mt-5 w-full rounded-lg py-3.5 text-base font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        Proceed to payment
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        You&apos;ll review payment details on the next step
      </p>
    </div>
  )
}
