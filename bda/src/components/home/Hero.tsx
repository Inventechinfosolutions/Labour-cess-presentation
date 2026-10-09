import { ArrowRight } from "@phosphor-icons/react";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { HERO, OPEN_HOUSE } from "@/lib/content";
import { useDesign } from "@/lib/design";
import { HeroSlideshow } from "./HeroSlideshow";
import { useLang } from "@/lib/i18n";
import { asset, cn, external } from "@/lib/utils";

const FADE = "linear-gradient(to right, transparent 0%, black 30%)";
const NEW = { en: "NEW", kn: "ಹೊಸದು" };
const IMAGE = "images/bda-head-office.jpg";
const ALT = { en: "Bangalore Development Authority head office", kn: "ಬೆಂಗಳೂರು ಅಭಿವೃದ್ಧಿ ಪ್ರಾಧಿಕಾರ ಕೇಂದ್ರ ಕಚೇರಿ" };
const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const { t, lang } = useLang();
  const { isPhoto, pick } = useDesign();
  const words = t(HERO.title).split(" ");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const frameY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  return (
    <section ref={ref} className={cn("relative overflow-hidden bg-gradient-to-b", pick("from-[#f5f9ff] to-[#e4eeff]", "from-white to-[#edf3ff]"))}>
      {isPhoto && (
        <motion.div style={{ y: imageY }} className="absolute inset-y-0 right-0 hidden w-[58%] md:block">
          <motion.img
            src={asset(IMAGE)}
            alt={t(ALT)}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1.07 }}
            transition={{ opacity: { duration: 1.2 }, scale: { duration: 22, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" } }}
            className="size-full origin-top object-cover object-top"
            style={{ maskImage: FADE, WebkitMaskImage: FADE }}
          />
        </motion.div>
      )}
      <div className="relative mx-auto max-w-site px-5 pb-24 pt-10 md:pb-40 md:pt-16 lg:px-8">
        {!isPhoto && (
          <motion.div
            style={{ y: frameY }}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="absolute bottom-28 right-8 top-14 hidden w-[47%] lg:block"
          >
            <span className="absolute -right-24 -top-16 size-80 animate-float-slow rounded-full bg-brand-soft" aria-hidden />
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 0.3, x: 0 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="absolute -bottom-6 -left-6 h-28 w-40 bg-[radial-gradient(circle,#1d4fc4_1.2px,transparent_1.4px)] bg-[length:14px_14px]"
              aria-hidden
            />
            <div className="relative size-full animate-float">
              <HeroSlideshow className="size-full rounded-[28px] shadow-[0_24px_50px_-20px_rgba(11,44,107,0.45)] ring-8 ring-white" />
            </div>
          </motion.div>
        )}
        <motion.a
          href={OPEN_HOUSE.href}
          {...external(OPEN_HOUSE.href)}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          whileHover={{ y: -2 }}
          className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-brand/15 bg-white/85 py-1 pl-1 pr-3.5 text-[13px] font-semibold text-navy shadow-sm backdrop-blur transition-colors hover:border-brand hover:bg-brand hover:text-white"
        >
          <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 animate-shimmer bg-gradient-to-r from-transparent via-white to-transparent" aria-hidden />
          <span className="relative">
            <span className="absolute inset-0 animate-ping-soft rounded-full bg-new" aria-hidden />
            <span className="relative block rounded-full bg-new px-2 py-0.5 text-[10px] font-bold text-white">{t(NEW)}</span>
          </span>
          <span className="relative">{t(OPEN_HOUSE.label)}</span>
          <ArrowRight weight="bold" className="relative text-brand transition-[color,translate] group-hover:translate-x-1 group-hover:text-white" />
        </motion.a>
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.4em" }}
          animate={{ opacity: 1, letterSpacing: "0.22em" }}
          transition={{ delay: 0.1, duration: 0.9, ease: EASE }}
          className="mt-6 text-[11px] font-semibold uppercase text-navy/70"
        >
          {t(HERO.eyebrow)}
        </motion.p>
        <h1 key={lang} className="mt-3 max-w-xl font-display text-4xl font-bold leading-[1.12] md:text-[3.4rem]">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
              <motion.span
                initial={{ y: "105%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.7, ease: EASE }}
                className={cn(
                  "inline-block",
                  i === 0 ? "text-navy" : "bg-gradient-to-r from-brand to-brand-bright bg-clip-text text-transparent",
                )}
              >
                {w}
              </motion.span>
              {i < words.length - 1 && "\u00a0"}
            </span>
          ))}
        </h1>
        <motion.p
          key={`tag-${lang}`}
          initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.15 + words.length * 0.07, duration: 0.6, ease: EASE }}
          className="mt-5 max-w-md text-lg font-semibold text-navy md:text-2xl"
        >
          {t(HERO.tagline)}
        </motion.p>
        <motion.span
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3 + words.length * 0.07, duration: 0.6, ease: EASE }}
          className={cn("mt-6 block h-1 w-14 origin-left rounded-full", pick("bg-brand-bright", "bg-navy"))}
        />
      </div>
      {isPhoto ? (
        <motion.img
          src={asset(IMAGE)}
          alt=""
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
          className="-mt-16 h-56 w-full object-cover object-center md:hidden"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
          className="-mt-16 mx-5 mb-14 md:-mt-28 lg:hidden"
        >
          <HeroSlideshow className="h-56 rounded-2xl shadow-lg ring-4 ring-white md:h-80" />
        </motion.div>
      )}
    </section>
  );
}
