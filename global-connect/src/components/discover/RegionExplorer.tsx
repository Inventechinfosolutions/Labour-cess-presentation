import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";
import { KARNATAKA_DISTRICTS, KARNATAKA_VIEWBOX } from "@/lib/karnatakaMap";
import { cn } from "@/lib/utils";
import { OPPORTUNITIES, REGIONS } from "./data";

const LABEL_W = 112;

export function RegionExplorer({ reduce, onView }: { reduce: boolean; onView: (region: string) => void }) {
  const [active, setActive] = useState("Bengaluru");
  const region = REGIONS.find((r) => r.name === active) ?? REGIONS[0];
  const count = OPPORTUNITIES.filter((o) => o.location === region.name).length;

  return (
    <div>
      <SectionHeading
        eyebrow="Regions"
        title="Opportunities Across Karnataka"
        sub="Explore opportunities by region and discover what each part of Karnataka offers."
        reduce={reduce}
        align="left"
      />

      <div className="mt-8 grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
        <motion.div
          className="relative mx-auto w-full max-w-[420px]"
          style={{ aspectRatio: `${300 + LABEL_W * 2} / 473` }}
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <svg viewBox={`${-LABEL_W} 0 ${300 + LABEL_W * 2} 473`} className="absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <linearGradient id="re-ka" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3b82f6" />
                <stop offset="1" stopColor="#1e40af" />
              </linearGradient>
            </defs>
            <motion.g
              variants={{ hidden: { opacity: 0, scale: 0.92 }, show: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: EASE } } }}
              style={{ transformOrigin: "150px 236px" }}
            >
              <svg viewBox={KARNATAKA_VIEWBOX} width={300} height={473} overflow="visible">
                {KARNATAKA_DISTRICTS.map((d) => (
                  <path key={d.name} d={d.d} fill="url(#re-ka)" stroke="#93c5fd" strokeOpacity={0.5} strokeWidth={0.8} />
                ))}
              </svg>
            </motion.g>
            {REGIONS.map((r, i) => {
              const on = r.name === active;
              const [x, y] = r.at;
              const lx = r.labelSide === "left" ? -6 : 306;
              const anchor = r.labelSide === "left" ? "end" : "start";
              const elbow = r.labelSide === "left" ? Math.min(x - 14, 14) : Math.max(x + 14, 286);
              return (
                <motion.g
                  key={r.name}
                  role="button"
                  tabIndex={0}
                  aria-pressed={on}
                  aria-label={`${r.name}: ${r.tagline}`}
                  className="cursor-pointer outline-none"
                  onClick={() => setActive(r.name)}
                  onMouseEnter={() => setActive(r.name)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setActive(r.name)}
                  variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 0.4 + i * 0.1 } } }}
                >
                  <path
                    d={`M${x} ${y} L${elbow} ${y - 18} L${lx} ${y - 18}`}
                    fill="none"
                    stroke={on ? "#f59e0b" : "#94a3b8"}
                    strokeWidth={on ? 1.6 : 1}
                    strokeDasharray={on ? undefined : "3 3"}
                  />
                  <text x={lx} y={y - 24} textAnchor={anchor} className="font-display" fontSize={12} fontWeight={700} fill={on ? "#b45309" : "#0b1f4a"}>
                    {r.name}
                  </text>
                  <text x={lx} y={y - 6} textAnchor={anchor} fontSize={8.5} fill="#4a5a78">
                    {r.strengths}
                  </text>
                  {on && !reduce ? (
                    <circle cx={x} cy={y} r={8} fill="none" stroke="#fbbf24" strokeWidth={2}>
                      <animate attributeName="r" values="8;22" dur="1.6s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.9;0" dur="1.6s" repeatCount="indefinite" />
                    </circle>
                  ) : null}
                  <circle cx={x} cy={y} r={on ? 9 : 6.5} fill={on ? "#fbbf24" : "#fde68a"} stroke="#fff" strokeWidth={2.5} style={{ transition: "r 0.25s" }} />
                </motion.g>
              );
            })}
          </svg>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.article
            key={region.name}
            className="overflow-hidden rounded-2xl bg-white shadow-[0_18px_44px_rgba(11,31,74,0.12)] ring-1 ring-(color:--gc-ink)/6"
            initial={reduce ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -14 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <img src={region.image} alt={region.name} className="aspect-[16/10] w-full object-cover" />
            <div className="p-4">
              <p className="font-display text-[19px] font-bold text-(color:--gc-ink)">{region.name}</p>
              <p className="text-[13px] text-(color:--gc-body)">{region.tagline}</p>
              <ul className="mt-3 space-y-1.5">
                {region.sectors.map((s, i) => (
                  <motion.li
                    key={s}
                    className="flex items-center gap-2 text-[13px] text-(color:--gc-ink-2)"
                    initial={reduce ? false : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                  >
                    <CheckCircle size={15} weight="fill" className="text-(color:--gc-primary)" />
                    {s}
                  </motion.li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onView(region.name)}
                className={cn(
                  "group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-(color:--gc-button-a) to-(color:--gc-button-b) py-2.5 text-[13.5px] font-semibold text-(color:--gc-ink) shadow-[0_8px_20px_rgba(240,180,41,0.35)] transition hover:-translate-y-0.5",
                )}
              >
                View {count ? `${count} ` : ""}Opportunities
                <ArrowRight size={15} weight="bold" className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}
