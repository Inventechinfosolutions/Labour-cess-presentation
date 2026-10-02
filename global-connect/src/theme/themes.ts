import { HERITAGE_COPY } from "./copy/heritage";
import { HORIZON_COPY } from "./copy/horizon";

export type ThemeId = "global" | "heritage" | "horizon";

export type ThemeMeta = {
  id: ThemeId;
  label: string;
  description: string;
  /** Three colours shown in the switcher swatch. */
  swatch: [string, string, string];
  /** Overrides keyed by the default (Global theme) English text. Missing keys fall back to the default text. */
  copy: Record<string, string>;
};

export const THEMES: ThemeMeta[] = [
  {
    id: "global",
    label: "Global",
    description: "Navy, sky blue and gold",
    swatch: ["#061536", "#3fb4ff", "#ffd77a"],
    copy: {},
  },
  {
    id: "heritage",
    label: "Heritage",
    description: "Ivory, forest green and gold",
    swatch: ["#0c3a2a", "#d4a537", "#faf7f0"],
    copy: HERITAGE_COPY,
  },
  {
    id: "horizon",
    label: "Horizon",
    description: "White, royal blue and saffron",
    swatch: ["#0c2459", "#f5ae1b", "#2f6fe0"],
    copy: HORIZON_COPY,
  },
];

export const DEFAULT_THEME: ThemeId = "global";

export const THEME_BY_ID = Object.fromEntries(THEMES.map((t) => [t.id, t])) as Record<ThemeId, ThemeMeta>;

export const isThemeId = (v: unknown): v is ThemeId => typeof v === "string" && v in THEME_BY_ID;
