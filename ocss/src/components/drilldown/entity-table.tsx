import { Link } from "@tanstack/react-router"
import { ChevronRight, type LucideIcon } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

type EntityLinkProps =
  | { to: "/companies/$companyId"; params: { companyId: string } }
  | {
      to: "/companies/$companyId/schemes/$schemeId"
      params: { companyId: string; schemeId: string }
    }
  | { to: "/victims/$victimId"; params: { victimId: string } }
  | { to: "/claims/$claimId"; params: { claimId: string } }
  | { to?: undefined; params?: undefined }

export type EntityTableColumn = {
  key: string
  header: string
  align?: "left" | "right"
  className?: string
}

type EntityTableRow = {
  id: string
  accent: string
  icon: LucideIcon
  title: string
  subtitle?: string
  badge?: string
  cells: Record<string, { value: string; emphasize?: boolean }>
} & EntityLinkProps

function RowNav({
  row,
  className,
  children,
  "aria-label": ariaLabel,
}: {
  row: EntityTableRow
  className?: string
  children: React.ReactNode
  "aria-label"?: string
}) {
  if (row.to && row.params) {
    return (
      <Link
        to={row.to}
        params={row.params}
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    )
  }
  return <div className={className}>{children}</div>
}

export function EntityTable({
  columns,
  rows,
  emptyLabel = "No results",
}: {
  columns: EntityTableColumn[]
  rows: EntityTableRow[]
  emptyLabel?: string
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    )
  }

  const cascadeKey = rows.map((r) => r.id).join("|")
  const hasLinks = rows.some((r) => Boolean(r.to && r.params))

  return (
    <div className="overflow-hidden rounded-md border border-black/[0.05] dark:border-white/[0.08]">
      <Table key={cascadeKey}>
        <TableHeader>
          <TableRow className="table-cascade border-0 hover:bg-transparent bg-[#eff6ff] dark:bg-[#1e3a5f]/35">
            <TableHead className="h-11 px-4 text-[11px] font-bold tracking-[0.12em] text-[#1d4ed8] uppercase dark:text-sky-300">
              Name
            </TableHead>
            {columns.map((col) => (
              <TableHead
                key={col.key}
                className={cn(
                  "h-11 px-4 text-[11px] font-bold tracking-[0.12em] text-[#1d4ed8] uppercase dark:text-sky-300",
                  col.align === "right" && "text-right",
                  col.className,
                )}
              >
                {col.header}
              </TableHead>
            ))}
            {hasLinks ? <TableHead className="h-11 w-10 px-2" /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => {
            const Icon = row.icon
            const delayMs = 70 + index * 55
            return (
              <TableRow
                key={row.id}
                className="table-cascade group border-border/60 hover:bg-[#f8fbff] dark:hover:bg-sky-500/5"
                style={{ animationDelay: `${delayMs}ms` }}
              >
                <TableCell className="p-0">
                  <RowNav row={row} className="flex items-center gap-3 px-4 py-3.5">
                    <div
                      className="flex size-9 shrink-0 items-center justify-center rounded-md"
                      style={{
                        background: `${row.accent}22`,
                        color: row.accent,
                      }}
                    >
                      <Icon className="size-4" strokeWidth={1.85} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-display text-sm font-semibold text-foreground">
                          {row.title}
                        </p>
                        {row.badge && (
                          <span
                            className="inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                            style={{
                              background: `${row.accent}20`,
                              color: row.accent,
                            }}
                          >
                            {row.badge}
                          </span>
                        )}
                      </div>
                      {row.subtitle && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {row.subtitle}
                        </p>
                      )}
                    </div>
                  </RowNav>
                </TableCell>
                {columns.map((col) => {
                  const cell = row.cells[col.key]
                  return (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "px-4 py-3.5 tabular-nums",
                        col.align === "right" && "text-right",
                        col.className,
                      )}
                    >
                      <RowNav
                        row={row}
                        className={cn(
                          "block text-sm font-medium",
                          cell?.emphasize
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-foreground",
                        )}
                      >
                        {cell?.value ?? "—"}
                      </RowNav>
                    </TableCell>
                  )
                })}
                {hasLinks ? (
                  <TableCell className="p-0 pr-3">
                    <RowNav
                      row={row}
                      className="flex size-9 items-center justify-center text-muted-foreground/70 transition-colors group-hover:text-foreground"
                      aria-label={`Open ${row.title}`}
                    >
                      <ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                    </RowNav>
                  </TableCell>
                ) : null}
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
