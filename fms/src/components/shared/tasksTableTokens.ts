/** Rows per page for Bills, Receipts, Tasks-style list tables */
export const LIST_TABLE_PAGE_SIZE = 10;

/** Primary header cells — same as Tasks page */
export const TASKS_TABLE_TH =
  'border border-primary-foreground/25 bg-primary px-3 py-3 text-left align-middle font-sans text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground';

/** Body cells — bordered grid */
export const TASKS_TABLE_TD = 'border border-border/80 px-3 py-2 align-middle';

/** Use on columns that truncate so ellipsis works inside table layout */
export const TASKS_TD_CLAMP = 'max-w-0';

/** Scroll shell + tinted canvas behind the grid */
export const TASKS_TABLE_SCROLL_WRAP =
  'tasks-table-scroll overflow-x-auto bg-[color-mix(in_oklch,var(--background)_42%,var(--card))] dark:bg-[color-mix(in_oklch,var(--background)_28%,var(--card))]';

/** Shared table root — add min-w-* and optional table-fixed per screen */
export const TASKS_TABLE_ROOT = 'w-full border-collapse text-sm';
