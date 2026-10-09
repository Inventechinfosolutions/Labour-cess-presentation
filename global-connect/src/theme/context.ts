import { createContext, useCallback, useContext } from "react";
import { DEFAULT_THEME, THEMES, THEME_BY_ID, isThemeId, type ThemeId, type ThemeMeta } from "./themes";

export const STORAGE_KEY = "gc-theme";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
  /** Themes this visitor may pick: all of them for the admin, the ones not hidden for clients. */
  themes: ThemeMeta[];
  isHidden: (id: ThemeId) => boolean;
};

export const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  themes: THEMES,
  isHidden: () => false,
});

/** `?theme=heritage` in the URL wins over the saved choice so a themed link can be shared. */
export function readInitialTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const fromUrl = new URLSearchParams(window.location.search).get("theme");
  if (isThemeId(fromUrl)) return fromUrl;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isThemeId(saved)) return saved;
  } catch {
    /* storage blocked */
  }
  return DEFAULT_THEME;
}

export function useTheme() {
  return useContext(ThemeContext);
}

/** Returns `t(text)`: the active theme's wording for a default-theme string. */
export function useT() {
  const { theme } = useTheme();
  return useCallback((text: string) => THEME_BY_ID[theme].copy[text] ?? text, [theme]);
}
