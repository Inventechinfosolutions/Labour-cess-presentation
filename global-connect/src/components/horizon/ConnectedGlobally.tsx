import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Bank, Buildings, Compass, GraduationCap, Mosque, Plant, type Icon } from "@phosphor-icons/react";
import { KARNATAKA_DISTRICTS } from "@/lib/karnatakaMap";
import { cn } from "@/lib/utils";
import { EASE, rise, useCycle } from "@/components/heritage/motion";
import { HZ_COLOR, HZ_TEAL } from "./palette";
import { DottedWorld, SaffronButton } from "./parts";

const KA = { x: 678, y: 222 };

const REGIONS: { name: string; tags: string[]; icon: Icon; color: string; x: number; y: number }[] = [
  { name: "North America", tags: ["Investment", "Technology", "Talent"], icon: Buildings, color: HZ_COLOR.invest.c, x: 205, y: 120 },
  { name: "Europe", tags: ["Research", "Partnerships", "Innovation"], icon: Bank, color: HZ_COLOR.connect.c, x: 480, y: 70 },
  { name: "Asia", tags: ["Trade", "Technology", "Opportunities"], icon: Compass, color: "#e23b4a", x: 880, y: 120 },
  { name: "Africa", tags: ["Growth", "Trade", "Collaboration"], icon: Plant, color: HZ_COLOR.talent.c, x: 400, y: 330 },
  { name: "Middle East", tags: ["Investment", "Infrastructure", "Partnerships"], icon: Mosque, color: HZ_COLOR.partner.c, x: 600, y: 400 },
  { name: "Australia", tags: ["Education", "Research", "Innovation"], icon: GraduationCap, color: HZ_TEAL.c, x: 880, y: 372 },
];

function arc(x: number, y: number) {
  const mx = (KA.x + x) / 2;
  const my = Math.min(KA.y, y) - Math.abs(KA.x - x) * 0.25 - 18;
  return `M${KA.x},${KA.y} Q${mx},${my} ${x},${y}`;
}

export function ConnectedGlobally({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const active = useCycle(REGIONS.length, 1800, !reduce && inView);

  return (
    <section className="relative overflow-hidden bg-white px-5 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-[320px_1fr]">
        <div>
          <motion.h2 className="font-display text-[30px] leading-[1.12] font-bold text-(color:--gc-ink) sm:text-[36px]" {...rise(reduce)}>
            Connected Globally. Rooted in <span className="text-(color:--gc-gold-4)">Karnataka.</span>
          </motion.h2>
          <motion.p className="mt-4 max-w-[310px] text-[15px] leading-relaxed text-(color:--gc-body)" {...rise(reduce, 0.12)}>
            From global centres of innovation to emerging markets, Karnataka is building meaningful connections around the world.
          </motion.p>
          <motion.div className="mt-7" {...rise(reduce, 0.22)}>
            <SaffronButton href="/global-connect/connect" reduce={reduce}>
              Explore Global Connections
            </SaffronButton>
          </motion.div>
        </div>

        <div ref={ref} className="relative aspect-[1000/470] w-full">
          <DottedWorld className="absolute inset-0 size-full" />
          <svg viewBox="0 0 1000 470" className="absolute inset-0 size-full" aria-hidden>
            {REGIONS.map((r, i) => {
              const d = arc(r.x, r.y);
              const on = i === active;
              return (
                <g key={r.name}>
                  <motion.path
                    d={d}
                    fill="none"
                    stroke={on ? r.color : "#f5ae1b"}
                    strokeWidth={on ? 2.6 : 1.8}
                    strokeLinecap="round"
                    className="transition-[stroke,stroke-width] duration-500"
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={inView || reduce ? { pathLength: 1 } : { pathLength: 0 }}
                    transition={{ duration: 1.1, delay: 0.3 + i * 0.12, ease: EASE }}
                  />
                  {!reduce && inView ? (
                    <circle r={4} fill={r.color}>
                      <animateMotion dur={`${2.8 + i * 0.35}s`} begin={`${1.5 + i * 0.2}s`} repeatCount="indefinite" path={d} />
                    </circle>
                  ) : null}
                </g>
              );
            })}
            <g transform={`translate(${KA.x - 21},${KA.y - 33}) scale(0.14)`}>
              {KARNATAKA_DISTRICTS.map((d) => (
                <path key={d.name} d={d.d} fill="#f5ae1b" stroke="#f5ae1b" strokeWidth={6} />
              ))}
            </g>
            {!reduce ? (
              <motion.circle
                cx={KA.x}
                cy={KA.y}
                fill="none"
                stroke="#f5ae1b"
                strokeWidth={2}
                initial={{ r: 18, opacity: 0.8 }}
                animate={{ r: [18, 48], opacity: [0.8, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
              />
            ) : null}
          </svg>

          {REGIONS.map(({ name, tags, icon: RegionIcon, color, x, y }, i) => {
            const on = i === active;
            return (
              <motion.div
                key={name}
                className="absolute hidden -translate-x-1/2 -translate-y-1/2 md:block"
                style={{ left: `${x / 10}%`, top: `${(y / 470) * 100}%` }}
                initial={reduce ? false : { opacity: 0, scale: 0.75 }}
                animate={inView || reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.75 }}
                transition={{ duration: 0.6, delay: 0.9 + i * 0.12, ease: EASE }}
              >
                <motion.div
                  className={cn(
                    "flex w-[148px] items-start gap-2 rounded-xl border bg-white p-2.5 transition-[box-shadow,border-color] duration-500 xl:w-[160px]",
                    on ? "shadow-[0_16px_34px_rgba(13,34,83,0.18)]" : "border-(color:--gc-line) shadow-[0_8px_20px_rgba(13,34,83,0.08)]",
                  )}
                  style={{ borderColor: on ? color : undefined }}
                  animate={reduce ? undefined : { y: on ? -6 : [0, -3, 0] }}
                  transition={on ? { duration: 0.4 } : { duration: 3.4 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: color }}>
                    <RegionIcon size={17} weight="fill" />
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block text-[12.5px] font-bold text-(color:--gc-ink)">{name}</span>
                    {tags.map((t) => (
                      <span key={t} className="block text-[10.5px] text-(color:--gc-body)">
                        {t}
                      </span>
                    ))}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <ul className="grid grid-cols-2 gap-3 md:hidden">
          {REGIONS.map(({ name, tags, icon: RegionIcon, color }) => (
            <li key={name} className="flex items-start gap-2 rounded-xl border border-(color:--gc-line) bg-white p-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: color }}>
                <RegionIcon size={16} weight="fill" />
              </span>
              <span className="leading-tight">
                <span className="block text-[13px] font-bold text-(color:--gc-ink)">{name}</span>
                <span className="block text-[11px] text-(color:--gc-body)">{tags.join(" · ")}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
