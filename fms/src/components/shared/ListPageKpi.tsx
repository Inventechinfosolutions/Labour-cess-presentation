import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LIST_PAGE_KPI_ICON_TONE, type ListPageKpiTone } from '@/components/shared/listPageKpiTones';

export type { ListPageKpiTone };

/** Featured primary metric — same shell as Budgets “Total allocated” (navy hero card) */
export function ListPagePrimaryKpiCard({
  label,
  value,
  sub,
  icon,
  delayMs = 0,
}: {
  label: string;
  value: ReactNode;
  sub: string;
  icon: ReactNode;
  delayMs?: number;
}) {
  return (
    <div
      className="list-dash-reveal creator-stat-card relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-primary-foreground/10"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary-foreground/10" aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/75">{label}</p>
          <p className="kpi-stat-value mt-3 text-[2rem] leading-none text-primary-foreground sm:text-[2.35rem]">{value}</p>
          <p className="mt-2 text-xs text-primary-foreground/70">{sub}</p>
        </div>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-foreground/18 ring-1 ring-primary-foreground/25 [&_svg]:text-primary-foreground">
          {icon}
        </span>
      </div>
    </div>
  );
}

/** Elevated secondary KPI — matches Tasks Completed / Returned / Rejected cards */
export function ListPageSecondaryKpiCard({
  label,
  value,
  sub,
  icon,
  tone,
  delayMs = 0,
}: {
  label: string;
  value: ReactNode;
  sub: string;
  icon: ReactNode;
  tone: ListPageKpiTone;
  delayMs?: number;
}) {
  return (
    <div
      className="list-dash-reveal creator-stat-card rounded-2xl border border-border/90 bg-card p-4 text-card-foreground shadow-sm ring-1 ring-black/[0.04] transition sm:p-5 dark:ring-white/[0.06]"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:text-[11px]">{label}</p>
          <p className="kpi-stat-value mt-2 text-[2rem] leading-none text-foreground sm:text-[2.35rem]">{value}</p>
          <p className="mt-3 text-[11px] font-medium leading-snug text-primary sm:text-xs">{sub}</p>
        </div>
        <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full border shadow-sm', LIST_PAGE_KPI_ICON_TONE[tone])}>
          {icon}
        </span>
      </div>
    </div>
  );
}
