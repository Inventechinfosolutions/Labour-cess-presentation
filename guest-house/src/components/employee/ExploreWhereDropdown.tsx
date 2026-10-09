import { format } from "date-fns"
import {
  Building2,
  MapPin,
  Mountain,
  Navigation,
  Palmtree,
  Trees,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"

interface DestinationOption {
  id: string
  label: string
  sub: string
  icon: LucideIcon
  iconBg: string
  iconColor: string
}

const SUGGESTED: DestinationOption[] = [
  {
    id: "nearby",
    label: "Nearby",
    sub: "Find what's around you",
    icon: Navigation,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
  },
  {
    id: "mysuru",
    label: "Mysuru, Karnataka",
    sub: "Near you",
    icon: Building2,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: "belagavi",
    label: "Belagavi, Karnataka",
    sub: "Popular with travellers near you",
    icon: Building2,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    id: "bengaluru",
    label: "Bengaluru, Karnataka",
    sub: "For nature lovers",
    icon: Mountain,
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    id: "mangaluru",
    label: "Mangaluru, Karnataka",
    sub: "Coastal government stays",
    icon: Palmtree,
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
  },
  {
    id: "nandi",
    label: "Nandi Hills, Karnataka",
    sub: "Weekend guest house escapes",
    icon: Trees,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
]

function formatRecentMeta(range: DateRange | undefined, guests: number) {
  const guestLabel = guests === 1 ? "1 guest" : `${guests} guests`
  if (!range?.from || !range?.to) return guestLabel
  if (range.from.getMonth() === range.to.getMonth()) {
    return `${format(range.from, "d")}–${format(range.to, "d MMM")} · ${guestLabel}`
  }
  return `${format(range.from, "d MMM")} – ${format(range.to, "d MMM")} · ${guestLabel}`
}

function DestinationRow({
  option,
  onSelect,
}: {
  option: DestinationOption
  onSelect: (label: string, id: string) => void
}) {
  const Icon = option.icon
  return (
    <button
      type="button"
      onClick={() => onSelect(option.label, option.id)}
      className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
    >
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl",
          option.iconBg
        )}
      >
        <Icon className={cn("size-5", option.iconColor)} strokeWidth={1.75} />
      </span>
      <span className="min-w-0">
        <span className="block text-[15px] font-semibold text-foreground">{option.label}</span>
        <span className="block text-sm text-muted-foreground">{option.sub}</span>
      </span>
    </button>
  )
}

interface ExploreWhereDropdownProps {
  query: string
  dateRange: DateRange | undefined
  guests: number
  onSelect: (label: string, id: string) => void
}

export function ExploreWhereDropdown({
  query,
  dateRange,
  guests,
  onSelect,
}: ExploreWhereDropdownProps) {
  const normalizedQuery = query.trim().toLowerCase()
  const filtered = SUGGESTED.filter(
    (d) =>
      d.label.toLowerCase().includes(normalizedQuery) ||
      d.sub.toLowerCase().includes(normalizedQuery)
  )

  const showSections = normalizedQuery.length === 0

  return (
    <div className="airbnb-where-dropdown max-h-[min(70vh,32rem)] overflow-y-auto rounded-[2rem] bg-card shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
      {showSections ? (
        <>
          <section className="px-2 pb-2 pt-4">
            <h3 className="px-4 pb-1 text-xs font-bold text-foreground">Recent searches</h3>
            <button
              type="button"
              onClick={() => onSelect("Bengaluru, Karnataka", "bengaluru")}
              className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                <MapPin className="size-5 text-foreground" strokeWidth={1.75} />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-foreground">Bengaluru</span>
                <span className="block text-sm text-muted-foreground">
                  {formatRecentMeta(dateRange, guests)}
                </span>
              </span>
            </button>
          </section>

          <section className="border-t border-border/40 px-2 py-2">
            <h3 className="px-4 pb-1 pt-2 text-xs font-bold text-foreground">
              Suggested destinations
            </h3>
            {SUGGESTED.map((option) => (
              <DestinationRow key={option.id} option={option} onSelect={onSelect} />
            ))}
          </section>
        </>
      ) : filtered.length > 0 ? (
        <section className="px-2 py-3">
          {filtered.map((option) => (
            <DestinationRow key={option.id} option={option} onSelect={onSelect} />
          ))}
        </section>
      ) : (
        <div className="px-6 py-10 text-center text-sm text-muted-foreground">
          No destinations found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  )
}
