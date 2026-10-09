import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { EASE } from "@/components/home/shared";
import { HeroIntro, HeroSearch } from "@/components/kit/HeroIntro";
import { PILLARS } from "@/lib/content";
import { useLang, type Text } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { asset, cn } from "@/lib/utils";

const DURATION = 6500;
const t2 = (en: string, kn: string): Text => ({ en, kn });

const SLIDES: { image: string; alt: Text; title: Text; items: Text[] }[] = [
  {
    image: PHOTOS.towers,
    alt: t2("BDA apartment towers", "ಬಿಡಿಎ ವಸತಿ ಸಮುಚ್ಚಯದ ಗೋಪುರಗಳು"),
    title: t2("Our Focus Areas", "ನಮ್ಮ ಗಮನದ ಕ್ಷೇತ್ರಗಳು"),
    items: PILLARS,
  },
  {
    image: PHOTOS.layoutSigns,
    alt: t2("BDA site markers at Nadaprabhu Kempegowda Layout", "ನಾಡಪ್ರಭು ಕೆಂಪೇಗೌಡ ಬಡಾವಣೆಯ ಬಿಡಿಎ ನಿವೇಶನ ಫಲಕಗಳು"),
    title: t2("Planned Layouts", "ಯೋಜಿತ ಬಡಾವಣೆಗಳು"),
    items: [
      t2("Dr. K. Shivarama Karanth Layout", "ಡಾ. ಕೆ. ಶಿವರಾಮ ಕಾರಂತ ಬಡಾವಣೆ"),
      t2("Nadaprabhu Kempegowda Layout", "ನಾಡಪ್ರಭು ಕೆಂಪೇಗೌಡ ಬಡಾವಣೆ"),
      t2("Arkavathy Layout", "ಅರ್ಕಾವತಿ ಬಡಾವಣೆ"),
    ],
  },
  {
    image: PHOTOS.villa,
    alt: t2("A BDA villa", "ಬಿಡಿಎ ವಿಲ್ಲಾ"),
    title: t2("Housing for All", "ಎಲ್ಲರಿಗೂ ವಸತಿ"),
    items: [t2("BDA Flats", "ಬಿಡಿಎ ಫ್ಲ್ಯಾಟ್‌ಗಳು"), t2("Villas", "ವಿಲ್ಲಾಗಳು"), t2("Affordable Housing", "ಕೈಗೆಟುಕುವ ವಸತಿ")],
  },
];

const PREV = t2("Previous slide", "ಹಿಂದಿನ ಸ್ಲೈಡ್");
const NEXT = t2("Next slide", "ಮುಂದಿನ ಸ್ಲೈಡ್");

export function ShowcaseHero() {
  const { t } = useLang();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (d: number) => setIndex((i) => (i + d + SLIDES.length) % SLIDES.length);
  const slide = SLIDES[index];
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") go(-1);
        if (e.key === "ArrowRight") go(1);
      }}
      className="relative overflow-hidden bg-gradient-to-b from-[#f4f8ff] to-[#e8f0ff]"
    >
      <div className="relative h-64 sm:h-80 md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[60%] md:[mask-image:linear-gradient(to_right,transparent_0%,black_30%)]">
        <AnimatePresence initial={false}>
          <motion.img
            key={index}
            src={asset(slide.image)}
            alt={t(slide.alt)}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1.02 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.1, ease: "easeInOut" }, scale: { duration: 8, ease: "linear" } }}
            className="absolute inset-0 size-full object-cover"
          />
        </AnimatePresence>
      </div>

      <svg className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-24 w-full md:block" viewBox="0 0 1440 96" preserveAspectRatio="none" aria-hidden>
        <motion.path
          d="M0 96 L0 58 C 320 8, 760 112, 1440 26 L1440 96 Z"
          fill="var(--color-page)"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1, ease: EASE }}
        />
      </svg>

      <motion.div
        initial={{ x: 140, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.9, ease: EASE }}
        className="absolute right-0 top-10 z-10 hidden w-[320px] lg:block"
      >
        <div className="relative overflow-hidden rounded-l-[60px] bg-gradient-to-br from-navy via-[#173f9e] to-brand-bright px-9 py-8 text-white shadow-[0_24px_50px_-20px_rgba(8,31,80,0.7)]">
          <span className="absolute -right-10 -top-10 size-36 animate-float-slow rounded-full border border-white/15" aria-hidden />
          <span className="absolute -bottom-12 right-10 size-28 animate-float rounded-full bg-white/5" aria-hidden />
          <AnimatePresence mode="wait">
            <motion.div key={index} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.45, ease: EASE }}>
              <p className="font-script text-[32px] leading-tight">{t(slide.title)}</p>
              <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5 text-[12.5px] text-white/85">
                {slide.items.map((it, i) => (
                  <motion.li
                    key={it.en}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                    className="flex items-center gap-3"
                  >
                    {i > 0 && <span className="h-3 w-px bg-white/40" aria-hidden />}
                    {t(it)}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="relative mx-auto max-w-site px-5 pb-14 pt-8 md:min-h-[620px] md:pb-32 md:pt-14 lg:px-8">
        <div className="relative z-20 md:max-w-[50%] lg:max-w-[44%]">
          <HeroIntro />
          <HeroSearch className="mt-7" />
        </div>

        <div className="mt-8 flex w-fit items-center gap-4 rounded-full border border-white/70 bg-white/80 py-1.5 pl-5 pr-1.5 shadow-[0_12px_30px_-14px_rgba(11,44,107,0.45)] backdrop-blur md:absolute md:bottom-32 md:right-8 md:mt-0">
          <span className="font-display text-[15px] font-semibold tabular-nums text-navy">
            {pad(index + 1)} <span className="font-normal text-muted">/ {pad(SLIDES.length)}</span>
          </span>
          <span className="relative h-1 w-24 overflow-hidden rounded-full bg-navy/15">
            {!reduce && (
              <span
                key={index}
                onAnimationEnd={() => go(1)}
                className="absolute inset-0 origin-left rounded-full bg-brand"
                style={{ animation: `grow ${DURATION}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
              />
            )}
          </span>
          {[
            { label: PREV, Icon: CaretLeft, d: -1 },
            { label: NEXT, Icon: CaretRight, d: 1 },
          ].map(({ label, Icon, d }) => (
            <motion.button
              key={d}
              type="button"
              aria-label={t(label)}
              onClick={() => go(d)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={cn(
                "grid size-10 place-items-center rounded-full shadow-md transition-colors hover:bg-brand hover:text-white",
                d > 0 ? "bg-navy text-white" : "bg-white text-navy",
              )}
            >
              <Icon weight="bold" />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
