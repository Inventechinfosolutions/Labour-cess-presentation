import { useRef } from "react"
import { AdminPagination } from "@/components/admin/AdminPagination"
import { tableRowAnimation } from "@/animations/gsap"
import { useRevealEffect } from "@/hooks/useGsap"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { PaginatedResult } from "@/types/admin"

interface Column<T> {
  key: string
  header: string
  cell: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  result?: PaginatedResult<T>
  isLoading?: boolean
  page: number
  onPageChange: (page: number) => void
  emptyMessage?: string
}

export function DataTable<T extends { id: string }>({
  columns,
  result,
  isLoading,
  page,
  onPageChange,
  emptyMessage = "No records found",
}: DataTableProps<T>) {
  const tableRef = useRef<HTMLDivElement>(null)

  useRevealEffect(
    tableRef,
    ".data-table-row",
    tableRowAnimation,
    !!result?.data.length
  )

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-2xl" />
  }

  return (
    <div ref={tableRef} className="space-y-4">
      <div className="admin-table-wrap overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/60 hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn("admin-table-head", col.className)}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {result?.data.length ? (
              result.data.map((row) => (
                <TableRow key={row.id} className="data-table-row border-border/40">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={`px-4 py-3.5 ${col.className ?? ""}`}>
                      {col.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 px-4 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {result && <AdminPagination result={result} page={page} onPageChange={onPageChange} />}
    </div>
  )
}
