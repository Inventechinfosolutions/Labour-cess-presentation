import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  Bell,
  ChartBar,
  Check,
  Files,
  Lightning,
  Megaphone,
  Plugs,
  Scales,
  Scroll,
  ShieldCheck,
  Stack,
  User,
  Wallet,
} from "@/lib/icons";
import { Hold, KaMark } from "@/components/SlideKit";
import { HEX } from "@/lib/palette";
import { cn } from "@/lib/utils";
import problemStageBg from "@/assets/problem-stage-bg.png";

const CLOSE_BEAT = 8;

const VB = 1000;
const CX = 500;
const CY = 478;
const HUB_R = 112;
const ORBIT_R = 328;
const NODE_W = 148;
const NODE_H = 86;

type OrbitNode = {
  id: string;
  at: number;
  title: string;
  chip: string;
  establishes: string;
  color: string;
  Icon: CessIcon;
  items: string[];
  metric: string;
  angle: number;
};

/** Eight orbit nodes — beats 1–5 zones, then audit · loop · pillars */
const NODES: OrbitNode[] = [
  {
    id: "gov",
    at: 1,
    title: "Governance & Control",
    chip: "Governance",
    establishes: "Who can see and act — roles, area and permissions.",
    color: "#5b9dff",
    Icon: Scales,
    angle: -90,
    metric: "capabilities",
    items: [
      "Role-based access",
      "Organisational hierarchy",
      "Territory responsibility",
      "Permissions by designation",
      "Territory maps (MIS & GIS)",
      "Department · territory · user",
    ],
  },
  {
    id: "doc",
    at: 2,
    title: "Document & Office Workflow",
    chip: "Workflow",
    establishes: "Documents, E-Office, appeals on the same file.",
    color: "#a78bfa",
    Icon: Files,
    angle: -45,
    metric: "capabilities",
    items: ["DMS", "E-Office", "Inward / Outward", "Appeals", "Grievances", "Exception resolution", "Meetings"],
  },
  {
    id: "fin",
    at: 3,
    title: "Finance & CESS Operations",
    chip: "Finance",
    establishes: "What is owed, collected and remitted.",
    color: "#f0c14a",
    Icon: Wallet,
    angle: 0,
    metric: "capabilities",
    items: ["Demand", "Collection", "Remittance (30 days)", "Interest on delay", "Reconciliation", "Accounts / DCB"],
  },
  {
    id: "comm",
    at: 4,
    title: "Communication & Compliance",
    chip: "Compliance",
    establishes: "Alert → Assign → Follow up → Close.",
    color: "#14c4d4",
    Icon: Megaphone,
    angle: 45,
    metric: "capabilities",
    items: ["Alerts & escalation", "Assignment", "Follow-up", "Resolution", "Appeals", "Grievances", "Decision support"],
  },
  {
    id: "ext",
    at: 5,
    title: "External Ecosystem",
    chip: "External",
    establishes: "Portal, remittance at source, KSK and system links.",
    color: "#34d399",
    Icon: Plugs,
    angle: 90,
    metric: "capabilities",
    items: ["Labour CESS Portal", "Cash counter / QR", "Remittance at source (LCDRS)", "KSK integration", "System links"],
  },
  {
    id: "audit",
    at: 6,
    title: "Audit Trail & Action",
    chip: "Audit trail",
    establishes: "Who did what — then Alert → Assign → Follow up → Close.",
    color: "#fb7185",
    Icon: Scroll,
    angle: 135,
    metric: "records",
    items: [
      "Who created or changed a project",
      "Who performed an assessment",
      "Who generated a demand",
      "Who recorded a payment",
      "Who uploaded a document",
      "What changed over time",
      "Alert → Assign → Follow up → Close",
    ],
  },
  {
    id: "loop",
    at: 7,
    title: "Complete Operating Loop",
    chip: "Full loop",
    establishes: "Capture through report — one connected departmental platform.",
    color: "#38bdf8",
    Icon: Stack,
    angle: 180,
    metric: "steps",
    items: [
      "Capture",
      "Validate",
      "Consolidate",
      "Assess",
      "Locate",
      "Map",
      "Monitor",
      "Detect",
      "Act",
      "Audit",
      "Report",
    ],
  },
  {
    id: "close",
    at: 8,
    title: "Closing Pillars",
    chip: "Pillars",
    establishes: "One project. One unified view. Actionable governance.",
    color: "#4ade80",
    Icon: Lightning,
    angle: 225,
    metric: "pillars",
    items: [
      "One Project",
      "One Unified View",
      "Connected Data",
      "Field Evidence",
      "Spatial Context",
      "CESS Intelligence",
      "Actionable Governance",
    ],
  },
];

function polar(angleDeg: number, r: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function curvePath(angleDeg: number) {
  const inner = polar(angleDeg, HUB_R + 8);
  const outer = polar(angleDeg, ORBIT_R - 42);
  const mid = polar(angleDeg + 8, (HUB_R + ORBIT_R) / 2);
  return `M ${inner.x} ${inner.y} Q ${mid.x} ${mid.y} ${outer.x} ${outer.y}`;
}

export function CoreScene({ beat }: { beat: number }) {
  const reduce = useReducedMotion();
  const liveCount = Math.min(8, Math.max(0, beat));
  const hubOn = beat >= 5;
  const allOn = beat >= CLOSE_BEAT;
  const [lit, setLit] = useState("core");

  useEffect(() => {
    if (beat >= 1 && beat <= 8) setLit(NODES[beat - 1].id);
    else setLit("core");
  }, [beat]);

  const current = NODES.find((n) => n.id === lit) ?? NODES[Math.max(0, liveCount - 1)] ?? NODES[0];
  const pick = (id: string) => setLit((cur) => (cur === id ? "core" : id));
  const footer = useMemo(() => footerCopy(beat, current), [beat, current]);
  const showDetail = beat >= 1 && lit !== "core" && beat >= (NODES.find((n) => n.id === lit)?.at ?? 99);

  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr_auto] gap-2 overflow-hidden">
      <Hold className="relative flex min-h-0 h-full flex-col overflow-hidden rounded-2xl shadow-[0_12px_36px_rgba(7,20,51,0.1)] ring-1 ring-navy/8">
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
              linear-gradient(165deg, rgba(247,250,253,0.78) 0%, rgba(232,235,240,0.5) 45%, rgba(228,234,243,0.68) 100%),
              radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,255,255,0.28) 0%, transparent 65%)
            `,
          }}
        />

        <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-2 p-2">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={beat === 0 ? "open" : current.id}
                className="min-w-0"
                initial={reduce ? false : { opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: 4 }}
                transition={{ duration: 0.28 }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="relative grid size-9 shrink-0 place-items-center rounded-2xl bg-navy text-teal-bright shadow-[0_4px_0_0_rgba(7,20,51,0.18),0_1.5px_0_rgba(255,255,255,0.4)_inset] ring-[3px] ring-white ring-teal/35">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent)]"
                    />
                    <Stack weight="fill" className="relative z-[1] size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-teal px-2 py-0.5 text-[8px] font-extrabold tracking-[0.12em] text-navy-deep uppercase">
                        Access · Appeals · KSK · Portal · Remittance at source
                      </span>
                      <span className="text-[9px] font-extrabold tracking-[0.12em] text-teal uppercase">
                        {beat === 0 ? "Operating model" : current.chip}
                      </span>
                    </div>
                    <h2 className="font-display mt-0.5 text-[18px] leading-tight font-extrabold text-navy">
                      How the Department works day to day
                    </h2>
                  </div>
                </div>
                <p className="mt-0.5 max-w-[40rem] text-[11px] font-semibold text-muted-foreground">
                  {beat === 0
                    ? "Zones, audit, loop and pillars orbit one common project view."
                    : current.establishes}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-md bg-white/90 px-2 py-0.5 font-mono text-[10px] font-bold text-navy ring-1 ring-[#d6e5f6]">
                {liveCount}/8 nodes · one view
              </span>
              {beat < CLOSE_BEAT ? (
                <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[9px] font-extrabold text-navy ring-1 ring-[#d6e5f6]">
                  {beat === 0 ? "Space · reveal zones" : `Space · Next`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-ok-soft px-2.5 py-0.5 text-[9px] font-extrabold text-ok-ink ring-1 ring-ok/25">
                  <Check weight="bold" className="size-3" />
                  Complete
                </span>
              )}
            </div>
          </div>

          <div className="relative min-h-0 flex-1">
            <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" viewBox={`0 0 ${VB} ${VB}`} preserveAspectRatio="xMidYMid meet" aria-hidden>
              {[185, 270, 360].map((r, i) => (
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
                  transition={reduce ? { duration: 0 } : { duration: 80 + i * 24, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: `${CX}px ${CY}px` }}
                />
              ))}

              {!reduce && hubOn ? (
                <motion.circle
                  cx={CX}
                  cy={CY}
                  r={360}
                  fill="none"
                  stroke="rgba(14,154,167,0.4)"
                  strokeWidth="1.6"
                  strokeDasharray="2 28"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                  style={{ transformOrigin: `${CX}px ${CY}px` }}
                />
              ) : null}

              {NODES.map((node) => {
                const on = beat >= node.at;
                const hot = lit === node.id;
                const d = curvePath(node.angle);
                return (
                  <g key={node.id}>
                    <motion.path
                      d={d}
                      fill="none"
                      stroke={on ? node.color : "rgba(11,31,74,0.12)"}
                      strokeWidth={hot && on ? 2.4 : 1.5}
                      strokeLinecap="round"
                      initial={false}
                      animate={{
                        pathLength: on ? 1 : 0,
                        opacity: on ? (hot ? 0.95 : 0.55) : 0.22,
                      }}
                      transition={{ duration: reduce ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                    />
                    {on && !reduce ? (
                      <circle r={3.2} fill={node.color} filter={`drop-shadow(0 0 4px ${node.color})`}>
                        <animateMotion dur={`${3.1 + node.at * 0.2}s`} repeatCount="indefinite" path={d} />
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
                <HubOrb beat={beat} hubOn={hubOn} allOn={allOn} liveCount={liveCount} reduce={!!reduce} onClick={() => setLit("core")} />
              </div>

              {NODES.map((node, i) => {
                const on = beat >= node.at;
                const pos = polar(node.angle, ORBIT_R);
                const hot = lit === node.id;
                return (
                  <motion.div
                    key={node.id}
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
                        : { opacity: 0.45, scale: 0.92, y: 0 }
                    }
                    transition={
                      on && !reduce
                        ? {
                            opacity: { duration: 0.4 },
                            scale: { duration: 0.4 },
                            y: { duration: 3.6 + i * 0.18, repeat: Infinity, ease: "easeInOut" },
                          }
                        : { duration: reduce ? 0 : 0.35 }
                    }
                  >
                    <OrbitCard node={node} index={i} on={on} hot={hot} onLit={pick} />
                  </motion.div>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {showDetail ? (
                <motion.div
                  key={current.id}
                  className="absolute top-2 right-2 z-40 max-w-[252px]"
                  initial={reduce ? false : { opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: 8 }}
                  transition={{ duration: 0.28 }}
                >
                  <DetailCard node={current} />
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </Hold>

      <footer className="relative z-10 flex flex-wrap items-center gap-2 rounded-2xl border border-border/80 bg-mist/70 px-3 py-2.5 backdrop-blur-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-teal-bright uppercase">
          <Lightning weight="fill" className="size-3" />
          {footer.chip}
        </span>
        <p className="min-w-0 flex-1 text-[12px] leading-snug text-navy">
          <span className="font-semibold">{footer.title}</span>
          <span className="text-muted-foreground"> — {footer.note}</span>
        </p>
        {beat < CLOSE_BEAT ? (
          <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold tracking-wide text-primary uppercase ring-1 ring-primary/15">
            Space · Next
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-ok/15 px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-ok-ink uppercase ring-1 ring-ok/25">
            <Check weight="bold" className="size-3" />
            Close
          </span>
        )}
      </footer>
    </div>
  );
}

function footerCopy(beat: number, current: OrbitNode) {
  if (beat === 0) {
    return {
      chip: "Operating model",
      title: "Departmental day-to-day.",
      note: "Space — reveal each orbit node.",
    };
  }
  return {
    chip: `0${beat}`,
    title: current.title + ".",
    note: current.establishes,
  };
}

function HubOrb({
  beat,
  hubOn,
  allOn,
  liveCount,
  reduce,
  onClick,
}: {
  beat: number;
  hubOn: boolean;
  allOn: boolean;
  liveCount: number;
  reduce: boolean;
  onClick: () => void;
}) {
  const live = beat >= 1;
  return (
    <Hold>
      <motion.button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className="relative grid size-[152px] place-items-center rounded-full text-center outline-none sm:size-[172px]"
        initial={false}
        animate={{
          scale: live ? 1 : 0.94,
          boxShadow: allOn
            ? "0 0 0 10px rgba(74,222,128,0.14), 0 0 48px rgba(74,222,128,0.35)"
            : hubOn
              ? "0 0 0 10px rgba(52,211,153,0.12), 0 0 48px rgba(52,211,153,0.32)"
              : live
                ? "0 0 0 8px rgba(20,196,212,0.12), 0 0 36px rgba(20,196,212,0.25)"
                : "0 0 0 6px rgba(148,163,184,0.08)",
        }}
        transition={{ duration: reduce ? 0 : 0.45 }}
      >
        {!reduce && live ? (
          <motion.span
            className={cn(
              "pointer-events-none absolute inset-[-10px] rounded-full border-2",
              allOn ? "border-emerald-400/60" : "border-emerald-400/45",
            )}
            animate={{ opacity: [0.35, 0.85, 0.35], scale: [1, 1.04, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
        <span
          className={cn(
            "relative flex size-full flex-col items-center justify-center rounded-full border px-3",
            allOn || hubOn
              ? "border-emerald-400/60 bg-linear-to-b from-[#0b1f4a] to-[#071433]"
              : "border-white/15 bg-linear-to-b from-[#12305f] to-[#071433]",
          )}
        >
          <span
            className={cn(
              "mb-1 grid size-8 place-items-center rounded-full",
              allOn || hubOn ? "bg-emerald-400/20 text-emerald-300" : "bg-teal-bright/15 text-teal-bright",
            )}
          >
            <ChartBar weight="fill" className="size-4" />
          </span>
          <KaMark className="size-8" />
          <b className="font-display mt-1 text-[12px] leading-tight font-bold text-white">Central Platform</b>
          <span className="mt-0.5 text-[9px] text-white/55">{liveCount}/8 nodes · one view</span>
          <span className="mt-1 font-display text-[16px] font-extrabold tracking-tight text-white">
            {allOn ? "Complete" : hubOn ? "Day to day" : beat === 0 ? "Core" : `Node 0${Math.min(beat, 8)}`}
          </span>
          <span
            className={cn(
              "mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-extrabold tracking-wide uppercase",
              allOn || hubOn ? "bg-emerald-400/20 text-emerald-300" : "bg-white/10 text-white/70",
            )}
          >
            {allOn ? (
              <>
                <Check weight="bold" className="size-3" />
                Complete
              </>
            ) : hubOn ? (
              <>
                <Check weight="bold" className="size-3" />
                Connected
              </>
            ) : live ? (
              "Linking…"
            ) : (
              "Awaiting nodes"
            )}
          </span>
        </span>
      </motion.button>
    </Hold>
  );
}

function OrbitCard({
  node,
  index,
  on,
  hot,
  onLit,
}: {
  node: OrbitNode;
  index: number;
  on: boolean;
  hot: boolean;
  onLit: (id: string) => void;
}) {
  return (
    <Hold>
      <button
        type="button"
        disabled={!on}
        onClick={(e) => {
          e.stopPropagation();
          if (on) onLit(node.id);
        }}
        className={cn(
          "relative w-full rounded-2xl border px-2.5 pt-3.5 pb-2 text-left shadow-sm transition",
          on
            ? hot
              ? "border-navy/20 bg-white/95 shadow-[0_12px_28px_rgba(7,20,51,0.14)]"
              : "border-navy/10 bg-white/90 hover:border-navy/25"
            : "border-dashed border-navy/15 bg-white/45",
        )}
        style={hot && on ? { boxShadow: `0 0 0 1px ${node.color}66, 0 12px 28px rgba(7,20,51,0.14)` } : undefined}
      >
        <span
          className="absolute -top-2.5 left-1/2 grid size-6 -translate-x-1/2 place-items-center rounded-full ring-2 ring-white shadow-sm"
          style={{ background: on ? node.color : HEX.mist, color: on ? "#04101f" : HEX.muted }}
        >
          <node.Icon weight="fill" className="size-3" />
        </span>
        {on ? (
          <span className="absolute top-1.5 right-1.5 grid size-3.5 place-items-center rounded-full bg-ok-soft text-ok-ink">
            <Check weight="bold" className="size-2" />
          </span>
        ) : null}
        <div className="font-mono text-[9px] font-extrabold text-navy/40">{String(index + 1).padStart(2, "0")}</div>
        <b className={cn("mt-0.5 block text-[11px] leading-tight", on ? "text-navy" : "text-navy/35")}>{node.chip}</b>
        <span className={cn("mt-0.5 block text-[9px] leading-snug", on ? "text-muted-foreground" : "text-navy/25")}>
          {on ? `${node.items.length} ${node.metric}` : "Waiting"}
        </span>
      </button>
    </Hold>
  );
}

function DetailCard({ node }: { node: OrbitNode }) {
  return (
    <Hold className="rounded-2xl border border-navy/10 bg-white/96 p-3 shadow-[0_16px_36px_rgba(7,20,51,0.14)] backdrop-blur-md ring-1 ring-[#d6e5f6]">
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full" style={{ background: `${node.color}33`, color: node.color }}>
          <node.Icon weight="fill" className="size-4" />
        </span>
        <div className="min-w-0">
          <div className="text-[9px] font-extrabold tracking-[0.14em] text-primary uppercase">{node.chip}</div>
          <b className="block text-[12px] leading-tight text-navy">{node.title}</b>
        </div>
      </div>
      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">{node.establishes}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {node.items.map((item) => (
          <span key={item} className="rounded-full bg-mist px-2 py-0.5 text-[9px] font-bold text-navy">
            {item}
          </span>
        ))}
      </div>
      {node.id === "audit" ? (
        <div className="mt-2 flex flex-wrap items-center gap-1">
          {[
            { label: "Alert", Icon: Bell },
            { label: "Assign", Icon: User },
            { label: "Follow up", Icon: Megaphone },
            { label: "Close", Icon: ShieldCheck },
          ].map((step, i) => (
            <span key={step.label} className="inline-flex items-center gap-0.5">
              {i > 0 ? <span className="text-[9px] font-extrabold text-primary">→</span> : null}
              <span className="inline-flex items-center gap-1 rounded-full bg-navy px-1.5 py-0.5 text-[8px] font-extrabold tracking-wide text-teal-bright uppercase">
                <step.Icon weight="fill" className="size-2.5" />
                {step.label}
              </span>
            </span>
          ))}
        </div>
      ) : null}
    </Hold>
  );
}
