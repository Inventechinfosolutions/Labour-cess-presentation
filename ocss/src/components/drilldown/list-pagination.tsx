import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function getPageItems<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize
  return items.slice(start, start + pageSize)
}

export function getTotalPages(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize))
}

function pageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 3) return [1, 2, 3, 4, "…", total]
  if (current >= total - 2) return [1, "…", total - 3, total - 2, total - 1, total]
  return [1, "…", current - 1, current, current + 1, "…", total]
}

export function ListPagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  className?: string
}) {
  if (total === 0) return null

  const totalPages = getTotalPages(total, pageSize)
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const pages = pageNumbers(page, totalPages)

  return (
    <div
      className={cn(
        "mt-4 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <p className="text-sm text-muted-foreground">
        Showing{" "}
        <span className="font-semibold tabular-nums text-foreground">
          {start}–{end}
        </span>{" "}
        of{" "}
        <span className="font-semibold tabular-nums text-foreground">{total}</span>
      </p>

      <nav aria-label="Pagination" className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            "inline-flex h-9 items-center gap-1 rounded-md px-2.5 text-sm font-medium transition-colors",
            "text-muted-foreground hover:bg-muted hover:text-foreground",
            "disabled:pointer-events-none disabled:opacity-40",
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="flex size-9 items-center justify-center text-sm text-muted-foreground"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-md text-sm font-semibold tabular-nums transition-colors",
                p === page
                  ? "bg-[#3b82f6] text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {p}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={cn(
            "inline-flex h-9 items-center gap-1 rounded-md px-2.5 text-sm font-medium transition-colors",
            "text-muted-foreground hover:bg-muted hover:text-foreground",
            "disabled:pointer-events-none disabled:opacity-40",
          )}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="size-4" />
        </button>
      </nav>
    </div>
  )
}
