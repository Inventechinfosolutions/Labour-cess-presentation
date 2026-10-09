/** Captured once when the module loads — stable “current time” for render-only UI math. */
export const pageLoadEpochMs = Date.now()

/** Wall-clock helpers — prefer calling from event handlers. */
export function addDaysIso(days: number): string {
  return new Date(Date.now() + days * 86400000).toISOString()
}

export function addDaysDateOnly(days: number): string {
  return addDaysIso(days).slice(0, 10)
}

export function nowIso(): string {
  return new Date().toISOString()
}

/** Fixed once at module load — stable default for date inputs. */
export const DEFAULT_COMMISSIONING_DATE_ONLY = new Date(
  Date.now() + 365 * 86400000,
).toISOString()
  .slice(0, 10)
