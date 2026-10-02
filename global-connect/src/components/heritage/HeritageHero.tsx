import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import collage from "@/assets/heritage/map-collage.jpg";
import skyline from "@/assets/heritage/hero-skyline.jpg";
import { KARNATAKA_DISTRICTS } from "@/lib/karnatakaMap";
import { WORLD_LAND_D } from "@/lib/worldPath";
import { EASE } from "./motion";

const MAP = { x: 220, y: 24, s: 1.2 };
const ORIGIN = { x: 400, y: 300 };

const REGIONS = [
  { label: "NORTH AMERICA", x: 40, y: 118, anchor: "start" },
  { label: "EUROPE", x: 650, y: 84, anchor: "start" },
  { label: "MIDDLE EAST", x: 640, y: 262, anchor: "start" },
  { label: "AFRICA", x: 60, y: 440, anchor: "start" },
  { label: "AUSTRALIA", x: 650, y: 498, anchor: "start" },
] as const;

const LADDER = ["People", "Ideas", "Investment", "Talent", "Partnerships", "Opportunities"];

function arc(x: number, y: number) {
  const mx = (ORIGIN.x + x) / 2;
  const my = Math.min(ORIGIN.y, y) - 70;
  return `M${ORIGIN.x},${ORIGIN.y} Q${mx},${my} ${x},${y}`;
}

export function HeritageHero({ reduce }: { reduce: boolean }) {
  const words = ["Karnataka,", "Connected", "to"];

  return (
    <section className="relative isolate overflow-hidden bg-(color:--gc-surface) pt-[76px]">
      <img
        src={skyline}
        alt=""
        aria-hidden
        className="absolute inset-y-0 right-0 -z-10 h-full w-[70%] object-cover object-right opacity-60 [mask-image:linear-gradient(90deg,transparent,black_45%)]"
      />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-(color:--gc-surface) to-transparent" />

      <div className="mx-auto grid max-w-[1320px] items-center gap-6 px-5 pt-10 pb-12 lg:grid-cols-[minmax(0,470px)_1fr] lg:px-8 lg:pt-6 lg:pb-8 xl:grid-cols-[minmax(0,470px)_1fr_150px]">
        <div className="relative z-10">
          <h1 className="font-display text-[44px] leading-[1.06] font-bold text-(color:--gc-ink) sm:text-[58px] xl:text-[64px]">
            {words.map((w, i) => (
              <motion.span
                key={w}
                className="inline-block pr-[0.22em]"
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.1, ease: EASE }}
              >
                {w}
              </motion.span>
            ))}
            <motion.span
              className="inline-block text-(color:--gc-gold-4)"
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
            >
              the World
            </motion.span>
          </h1>
          <motion.p
            className="mt-5 max-w-[430px] text-[17px] leading-relaxed text-(color:--gc-body)"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
          >
            A global gateway for investment, talent, partnerships, Kannadigas and opportunities.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.72, ease: EASE }}
          >
            <a
              href="#pathways"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-(color:--gc-button-a) to-(color:--gc-button-b) px-6 py-3 text-[14.5px] font-semibold text-(color:--gc-night) shadow-[0_10px_24px_rgba(201,154,46,0.35)] transition hover:brightness-105"
            >
              Explore Karnataka
            </a>
            <a
              href="#goals"
              className="group inline-flex items-center gap-2 rounded-full border border-(color:--gc-ink)/40 bg-white/60 px-6 py-3 text-[14.5px] font-semibold text-(color:--gc-ink) transition hover:border-(color:--gc-ink) hover:bg-white"
            >
              Start Your Journey
              <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
            </a>
          </motion.div>
        </div>

        <div className="relative -mx-5 sm:mx-0">
          <svg viewBox="0 0 800 620" className="h-auto w-full" role="img" aria-label="Map of Karnataka filled with its landmarks, linked to regions of the world">
            <defs>
              <clipPath id="hh-karnataka" clipPathUnits="userSpaceOnUse">
                {KARNATAKA_DISTRICTS.map((d) => (
                  <path key={d.name} d={d.d} />
                ))}
              </clipPath>
              <linearGradient id="hh-arc" x1="0" x2="1">
                <stop offset="0" stopColor="var(--gc-gold-3)" stopOpacity="0.9" />
                <stop offset="1" stopColor="var(--gc-gold-3)" stopOpacity="0.35" />
              </linearGradient>
            </defs>

            <g transform="translate(0,130) scale(0.8)" opacity="0.5">
              <path d={WORLD_LAND_D} fill="#e6dec9" />
            </g>

            {REGIONS.map((r, i) => {
              const tx = r.x + 4;
              const ty = r.y + 10;
              return (
                <g key={r.label}>
                  <motion.path
                    d={arc(tx, ty)}
                    fill="none"
                    stroke="url(#hh-arc)"
                    strokeWidth={1.6}
                    strokeDasharray="5 5"
                    className={reduce ? undefined : "animate-[dash-flow_1.4s_linear_infinite]"}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.9, delay: 0.9 + i * 0.12, ease: EASE }}
                  />
                  <motion.g
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.3 + i * 0.12, ease: EASE }}
                  >
                    <circle cx={tx} cy={ty} r={4.5} fill="var(--gc-gold-3)" />
                    <circle cx={tx} cy={ty} r={9} fill="none" stroke="var(--gc-gold-3)" strokeOpacity={0.4} />
                    <text
                      x={r.x}
                      y={r.y}
                      textAnchor={r.anchor}
                      className="fill-(color:--gc-ink-2) text-[13px] font-bold tracking-[0.14em]"
                    >
                      {r.label}
                    </text>
                  </motion.g>
                </g>
              );
            })}

            <motion.g
              initial={reduce ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.25, ease: EASE }}
              style={{ transformOrigin: "400px 310px" }}
            >
              <g transform={`translate(${MAP.x},${MAP.y}) scale(${MAP.s})`}>
                <g filter="drop-shadow(0 18px 24px rgba(12,58,42,0.28))">
                  {KARNATAKA_DISTRICTS.map((d) => (
                    <path key={d.name} d={d.d} fill="var(--gc-gold-3)" stroke="var(--gc-gold-3)" strokeWidth={5} strokeLinejoin="round" />
                  ))}
                </g>
                <g clipPath="url(#hh-karnataka)">
                  <motion.image
                    href={collage}
                    x={-10}
                    y={-6}
                    width={320}
                    height={485}
                    preserveAspectRatio="xMidYMid slice"
                    animate={reduce ? undefined : { scale: [1, 1.06, 1] }}
                    transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                    style={{ transformOrigin: "150px 236px" }}
                  />
                  {KARNATAKA_DISTRICTS.map((d) => (
                    <path key={d.name} d={d.d} fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
                  ))}
                </g>
              </g>
            </motion.g>
          </svg>
        </div>

        <ul className="hidden flex-col gap-4 border-l border-(color:--gc-gold-3)/50 pl-5 xl:flex">
          {LADDER.map((l, i) => (
            <motion.li
              key={l}
              className="relative text-[12.5px] font-bold tracking-[0.16em] text-(color:--gc-ink) uppercase"
              initial={reduce ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.1 + i * 0.1, ease: EASE }}
            >
              <span aria-hidden className="absolute top-1/2 -left-[24px] size-[7px] -translate-y-1/2 rounded-full bg-(color:--gc-gold-3)" />
              {l}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
