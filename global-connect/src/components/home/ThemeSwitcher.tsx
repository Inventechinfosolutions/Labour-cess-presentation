import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Palette } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/theme/context";
import { THEMES, THEME_BY_ID, type ThemeMeta } from "@/theme/themes";

function Swatch({ colors, size = 14 }: { colors: ThemeMeta["swatch"]; size?: number }) {
  return (
    <span className="flex -space-x-1" aria-hidden>
      {colors.map((c) => (
        <span key={c} className="rounded-full ring-2 ring-white/90" style={{ width: size, height: size, background: c }} />
      ))}
    </span>
  );
}

export function ThemeSwitcher({ light = false }: { light?: boolean }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = THEME_BY_ID[theme];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Theme: ${active.label}. Change theme`}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-10 items-center gap-2 rounded-full px-2.5 transition",
          light
            ? "text-(color:--gc-ink) hover:bg-(color:--gc-ink)/5"
            : "text-white/85 hover:bg-white/10 hover:text-white",
          open && (light ? "bg-(color:--gc-ink)/5" : "bg-white/10 text-white"),
        )}
      >
        <Palette size={20} />
        <span className="hidden xl:inline-flex">
          <Swatch colors={active.swatch} size={12} />
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            aria-label="Choose a theme"
            className="absolute top-[calc(100%+10px)] right-0 w-[260px] origin-top-right overflow-hidden rounded-2xl bg-white p-2 text-(color:--gc-ink) shadow-[0_24px_60px_rgba(3,10,30,0.35)] ring-1 ring-black/5"
            initial={{ opacity: 0, scale: 0.92, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="px-3 pt-2 pb-1.5 text-[11px] font-extrabold tracking-[0.18em] text-(color:--gc-muted) uppercase">Theme</p>
            {THEMES.map((t) => {
              const selected = t.id === theme;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  onClick={() => {
                    setOpen(false);
                    if (!selected) setTheme(t.id);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-black/[0.04]",
                    selected && "bg-black/[0.04]",
                  )}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl" style={{ background: t.swatch[0] }}>
                    <Swatch colors={[t.swatch[1], t.swatch[2], "#ffffff"]} size={10} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-[14px] font-semibold">{t.label}</span>
                    <span className="block truncate text-[12px] text-(color:--gc-body)">{t.description}</span>
                  </span>
                  {selected ? <Check size={16} weight="bold" className="text-(color:--gc-primary)" /> : null}
                </button>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
