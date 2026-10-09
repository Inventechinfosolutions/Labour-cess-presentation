import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PaginatedResult } from "@/types/admin"

interface AdminPaginationProps {
  result: PaginatedResult<unknown>
  page: number
  onPageChange: (page: number) => void
}

export function AdminPagination({ result, page, onPageChange }: AdminPaginationProps) {
  if (result.totalPages <= 1) return null

  return (
    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground">
        Showing {(page - 1) * result.pageSize + 1}–
        {Math.min(page * result.pageSize, result.total)} of{" "}
        {result.total.toLocaleString("en-IN")}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="px-2 tabular-nums">
          Page {page} of {result.totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={page >= result.totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}
