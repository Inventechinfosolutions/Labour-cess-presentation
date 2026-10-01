import { useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { Briefcase, CalendarStar, CaretRight, GlobeHemisphereWest, Handshake, UsersThree } from "@phosphor-icons/react";
import community from "@/assets/connect/hero.jpg";
import { HeroMap, type MapSource } from "@/components/home/HeroMap";
import type { Inset, Size } from "@/lib/geo";
import { GoldButton } from "./GoldButton";
import { EASE } from "./shared";

const SOURCES: MapSource[] = [
  { label: "USA", at: [40.71, -74.0], dx: 0, dy: -14, anchor: "middle" },
  { label: "UK", at: [51.5, -0.13], dx: -8, dy: -12, anchor: "end" },
  { label: "EUROPE", at: [48.2, 16.4], dx: 6, dy: -14, anchor: "start" },
  { label: "MIDDLE EAST", at: [25.2, 55.3], dx: -10, dy: -10, anchor: "end" },
  { label: "ASIA", at: [1.35, 103.8], dx: 10, dy: 12, anchor: "start" },
  { label: "AUSTRALIA", at: [-33.87, 151.2], dx: 0, dy: 20, anchor: "middle" },
];

function insetFor({ w, h }: Size): Inset {
  if (w >= 1024) return { l: w * 0.36, r: 80, t: 210, b: 190 };
  if (w >= 640) return { l: 70, r: 96, t: h * 0.52, b: 120 };
  return { l: 40, r: 74, t: h * 0.6, b: 100 };
}

const QUICK = [
  { label: "Global Community", icon: GlobeHemisphereWest, href: "#community" },
  { label: "Professionals & Experts", icon: Briefcase, href: "#join" },
  { label: "Associations", icon: UsersThree, href: "#associations" },
  { label: "Events & Engagement", icon: CalendarStar, href: "#events" },
  { label: "Opportunities", icon: Handshake, href: "#opportunities" },
];

const TAGLINE = (
  <>
    Wherever you are, <span className="text-[#ffcf6b]">you belong here</span>
  </>
);

export function ConnectHero({ reduce }: { reduce: boolean }) {
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
    <section ref={ref} className="relative isolate h-[100svh] min-h-[700px] max-h-[920px] overflow-hidden text-white">
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { y: mapY }}
        initial={reduce ? false : { opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <HeroMap reduce={reduce} sources={SOURCES} insetFor={insetFor} tagline={TAGLINE} arcDuration={0.9} />
      </motion.div>

      <motion.figure
        className="absolute top-[104px] right-8 z-10 hidden w-[300px] overflow-hidden rounded-[22px] bg-[#061536] shadow-[0_24px_60px_rgba(0,0,0,0.45)] ring-1 ring-[#ffd77a]/30 xl:block 2xl:w-[340px]"
        initial={reduce ? false : { opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, delay: 1.2, ease: EASE }}
      >
        <img src={community} alt="Kannadiga professionals from around the world" className="aspect-[4/3] w-full object-cover" />
        <figcaption className="flex items-center gap-2 px-4 py-2.5 text-[12.5px] text-white/85">
          <span className="size-2 rounded-full bg-[#ffd77a]" />
          One community, across every region
        </figcaption>
      </motion.figure>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,11,34,0.92)_0%,rgba(3,11,34,0.7)_28%,rgba(3,11,34,0.05)_50%,transparent_70%)] max-lg:bg-[linear-gradient(180deg,rgba(3,11,34,0.92)_0%,rgba(3,11,34,0.6)_45%,transparent_65%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#030b22]/80 to-transparent" />

      <motion.div
        className="relative mx-auto flex h-full max-w-[1320px] flex-col px-5 pt-[108px] lg:justify-center lg:px-8 lg:pt-4 lg:pb-20"
        style={reduce ? undefined : { y: textY, opacity: textOpacity }}
      >
        <motion.nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-white/65" {...enter(0.3)}>
          <Link to="/global-connect" className="transition hover:text-white">
            Home
          </Link>
          <CaretRight size={12} />
          <span className="text-white">Kannadigas</span>
        </motion.nav>
        <motion.p className="mt-5 text-[12px] font-extrabold tracking-[0.24em] text-[#ffcf6b] uppercase" {...enter(0.4)}>
          A Global Kannadiga Network
        </motion.p>
        <motion.h1
          className="mt-3 font-display text-[40px] leading-[1.04] font-bold tracking-[-0.035em] sm:text-[56px] lg:text-[66px]"
          {...enter(0.5)}
        >
          Connect with
          <br />
          <span className="inline-block bg-gradient-to-r from-[#3fb4ff] via-[#7fd3ff] to-[#ffd77a] bg-clip-text pr-2 font-serif text-[1.18em] leading-[0.95] font-normal tracking-[-0.01em] text-transparent italic">
            Kannadigas
          </span>
        </motion.h1>
        <motion.p className="mt-5 max-w-[460px] text-[17px] leading-relaxed text-white/85 sm:text-[18px]" {...enter(0.65)}>
          A global network connecting Kannadigas, professionals, entrepreneurs, communities and Karnataka.
        </motion.p>
        <motion.div className="mt-8 flex flex-wrap gap-3" {...enter(0.85, 0.4)}>
          <GoldButton href="#join">Join the Global Kannadiga Network</GoldButton>
          <a
            href="#community"
            className="inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-[14.5px] font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Explore the Network
          </a>
        </motion.div>
        <motion.ul className="mt-10 hidden max-w-[600px] flex-wrap gap-x-5 gap-y-3 sm:flex" {...enter(1.05, 0.4)}>
          {QUICK.map(({ label, icon: Icon, href }) => (
            <li key={label}>
              <a href={href} className="group flex items-center gap-2 text-[12.5px] text-white/80 transition hover:text-white">
                <span className="grid size-8 place-items-center rounded-full border border-[#ffd77a]/40 text-[#ffd77a] transition group-hover:border-[#ffd77a]">
                  <Icon size={16} weight="duotone" />
                </span>
                {label}
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
