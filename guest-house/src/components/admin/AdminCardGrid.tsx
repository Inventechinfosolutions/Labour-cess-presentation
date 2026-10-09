import type { ReactNode } from "react"
import { AdminPagination } from "@/components/admin/AdminPagination"
import { Skeleton } from "@/components/ui/skeleton"
import type { PaginatedResult } from "@/types/admin"

interface AdminCardGridProps<T> {
  result?: PaginatedResult<T>
  isLoading?: boolean
  page: number
  onPageChange: (page: number) => void
  renderCard: (item: T) => ReactNode
  emptyMessage?: string
  columns?: "2" | "3" | "4"
}

export function AdminCardGrid<T extends { id: string }>({
  result,
  isLoading,
  page,
  onPageChange,
  renderCard,
  emptyMessage = "No records found",
  columns = "3",
}: AdminCardGridProps<T>) {
  const gridCols = {
    "2": "sm:grid-cols-2",
    "3": "sm:grid-cols-2 lg:grid-cols-3",
    "4": "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  }[columns]

  if (isLoading) {
    return (
      <div className={`grid gap-4 ${gridCols}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-border/50 bg-card">
            <Skeleton className="h-40 w-full rounded-none sm:h-44" />
            <div className="space-y-2 p-3.5">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!result?.data.length) {
    return (
      <div className="admin-card flex h-48 items-center justify-center text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${gridCols}`}>
        {result.data.map((item) => (
          <div key={item.id}>{renderCard(item)}</div>
        ))}
      </div>
      {result && <AdminPagination result={result} page={page} onPageChange={onPageChange} />}
    </div>
  )
}
