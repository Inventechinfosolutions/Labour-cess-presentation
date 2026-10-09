import { cn } from "@/lib/utils";

export type DashboardKpiIconTone =
  | "emerald"
  | "sky"
  | "cyan"
  | "indigo"
  | "violet"
  | "amber"
  | "orange"
  | "rose"
  | "sun";

const TONE: Record<DashboardKpiIconTone, string> = {
  sun:
    "border-yellow-400/55 bg-gradient-to-br from-yellow-300/38 via-amber-400/30 to-orange-500/22 text-amber-950 shadow-[0_0_14px_-2px_rgb(251_191_36/0.45)] ring-1 ring-yellow-400/25 dark:from-yellow-500/[0.28] dark:via-amber-500/[0.22] dark:to-orange-600/[0.24] dark:text-yellow-50 dark:border-yellow-300/35 dark:ring-yellow-400/18 dark:shadow-amber-900/35",
  emerald:
    "border-emerald-500/40 bg-gradient-to-br from-emerald-400/25 via-emerald-500/12 to-teal-600/18 text-emerald-700 shadow-emerald-500/15 dark:from-emerald-500/[0.22] dark:via-emerald-600/14 dark:to-teal-900/35 dark:text-emerald-100 dark:border-emerald-400/35 dark:shadow-emerald-900/30",
  sky:
    "border-sky-500/40 bg-gradient-to-br from-sky-400/22 via-sky-500/12 to-blue-600/16 text-sky-800 shadow-sky-500/15 dark:from-sky-500/[0.2] dark:via-blue-600/16 dark:to-slate-900/40 dark:text-sky-100 dark:border-sky-400/35",
  cyan:
    "border-cyan-500/40 bg-gradient-to-br from-cyan-400/22 via-cyan-500/12 to-teal-600/16 text-cyan-900 shadow-cyan-500/12 dark:from-cyan-500/[0.2] dark:via-teal-600/16 dark:to-slate-900/35 dark:text-cyan-100 dark:border-cyan-400/35",
  indigo:
    "border-indigo-500/40 bg-gradient-to-br from-indigo-400/20 via-indigo-500/12 to-violet-700/14 text-indigo-800 shadow-indigo-500/15 dark:from-indigo-500/[0.22] dark:via-indigo-600/14 dark:to-violet-950/35 dark:text-indigo-100 dark:border-indigo-400/35",
  violet:
    "border-violet-500/40 bg-gradient-to-br from-violet-400/22 via-violet-500/12 to-purple-700/14 text-violet-900 shadow-violet-500/12 dark:from-violet-500/[0.2] dark:via-purple-600/14 dark:to-slate-900/35 dark:text-violet-100 dark:border-violet-400/35",
  amber:
    "border-amber-500/45 bg-gradient-to-br from-amber-400/28 via-amber-500/14 to-orange-600/14 text-amber-950 shadow-amber-500/18 dark:from-amber-500/[0.24] dark:via-orange-600/16 dark:to-amber-950/35 dark:text-amber-50 dark:border-amber-400/40",
  orange:
    "border-orange-500/45 bg-gradient-to-br from-orange-400/25 via-orange-500/14 to-amber-800/14 text-orange-950 shadow-orange-500/18 dark:from-orange-600/[0.22] dark:via-amber-700/14 dark:to-slate-900/35 dark:text-orange-100 dark:border-orange-400/38",
  rose:
    "border-rose-500/42 bg-gradient-to-br from-rose-400/24 via-rose-500/12 to-red-700/14 text-rose-900 shadow-rose-500/15 dark:from-rose-600/[0.22] dark:via-rose-700/14 dark:to-slate-900/35 dark:text-rose-100 dark:border-rose-400/35",
};

/** Circular well (`size-8`) with gradient fill + tinted icon colour for KPI / dashboard metric cards. */
export function dashboardKpiIconWrapClass(tone: DashboardKpiIconTone): string {
  return cn(
    "flex size-8 shrink-0 items-center justify-center rounded-full [&>svg]:size-3.5",
    "shadow-inner shadow-white/25 dark:shadow-inner dark:shadow-white/[0.04]",
    TONE[tone],
  );
}

/** Larger metric-tile icon wells (e.g. AdminMetricCard) — `size-10` with mapped tone. */
export function dashboardKpiMetricTileIconClass(tone: DashboardKpiIconTone): string {
  return cn(
    "flex size-10 shrink-0 items-center justify-center rounded-full [&>svg]:size-[1.125rem]",
    "shadow-inner shadow-white/25 dark:shadow-inner dark:shadow-white/[0.04]",
    TONE[tone],
  );
}

const METRIC_TILE_TONE_CYCLE = [
  "emerald",
  "sky",
  "violet",
  "amber",
  "cyan",
  "indigo",
  "orange",
  "rose",
] as const satisfies readonly DashboardKpiIconTone[];

/** Rotating accent for metric strips so neighbouring tiles differ. */
export function metricTileToneAt(i: number): DashboardKpiIconTone {
  return METRIC_TILE_TONE_CYCLE[i % METRIC_TILE_TONE_CYCLE.length]!;
}

/** IPP technology metric row — fixed colours (no amber on Hybrid). */
export function ippTechnologyMetricTone(
  key: "all" | "Solar" | "Wind" | "Hybrid",
): DashboardKpiIconTone {
  switch (key) {
    case "all":
      return "indigo";
    case "Solar":
      return "sun";
    case "Wind":
      return "cyan";
    case "Hybrid":
      return "violet";
  }
}
