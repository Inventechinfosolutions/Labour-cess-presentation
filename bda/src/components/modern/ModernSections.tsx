import { ArrowRight, CaretLeft, CaretRight, Newspaper, SquaresFour, X } from "@phosphor-icons/react";
import { animate, AnimatePresence, motion, useMotionValue, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Container, EASE, SectionHeader } from "@/components/home/shared";
import { READ_MORE } from "@/components/kit/Blocks";
import { ANNOUNCEMENTS, NEWS, SERVICES, SITE } from "@/lib/content";
import { useLang, type Text } from "@/lib/i18n";
import { SERVICE_ICONS } from "@/lib/icons";
import { usePrefs } from "@/lib/prefs";
import { cn, dateParts, external } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });

const TEXT = {
  title: t2("Quick Access to Key Services", "ಪ್ರಮುಖ ಸೇವೆಗಳಿಗೆ ತ್ವರಿತ ಪ್ರವೇಶ"),
  all: t2("View All Services", "ಎಲ್ಲಾ ಸೇವೆಗಳು"),
  results: t2("Results for", "ಹುಡುಕಾಟ ಫಲಿತಾಂಶ"),
  clear: t2("Clear", "ತೆರವುಗೊಳಿಸಿ"),
  none: t2("No services match your search.", "ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಹೊಂದುವ ಸೇವೆಗಳಿಲ್ಲ."),
  news: t2("News & Events", "ಸುದ್ದಿ ಮತ್ತು ಕಾರ್ಯಕ್ರಮಗಳು"),
  notice: t2("Notice", "ಸೂಚನೆ"),
  prev: t2("Previous", "ಹಿಂದಿನದು"),
  next: t2("Next", "ಮುಂದಿನದು"),
  slide: t2("Go to slide", "ಸ್ಲೈಡ್‌ಗೆ ಹೋಗಿ"),
};

export function ServiceGrid() {
  const { t } = useLang();
  const { query, setQuery } = usePrefs();
  const q = query.trim().toLowerCase();
  const items = q ? SERVICES.filter((s) => s.label.en.toLowerCase().includes(q) || s.label.kn.includes(query.trim())) : SERVICES;

  return (
    <Container>
      <div id="services" className="scroll-mt-20">
        <SectionHeader icon={SquaresFour} title={TEXT.title} href={`${SITE}/online-services`} linkLabel={TEXT.all} />
        <AnimatePresence>
          {q && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 overflow-hidden pb-3 text-[13px] text-muted"
            >
              {t(TEXT.results)} <span className="font-semibold text-navy">"{query.trim()}"</span>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 font-medium text-brand hover:bg-brand hover:text-white"
              >
                <X weight="bold" className="size-3" /> {t(TEXT.clear)}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        {items.length === 0 && <p className="rounded-xl border border-dashed border-line bg-white px-4 py-6 text-center text-sm text-muted">{t(TEXT.none)}</p>}
        <motion.div layout className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          <AnimatePresence mode="popLayout">
            {items.map((s, i) => {
              const Icon = SERVICE_ICONS[s.icon];
              return (
                <motion.div
                  key={s.label.en}
                  layout
                  initial={{ opacity: 0, y: 18, scale: 0.94 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.5, ease: EASE, delay: (i % 4) * 0.06, layout: { type: "spring", stiffness: 380, damping: 34 } }}
                >
                  <a
                    href={s.href}
                    {...external(s.href)}
                    className="group flex h-full items-center gap-3 rounded-2xl border border-line bg-white px-3 py-3 shadow-[0_4px_14px_-8px_rgba(11,44,107,0.2)] transition-[background-color,border-color,box-shadow,translate] duration-300 hover:-translate-y-1 hover:border-brand hover:bg-brand hover:shadow-[0_16px_30px_-14px_rgba(11,44,107,0.5)]"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-soft transition-[background-color,rotate] duration-500 group-hover:rotate-[360deg] group-hover:bg-white/15">
                      <Icon weight="duotone" className="size-6 text-brand transition-colors group-hover:text-white" />
                    </span>
                    <span className="flex-1 text-[13.5px] font-medium leading-snug text-ink transition-colors group-hover:text-white">{t(s.label)}</span>
                    <ArrowRight weight="bold" className="size-4 shrink-0 text-brand/60 transition-[color,translate] group-hover:translate-x-1 group-hover:text-white" />
                  </a>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </Container>
  );
}

const ITEMS = [
  ...NEWS,
  ...ANNOUNCEMENTS.filter((a) => a.tab !== "eauction").map((a) => ({ date: a.date, kind: TEXT.notice, title: a.title, href: a.href })),
].sort((a, b) => b.date.localeCompare(a.date));

const GAP = 20;

export function NewsCarousel() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const wrap = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const x = useMotionValue(0);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const per = width >= 1024 ? 4 : width >= 600 ? 2 : 1;
  const card = width ? (width - GAP * (per - 1)) / per : 280;
  const max = Math.max(0, ITEMS.length - per);
  const current = Math.min(index, max);
  const step = card + GAP;

  useEffect(() => {
    const controls = animate(x, -current * step, { type: "spring", stiffness: 260, damping: 32 });
    return () => controls.stop();
  }, [current, step, x]);

  useEffect(() => {
    if (paused || reduce) return;
    const id = setInterval(() => setIndex((i) => (Math.min(i, max) >= max ? 0 : i + 1)), 4800);
    return () => clearInterval(id);
  }, [paused, reduce, max]);

  const go = (d: number) => setIndex((i) => Math.min(max, Math.max(0, Math.min(i, max) + d)));

  return (
    <Container>
      <SectionHeader icon={Newspaper} title={TEXT.news} href={`${SITE}/news`} />
      <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
        <div ref={wrap} className="-my-4 overflow-hidden py-4">
          <motion.div
            style={{ x, gap: GAP }}
            drag="x"
            dragConstraints={{ left: -max * step, right: 0 }}
            dragElastic={0.12}
            onDragStart={() => {
              dragged.current = true;
            }}
            onDragEnd={(_, info) => {
              const shift = Math.round(-(info.offset.x + info.velocity.x * 0.15) / step);
              const next = Math.min(max, Math.max(0, current + shift));
              setIndex(next);
              animate(x, -next * step, { type: "spring", stiffness: 260, damping: 32 });
              setTimeout(() => {
                dragged.current = false;
              }, 50);
            }}
            className="flex cursor-grab touch-pan-y active:cursor-grabbing"
          >
            {ITEMS.map((n) => {
              const d = dateParts(n.date, lang);
              return (
                <a
                  key={n.href + n.date}
                  href={n.href}
                  {...external(n.href)}
                  draggable={false}
                  onClick={(e) => dragged.current && e.preventDefault()}
                  style={{ width: card }}
                  className="group relative flex shrink-0 select-none flex-col overflow-hidden rounded-2xl border border-line bg-white p-5 transition-[background-color,border-color,box-shadow,translate] duration-300 hover:-translate-y-1.5 hover:border-brand hover:bg-brand hover:shadow-[0_18px_36px_-16px_rgba(11,44,107,0.4)]"
                >
                  <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-white/60 transition-transform duration-500 group-hover:scale-x-100" aria-hidden />
                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <div className="font-display text-3xl font-bold leading-none text-brand transition-colors group-hover:text-white">{d.day}</div>
                      <div className="mt-1 text-[11px] font-semibold uppercase text-muted transition-colors group-hover:text-white/75">{d.monthYear}</div>
                    </div>
                    <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10.5px] font-semibold text-brand transition-colors group-hover:bg-white/20 group-hover:text-white">{t(n.kind)}</span>
                  </div>
                  <p className="mt-4 line-clamp-3 min-h-[3.9em] flex-1 text-[14px] font-semibold leading-snug text-navy transition-colors group-hover:text-white">{t(n.title)}</p>
                  <span className="mt-4 flex items-center gap-1 text-[13px] font-semibold text-brand transition-colors group-hover:text-white">
                    {t(READ_MORE)}
                    <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
              );
            })}
          </motion.div>
        </div>
        {[
          { d: -1, Icon: CaretLeft, label: TEXT.prev, pos: "-left-2 md:-left-5", disabled: current === 0 },
          { d: 1, Icon: CaretRight, label: TEXT.next, pos: "-right-2 md:-right-5", disabled: current === max },
        ].map(({ d, Icon, label, pos, disabled }) => (
          <motion.button
            key={d}
            type="button"
            aria-label={t(label)}
            disabled={disabled}
            onClick={() => go(d)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "absolute top-1/2 z-10 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-navy shadow-md transition-[background-color,color,opacity] hover:bg-brand hover:text-white disabled:pointer-events-none disabled:opacity-0",
              pos,
            )}
          >
            <Icon weight="bold" />
          </motion.button>
        ))}
      </div>
      <div className="mt-5 flex justify-center gap-1.5">
        {Array.from({ length: max + 1 }, (_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${t(TEXT.slide)} ${i + 1}`}
            aria-current={i === current}
            onClick={() => setIndex(i)}
            className="relative h-2 w-2 rounded-full bg-navy/15 transition-[width] duration-300 hover:bg-brand aria-[current=true]:w-6"
          >
            {i === current && <motion.span layoutId="news-dot" className="absolute inset-0 rounded-full bg-brand" transition={{ type: "spring", stiffness: 420, damping: 32 }} />}
          </button>
        ))}
      </div>
    </Container>
  );
}
