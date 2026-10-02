import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ChartBar, GraduationCap, Handshake, Lightbulb, PlayCircle, UsersThree, type Icon } from "@phosphor-icons/react";
import vidhana from "@/assets/horizon/vidhana-glow.jpg";
import { KARNATAKA_DISTRICTS } from "@/lib/karnatakaMap";
import type { PathwayId } from "@/lib/pathways";
import { cn } from "@/lib/utils";
import { EASE, useCycle } from "@/components/heritage/motion";
import { HZ_COLOR } from "./palette";
import { DottedWorld, SaffronButton } from "./parts";

const VIEW = { w: 800, h: 620 };
const MAP = { x: 220, y: 24, s: 1.2 };
const HUB = { x: 404, y: 300 };

const NODES: { id: PathwayId; label: [string, string]; icon: Icon; x: number; y: number }[] = [
  { id: "invest", label: ["Global", "Investment"], icon: ChartBar, x: 96, y: 78 },
  { id: "connect", label: ["Global", "Kannadigas"], icon: UsersThree, x: 52, y: 288 },
  { id: "talent", label: ["Global", "Talent"], icon: GraduationCap, x: 112, y: 486 },
  { id: "partner", label: ["Global", "Partnerships"], icon: Handshake, x: 664, y: 236 },
  { id: "discover", label: ["Global", "Opportunities"], icon: Lightbulb, x: 652, y: 452 },
];

function arc(x: number, y: number) {
  const mx = (HUB.x + x) / 2;
  const my = Math.min(HUB.y, y) - 60;
  return `M${HUB.x},${HUB.y} Q${mx},${my} ${x},${y}`;
}

export function HorizonHero({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mapY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const worldY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const active = useCycle(NODES.length, 1700, !reduce);

  const enter = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 22 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-gradient-to-b from-[#f3f7ff] to-white pt-[76px]">
      <motion.div aria-hidden className="absolute top-16 right-[-6%] -z-10 w-[72%]" style={reduce ? undefined : { y: worldY }}>
        <DottedWorld className="w-full" />
      </motion.div>
      <div aria-hidden className="absolute top-[42%] left-[64%] -z-10 size-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(47,111,224,0.16),transparent_62%)]" />

      <div className="mx-auto grid max-w-[1320px] items-center gap-6 px-5 pt-10 pb-14 lg:grid-cols-[minmax(0,480px)_1fr] lg:px-8 lg:pt-6 lg:pb-10">
        <motion.div className="relative z-10" style={reduce ? undefined : { y: textY }}>
          <motion.p className="text-[11.5px] font-extrabold tracking-[0.2em] text-(color:--gc-gold-4) uppercase" {...enter(0)}>
            A global gateway for a brighter tomorrow
          </motion.p>
          <h1 className="mt-4 font-display text-[42px] leading-[1.08] font-extrabold text-(color:--gc-ink) sm:text-[54px] xl:text-[60px]">
            <motion.span className="block" {...enter(0.1)}>
              Karnataka
            </motion.span>
            <motion.span className="block" {...enter(0.2)}>
              Opens to a
            </motion.span>
            <motion.span className="block" {...enter(0.3)}>
              World of{" "}
              <span className="relative inline-block bg-gradient-to-r from-[#f5ae1b] to-[#ef7e0e] bg-clip-text text-transparent">
                Possibilities
                <svg viewBox="0 0 300 18" preserveAspectRatio="none" aria-hidden className="absolute -bottom-2 left-0 h-3 w-full overflow-visible">
                  <motion.path
                    d="M4 12 C 80 2, 200 2, 296 10"
                    fill="none"
                    stroke="#f5ae1b"
                    strokeWidth={4}
                    strokeLinecap="round"
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, delay: 1, ease: EASE }}
                  />
                </svg>
              </span>
            </motion.span>
          </h1>
          <motion.p className="mt-6 max-w-[440px] text-[16.5px] leading-relaxed text-(color:--gc-body)" {...enter(0.45)}>
            Connecting investment, talent, partnerships, Kannadigas and opportunities for a stronger, more prosperous Karnataka.
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" {...enter(0.58)}>
            <SaffronButton href="#pathways" reduce={reduce}>
              Explore Opportunities
            </SaffronButton>
            <a
              href="#numbers"
              className="group inline-flex items-center gap-2 rounded-full border border-(color:--gc-ink)/30 bg-white px-6 py-3 text-[14.5px] font-semibold text-(color:--gc-ink) transition hover:border-(color:--gc-primary) hover:text-(color:--gc-primary)"
            >
              Learn More
              <PlayCircle size={18} weight="fill" className="text-(color:--gc-primary) transition-transform group-hover:scale-110" />
            </a>
          </motion.div>
        </motion.div>

        <motion.div className="relative -mx-5 sm:mx-0" style={reduce ? undefined : { y: mapY }}>
          <div className="relative aspect-[800/620] w-full">
            <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="absolute inset-0 size-full" role="img" aria-label="Map of Karnataka linked to five global pathways">
              <defs>
                <clipPath id="hz-ka" clipPathUnits="userSpaceOnUse">
                  {KARNATAKA_DISTRICTS.map((d) => (
                    <path key={d.name} d={d.d} />
                  ))}
                </clipPath>
                <linearGradient id="hz-ka-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#3b7cf0" />
                  <stop offset="0.55" stopColor="#1a4fb5" />
                  <stop offset="1" stopColor="#0c2459" />
                </linearGradient>
                <linearGradient id="hz-fade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#fff" stopOpacity="0" />
                  <stop offset="0.35" stopColor="#fff" stopOpacity="1" />
                </linearGradient>
                <mask id="hz-vidhana-mask" maskContentUnits="userSpaceOnUse">
                  <rect x="-10" y="200" width="320" height="290" fill="url(#hz-fade)" />
                </mask>
                <radialGradient id="hz-glow">
                  <stop offset="0" stopColor="#ffe08a" stopOpacity="0.95" />
                  <stop offset="0.4" stopColor="#ffc83d" stopOpacity="0.45" />
                  <stop offset="1" stopColor="#ffc83d" stopOpacity="0" />
                </radialGradient>
              </defs>

              {NODES.map((n, i) => {
                const d = arc(n.x, n.y);
                const on = i === active;
                return (
                  <g key={n.id}>
                    <motion.path
                      d={d}
                      fill="none"
                      stroke={on ? HZ_COLOR[n.id].c : "#f5ae1b"}
                      strokeWidth={on ? 2.4 : 1.6}
                      strokeDasharray="6 6"
                      strokeLinecap="round"
                      className={cn("transition-[stroke,stroke-width] duration-500", !reduce && "animate-[dash-flow_1.2s_linear_infinite]")}
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.9 + i * 0.12, ease: EASE }}
                    />
                    {!reduce ? (
                      <circle r={4.5} fill="#f5ae1b">
                        <animateMotion dur={`${2.4 + i * 0.3}s`} begin={`${1.3 + i * 0.3}s`} repeatCount="indefinite" path={d} />
                      </circle>
                    ) : null}
                  </g>
                );
              })}

              <motion.g
                initial={reduce ? false : { opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2, ease: EASE }}
                style={{ transformOrigin: "400px 310px" }}
              >
                <motion.g animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
                  <g transform={`translate(${MAP.x},${MAP.y}) scale(${MAP.s})`}>
                    <g filter="drop-shadow(0 22px 30px rgba(12,36,89,0.35))">
                      {KARNATAKA_DISTRICTS.map((d) => (
                        <path key={d.name} d={d.d} fill="url(#hz-ka-fill)" stroke="#1a4fb5" strokeWidth={4} strokeLinejoin="round" />
                      ))}
                    </g>
                    <g clipPath="url(#hz-ka)">
                      <rect x="-10" y="-10" width="320" height="500" fill="url(#hz-ka-fill)" />
                      <image href={vidhana} x={10} y={248} width={250} height={250} mask="url(#hz-vidhana-mask)" style={{ mixBlendMode: "screen" }} />
                      {KARNATAKA_DISTRICTS.map((d) => (
                        <path key={d.name} d={d.d} fill="none" stroke="#9cc0ff" strokeOpacity={0.35} strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
                      ))}
                    </g>
                  </g>
                </motion.g>
              </motion.g>

              <motion.circle
                cx={HUB.x}
                cy={HUB.y}
                r={58}
                fill="url(#hz-glow)"
                animate={reduce ? undefined : { scale: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: `${HUB.x}px ${HUB.y}px` }}
              />
              <circle cx={HUB.x} cy={HUB.y} r={6} fill="#fff" />
              {!reduce ? (
                <motion.circle
                  cx={HUB.x}
                  cy={HUB.y}
                  fill="none"
                  stroke="#ffe08a"
                  strokeWidth={1.5}
                  initial={{ r: 8, opacity: 0.9 }}
                  animate={{ r: [8, 40], opacity: [0.9, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                />
              ) : null}
            </svg>

            <motion.div
              className="absolute top-[3%] right-[2%] hidden text-right md:block"
              initial={reduce ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 1, ease: EASE }}
            >
              <p className="text-[11px] leading-snug font-extrabold tracking-[0.18em] text-(color:--gc-ink)">
                KARNATAKA
                <br />
                IN A CONNECTED
                <br />
                WORLD
              </p>
              <span aria-hidden className="mt-2 ml-auto block h-[2px] w-10 bg-(color:--gc-gold-3)" />
            </motion.div>

            {NODES.map(({ id, label, icon: NodeIcon, x, y }, i) => {
              const on = i === active;
              const { c } = HZ_COLOR[id];
              return (
                <motion.div
                  key={id}
                  className="absolute hidden -translate-x-[22px] -translate-y-1/2 items-center gap-2.5 md:flex"
                  style={{ left: `${(x / VIEW.w) * 100}%`, top: `${(y / VIEW.h) * 100}%` }}
                  initial={reduce ? false : { opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 1.2 + i * 0.12, ease: EASE }}
                >
                  <span className="relative">
                    {on && !reduce ? (
                      <motion.span
                        key={`ring-${active}`}
                        aria-hidden
                        className="absolute inset-0 rounded-full"
                        style={{ boxShadow: `0 0 0 2px ${c}` }}
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 1.7, opacity: 0 }}
                        transition={{ duration: 1.4, ease: "easeOut" }}
                      />
                    ) : null}
                    <span
                      className={cn(
                        "grid size-11 place-items-center rounded-full text-white shadow-[0_10px_22px_rgba(12,36,89,0.22)] ring-4 ring-white transition-transform duration-500",
                        on && "scale-115",
                      )}
                      style={{ background: c }}
                    >
                      <NodeIcon size={21} weight="fill" />
                    </span>
                  </span>
                  <span
                    className={cn(
                      "rounded-lg px-1.5 py-0.5 text-[12.5px] leading-tight font-bold text-(color:--gc-ink) transition-colors duration-500",
                      on && "bg-white shadow-[0_6px_16px_rgba(12,36,89,0.12)]",
                    )}
                  >
                    {label[0]}
                    <br />
                    <span style={on ? { color: c } : undefined}>{label[1]}</span>
                  </span>
                </motion.div>
              );
            })}
          </div>

          <ul className="mt-2 flex flex-wrap justify-center gap-2 px-5 md:hidden">
            {NODES.map(({ id, label, icon: NodeIcon }) => (
              <li key={id} className="flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[12px] font-semibold text-(color:--gc-ink) shadow-sm ring-1 ring-(color:--gc-line)">
                <span className="grid size-6 place-items-center rounded-full text-white" style={{ background: HZ_COLOR[id].c }}>
                  <NodeIcon size={13} weight="fill" />
                </span>
                {label.join(" ")}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
