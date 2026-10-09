import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { STORAGE_KEY, ThemeContext, readInitialTheme } from "./context";
import { DEFAULT_THEME, THEMES, type ThemeId } from "./themes";

type Visibility = { hidden: string[]; admin: boolean };

// The demo Worker answers visibility.json; without it (local dev) every theme is shown.
function useVisibility() {
  const [visibility, setVisibility] = useState<Visibility | null>(null);
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}visibility.json`, { cache: "no-store" })
      .then((r) => (r.ok && r.headers.get("content-type")?.includes("json") ? r.json() : null))
      .then((data) =>
        setVisibility({
          hidden: Array.isArray(data?.hidden) ? data.hidden.filter((id: unknown) => typeof id === "string") : [],
          admin: data?.admin === true,
        }),
      )
      .catch(() => setVisibility({ hidden: [], admin: false }));
  }, []);
  return visibility;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [chosen, setThemeState] = useState<ThemeId>(readInitialTheme);
  const visibility = useVisibility();

  const isHidden = useCallback((id: ThemeId) => visibility?.hidden.includes(id) ?? false, [visibility]);
  const themes = useMemo(
    () => (visibility?.admin ? THEMES : THEMES.filter((t) => !isHidden(t.id))),
    [visibility, isHidden],
  );
  const theme = themes.some((t) => t.id === chosen) ? chosen : (themes[0]?.id ?? DEFAULT_THEME);

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage blocked */
    }
  }, [theme]);

  const setTheme = useCallback((id: ThemeId) => {
    const apply = () => flushSync(() => setThemeState(id));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && typeof document.startViewTransition === "function") document.startViewTransition(apply);
    else apply();
  }, []);

  const value = useMemo(() => ({ theme, setTheme, themes, isHidden }), [theme, setTheme, themes, isHidden]);
  if (!visibility) return null;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
