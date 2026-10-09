import { useMemo, useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowRight,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  Download,
  Globe,
  KeyRound,
  MapPin,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Users,
  Wrench,
} from "lucide-react"
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from "date-fns"
import { AdminPagination } from "@/components/admin/AdminPagination"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { AuditLog, PaginatedResult } from "@/types/admin"

const ACTION_META: Record<string, { icon: LucideIcon; tone: string; label: string }> = {
  CREATE: {
    icon: Plus,
    tone: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400",
    label: "Created",
  },
  UPDATE: {
    icon: Pencil,
    tone: "bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400",
    label: "Updated",
  },
  DELETE: {
    icon: Trash2,
    tone: "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400",
    label: "Deleted",
  },
  APPROVE: {
    icon: CheckCircle2,
    tone: "bg-teal-100 text-teal-700 dark:bg-teal-950/50 dark:text-teal-400",
    label: "Approved",
  },
  OVERRIDE: {
    icon: Wrench,
    tone: "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400",
    label: "Overridden",
  },
  EXPORT: {
    icon: Download,
    tone: "bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400",
    label: "Exported",
  },
}

const MODULE_META: Record<string, { icon: LucideIcon; tone: string }> = {
  Sites: { icon: MapPin, tone: "text-primary" },
  Bookings: { icon: CalendarCheck, tone: "text-sky-600 dark:text-sky-400" },
  Users: { icon: Users, tone: "text-violet-600 dark:text-violet-400" },
  Payments: { icon: CreditCard, tone: "text-emerald-600 dark:text-emerald-400" },
  Access: { icon: KeyRound, tone: "text-amber-600 dark:text-amber-400" },
  Rooms: { icon: BedDouble, tone: "text-rose-600 dark:text-rose-400" },
  Settings: { icon: Settings, tone: "text-muted-foreground" },
}

function actorAvatar(name: string) {
  const encoded = encodeURIComponent(name.trim() || "User")
  return `https://ui-avatars.com/api/?name=${encoded}&background=6366f1&color=fff&size=80&bold=true`
}

function formatGroupDate(iso: string) {
  const date = parseISO(iso)
  if (isToday(date)) return "Today"
  if (isYesterday(date)) return "Yesterday"
  return format(date, "EEEE, MMMM d")
}

function groupByDate(logs: AuditLog[]) {
  const groups: { label: string; items: AuditLog[] }[] = []
  const map = new Map<string, AuditLog[]>()

  for (const log of logs) {
    const label = formatGroupDate(log.timestamp)
    const bucket = map.get(label)
    if (bucket) bucket.push(log)
    else map.set(label, [log])
  }

  for (const [label, items] of map) {
    groups.push({ label, items })
  }

  return groups
}

function AuditLogEntry({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false)
  const action = ACTION_META[log.action] ?? {
    icon: Pencil,
    tone: "bg-muted text-muted-foreground",
    label: log.action,
  }
  const moduleMeta = MODULE_META[log.module] ?? { icon: Settings, tone: "text-muted-foreground" }
  const ActionIcon = action.icon
  const ModuleIcon = moduleMeta.icon
  const hasChange = log.oldValue !== log.newValue

  return (
    <article className="audit-feed-item">
      <div className="audit-feed-rail">
        <span className={cn("audit-feed-dot", action.tone.split(" ")[0])} />
      </div>

      <div className="audit-feed-card">
        <button
          type="button"
          className="audit-feed-header"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          <img
            src={actorAvatar(log.actor)}
            alt=""
            className="size-10 shrink-0 rounded-full ring-2 ring-background"
          />

          <div className="min-w-0 flex-1 text-left">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-semibold text-foreground">{log.actor}</span>
              <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide", action.tone)}>
                <ActionIcon className="size-3" />
                {action.label}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <ModuleIcon className={cn("size-3.5", moduleMeta.tone)} />
                {log.module}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasChange ? (
                <>
                  Changed <span className="font-medium text-foreground/80">{log.oldValue}</span>
                  {" → "}
                  <span className="font-medium text-foreground">{log.newValue}</span>
                </>
              ) : (
                <>Recorded an event in {log.module}</>
              )}
            </p>
          </div>

          <div className="hidden shrink-0 text-right sm:block">
            <p className="text-xs font-medium text-foreground">
              {format(parseISO(log.timestamp), "HH:mm")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {formatDistanceToNow(parseISO(log.timestamp), { addSuffix: true })}
            </p>
          </div>

          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </button>

        {expanded && (
          <div className="audit-feed-details">
            {hasChange && (
              <div className="audit-diff">
                <div className="audit-diff-col">
                  <p className="audit-diff-label">Before</p>
                  <p className="audit-diff-value audit-diff-old">{log.oldValue}</p>
                </div>
                <ArrowRight className="audit-diff-arrow size-4 shrink-0 text-muted-foreground" />
                <div className="audit-diff-col">
                  <p className="audit-diff-label">After</p>
                  <p className="audit-diff-value audit-diff-new">{log.newValue}</p>
                </div>
              </div>
            )}

            <div className="audit-feed-meta">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                <Globe className="size-3.5" />
                {log.ipAddress}
              </span>
              <span className="text-xs text-muted-foreground">
                {format(parseISO(log.timestamp), "dd MMM yyyy · HH:mm:ss")}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground/80">{log.id}</span>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

function FeedSkeleton() {
  return (
    <div className="audit-feed-skeleton space-y-4 p-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="size-3 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2 rounded-2xl border border-border/40 p-4">
            <div className="flex gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface AuditLogFeedProps {
  result?: PaginatedResult<AuditLog>
  isLoading: boolean
  page: number
  onPageChange: (page: number) => void
}

export function AuditLogFeed({ result, isLoading, page, onPageChange }: AuditLogFeedProps) {
  const groups = useMemo(() => groupByDate(result?.data ?? []), [result?.data])

  if (isLoading) {
    return (
      <div className="audit-feed admin-card">
        <FeedSkeleton />
      </div>
    )
  }

  if (!result?.data.length) {
    return (
      <div className="audit-feed admin-card flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <Pencil className="size-6 text-muted-foreground" />
        </div>
        <p className="mt-4 font-semibold">No audit events found</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Try adjusting your search or module filter to see activity across the system.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="audit-feed admin-card">
        {groups.map((group) => (
          <section key={group.label} className="audit-feed-group">
            <div className="audit-feed-date">
              <span>{group.label}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {group.items.length} event{group.items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="audit-feed-list">
              {group.items.map((log) => (
                <AuditLogEntry key={log.id} log={log} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <AdminPagination result={result} page={page} onPageChange={onPageChange} />
    </div>
  )
}
