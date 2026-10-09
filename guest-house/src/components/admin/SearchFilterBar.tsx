import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface SearchFilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  status?: string
  onStatusChange?: (value: string) => void
  statusOptions?: { value: string; label: string }[]
  filterVariant?: "pills" | "select"
  embedded?: boolean
  className?: string
}

export function SearchFilterBar({
  search,
  onSearchChange,
  placeholder = "Search...",
  status,
  onStatusChange,
  statusOptions,
  filterVariant = "pills",
  embedded = false,
  className,
}: SearchFilterBarProps) {
  const hasFilters = statusOptions && onStatusChange
  const allOptions = hasFilters
    ? [{ value: "all", label: "All" }, ...statusOptions]
    : []

  return (
    <div
      className={cn(
        embedded
          ? "flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
          : "admin-list-toolbar",
        className
      )}
    >
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="admin-toolbar-search pl-10"
        />
      </div>

      {hasFilters && filterVariant === "pills" && (
        <div className="flex items-center gap-2 sm:shrink-0">
          <SlidersHorizontal className="hidden size-4 text-muted-foreground sm:block" aria-hidden />
          <div
            className="flex w-full gap-1 overflow-x-auto rounded-full bg-muted/70 p-1 sm:w-auto"
            role="group"
            aria-label="Filter by status"
          >
            {allOptions.map((option) => {
              const active = (status ?? "all") === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onStatusChange(option.value)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                    active
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {hasFilters && filterVariant === "select" && (
        <Select value={status ?? "all"} onValueChange={onStatusChange}>
          <SelectTrigger className="admin-toolbar-select h-10 w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All status</SelectItem>
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  )
}
