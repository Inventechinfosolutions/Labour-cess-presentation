import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import africa from "@/assets/heritage/region-africa.jpg";
import asia from "@/assets/heritage/region-asia.jpg";
import australia from "@/assets/heritage/region-australia.jpg";
import europe from "@/assets/heritage/region-europe.jpg";
import mideast from "@/assets/heritage/region-mideast.jpg";
import namerica from "@/assets/heritage/region-namerica.jpg";
import { KARNATAKA_DISTRICTS } from "@/lib/karnatakaMap";
import { WORLD_LAND_D } from "@/lib/worldPath";
import { cn } from "@/lib/utils";
import { HeritageTitle } from "./parts";
import { EASE, rise } from "./motion";

const KA = { x: 678, y: 222 };

const REGIONS = [
  { name: "North America", x: 215, y: 130, tags: ["Investment", "Technology", "Talent"], img: namerica, side: "left" },
  { name: "Europe", x: 470, y: 78, tags: ["Research", "Partnerships", "Innovation"], img: europe, side: "right" },
  { name: "Asia", x: 845, y: 112, tags: ["Trade", "Technology", "Opportunities"], img: asia, side: "right" },
  { name: "Africa", x: 395, y: 318, tags: ["Growth", "Trade", "Opportunities"], img: africa, side: "left" },
  { name: "Middle East", x: 575, y: 390, tags: ["Investment", "Infrastructure", "Partnerships"], img: mideast, side: "left" },
  { name: "Australia", x: 862, y: 372, tags: ["Education", "Research", "Collaboration"], img: australia, side: "right" },
] as const;

function arc(x: number, y: number) {
  const mx = (KA.x + x) / 2;
  const my = Math.min(KA.y, y) - Math.abs(KA.x - x) * 0.22 - 20;
  return `M${KA.x},${KA.y} Q${mx},${my} ${x},${y}`;
}

export function GlobalReach({ reduce }: { reduce: boolean }) {
  return (
    <section className="relative overflow-hidden bg-(color:--gc-surface) px-5 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-[300px_1fr]">
        <div>
          <HeritageTitle reduce={reduce} align="left">
            A Truly Global Karnataka
          </HeritageTitle>
          <motion.p className="mt-4 max-w-[300px] text-[15.5px] leading-relaxed text-(color:--gc-body)" {...rise(reduce, 0.15)}>
            From established global centres to emerging markets, Karnataka is building connections across the world.
          </motion.p>
          <motion.div {...rise(reduce, 0.25)}>
            <Link
              to="/global-connect/connect"
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-(color:--gc-button-a) to-(color:--gc-button-b) px-6 py-3 text-[14px] font-semibold text-(color:--gc-night) shadow-[0_10px_24px_rgba(201,154,46,0.3)] transition hover:brightness-105"
            >
              Explore Global Connections
              <ArrowRight size={15} weight="bold" className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        <div className="relative aspect-[1000/470] w-full">
          <svg viewBox="0 0 1000 470" className="absolute inset-0 size-full" aria-hidden>
            <path d={WORLD_LAND_D} fill="#e4dcc6" opacity={0.75} />
            {REGIONS.map((r, i) => {
              const d = arc(r.x, r.y);
              return (
                <g key={r.name}>
                  <motion.path
                    d={d}
                    fill="none"
                    stroke="var(--gc-gold-3)"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    initial={reduce ? false : { pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 1.1, delay: 0.3 + i * 0.12, ease: EASE }}
                  />
                  {!reduce ? (
                    <circle r={3.5} fill="var(--gc-gold-4)">
                      <animateMotion dur={`${3 + i * 0.4}s`} begin={`${1.6 + i * 0.2}s`} repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" />
                    </circle>
                  ) : null}
                </g>
              );
            })}
            <g transform={`translate(${KA.x - 21},${KA.y - 33}) scale(0.14)`}>
              {KARNATAKA_DISTRICTS.map((d) => (
                <path key={d.name} d={d.d} fill="var(--gc-gold-3)" stroke="var(--gc-gold-3)" strokeWidth={6} />
              ))}
            </g>
            {!reduce ? (
              <motion.circle
                cx={KA.x}
                cy={KA.y}
                r={18}
                fill="none"
                stroke="var(--gc-gold-3)"
                animate={{ r: [18, 46], opacity: [0.7, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
              />
            ) : null}
            <text x={KA.x} y={KA.y + 52} textAnchor="middle" className="fill-(color:--gc-ink) text-[14px] font-bold tracking-[0.18em]">
              KARNATAKA
            </text>
          </svg>

          {REGIONS.map((r, i) => (
            <motion.div
              key={r.name}
              className={cn("absolute hidden -translate-y-1/2 items-center gap-3 md:flex", r.side === "left" && "flex-row-reverse text-right")}
              style={
                r.side === "left"
                  ? { right: `calc(${100 - r.x / 10}% - 34px)`, top: `${r.y / 4.7}%` }
                  : { left: `calc(${r.x / 10}% - 34px)`, top: `${r.y / 4.7}%` }
              }
              initial={reduce ? false : { opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: 0.9 + i * 0.12, ease: EASE }}
            >
              <img
                src={r.img}
                alt=""
                loading="lazy"
                className="size-[68px] shrink-0 rounded-full object-cover shadow-[0_10px_24px_rgba(12,58,42,0.22)] ring-[3px] ring-white xl:size-[76px]"
              />
              <div className="leading-tight">
                <p className="font-display text-[14.5px] font-bold text-(color:--gc-ink)">{r.name}</p>
                {r.tags.map((tag) => (
                  <p key={tag} className="text-[11.5px] text-(color:--gc-body)">
                    {tag}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:hidden">
          {REGIONS.map((r) => (
            <li key={r.name} className="flex items-center gap-3">
              <img src={r.img} alt="" loading="lazy" className="size-12 rounded-full object-cover ring-2 ring-white" />
              <span className="leading-tight">
                <span className="block font-display text-[14px] font-bold text-(color:--gc-ink)">{r.name}</span>
                <span className="block text-[11.5px] text-(color:--gc-body)">{r.tags.join(" · ")}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
