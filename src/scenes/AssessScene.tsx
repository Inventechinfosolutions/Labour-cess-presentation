import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowRight,
  Buildings,
  Calculator,
  CalendarBlank,
  CheckCircle,
  Clock,
  CornersOut,
  Eye,
  FileText,
  FolderSimple,
  HardHat,
  LinkBreak,
  MapPin,
  Receipt,
  Ruler,
  Scan,
  SealCheck,
  User,
  UsersThree,
  WarningCircle,
  X,
} from "@/lib/icons";
import abcSite from "@/assets/abc-site.png";
import assessAssign3d from "@/assets/assess-assign-officer-3d.png";
import assessAssess3d from "@/assets/assess-field-3d.png";
import assessDemandPoster from "@/assets/assess-demand-poster.png";
import assessEstimatePoster from "@/assets/assess-estimation-poster.png";
import assessStatus3d from "@/assets/assess-status-board.png";
import assessStageBg from "@/assets/assess-stage-bg.jpg";
import projectFolder from "@/assets/project-file-folder.jpg";
import icon3dDocument from "@/assets/icon3d-document.jpg";
import icon3dPhoto from "@/assets/icon3d-photo.jpg";
import icon3dPin from "@/assets/icon3d-pin.jpg";
import icon3dRuler from "@/assets/icon3d-ruler.jpg";
import { AssignedOfficerCard } from "@/components/AssignedOfficerCard";
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
  sub: string;
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
    sub: "Project file opened",
    label: "Project registration",
    short: "Registration",
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
    sub: "Assigned to officer",
    label: "Assignment to officer",
    short: "Assignment",
    hint: "Territory officer takes ownership",
    Icon: UsersThree,
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
    sub: "On the same project file",
    label: "Field assessment",
    short: "Field assessment",
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
    sub: "Verified quantities",
    label: "Estimation",
    short: "Estimation",
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
    sub: "Notice issued",
    label: "Demand notice",
    short: "Demand Notice",
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
    sub: "Status review",
    label: "Status monitoring",
    short: "Monitoring",
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
    title: "Project Registration",
    support: "One official project file on the Central Platform. Assessment starts here.",
  },
  {
    kicker: "Assessment desk",
    title: "Assignment to Officer",
    support: "The project is allotted to the officer for that territory.",
  },
  {
    kicker: "Assessment desk",
    title: "Field Assessment",
    support: "The Labour Inspector inspects the site on the same project file.",
  },
  {
    kicker: "Assessment desk",
    title: "Estimation",
    support: "The cost of construction is valued from verified quantities.",
  },
  {
    kicker: "Assessment desk",
    title: "Demand Notice Management",
    support: "A formal demand notice is issued on the project file.",
  },
  {
    kicker: "Assessment desk",
    title: "Status Monitoring",
    support: "Pending work, payment, remittance and matching are monitored by territory.",
  },
];

const GOLD_GLOW = "rgba(240,193,74,0.45)";

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
          src={assessStageBg}
          alt=""
          aria-hidden
          draggable={false}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover object-[center_60%] select-none"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: `
              radial-gradient(ellipse 34% 16% at 50% 8%, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.45) 45%, transparent 80%),
              linear-gradient(180deg, rgba(247,250,253,0.22) 0%, rgba(240,246,252,0.1) 45%, rgba(236,244,251,0.2) 100%),
              radial-gradient(ellipse 55% 60% at 32% 48%, ${GOLD_GLOW} 0%, transparent 65%),
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

          <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(280px,1fr)] gap-3">
          <div className="grid min-h-0 grid-cols-[34%_minmax(0,1fr)] gap-1">
            <WorkflowRail bi={bi} onBeat={onBeat} reduce={!!reduce} />
            <SiteHub reduce={!!reduce} glow={GOLD_GLOW} />
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
                    style={{ background: `radial-gradient(ellipse at center, ${GOLD_GLOW}, transparent 70%)` }}
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

      <div className="flex flex-col gap-1.5">
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

/** Left workflow — six journey steps on a dashed wave path. */
const RAIL_ICONS: CessIcon[] = [Buildings, UsersThree, HardHat, Calculator, FileText, Eye];
const RAIL_COLORS = [
  { main: "#2f7df0", deep: "#1f52c4", soft: "#e3eeff" },
  { main: "#7c5cf0", deep: "#5537c9", soft: "#eee8ff" },
  { main: "#e8a317", deep: "#a86e04", soft: "#fff1d2" },
  { main: "#f07a3a", deep: "#c4541b", soft: "#ffe8dc" },
  { main: "#0ea5a5", deep: "#0a7c80", soft: "#daf5f4" },
  { main: "#16a34a", deep: "#0e7a38", soft: "#dff5e7" },
];
const RAIL_CIRCLE = 52;
const RAIL_PAD = 4;
const ORBIT_RX = 64;
/** Vertical radius as a share of rail height; end steps sit at 95% of it. */
const ORBIT_RY_SHARE = 5 / 12 / 0.95;
const RAIL_OFFSETS = Array.from({ length: 6 }, (_, i) => {
  const t = ((i - 2.5) / 2.5) * 0.95;
  return ORBIT_RX * (1 - Math.sqrt(1 - t * t));
});

function WorkflowRail({
  bi,
  onBeat,
  reduce,
}: {
  bi: number;
  onBeat: (n: number) => void;
  reduce: boolean;
}) {
  const [h, setH] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setH(e.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const mid = h / 2;
  const ry = h * ORBIT_RY_SHARE;
  const cx = RAIL_PAD + RAIL_CIRCLE / 2 + ORBIT_RX;
  const node = (i: number) => ({ x: RAIL_PAD + RAIL_OFFSETS[i] + RAIL_CIRCLE / 2, y: ((i + 0.5) * h) / 6 });
  const orbit = `M ${cx} ${mid - ry} A ${ORBIT_RX} ${ry} 0 0 0 ${cx} ${mid + ry}`;
  const outer = `M ${cx} ${mid - ry - 18} A ${ORBIT_RX + 18} ${ry + 18} 0 0 0 ${cx} ${mid + ry + 18}`;
  const n0 = node(0);
  const na = node(bi);
  const progress = `M ${n0.x} ${n0.y} A ${ORBIT_RX} ${ry} 0 0 0 ${na.x} ${na.y}`;

  return (
    <div className="relative min-h-0 py-[2%]">
      <div ref={boxRef} className="relative grid h-full grid-rows-6">
        {h > 0 ? (
          <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" viewBox={`0 0 ${cx + 60} ${h}`} preserveAspectRatio="xMinYMin meet" style={{ width: cx + 60 }} aria-hidden>
            <defs>
              <linearGradient id="orbit-progress" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b8cf5" />
                <stop offset="100%" stopColor="#1f52c4" />
              </linearGradient>
            </defs>
            <path d={outer} fill="none" stroke="#ffffff" strokeOpacity="0.85" strokeWidth="2" strokeLinecap="round" />
            <path d={orbit} fill="none" stroke="#1b3f7a" strokeOpacity="0.7" strokeWidth="2.6" strokeDasharray="7 7" strokeLinecap="round" />
            {bi > 0 ? (
              <motion.path
                key={bi}
                d={progress}
                fill="none"
                stroke="url(#orbit-progress)"
                strokeWidth="3.2"
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            ) : null}
            {!reduce ? (
              <g>
                <circle r="7" fill="#2f7df0" opacity="0.22">
                  <animateMotion dur="7s" repeatCount="indefinite" path={orbit} keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear" />
                </circle>
                <circle r="3.5" fill="#2f7df0">
                  <animateMotion dur="7s" repeatCount="indefinite" path={orbit} keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="linear" />
                </circle>
              </g>
            ) : null}
          </svg>
        ) : null}
        {STAGES.map((s, i) => {
          const active = bi === i;
          const done = bi > i;
          const Icon = RAIL_ICONS[i];
          const c = RAIL_COLORS[i];
          return (
            <motion.button
              key={s.id}
              type="button"
              title={s.label}
              onClick={(e) => {
                e.stopPropagation();
                onBeat(i);
              }}
              className="flex min-h-0 items-center text-left"
              style={{ paddingLeft: RAIL_PAD + RAIL_OFFSETS[i] }}
              initial={reduce ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduce ? 0 : 0.05 + i * 0.07, duration: 0.35 }}
              whileHover={reduce ? undefined : { x: 3 }}
            >
              <span className="relative z-10 shrink-0" style={{ width: RAIL_CIRCLE, height: RAIL_CIRCLE }}>
                {active && !reduce ? (
                  <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: `0 0 0 3px ${c.main}` }}
                    animate={{ scale: [1, 1.35], opacity: [0.6, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                ) : null}
                <span
                  className="grid size-full place-items-center rounded-full ring-[3px] ring-white transition"
                  style={
                    active
                      ? {
                          background: `linear-gradient(145deg, ${c.main} 0%, ${c.deep} 100%)`,
                          color: "#fff",
                          boxShadow: `0 10px 22px ${c.main}66, inset 0 2px 0 rgba(255,255,255,0.3)`,
                        }
                      : {
                          background: `linear-gradient(180deg, #ffffff 0%, ${c.soft} 100%)`,
                          color: c.deep,
                          boxShadow: "0 8px 18px rgba(7,20,51,0.14)",
                        }
                  }
                >
                  <Icon weight={active ? "fill" : "duotone"} className="size-6" />
                </span>
                {active ? (
                  <span
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2 text-[9px] leading-[15px] font-extrabold whitespace-nowrap text-white ring-2 ring-white"
                    style={{ background: c.deep, boxShadow: `0 3px 8px ${c.main}59` }}
                  >
                    {s.short}
                  </span>
                ) : null}
                {done ? (
                  <CheckCircle weight="fill" className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-white text-ok" />
                ) : null}
              </span>
              <span
                className="relative -ml-4 min-w-0 overflow-hidden rounded-2xl py-2.5 pr-4 pl-6 backdrop-blur-sm transition"
                style={{
                  background: `linear-gradient(100deg, ${c.soft} 0%, rgba(255,255,255,${active ? 0.95 : 0.82}) 100%)`,
                  boxShadow: active
                    ? `0 10px 22px ${c.main}33, inset 0 0 0 1.5px ${c.main}`
                    : `0 6px 16px rgba(7,20,51,0.08), inset 0 0 0 1px ${c.main}33`,
                }}
              >
                <b className="block text-[14px] leading-tight font-extrabold whitespace-nowrap text-[#12306a]">
                  <span style={{ color: c.deep }}>{String(i + 1).padStart(2, "0")}</span> {s.short}
                </b>
                <span className="mt-0.5 block text-[11px] leading-tight font-medium whitespace-nowrap text-[#3f5877]">{s.sub}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

const HUB_TILES: { src: string; label: string; pos: string }[] = [
  { src: icon3dDocument, label: "Documents", pos: "top-[16%] -left-[9%]" },
  { src: icon3dPin, label: "Site location", pos: "top-[16%] -right-[9%]" },
  { src: icon3dPhoto, label: "Site photos", pos: "bottom-[24%] -left-[7%]" },
  { src: icon3dRuler, label: "Measurements", pos: "bottom-[24%] -right-[7%]" },
];

/** Centre hub — intro note, site circle with floating evidence tiles and the Board file badge. */
function SiteHub({ reduce, glow }: { reduce: boolean; glow: string }) {
  return (
    <div className="relative min-h-0 [container-type:size]">
      <motion.div
        className="absolute top-[56%] left-1/2 z-10 aspect-square w-[min(80%,52cqh,330px)] -translate-x-1/2 -translate-y-1/2"
        initial={reduce ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45 }}
      >
        <div
          aria-hidden
          className="absolute -inset-[16%] rounded-full"
          style={{ background: `radial-gradient(circle, ${glow} 0%, rgba(125,211,252,0.35) 40%, transparent 68%)` }}
        />
        {!reduce ? (
          <motion.div
            aria-hidden
            className="absolute -inset-[5%] rounded-full ring-2 ring-white/80"
            animate={{ scale: [1, 1.04, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}

        <div className="relative h-full w-full overflow-hidden rounded-full bg-white shadow-[0_18px_44px_rgba(7,50,110,0.24)] ring-[7px] ring-white">
          <img src={abcSite} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-[center_30%]" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(180deg, rgba(247,250,253,0.05) 0%, transparent 45%, rgba(7,20,51,0.5) 100%)" }}
          />
        </div>

        {HUB_TILES.map((t, i) => (
          <motion.span
            key={t.label}
            title={t.label}
            className={cn(
              "absolute z-20 grid size-12 place-items-center overflow-hidden rounded-2xl bg-white shadow-[0_10px_22px_rgba(7,20,51,0.18)] ring-4 ring-white/70",
              t.pos,
            )}
            initial={reduce ? false : { opacity: 0, scale: 0.6 }}
            animate={reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -4, 0] }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    opacity: { duration: 0.35, delay: 0.35 + i * 0.1 },
                    scale: { duration: 0.35, delay: 0.35 + i * 0.1 },
                    y: { duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 },
                  }
            }
          >
            <img src={t.src} alt="" aria-hidden draggable={false} className="size-[88%] mix-blend-multiply select-none" />
          </motion.span>
        ))}

        <div className="absolute -bottom-[7%] left-1/2 z-20 w-max max-w-[96%] -translate-x-1/2">
          <div className="relative flex items-center gap-3 overflow-hidden rounded-full bg-[linear-gradient(180deg,#123a8f_0%,#0b2766_55%,#081d52_100%)] py-2.5 pr-8 pl-5 text-white shadow-[0_14px_28px_rgba(7,20,51,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] ring-1 ring-[#4d7fd6]/60">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-6 top-0 h-[45%] rounded-b-full bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent)]"
            />
            <FolderSimple weight="fill" className="relative size-10 shrink-0 text-[#f7c62f] drop-shadow-[0_2px_3px_rgba(0,0,0,0.35)]" />
            <span className="relative min-w-0 leading-tight">
              <span className="block text-[10px] font-extrabold tracking-[0.16em] text-[#7fd8f5] uppercase">Project ID</span>
              <b className="block truncate text-[17px] font-extrabold tracking-[0.01em]">CESS-2025-000123</b>
              <span className="block truncate text-[12.5px] font-medium text-white/90">ABC Commercial Complex</span>
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const FILE_FACTS: { label: string; value: string; note: string; Icon: CessIcon; grad: string; tint: string; key?: boolean }[] = [
  {
    label: "Project ID",
    value: "CESS-2025-000123",
    note: "ABC Commercial Complex",
    Icon: Buildings,
    grad: "linear-gradient(135deg,#1558c0,#3b8cf0)",
    tint: "#eaf2fe",
    key: true,
  },
  {
    label: "Project type",
    value: "Commercial · G+10",
    note: "High-rise Commercial Building",
    Icon: Scan,
    grad: "linear-gradient(135deg,#0891b2,#22c3dd)",
    tint: "#e6f7fb",
  },
  {
    label: "Project location",
    value: "East Zone · BBMP",
    note: "Bengaluru, Karnataka",
    Icon: MapPin,
    grad: "linear-gradient(135deg,#e06a06,#f7a23a)",
    tint: "#fdf0e6",
  },
  {
    label: "Approval status",
    value: "BBMP · Sanctioned",
    note: "Sanction Ref: BBMP/BNG/2025/12345",
    Icon: SealCheck,
    grad: "linear-gradient(135deg,#0f8a4c,#2fc57a)",
    tint: "#e7f6ee",
  },
  {
    label: "Total built-up area",
    value: "1,25,000 sq ft",
    note: "As per sanctioned plan",
    Icon: CornersOut,
    grad: "linear-gradient(135deg,#6b35d6,#9d6bff)",
    tint: "#f1ecfd",
  },
  {
    label: "Demand status",
    value: "Notice Generated",
    note: "DN-2025-00412 · 25 Sep 2026",
    Icon: CalendarBlank,
    grad: "linear-gradient(135deg,#3f3fc9,#6d73f2)",
    tint: "#eceefd",
  },
];

/** Project File — live case-file card (step 01). */
function ProjectFileCard({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      className="relative w-full overflow-hidden rounded-[26px] bg-white px-5 pt-4 pb-4 shadow-[0_24px_60px_rgba(0,55,120,0.2)] ring-1 ring-white"
      onClick={(e) => e.stopPropagation()}
      animate={reduce ? undefined : { y: [0, -4, 0] }}
      transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.img
        src={projectFolder}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute top-1.5 right-4 w-[32%] mix-blend-multiply select-none"
        initial={reduce ? false : { opacity: 0, y: -10, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.55, delay: 0.15 }}
      />

      <div className="relative pr-[40%]">
        <span className="inline-flex rounded-full bg-navy px-3 py-1 text-[10px] font-extrabold tracking-[0.1em] text-white uppercase">
          Step 01 · Platform
        </span>
        <p className="mt-2.5 text-[11px] font-extrabold tracking-[0.16em] text-[#6b849e] uppercase">Assessment case file</p>
        <h3 className="font-display text-[32px] leading-none font-black tracking-tight text-navy">Project file</h3>
        <motion.span
          className="mt-2 block h-1 rounded-full bg-teal"
          initial={reduce ? false : { width: 0 }}
          animate={{ width: 56 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        />
        <p className="mt-1.5 text-[13px] font-semibold text-teal">One official file on the Central Platform</p>
      </div>

      <div className="relative z-10 mt-4 grid grid-cols-2 gap-2.5">
        {FILE_FACTS.map((f, i) => (
          <motion.div
            key={f.label}
            className={cn(
              "relative flex min-w-0 items-center gap-3 rounded-2xl px-3 py-2.5 ring-1",
              f.key ? "ring-2 ring-teal/60" : "ring-navy/6",
            )}
            style={{ background: `linear-gradient(90deg, ${f.tint} 0%, #ffffff 100%)` }}
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={
              f.key && !reduce
                ? {
                    opacity: 1,
                    y: 0,
                    boxShadow: ["0 0 0 0 rgba(20,196,212,0)", "0 0 18px 4px rgba(20,196,212,0.35)", "0 0 0 0 rgba(20,196,212,0)"],
                  }
                : { opacity: 1, y: 0 }
            }
            transition={
              f.key && !reduce
                ? { opacity: { duration: 0.35, delay: 0.3 }, y: { duration: 0.35, delay: 0.3 }, boxShadow: { duration: 2.2, repeat: Infinity, delay: 1 } }
                : { duration: 0.35, delay: reduce ? 0 : 0.3 + i * 0.07 }
            }
          >
            <span
              className={cn("grid size-10 shrink-0 place-items-center rounded-full text-white", stamp3d)}
              style={{ background: f.grad }}
            >
              <f.Icon weight="fill" className="relative z-[1] size-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[9px] font-extrabold tracking-[0.12em] text-[#6b849e] uppercase">{f.label}</span>
              <b className="block truncate text-[14px] leading-tight text-navy">{f.value}</b>
              <span className="block truncate text-[10px] font-semibold text-[#6b849e]">{f.note}</span>
            </span>
          </motion.div>
        ))}
      </div>

      <div className="relative mt-3.5 flex items-center justify-between gap-3">
        <motion.span
          className="inline-flex items-center gap-2 rounded-full bg-ok-soft px-4 py-2 text-[12px] font-bold text-ok ring-1 ring-ok/15"
          initial={reduce ? false : { opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.85 }}
        >
          <CheckCircle weight="fill" className="size-5" />
          Ready for assignment
        </motion.span>
        <span className="inline-flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#1558c0,#1f7af0)] px-4 py-2 text-[12px] font-bold text-white shadow-[0_8px_18px_rgba(31,111,216,0.3)]">
          <FileText weight="fill" className="size-4" />
          View Project File
          <ArrowRight weight="bold" className="size-4" />
        </span>
      </div>
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
    src: assessEstimatePoster,
    alt: "Construction estimation — project information, on-site captured details, measurement capture, estimation details, CESS calculation and supporting documents",
  },
  [B.demand]: {
    src: assessDemandPoster,
    alt: "Demand notice management — notice counts by status, demand notice list, notice details with status timeline, and the demand notice lifecycle",
  },
  [B.status]: {
    src: assessStatus3d,
    alt: "Assessment case file — status of assessed, pending, delayed and action cases, with payment, remittance and reconciliation",
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
      {index === B.assign ? (
        <AssignedOfficerCard reduce={reduce} />
      ) : index === B.estimate || index === B.demand ? (
        <img
          src={art.src}
          alt={art.alt}
          className="block h-auto max-h-[min(62vh,520px)] w-full rounded-[18px] select-none object-contain shadow-[0_22px_40px_rgba(7,20,51,0.22)] ring-1 ring-white/70"
          draggable={false}
        />
      ) : (
        <img
          src={art.src}
          alt={art.alt}
          className="block h-auto max-h-[min(52vh,420px)] w-full select-none object-contain drop-shadow-[0_22px_40px_rgba(7,20,51,0.22)]"
          draggable={false}
        />
      )}
      <span className="sr-only">
        {stage.label}. {stage.hint}.
      </span>
    </motion.div>
  );
}
