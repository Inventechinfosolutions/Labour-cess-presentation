export type ColorScheme = "light" | "dark" | "system";

export const THEME_STORAGE_KEY = "pmis-color-scheme";

export function readStoredScheme(): ColorScheme {
  if (typeof window === "undefined") return "system";
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* ignore */
  }
  return "system";
}

export function writeStoredScheme(scheme: ColorScheme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, scheme);
  } catch {
    /* ignore */
  }
}

export function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveDark(scheme: ColorScheme): boolean {
  if (scheme === "dark") return true;
  if (scheme === "light") return false;
  return systemPrefersDark();
}

export function applyDomColorScheme(scheme: ColorScheme) {
  document.documentElement.classList.toggle("dark", resolveDark(scheme));
}
