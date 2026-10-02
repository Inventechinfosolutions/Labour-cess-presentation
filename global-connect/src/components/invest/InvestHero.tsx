import { useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, Buildings, CaretRight, GlobeHemisphereEast, Handshake, UsersThree } from "@phosphor-icons/react";
import hero from "@/assets/invest/hero.jpg";
import { KARNATAKA_DISTRICTS, KARNATAKA_VIEWBOX } from "@/lib/karnatakaMap";
import { useT } from "@/theme/context";
import { EASE } from "./shared";

const CHIPS = [
  { label: "Strategic Location", icon: GlobeHemisphereEast },
  { label: "Skilled Talent Pool", icon: UsersThree },
  { label: "Progressive Policies", icon: Buildings },
  { label: "Investor Support", icon: Handshake },
];

const FLOATING = [
  { label: "Global Opportunities", className: "top-[2%] left-[78%]" },
  { label: "Investor Support", className: "top-[40%] left-[96%]" },
  { label: "Future-Ready State", className: "top-[78%] left-[84%]" },
];

export function InvestHero({ reduce }: { reduce: boolean }) {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -90]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const enter = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 24 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: EASE },
  });

  return (
    <section ref={ref} className="relative isolate h-[100svh] min-h-[680px] max-h-[900px] overflow-hidden bg-(color:--gc-navy) text-white">
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y: imgY }}>
        <motion.img
          src={hero}
          alt="Bengaluru skyline at dusk with the Vidhana Soudha lit in gold"
          className="h-full w-full object-cover object-[62%_center]"
          initial={reduce ? false : { scale: 1.12, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
        />
      </motion.div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(var(--gc-ov,3,11,34),0.94)_0%,rgba(var(--gc-ov,3,11,34),0.78)_30%,rgba(var(--gc-ov,3,11,34),0.2)_58%,transparent_75%)] max-lg:bg-[linear-gradient(180deg,rgba(var(--gc-ov,3,11,34),0.92)_0%,rgba(var(--gc-ov,3,11,34),0.8)_55%,rgba(var(--gc-ov,3,11,34),0.55)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-(color:--gc-night)/80 to-transparent" />

      <KarnatakaGlow reduce={reduce} />

      <motion.div
        className="relative mx-auto flex h-full max-w-[1320px] flex-col px-5 pt-[112px] lg:justify-center lg:px-8 lg:pt-6 lg:pb-16"
        style={reduce ? undefined : { y: textY, opacity: textOpacity }}
      >
        <motion.nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-white/65" {...enter(0.2)}>
          <Link to="/global-connect" className="transition hover:text-white">
            {t("Home")}
          </Link>
          <CaretRight size={12} />
          <span className="text-white">{t("Invest")}</span>
        </motion.nav>

        <motion.h1
          className="mt-4 font-display text-[42px] leading-[1.04] font-bold tracking-[-0.035em] sm:text-[58px] lg:text-[70px]"
          {...enter(0.35)}
        >
          {t("Invest in")}
          <br />
          <span className="inline-block bg-gradient-to-r from-(color:--gc-accent) via-(color:--gc-accent-2) to-(color:--gc-gold) bg-clip-text pr-2 font-serif text-[1.18em] leading-[0.95] font-normal tracking-[-0.01em] text-transparent italic">
            {t("Karnataka")}
          </span>
        </motion.h1>

        <motion.p className="mt-5 max-w-[470px] text-[17px] leading-relaxed text-white/85 sm:text-[18.5px]" {...enter(0.5)}>
          {t("A simple, guided journey from exploring an opportunity to establishing your investment in Karnataka.")}
        </motion.p>

        <motion.div className="mt-8 flex flex-wrap gap-3" {...enter(0.65)}>
          <a
            href="#how"
            className="group inline-flex items-center gap-3 rounded-full bg-white py-3 pr-4 pl-6 text-[14.5px] font-semibold text-(color:--gc-ink) shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition hover:bg-[#eaf5ff]"
          >
            {t("Start Your Investment Journey")}
            <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#opportunities"
            className="inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-[14.5px] font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            {t("Explore Opportunities")}
          </a>
        </motion.div>

        <motion.ul className="mt-10 grid max-w-[560px] grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 sm:gap-x-4" {...enter(0.8)}>
          {CHIPS.map(({ label, icon: Icon }) => (
            <li key={label} className="flex items-center gap-2 text-[12.5px] leading-tight text-white/80">
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-(color:--gc-gold)/40 text-(color:--gc-gold)">
                <Icon size={16} weight="duotone" />
              </span>
              {t(label)}
            </li>
          ))}
        </motion.ul>

        <motion.p className="mt-8 max-w-[520px] text-[12px] leading-relaxed text-white/50" {...enter(0.95)}>
          {t(
            "Concept preview. The proposed platform can provide global investors with one clear entry point, from first interest to implementation.",
          )}
        </motion.p>
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

function KarnatakaGlow({ reduce }: { reduce: boolean }) {
  const t = useT();
  return (
    <div className="pointer-events-none absolute top-[13%] left-[44%] hidden h-[40%] aspect-[300/473] opacity-90 xl:block">
      <motion.div
        className="absolute inset-[-20%] rounded-full bg-[radial-gradient(circle,rgba(255,207,107,0.22),transparent_65%)]"
        initial={reduce ? false : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.6 }}
      />
      <svg viewBox={KARNATAKA_VIEWBOX} className="relative h-full w-full overflow-visible" aria-hidden>
        <defs>
          <filter id="ka-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g filter="url(#ka-glow)">
          {KARNATAKA_DISTRICTS.map((d) => (
            <motion.path
              key={d.name}
              d={d.d}
              fill="rgba(var(--gc-ov,6,21,54),0.28)"
              stroke="#ffd77a"
              strokeWidth={1}
              strokeOpacity={0.8}
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.6, delay: 0.7, ease: "easeInOut" }}
            />
          ))}
        </g>
      </svg>
      {FLOATING.map((f, i) => (
        <motion.span
          key={f.label}
          className={`absolute rounded-full border border-white/20 bg-(color:--gc-navy)/55 px-3 py-1.5 text-[11.5px] font-medium whitespace-nowrap text-white/90 backdrop-blur ${f.className}`}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 + i * 0.2, ease: EASE }}
        >
          <span className="mr-1.5 inline-block size-1.5 rounded-full bg-(color:--gc-gold) align-middle" />
          {t(f.label)}
        </motion.span>
      ))}
    </div>
  );
}
