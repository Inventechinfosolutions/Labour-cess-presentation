import { CaretLeft, CaretRight, ChartLineUp, Leaf, ShieldCheck, UsersThree, type Icon } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { GhostRings, HeroRibbons, OutlineLeaves, SoftLeaf } from "@/components/garden/GardenDecor";
import { EASE } from "@/components/home/shared";
import { HeroSearch } from "@/components/kit/HeroIntro";
import { HERO, SERVICES, type ServiceIcon } from "@/lib/content";
import { useLang, type Lang, type Text } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { asset, cn, external } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });
const svc = (icon: ServiceIcon) => SERVICES.find((s) => s.icon === icon)!;

/** Each line is [plain, accent]. */
const TITLE: Record<Lang, [string, string?][]> = {
  en: [["Shaping"], ["Bengaluru"], ["for ", "Generations"]],
  kn: [["", "ತಲೆಮಾರುಗಳಿಗಾಗಿ"], ["ಬೆಂಗಳೂರನ್ನು"], ["ರೂಪಿಸುತ್ತಿದ್ದೇವೆ"]],
};

const LINES: Text[] = [
  t2("Planned layouts. Sustainable development.", "ಯೋಜಿತ ಬಡಾವಣೆಗಳು. ಸುಸ್ಥಿರ ಅಭಿವೃದ್ಧಿ."),
  t2("Vibrant communities. A global city for tomorrow.", "ಚೈತನ್ಯಪೂರ್ಣ ಸಮುದಾಯಗಳು. ನಾಳೆಯ ಜಾಗತಿಕ ನಗರ."),
];

const CHIPS: { label: Text; href: string }[] = [
  svc("layouts"),
  svc("auction"),
  { label: t2("Property Tax", "ಆಸ್ತಿ ತೆರಿಗೆ"), href: svc("tax").href },
  svc("online"),
  svc("cdrms"),
  svc("map"),
];

const VALUES: { icon: Icon; label: Text; tone: string }[] = [
  { icon: Leaf, label: t2("Liveable Communities", "ವಾಸಯೋಗ್ಯ ಸಮುದಾಯಗಳು"), tone: "text-emerald-500" },
  { icon: ChartLineUp, label: t2("Sustainable Growth", "ಸುಸ್ಥಿರ ಬೆಳವಣಿಗೆ"), tone: "text-blue-600" },
  { icon: ShieldCheck, label: t2("Transparent Governance", "ಪಾರದರ್ಶಕ ಆಡಳಿತ"), tone: "text-teal-600" },
  { icon: UsersThree, label: t2("Future Ready Bengaluru", "ಭವಿಷ್ಯಕ್ಕೆ ಸಿದ್ಧ ಬೆಂಗಳೂರು"), tone: "text-indigo-600" },
];

const SLIDES: { image: string; alt: Text }[] = [
  { image: PHOTOS.towers, alt: t2("BDA apartment towers", "ಬಿಡಿಎ ವಸತಿ ಗೋಪುರಗಳು") },
  { image: PHOTOS.villa, alt: t2("A BDA villa", "ಬಿಡಿಎ ವಿಲ್ಲಾ") },
  { image: PHOTOS.headOffice, alt: t2("BDA head office", "ಬಿಡಿಎ ಕೇಂದ್ರ ಕಚೇರಿ") },
];

const PREV = t2("Previous photo", "ಹಿಂದಿನ ಚಿತ್ರ");
const NEXT = t2("Next photo", "ಮುಂದಿನ ಚಿತ್ರ");
const SLIDE_MS = 6000;
const FRAME = "rounded-tl-[56px] rounded-br-[56px] sm:rounded-tl-[84px] sm:rounded-br-[84px]";

export function LeafShape({ className, delay = 0, tone = "green" }: { className?: string; delay?: number; tone?: "green" | "lime" | "orange" }) {
  const reduce = useReducedMotion();
  const id = `leaf-${tone}`;
  const stops = { green: ["#4ade80", "#15803d"], lime: ["#bef264", "#4d7c0f"], orange: ["#fdba74", "#ea580c"] }[tone];
  return (
    <motion.svg
      viewBox="0 0 60 100"
      className={cn("pointer-events-none absolute", className)}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 0.9, scale: 1, rotate: reduce ? 0 : [0, 6, -4, 0] }}
      transition={{ opacity: { delay, duration: 0.8 }, scale: { delay, duration: 0.8 }, rotate: { duration: 7, repeat: Infinity, ease: "easeInOut", delay } }}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={stops[0]} />
          <stop offset="1" stopColor={stops[1]} />
        </linearGradient>
      </defs>
      <path d="M30 2 C 58 28 58 72 30 98 C 2 72 2 28 30 2 Z" fill={`url(#${id})`} fillOpacity="0.85" />
      <path d="M30 10 V94 M30 36 L18 26 M30 52 L42 42 M30 68 L18 58" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" fill="none" />
    </motion.svg>
  );
}

function ValuesList({ className }: { className?: string }) {
  const { t } = useLang();
  return (
    <motion.ul initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.9 } } }} className={className}>
      {VALUES.map((v) => (
        <motion.li key={v.label.en} variants={{ hidden: { opacity: 0, x: 18 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } } }}>
          <div className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300 hover:bg-brand">
            <v.icon weight="duotone" className={cn("size-7 shrink-0 transition-colors group-hover:text-white", v.tone)} />
            <span className="text-[12.5px] font-semibold leading-tight text-navy transition-colors group-hover:text-white">{t(v.label)}</span>
          </div>
        </motion.li>
      ))}
    </motion.ul>
  );
}

export function GardenHero() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (d: number) => setIndex((i) => (i + d + SLIDES.length) % SLIDES.length);

  useEffect(() => {
    SLIDES.slice(1).forEach((s) => {
      new Image().src = asset(s.image);
    });
  }, []);

  useEffect(() => {
    if (reduce || paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(id);
  }, [reduce, paused, index]);

  const slide = SLIDES[index];

  return (
    <section className="relative">
      <HeroRibbons />
      <OutlineLeaves className="-left-6 -top-4 hidden w-56 opacity-80 md:block" />
      <div className="relative mx-auto grid max-w-site items-center gap-6 px-5 pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:px-8 lg:pt-10">
        <div className="relative z-20 lg:pb-10">
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.4em" }}
            animate={{ opacity: 1, letterSpacing: "0.22em" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="text-[11px] font-semibold uppercase text-navy/70"
          >
            {t(HERO.eyebrow)}
          </motion.p>
          <h1 key={lang} className="mt-3 font-display text-[2.4rem] font-bold leading-[1.06] sm:text-[3rem] xl:text-[3.5rem]">
            {TITLE[lang].map(([plain, accent], i) => (
              <span key={i} className="block overflow-hidden pb-1">
                <motion.span
                  initial={{ y: "105%" }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.15 + i * 0.12, duration: 0.7, ease: EASE }}
                  className="inline-block text-navy"
                >
                  {plain}
                  {accent && <span className="bg-gradient-to-r from-brand to-brand-bright bg-clip-text text-transparent">{accent}</span>}
                </motion.span>
              </span>
            ))}
          </h1>
          <div key={`l-${lang}`} className="mt-4">
            {LINES.map((l, i) => (
              <motion.p
                key={l.en}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.12, duration: 0.5, ease: EASE }}
                className="text-[15px] font-medium text-ink/80 md:text-base"
              >
                {t(l)}
              </motion.p>
            ))}
          </div>
          <HeroSearch className="mt-6" delay={0.85} />
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 1.05 } } }}
            className="mt-4 flex flex-wrap gap-1.5"
          >
            {CHIPS.map((c) => (
              <motion.li key={c.label.en} variants={{ hidden: { opacity: 0, y: 10, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1 } }}>
                <a
                  href={c.href}
                  {...external(c.href)}
                  className="inline-block whitespace-nowrap rounded-full border border-white bg-white/80 px-3 py-1.5 text-[12px] font-semibold text-navy shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-white"
                >
                  {t(c.label)}
                </a>
              </motion.li>
            ))}
          </motion.ul>
          <ValuesList className="mt-6 grid grid-cols-2 gap-1 rounded-2xl border border-white bg-white/70 p-1.5 shadow-sm backdrop-blur" />
        </div>

        <div className="relative mx-auto h-[340px] w-full max-w-[600px] sm:h-[500px] lg:h-[520px]" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <GhostRings className="-left-[9%] top-[43%] aspect-square h-[92%] -translate-y-1/2" />
          <SoftLeaf className="-left-[7%] top-[4%] w-20 -rotate-[38deg] sm:w-28" delay={0.6} />
          <SoftLeaf className="-left-[4%] top-[34%] w-14 -rotate-[72deg] sm:w-20" tone="mint" opacity={0.4} delay={0.8} />
          <LeafShape className="-left-2 top-[56%] z-10 w-12 -rotate-[30deg] sm:w-16" delay={0.9} />
          <LeafShape className="-top-1 right-[8%] z-10 w-9 rotate-[25deg] sm:w-12" delay={1.1} tone="lime" />
          <LeafShape className="bottom-[3%] left-[42%] hidden w-10 rotate-[75deg] sm:block" delay={1.3} />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: EASE }}
            className="absolute left-1/2 top-[43%] aspect-[4/3] w-[94%] max-w-[540px] -translate-x-1/2 -translate-y-1/2"
          >
            <motion.span
              aria-hidden
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: 1, x: 18, y: 14 }}
              transition={{ delay: 0.9, duration: 0.9, ease: EASE }}
              className={cn("absolute inset-0 border-2 border-brand/35", FRAME)}
            />
            <div className={cn("relative size-full overflow-hidden bg-brand-soft shadow-[0_30px_60px_-24px_rgba(11,44,107,0.55)] ring-[8px] ring-white", FRAME)}>
              <AnimatePresence initial={false}>
                <motion.img
                  key={index}
                  src={asset(slide.image)}
                  alt={t(slide.alt)}
                  initial={{ opacity: 0, scale: 1.12 }}
                  animate={{ opacity: 1, scale: 1.02 }}
                  exit={{ opacity: 0 }}
                  transition={{ opacity: { duration: 1.2, ease: "easeInOut" }, scale: { duration: 8, ease: "linear" } }}
                  className="absolute inset-0 size-full object-cover"
                />
              </AnimatePresence>
              <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-navy/30 to-transparent" />
            </div>
          </motion.div>
          <div className="absolute bottom-0 left-0 z-10 flex items-center gap-1.5 rounded-full border border-white bg-white/85 p-1 text-[12px] font-semibold text-navy shadow-sm backdrop-blur">
            <button type="button" onClick={() => go(-1)} aria-label={t(PREV)} className="grid size-7 place-items-center rounded-full transition-colors hover:bg-brand hover:text-white">
              <CaretLeft weight="bold" />
            </button>
            <span className="tabular-nums" aria-live="polite">
              {index + 1} / {SLIDES.length}
            </span>
            <button type="button" onClick={() => go(1)} aria-label={t(NEXT)} className="grid size-7 place-items-center rounded-full bg-navy text-white transition-colors hover:bg-brand">
              <CaretRight weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
