import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowRight,
  ArrowUpRight,
  Bell,
  CaretRight,
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
import { KaMark } from "@/components/SlideKit";
import { Gloss, orbStyle, slab3D, tileStyle } from "@/components/Depth";
import { useElementSize } from "@/hooks/useElementSize";
import { cn } from "@/lib/utils";
import { CORE_ART } from "@/lib/coreArt";
import stageBg from "@/assets/core-stage-bg.jpg";
import hubSite from "@/assets/core-hub-site.jpg";

const ease = [0.22, 1, 0.36, 1] as const;
const INK = "#0b2462";
const CLOSE_BEAT = 8;

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
    color: "#3b82f6",
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
    establishes: "Documents, E-Office and appeals on the same file.",
    color: "#8b5cf6",
    Icon: Files,
    angle: -38,
    metric: "capabilities",
    items: ["DMS", "E-Office", "Inward / Outward", "Appeals", "Grievances", "Exception resolution", "Meetings"],
  },
  {
    id: "fin",
    at: 3,
    title: "Finance & CESS Operations",
    chip: "Finance",
    establishes: "What is owed, collected and remitted.",
    color: "#f59e0b",
    Icon: Wallet,
    angle: 0,
    metric: "capabilities",
    items: ["Demand", "Collection", "Remittance (30 days)", "Interest on delay", "Old dues brought forward", "Reconciliation", "Accounts / DCB"],
  },
  {
    id: "comm",
    at: 4,
    title: "Communication & Compliance",
    chip: "Compliance",
    establishes: "Alert → Assign → Follow up → Close.",
    color: "#06b6d4",
    Icon: ShieldCheck,
    angle: 38,
    metric: "capabilities",
    items: ["Alerts & escalation", "Assignment", "Follow-up", "Resolution", "Appeals", "Grievances", "Decision support"],
  },
  {
    id: "ext",
    at: 5,
    title: "External Ecosystem",
    chip: "External",
    establishes: "Portal, remittance at source, KSK and system links.",
    color: "#f43f5e",
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
    color: "#f97316",
    Icon: Scroll,
    angle: 142,
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
    color: "#6366f1",
    Icon: Stack,
    angle: 180,
    metric: "steps",
    items: ["Capture", "Validate", "Consolidate", "Assess", "Locate", "Map", "Monitor", "Detect", "Act", "Audit", "Report"],
  },
  {
    id: "close",
    at: 8,
    title: "Closing Pillars",
    chip: "Pillars",
    establishes: "One project. One unified view. Actionable governance.",
    color: "#10b981",
    Icon: Lightning,
    angle: 218,
    metric: "pillars",
    items: ["One Project", "One Unified View", "Connected Data", "Field Evidence", "Spatial Context", "CESS Intelligence", "Actionable Governance"],
  },
];

const INTRO = {
  chip: "Operating model",
  title: "Eight modules. One view.",
  establishes: "Eight modules work around one common project view.",
  color: "#2f7df0",
  Icon: Stack,
  items: NODES.map((n) => n.chip),
};

/* ------------------------------------------------------------------ helpers */

/* ------------------------------------------------------------------ scene */

export function CoreScene({ beat, onBeat }: { beat: number; onBeat?: (n: number) => void }) {
  const reduce = !!useReducedMotion();
  const [picked, setPicked] = useState<string | null>(null);
  useEffect(() => setPicked(null), [beat]);

  const current = beat >= 1 ? NODES[Math.min(beat, 8) - 1] : null;
  const shown = (picked ? NODES.find((n) => n.id === picked) : null) ?? current;
  const lit = Math.min(Math.max(beat, 0), 8);

  return (
    <div className="h-full min-h-0 text-[#23395f]">
      <div className="relative h-full min-h-0 overflow-hidden rounded-[22px] shadow-[inset_0_1px_0_#fff,0_3px_0_#d6e3f2,0_22px_44px_-16px_rgba(0,70,140,0.35)] ring-1 ring-white">
        <img src={stageBg} alt="" aria-hidden draggable={false} className="pointer-events-none absolute inset-0 size-full object-cover object-[center_55%] select-none" />
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(240,249,255,0.6)_0%,rgba(240,249,255,0.1)_24%,rgba(240,249,255,0)_60%,rgba(240,249,255,0.18)_100%)]" />
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_34%_44%_at_50%_54%,rgba(255,255,255,0.4),rgba(255,255,255,0)_100%)]" />

        <div className="relative z-10 grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] gap-2 p-2.5">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-white/95 px-3 py-1.5 text-[9.5px] font-extrabold shadow-[0_2px_0_#dbe6f3] ring-1 ring-white" style={{ color: INK }}>
                {lit}/8 modules · one view
              </span>
              {beat >= CLOSE_BEAT ? (
                <motion.span
                  className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[9.5px] font-extrabold text-white"
                  style={tileStyle("#10b981")}
                  initial={reduce ? false : { scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <Check weight="bold" className="size-3" />
                  Complete
                </motion.span>
              ) : null}
            </div>
          </div>

          <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(300px,32%)] gap-2.5">
            <Orbit beat={beat} shown={shown} reduce={reduce} onPick={(n) => (beat >= n.at ? setPicked(n.id) : onBeat?.(n.at))} />
            <div className="flex min-h-0 flex-col gap-2.5">
              <DetailPanel node={shown} reduce={reduce} />
            </div>
          </div>

          <StatusBar beat={beat} node={shown} reduce={reduce} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ orbit */

function Orbit({
  beat,
  shown,
  reduce,
  onPick,
}: {
  beat: number;
  shown: OrbitNode | null;
  reduce: boolean;
  onPick: (n: OrbitNode) => void;
}) {
  const [ref, { w, h }] = useElementSize<HTMLDivElement>();
  const cardW = Math.min(150, w * 0.24);
  const cardH = 58;
  const hubD = Math.min(h * 0.4, w * 0.32, 210);
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2 - cardW / 2 - 4;
  const ry = h / 2 - cardH / 2 - 18;

  const pts = NODES.map((n) => {
    const a = (n.angle * Math.PI) / 180;
    const nx = cx + rx * Math.cos(a);
    const ny = cy + ry * Math.sin(a);
    const hx = cx + (hubD / 2 + 10) * Math.cos(a);
    const hy = cy + (hubD / 2 + 10) * Math.sin(a);
    const vx = hx - nx;
    const vy = hy - ny;
    const s = Math.min(cardW / 2 / Math.max(Math.abs(vx), 0.001), (cardH / 2 + 6) / Math.max(Math.abs(vy), 0.001));
    return { nx, ny, hx, hy, ex: nx + vx * s, ey: ny + vy * s };
  });

  return (
    <div ref={ref} className="relative min-h-0">
      {w > 0 ? (
        <>
          <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" viewBox={`0 0 ${w} ${h}`} aria-hidden>
            <ellipse cx={cx} cy={cy} rx={hubD * 0.82} ry={hubD * 0.82} fill="rgba(34,211,238,0.08)" />
            {[0.72, 0.9].map((k, i) => (
              <motion.circle
                key={k}
                cx={cx}
                cy={cy}
                r={hubD * k}
                fill="none"
                stroke="#60a5fa"
                strokeOpacity={0.35 - i * 0.12}
                strokeWidth={1.5}
                strokeDasharray="3 8"
                animate={reduce ? undefined : { rotate: i ? -360 : 360 }}
                transition={{ duration: 60 + i * 20, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: `${cx}px ${cy}px` }}
              />
            ))}
            {NODES.map((n, i) => {
              const p = pts[i];
              const on = beat >= n.at;
              const d = `M${p.hx} ${p.hy} Q ${(p.hx + p.ex) / 2 + (p.ey - p.hy) * 0.12} ${(p.hy + p.ey) / 2 - (p.ex - p.hx) * 0.12} ${p.ex} ${p.ey}`;
              return (
                <g key={n.id}>
                  <motion.path
                    d={d}
                    fill="none"
                    stroke={on ? n.color : "#cbd5e1"}
                    strokeWidth={on ? 2.6 : 1.6}
                    strokeLinecap="round"
                    strokeDasharray={on ? undefined : "4 6"}
                    initial={false}
                    animate={{ pathLength: on ? 1 : 0.999, opacity: on ? 0.95 : 0.7 }}
                    transition={{ duration: reduce ? 0 : 0.6, ease }}
                  />
                  <circle cx={p.hx} cy={p.hy} r={4.5} fill="#fff" stroke={on ? n.color : "#cbd5e1"} strokeWidth={2.5} />
                  <circle cx={p.ex} cy={p.ey} r={3.5} fill={on ? n.color : "#cbd5e1"} stroke="#fff" strokeWidth={1.5} />
                  {on && !reduce ? (
                    <circle r={3.5} fill={n.color} style={{ filter: `drop-shadow(0 0 4px ${n.color})` }}>
                      <animateMotion dur={`${2.2 + i * 0.2}s`} repeatCount="indefinite" path={d} />
                    </circle>
                  ) : null}
                </g>
              );
            })}
          </svg>

          <Hub d={hubD} cx={cx} cy={cy} beat={beat} reduce={reduce} />

          {NODES.map((n, i) => {
            const p = pts[i];
            return (
              <NodeCard
                key={n.id}
                node={n}
                x={p.nx}
                y={p.ny}
                w={cardW}
                on={beat >= n.at}
                focus={shown?.id === n.id}
                reduce={reduce}
                delay={0.3 + i * 0.05}
                onClick={() => onPick(n)}
              />
            );
          })}
        </>
      ) : null}
    </div>
  );
}

function Hub({ d, cx, cy, beat, reduce }: { d: number; cx: number; cy: number; beat: number; reduce: boolean }) {
  const lit = Math.min(Math.max(beat, 0), 8);
  const done = beat >= CLOSE_BEAT;
  return (
    <motion.div
      className="absolute z-10"
      style={{ left: cx - d / 2, top: cy - d / 2, width: d, height: d }}
      initial={reduce ? false : { opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.15, ease }}
    >
      {!reduce ? (
        <motion.span
          aria-hidden
          className="absolute -inset-[8%] rounded-full border-2 border-[#22d3ee]/60"
          animate={{ scale: [1, 1.05, 1], opacity: [0.9, 0.35, 0.9] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      <span
        className="absolute inset-0 overflow-hidden rounded-full bg-[#0b2462]"
        style={{ boxShadow: "0 0 0 6px #7dd3fc, 0 0 0 9px rgba(255,255,255,0.85), 0 0 44px rgba(34,211,238,0.55), 0 18px 30px -10px rgba(7,30,76,0.55)" }}
      >
        <img src={hubSite} alt="" aria-hidden draggable={false} className="absolute inset-0 size-full object-cover" />
        <span className="absolute inset-x-0 bottom-0 h-[55%] bg-[linear-gradient(180deg,rgba(7,30,76,0)_0%,rgba(7,30,76,0.7)_40%,#071e4c_100%)]" />
      </span>
      <div className="absolute inset-x-0 top-[44%] flex flex-col items-center text-center text-white">
        <span className="grid size-9 place-items-center rounded-full bg-white shadow-[0_4px_10px_rgba(0,0,0,0.35)] ring-2 ring-white">
          <KaMark className="size-7" />
        </span>
        <b className="font-display mt-1 text-[14px] leading-tight font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Central Platform</b>
        <span className="text-[9px] font-semibold text-[#bae6fd]">{lit}/8 modules · one view</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={done ? "done" : lit}
            className="mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-[8.5px] font-extrabold tracking-wide uppercase"
            style={done ? tileStyle("#10b981") : { background: "rgba(255,255,255,0.14)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.25)" }}
            initial={reduce ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {done ? <Check weight="bold" className="size-2.5" /> : null}
            {done ? "Complete" : beat === 0 ? "Operating model" : `Module 0${lit}`}
          </motion.span>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function NodeCard({
  node,
  x,
  y,
  w,
  on,
  focus,
  reduce,
  delay,
  onClick,
}: {
  node: OrbitNode;
  x: number;
  y: number;
  w: number;
  on: boolean;
  focus: boolean;
  reduce: boolean;
  delay: number;
  onClick: () => void;
}) {
  const idx = NODES.indexOf(node) + 1;
  return (
    <motion.button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn("absolute z-20 rounded-[16px] px-2.5 pt-2 pb-1.5 text-left backdrop-blur-sm", on ? "bg-white/96" : "bg-white/70")}
      style={{
        left: x - w / 2,
        top: y - 29,
        width: w,
        boxShadow: on
          ? focus
            ? `0 0 0 2px ${node.color}, ${slab3D(node.color)}`
            : slab3D(node.color)
          : "0 2px 0 #e2e8f0, 0 8px 16px -8px rgba(15,35,70,0.2)",
      }}
      initial={reduce ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: on ? 1 : 0.8, scale: focus && !reduce ? 1.05 : 1 }}
      whileHover={reduce ? undefined : { y: -2 }}
      transition={{ duration: 0.35, delay: reduce ? 0 : delay, ease }}
    >
      <span
        className={cn("absolute -top-3.5 left-1/2 grid size-8 -translate-x-1/2 place-items-center overflow-hidden rounded-full ring-[3px] ring-white", on ? "text-white" : "bg-[#eef2f7] text-[#94a3b8]")}
        style={on ? orbStyle(node.color) : undefined}
      >
        {on ? <Gloss /> : null}
        <node.Icon weight="fill" className="relative size-4" />
      </span>
      <span className="flex min-h-3 items-start justify-end">
        {on ? (
          <motion.span
            className="relative grid size-4 place-items-center overflow-hidden rounded-full text-white"
            style={orbStyle("#10b981")}
            initial={reduce ? false : { scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18 }}
          >
            <Check weight="bold" className="relative size-2.5" />
          </motion.span>
        ) : null}
      </span>
      <b className="block truncate text-[11.5px] leading-tight font-black" style={{ color: on ? INK : "#94a3b8" }}>
        {node.chip}
      </b>
      <span className="block truncate text-[9px] font-semibold text-[#64748b]">
        <b className="font-extrabold" style={{ color: on ? node.color : "#94a3b8" }}>
          Module {String(idx).padStart(2, "0")}
        </b>
        {" · "}
        {on ? `${node.items.length} ${node.metric}` : "Next"}
      </span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ right column */

function DetailPanel({ node, reduce }: { node: OrbitNode | null; reduce: boolean }) {
  const d = node ?? INTRO;
  const color = d.color;
  const module = node ? `Module ${String(NODES.indexOf(node) + 1).padStart(2, "0")}` : `${NODES.length} Modules`;
  return (
    <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[20px] bg-white/95 p-3.5 shadow-[inset_0_1px_0_#fff,0_3px_0_#d6e3f2,0_16px_30px_-12px_rgba(0,50,120,0.35)] ring-1 ring-white backdrop-blur">
      <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1.5" style={{ background: color }} />
      <AnimatePresence mode="wait">
        <motion.div
          key={node?.id ?? "intro"}
          className="flex min-h-0 flex-1 flex-col"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.28, ease }}
        >
          <header className="flex items-start gap-3">
            <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl text-white" style={tileStyle(color)}>
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0.4),rgba(255,255,255,0))]" />
              <d.Icon weight="fill" className="relative size-6" />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="flex flex-wrap items-center gap-1.5">
                <span
                  className="rounded-full px-2 py-[2px] text-[9.5px] font-black tracking-[0.12em] text-white uppercase"
                  style={{ background: color, boxShadow: `0 2px 0 color-mix(in srgb, ${color} 70%, #0b2462)` }}
                >
                  {module}
                </span>
                <span className="text-[10px] font-extrabold tracking-[0.18em] uppercase" style={{ color }}>
                  {d.chip}
                </span>
              </span>
              <b className="font-display mt-0.5 block text-[19px] leading-[1.1] font-black" style={{ color: INK }}>
                {d.title}
              </b>
            </span>
            <ArrowUpRight weight="bold" className="size-4 shrink-0 text-[#94a3b8]" />
          </header>
          <p className="mt-2.5 text-[12.5px] leading-snug font-semibold text-[#52627a]">{d.establishes}</p>
          <div className="mt-3 grid min-h-0 flex-1 auto-rows-fr grid-cols-2 content-start gap-2 overflow-y-auto">
            {d.items.map((item, i) => (
              <motion.div
                key={item}
                className="flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white"
                style={{
                  boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 24%, transparent), 0 2px 0 color-mix(in srgb, ${color} 18%, #e2eaf5), 0 8px 16px -10px rgba(15,35,70,0.35)`,
                }}
                initial={reduce ? false : { opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.28, delay: 0.1 + i * 0.05, ease }}
              >
                <div
                  className="relative grid min-h-[34px] flex-1 place-items-center overflow-hidden"
                  style={{ background: `radial-gradient(ellipse 70% 80% at 50% 55%, #fff 0%, color-mix(in srgb, ${color} 12%, #f4f8fd) 100%)` }}
                >
                  {CORE_ART[item] ? (
                    <motion.img
                      src={CORE_ART[item]}
                      alt=""
                      aria-hidden
                      draggable={false}
                      className="absolute inset-[8%] m-auto size-[84%] object-contain mix-blend-multiply select-none"
                      initial={reduce ? false : { scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.18 + i * 0.05, ease }}
                    />
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-1.5 px-2.5 py-1.5" style={{ background: `color-mix(in srgb, ${color} 6%, #fff)` }}>
                  <span className="grid size-4 shrink-0 place-items-center rounded-full text-white" style={{ background: color }}>
                    <Check weight="bold" className="size-2.5" />
                  </span>
                  <span className="min-w-0 line-clamp-2 text-[12.5px] leading-tight font-extrabold" style={{ color: INK }} title={item}>
                    {node ? null : <span style={{ color: NODES[i].color }}>Module {String(i + 1).padStart(2, "0")} · </span>}
                    {item}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          {node?.id === "audit" ? (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {[
                { label: "Alert", Icon: Bell },
                { label: "Assign", Icon: User },
                { label: "Follow up", Icon: Megaphone },
                { label: "Close", Icon: ShieldCheck },
              ].map((s, i) => (
                <span key={s.label} className="inline-flex items-center gap-1">
                  {i > 0 ? <ArrowRight weight="bold" className="size-3 text-[#94a3b8]" /> : null}
                  <span className="inline-flex items-center gap-1 rounded-full bg-[linear-gradient(180deg,#1a4bb0,#0b2462)] px-2.5 py-1 text-[10px] font-extrabold tracking-wide text-[#7dfff0] uppercase shadow-[0_2px_0_#071a48]">
                    <s.Icon weight="fill" className="size-3" />
                    {s.label}
                  </span>
                </span>
              ))}
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------ status bar */

function StatusBar({ beat, node, reduce }: { beat: number; node: OrbitNode | null; reduce: boolean }) {
  const idx = node ? NODES.indexOf(node) + 1 : 0;
  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white/95 px-2 py-1.5 shadow-[inset_0_1px_0_#fff,0_3px_0_#d6e3f2,0_10px_20px_-8px_rgba(0,60,130,0.3)] ring-1 ring-white backdrop-blur">
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[linear-gradient(180deg,#1a4bb0,#0b2462)] px-3 py-1.5 text-[9.5px] font-extrabold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_0_#071a48]">
        <Lightning weight="fill" className="size-3 text-[#fbbf24]" />
        Current Focus
      </span>
      <ArrowRight weight="bold" className="size-3 shrink-0 text-[#2f7df0]" />
      <AnimatePresence mode="wait">
        <motion.span
          key={node?.id ?? "intro"}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-[#eef5ff] py-1 pr-3 pl-1"
          initial={reduce ? false : { opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? undefined : { opacity: 0, x: -6 }}
          transition={{ duration: 0.25 }}
        >
          <span className="relative grid size-6 shrink-0 place-items-center overflow-hidden rounded-full text-[9px] font-black text-white" style={orbStyle(node?.color ?? "#2f7df0")}>
            <Gloss />
            <span className="relative">{String(idx).padStart(2, "0")}</span>
          </span>
          <span className="min-w-0 truncate text-[10.5px]">
            <b style={{ color: INK }}>{node ? `Module ${String(idx).padStart(2, "0")} · ${node.title}` : `Operating model · ${NODES.length} modules`}</b>
            <span className="text-[#52627a]"> — {node ? node.establishes : "Press Space to reveal each module around the Central Platform."}</span>
          </span>
        </motion.span>
      </AnimatePresence>
      {beat >= CLOSE_BEAT ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[9.5px] font-extrabold text-white" style={tileStyle("#10b981")}>
          <Check weight="bold" className="size-3" />
          Complete
        </span>
      ) : (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[9.5px] font-extrabold text-[#2f7df0] shadow-[0_2px_0_#dbe6f3] ring-1 ring-[#dbeafe]">
          Space · Next
          <CaretRight weight="bold" className="size-2.5" />
        </span>
      )}
    </div>
  );
}
