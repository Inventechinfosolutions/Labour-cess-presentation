import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import { Minus, Plus, Search } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { ExploreDatePicker } from "@/components/employee/ExploreDatePicker"
import { ExploreWhereDropdown } from "@/components/employee/ExploreWhereDropdown"
import { useExploreSearch } from "@/context/ExploreSearchContext"
import { cn } from "@/lib/utils"

type SearchField = "where" | "when" | "who"

function ExploreSearchHouseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5 shrink-0", className)} aria-hidden>
      <path fill="#10B981" d="M12 3 2 12h2v9h6v-6h4v6h6v-9h2L12 3z" />
      <rect x="10" y="14" width="4" height="4" rx="0.5" fill="#EF4444" />
      <rect x="9" y="11" width="2" height="2" rx="0.25" fill="#FDE68A" />
      <rect x="13" y="11" width="2" height="2" rx="0.25" fill="#FDE68A" />
    </svg>
  )
}

function formatDateRange(range: DateRange | undefined) {
  if (!range?.from) return "Add dates"
  if (!range.to) return format(range.from, "d MMM")
  return `${format(range.from, "d MMM")} - ${format(range.to, "d MMM")}`
}

function formatGuests(count: number) {
  if (count < 1) return "Add guests"
  return count === 1 ? "1 guest" : `${count} guests`
}

interface ExploreSearchBarProps {
  className?: string
  variant?: "browse" | "default" | "compact"
  pinnedDestination?: string
  onOpenChange?: (open: boolean) => void
  onHasDestinationChange?: (hasDestination: boolean) => void
}

export function ExploreSearchBar({
  className,
  variant = "default",
  pinnedDestination,
  onOpenChange,
  onHasDestinationChange,
}: ExploreSearchBarProps) {
  const {
    submitSearch,
    resetSearch,
    destination: ctxDestination,
    dateRange: ctxDateRange,
    guests: ctxGuests,
    updateTripDetails,
  } = useExploreSearch()

  const [open, setOpen] = useState(false)
  const [activeField, setActiveField] = useState<SearchField>("where")
  const [destination, setDestination] = useState(() => pinnedDestination ?? ctxDestination ?? "")
  const [destinationQuery, setDestinationQuery] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => ctxDateRange)
  const [guests, setGuests] = useState(() => (ctxGuests >= 1 ? ctxGuests : 0))

  const rootRef = useRef<HTMLDivElement>(null)
  const whereInputRef = useRef<HTMLInputElement>(null)
  const hadDestinationRef = useRef(Boolean(pinnedDestination ?? ctxDestination))

  useEffect(() => {
    if (pinnedDestination) {
      setDestination(pinnedDestination)
      return
    }
    if (ctxDestination) setDestination(ctxDestination)
  }, [pinnedDestination, ctxDestination])

  useEffect(() => {
    setDateRange(ctxDateRange)
  }, [ctxDateRange?.from?.getTime(), ctxDateRange?.to?.getTime()])

  useEffect(() => {
    if (ctxGuests >= 1) setGuests(ctxGuests)
  }, [ctxGuests])

  const hasDestination = pinnedDestination ? true : destination.trim().length > 0
  const destinationLabel = pinnedDestination ?? destination
  const useCompactPill = variant !== "browse"
  const showCompact = useCompactPill && !open && hasDestination
  const showExpanded = !showCompact

  const setSearchOpen = (next: boolean) => {
    setOpen(next)
    onOpenChange?.(next)
    if (!next) setActiveField("where")
  }

  const openField = (field: SearchField) => {
    setActiveField(field)
    setSearchOpen(true)
  }

  useEffect(() => {
    onHasDestinationChange?.(hasDestination)

    if (hadDestinationRef.current && !hasDestination && !pinnedDestination) {
      resetSearch()
      setDateRange(undefined)
      setGuests(0)
    }

    hadDestinationRef.current = hasDestination
  }, [hasDestination, pinnedDestination, onHasDestinationChange, resetSearch])

  useEffect(() => {
    if (!dateRange?.from && guests < 1) return
    updateTripDetails({
      dateRange,
      guests: guests >= 1 ? guests : 1,
    })
  }, [dateRange, guests, updateTripDetails])

  useEffect(() => {
    if (open && activeField === "where") {
      const timer = window.setTimeout(() => whereInputRef.current?.focus(), 80)
      return () => window.clearTimeout(timer)
    }
  }, [open, activeField])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false)
    }

    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current?.contains(e.target as Node)) return
      setSearchOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)
    const pointerTimer = window.setTimeout(() => {
      document.addEventListener("mousedown", onPointerDown)
    }, 0)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("mousedown", onPointerDown)
      window.clearTimeout(pointerTimer)
    }
  }, [open])

  const datesLabel = formatDateRange(dateRange)
  const guestsLabel = formatGuests(guests)

  const handleDestinationSelect = (label: string) => {
    setDestination(label)
    setDestinationQuery("")
    setActiveField("when")
    setSearchOpen(true)
  }

  const handleSearch = () => {
    if (!hasDestination) return
    const guestCount = guests < 1 ? 1 : guests
    if (guests < 1) setGuests(guestCount)
    submitSearch({
      destination: destinationLabel,
      dateRange,
      guests: guestCount,
    })
    setSearchOpen(false)
  }

  const whereDisplay = hasDestination ? destinationLabel : "Search destinations"

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 cursor-default bg-black/25 backdrop-blur-[1px]"
          aria-label="Close search"
          onClick={() => setSearchOpen(false)}
        />
      )}

      <div
        ref={rootRef}
        className={cn("relative z-50", showExpanded && "max-w-[52rem]", className)}
      >
        {showCompact ? (
          <button
            type="button"
            onClick={() => openField("where")}
            className="explore-search-compact group flex w-full items-center rounded-full border border-border/80 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_20px_rgba(0,0,0,0.08)]"
          >
            <span className="flex min-w-0 flex-1 items-center gap-2.5 py-2.5 pl-4 pr-3 sm:pl-5">
              <ExploreSearchHouseIcon />
              <span className="truncate text-sm font-semibold text-foreground">{destinationLabel}</span>
            </span>
            <span className="h-6 w-px shrink-0 bg-border/90" aria-hidden />
            <span className="hidden shrink-0 px-4 py-2.5 text-sm font-semibold text-foreground sm:inline">
              {datesLabel}
            </span>
            <span className="hidden h-6 w-px shrink-0 bg-border/90 sm:block" aria-hidden />
            <span className="hidden shrink-0 px-4 py-2.5 text-sm font-semibold text-foreground md:inline">
              {guestsLabel}
            </span>
            <span
              className="explore-search-btn m-1 flex size-8 shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-sm sm:m-1.5 sm:size-9"
              aria-hidden
            >
              <Search className="size-3.5 sm:size-4" strokeWidth={3} />
            </span>
          </button>
        ) : (
          <div
            className={cn(
              "explore-search-expanded flex w-full items-center rounded-full border border-border/60 bg-card shadow-[0_1px_2px_rgba(0,0,0,0.08),0_4px_12px_rgba(0,0,0,0.05)]",
              variant === "browse"
                ? "gap-0 p-0 sm:gap-0"
                : "gap-0.5 bg-[#f7f7f7] p-1 shadow-[0_1px_2px_rgba(0,0,0,0.06)] sm:gap-1 sm:p-1.5"
            )}
          >
            <button
              type="button"
              onClick={() => openField("where")}
              className={cn(
                "flex min-w-0 flex-1 flex-col text-left transition-all sm:flex-[1.35]",
                variant === "browse"
                  ? "rounded-l-full px-5 py-3.5 hover:bg-muted/30 sm:px-6"
                  : "rounded-full px-4 py-2.5 sm:px-5",
                open && activeField === "where"
                  ? "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
                  : variant !== "browse" && "hover:bg-white/70"
              )}
            >
              <span className="text-xs font-semibold text-foreground">Where</span>
              {open && activeField === "where" ? (
                <input
                  ref={whereInputRef}
                  value={destinationQuery}
                  onChange={(e) => setDestinationQuery(e.target.value)}
                  placeholder="Search destinations"
                  className="mt-0.5 w-full truncate border-0 bg-transparent p-0 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              ) : (
                <span
                  className={cn(
                    "mt-0.5 truncate text-sm",
                    hasDestination ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {whereDisplay}
                </span>
              )}
            </button>

            <span
              className={cn(
                "hidden h-8 w-px shrink-0 bg-border/70 sm:block",
                variant === "browse" && "h-8"
              )}
            />

            <button
              type="button"
              onClick={() => openField("when")}
              className={cn(
                "flex min-w-[5.5rem] flex-col text-left transition-all sm:min-w-[6.5rem]",
                variant === "browse" ? "px-4 py-3.5 hover:bg-muted/30 sm:px-6" : "hidden sm:flex rounded-full px-4 py-2.5 sm:px-5",
                open && activeField === "when"
                  ? "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
                  : variant !== "browse" && "hover:bg-white/70"
              )}
            >
              <span className="text-xs font-semibold text-foreground">When</span>
              <span className="mt-0.5 truncate text-sm text-muted-foreground">{datesLabel}</span>
            </button>

            <span className={cn("h-8 w-px shrink-0 bg-border/70", variant !== "browse" && "hidden sm:block")} />

            <button
              type="button"
              onClick={() => openField("who")}
              className={cn(
                "flex min-w-[4.5rem] flex-col text-left transition-all sm:min-w-[5.5rem]",
                variant === "browse" ? "px-4 py-3.5 hover:bg-muted/30 sm:px-6" : "hidden md:flex rounded-full px-4 py-2.5 sm:px-5",
                open && activeField === "who"
                  ? "bg-white shadow-[0_2px_12px_rgba(0,0,0,0.12)]"
                  : variant !== "browse" && "hover:bg-white/70"
              )}
            >
              <span className="text-xs font-semibold text-foreground">Who</span>
              <span className="mt-0.5 truncate text-sm text-muted-foreground">{guestsLabel}</span>
            </button>

            <button
              type="button"
              onClick={handleSearch}
              className={cn(
                "explore-search-btn flex shrink-0 items-center justify-center rounded-full text-primary-foreground shadow-md transition-transform hover:scale-[1.02]",
                open
                  ? "m-1 gap-2 px-5 py-3.5 text-sm font-semibold"
                  : variant === "browse"
                    ? "m-2 size-12"
                    : "m-0.5 size-10 sm:m-1 sm:size-11"
              )}
            >
              <Search className="size-4" strokeWidth={open ? 2.5 : 3} />
              {open && <span>Search</span>}
            </button>
          </div>
        )}

        {open && (
          <div
            className={cn(
              "absolute left-1/2 top-[calc(100%+0.75rem)] -translate-x-1/2",
              activeField === "when"
                ? "w-[min(calc(100vw-1.5rem),42rem)]"
                : "w-[min(calc(100vw-1.5rem),28rem)]"
            )}
          >
            {activeField === "where" && (
              <ExploreWhereDropdown
                query={destinationQuery}
                dateRange={dateRange}
                guests={Math.max(guests, 1)}
                onSelect={(label) => handleDestinationSelect(label)}
              />
            )}

            {activeField === "when" && (
              <ExploreDatePicker range={dateRange} onRangeChange={setDateRange} />
            )}

            {activeField === "who" && (
              <div className="overflow-hidden rounded-3xl border border-border/60 bg-card p-5 shadow-[0_8px_28px_rgba(0,0,0,0.12)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">Guests</p>
                    <p className="text-xs text-muted-foreground">Government employees only</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={guests <= 1}
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      className="flex size-8 items-center justify-center rounded-full border border-border/80 transition-colors hover:border-foreground disabled:opacity-30"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">
                      {Math.max(guests, 1)}
                    </span>
                    <button
                      type="button"
                      disabled={guests >= 4}
                      onClick={() => setGuests((g) => Math.min(4, Math.max(1, g) + 1))}
                      className="flex size-8 items-center justify-center rounded-full border border-border/80 transition-colors hover:border-foreground disabled:opacity-30"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
