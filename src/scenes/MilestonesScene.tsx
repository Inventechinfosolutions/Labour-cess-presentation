import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowDown,
  ArrowsLeftRight,
  ArrowsSplit,
  Bell,
  Buildings,
  CalendarBlank,
  CaretRight,
  ChartBar,
  CheckCircle,
  ClipboardText,
  Clock,
  Cube,
  Flag,
  FolderSimple,
  GearSix,
  Globe,
  GpsFix,
  LinkSimple,
  MapPin,
  MapTrifold,
  Monitor,
  Plugs,
  Scales,
  ShieldCheck,
  Sparkle,
  SquaresFour,
  Stack,
  TreeStructure,
  UsersThree,
  Wallet,
} from "@/lib/icons";
import { STAGE_TYPE } from "@/components/GpsEstimationStage";
import artSrs from "@/assets/plan-srs.jpg";
import artM1 from "@/assets/plan-m1.jpg";
import artM2 from "@/assets/plan-m2.jpg";
import artM3 from "@/assets/plan-m3.jpg";
import artIntegration from "@/assets/plan-integration.jpg";
import artTraining from "@/assets/plan-training.jpg";
import artAmc from "@/assets/plan-amc.jpg";
import artAmcCloud from "@/assets/plan-amc-cloud.jpg";
import stageBg from "@/assets/plan-stage-bg.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

type Phase = { name: string; time: string; Icon: CessIcon; color: string; soft: string; fr: number };

const PHASES: Phase[] = [
  { name: "Requirements (SRS)", time: "30 days", Icon: ClipboardText, color: "#1d66dc", soft: "#e6f0fd", fr: 1.45 },
  { name: "Design, Develop & Deploy", time: "3 milestones", Icon: Cube, color: "#0f8a4c", soft: "#e3f6ea", fr: 3.5 },
  { name: "Integration", time: "90 + 30 days", Icon: Plugs, color: "#e8650a", soft: "#fdeedd", fr: 1.5 },
  { name: "Training", time: "30 days", Icon: UsersThree, color: "#6b35d6", soft: "#efe8fd", fr: 1.35 },
  { name: "AMC Support", time: "2 years", Icon: ShieldCheck, color: "#0e8f9c", soft: "#e0f5f6", fr: 1.35 },
];

type Module = { n: number; label: string; Icon: CessIcon; star?: boolean };

const MILESTONES: { n: number; days: string; from: ReactNode; color: string; art: string; modules: Module[] }[] = [
  {
    n: 1,
    days: "30 days",
    from: <>From receipt of <Hi color="#16a34a">Purchase Order</Hi></>,
    color: "#16a34a",
    art: artM1,
    modules: [
      { n: 1, label: "Super Administrator", Icon: GearSix },
      { n: 2, label: "Territory (MIS & GIS)", Icon: MapTrifold },
      { n: 3, label: "Organisation Structure", Icon: TreeStructure },
      { n: 4, label: "Inward / Outward", Icon: ArrowsLeftRight },
      { n: 5, label: "Document Management (DMS)", Icon: FolderSimple },
      { n: 6, label: "E-Office", Icon: Monitor },
    ],
  },
  {
    n: 2,
    days: "30 days",
    from: <>After <Hi color="#2e9e62">Milestone 1</Hi> is deployed</>,
    color: "#2e9e62",
    art: artM2,
    modules: [
      { n: 7, label: "Meetings", Icon: UsersThree },
      { n: 8, label: "Back Office – Labour CESS Application", Icon: Buildings },
      { n: 9, label: "GPS-based Assessment", Icon: GpsFix, star: true },
    ],
  },
  {
    n: 3,
    days: "60 days",
    from: <>After <Hi color="#1d66dc">Milestone 2</Hi> is deployed</>,
    color: "#1d66dc",
    art: artM3,
    modules: [
      { n: 10, label: "Appeals", Icon: Scales },
      { n: 11, label: "Smart Middleware", Icon: ArrowsSplit, star: true },
      { n: 12, label: "Accounts", Icon: Wallet },
      { n: 13, label: "Back-office GIS Analytics", Icon: MapPin },
      { n: 14, label: "Auto Alerts & Notification", Icon: Bell },
      { n: 15, label: "Reports & Decision Support", Icon: ChartBar },
      { n: 16, label: "Labour CESS Portal Go-Live", Icon: Globe, star: true },
    ],
  },
];

const STATS: { value: string; label: string; Icon: CessIcon; color: string }[] = [
  { value: "5", label: "Phases", Icon: Stack, color: "#1d66dc" },
  { value: "17", label: "Modules", Icon: SquaresFour, color: "#0f8a4c" },
  { value: "3", label: "Milestones", Icon: Flag, color: "#e8650a" },
  { value: "2", label: "Years AMC", Icon: Clock, color: "#0e8f9c" },
];

/** Delivery milestones — one phase per Space: SRS, build in 3 milestones, integration, training, AMC. */
export function MilestonesScene({ beat }: { beat: number }) {
  const reduce = !!useReducedMotion();
  const active = Math.min(Math.max(beat, 0), PHASES.length - 1);
  const cols = PHASES.map((p) => `${p.fr}fr`).join(" ");

  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr] gap-2">
      <div
        className="relative grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_9%] gap-y-[1.2%] overflow-hidden rounded-xl px-[1.2%] pt-[1%] pb-[0.9%] text-[#122b50] ring-1 ring-white/80"
        style={{
          ...STAGE_TYPE,
          background: `linear-gradient(180deg, rgba(246,250,255,0.3) 0%, rgba(238,245,253,0) 40%, rgba(232,241,251,0.15) 100%), url(${stageBg}) center bottom / cover no-repeat, #eef5fd`,
        }}
      >
        {/* Row 1 — phase timeline */}
        <div className="grid min-h-0" style={{ gridTemplateColumns: cols }}>
          {PHASES.map((p, i) => (
            <PhaseStation key={p.name} phase={p} i={i} active={active} reduce={reduce} />
          ))}
        </div>

        {/* Row 2 — phase lanes */}
        <div className="grid min-h-0 gap-x-[0.8%]" style={{ gridTemplateColumns: cols }}>
          {PHASES.map((p, i) =>
            i <= active ? (
              <motion.div
                key={p.name}
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease }}
                className="relative flex min-h-0 flex-col overflow-hidden rounded-2xl shadow-[0_12px_30px_rgba(20,60,120,0.12)] ring-1 ring-[#dbe6f3]"
                style={{
                  borderTop: `4px solid ${p.color}`,
                  background: `linear-gradient(180deg, #ffffff 0%, #ffffff 45%, ${p.soft} 100%)`,
                }}
              >
                <Wave color={p.color} />
                {i === active && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-20 rounded-2xl"
                    style={{ boxShadow: `inset 0 0 0 2px ${p.color}, inset 0 0 18px ${p.color}33` }}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={reduce ? { opacity: 0.8 } : { opacity: [0.35, 1, 0.35] }}
                    transition={reduce ? undefined : { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                  />
                )}
                {i === 0 && <SrsLane reduce={reduce} />}
                {i === 1 && <BuildLane reduce={reduce} />}
                {i === 2 && <IntegrationLane reduce={reduce} />}
                {i === 3 && <TrainingLane reduce={reduce} />}
                {i === 4 && <AmcLane reduce={reduce} />}
              </motion.div>
            ) : (
              <div key={p.name} className="grid min-h-0 place-items-center rounded-2xl border-2 border-dashed border-[#c3d4e8] bg-white/40">
                <p.Icon weight="fill" className="size-[3em] text-[length:var(--gs-20)] text-[#c3d4e8]" />
              </div>
            ),
          )}
        </div>

        {/* Row 3 — summary and key message */}
        <div className="flex min-h-0 items-center gap-[2%] rounded-2xl bg-white/88 px-[1.6%] backdrop-blur-[3px] shadow-[0_10px_26px_rgba(20,50,90,0.1)] ring-1 ring-[#dbe6f3]">
          {STATS.map((s) => (
            <span key={s.label} className="flex shrink-0 items-center gap-[0.6em] text-[length:var(--gs-14)]">
              <span
                className="grid size-[2.8em] place-items-center rounded-full text-white shadow-[0_5px_12px_rgba(0,0,0,0.18)]"
                style={{ background: s.color }}
              >
                <s.Icon weight="fill" className="size-[50%]" />
              </span>
              <span className="leading-none">
                <b className="font-display block text-[1.45em] font-black text-[#123a6e]">{s.value}</b>
                <span className="mt-[0.15em] block font-semibold text-[#5b7390]">{s.label}</span>
              </span>
            </span>
          ))}
          <div className="relative ml-[1%] flex h-[68%] min-w-0 flex-1 items-center overflow-hidden rounded-xl bg-[#e9f7ef] px-[1.6%] ring-1 ring-[#c9ebd6]">
            {active === PHASES.length - 1 && <Shine delay={1.6} />}
            {active === PHASES.length - 1 ? (
              <motion.p
                initial={reduce ? false : { opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease }}
                className="flex min-w-0 items-center gap-[0.6em] text-[length:var(--gs-16)] font-extrabold text-[#123a6e]"
              >
                <CheckCircle weight="fill" className="size-[1.5em] shrink-0 text-[#16a34a]" />
                <span>
                  Each stage starts after the <Hi color="#0f8a4c" delay={0.9}>previous one is deployed</Hi>.
                </span>
              </motion.p>
            ) : (
              <p className="text-[length:var(--gs-14)] font-semibold text-[#3f6b55]">
                Phase {active + 1} of {PHASES.length} · {PHASES[active].name}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PhaseStation({ phase, i, active, reduce }: { phase: Phase; i: number; active: number; reduce: boolean }) {
  const reached = i <= active;
  const current = i === active;
  const prev = PHASES[i - 1];
  const next = PHASES[i + 1];
  return (
    <div className="flex min-w-0 flex-col items-center text-center text-[length:var(--gs-16)]">
      <div className="relative flex h-[3.4em] w-full items-center justify-center">
        {prev && <Connector side="left" on={reached} from={prev.color} to={phase.color} reduce={reduce} />}
        {next && <Connector side="right" on={i < active} from={phase.color} to={next.color} reduce={reduce} arrow />}
        {current && !reduce && (
          <motion.span
            aria-hidden
            className="absolute size-[3.2em] rounded-full"
            style={{ boxShadow: `0 0 0 3px ${phase.color}` }}
            animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <motion.span
          className="relative z-[1] grid size-[3.2em] place-items-center rounded-full text-white ring-4 ring-white"
          animate={{
            background: reached ? phase.color : "#c7d3e2",
            scale: current && !reduce ? 1.08 : 1,
            boxShadow: reached ? `0 8px 18px ${phase.color}55` : "0 4px 10px rgba(20,50,90,0.12)",
          }}
          transition={{ duration: 0.45, ease }}
        >
          <phase.Icon weight="fill" className="size-[48%]" />
        </motion.span>
      </div>
      <motion.div
        className="mt-[0.35em] flex flex-col items-center gap-[0.2em] leading-tight"
        animate={{ opacity: reached ? 1 : 0.45 }}
        transition={{ duration: 0.35 }}
      >
        <span className="font-display text-[length:var(--gs-13)] font-extrabold tracking-[0.06em] uppercase" style={{ color: reached ? phase.color : "#8da2bb" }}>
          Phase {i + 1}
        </span>
        <span className="font-display text-[length:var(--gs-16)] font-extrabold whitespace-nowrap text-[#123a6e]">{phase.name}</span>
        <span
          className="flex items-center gap-[0.35em] rounded-full px-[0.7em] py-[0.2em] text-[length:var(--gs-12)] font-bold whitespace-nowrap"
          style={{ background: reached ? phase.soft : "#eef2f7", color: reached ? phase.color : "#8da2bb" }}
        >
          <CalendarBlank weight="bold" className="size-[1.1em]" />
          {phase.time}
        </span>
      </motion.div>
    </div>
  );
}

function Connector({
  side,
  on,
  from,
  to,
  reduce,
  arrow,
}: {
  side: "left" | "right";
  on: boolean;
  from: string;
  to: string;
  reduce: boolean;
  arrow?: boolean;
}) {
  return (
    <span className={`absolute top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-[#d5e0ec] ${side === "left" ? "right-1/2 -left-px" : "-right-px left-1/2"}`}>
      <motion.span
        className="absolute inset-0 origin-left"
        style={{ background: `linear-gradient(90deg, ${side === "left" ? `color-mix(in srgb, ${from} 50%, ${to})` : from}, ${side === "left" ? to : `color-mix(in srgb, ${from} 50%, ${to})`})` }}
        initial={reduce ? false : { scaleX: 0 }}
        animate={{ scaleX: on ? 1 : 0 }}
        transition={{ duration: 0.6, ease }}
      />
      {arrow && (
        <CaretRight
          weight="bold"
          className="absolute top-1/2 right-[22%] size-[1.5em] -translate-y-1/2 transition-colors duration-500"
          style={{ color: on ? to : "#c7d3e2" }}
        />
      )}
    </span>
  );
}

function LaneHead({ Icon, title, sub, color, soft, big }: { Icon: CessIcon; title: string; sub: string; color: string; soft: string; big?: boolean }) {
  return (
    <div className="shrink-0">
      <div className="flex items-center gap-[0.55em]">
        <span
          className={`grid shrink-0 place-items-center rounded-lg text-white ${big ? "size-[2.7em]" : "size-[2.1em]"}`}
          style={{ background: `linear-gradient(135deg, ${color}bb, ${color})`, boxShadow: `0 5px 12px -4px ${color}99` }}
        >
          <Icon weight="fill" className="size-[56%]" />
        </span>
        <span className={`font-display min-w-0 flex-1 leading-tight font-extrabold ${big ? "text-[length:var(--gs-18)]" : "text-[length:var(--gs-16)]"}`} style={{ color: big ? "#123a6e" : color }}>
          {title}
        </span>
        <span className={`grid shrink-0 place-items-center rounded-full ${big ? "size-[1.9em]" : "size-[1.6em]"}`} style={{ background: soft, color }}>
          <CaretRight weight="bold" className="size-[55%]" />
        </span>
      </div>
      <p className="mt-[0.4em] text-[length:var(--gs-12)] leading-snug font-semibold text-[#5b7390]">{sub}</p>
    </div>
  );
}

function Art({ src, delay, reduce, className = "" }: { src: string; delay: number; reduce: boolean; className?: string }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay, ease }}
      className={`flex min-h-0 flex-1 items-center justify-center ${className}`}
    >
      <img src={src} alt="" draggable={false} className="max-h-full max-w-full object-contain mix-blend-multiply select-none" />
    </motion.div>
  );
}

function Checklist({ items, color, delay, reduce }: { items: ReactNode[]; color: string; delay: number; reduce: boolean }) {
  return (
    <ul className="flex shrink-0 flex-col gap-[0.85em]">
      {items.map((it, k) => (
        <motion.li
          key={k}
          initial={reduce ? false : { opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, delay: delay + k * 0.08, ease }}
          className="flex items-start gap-[0.5em] text-[length:var(--gs-13)] leading-tight font-semibold text-[#17365f]"
        >
          <CheckCircle weight="fill" className="mt-[0.05em] size-[1.25em] shrink-0" style={{ color }} />
          {it}
        </motion.li>
      ))}
    </ul>
  );
}

function TimeBox({ days, from, color, soft }: { days: string; from: ReactNode; color: string; soft: string }) {
  return (
    <div className="relative flex shrink-0 items-center gap-[0.6em] overflow-hidden rounded-xl bg-white/85 px-[0.7em] py-[0.55em] ring-1" style={{ boxShadow: `inset 0 0 0 1px ${soft}`, borderColor: soft }}>
      <Shine />
      <span className="grid size-[2em] shrink-0 place-items-center rounded-lg text-[length:var(--gs-13)]" style={{ background: soft, color }}>
        <CalendarBlank weight="fill" className="size-[58%]" />
      </span>
      <span className="min-w-0 leading-tight">
        <b className="font-display block text-[length:var(--gs-16)] font-extrabold" style={{ color }}>{days}</b>
        <span className="block text-[length:var(--gs-12)] font-semibold text-[#5b7390]">{from}</span>
      </span>
    </div>
  );
}

function Hi({ children, color, delay = 0.8 }: { children: ReactNode; color: string; delay?: number }) {
  const reduce = !!useReducedMotion();
  return (
    <motion.span
      className="rounded-[0.3em] px-[0.2em] font-extrabold [box-decoration-break:clone]"
      style={{ color, backgroundImage: `linear-gradient(90deg, ${color}33, ${color}1a)`, backgroundRepeat: "no-repeat", backgroundPosition: "left center" }}
      initial={reduce ? false : { backgroundSize: "0% 100%" }}
      animate={{ backgroundSize: "100% 100%" }}
      transition={{ duration: 0.7, delay, ease }}
    >
      {children}
    </motion.span>
  );
}

function Shine({ delay = 1.2 }: { delay?: number }) {
  const reduce = !!useReducedMotion();
  if (reduce) return null;
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 w-[40%] -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.75),transparent)]"
      initial={{ left: "-50%" }}
      animate={{ left: "130%" }}
      transition={{ duration: 1.1, delay, repeat: Infinity, repeatDelay: 4.5, ease: "easeInOut" }}
    />
  );
}

function Wave({ color }: { color: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 60" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 bottom-0 h-[18%] w-full">
      <path d="M0 26 C 40 6, 80 46, 120 24 S 180 12, 200 24 V60 H0 Z" fill={color} fillOpacity="0.08" />
      <path d="M0 40 C 50 22, 95 56, 145 36 S 185 30, 200 38 V60 H0 Z" fill={color} fillOpacity="0.14" />
    </svg>
  );
}

function LaneBody({ children }: { children: ReactNode }) {
  return <div className="relative flex min-h-0 flex-1 flex-col gap-[0.8em] p-[7%] text-[length:var(--gs-16)]">{children}</div>;
}

function SrsLane({ reduce }: { reduce: boolean }) {
  const p = PHASES[0];
  return (
    <LaneBody>
      <LaneHead Icon={ClipboardText} title="Requirements Study" sub="Understand existing KBOCWWB applications and prepare the SRS." color={p.color} soft={p.soft} />
      <Art src={artSrs} delay={0.25} reduce={reduce} />
      <Checklist
        items={["Study existing KBOCWWB applications", "Analyse business processes", <>Prepare the <Hi color={p.color}>SRS document</Hi></>, "Define scope and requirements"]}
        color={p.color}
        delay={0.4}
        reduce={reduce}
      />
      <TimeBox days="30 days" from="Study and SRS preparation" color={p.color} soft={p.soft} />
    </LaneBody>
  );
}

function BuildLane({ reduce }: { reduce: boolean }) {
  const p = PHASES[1];
  return (
    <div className="relative flex min-h-0 flex-1 flex-col text-[length:var(--gs-16)]">
      <div className="relative flex shrink-0 items-center gap-[0.8em] py-[1.1%] pr-[1.6%] pl-[4.6em]" style={{ background: `linear-gradient(90deg, ${p.soft} 0%, #ffffff 70%)` }}>
        <span
          className="absolute top-0 left-0 grid h-full w-[3.9em] place-items-center rounded-br-[1.4em] text-white"
          style={{ background: `linear-gradient(135deg, #2fb36a, ${p.color})`, boxShadow: `0 6px 14px -6px ${p.color}aa` }}
        >
          <Cube weight="fill" className="size-[1.7em]" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="font-display text-[length:var(--gs-18)] font-extrabold text-[#123a6e]">Design, Develop &amp; Deploy</p>
          <p className="mt-[0.2em] text-[length:var(--gs-12)] font-semibold text-[#5b7390]">End-to-end development of modules in a phased manner.</p>
        </div>
        <span className="grid size-[2em] shrink-0 place-items-center rounded-full bg-[#dff3ec] text-[#0f6e4c]">
          <CaretRight weight="bold" className="size-[55%]" />
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-3 gap-x-[1.4%] px-[1.4%] pt-[1.2%] pb-[1.4%]">
        {MILESTONES.map((m, mi) => (
          <motion.div
            key={m.n}
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 + mi * 0.35, ease }}
            className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl ring-1"
            style={{
              background: `linear-gradient(180deg, ${m.color}12 0%, #ffffff 22%, #ffffff 62%, ${m.color}0c 100%)`,
              ["--tw-ring-color" as string]: `${m.color}26`,
            }}
          >
            <div className="flex shrink-0 items-center gap-[0.55em] px-[6%] pt-[6%]">
              <span
                className="font-display grid size-[2.5em] shrink-0 place-items-center rounded-full text-[length:var(--gs-14)] font-black text-white"
                style={{ background: `linear-gradient(135deg, ${m.color}bb, ${m.color})`, boxShadow: `0 5px 12px -4px ${m.color}aa` }}
              >
                M{m.n}
              </span>
              <span className="font-display text-[length:var(--gs-16)] leading-tight font-extrabold text-[#123a6e]">
                Milestone {m.n}
                <span className="block text-[length:var(--gs-13)] font-semibold text-[#3d5677]">
                  Modules {m.modules[0].n} – {m.modules[m.modules.length - 1].n}
                </span>
              </span>
            </div>

            <div className="mt-[0.9em] flex shrink-0 flex-col gap-[0.75em] px-[6%]">
              {m.modules.map((mod, k) => (
                <motion.div
                  key={mod.n}
                  initial={reduce ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.45 + mi * 0.35 + k * 0.06, ease }}
                  className="-mx-[0.3em] flex items-center gap-[0.55em] rounded-full px-[0.3em] py-[0.1em] text-[length:var(--gs-13)] leading-tight"
                  style={mod.star ? { background: `linear-gradient(90deg, ${m.color}24, ${m.color}08)` } : undefined}
                >
                  <span
                    className="grid size-[2em] shrink-0 place-items-center rounded-full bg-white"
                    style={{ color: m.color, boxShadow: `inset 0 0 0 1.5px ${m.color}, 0 2px 6px -2px ${m.color}55` }}
                  >
                    <mod.Icon weight="fill" className="size-[52%]" />
                  </span>
                  <span className={`min-w-0 flex-1 ${mod.star ? "font-extrabold" : "font-semibold"}`} style={{ color: mod.star ? m.color : "#17365f" }}>
                    <span className="mr-[0.3em]">{mod.n}</span>
                    {mod.label}
                  </span>
                  {mod.star && (
                    <motion.span
                      className="shrink-0 text-[#f5a50b]"
                      initial={reduce ? false : { scale: 0, rotate: -40 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 14, delay: 0.9 + mi * 0.35 }}
                    >
                      <Sparkle weight="fill" className="size-[1.2em]" />
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + mi * 0.35, ease }}
              className="flex min-h-0 flex-1 items-end justify-center"
            >
              <img src={m.art} alt="" draggable={false} className="max-h-full w-full object-contain object-bottom mix-blend-multiply select-none" />
            </motion.div>

            <div className="relative mx-[5%] mb-[5%] flex shrink-0 items-center gap-[0.6em] overflow-hidden rounded-lg px-[0.7em] py-[0.55em]" style={{ background: `${m.color}14`, boxShadow: `inset 0 0 0 1px ${m.color}26` }}>
              <Shine delay={1.2 + mi * 0.35} />
              <CalendarBlank weight="fill" className="size-[1.6em] shrink-0" style={{ color: m.color }} />
              <span className="min-w-0 leading-tight">
                <b className="font-display block text-[length:var(--gs-16)] font-extrabold" style={{ color: m.color }}>
                  {m.days}
                </b>
                <span className="block text-[length:var(--gs-12)] font-semibold text-[#3d5677]">{m.from}</span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function IntegrationLane({ reduce }: { reduce: boolean }) {
  const p = PHASES[2];
  const steps = [
    { code: "3.1", title: <><Hi color={p.color}>KSK</Hi> Platform Integration</>, note: "As per clause 7", days: "90 days", from: <>After <Hi color={p.color}>Milestone 3</Hi> is deployed</>, Icon: Plugs },
    { code: "3.2", title: <>Module 17 · <Hi color={p.color}>Agency Connectors</Hi></>, note: "Connectors listed in Module 8", days: "30 days", from: <>After <Hi color={p.color}>Phase 3.1</Hi> is deployed</>, Icon: LinkSimple },
  ];
  return (
    <LaneBody>
      <LaneHead Icon={Plugs} title="Integration" sub="Integration with the KSK platform and agency connectors." color={p.color} soft={p.soft} />
      <div className="flex shrink-0 flex-col gap-[0.4em]">
        {steps.map((s, i) => (
          <div key={s.code} className="contents">
            {i > 0 && <ArrowDown weight="bold" className="mx-auto size-[1em] shrink-0 text-[#f0b47a]" />}
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 + i * 0.3, ease }}
              className="flex flex-col gap-[0.5em] rounded-xl bg-white/90 p-[0.7em] ring-1 ring-[#f6d7b8]"
            >
              <div className="flex items-start gap-[0.5em]">
                <span className="grid size-[2.2em] shrink-0 place-items-center rounded-lg text-white shadow-[0_4px_10px_rgba(232,101,10,0.3)]" style={{ background: p.color }}>
                  <s.Icon weight="fill" className="size-[52%]" />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[length:var(--gs-12)] font-extrabold" style={{ color: p.color }}>
                    {s.code}
                  </span>
                  <span className="font-display block text-[length:var(--gs-13)] font-extrabold text-[#123a6e]">{s.title}</span>
                  <span className="block text-[length:var(--gs-12)] font-semibold text-[#5b7390]">{s.note}</span>
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-[0.5em] gap-y-[0.2em] text-[length:var(--gs-12)] leading-tight">
                <span className="relative flex items-center gap-[0.3em] overflow-hidden rounded-full px-[0.6em] py-[0.15em] font-extrabold text-white shadow-[0_4px_10px_-3px_rgba(232,101,10,0.6)]" style={{ background: p.color }}>
                  <Shine delay={1 + i * 0.4} />
                  <CalendarBlank weight="bold" className="size-[1.05em]" />
                  {s.days}
                </span>
                <span className="font-semibold text-[#5b7390]">{s.from}</span>
              </div>
            </motion.div>
          </div>
        ))}
      </div>
      <Art src={artIntegration} delay={0.8} reduce={reduce} />
    </LaneBody>
  );
}

function TrainingLane({ reduce }: { reduce: boolean }) {
  const p = PHASES[3];
  return (
    <LaneBody>
      <LaneHead Icon={UsersThree} title="Training" sub="Training and capacity building for all stakeholders." color={p.color} soft={p.soft} />
      <Art src={artTraining} delay={0.25} reduce={reduce} />
      <Checklist
        items={[<>Training for <Hi color={p.color}>department users</Hi></>, "User manuals and documentation", "Hands-on practice sessions", <>Capacity building at <Hi color={p.color}>all levels</Hi></>]}
        color={p.color}
        delay={0.4}
        reduce={reduce}
      />
      <TimeBox days="30 days" from={<>After <Hi color={p.color}>Phase 3</Hi> is implemented</>} color={p.color} soft={p.soft} />
    </LaneBody>
  );
}

function AmcLane({ reduce }: { reduce: boolean }) {
  const p = PHASES[4];
  const years = [
    { label: "AMC Year 1", note: <>Starts when <Hi color={p.color}>Phase 3.1</Hi> is complete</> },
    { label: "AMC Year 2", note: <>Starts from the <Hi color={p.color}>13th month</Hi></> },
  ];
  return (
    <LaneBody>
      <LaneHead Icon={ShieldCheck} title="AMC Support" sub="Annual maintenance and continuous support." color={p.color} soft={p.soft} />
      <Art src={artAmc} delay={0.25} reduce={reduce} />
      <div className="flex shrink-0 flex-col gap-[0.9em]">
        {years.map((y, yi) => (
          <motion.div
            key={y.label}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.4 + yi * 0.35, ease }}
            className="flex flex-col gap-[0.4em]"
          >
            <div className="flex items-center gap-[0.5em]">
              <span className="grid size-[2em] shrink-0 place-items-center rounded-full text-white" style={{ background: p.color }}>
                <ShieldCheck weight="fill" className="size-[52%]" />
              </span>
              <span className="leading-tight">
                <span className="font-display block text-[length:var(--gs-14)] font-extrabold text-[#123a6e]">{y.label}</span>
                <span className="mt-[0.15em] inline-block rounded-full px-[0.55em] text-[length:var(--gs-12)] font-extrabold text-white" style={{ background: p.color }}>
                  12 months
                </span>
              </span>
            </div>
            <div className="grid grid-cols-12 gap-[2px]">
              {Array.from({ length: 12 }, (_, m) => (
                <motion.span
                  key={m}
                  className="h-[0.42em] rounded-[2px]"
                  style={{ background: p.color }}
                  initial={reduce ? false : { opacity: 0.15 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.7 + yi * 0.6 + m * 0.04 }}
                />
              ))}
            </div>
            <span className="text-[length:var(--gs-12)] leading-tight font-semibold text-[#5b7390]">{y.note}</span>
          </motion.div>
        ))}
      </div>
      <Art src={artAmcCloud} delay={1.2} reduce={reduce} className="max-h-[22%]" />
    </LaneBody>
  );
}
