import { Buildings, ChartBar, Leaf, UsersThree, type Icon } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { EASE } from "@/components/home/shared";
import { HeroSearch } from "@/components/kit/HeroIntro";
import { HERO } from "@/lib/content";
import { useLang, type Text } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { asset, cn } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });

const TITLE = { lead: t2("Building a", "ಉತ್ತಮ"), accent: t2("Better Bengaluru", "ಬೆಂಗಳೂರಿನ ನಿರ್ಮಾಣ") };
const LINES: Text[] = [
  t2("Planned layouts. Sustainable development.", "ಯೋಜಿತ ಬಡಾವಣೆಗಳು. ಸುಸ್ಥಿರ ಅಭಿವೃದ್ಧಿ."),
  t2("Vibrant communities.", "ಚೈತನ್ಯಪೂರ್ಣ ಸಮುದಾಯಗಳು."),
  t2("A global city for tomorrow.", "ನಾಳೆಯ ಜಾಗತಿಕ ನಗರ."),
];

const PHOTO_SET: { image: string; alt: Text }[] = [
  { image: PHOTOS.towers, alt: t2("BDA apartment towers", "ಬಿಡಿಎ ವಸತಿ ಗೋಪುರಗಳು") },
  { image: PHOTOS.flats, alt: t2("BDA housing complex", "ಬಿಡಿಎ ವಸತಿ ಸಮುಚ್ಚಯ") },
  { image: PHOTOS.villa, alt: t2("A BDA villa", "ಬಿಡಿಎ ವಿಲ್ಲಾ") },
];

const PROMISES: { icon: Icon; label: Text }[] = [
  { icon: Buildings, label: t2("Planned Urban Growth", "ಯೋಜಿತ ನಗರ ಬೆಳವಣಿಗೆ") },
  { icon: Leaf, label: t2("Livable Communities", "ವಾಸಯೋಗ್ಯ ಸಮುದಾಯಗಳು") },
  { icon: ChartBar, label: t2("Transparent Governance", "ಪಾರದರ್ಶಕ ಆಡಳಿತ") },
  { icon: UsersThree, label: t2("Sustainable Future", "ಸುಸ್ಥಿರ ಭವಿಷ್ಯ") },
];

const FADE = "md:[mask-image:linear-gradient(to_right,transparent_0%,black_30%)]";
const PHOTO_MS = 6000;
const PROMISE_MS = 2400;

function PromisePanel({ className }: { className?: string }) {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const pillId = useId();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % PROMISES.length), PROMISE_MS);
    return () => clearInterval(id);
  }, [paused, reduce]);
  return (
    <ul onMouseLeave={() => setPaused(false)} className={className}>
      {PROMISES.map((p, i) => {
        const on = i === active;
        return (
          <motion.li
            key={p.label.en}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 + i * 0.1, duration: 0.5, ease: EASE }}
            onMouseEnter={() => {
              setPaused(true);
              setActive(i);
            }}
            className={cn("relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300", on ? "text-white" : "text-navy")}
          >
            {on && <motion.span layoutId={pillId} className="absolute inset-0 rounded-xl bg-brand shadow-lg" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <span className={cn("relative grid size-9 shrink-0 place-items-center rounded-lg transition-colors", on ? "bg-white/20" : "bg-brand-soft text-brand")}>
              <p.icon weight="duotone" className="size-5" />
            </span>
            <span className="relative text-[13px] font-semibold leading-tight">{t(p.label)}</span>
          </motion.li>
        );
      })}
    </ul>
  );
}

export function PortalHero() {
  const { t, lang } = useLang();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 70]);

  useEffect(() => {
    if (reduce) return;
    PHOTO_SET.slice(1).forEach((p) => {
      new Image().src = asset(p.image);
    });
    const id = setInterval(() => setIndex((i) => (i + 1) % PHOTO_SET.length), PHOTO_MS);
    return () => clearInterval(id);
  }, [reduce]);

  const photo = PHOTO_SET[index];
  const accentWords = t(TITLE.accent).split(" ");

  return (
    <section ref={ref} className="relative overflow-hidden bg-gradient-to-b from-[#f3f7ff] to-[#e7efff]">
      <motion.div style={{ y: imageY }} className={cn("relative h-64 sm:h-80 md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[60%]", FADE)}>
        <AnimatePresence initial={false}>
          <motion.img
            key={index}
            src={asset(photo.image)}
            alt={t(photo.alt)}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.3, ease: "easeInOut" }, scale: { duration: 8, ease: "linear" } }}
            className="absolute inset-0 size-full object-cover"
          />
        </AnimatePresence>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#e7efff] to-transparent" aria-hidden />
      </motion.div>

      <motion.span
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 1, ease: EASE }}
        className="pointer-events-none absolute -right-24 -top-24 hidden size-[26rem] rounded-[5rem] bg-gradient-to-br from-brand-bright/30 to-brand/10 rotate-12 xl:block"
        aria-hidden
      />

      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.8, duration: 0.8, ease: EASE }}
        className="absolute right-8 top-1/2 z-10 hidden w-60 -translate-y-1/2 rounded-2xl border border-white/70 bg-white/75 p-2 shadow-[0_24px_50px_-20px_rgba(11,44,107,0.5)] backdrop-blur-md xl:block"
      >
        <PromisePanel className="space-y-1" />
      </motion.div>

      <div className="relative mx-auto max-w-site px-5 pb-14 pt-8 md:min-h-[540px] md:pb-20 md:pt-14 lg:px-8">
        <div className="relative z-20 md:max-w-[48%] lg:max-w-[44%]">
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.4em" }}
            animate={{ opacity: 1, letterSpacing: "0.22em" }}
            transition={{ duration: 0.9, ease: EASE }}
            className="text-[11px] font-semibold uppercase text-navy/70"
          >
            {t(HERO.eyebrow)}
          </motion.p>
          <h1 key={lang} className="mt-3 font-display text-[2.4rem] font-bold leading-[1.08] md:text-[3.4rem]">
            <span className="inline-block overflow-hidden pb-1 align-bottom">
              <motion.span initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ delay: 0.15, duration: 0.7, ease: EASE }} className="inline-block text-navy">
                {t(TITLE.lead)}
              </motion.span>
            </span>
            <span className="block">
              {accentWords.map((w, i) => (
                <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
                  <motion.span
                    initial={{ y: "105%" }}
                    animate={{ y: 0 }}
                    transition={{ delay: 0.25 + i * 0.08, duration: 0.7, ease: EASE }}
                    className="inline-block bg-gradient-to-r from-brand to-brand-bright bg-clip-text text-transparent"
                  >
                    {w}
                  </motion.span>
                  {i < accentWords.length - 1 && "\u00a0"}
                </span>
              ))}
            </span>
          </h1>
          <motion.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.6, ease: EASE }}
            className="mt-4 block h-1 w-14 origin-left rounded-full bg-brand-bright"
          />
          <div key={`lines-${lang}`} className="mt-4 space-y-0.5">
            {LINES.map((l, i) => (
              <motion.p
                key={l.en}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.12, duration: 0.5, ease: EASE }}
                className="text-[15px] font-medium text-ink/80 md:text-base"
              >
                {t(l)}
              </motion.p>
            ))}
          </div>
          <HeroSearch className="mt-7" delay={1.1} />
          <PromisePanel className="mt-6 grid grid-cols-2 gap-2 xl:hidden" />
        </div>
      </div>
    </section>
  );
}
