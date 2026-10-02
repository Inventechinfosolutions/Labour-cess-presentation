import { useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Briefcase,
  CaretRight,
  Flask,
  GlobeHemisphereWest,
  GraduationCap,
  HandsClapping,
  ShareNetwork,
} from "@phosphor-icons/react";
import people from "@/assets/talent/hero.jpg";
import { GoldButton } from "@/components/connect/GoldButton";
import { EASE } from "@/components/connect/shared";
import { useT } from "@/theme/context";
import mapBg from "@/assets/talent/hero-bg.jpg";
import { ImageHeroMap, type ImageMapSource } from "@/components/ImageHeroMap";

const HUB: [number, number] = [1062, 438];
const SOURCES: ImageMapSource[] = [
  { label: "North America", at: [445, 312], side: "above" },
  { label: "Europe", at: [812, 270], side: "above" },
  { label: "Middle East", at: [950, 372], side: "above" },
  { label: "Asia Pacific", at: [1250, 336], side: "above" },
  { label: "Africa", at: [875, 515], side: "left" },
  { label: "Australia", at: [1305, 625], side: "right" },
];
const CAPTION = { title: "KARNATAKA", sub: "Talent to the World" };

const WORDS = ["People", "Skills", "Ideas", "Opportunities", "A Stronger Karnataka"];

const QUICK = [
  { label: "Global Employment", icon: Briefcase, href: "#looking" },
  { label: "Higher Education", icon: GraduationCap, href: "#looking" },
  { label: "Research & Innovation", icon: Flask, href: "#looking" },
  { label: "Internships & Exchange", icon: ShareNetwork, href: "#looking" },
  { label: "Mentorship & Collaboration", icon: HandsClapping, href: "#looking" },
  { label: "Global Opportunities", icon: GlobeHemisphereWest, href: "#where" },
];

const PHOTO_MASK = {
  maskImage: "linear-gradient(to right, transparent 0%, #000 26%), linear-gradient(to bottom, transparent 0%, #000 34%)",
  WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 26%), linear-gradient(to bottom, transparent 0%, #000 34%)",
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
} as const;

export function TalentHero({ reduce }: { reduce: boolean }) {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mapY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 70]);
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
      className="relative isolate h-[100svh] min-h-[720px] max-h-[940px] overflow-hidden bg-[radial-gradient(90%_80%_at_70%_40%,var(--gc-hero-1,#04266e)_0%,var(--gc-hero-2,#021a52)_45%,var(--gc-hero-3,#010d30)_100%)] text-white"
    >
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y: mapY }}>
        <ImageHeroMap reduce={reduce} image={mapBg} hub={HUB} sources={SOURCES} caption={CAPTION} />
      </motion.div>

      <motion.div
        className="pointer-events-none absolute right-0 bottom-0 hidden w-[40vw] max-w-[620px] lg:block"
        style={reduce ? undefined : { y: photoY }}
        initial={reduce ? false : { opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
      >
        <img src={people} alt="Young professionals and a graduate from Karnataka" className="w-full" style={PHOTO_MASK} />
      </motion.div>

      <ul className="absolute top-[118px] right-8 z-10 hidden text-right xl:block" aria-label="What travels">
        {WORDS.map((w, i) => (
          <motion.li
            key={w}
            className={
              i === WORDS.length - 1
                ? "mt-1 max-w-[150px] font-display text-[17px] leading-tight font-bold text-(color:--gc-gold)"
                : "font-display text-[17px] leading-[1.45] font-semibold text-white/90"
            }
            initial={reduce ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.4 + i * 0.14, ease: EASE }}
          >
            {w}
          </motion.li>
        ))}
      </ul>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(var(--gc-ov,1,13,48),0.9)_0%,rgba(var(--gc-ov,1,13,48),0.55)_30%,transparent_48%)] max-lg:bg-[linear-gradient(180deg,rgba(var(--gc-ov,1,13,48),0.85)_0%,rgba(var(--gc-ov,1,13,48),0.4)_45%,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[color:var(--gc-hero-3,#010d30)]/80 to-transparent" />

      <motion.div
        className="relative mx-auto flex h-full max-w-[1320px] flex-col px-5 pt-[108px] lg:justify-center lg:px-8 lg:pt-4 lg:pb-16"
        style={reduce ? undefined : { y: textY, opacity: textOpacity }}
      >
        <motion.nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-white/65" {...enter(0.3)}>
          <Link to="/global-connect" className="transition hover:text-white">
            {t("Home")}
          </Link>
          <CaretRight size={12} />
          <span className="text-white">{t("Talent")}</span>
        </motion.nav>
        <motion.p className="mt-5 text-[12px] font-extrabold tracking-[0.24em] text-(color:--gc-accent-3) uppercase" {...enter(0.4)}>
          {t("Global Talent Platform")}
        </motion.p>
        <motion.h1
          className="mt-3 font-display text-[40px] leading-[1.04] font-bold tracking-[-0.035em] sm:text-[56px] lg:text-[64px]"
          {...enter(0.5)}
        >
          {t("Connect Talent")}
          <br />
          <span className="inline-block bg-gradient-to-r from-(color:--gc-gold) via-[#ffc94d] to-(color:--gc-gold-4) bg-clip-text pr-2 text-transparent">
            {t("With the World")}
          </span>
        </motion.h1>
        <motion.p className="mt-5 max-w-[480px] text-[17px] leading-relaxed text-white/85 sm:text-[18px]" {...enter(0.65)}>
          {t(
            "A global platform connecting Karnataka's talent, professionals, students, researchers and employers with opportunities across the world.",
          )}
        </motion.p>
        <motion.div className="mt-8 flex flex-wrap gap-3" {...enter(0.85, 0.4)}>
          <GoldButton href="#looking">Explore Talent Opportunities</GoldButton>
          <a
            href="#profile"
            className="inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-[14.5px] font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            {t("Create Your Talent Profile")}
          </a>
        </motion.div>
        <ul className="mt-10 hidden max-w-[620px] grid-cols-6 gap-3 sm:grid">
          {QUICK.map(({ label, icon: Icon, href }, i) => (
            <motion.li key={label} {...enter(1.05 + i * 0.07, 0.4)}>
              <a href={href} className="group flex flex-col items-center gap-2 text-center text-[11.5px] leading-tight text-white/80 transition hover:text-white">
                <span className="grid size-10 place-items-center rounded-xl border border-white/20 bg-white/5 text-(color:--gc-gold) transition group-hover:-translate-y-1 group-hover:border-(color:--gc-gold)/70">
                  <Icon size={20} weight="duotone" />
                </span>
                {t(label)}
              </a>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <svg
        className="pointer-events-none absolute inset-x-0 -bottom-px h-[70px] w-full sm:h-[90px]"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 40 C 360 95, 1080 95, 1440 40 L1440 90 L0 90 Z" fill="#ffffff" />
        <path d="M0 40 C 360 95, 1080 95, 1440 40" fill="none" stroke="#3fb4ff" strokeOpacity="0.45" strokeWidth="1.5" />
      </svg>
    </section>
  );
}
