import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import {
  ArrowRight,
  Briefcase,
  Flask,
  HandsClapping,
  Heart,
  IdentificationBadge,
  Lightning,
  Sparkle,
  Star,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";

const DEMAND = [
  { label: "Artificial Intelligence", value: 85, color: "#1f6fe5" },
  { label: "Semiconductors", value: 75, color: "#16a05a" },
  { label: "Cybersecurity", value: 70, color: "#0e9c97" },
  { label: "Clean Energy", value: 60, color: "#e0a91f" },
  { label: "Advanced Manufacturing", value: 55, color: "#8a3fd6" },
  { label: "Healthcare", value: 50, color: "#e0335c" },
];

const PROFILE: { label: string; icon: Icon }[] = [
  { label: "Skills", icon: Lightning },
  { label: "Experience", icon: Star },
  { label: "Sector", icon: IdentificationBadge },
  { label: "Interests", icon: Heart },
];

const OPPORTUNITIES: { label: string; icon: Icon; color: string }[] = [
  { label: "Jobs", icon: Briefcase, color: "#1f6fe5" },
  { label: "Research", icon: Flask, color: "#0e9c97" },
  { label: "Mentoring", icon: UsersThree, color: "#8a3fd6" },
  { label: "Collaboration", icon: HandsClapping, color: "#e0335c" },
];

export function DemandMatch({ reduce }: { reduce: boolean }) {
  return (
    <section id="demand" className="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-(color:--gc-surface) to-white px-5 py-20 lg:px-8">
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(63,180,255,0.14),transparent_65%)]" />
      <div className="relative mx-auto grid max-w-[1320px] items-center gap-x-6 gap-y-8 lg:grid-cols-[1fr_auto_1fr]">
        <div className="self-end lg:col-start-1 lg:row-start-1">
          <SectionHeading eyebrow="Global demand" title="What Does the World Need?" sub="Understand emerging global talent demand." reduce={reduce} align="left" />
        </div>
        <div className="lg:col-start-1 lg:row-start-2">
          <DemandBars reduce={reduce} />
        </div>

        <div className="flex items-center justify-center gap-3 lg:col-start-2 lg:row-start-2">
          <FlowArrow reduce={reduce} />
          <Globe reduce={reduce} />
          <FlowArrow reduce={reduce} delay={0.6} />
        </div>

        <div className="self-end max-lg:mt-6 lg:col-start-3 lg:row-start-1">
          <SectionHeading eyebrow="Talent match" title="Find Where Your Skills Fit" sub="Get matched with relevant global opportunities." reduce={reduce} align="left" />
        </div>
        <div className="lg:col-start-3 lg:row-start-2">
          <MatchFlow reduce={reduce} />
        </div>
      </div>
    </section>
  );
}

function DemandBars({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLUListElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const go = reduce || inView;

  return (
    <>
      <ul ref={ref} className="space-y-3.5 rounded-2xl bg-white p-5 shadow-[0_14px_40px_rgba(11,31,74,0.08)] ring-1 ring-(color:--gc-ink)/6">
        {DEMAND.map((d, i) => (
          <li key={d.label} className="grid grid-cols-[minmax(0,150px)_1fr_40px] items-center gap-3 text-[13px]">
            <span className="truncate font-medium text-(color:--gc-ink)">{d.label}</span>
            <span className="relative h-2.5 overflow-hidden rounded-full bg-(color:--gc-line-2)">
              <motion.span
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: `linear-gradient(90deg, ${d.color}aa, ${d.color})` }}
                initial={reduce ? false : { width: 0 }}
                animate={go ? { width: `${d.value}%` } : { width: 0 }}
                transition={{ duration: 1.1, delay: i * 0.12, ease: EASE }}
              />
            </span>
            <span className="text-right font-display font-semibold text-(color:--gc-body) tabular-nums">
              <Counter to={d.value} run={go} delay={i * 0.12} reduce={reduce} />%
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-(color:--gc-muted)">Illustrative demand index. Figures are indicative only.</p>
    </>
  );
}

function Counter({ to, run, delay, reduce }: { to: number; run: boolean; delay: number; reduce: boolean }) {
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce || !run) return;
    const c = animate(0, to, { duration: 1.1, delay, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [run, to, delay, reduce]);
  return <>{n}</>;
}

function FlowArrow({ reduce, delay = 0 }: { reduce: boolean; delay?: number }) {
  return (
    <motion.span
      aria-hidden
      className="hidden text-(color:--gc-primary) lg:block"
      animate={reduce ? undefined : { x: [0, 6, 0], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.6, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <ArrowRight size={22} weight="bold" />
    </motion.span>
  );
}

const R = 96;
const MERIDIANS = [0, 1, 2, 3];
const SAMPLES = 24;
const meridianFrames = (m: number) =>
  Array.from({ length: SAMPLES + 1 }, (_, s) => R * Math.abs(Math.cos((s / SAMPLES) * Math.PI + (m * Math.PI) / 4)));
const DOTS: [number, number][] = [
  [-40, -30],
  [20, -52],
  [55, 10],
  [-10, 30],
  [-60, 18],
  [36, 48],
  [8, -10],
];

function Globe({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      className="relative grid size-[230px] shrink-0 place-items-center"
      initial={reduce ? false : { opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.8, ease: EASE }}
    >
      <svg viewBox="-115 -115 230 230" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <radialGradient id="globe-fill" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#e6f4ff" />
            <stop offset="0.55" stopColor="#7cc0ff" />
            <stop offset="1" stopColor="#1f5fbf" />
          </radialGradient>
          <clipPath id="globe-clip">
            <circle r={R} />
          </clipPath>
        </defs>
        <circle r={R + 12} fill="none" stroke="#3fb4ff" strokeOpacity={0.25} strokeDasharray="2 6" />
        <circle r={R} fill="url(#globe-fill)" />
        <g clipPath="url(#globe-clip)" fill="none" stroke="#ffffff" strokeOpacity={0.45} strokeWidth={0.8}>
          {[-60, -30, 0, 30, 60].map((y) => (
            <ellipse key={y} cy={y} rx={Math.sqrt(R * R - y * y)} ry={Math.sqrt(R * R - y * y) * 0.18} />
          ))}
          {MERIDIANS.map((m) =>
            reduce ? (
              <ellipse key={m} rx={R * Math.abs(Math.cos((m * Math.PI) / 4))} ry={R} />
            ) : (
              <motion.ellipse
                key={m}
                ry={R}
                initial={{ rx: meridianFrames(m)[0] }}
                animate={{ rx: meridianFrames(m) }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
            ),
          )}
        </g>
        {DOTS.map(([x, y], i) => (
          <motion.circle
            key={i}
            cx={x}
            cy={y}
            r={2.6}
            fill="#ffd77a"
            animate={reduce ? undefined : { opacity: [0.3, 1, 0.3], r: [2, 3.4, 2] }}
            transition={{ duration: 2.4, delay: i * 0.35, repeat: Infinity }}
          />
        ))}
      </svg>
      <div className="relative rounded-2xl bg-white/85 px-4 py-2.5 text-center shadow-[0_10px_30px_rgba(11,31,74,0.18)] backdrop-blur">
        <p className="font-display text-[12.5px] leading-tight font-bold tracking-wide text-(color:--gc-ink) uppercase">Global Demand</p>
        <p className="text-[10px] font-semibold tracking-[0.3em] text-(color:--gc-primary-deep) uppercase">meets</p>
        <p className="font-display text-[12.5px] leading-tight font-bold tracking-wide text-[#c2560b] uppercase">Karnataka Talent</p>
      </div>
    </motion.div>
  );
}

function Packet({ reduce, delay }: { reduce: boolean; delay: number }) {
  return (
    <span aria-hidden className="relative mx-1 hidden h-[2px] w-8 rounded-full bg-(color:--gc-primary)/20 sm:block">
      {!reduce ? (
        <motion.span
          className="absolute top-1/2 size-2 -translate-y-1/2 rounded-full bg-(color:--gc-primary) shadow-[0_0_8px_#3fb4ff]"
          animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
          transition={{ duration: 1.4, delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
    </span>
  );
}

function MatchFlow({ reduce }: { reduce: boolean }) {
  const col = "flex-1 rounded-2xl bg-white p-3.5 shadow-[0_14px_40px_rgba(11,31,74,0.08)] ring-1 ring-(color:--gc-ink)/6";
  const item = (i: number) => ({
    initial: reduce ? false : ({ opacity: 0, x: -10 } as const),
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, amount: 0.6 },
    transition: { duration: 0.4, delay: 0.2 + i * 0.08, ease: EASE },
  });

  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-0">
      <div className={col}>
        <p className="font-display text-[13px] font-semibold text-(color:--gc-ink)">Your Profile</p>
        <ul className="mt-2.5 space-y-2">
          {PROFILE.map(({ label, icon: I }, i) => (
            <motion.li key={label} className="flex items-center gap-2 text-[12.5px] text-(color:--gc-body)" {...item(i)}>
              <span className="grid size-6 place-items-center rounded-full bg-[#eef4ff] text-(color:--gc-primary)">
                <I size={13} weight="fill" />
              </span>
              {label}
            </motion.li>
          ))}
        </ul>
      </div>

      <Packet reduce={reduce} delay={0} />

      <div className="flex flex-col items-center gap-2 py-2 sm:px-1">
        <p className="font-display text-[12.5px] font-semibold text-(color:--gc-ink)">Talent Match</p>
        <span className="relative grid size-[72px] place-items-center rounded-full bg-gradient-to-br from-(color:--gc-accent) to-(color:--gc-primary-deep) text-white shadow-[0_14px_34px_rgba(31,95,191,0.45)]">
          {!reduce ? (
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-(color:--gc-accent)"
              animate={{ scale: [1, 1.45], opacity: [0.7, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          ) : null}
          <span className="flex items-center gap-0.5 font-display text-[20px] font-bold">
            <Sparkle size={14} weight="fill" className="text-(color:--gc-gold)" />
            AI
          </span>
        </span>
      </div>

      <Packet reduce={reduce} delay={0.7} />

      <div className={col}>
        <p className="font-display text-[13px] font-semibold text-(color:--gc-ink)">Opportunities</p>
        <ul className="mt-2.5 space-y-2">
          {OPPORTUNITIES.map(({ label, icon: I, color }, i) => (
            <motion.li key={label} className="flex items-center gap-2 text-[12.5px] text-(color:--gc-body)" {...item(i + 4)}>
              <span className="grid size-6 place-items-center rounded-md" style={{ background: `${color}16`, color }}>
                <I size={13} weight="fill" />
              </span>
              {label}
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
