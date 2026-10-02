import { useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { CaretRight, ChartLineUp, GlobeHemisphereEast, HandCoins, Handshake, Lightbulb, Wrench, Cpu } from "@phosphor-icons/react";
import people from "@/assets/partner/hero.jpg";
import { GoldButton } from "@/components/connect/GoldButton";
import { EASE } from "@/components/connect/shared";
import { useT } from "@/theme/context";
import { PartnerNetwork } from "./PartnerNetwork";

const BENEFITS = [
  { label: "Ideas", icon: Lightbulb },
  { label: "Expertise", icon: Wrench },
  { label: "Technology", icon: Cpu },
  { label: "Investment", icon: HandCoins },
  { label: "Collaboration", icon: Handshake },
  { label: "Global Impact", icon: GlobeHemisphereEast },
];

const PHOTO_MASK = {
  maskImage: "linear-gradient(to right, transparent 0%, #000 30%), linear-gradient(to bottom, transparent 0%, #000 30%)",
  WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 30%), linear-gradient(to bottom, transparent 0%, #000 30%)",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
} as const;

export function PartnerHero({ reduce }: { reduce: boolean }) {
  const t = useT();
  const LINE_ONE = t("Build Partnerships").split(" ");
  const LINE_TWO = t("With Karnataka").split(" ");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mapY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  const enter = (delay: number, duration = 0.5) => ({
    initial: reduce ? false : ({ opacity: 0, y: 22 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration, delay, ease: EASE },
  });

  const word = (w: string, i: number) => (
    <motion.span
      key={`${w}-${i}`}
      className="mr-[0.22em] inline-block"
      initial={reduce ? false : { opacity: 0, x: -24, filter: "blur(6px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.55, delay: 0.45 + i * 0.12, ease: EASE }}
    >
      {w}
    </motion.span>
  );

  return (
    <section
      ref={ref}
      className="relative isolate h-[100svh] min-h-[720px] max-h-[940px] overflow-hidden bg-[radial-gradient(90%_80%_at_62%_42%,var(--gc-hero-1,#241a78)_0%,var(--gc-hero-2,#120d4a)_45%,var(--gc-hero-3,#07052a)_100%)] text-white"
    >
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { y: mapY }}
        initial={reduce ? false : { opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: EASE }}
      >
        <PartnerNetwork reduce={reduce} />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute right-0 bottom-0 hidden w-[36vw] max-w-[560px] lg:block"
        style={reduce ? undefined : { y: photoY }}
        initial={reduce ? false : { opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 1, ease: EASE }}
      >
        <img src={people} alt="Business leaders agreeing a partnership on a Bengaluru rooftop" className="w-full" style={PHOTO_MASK} />
      </motion.div>

      <ul className="absolute top-[112px] right-8 z-10 hidden space-y-2 xl:block" aria-label="What partners bring">
        {BENEFITS.map(({ label, icon: Icon }, i) => (
          <motion.li
            key={label}
            className="flex items-center justify-end gap-2 text-[14px] font-semibold text-white/90"
            initial={reduce ? false : { opacity: 0, x: 24 }}
            animate={reduce ? { opacity: 1, x: 0 } : { opacity: 1, x: 0, y: [0, -3, 0] }}
            transition={{
              opacity: { duration: 0.5, delay: 1.5 + i * 0.12 },
              x: { duration: 0.5, delay: 1.5 + i * 0.12, ease: EASE },
              y: { duration: 3.2, delay: 2.4 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            {label}
            <span className="grid size-7 place-items-center rounded-lg border border-(color:--gc-gold)/30 bg-white/5 text-(color:--gc-gold)">
              <Icon size={15} weight="duotone" />
            </span>
          </motion.li>
        ))}
      </ul>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(var(--gc-ov,7,5,42),0.92)_0%,rgba(var(--gc-ov,7,5,42),0.55)_30%,transparent_46%)] max-lg:bg-[linear-gradient(180deg,rgba(var(--gc-ov,7,5,42),0.88)_0%,rgba(var(--gc-ov,7,5,42),0.45)_48%,transparent_62%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[color:var(--gc-hero-3,#07052a)]/80 to-transparent" />

      <motion.div
        className="relative mx-auto flex h-full max-w-[1320px] flex-col px-5 pt-[108px] lg:justify-center lg:px-8 lg:pt-4 lg:pb-16"
        style={reduce ? undefined : { y: textY, opacity: textOpacity }}
      >
        <motion.nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-white/65" {...enter(0.2)}>
          <Link to="/global-connect" className="transition hover:text-white">
            {t("Home")}
          </Link>
          <CaretRight size={12} />
          <span className="text-white">{t("Partnerships")}</span>
        </motion.nav>
        <motion.p className="mt-5 text-[12px] font-extrabold tracking-[0.24em] text-[color:var(--gc-hl,#b9a8ff)] uppercase" {...enter(0.3)}>
          {t("Global Partnerships")}
        </motion.p>
        <h1 className="mt-3 font-display text-[40px] leading-[1.04] font-bold tracking-[-0.035em] sm:text-[56px] lg:text-[64px]">
          {LINE_ONE.map((w, i) => word(w, i))}
          <br />
          <span className="inline-block bg-gradient-to-r from-(color:--gc-gold) via-[#ffc94d] to-(color:--gc-gold-4) bg-clip-text pr-2 text-transparent">
            {LINE_TWO.map((w, i) => word(w, i + LINE_ONE.length))}
          </span>
        </h1>
        <motion.p className="mt-5 max-w-[470px] text-[17px] leading-relaxed text-white/85 sm:text-[18px]" {...enter(0.95)}>
          {t(
            "Connect with industries, institutions, universities, government bodies and innovation ecosystems to create meaningful global partnerships.",
          )}
        </motion.p>
        <motion.div className="mt-8 flex flex-wrap gap-3" {...enter(1.1, 0.4)}>
          <GoldButton href="#opportunities">Explore Partnership Opportunities</GoldButton>
          <a
            href="#build"
            className="inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-[14.5px] font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            {t("Register as a Partner")}
          </a>
        </motion.div>
        <motion.p className="mt-8 hidden items-center gap-2 text-[13px] text-white/65 sm:flex" {...enter(1.3, 0.4)}>
          <ChartLineUp size={16} className="text-(color:--gc-gold)" />
          {t("Industry · Research · Academia · Technology · Government · Startups")}
        </motion.p>
      </motion.div>

      <svg
        className="pointer-events-none absolute inset-x-0 -bottom-px h-[70px] w-full sm:h-[90px]"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 40 C 360 95, 1080 95, 1440 40 L1440 90 L0 90 Z" fill="#ffffff" />
        <path d="M0 40 C 360 95, 1080 95, 1440 40" fill="none" stroke="var(--gc-hl,#a78bfa)" strokeOpacity="0.5" strokeWidth="1.5" />
      </svg>
    </section>
  );
}
