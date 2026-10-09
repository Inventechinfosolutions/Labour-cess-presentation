import type { ComponentType } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LIST_PAGE_KPI_ICON_TONE, type ListPageKpiTone } from '@/components/shared/listPageKpiTones';

export function WorkflowQueueCard({
  icon: Icon,
  label,
  count,
  iconTone = 'amber',
  onView,
  variant = 'default',
}: {
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  count: number;
  iconTone?: ListPageKpiTone;
  onView: () => void;
  variant?: 'default' | 'primary';
}) {
  if (variant === 'primary') {
    return (
      <button
        type="button"
        onClick={onView}
        className="relative flex min-h-[132px] flex-col overflow-hidden rounded-xl bg-primary p-4 text-left text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-primary-foreground/10 transition hover:brightness-[1.03] hover:shadow-xl"
      >
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary-foreground/10" aria-hidden />
        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground/18 ring-1 ring-primary-foreground/25">
            <Icon className="size-[18px] text-primary-foreground" strokeWidth={2} aria-hidden />
          </div>
          <div className="text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-primary-foreground/75">{label}</div>
          <div className="mt-2 font-sans text-3xl font-bold tabular-nums tracking-tight">{count}</div>
          <span className="mt-auto inline-flex items-center gap-0.5 pt-3 text-xs font-semibold text-primary-foreground/90 hover:text-primary-foreground">
            View <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onView}
      className="flex min-h-[132px] flex-col rounded-2xl border border-border/90 bg-card p-4 text-left text-card-foreground shadow-sm ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 hover:shadow-md dark:ring-white/[0.06]"
    >
      <span className={cn('mb-2 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm', LIST_PAGE_KPI_ICON_TONE[iconTone])}>
        <Icon className="size-[18px]" strokeWidth={2} aria-hidden />
      </span>
      <div className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 font-sans text-3xl font-bold tabular-nums text-foreground">{count}</div>
      <span className="mt-auto inline-flex items-center gap-0.5 pt-3 text-xs font-semibold text-primary">
        View <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
      </span>
    </button>
  );
}
