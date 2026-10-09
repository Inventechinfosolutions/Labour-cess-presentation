/** Icon tiles — match dashboard KPI / bill summary reference */
export const BILL_SUMMARY_ICON_TONE = {
  sky: 'border-sky-200/90 bg-sky-500/[0.11] text-sky-600 dark:border-sky-500/35 dark:bg-sky-400/15 dark:text-sky-300',
  emerald:
    'border-emerald-200/90 bg-emerald-500/[0.11] text-emerald-600 dark:border-emerald-500/35 dark:bg-emerald-400/15 dark:text-emerald-300',
  violet:
    'border-violet-200/90 bg-violet-500/[0.11] text-violet-600 dark:border-violet-500/35 dark:bg-violet-400/15 dark:text-violet-300',
  slate:
    'border-slate-300/90 bg-slate-500/[0.09] text-slate-600 dark:border-slate-500/35 dark:bg-slate-400/12 dark:text-slate-300',
  amber:
    'border-amber-200/90 bg-amber-500/[0.11] text-amber-600 dark:border-amber-500/35 dark:bg-amber-400/15 dark:text-amber-300',
  rose: 'border-rose-200/90 bg-rose-500/[0.11] text-rose-600 dark:border-rose-500/35 dark:bg-rose-400/15 dark:text-rose-300',
  fuchsia:
    'border-fuchsia-200/90 bg-fuchsia-500/[0.11] text-fuchsia-600 dark:border-fuchsia-500/35 dark:bg-fuchsia-400/15 dark:text-fuchsia-300',
  orange:
    'border-orange-200/90 bg-orange-500/[0.11] text-orange-600 dark:border-orange-500/35 dark:bg-orange-400/15 dark:text-orange-300',
} as const;

export type BillSummaryTone = keyof typeof BILL_SUMMARY_ICON_TONE;
