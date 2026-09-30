import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  Buildings,
  ClipboardText,
  Clock,
  Eye,
  FolderSimple,
  HardHat,
  LinkBreak,
  Receipt,
  Ruler,
  ShieldCheck,
  User,
  WarningCircle,
  X,
} from "@/lib/icons";
import abcSite from "@/assets/abc-site.png";
import assessAssign3d from "@/assets/assess-assign-officer-3d.png";
import assessAssess3d from "@/assets/assess-field-3d.png";
import assessDemand3d from "@/assets/assess-demand-3d.png";
import assessEstimate3d from "@/assets/assess-estimate-3d.png";
import assessStatus3d from "@/assets/assess-status-3d.png";
import oneFileStack from "@/assets/one-file-stack.png";
import problemStageBg from "@/assets/problem-stage-bg.png";
import projectFile3d from "@/assets/project-file-3d.png";
import { Reveal, SceneHead, Stagger } from "@/components/SlideKit";
import { cn } from "@/lib/utils";

const B = {
  record: 0,
  assign: 1,
  assess: 2,
  estimate: 3,
  demand: 4,
  status: 5,
} as const;

type Tone = {
  iconWrap: string;
  ring: string;
  accent: string;
  soft: string;
  line: string;
  glow: string;
};

type Stage = {
  id: string;
  label: string;
  short: string;
  hint: string;
  Icon: CessIcon;
  who: string;
  tone: Tone;
};

const STAGES: Stage[] = [
  {
    id: "record",
    label: "Project file",
    short: "File",
    hint: "One official file on the Central Platform",
    Icon: Buildings,
    who: "Platform",
    tone: {
      iconWrap: "bg-navy text-teal-bright",
      ring: "ring-teal/40",
      accent: "text-teal",
      soft: "bg-accent",
      line: "#0e9aa7",
      glow: "rgba(20,196,212,0.35)",
    },
  },
  {
    id: "assign",
    label: "Assignment",
    short: "Assign",
    hint: "Territory officer takes ownership",
    Icon: ClipboardText,
    who: "District in-charge",
    tone: {
      iconWrap: "bg-[#1a4e8a] text-white",
      ring: "ring-[#5b9bd5]/45",
      accent: "text-[#1a4e8a]",
      soft: "bg-[#e8f1fa]",
      line: "#5b9bd5",
      glow: "rgba(91,155,213,0.35)",
    },
  },
  {
    id: "assess",
    label: "Assessment",
    short: "Assess",
    hint: "Officer works the same digital file",
    Icon: HardHat,
    who: "Labour Inspector",
    tone: {
      iconWrap: "bg-gold text-gold-ink",
      ring: "ring-gold/50",
      accent: "text-gold-deep",
      soft: "bg-gold-soft",
      line: "#f0c14a",
      glow: "rgba(240,193,74,0.45)",
    },
  },
  {
    id: "estimate",
    label: "Estimation",
    short: "Estimate",
    hint: "Verified quantities on the record",
    Icon: Ruler,
    who: "Labour Inspector",
    tone: {
      iconWrap: "bg-[#c45c26] text-white",
      ring: "ring-[#f0a06a]/45",
      accent: "text-[#c45c26]",
      soft: "bg-[#fdf3ec]",
      line: "#f0a06a",
      glow: "rgba(240,160,106,0.35)",
    },
  },
  {
    id: "demand",
    label: "Demand notice",
    short: "Demand",
    hint: "Formal notice on file or on-spot",
    Icon: Receipt,
    who: "Authorised officer",
    tone: {
      iconWrap: "bg-teal text-navy-deep",
      ring: "ring-teal/45",
      accent: "text-teal",
      soft: "bg-accent",
      line: "#0e9aa7",
      glow: "rgba(14,154,167,0.35)",
    },
  },
  {
    id: "status",
    label: "Status",
    short: "Status",
    hint: "Pending work · payment · remittance · matching",
    Icon: Eye,
    who: "Workflow",
    tone: {
      iconWrap: "bg-ok text-white",
      ring: "ring-ok/45",
      accent: "text-ok",
      soft: "bg-ok-soft",
      line: "#0e8a72",
      glow: "rgba(14,138,114,0.35)",
    },
  },
];

/** Left-arc seats around the site circle (percent of orbit stage). */
const ORBIT_SEATS: { x: number; y: number }[] = [
  { x: 8, y: 14 },
  { x: 2, y: 34 },
  { x: 4, y: 54 },
  { x: 14, y: 72 },
  { x: 30, y: 84 },
  { x: 48, y: 88 },
];

const CHALLENGES: { title: string; body: string; Icon: CessIcon }[] = [
  {
    title: "Starts from many files",
    body: "Assessment often begins from separate office files — not one shared Board file.",
    Icon: LinkBreak,
  },
  {
    title: "Unclear who owns the work",
    body: "It may not be clear which territory or officer should take up the assessment.",
    Icon: User,
  },
  {
    title: "Hard to see pending cases",
    body: "District and state may not see pending or delayed assessments in time.",
    Icon: Eye,
  },
  {
    title: "Treated as a one-off step",
    body: "Assessment may sit alone — not as part of the full project journey.",
    Icon: Clock,
  },
];

const BEAT_HEAD: readonly { kicker: string; title: string; support: string }[] = [
  {
    kicker: "Government of Karnataka · Labour CESS",
    title: "One Project File",
    support: "One official file on the Central Platform. Assessment starts here.",
  },
  {
    kicker: "Assessment desk",
    title: "Assignment",
    support: "We assign the project to the responsible officer by territory.",
  },
  {
    kicker: "Assessment desk",
    title: "Assessment",
    support: "The officer works on the same digital project file.",
  },
  {
    kicker: "Assessment desk",
    title: "Estimation",
    support: "Verified quantities stay on the same Board record.",
  },
  {
    kicker: "Assessment desk",
    title: "Demand Notice",
    support: "A formal demand notice is raised on the project file.",
  },
  {
    kicker: "Assessment desk",
    title: "Status",
    support: "Pending work, payment, remittance and matching — by territory.",
  },
];

const stamp3d =
  "relative shadow-[0_2px_0_0_rgba(0,0,0,0.18),0_8px_16px_rgba(7,20,51,0.16)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[45%] before:rounded-t-full before:bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent)] before:content-['']";

export function AssessScene({ beat, onBeat }: { beat: number; onBeat: (n: number) => void }) {
  const [issuesOpen, setIssuesOpen] = useState(false);
  const reduce = useReducedMotion();
  const bi = Math.min(beat, STAGES.length - 1);
  const stage = STAGES[bi];
  const showIssues = beat === B.record;
  const head = BEAT_HEAD[Math.min(beat, BEAT_HEAD.length - 1)];

  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr_auto] gap-2">
      {/* Orbit stage — same city / mist stage as Smart Middleware (title inside) */}
      <div className="relative min-h-0 overflow-hidden rounded-[24px] bg-[#eef3f8] shadow-[0_14px_40px_rgba(7,20,51,0.1)] ring-1 ring-navy/8">
        <img
          src={problemStageBg}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-[center_40%] select-none"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `
              linear-gradient(165deg, rgba(247,250,253,0.58) 0%, rgba(232,240,244,0.38) 45%, rgba(228,238,246,0.52) 100%),
              radial-gradient(ellipse 55% 60% at 32% 48%, ${stage.tone.glow} 0%, transparent 65%),
              radial-gradient(ellipse 80% 60% at 70% 35%, rgba(20,196,212,0.14) 0%, transparent 65%),
              radial-gradient(ellipse 40% 45% at 78% 30%, rgba(11,31,74,0.05) 0%, transparent 60%)
            `,
          }}
        />

        {issuesOpen ? (
          <div
            className="absolute top-3 right-3 z-40 w-[min(340px,calc(100%-1.5rem))] overflow-hidden rounded-2xl bg-white shadow-[0_18px_44px_rgba(7,20,51,0.2)] ring-1 ring-risk/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2 border-b border-risk/15 bg-risk-soft px-3 py-2">
              <div className="min-w-0">
                <div className="text-[9px] font-extrabold tracking-[0.14em] text-risk-ink uppercase">Key issues</div>
                <div className="font-display text-[13px] font-bold text-navy">Why one project file matters</div>
              </div>
              <button
                type="button"
                aria-label="Close key issues"
                onClick={() => setIssuesOpen(false)}
                className="grid size-7 shrink-0 place-items-center rounded-full bg-white text-risk-ink shadow-sm ring-1 ring-risk/15 transition hover:bg-risk hover:text-white"
              >
                <X weight="bold" className="size-3.5" />
              </button>
            </div>
            <ul className="space-y-2 p-3">
              {CHALLENGES.map((item, i) => (
                <Stagger key={item.title} delay={40 + i * 50}>
                  <li className="flex gap-2">
                    <span className={cn("grid size-7 shrink-0 place-items-center rounded-full bg-risk text-white", stamp3d)}>
                      <item.Icon weight="fill" className="relative z-[1] size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <b className="block text-[12px] text-risk-ink">{item.title}</b>
                      <span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">{item.body}</span>
                    </span>
                  </li>
                </Stagger>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="relative z-10 grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2 px-3 pt-3 pb-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={head.title}
              className="text-center"
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
            >
              <SceneHead kicker={head.kicker} title={head.title} />
              <p className="mx-auto mt-0.5 max-w-[36rem] text-[12px] font-semibold text-muted-foreground">{head.support}</p>
            </motion.div>
          </AnimatePresence>

          <div className="grid min-h-0 grid-cols-[minmax(0,1.15fr)_minmax(280px,0.95fr)] gap-3">
          {/* Orbit · site circle + path nodes */}
          <div className="relative min-h-0">
            <div className="absolute top-1 left-1/2 z-20 w-[min(100%,300px)] -translate-x-1/2">
              <div className="flex items-center gap-2.5 rounded-[20px] bg-white/95 px-3 py-2 shadow-[0_10px_28px_rgba(7,20,51,0.12)] ring-1 ring-navy/8 backdrop-blur-[2px]">
                <img
                  src={oneFileStack}
                  alt=""
                  aria-hidden
                  draggable={false}
                  className="h-9 w-auto shrink-0 select-none drop-shadow-sm"
                />
                <div className="min-w-0 text-left">
                  <div className="text-[12px] font-extrabold leading-tight tracking-tight text-navy">
                    One site · One Board file
                  </div>
                  <p className="mt-0.5 text-[10px] leading-snug font-semibold text-[#6b849e]">
                    From submission to assessment, everything in one place.
                  </p>
                </div>
              </div>
            </div>

            {/* Dashed orbit path */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <path
                d="M 18 12 C 2 28, 0 55, 18 78 C 28 88, 42 92, 55 90"
                fill="none"
                stroke={stage.tone.line}
                strokeWidth="0.55"
                strokeDasharray="1.4 1.1"
                opacity="0.55"
              />
              {!reduce ? (
                <motion.path
                  d="M 18 12 C 2 28, 0 55, 18 78 C 28 88, 42 92, 55 90"
                  fill="none"
                  stroke={stage.tone.line}
                  strokeWidth="0.7"
                  strokeDasharray="2 2.5"
                  strokeLinecap="round"
                  animate={{ strokeDashoffset: [0, -18] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
                  opacity="0.85"
                />
              ) : null}
            </svg>

            {/* Site circle hub */}
            <motion.div
              className="absolute top-[48%] left-[52%] z-10 aspect-square w-[min(62%,250px)] -translate-x-1/2 -translate-y-1/2"
              initial={reduce ? false : { opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              {!reduce ? (
                <motion.div
                  aria-hidden
                  className="absolute -inset-3 rounded-full"
                  style={{ boxShadow: `0 0 0 2px ${stage.tone.line}33, 0 18px 40px rgba(7,20,51,0.14)` }}
                  animate={{ scale: [1, 1.02, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : null}

              <div className="relative h-full w-full overflow-hidden rounded-full bg-white shadow-[0_16px_40px_rgba(7,20,51,0.16)] ring-[6px] ring-white">
                <img
                  src={abcSite}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(247,250,253,0.08) 0%, transparent 40%, rgba(7,20,51,0.55) 100%)",
                  }}
                />

                {/* Official Board file badge */}
                <div className="absolute inset-x-4 bottom-4 z-10">
                  <div className="flex items-center gap-2 rounded-2xl bg-navy/92 px-3 py-2 text-white shadow-lg ring-1 ring-white/15 backdrop-blur-sm">
                    <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl bg-gold text-gold-ink", stamp3d)}>
                      <FolderSimple weight="fill" className="relative z-[1] size-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[8px] font-extrabold tracking-[0.14em] text-teal-bright uppercase">
                        Official Board file
                      </span>
                      <b className="block truncate font-mono text-[11px] leading-tight">CESS-2025-000123</b>
                      <span className="block truncate text-[10px] text-white/75">ABC Commercial Complex</span>
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Orbit nodes */}
            {STAGES.map((s, i) => {
              const seat = ORBIT_SEATS[i];
              const active = bi === i;
              const done = bi > i;
              return (
                <motion.button
                  key={s.id}
                  type="button"
                  title={s.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBeat(i);
                  }}
                  className="absolute z-30 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                  style={{ left: `${seat.x}%`, top: `${seat.y}%` }}
                  initial={reduce ? false : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: active ? 1.12 : 1 }}
                  transition={{ delay: reduce ? 0 : 0.05 + i * 0.05, duration: 0.3 }}
                  whileHover={reduce ? undefined : { scale: active ? 1.14 : 1.08 }}
                  whileTap={reduce ? undefined : { scale: 0.95 }}
                >
                  <span
                    className={cn(
                      "grid size-11 place-items-center rounded-full transition",
                      stamp3d,
                      active
                        ? cn(s.tone.iconWrap, "ring-[3px]", s.tone.ring)
                        : done
                          ? "bg-ok text-white ring-2 ring-ok/35"
                          : "bg-white text-navy/40 ring-1 ring-navy/10",
                    )}
                    style={active ? { boxShadow: `0 10px 24px ${s.tone.line}55` } : undefined}
                  >
                    {done && !active ? (
                      <ShieldCheck weight="fill" className="relative z-[1] size-5" />
                    ) : (
                      <s.Icon weight={active ? "fill" : "duotone"} className="relative z-[1] size-5" />
                    )}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold shadow-sm",
                      active
                        ? "bg-navy text-white"
                        : done
                          ? "bg-ok-soft text-ok"
                          : "bg-white/90 text-navy/45",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")} {s.short}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Active step detail card */}
          <div className="relative flex min-h-0 items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={stage.id}
                className="relative w-full"
                initial={reduce ? false : { opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: 10 }}
                transition={{ duration: 0.32 }}
              >
                {!reduce ? (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -inset-4 rounded-[36px]"
                    style={{ background: `radial-gradient(ellipse at center, ${stage.tone.glow}, transparent 70%)` }}
                    animate={{ opacity: [0.35, 0.75, 0.35] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : null}

                {bi === B.record ? (
                  <ProjectFileCard reduce={!!reduce} />
                ) : (
                  <DeskCaseCard stage={stage} index={bi} reduce={!!reduce} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        </div>
      </div>

      {/* Footer — key message + orbit mirror */}
      <div className="flex flex-col gap-1.5">
        <motion.div
          layout={!reduce}
          className="flex flex-wrap items-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-white shadow-[0_10px_28px_rgba(7,20,51,0.2)]"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-teal px-2.5 py-0.5 text-[9px] font-extrabold tracking-[0.12em] text-navy-deep uppercase">
            Key message
          </span>
          <span className="text-[12px] font-semibold text-white/90">
            One official file. Same Project ID at every step.
          </span>
          <span className="ml-auto flex flex-wrap items-center gap-1">
            {STAGES.map((s, i) => {
              const active = bi === i;
              const done = bi > i;
              return (
                <button
                  key={s.id}
                  type="button"
                  title={s.label}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBeat(i);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold transition",
                    active && cn("shadow-md ring-2", s.tone.iconWrap, s.tone.ring),
                    done && !active && "bg-ok/25 text-ok",
                    !done && !active && "bg-white/10 text-white/45 hover:bg-white/15 hover:text-white/80",
                  )}
                >
                  {done && !active ? (
                    <ShieldCheck weight="fill" className="size-3" />
                  ) : (
                    <s.Icon weight="fill" className="size-3" />
                  )}
                  <span className="hidden sm:inline">{s.short}</span>
                  {active ? <span className="text-[8px] font-extrabold uppercase">Now</span> : null}
                </button>
              );
            })}
          </span>
        </motion.div>

        {showIssues ? (
          <Reveal beat={beat} at={B.record}>
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-risk-soft/85 px-3 py-1.5 shadow-sm ring-1 ring-risk/12">
              <span className="inline-flex items-center gap-1 rounded-full bg-risk px-2 py-0.5 text-[9px] font-extrabold tracking-[0.12em] text-white uppercase">
                <WarningCircle weight="fill" className="size-3" />
                Key issues
              </span>
              {CHALLENGES.map((item, i) => (
                <Stagger key={item.title} delay={30 + i * 40}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIssuesOpen(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-risk-ink shadow-sm ring-1 ring-risk/10 transition hover:ring-risk/30"
                  >
                    <item.Icon weight="fill" className="size-3 text-risk" />
                    {item.title}
                  </button>
                </Stagger>
              ))}
            </div>
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}

/** Project File — 3D case-file hero (step 01). */
function ProjectFileCard({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      className="relative flex w-full items-center justify-center overflow-hidden rounded-[26px] bg-transparent"
      onClick={(e) => e.stopPropagation()}
      animate={reduce ? undefined : { y: [0, -5, 0] }}
      transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <img
        src={projectFile3d}
        alt="Project file — one official file on the Central Platform · CESS-2025-000123"
        className="block h-auto w-full select-none object-contain drop-shadow-[0_22px_40px_rgba(7,20,51,0.22)]"
        draggable={false}
      />

      {/* Soft pulse over the Project ID tile — draws the eye without a second card */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-[10.5%] top-[43%] z-10 h-[13.5%] w-[37%] rounded-[16px] ring-[2.5px] ring-teal/70"
        initial={reduce ? false : { opacity: 0 }}
        animate={
          reduce
            ? { opacity: 0.75 }
            : {
                opacity: [0.55, 1, 0.55],
                boxShadow: [
                  "0 0 0 0 rgba(20,196,212,0)",
                  "0 0 22px 6px rgba(20,196,212,0.4)",
                  "0 0 0 0 rgba(20,196,212,0)",
                ],
              }
        }
        transition={reduce ? { duration: 0.3 } : { duration: 2.1, repeat: Infinity, ease: "easeInOut", delay: 0.25 }}
      />
    </motion.div>
  );
}

const DESK_CASE_ART: Record<number, { src: string; alt: string }> = {
  [B.assign]: {
    src: assessAssign3d,
    alt: "Assigned officer — R. Kumar, Labour Inspector, East Zone, Yelahanka, Bengaluru Urban",
  },
  [B.assess]: {
    src: assessAssess3d,
    alt: "Field assessment — on-site survey, GPS capture and CESS estimation",
  },
  [B.estimate]: {
    src: assessEstimate3d,
    alt: "Assessment case file — Estimation · Verified quantities on the record",
  },
  [B.demand]: {
    src: assessDemand3d,
    alt: "Assessment case file — Demand notice · Formal notice on file",
  },
  [B.status]: {
    src: assessStatus3d,
    alt: "Assessment case file — Status · Pending work, payment, remittance and matching",
  },
};

/** Assignment · Assessment · Estimation · Demand · Status — 3D desk cards. */
function DeskCaseCard({
  stage,
  index,
  reduce,
}: {
  stage: Stage;
  index: number;
  reduce: boolean;
}) {
  const art = DESK_CASE_ART[index] ?? DESK_CASE_ART[B.assign];

  return (
    <motion.div
      className="relative flex w-full items-center justify-center overflow-hidden rounded-[26px] bg-transparent"
      onClick={(e) => e.stopPropagation()}
      animate={reduce ? undefined : { y: [0, -5, 0] }}
      transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <img
        src={art.src}
        alt={art.alt}
        className="block h-auto max-h-[min(52vh,420px)] w-full select-none object-contain drop-shadow-[0_22px_40px_rgba(7,20,51,0.22)]"
        draggable={false}
      />
      <span className="sr-only">
        {stage.label}. {stage.hint}.
      </span>
    </motion.div>
  );
}
