import { useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { Briefcase, CalendarStar, CaretRight, GlobeHemisphereWest, Handshake, UsersThree } from "@phosphor-icons/react";
import community from "@/assets/connect/hero.jpg";
import { useT } from "@/theme/context";
import { GoldButton } from "./GoldButton";
import { KannadigaGlobe } from "./KannadigaGlobe";
import { EASE } from "./shared";

const QUICK = [
  { label: "Global Community", icon: GlobeHemisphereWest, href: "#community" },
  { label: "Professionals & Experts", icon: Briefcase, href: "#join" },
  { label: "Associations", icon: UsersThree, href: "#associations" },
  { label: "Events & Engagement", icon: CalendarStar, href: "#events" },
  { label: "Opportunities", icon: Handshake, href: "#opportunities" },
];

export function ConnectHero({ reduce }: { reduce: boolean }) {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mapY = useTransform(scrollYProgress, [0, 1], [0, 160]);
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
      className="relative isolate h-[100svh] min-h-[700px] max-h-[920px] overflow-hidden bg-[radial-gradient(90%_80%_at_68%_60%,var(--gc-hero-1,#06363c)_0%,var(--gc-hero-2,#022024)_45%,var(--gc-hero-3,#011316)_100%)] text-white"
    >
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y: mapY }}>
        <motion.div
          className="absolute left-1/2 -bottom-[70px] w-[min(100vw,420px)] -translate-x-1/2 sm:-bottom-[200px] sm:w-[min(90vw,620px)] lg:top-1/2 lg:bottom-auto lg:left-[66%] lg:w-[min(50vw,82vh,700px)] lg:-translate-y-[46%]"
          initial={reduce ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: EASE }}
        >
          <KannadigaGlobe reduce={reduce} />
        </motion.div>
      </motion.div>

      <motion.figure
        className="absolute right-8 bottom-[110px] z-10 hidden w-[240px] overflow-hidden rounded-[20px] bg-[#03262b] shadow-[0_24px_60px_rgba(0,0,0,0.45)] ring-1 ring-(color:--gc-gold)/30 xl:block 2xl:w-[280px]"
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 1.2, ease: EASE }}
      >
        <img src={community} alt="Kannadiga professionals from around the world" className="aspect-[4/3] w-full object-cover" />
        <figcaption className="flex items-center gap-2 px-4 py-2.5 text-[12.5px] text-white/85">
          <span className="size-2 rounded-full bg-(color:--gc-gold)" />
          One community, across every region
        </figcaption>
      </motion.figure>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(var(--gc-ov,1,19,22),0.9)_0%,rgba(var(--gc-ov,1,19,22),0.55)_30%,transparent_48%)] max-lg:bg-[linear-gradient(180deg,rgba(var(--gc-ov,1,19,22),0.85)_0%,rgba(var(--gc-ov,1,19,22),0.4)_45%,transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[color:var(--gc-hero-3,#011316)]/80 to-transparent" />

      <motion.div
        className="relative mx-auto flex h-full max-w-[1320px] flex-col px-5 pt-[108px] lg:justify-center lg:px-8 lg:pt-4 lg:pb-20"
        style={reduce ? undefined : { y: textY, opacity: textOpacity }}
      >
        <motion.nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-white/65" {...enter(0.3)}>
          <Link to="/global-connect" className="transition hover:text-white">
            {t("Home")}
          </Link>
          <CaretRight size={12} />
          <span className="text-white">{t("Connect")}</span>
        </motion.nav>
        <motion.p className="mt-5 text-[12px] font-extrabold tracking-[0.24em] text-(color:--gc-gold-2) uppercase" {...enter(0.4)}>
          {t("A Global Kannadiga Network")}
        </motion.p>
        <motion.h1
          className="mt-3 font-display text-[40px] leading-[1.04] font-bold tracking-[-0.035em] sm:text-[56px] lg:text-[66px]"
          {...enter(0.5)}
        >
          {t("Connect with")}
          <br />
          <span className="inline-block bg-gradient-to-r from-(color:--gc-accent) via-(color:--gc-accent-2) to-(color:--gc-gold) bg-clip-text pr-2 font-serif text-[1.18em] leading-[0.95] font-normal tracking-[-0.01em] text-transparent italic">
            {t("Kannadigas")}
          </span>
        </motion.h1>
        <motion.p className="mt-5 max-w-[460px] text-[17px] leading-relaxed text-white/85 sm:text-[18px]" {...enter(0.65)}>
          {t("A global network connecting Kannadigas, professionals, entrepreneurs, communities and Karnataka.")}
        </motion.p>
        <motion.div className="mt-8 flex flex-wrap gap-3" {...enter(0.85, 0.4)}>
          <GoldButton href="#join">Join the Global Kannadiga Network</GoldButton>
          <a
            href="#community"
            className="inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-[14.5px] font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            {t("Explore the Network")}
          </a>
        </motion.div>
        <motion.ul className="mt-10 hidden max-w-[600px] flex-wrap gap-x-5 gap-y-3 sm:flex" {...enter(1.05, 0.4)}>
          {QUICK.map(({ label, icon: Icon, href }) => (
            <li key={label}>
              <a href={href} className="group flex items-center gap-2 text-[12.5px] text-white/80 transition hover:text-white">
                <span className="grid size-8 place-items-center rounded-full border border-(color:--gc-gold)/40 text-(color:--gc-gold) transition group-hover:border-(color:--gc-gold)">
                  <Icon size={16} weight="duotone" />
                </span>
                {t(label)}
              </a>
            </li>
          ))}
        </motion.ul>
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
