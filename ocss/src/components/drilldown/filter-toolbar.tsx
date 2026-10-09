import type { ReactNode } from "react"
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

export type FilterOption = {
  value: string
  label: string
}

type FilterToolbarProps = {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  searchLabel?: string
  filters: FilterOption[]
  filterValue: string
  onFilterChange: (value: string) => void
  filterLabel?: string
  trailing?: ReactNode
  className?: string
}

export function FilterToolbar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  searchLabel = "Search",
  filters,
  filterValue,
  onFilterChange,
  filterLabel = "Filter",
  trailing,
  className,
}: FilterToolbarProps) {
  const activeLabel =
    filters.find((f) => f.value === filterValue)?.label ?? filterLabel

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap",
        className,
      )}
    >
      <label className="relative min-w-0 flex-1 sm:w-[220px] sm:flex-none md:w-[260px]">
        <span className="sr-only">{searchLabel}</span>
        <Search className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-muted-foreground/80" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className={cn(
            "h-10 w-full rounded-full border border-black/[0.08] bg-white pl-9 pr-3.5 text-sm text-foreground",
            "placeholder:text-muted-foreground/70",
            "shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none transition-shadow",
            "focus-visible:border-black/15 focus-visible:shadow-[0_0_0_3px_rgba(15,23,42,0.06)]",
            "dark:border-white/10 dark:bg-[#141c2c] dark:focus-visible:border-white/20 dark:focus-visible:shadow-[0_0_0_3px_rgba(255,255,255,0.06)]",
          )}
        />
      </label>

      <label className="relative shrink-0">
        <span className="sr-only">{filterLabel}</span>
        <SlidersHorizontal
          className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
          strokeWidth={1.85}
        />
        <select
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
          className={cn(
            "h-10 appearance-none rounded-full border border-black/[0.08] bg-[#f1f3f5] py-0 pr-9 pl-9 text-sm font-medium text-foreground",
            "outline-none transition-shadow",
            "focus-visible:border-black/15 focus-visible:shadow-[0_0_0_3px_rgba(15,23,42,0.06)]",
            "dark:border-white/10 dark:bg-white/[0.06] dark:focus-visible:border-white/20",
          )}
          aria-label={filterLabel}
        >
          {filters.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <span className="sr-only" aria-live="polite">
          {activeLabel}
        </span>
      </label>

      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  )
}
