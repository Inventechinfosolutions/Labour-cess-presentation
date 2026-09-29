import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  Bank,
  Calculator,
  ChartLineUp,
  Check,
  Files,
  Lightning,
  LinkBreak,
  Plugs,
  Receipt,
  Scales,
  Stack,
  TreeStructure,
  User,
  Wallet,
} from "@/lib/icons";
import { Hold, KaMark, LiveBadge, Reveal, SceneHead } from "@/components/SlideKit";
import { HEX } from "@/lib/palette";
import { cn } from "@/lib/utils";
import problemStageBg from "@/assets/problem-stage-bg.png";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Compact orbit stage (same language as day-to-day CoreScene) */
const VB = 1000;
const CX = 500;
const CY = 500;
const HUB_R = 96;
const ORBIT_R = 278;
const NODE_W = 114;
const NODE_H = 72;

function polar(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function curvePath(angleDeg: number) {
  const inner = polar(angleDeg, HUB_R + 6);
  const outer = polar(angleDeg, ORBIT_R - 40);
  const mid = polar(angleDeg + 8, (HUB_R + ORBIT_R) / 2);
  return `M ${inner.x} ${inner.y} Q ${mid.x} ${mid.y} ${outer.x} ${outer.y}`;
}

/** Legacy gate thresholds — scene is static (deck beats: 1); content always fully lit. */
const B = {
  open: 0,
  foundations: 1,
  demand: 2,
  payment: 3,
  collection: 4,
  remitRecon: 5,
  chain: 6,
  external: 7,
  intel: 8,
} as const;

/** Always render the complete money-trail view (no Space beats). */
const FULL = B.intel;

const FOUNDATIONS: { label: string; detail: string; scene: string; color: string; angle: number; Icon: CessIcon }[] = [
  { label: "Smart Middleware", detail: "Match and validation · process into one path", scene: "Scene 1", color: "#14c4d4", angle: -135, Icon: TreeStructure },
  { label: "One project file", detail: "Central Platform holds the official Board file", scene: "Scene 1", color: "#5b9dff", angle: -45, Icon: Files },
  { label: "Assignment", detail: "Officer assigned on that project file", scene: "Scene 2", color: "#a78bfa", angle: 45, Icon: User },
  { label: "Assessment · Estimation", detail: "Work stages · CESS amount on that file", scene: "Scene 2", color: "#f0c14a", angle: 135, Icon: Calculator },
];

const FINANCE: {
  id: string;
  at: number;
  label: string;
  question: string;
  color: string;
  angle: number;
  Icon: CessIcon;
  abc: string;
}[] = [
  {
    id: "demand",
    at: B.demand,
    label: "Demand",
    question: "What CESS is expected?",
    color: HEX.goldDeep,
    angle: -128,
    Icon: Receipt,
    abc: "Demand ₹18.4 L · ABC Commercial Complex",
  },
  {
    id: "payment",
    at: B.payment,
    label: "Payment",
    question: "What has been paid?",
    color: HEX.teal,
    angle: -77,
    Icon: Wallet,
    abc: "Part-payment ₹12.1 L recorded",
  },
  {
    id: "collection",
    at: B.collection,
    label: "Collection",
    question: "What has the department received?",
    color: HEX.navy,
    angle: -26,
    Icon: Bank,
    abc: "Collected ₹12.1 L · balance pending",
  },
  {
    id: "remittance",
    at: B.remitRecon,
    label: "Remittance",
    question: "What has been remitted onward?",
    color: HEX.port4,
    angle: 26,
    Icon: Lightning,
    abc: "Remittance overdue · interest risk accruing",
  },
  {
    id: "recon",
    at: B.remitRecon,
    label: "Reconciliation",
    question: "What actually reconciles?",
    color: HEX.ok,
    angle: 77,
    Icon: Scales,
    abc: "DCB gap ₹6.3 L · needs review",
  },
  {
    id: "external",
    at: B.external,
    label: "External systems",
    question: "Which systems feed this project?",
    color: HEX.port1,
    angle: 128,
    Icon: Plugs,
    abc: "KSK · e-Proc · Khajane · portal / LCDRS",
  },
  {
    id: "intel",
    at: B.intel,
    label: "CESS intelligence",
    question: "What decisions does this support?",
    color: HEX.port5,
    angle: 180,
    Icon: ChartLineUp,
    abc: "Territory · project · early warning",
  },
];

const POSITIONS: { label: string; value: string; tone: "ok" | "warn" | "risk" | "info" }[] = [
  { label: "Demand", value: "₹18.4 L", tone: "info" },
  { label: "Collection", value: "₹12.1 L", tone: "ok" },
  { label: "Remitted", value: "₹11.8 L", tone: "warn" },
  { label: "Overdue >30d", value: "₹6.3 L", tone: "risk" },
];

const SEQUENCE: { at: number; title: string; hint: string; Icon: CessIcon }[] = [
  { at: B.foundations, title: "Foundations ready", hint: "Middleware · one file · assign · assess · estimate", Icon: Stack },
  { at: B.demand, title: "Demand", hint: "What is expected from the project", Icon: Receipt },
  { at: B.payment, title: "Payment", hint: "What was paid on this project", Icon: Wallet },
  { at: B.collection, title: "Collection", hint: "What the department received", Icon: Bank },
  { at: B.remitRecon, title: "Remittance & matching", hint: "30-day remit · DCB · interest risk", Icon: Scales },
  { at: B.chain, title: "Full money trail", hint: "Live DCB · gaps become potential exceptions", Icon: LinkBreak },
  { at: B.external, title: "External systems", hint: "KSK · e-Proc · Khajane · LCDRS", Icon: Plugs },
  { at: B.intel, title: "CESS intelligence", hint: "From transactions to decision support", Icon: ChartLineUp },
];

function defaultLit(beat: number): string {
  if (beat >= B.intel) return "intel";
  if (beat >= B.external) return "external";
  if (beat >= B.chain) return "flow";
  if (beat >= B.remitRecon) return "remittance";
  if (beat >= B.collection) return "collection";
  if (beat >= B.payment) return "payment";
  if (beat >= B.demand) return "demand";
  return "demand";
}

export function CommandScene({ beat }: { beat: number }) {
  const [lit, setLit] = useState(() => defaultLit(beat));

  useEffect(() => {
    setLit(defaultLit(beat));
  }, [beat]);

  const pick = (id: string) => {
    if (beat < B.demand) return;
    setLit((cur) => (cur === id ? defaultLit(beat) : id));
  };

  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr] gap-2">
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
              radial-gradient(ellipse 80% 60% at 70% 35%, rgba(20,196,212,0.14) 0%, transparent 65%),
              radial-gradient(ellipse 70% 50% at 20% 80%, rgba(11,31,74,0.05) 0%, transparent 60%)
            `,
          }}
        />

        <div className="relative z-10 grid h-full min-h-0 grid-rows-[auto_1fr] gap-2 p-2 sm:p-2.5">
          <SceneHead
            kicker="Demand · Payment · Remittance · Matching accounts · Linked systems"
            title="From construction to the CESS money trail"
          />

          <div className="grid min-h-0 grid-cols-[minmax(236px,0.86fr)_minmax(0,1.14fr)] gap-3">
            <Reveal beat={beat} at={0} className="h-full min-h-0">
              <StoryPanel beat={beat} />
            </Reveal>
            <Reveal beat={beat} at={0} className="h-full min-h-0">
              <FlowPane beat={beat} lit={lit} onLit={pick} />
            </Reveal>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryPanel({ beat }: { beat: number }) {
  const reduce = useReducedMotion();
  const live = SEQUENCE.filter((b) => beat >= b.at).length;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[28px] border border-navy/10 bg-white/92 shadow-[0_16px_40px_rgba(7,20,51,0.08)] backdrop-blur-md">
      <header className="border-b border-border/80 bg-white/70 px-4 py-2.5">
        <div className="text-[10px] font-extrabold tracking-[0.16em] text-primary uppercase">Complete lifecycle</div>
        <h3 className="font-display mt-0.5 text-[16px] font-bold leading-tight text-navy">Construction to CESS intelligence</h3>
        <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
          One project: foundations → money trail → linked systems → intelligence.
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-auto px-3 py-2.5">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="text-[10px] font-extrabold tracking-[0.12em] text-primary uppercase">Sequence</div>
          <motion.span
            key={live}
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: reduce ? 0 : 0.28 }}
            className="text-[9px] font-extrabold tracking-wide text-ok-ink uppercase"
          >
            {live}/8 live
          </motion.span>
        </div>
        <ul className="space-y-1">
          {SEQUENCE.map((item, i) => {
            const on = beat >= item.at;
            const next = !on && beat === item.at - 1;
            return (
              <motion.li
                key={item.title}
                initial={false}
                animate={
                  on
                    ? { opacity: 1, x: 0, scale: 1, y: reduce ? 0 : [0, -1.5, 0] }
                    : next
                      ? { opacity: 0.92, x: 0, scale: 1, y: 0 }
                      : { opacity: 0.45, x: reduce ? 0 : -4, scale: 0.98, y: 0 }
                }
                transition={
                  on && !reduce
                    ? {
                        opacity: { duration: 0.35, ease: EASE },
                        x: { duration: 0.35, ease: EASE },
                        scale: { duration: 0.35, ease: EASE },
                        y: { duration: 3.2 + i * 0.2, repeat: Infinity, ease: "easeInOut" },
                      }
                    : { duration: reduce ? 0 : 0.3, ease: EASE }
                }
                className={cn(
                  "flex items-center gap-2 rounded-xl border py-1.5 pr-2 pl-1.5",
                  on ? "border-primary/30 bg-accent/50" : next ? "border-primary/40 bg-accent/40" : "border-border bg-mist/30",
                )}
              >
                <motion.span
                  className={cn("grid size-6 place-items-center rounded-md", on ? "bg-navy text-teal-bright" : "bg-mist text-primary")}
                  animate={on && !reduce ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  transition={on && !reduce ? { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 } : { duration: 0 }}
                >
                  <item.Icon weight={on ? "fill" : "duotone"} className="size-3.5" />
                </motion.span>
                <span className="min-w-0 flex-1">
                  <b className="block text-[11px] leading-tight text-navy">{item.title}</b>
                  <span className="line-clamp-1 text-[10px] text-muted-foreground">{next ? "Next · Space" : item.hint}</span>
                </span>
                <span className="font-mono text-[9px] font-extrabold text-primary">{String(i + 1).padStart(2, "0")}</span>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <footer className="border-t border-border bg-navy px-3 py-2.5 text-[11px] leading-snug text-white">
        <AnimatePresence mode="wait">
          <motion.p
            key={
              beat >= B.intel
                ? "intel"
                : beat >= B.external
                  ? "ext"
                  : beat >= B.chain
                    ? "chain"
                    : beat >= B.demand
                      ? "finance"
                      : beat >= B.foundations
                        ? "found"
                        : "open"
            }
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -4 }}
            transition={{ duration: reduce ? 0 : 0.28 }}
          >
            {beat >= B.intel ? (
              <>
                <span className="font-bold">Transactions → CESS intelligence.</span>{" "}
                <span className="text-white/70">Slice by territory, project and finance status.</span>
              </>
            ) : beat >= B.external ? (
              <>
                <span className="font-bold">Linked systems feed the same project.</span>{" "}
                <span className="text-white/70">KSK · e-Proc · Khajane · portal / LCDRS.</span>
              </>
            ) : beat >= B.chain ? (
              <>
                <span className="font-bold">Gaps in the trail may become potential exceptions.</span>{" "}
                <span className="text-white/70">Demand · collected · remitted · matched.</span>
              </>
            ) : beat >= B.demand ? (
              <>
                <span className="font-bold">Build the money trail on this project.</span>{" "}
                <span className="text-white/70">One step at a time — Space to continue.</span>
              </>
            ) : (
              <>
                <span className="font-bold">{beat === 0 ? "Start with what the project already holds." : "Foundations are ready."}</span>{" "}
                <span className="text-white/70">{beat === 0 ? "Space — then attach demand through reconciliation." : "Next — attach the CESS money trail."}</span>
              </>
            )}
          </motion.p>
        </AnimatePresence>
      </footer>
    </div>
  );
}

function FlowPane({
  beat,
  lit,
  onLit,
}: {
  beat: number;
  lit: string;
  onLit: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const financeStage = beat >= B.demand;
  const chainOn = beat >= B.chain && beat < B.external;
  const stageKey = beat <= B.foundations ? "found" : "finance";

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[28px] border border-navy/10 bg-white/55 shadow-[0_16px_40px_rgba(7,20,51,0.1)] backdrop-blur-[2px]">
      <div className="relative z-20 flex items-center justify-between gap-2 border-b border-navy/10 bg-navy/95 px-4 py-2.5 text-white backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <KaMark className="size-7 text-[9px]" />
          <AnimatePresence mode="wait">
            <motion.div
              key={
                beat >= B.intel
                  ? "intel"
                  : beat >= B.external
                    ? "ext"
                    : chainOn
                      ? "chain"
                      : financeStage
                        ? "finance"
                        : "found"
              }
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: 4 }}
              transition={{ duration: reduce ? 0 : 0.28 }}
            >
              <div className="text-[9px] font-extrabold tracking-[0.16em] text-teal-bright uppercase">
                {beat >= B.intel
                  ? "CESS intelligence"
                  : beat >= B.external
                    ? "External systems"
                    : chainOn
                      ? "Full money trail"
                      : financeStage
                        ? "Building the money trail"
                        : "Project foundations"}
              </div>
              <div className="font-display text-[14px] font-bold leading-tight">
                {beat >= B.intel
                  ? "From transactions to decision support"
                  : beat >= B.external
                    ? "KSK · linked systems · portal / LCDRS"
                    : chainOn
                      ? "Demand → … → Reconciliation"
                      : financeStage
                        ? "Attach money details to the project"
                        : "Ready to connect CESS finance"}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        {chainOn ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.9 }}
            animate={reduce ? { opacity: 1, scale: 1 } : { opacity: 1, scale: [1, 1.04, 1] }}
            transition={reduce ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <LiveBadge>
              <Scales weight="fill" className="size-3" />
              Live
            </LiveBadge>
          </motion.div>
        ) : null}
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={stageKey}
            className="relative z-10 h-full"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: reduce ? 0 : 0.32, ease: EASE }}
          >
            {beat <= B.foundations ? (
              <FoundationsOrbit hot={beat >= B.foundations} reduce={!!reduce} />
            ) : (
              <MoneyTrailOrbit beat={beat} lit={lit} onLit={onLit} chainOn={chainOn} reduce={!!reduce} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function OrbitRings({ active, accent, reduce }: { active: boolean; accent: string; reduce: boolean }) {
  return (
    <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" viewBox={`0 0 ${VB} ${VB}`} preserveAspectRatio="xMidYMid meet" aria-hidden>
      {[170, 255, 340].map((r, i) => (
        <motion.circle
          key={r}
          cx={CX}
          cy={CY}
          r={r}
          fill="none"
          stroke="rgba(11,31,74,0.14)"
          strokeWidth="1.2"
          strokeDasharray="4 10"
          initial={false}
          animate={reduce ? { rotate: 0 } : { rotate: i % 2 === 0 ? 360 : -360 }}
          transition={reduce ? { duration: 0 } : { duration: 72 + i * 22, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />
      ))}
      {!reduce && active ? (
        <motion.circle
          cx={CX}
          cy={CY}
          r={360}
          fill="none"
          stroke={accent}
          strokeWidth="1.5"
          strokeDasharray="2 26"
          animate={{ rotate: 360 }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />
      ) : null}
    </svg>
  );
}

function FoundationsOrbit({ hot, reduce }: { hot: boolean; reduce: boolean }) {
  return (
    <div className="relative h-full min-h-0">
      <OrbitRings active={hot} accent="rgba(14,154,167,0.4)" reduce={reduce} />

      <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" viewBox={`0 0 ${VB} ${VB}`} preserveAspectRatio="xMidYMid meet" aria-hidden>
        {FOUNDATIONS.map((item, i) => {
          const d = curvePath(item.angle);
          return (
            <g key={item.label}>
              <motion.path
                d={d}
                fill="none"
                stroke={hot ? item.color : "rgba(11,31,74,0.12)"}
                strokeWidth={hot ? 2.2 : 1.4}
                strokeLinecap="round"
                initial={false}
                animate={{
                  pathLength: hot ? 1 : 0.15,
                  opacity: hot ? 0.85 : 0.25,
                }}
                transition={{ duration: reduce ? 0 : 0.55, delay: reduce ? 0 : i * 0.08, ease: EASE }}
              />
              {hot && !reduce ? (
                <circle r={3.2} fill={item.color} filter={`drop-shadow(0 0 4px ${item.color})`}>
                  <animateMotion dur={`${2.8 + i * 0.25}s`} repeatCount="indefinite" path={d} />
                </circle>
              ) : null}
            </g>
          );
        })}
      </svg>

      <div className="absolute inset-0 z-10">
        <div
          className="absolute z-20"
          style={{
            left: `${(CX / VB) * 100}%`,
            top: `${(CY / VB) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <OrbitHub
            reduce={reduce}
            live={hot}
            title="Central Platform"
            sub={hot ? "Foundations ready" : "Awaiting path"}
            Icon={Stack}
            tone="teal"
          />
        </div>

        {FOUNDATIONS.map((item, i) => {
          const pos = polar(item.angle, ORBIT_R);
          return (
            <motion.div
              key={item.label}
              className="absolute z-30"
              style={{
                left: `${(pos.x / VB) * 100}%`,
                top: `${(pos.y / VB) * 100}%`,
                width: NODE_W,
                marginLeft: -NODE_W / 2,
                marginTop: -NODE_H / 2,
              }}
              initial={false}
              animate={
                hot
                  ? { opacity: 1, scale: 1, y: reduce ? 0 : [0, -3, 0] }
                  : { opacity: 0.5, scale: 0.92, y: 0 }
              }
              transition={
                hot && !reduce
                  ? {
                      opacity: { duration: 0.4, delay: i * 0.07 },
                      scale: { duration: 0.4, delay: i * 0.07 },
                      y: { duration: 3.5 + i * 0.18, repeat: Infinity, ease: "easeInOut" },
                    }
                  : { duration: reduce ? 0 : 0.35 }
              }
            >
              <OrbitStamp
                label={item.label}
                detail={item.detail}
                chip={item.scene}
                color={item.color}
                Icon={item.Icon}
                on={hot}
                hot={hot}
              />
            </motion.div>
          );
        })}
      </div>

      <p className="absolute bottom-2 left-2 right-2 z-40 rounded-xl border border-navy/10 bg-white/85 px-3 py-1.5 text-center text-[10px] leading-snug text-navy backdrop-blur-sm">
        Smart Middleware → one project file → assignment · assessment · estimation
      </p>
    </div>
  );
}

function MoneyTrailOrbit({
  beat,
  lit,
  onLit,
  chainOn,
  reduce,
}: {
  beat: number;
  lit: string;
  onLit: (id: string) => void;
  chainOn: boolean;
  reduce: boolean;
}) {
  const liveCount = FINANCE.filter((s) => beat >= s.at).length;

  return (
    <div className="relative h-full min-h-0">
      <OrbitRings active={liveCount > 0} accent={chainOn ? "rgba(251,113,133,0.45)" : "rgba(14,154,167,0.4)"} reduce={reduce} />

      <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" viewBox={`0 0 ${VB} ${VB}`} preserveAspectRatio="xMidYMid meet" aria-hidden>
        {FINANCE.map((step, i) => {
          const on = beat >= step.at;
          const hot = on && (lit === step.id || lit === "flow");
          const d = curvePath(step.angle);
          return (
            <g key={step.id}>
              <motion.path
                d={d}
                fill="none"
                stroke={on ? step.color : "rgba(11,31,74,0.12)"}
                strokeWidth={hot ? 2.4 : 1.5}
                strokeLinecap="round"
                initial={false}
                animate={{
                  pathLength: on ? 1 : 0,
                  opacity: on ? (hot ? 0.95 : 0.55) : 0.2,
                }}
                transition={{ duration: reduce ? 0 : 0.55, ease: EASE }}
              />
              {on && !reduce ? (
                <circle r={3.2} fill={step.color} filter={`drop-shadow(0 0 4px ${step.color})`}>
                  <animateMotion dur={`${2.9 + i * 0.2}s`} repeatCount="indefinite" path={d} />
                </circle>
              ) : null}
            </g>
          );
        })}
      </svg>

      <div className="absolute inset-0 z-10">
        <div
          className="absolute z-20"
          style={{
            left: `${(CX / VB) * 100}%`,
            top: `${(CY / VB) * 100}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <OrbitHub
            reduce={reduce}
            live={liveCount > 0}
            title="Money trail"
            sub={
              beat >= B.intel
                ? "Full lifecycle live"
                : chainOn
                  ? "Full DCB live"
                  : `${liveCount}/7 steps`
            }
            Icon={Scales}
            tone={chainOn ? "risk" : "teal"}
          />
        </div>

        {FINANCE.map((step, i) => {
          const on = beat >= step.at;
          const hot = on && (lit === step.id || lit === "flow");
          const pos = polar(step.angle, ORBIT_R);
          return (
            <motion.div
              key={step.id}
              className="absolute z-30"
              style={{
                left: `${(pos.x / VB) * 100}%`,
                top: `${(pos.y / VB) * 100}%`,
                width: NODE_W,
                marginLeft: -NODE_W / 2,
                marginTop: -NODE_H / 2,
              }}
              initial={false}
              animate={
                on
                  ? { opacity: 1, scale: 1, y: reduce ? 0 : [0, -3, 0] }
                  : { opacity: 0.42, scale: 0.9, y: 0 }
              }
              transition={
                on && !reduce
                  ? {
                      opacity: { duration: 0.4 },
                      scale: { duration: 0.4 },
                      y: { duration: 3.4 + i * 0.16, repeat: Infinity, ease: "easeInOut" },
                    }
                  : { duration: reduce ? 0 : 0.3 }
              }
            >
              <button
                type="button"
                disabled={!on}
                onClick={(e) => {
                  e.stopPropagation();
                  if (on) onLit(step.id);
                }}
                className="w-full text-left"
              >
                <OrbitStamp
                  label={step.label}
                  detail={step.abc}
                  chip={on ? step.question : "Pending"}
                  color={step.color}
                  Icon={step.Icon}
                  on={on}
                  hot={hot}
                />
              </button>
            </motion.div>
          );
        })}
      </div>

      {chainOn ? (
        <div className="absolute right-2 bottom-2 left-2 z-40 space-y-1.5">
          <Hold className="grid grid-cols-4 gap-1">
            {POSITIONS.map((pos, i) => (
              <motion.div
                key={pos.label}
                initial={reduce ? false : { opacity: 0, y: 8, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : i * 0.05, ease: EASE }}
                className={cn(
                  "rounded-lg px-1.5 py-1.5 text-white",
                  pos.tone === "ok" && "bg-ok",
                  pos.tone === "warn" && "bg-gold-deep",
                  pos.tone === "risk" && "bg-risk",
                  pos.tone === "info" && "bg-navy",
                )}
              >
                <span className="block text-[8px] font-extrabold tracking-wide text-white/70 uppercase">{pos.label}</span>
                <b className="font-display block text-[12px] leading-none">{pos.value}</b>
              </motion.div>
            ))}
          </Hold>
          <p className="rounded-lg border border-risk/30 bg-risk-soft/95 px-2.5 py-1.5 text-[10px] leading-snug text-risk-ink backdrop-blur-sm">
            Mismatch or remittance beyond 30 days may become a potential exception.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function OrbitHub({
  reduce,
  live,
  title,
  sub,
  Icon,
  tone,
}: {
  reduce: boolean;
  live: boolean;
  title: string;
  sub: string;
  Icon: CessIcon;
  tone: "teal" | "risk";
}) {
  return (
    <Hold>
      <motion.div
        className="relative grid size-[118px] place-items-center rounded-full text-center sm:size-[132px]"
        initial={false}
        animate={{
          scale: live ? 1 : 0.94,
          boxShadow: live
            ? tone === "risk"
              ? "0 0 0 8px rgba(251,113,133,0.12), 0 0 36px rgba(251,113,133,0.28)"
              : "0 0 0 8px rgba(20,196,212,0.12), 0 0 36px rgba(20,196,212,0.28)"
            : "0 0 0 6px rgba(148,163,184,0.08)",
        }}
        transition={{ duration: reduce ? 0 : 0.45 }}
      >
        {!reduce && live ? (
          <motion.span
            className={cn(
              "pointer-events-none absolute inset-[-8px] rounded-full border-2",
              tone === "risk" ? "border-rose-400/55" : "border-emerald-400/45",
            )}
            animate={{ opacity: [0.35, 0.85, 0.35], scale: [1, 1.04, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
        <span className="relative flex size-full flex-col items-center justify-center rounded-full border border-white/15 bg-linear-to-b from-[#12305f] to-[#071433] px-2">
          <span className="mb-0.5 grid size-7 place-items-center rounded-full bg-teal-bright/15 text-teal-bright">
            <Icon weight="fill" className="size-3.5" />
          </span>
          <KaMark className="size-6" />
          <b className="font-display mt-0.5 text-[11px] leading-tight font-bold text-white">{title}</b>
          <span className="mt-0.5 text-[8px] text-white/55">{sub}</span>
        </span>
      </motion.div>
    </Hold>
  );
}

function OrbitStamp({
  label,
  detail,
  chip,
  color,
  Icon,
  on,
  hot,
}: {
  label: string;
  detail: string;
  chip: string;
  color: string;
  Icon: CessIcon;
  on: boolean;
  hot: boolean;
}) {
  return (
    <div
      className={cn(
        "relative w-full rounded-2xl border px-2 pt-3.5 pb-1.5 shadow-sm transition",
        on
          ? hot
            ? "border-navy/20 bg-white/95 shadow-[0_12px_28px_rgba(7,20,51,0.14)]"
            : "border-navy/10 bg-white/90"
          : "border-dashed border-navy/15 bg-white/45",
      )}
      style={hot && on ? { boxShadow: `0 0 0 1px ${color}66, 0 12px 28px rgba(7,20,51,0.14)` } : undefined}
    >
      <span
        className="absolute -top-2.5 left-1/2 grid size-6 -translate-x-1/2 place-items-center rounded-full ring-2 ring-white shadow-sm"
        style={{ background: on ? color : HEX.mist, color: on ? "#04101f" : HEX.muted }}
      >
        <Icon weight="fill" className="size-3" />
      </span>
      {on ? (
        <span className="absolute top-1.5 right-1.5 grid size-3.5 place-items-center rounded-full bg-ok-soft text-ok-ink">
          <Check weight="bold" className="size-2" />
        </span>
      ) : null}
      <b className="block text-center text-[10px] leading-tight text-navy">{label}</b>
      <span className="mt-0.5 block text-center text-[8px] font-extrabold tracking-wide text-primary uppercase">{chip}</span>
      <span className="mt-0.5 line-clamp-2 text-center text-[8px] leading-snug text-muted-foreground">{detail}</span>
    </div>
  );
}
