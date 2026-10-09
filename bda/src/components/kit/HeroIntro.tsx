import { ArrowRight, MagnifyingGlass } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState, type KeyboardEvent } from "react";
import { EASE } from "@/components/home/shared";
import { HERO, HERO_FEATURES, SERVICES } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import { FEATURE_ICONS, SERVICE_ICONS } from "@/lib/icons";
import { usePrefs } from "@/lib/prefs";
import { cn, external } from "@/lib/utils";

const TEXT = {
  search: { en: "Search for layouts, online services, departments, RTI...", kn: "ಬಡಾವಣೆಗಳು, ಆನ್‌ಲೈನ್ ಸೇವೆಗಳು, ವಿಭಾಗಗಳು, ಆರ್‌ಟಿಐ ಹುಡುಕಿ..." },
  none: { en: "No services match your search.", kn: "ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಹೊಂದುವ ಸೇವೆಗಳಿಲ್ಲ." },
  go: { en: "Search", kn: "ಹುಡುಕಿ" },
};

const FEATURE_TINTS = ["bg-emerald-50 text-emerald-600", "bg-sky-50 text-sky-600", "bg-indigo-50 text-indigo-600", "bg-blue-50 text-brand"];

export function HeroIntro({ className, features = true, delay = 0 }: { className?: string; features?: boolean; delay?: number }) {
  const { t, lang } = useLang();
  const words = t(HERO.title).split(" ");
  const split = Math.max(1, words.length - 2);
  const at = (i: number) => delay + 0.15 + i * 0.07;

  const word = (w: string, i: number, accent: boolean) => (
    <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
      <motion.span
        initial={{ y: "105%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: at(i), duration: 0.7, ease: EASE }}
        className={cn("inline-block", accent ? "bg-gradient-to-r from-brand to-brand-bright bg-clip-text text-transparent" : "text-navy")}
      >
        {w}
      </motion.span>
      {"\u00a0"}
    </span>
  );

  return (
    <div className={className}>
      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.4em" }}
        animate={{ opacity: 1, letterSpacing: "0.22em" }}
        transition={{ delay, duration: 0.9, ease: EASE }}
        className="text-[11px] font-semibold uppercase text-navy/70"
      >
        {t(HERO.eyebrow)}
      </motion.p>
      <h1 key={lang} className="mt-3 font-display text-[2.3rem] font-bold leading-[1.1] md:text-[3.2rem]">
        <span>{words.slice(0, split).map((w, i) => word(w, i, false))}</span>
        <span className="block">{words.slice(split).map((w, i) => word(w, split + i, true))}</span>
      </h1>
      <motion.p
        key={`tag-${lang}`}
        initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: at(words.length), duration: 0.6, ease: EASE }}
        className="mt-4 max-w-md text-lg font-semibold text-navy md:text-[1.6rem] md:leading-snug"
      >
        {t(HERO.tagline)}
      </motion.p>
      <motion.span
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: at(words.length) + 0.15, duration: 0.6, ease: EASE }}
        className="mt-5 block h-1 w-14 origin-left rounded-full bg-brand-bright"
      />
      {features && (
        <ul className="mt-6 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
          {HERO_FEATURES.map((f, i) => {
            const Icon = FEATURE_ICONS[f.icon];
            return (
              <motion.li
                key={f.icon}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: at(words.length) + 0.3 + i * 0.08, duration: 0.5, ease: EASE }}
                whileHover={{ y: -3 }}
                className="flex items-center gap-2"
              >
                <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", FEATURE_TINTS[i])}>
                  <Icon weight="duotone" className="size-5" />
                </span>
                <span className="text-[12px] font-medium leading-tight text-ink/80">{t(f.label)}</span>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function HeroSearch({ className, delay = 0.9 }: { className?: string; delay?: number }) {
  const { t } = useLang();
  const { query, setQuery } = usePrefs();
  const [active, setActive] = useState(0);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const q = query.trim().toLowerCase();
  const results = q
    ? SERVICES.filter((s) => s.icon !== "more" && (s.label.en.toLowerCase().includes(q) || s.label.kn.includes(query.trim()))).slice(0, 6)
    : [];

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") setQuery("");
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % results.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + results.length) % results.length);
    }
  };

  return (
    <motion.div
      id="services"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: EASE }}
      className={cn("relative z-30 max-w-xl scroll-mt-24", className)}
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          links.current[active]?.click();
        }}
        className="flex items-center gap-2 rounded-full border border-line bg-white p-1.5 pl-5 shadow-[0_14px_34px_-16px_rgba(11,44,107,0.4)] transition-[border-color,box-shadow] focus-within:border-brand-bright focus-within:shadow-[0_0_0_4px_rgba(37,99,235,0.14),0_14px_34px_-16px_rgba(11,44,107,0.4)]"
      >
        <MagnifyingGlass weight="bold" className="size-5 shrink-0 text-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={onKey}
          placeholder={t(TEXT.search)}
          aria-label={t(TEXT.search)}
          className="min-w-0 flex-1 bg-transparent py-2 text-[14px] text-ink outline-none placeholder:text-muted"
        />
        <motion.button
          type="submit"
          aria-label={t(TEXT.go)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-navy text-white transition-colors hover:bg-brand"
        >
          <ArrowRight weight="bold" />
        </motion.button>
      </form>
      <AnimatePresence>
        {q && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute inset-x-0 top-full mt-2 origin-top overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-[0_24px_50px_-20px_rgba(11,44,107,0.45)]"
          >
            {results.length === 0 ? (
              <p className="px-3 py-4 text-center text-[13px] text-muted">{t(TEXT.none)}</p>
            ) : (
              <ul>
                {results.map((s, i) => {
                  const Icon = SERVICE_ICONS[s.icon];
                  const on = i === active;
                  return (
                    <motion.li key={s.label.en} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                      <a
                        ref={(el) => {
                          links.current[i] = el;
                        }}
                        href={s.href}
                        {...external(s.href)}
                        onMouseEnter={() => setActive(i)}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                          on ? "bg-brand text-white" : "text-ink",
                        )}
                      >
                        <Icon weight="duotone" className={cn("size-5 shrink-0", on ? "text-white" : "text-brand")} />
                        <span className="flex-1">{t(s.label)}</span>
                        <ArrowRight weight="bold" className={cn("size-3.5 transition-transform", on && "translate-x-1")} />
                      </a>
                    </motion.li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
