/** Icon rings — same tokens as Tasks / Creator dashboard KPI row */
export const LIST_PAGE_KPI_ICON_TONE = {
  teal: 'border-sky-200/90 bg-sky-500/[0.11] text-sky-600 dark:border-sky-500/35 dark:bg-sky-400/15 dark:text-sky-300',
  amber: 'border-amber-200/90 bg-amber-500/[0.11] text-amber-600 dark:border-amber-500/35 dark:bg-amber-400/15 dark:text-amber-300',
  emerald:
    'border-emerald-200/90 bg-emerald-500/[0.11] text-emerald-600 dark:border-emerald-500/35 dark:bg-emerald-400/15 dark:text-emerald-300',
  destructive:
    'border-destructive/30 bg-destructive/[0.08] text-destructive dark:border-destructive/45 dark:bg-destructive/15 dark:text-destructive',
  purple:
    'border-violet-200/90 bg-violet-500/[0.11] text-violet-600 dark:border-violet-500/35 dark:bg-violet-400/15 dark:text-violet-300',
} as const;

export type ListPageKpiTone = keyof typeof LIST_PAGE_KPI_ICON_TONE;
