import type { LucideIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'framer-motion'
import type { DocStatus, MilestoneStatus, ProjectStatus, SLAStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-5 flex flex-wrap items-start justify-between gap-3', className)}>
      <div>
        <h1 className="text-xl font-medium tracking-tight text-foreground">{title}</h1>
        {subtitle ? (
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function DashboardHero({
  badge,
  title,
  subtitle,
  actions,
}: {
  badge?: React.ReactNode
  title: React.ReactNode
  subtitle?: string
  actions?: React.ReactNode
}) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.section
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-6 overflow-hidden rounded-xl border border-primary/12 bg-gradient-to-br from-primary/[0.07] via-card to-primary/5 p-5 shadow-xl ring-1 ring-primary/[0.06] dark:from-primary/15 dark:via-card dark:to-primary/[0.08] md:p-6"
      aria-label="Workspace overview"
    >
      <div
        className="pointer-events-none absolute -right-20 top-0 size-72 rounded-full bg-gradient-to-br from-primary/15 to-transparent blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 size-56 rounded-full bg-gradient-to-tr from-chart-2/15 to-transparent blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          {badge}
          <h1 className="mt-3 text-balance text-xl font-medium tracking-tight text-foreground md:text-2xl">{title}</h1>
          {subtitle ? (
            <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground md:text-sm">{subtitle}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </motion.section>
  )
}

export function KPICard({
  label,
  value,
  accent,
  icon: Icon,
  index = 0,
  to,
  search,
}: {
  label: string
  value: number | string
  accent?: 'success' | 'warning' | 'info' | 'destructive'
  icon?: LucideIcon
  index?: number
  /** When set, the whole card links here (e.g. officer dashboard drill-down). */
  to?: string
  /** Optional URL search params with `to` (TanStack Router `search`). */
  search?: Record<string, string | undefined>
}) {
  const reduceMotion = useReducedMotion()
  const cardClass = cn(
    'group relative block overflow-hidden rounded-xl border border-primary/10 bg-gradient-to-br from-card/95 via-card to-muted/15 p-4 shadow-sm ring-1 ring-primary/[0.04] transition duration-300 hover:-translate-y-0.5 hover:border-primary/18 hover:shadow-md',
    accent === 'success' && 'border-chart-4/25 bg-gradient-to-br from-chart-4/[0.08] via-card to-card',
    accent === 'warning' &&
      'border-border bg-gradient-to-br from-muted/50 via-card to-card ring-1 ring-border/60',
    accent === 'info' && 'border-primary/25 bg-gradient-to-br from-primary/[0.08] via-card to-card',
    accent === 'destructive' && 'border-destructive/25 bg-gradient-to-br from-destructive/[0.08] via-card to-card',
  )
  const body = (
    <>
      <div
        className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-gradient-to-br from-chart-2/12 to-transparent opacity-70 blur-2xl transition group-hover:opacity-100"
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-2.5">
        <div>
          <div className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">{value}</div>
        </div>
        {Icon ? (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/10 bg-primary/[0.06] text-primary shadow-inner">
            <Icon className="size-4" aria-hidden />
          </div>
        ) : null}
      </div>
    </>
  )
  const motionDiv = (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.38, delay: reduceMotion ? 0 : index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={cardClass}
    >
      {body}
    </motion.div>
  )
  if (to) {
    return (
      <Link
        to={to}
        search={search}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {motionDiv}
      </Link>
    )
  }
  return motionDiv
}

export function StatusBadge({ status }: { status: ProjectStatus | string }) {
  const cls =
    status === 'Commissioned'
      ? 'bg-chart-4/20 text-chart-4 border border-chart-4/30'
      : status === 'Ready for Commissioning'
        ? 'bg-primary/15 text-primary border border-primary/25'
        : status === 'Commissioning Submitted'
          ? 'bg-chart-2/15 text-chart-2 border border-chart-2/25'
          : 'bg-muted text-foreground'
  return (
    <span className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none ${cls}`}>
      {status}
    </span>
  )
}

export function SLABadge({ status }: { status: SLAStatus }) {
  const cls =
    status === 'On Track'
      ? 'bg-chart-4/15 text-chart-4'
      : status === 'At Risk'
        ? 'bg-primary/12 text-primary'
        : 'bg-destructive/15 text-destructive'
  return (
    <span className={cn('inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none', cls)}>
      {status}
    </span>
  )
}

export function MilestoneBadge({ status }: { status: MilestoneStatus }) {
  const cls =
    status === 'Completed' || status === 'Verified'
      ? 'bg-chart-4/15 text-chart-4'
      : status === 'Submitted'
        ? 'bg-primary/15 text-primary'
        : status === 'In Progress'
          ? 'bg-primary/12 text-primary'
          : 'bg-muted text-muted-foreground'
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium', cls)}>
      {status}
    </span>
  )
}

export function DocBadge({ status }: { status: DocStatus }) {
  const cls =
    status === 'Verified'
      ? 'bg-emerald-500/12 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300'
      : status === 'Rejected'
        ? 'bg-destructive/15 text-destructive'
        : status === 'Uploaded'
          ? 'bg-primary/15 text-primary'
          : 'bg-muted text-muted-foreground'
  return (
    <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium', cls)}>
      {status}
    </span>
  )
}

export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card/50 px-6 py-16 text-center">
      {icon ? <div className="mb-3 text-muted-foreground">{icon}</div> : null}
      <div className="font-semibold">{title}</div>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
