import { useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { CaretRight } from "@phosphor-icons/react";
import palace from "@/assets/discover/hero.jpg";
import { GoldButton } from "@/components/connect/GoldButton";
import { EASE } from "@/components/connect/shared";
import { useT } from "@/theme/context";
import { OpportunityOrbit } from "./OpportunityOrbit";

const PHOTO_MASK = {
  maskImage: "linear-gradient(to right, transparent 0%, #000 34%), linear-gradient(to bottom, transparent 0%, #000 26%)",
  WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 34%), linear-gradient(to bottom, transparent 0%, #000 26%)",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
} as const;

export function DiscoverHero({ reduce }: { reduce: boolean }) {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const orbitY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const enter = (delay: number, duration = 0.5) => ({
    initial: reduce ? false : ({ opacity: 0, y: 22 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration, delay, ease: EASE },
  });

  return (
    <section
      ref={ref}
      className="relative isolate h-[100svh] min-h-[720px] max-h-[940px] overflow-hidden bg-[radial-gradient(85%_75%_at_64%_46%,var(--gc-hero-1,#2a1550)_0%,var(--gc-hero-2,#131840)_45%,var(--gc-hero-3,#080b24)_100%)] text-white"
    >
      <motion.div
        className="pointer-events-none absolute right-0 bottom-0 hidden w-[44vw] max-w-[700px] lg:block"
        style={reduce ? undefined : { y: photoY }}
        initial={reduce ? false : { opacity: 0, scale: 1.06 }}
        animate={{ opacity: 0.9, scale: 1 }}
        transition={{ duration: 1.4, delay: 0.2, ease: EASE }}
      >
        <img src={palace} alt="Mysuru Palace illuminated at dusk" className="w-full" style={PHOTO_MASK} />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.05)_1px,transparent_1.5px)] bg-[length:26px_26px]" />

      <motion.div className="absolute inset-0" style={reduce ? undefined : { y: orbitY }}>
        <OpportunityOrbit reduce={reduce} />
      </motion.div>

      <motion.p
        className="absolute top-[118px] right-8 z-30 hidden max-w-[180px] text-right font-display text-[18px] leading-snug font-semibold text-white/90 xl:block"
        initial={reduce ? false : { opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 1.6, ease: EASE }}
      >
        {t("Global Opportunities")} <span className="text-[color:var(--gc-peach,var(--gc-peach,#ffb38a))]">{t("for a Stronger Karnataka")}</span>
      </motion.p>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(var(--gc-ov,8,11,36),0.9)_0%,rgba(var(--gc-ov,8,11,36),0.5)_30%,transparent_46%)] max-lg:bg-[linear-gradient(180deg,rgba(var(--gc-ov,8,11,36),0.88)_0%,rgba(var(--gc-ov,8,11,36),0.45)_48%,transparent_62%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-28 bg-gradient-to-b from-[color:var(--gc-hero-3,#080b24)]/80 to-transparent" />

      <motion.div
        className="pointer-events-none relative z-30 mx-auto flex h-full max-w-[1320px] flex-col px-5 pt-[108px] lg:justify-center lg:px-8 lg:pt-4 lg:pb-16 [&_a]:pointer-events-auto"
        style={reduce ? undefined : { y: textY, opacity: textOpacity }}
      >
        <motion.nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-white/65" {...enter(0.2)}>
          <Link to="/global-connect" className="transition hover:text-white">
            {t("Home")}
          </Link>
          <CaretRight size={12} />
          <span className="text-white">{t("Opportunities")}</span>
        </motion.nav>
        <motion.p className="mt-5 text-[12px] font-extrabold tracking-[0.24em] text-[color:var(--gc-pink,var(--gc-pink,#ff9fb4))] uppercase" {...enter(0.3)}>
          {t("Opportunities in Karnataka")}
        </motion.p>
        <motion.h1
          className="mt-3 font-display text-[40px] leading-[1.04] font-bold tracking-[-0.035em] sm:text-[56px] lg:text-[48px] xl:text-[58px]"
          {...enter(0.42)}
        >
          {t("Explore Opportunities")}
          <br />
          <span className="inline-block bg-gradient-to-r from-(color:--gc-gold) via-[color:var(--gc-orange,var(--gc-orange,#ffb057))] to-[color:var(--gc-pink-2,var(--gc-pink-2,#ff7f9f))] bg-clip-text pr-2 text-transparent">
            {t("in Karnataka")}
          </span>
        </motion.h1>
        <motion.p className="mt-5 max-w-[470px] text-[17px] leading-relaxed text-white/85 sm:text-[18px]" {...enter(0.6)}>
          {t(
            "One place to find investment opportunities, projects, partnerships, programmes, tenders, talent opportunities and other ways to engage with Karnataka.",
          )}
        </motion.p>
        <motion.div className="mt-8 flex flex-wrap gap-3" {...enter(0.8, 0.4)}>
          <GoldButton href="#search">Explore Opportunities</GoldButton>
          <a
            href="#share"
            className="inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-[14.5px] font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            {t("Submit an Opportunity")}
          </a>
        </motion.div>
      </motion.div>

      <svg
        className="pointer-events-none absolute inset-x-0 -bottom-px z-30 h-[70px] w-full sm:h-[90px]"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 40 C 360 95, 1080 95, 1440 40 L1440 90 L0 90 Z" fill="#ffffff" />
        <path d="M0 40 C 360 95, 1080 95, 1440 40" fill="none" stroke="var(--gc-pink,#ff9fb4)" strokeOpacity="0.5" strokeWidth="1.5" />
      </svg>
    </section>
  );
}
