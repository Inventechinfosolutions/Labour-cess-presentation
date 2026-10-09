// Resolve chart colors from CSS custom properties so charts respect the
// active theme tokens defined in index.css. Falls back to neutral if the
// variable isn't found (e.g. during SSR or before mount).
export function getChartColor(idx: number): string {
  if (typeof window === 'undefined') return 'oklch(0.6 0.15 240)';
  const root = getComputedStyle(document.documentElement);
  const i = ((idx % 5) + 5) % 5; // 0..4
  const v = root.getPropertyValue(`--chart-${i + 1}`).trim();
  return v || 'oklch(0.6 0.15 240)';
}

export function getToken(name: string): string {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export const chartPalette = (count: number) =>
  Array.from({ length: count }, (_, i) => getChartColor(i));
