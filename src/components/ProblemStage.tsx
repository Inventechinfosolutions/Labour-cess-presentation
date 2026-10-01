import { useEffect, useId, useRef, useState, type CSSProperties, type RefObject } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  Bank,
  Buildings,
  ChartLineUp,
  Lightning,
  UsersThree,
  WarningCircle,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { stageFont } from "@/lib/stageFont";
import { Stagger } from "@/components/SlideKit";
import siteBg from "@/assets/current-issues-center-bg.jpg";
import cloud3d from "@/assets/cloud-3d-fragmented.png";
import proc3dInfo from "@/assets/proc-3d-info.jpg";
import proc3dAssess from "@/assets/proc-3d-assess.jpg";
import proc3dDeduct from "@/assets/proc-3d-deduct.jpg";
import proc3dRemit from "@/assets/proc-3d-remit.jpg";
import proc3dRecon from "@/assets/proc-3d-recon.jpg";
import sys3dDept from "@/assets/sys-3d-dept.jpg";
import sys3dUlb from "@/assets/sys-3d-ulb.jpg";
import sys3dPsu from "@/assets/sys-3d-psu.jpg";
import sys3dUtil from "@/assets/sys-3d-util.jpg";
import sys3dManual from "@/assets/sys-3d-manual.jpg";
import sys3dSheet from "@/assets/sys-3d-sheet.jpg";
import sourcePhotoGov from "@/assets/source-photo-gov.png";
import sourcePhotoUlb from "@/assets/source-photo-ulb.png";
import stakePhotoBoards from "@/assets/stake-photo-boards.jpg";
import stakePhotoUtil from "@/assets/stake-photo-util.jpg";
import stakePhotoPsu from "@/assets/stake-photo-psu.jpg";
import stakePhotoBld from "@/assets/stake-photo-bld.jpg";
import issue3dScatter from "@/assets/issue-3d-scatter.jpg";
import issue3dShare from "@/assets/issue-3d-share.jpg";
import issue3dVisible from "@/assets/issue-3d-visible.jpg";
import issue3dDemand from "@/assets/issue-3d-demand.jpg";
import issue3dTrack from "@/assets/issue-3d-track.jpg";
import issue3dDelay from "@/assets/issue-3d-delay.jpg";
import issue3dRecon from "@/assets/issue-3d-recon.jpg";
import impact3dShortfall from "@/assets/impact-3d-shortfall.jpg";
import impact3dDelay from "@/assets/impact-3d-delay.jpg";
import impact3dRecon from "@/assets/impact-3d-recon.jpg";
import impact3dVisibility from "@/assets/impact-3d-visibility.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

const STAKEHOLDERS: {
  id: string;
  label: string;
  support: string;
  Icon: CessIcon;
  soft: string;
  photo: string;
}[] = [
  {
    id: "gov",
    label: "Government Departments",
    support: "State departments (e.g. PWD, RDPR, etc.)",
    Icon: Bank,
    soft: "linear-gradient(135deg,#3b95f0,#1565c9)",
    photo: sourcePhotoGov,
  },
  {
    id: "ulb",
    label: "ULBs & Planning Authorities",
    support: "City corporations, municipalities and planning bodies",
    Icon: Buildings,
    soft: "linear-gradient(135deg,#f7b03f,#e07f0c)",
    photo: sourcePhotoUlb,
  },
  {
    id: "boards",
    label: "Boards & Corporations",
    support: "Statutory boards and development corporations",
    Icon: Buildings,
    soft: "linear-gradient(135deg,#9a62f0,#6428c8)",
    photo: stakePhotoBoards,
  },
  {
    id: "util",
    label: "Utility & Infrastructure Providers",
    support: "ESCOMs, water boards, transport, irrigation, etc.",
    Icon: Lightning,
    soft: "linear-gradient(135deg,#34bf7c,#138a55)",
    photo: stakePhotoUtil,
  },
  {
    id: "psu",
    label: "PSUs & Other Agencies",
    support: "Various government undertakings and notified agencies",
    Icon: Buildings,
    soft: "linear-gradient(135deg,#f05aa3,#c81e6f)",
    photo: stakePhotoPsu,
  },
  {
    id: "bld",
    label: "Builders / Contractors",
    support: "Construction projects and execution",
    Icon: UsersThree,
    soft: "linear-gradient(135deg,#34bf7c,#138a55)",
    photo: stakePhotoBld,
  },
];

const SYSTEMS: { id: string; label: string; img: string; soft: string; tint: string }[] = [
  { id: "dept", label: "Department System", img: sys3dDept, soft: "#1774d1", tint: "#e7f0fc" },
  { id: "ulb", label: "ULB System", img: sys3dUlb, soft: "#f49b18", tint: "#fdf0de" },
  { id: "psu", label: "Board / PSU System", img: sys3dPsu, soft: "#7746d9", tint: "#f1e9fd" },
  { id: "util", label: "Utility System", img: sys3dUtil, soft: "#0e9fb3", tint: "#e4f5ec" },
  { id: "manual", label: "Manual Records", img: sys3dManual, soft: "#e53b91", tint: "#fde6ea" },
  { id: "sheet", label: "Spreadsheets & Reports", img: sys3dSheet, soft: "#16a676", tint: "#e9f3f5" },
];

/** Pixel gap between system cards — arrows start from the card centres using this. */
const SYSTEM_GAP = 10;

/** Arrows that point both ways (two-way exchange). */
const TWO_WAY_ARROWS = new Set([1, 4]);

/** Where each arrow lands on the cloud rim, in degrees (270 = top centre). */
const ARROW_LAND_DEG = [200, 228, 256, 284, 312, 340] as const;

const HEAD_LEN = 12;
const HEAD_HALF = 6;

type Pt = { x: number; y: number };

function unit(from: Pt, to: Pt): Pt {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

function headPoints(tip: Pt, dir: Pt) {
  const bx = tip.x - dir.x * HEAD_LEN;
  const by = tip.y - dir.y * HEAD_LEN;
  const nx = -dir.y * HEAD_HALF;
  const ny = dir.x * HEAD_HALF;
  return `${tip.x},${tip.y} ${bx + nx},${by + ny} ${bx - nx},${by - ny}`;
}

/** Curved system → cloud arrows, drawn in pixels so heads stay crisp. */
function SystemArrows({ reduce, cloudRef }: { reduce: boolean; cloudRef: RefObject<HTMLDivElement | null> }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0, a: 0, b: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const cloud = cloudRef.current;
    if (!wrap || !cloud) return;
    const sync = () =>
      setBox({
        w: wrap.clientWidth,
        h: wrap.clientHeight,
        a: cloud.offsetWidth / 2,
        b: cloud.offsetHeight / 2,
      });
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(wrap);
    ro.observe(cloud);
    return () => ro.disconnect();
  }, [cloudRef]);

  const { w, h, a, b } = box;
  const ready = w > 0 && h > 0 && a > 0;
  const cardW = (w - 16 - SYSTEM_GAP * 5) / 6;
  const cx = w / 2;
  const cy = h * CLOUD_Y;

  const arrows = ready
    ? SYSTEMS.map((sys, i) => {
        const start: Pt = { x: 8 + cardW * (i + 0.5) + SYSTEM_GAP * i, y: 1 };
        const rad = (ARROW_LAND_DEG[i] * Math.PI) / 180;
        const end: Pt = { x: cx + (a * 0.9 + 4) * Math.cos(rad), y: cy + (b * 0.96 + 4) * Math.sin(rad) };
        const c1: Pt = { x: start.x, y: start.y + (end.y - start.y) * 0.55 };
        const c2: Pt = { x: end.x - (end.x - start.x) * 0.55, y: end.y - (end.y - start.y) * 0.22 };
        const endDir = unit(c2, end);
        const startDir = unit(c1, start);
        const twoWay = TWO_WAY_ARROWS.has(i);
        const p0 = twoWay
          ? { x: start.x - startDir.x * (HEAD_LEN - 2), y: start.y - startDir.y * (HEAD_LEN - 2) }
          : start;
        const p1 = { x: end.x - endDir.x * (HEAD_LEN - 2), y: end.y - endDir.y * (HEAD_LEN - 2) };
        return {
          color: sys.soft,
          d: `M ${p0.x} ${p0.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p1.x} ${p1.y}`,
          endHead: headPoints(end, endDir),
          startHead: twoWay ? headPoints(start, startDir) : null,
        };
      })
    : [];

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 z-[5]" aria-hidden>
      {ready ? (
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${w} ${h}`}>
          {arrows.map((ar, i) => (
            <g key={i}>
              <path d={ar.d} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={6} strokeLinecap="round" />
              <motion.path
                d={ar.d}
                fill="none"
                stroke={ar.color}
                strokeWidth={3.2}
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.15 + i * 0.07, ease }}
              />
              <motion.polygon
                points={ar.endHead}
                fill={ar.color}
                stroke="rgba(255,255,255,0.7)"
                strokeWidth={1}
                strokeLinejoin="round"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: reduce ? 0 : 0.8 + i * 0.07 }}
              />
              {ar.startHead ? (
                <motion.polygon
                  points={ar.startHead}
                  fill={ar.color}
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth={1}
                  strokeLinejoin="round"
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: reduce ? 0 : 0.2 + i * 0.07 }}
                />
              ) : null}
            </g>
          ))}
        </svg>
      ) : null}
    </div>
  );
}

const PROCESS: { id: string; label: string; img: string; soft: string; tint: string }[] = [
  { id: "info", label: "Project Information", img: proc3dInfo, soft: "#1f7ae0", tint: "#e6f0fd" },
  { id: "assess", label: "Assessment & Demand", img: proc3dAssess, soft: "#f59e0b", tint: "#fdf0dc" },
  { id: "deduct", label: "Deduction & Collection", img: proc3dDeduct, soft: "#8b3fd9", tint: "#f1e8fc" },
  { id: "remit", label: "Remittance to Board", img: proc3dRemit, soft: "#16a34a", tint: "#e3f6ea" },
  { id: "recon", label: "Reconciliation & Compliance", img: proc3dRecon, soft: "#1b9ad6", tint: "#e2f3fb" },
];

/** Colours of the step arrows between process cards. */
const PROCESS_ARROW_COLORS = ["#1f7ae0", "#f59e0b", "#16a34a", "#16a34a"] as const;

/** Branch colours from the cloud into each step (matches the poster). */
const BRANCH_COLORS = ["#1f7ae0", "#f59e0b", "#d9267f", "#16a34a", "#1b9ad6"] as const;

/** Vertical position of the cloud centre inside the story area. */
const CLOUD_Y = 0.45;

/** Coloured lines from the cloud down into each process step, in pixels. */
function ProcessBranches({
  reduce,
  middleRef,
  cloudRef,
  railRef,
}: {
  reduce: boolean;
  middleRef: RefObject<HTMLDivElement | null>;
  cloudRef: RefObject<HTMLDivElement | null>;
  railRef: RefObject<HTMLDivElement | null>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<{
    w: number;
    h: number;
    cx: number;
    cy: number;
    a: number;
    b: number;
    cards: { x: number; top: number }[];
  } | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const mid = middleRef.current;
    const cloud = cloudRef.current;
    const rail = railRef.current;
    if (!wrap || !mid || !cloud || !rail) return;
    const sync = () => {
      const cards = Array.from(rail.children).map((el) => {
        const c = el as HTMLElement;
        return { x: rail.offsetLeft + c.offsetLeft + c.offsetWidth / 2, top: rail.offsetTop + c.offsetTop };
      });
      setGeo({
        w: wrap.clientWidth,
        h: wrap.clientHeight,
        cx: mid.offsetLeft + mid.clientWidth / 2,
        cy: mid.offsetTop + mid.clientHeight * CLOUD_Y,
        a: cloud.offsetWidth / 2,
        b: cloud.offsetHeight / 2,
        cards,
      });
    };
    sync();
    const ro = new ResizeObserver(sync);
    [wrap, mid, cloud, rail].forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [middleRef, cloudRef, railRef]);

  const bus = geo && geo.cards.length === 5 ? (() => {
    const left = geo.cards[0];
    const right = geo.cards[4];
    const tipY = left.top - 1;
    const endY = tipY - 7;
    const cloudBottom = geo.cy + geo.b - 2;
    const busY = cloudBottom + (endY - cloudBottom) * 0.5;
    const r = Math.max(2, Math.min(10, endY - busY));
    const half = (x: number, dir: number) =>
      [
        `M ${geo.cx} ${busY}`,
        `L ${x - dir * r} ${busY}`,
        `Q ${x} ${busY} ${x} ${busY + r}`,
        `L ${x} ${endY}`,
      ].join(" ");
    const head = (x: number) => `${x},${tipY} ${x - 5.5},${tipY - 9} ${x + 5.5},${tipY - 9}`;
    return {
      x1: left.x,
      x2: right.x,
      halves: [
        { d: half(left.x, -1), head: head(left.x), color: BRANCH_COLORS[0] },
        { d: half(right.x, 1), head: head(right.x), color: BRANCH_COLORS[4] },
      ],
    };
  })() : null;

  const paths =
    geo && geo.cards.length === 5
      ? [1, 2, 3].map((i) => {
          const card = geo.cards[i];
          const off = [-0.55, -0.28, 0, 0.28, 0.55][i];
          const sx = geo.cx + geo.a * off;
          const sy = geo.cy + geo.b * Math.sqrt(1 - off * off) - 2;
          const tipY = card.top - 1;
          const endY = tipY - 7;
          const dy = endY - sy;
          const d =
            i === 2
              ? `M ${card.x} ${sy} L ${card.x} ${endY}`
              : `M ${sx} ${sy} C ${sx} ${sy + dy * 0.6}, ${card.x} ${endY - dy * 0.6}, ${card.x} ${endY}`;
          const head = `${card.x},${tipY} ${card.x - 5.5},${tipY - 9} ${card.x + 5.5},${tipY - 9}`;
          return { d, head, color: BRANCH_COLORS[i] };
        })
      : [];

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 z-[9]" aria-hidden>
      {geo ? (
        <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${geo.w} ${geo.h}`}>
          {bus ? (
            <g>
              <defs>
                <linearGradient id="process-bus" gradientUnits="userSpaceOnUse" x1={bus.x1} y1={0} x2={bus.x2} y2={0}>
                  <stop offset="0%" stopColor={BRANCH_COLORS[0]} />
                  <stop offset="100%" stopColor={BRANCH_COLORS[4]} />
                </linearGradient>
              </defs>
              {bus.halves.map((h, i) => (
                <path key={`bus-halo-${i}`} d={h.d} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
              ))}
              {bus.halves.map((h, i) => (
                <g key={`bus-${i}`}>
                  <motion.path
                    d={h.d}
                    fill="none"
                    stroke="url(#process-bus)"
                    strokeWidth={2.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.6, ease }}
                  />
                  <motion.polygon
                    points={h.head}
                    fill={h.color}
                    stroke="rgba(255,255,255,0.75)"
                    strokeWidth={1}
                    strokeLinejoin="round"
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: reduce ? 0 : 1.15 }}
                  />
                </g>
              ))}
            </g>
          ) : null}
          {paths.map((p, i) => (
            <g key={i}>
              <path d={p.d} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
              <motion.path
                d={p.d}
                fill="none"
                stroke={p.color}
                strokeWidth={2.6}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.6 + i * 0.07, ease }}
              />
              <motion.polygon
                points={p.head}
                fill={p.color}
                stroke="rgba(255,255,255,0.75)"
                strokeWidth={1}
                strokeLinejoin="round"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: reduce ? 0 : 1 + i * 0.07 }}
              />
            </g>
          ))}
        </svg>
      ) : null}
    </div>
  );
}

const KEY_ISSUES: {
  id: string;
  label: string;
  support: string;
  icon3d: string;
  tint: string;
  numSoft: string;
}[] = [
  {
    id: "scatter",
    label: "Information is scattered across stakeholders",
    support: "No single, unified view across agencies.",
    icon3d: issue3dScatter,
    tint: "#e8f1fd",
    numSoft: "linear-gradient(135deg,#2f86e6,#1565c9)",
  },
  {
    id: "share",
    label: "Data sharing is inconsistent",
    support: "Different formats, files and processes.",
    icon3d: issue3dShare,
    tint: "#fdf1e0",
    numSoft: "linear-gradient(135deg,#f7a93a,#e07f0c)",
  },
  {
    id: "visible",
    label: "Construction activity is not fully visible",
    support: "Some projects remain unmonitored.",
    icon3d: issue3dVisible,
    tint: "#f1eafd",
    numSoft: "linear-gradient(135deg,#8a55e6,#6428c8)",
  },
  {
    id: "demand",
    label: "CESS demand is difficult to assess",
    support: "Timely data is missing, so annual demand is underestimated.",
    icon3d: issue3dDemand,
    tint: "#e5f6ec",
    numSoft: "linear-gradient(135deg,#2bb573,#138a55)",
  },
  {
    id: "delay",
    label: "Remittance is often delayed",
    support: "Departments deduct CESS but do not remit within 30 days.",
    icon3d: issue3dDelay,
    tint: "#fdf4db",
    numSoft: "linear-gradient(135deg,#f5b820,#e39505)",
  },
  {
    id: "lumpsum",
    label: "Lump-sum transfer without details",
    support: "Bulk payments lack a project-wise or year-wise breakup.",
    icon3d: issue3dTrack,
    tint: "#fde7f0",
    numSoft: "linear-gradient(135deg,#ec4f9c,#c81e6f)",
  },
  {
    id: "transparent",
    label: "Fund status is not transparent",
    support: "The Board learns the status when auditors ask.",
    icon3d: impact3dVisibility,
    tint: "#e5f4f6",
    numSoft: "linear-gradient(135deg,#1aa6b8,#0e7c8a)",
  },
  {
    id: "interest",
    label: "Interest is lost on delayed funds",
    support: "Funds are not parked in nationalized banks on time.",
    icon3d: impact3dShortfall,
    tint: "#fde8e4",
    numSoft: "linear-gradient(135deg,#e85d4c,#c43324)",
  },
  {
    id: "audit",
    label: "Statutory audit objections",
    support: "Incomplete reconciliation and reporting gaps remain.",
    icon3d: issue3dRecon,
    tint: "#e6f0fc",
    numSoft: "linear-gradient(135deg,#2f86e6,#1565c9)",
  },
];

const IMPACTS: {
  id: string;
  label: string;
  support: string;
  icon3d: string;
}[] = [
  {
    id: "shortfall",
    label: "Collection Shortfall",
    support: "Only 30–40% of eligible CESS is collected (estimated).",
    icon3d: impact3dShortfall,
  },
  {
    id: "delay",
    label: "Delayed Remittance",
    support: "Agencies may not remit within the stipulated period.",
    icon3d: impact3dDelay,
  },
  {
    id: "recon",
    label: "Difficult Reconciliation",
    support: "Project-wise and year-wise matching is often not possible.",
    icon3d: impact3dRecon,
  },
  {
    id: "visibility",
    label: "Limited Compliance Visibility",
    support: "Outstanding amounts and exceptions are hard to follow up.",
    icon3d: impact3dVisibility,
  },
];

/** Loose papers drifting at the cloud edges (positions relative to the cloud box). */
type PaperContent = { title: string; lines: string[] };

const CLOUD_PAPERS: { left: string; top: string; rotate: number; flag?: boolean; doc: PaperContent }[] = [
  { left: "-2%", top: "46%", rotate: -16, flag: true, doc: { title: "PROJECT", lines: ["Site: Ward 12", "Cost: ₹12.5 Cr", "Not updated"] } },
  { left: "82%", top: "50%", rotate: 14, flag: true, doc: { title: "ASSESSMENT", lines: ["CESS @ 1%", "Due: ₹12.5 L", "Pending"] } },
  { left: "18%", top: "68%", rotate: -10, doc: { title: "CHALLAN", lines: ["Ref: 2024/118", "Amt: ₹4.2 L", "Mode: Online"] } },
  { left: "60%", top: "68%", rotate: 12, flag: true, doc: { title: "REMITTANCE", lines: ["Dept: PWD", "Period: Q2", "Delayed"] } },
];

/** Ghost buildings (viewBox 0 0 100 60) — tops used to seat the pins. */
const GHOST_BUILDINGS = [
  { x: 6, y: 12, w: 38, h: 48 },
  { x: 54, y: 28, w: 40, h: 32 },
] as const;

/** Red map pin with a question mark. */
function QuestionPin() {
  return (
    <svg width="20" height="26" viewBox="0 0 20 26" className="drop-shadow-[0_4px_6px_rgba(200,30,40,0.45)]" aria-hidden>
      <path d="M10 1C5 1 1 5 1 10c0 6.6 9 15 9 15s9-8.4 9-15c0-5-4-9-9-9z" fill="#e5262f" stroke="#ffffff" strokeWidth="1.2" />
      <text x="10" y="14.2" textAnchor="middle" fontSize="11" fontWeight="900" fill="#ffffff" fontFamily="inherit">
        ?
      </text>
    </svg>
  );
}

/** Faded construction outlined in red dashes — activity no office is tracking. */
function UnmonitoredSite({
  reduce,
  className,
  pins,
  label = false,
  delay,
}: {
  reduce: boolean;
  className: string;
  pins: number[];
  label?: boolean;
  delay: number;
}) {
  return (
    <motion.div
      className={cn("pointer-events-none absolute z-20", className)}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: reduce ? 0 : delay, ease }}
      aria-hidden
    >
      <div className="relative aspect-[100/60] w-full">
        <svg viewBox="0 0 100 60" className="absolute inset-0 h-full w-full overflow-visible">
          {GHOST_BUILDINGS.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="rgba(255,255,255,0.55)" />
              {Array.from({ length: Math.floor(b.h / 8) }, (_, r) => (
                <line key={`r${r}`} x1={b.x + 3} x2={b.x + b.w - 3} y1={b.y + 6 + r * 8} y2={b.y + 6 + r * 8} stroke="#9fb3cc" strokeWidth="0.8" opacity="0.6" />
              ))}
              {Array.from({ length: Math.floor(b.w / 9) }, (_, c) => (
                <line key={`c${c}`} y1={b.y + 3} y2={b.y + b.h} x1={b.x + 6 + c * 9} x2={b.x + 6 + c * 9} stroke="#9fb3cc" strokeWidth="0.8" opacity="0.45" />
              ))}
              <motion.rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                fill="none"
                stroke="#e5262f"
                strokeWidth="1.6"
                strokeDasharray="4 3"
                animate={reduce ? undefined : { strokeDashoffset: [0, -14] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
              />
            </g>
          ))}
        </svg>

        {pins.map((bi, i) => {
          const b = GHOST_BUILDINGS[bi];
          return (
            <motion.span
              key={bi}
              className="absolute -translate-x-1/2"
              style={{ left: `${b.x + b.w / 2}%`, bottom: `${((60 - b.y) / 60) * 100}%` }}
              animate={reduce ? undefined : { y: [0, -3, 0] }}
              transition={{ duration: 1.8 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
            >
              <QuestionPin />
            </motion.span>
          );
        })}

        {label && pins.length ? (() => {
          const b = GHOST_BUILDINGS[pins[0]];
          return (
            <span
              className="absolute w-max max-w-[120px] -translate-x-1/2 rounded-[8px] bg-[#fde8ea]/95 px-1.5 py-1 text-center text-[length:var(--ps-10)] leading-[1.15] font-extrabold text-[#c81e28] shadow-[0_4px_10px_rgba(200,30,40,0.18)] ring-1 ring-[#f5b8be]"
              style={{ left: `${b.x + b.w / 2}%`, bottom: `calc(${((60 - b.y) / 60) * 100}% + 34px)` }}
            >
              Unmonitored Construction Activity
              <span
                aria-hidden
                className="absolute top-full left-1/2 size-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-[#fde8ea] ring-1 ring-[#f5b8be] [clip-path:polygon(100%_0,100%_100%,0_100%)]"
              />
            </span>
          );
        })() : null}
      </div>
    </motion.div>
  );
}

/** Loose 3D document sheet: stacked back page, dog-ear, curled corner, title and details. */
function PaperDoc({ doc, flag, tilt = 1 }: { doc: PaperContent; flag?: boolean; tilt?: 1 | -1 }) {
  const id = useId().replace(/:/g, "");
  return (
    <span
      className="block"
      style={{ transform: `perspective(160px) rotateY(${-16 * tilt}deg) rotateX(10deg)`, transformStyle: "preserve-3d" }}
    >
      <svg width="62" height="76" viewBox="0 0 44 54" className="drop-shadow-[0_8px_10px_rgba(7,20,51,0.45)]" aria-hidden>
        <defs>
          <linearGradient id={`${id}-face`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f3f6fa" />
            <stop offset="100%" stopColor="#dde4ee" />
          </linearGradient>
          <linearGradient id={`${id}-ear`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#c9d3e0" />
            <stop offset="100%" stopColor="#f7f9fc" />
          </linearGradient>
          <linearGradient id={`${id}-curl`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#b9c4d3" />
          </linearGradient>
        </defs>
        <path d="M7 6h24l9 9v35H7z" fill="#dbe2ec" stroke="#c3cddb" strokeWidth="0.8" />
        <path
          d="M3 2h25l10 10v33c-3 0-6 1.2-8 3.6L28 51H3z"
          fill={`url(#${id}-face)`}
          stroke="#cfd8e4"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        <path d="M28 2v8.5c0 .8.7 1.5 1.5 1.5H38z" fill={`url(#${id}-ear)`} stroke="#c3cddb" strokeWidth="0.6" />
        <path d="M28 51l2-2.4c2-2.4 5-3.6 8-3.6-1 3.2-4 5.4-10 6z" fill={`url(#${id}-curl)`} stroke="#bcc7d6" strokeWidth="0.5" />
        <rect x="6.5" y="6" width="12" height="2.2" rx="1.1" fill="#3b4b63" />
        <text x="6.5" y="17" fontSize="4.3" fontWeight="800" fill="#1f2d44" letterSpacing="0.1" fontFamily="inherit">
          {doc.title}
        </text>
        <rect x="6.5" y="19" width="25" height="0.8" rx="0.4" fill="#3a78c9" />
        {doc.lines.map((line, i) => (
          <text
            key={line}
            x="6.5"
            y={24.5 + i * 5}
            fontSize="3.3"
            fontWeight={i === doc.lines.length - 1 && flag ? 800 : 600}
            fill={i === doc.lines.length - 1 && flag ? "#d9660f" : "#4a5870"}
            fontFamily="inherit"
          >
            {line}
          </text>
        ))}
        <rect x="6.5" y="38" width="24" height="1.3" rx="0.65" fill="#a3aec0" />
        <rect x="6.5" y="41.2" width={flag ? 11 : 18} height="1.3" rx="0.65" fill="#a3aec0" />
        {flag ? (
          <path d="M20 44c2-2.4 3.4-2.4 4.2 0s2.2 2.4 3.8 0 2.8-1.6 3.6.4" fill="none" stroke="#f08a24" strokeWidth="1.4" strokeLinecap="round" />
        ) : null}
      </svg>
    </span>
  );
}

const STAGE_TYPE = {
  containerType: "size",
  "--ps-22": stageFont(22, 14),
  "--ps-18": stageFont(18, 11),
  "--ps-16": stageFont(16, 10),
  "--ps-15": stageFont(15, 10),
  "--ps-14": stageFont(14, 9),
  "--ps-10": stageFont(10, 8),
} as CSSProperties;

/** Full poster-style Current Issues stage. */
export function ProblemStage({ beat: _beat }: { beat: number }) {
  const reduce = useReducedMotion();
  const cloudRef = useRef<HTMLDivElement>(null);
  const middleRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const centerRef = useRef<HTMLDivElement>(null);
  const [bgBottom, setBgBottom] = useState<number | null>(null);

  useEffect(() => {
    const center = centerRef.current;
    const rail = railRef.current;
    if (!center || !rail) return;
    const sync = () => setBgBottom(Math.max(0, center.clientHeight - rail.offsetTop - 14));
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(center);
    ro.observe(rail);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        ...STAGE_TYPE,
        backgroundImage:
          "radial-gradient(ellipse 70% 60% at 50% 62%, #d8eaf9 0%, rgba(216,234,249,0) 100%), radial-gradient(ellipse 60% 40% at 50% 0%, #d6ecfd 0%, rgba(214,236,253,0) 100%), linear-gradient(180deg, #e8f4fd 0%, #e6f1fb 55%, #e3f0fb 100%)",
      }}
    >
      {/* Main three columns — title lives in App header */}
      <section className="relative z-10 grid min-h-0 flex-1 grid-cols-[22%_minmax(0,1fr)_26%] gap-1.5 pb-1.5">
        {/* Left — CESS ecosystem */}
        <motion.aside
          className="flex min-h-0 flex-col overflow-hidden rounded-[18px] border border-[rgba(80,150,220,.28)] bg-[rgba(255,255,255,.9)] shadow-[0_10px_28px_rgba(29,82,130,.12)]"
          initial={reduce ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease }}
        >
          <div className="flex h-14 shrink-0 items-center gap-2.5 bg-[linear-gradient(90deg,#0a5fc0,#1f86e0)] px-3 text-white">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15 ring-2 ring-white/70">
              <Bank weight="fill" className="size-5" />
            </span>
            <div className="min-w-0 leading-tight">
              <div className="font-display text-[length:var(--ps-18)] font-black tracking-wide">CESS ECOSYSTEM</div>
              <div className="text-[length:var(--ps-14)] font-semibold text-white/90">(Multiple Stakeholders)</div>
            </div>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] grid-rows-6 gap-1.5 p-1.5">
            {STAKEHOLDERS.map((s, i) => (
              <Stagger key={s.id} delay={40 + i * 40} className="h-full min-h-0">
                <motion.div
                  className="group relative flex h-full min-h-0 items-center gap-2.5 overflow-hidden rounded-[14px] bg-[linear-gradient(90deg,#f4f9ff,#eaf3fc)] px-2 py-1 shadow-[0_4px_12px_rgba(40,90,140,0.08)] ring-1 ring-[#0b2f5c]/[0.06]"
                  whileHover={reduce ? undefined : { y: -1, scale: 1.01 }}
                  transition={{ duration: 0.18 }}
                >
                  <motion.img
                    src={s.photo}
                    alt=""
                    aria-hidden
                    draggable={false}
                    className="pointer-events-none absolute inset-y-0 right-0 z-0 h-full w-[46%] object-cover object-right select-none"
                    style={{
                      maskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.7) 28%, black 55%)",
                      WebkitMaskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.7) 28%, black 55%)",
                    }}
                    initial={reduce ? false : { opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: reduce ? 0 : 0.15 + i * 0.06, ease }}
                  />
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[78%] bg-[linear-gradient(90deg,rgba(244,249,255,0.97)_0%,rgba(240,247,254,0.9)_55%,rgba(236,245,253,0.55)_80%,transparent_100%)]"
                  />
                  <span
                    className="relative z-10 grid size-11 shrink-0 place-items-center rounded-full text-white shadow-[0_4px_10px_rgba(0,40,100,0.25)] ring-2 ring-white"
                    style={{ background: s.soft }}
                    aria-hidden
                  >
                    <s.Icon weight="fill" className="size-5" />
                  </span>
                  <span className="relative z-10 min-w-0 flex-1 pr-[22%] leading-tight [@container(height<=600px)]:pr-[8%]">
                    <span className="font-display block text-[length:var(--ps-18)] leading-[1.1] font-extrabold text-[#102b57]">
                      {s.label}
                    </span>
                    <span className="mt-0.5 line-clamp-3 block text-[length:var(--ps-14)] leading-[1.2] font-semibold text-[#52708e] [@container(600px<height<=760px)]:line-clamp-2 [@container(height<=600px)]:line-clamp-1">
                      {s.support}
                    </span>
                  </span>
                </motion.div>
              </Stagger>
            ))}
          </div>
        </motion.aside>

        {/* Center — systems + fragmented data */}
        <motion.div
          ref={centerRef}
          className="relative flex min-h-0 flex-col overflow-hidden"
          initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease, delay: reduce ? 0 : 0.06 }}
        >
          <img
            src={siteBg}
            alt=""
            aria-hidden
            draggable={false}
            className="pointer-events-none absolute inset-x-0 top-0 z-0 w-full object-cover object-bottom select-none"
            style={{
              height: bgBottom == null ? "100%" : `calc(100% - ${bgBottom}px)`,
              maskImage: "linear-gradient(180deg, black 92%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(180deg, black 92%, transparent 100%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(232,243,252,.45) 0%, rgba(232,243,252,.06) 40%, rgba(232,243,252,0) 70%)",
            }}
          />

          <div className="relative z-10 flex h-8 w-full shrink-0 items-center justify-center rounded-[12px] bg-[linear-gradient(90deg,#0879d2,#2b8fe3)] px-3 text-white shadow-[0_6px_16px_rgba(8,121,210,0.35)]">
            <span className="font-display text-[length:var(--ps-14)] font-extrabold tracking-wide">
              Different Systems, Different Data
            </span>
          </div>

          {/* System stamps */}
          <div className="relative z-10 mt-1.5 grid shrink-0 grid-cols-6 px-2" style={{ gap: SYSTEM_GAP }}>
            {SYSTEMS.map((sys, i) => (
              <Stagger key={sys.id} delay={80 + i * 35}>
                <motion.div
                  className="flex h-full flex-col items-center rounded-[14px] px-0.5 pt-1 pb-1.5 text-center shadow-[0_6px_16px_rgba(50,90,120,.12)] ring-1 ring-white/80"
                  style={{ background: `linear-gradient(180deg, ${sys.tint} 0%, #ffffff 130%)` }}
                  whileHover={reduce ? undefined : { y: -2 }}
                  transition={{ duration: 0.18 }}
                >
                  <motion.img
                    src={sys.img}
                    alt=""
                    aria-hidden
                    draggable={false}
                    className="pointer-events-none mb-0.5 size-11 object-contain mix-blend-multiply select-none"
                    initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: reduce ? 0 : 0.15 + i * 0.05, ease }}
                  />
                  <strong className="text-[length:var(--ps-16)] leading-tight font-extrabold text-[#102b57]">
                    {sys.label}
                  </strong>
                </motion.div>
              </Stagger>
            ))}
          </div>

          {/* Story middle — ribbons → cloud → drop arrows */}
          <div ref={middleRef} className="relative z-10 mt-0.5 min-h-0 flex-1">
            <SystemArrows reduce={!!reduce} cloudRef={cloudRef} />

            {/* Unmonitored construction */}
            <UnmonitoredSite reduce={!!reduce} className="bottom-[8%] left-[1.5%] w-[19%]" pins={[0, 1]} delay={0.55} />
            <UnmonitoredSite reduce={!!reduce} className="right-[1.5%] bottom-[8%] w-[22%]" pins={[0]} label delay={0.65} />

            {/* Fragmented cloud — visual hub */}
            <motion.div
              ref={cloudRef}
              className="absolute left-1/2 z-30 aspect-[720/367] w-[54%] max-w-[340px] -translate-x-1/2 -translate-y-1/2 text-white"
              style={{ top: `${CLOUD_Y * 100}%` }}
              initial={reduce ? false : { opacity: 0, scale: 0.86, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: reduce ? 0 : 0.35, ease }}
            >
              {!reduce ? (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute inset-[-12%] rounded-[50%] bg-[radial-gradient(ellipse,rgba(239,38,48,0.2),transparent_65%)]"
                  animate={{ scale: [0.94, 1.06, 0.94], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : null}

              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-[-10%] inset-y-[-16%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.85)_0%,rgba(235,244,253,0.55)_45%,transparent_70%)]"
              />
              <img
                src={cloud3d}
                alt=""
                aria-hidden
                draggable={false}
                className="pointer-events-none absolute inset-0 h-full w-full object-contain select-none"
              />

              {!reduce ? (
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute top-[40%] left-[71%] z-10 size-[9%] -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-[#ef2630]"
                  animate={{ scale: [1, 1.9], opacity: [0.8, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                />
              ) : null}

              <h2 className="font-display absolute inset-x-0 top-[52%] z-10 text-center text-[length:var(--ps-22)] leading-[1.1] font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
                Fragmented
                <br />
                CESS Data
              </h2>

              {CLOUD_PAPERS.map((p, i) => (
                <motion.span
                  key={i}
                  aria-hidden
                  className="pointer-events-none absolute z-20"
                  style={{ left: p.left, top: p.top }}
                  initial={reduce ? false : { opacity: 0, scale: 0.6 }}
                  animate={
                    reduce
                      ? { opacity: 1, scale: 1, rotate: p.rotate }
                      : { opacity: 1, scale: 1, rotate: [p.rotate, p.rotate + 6, p.rotate], y: [0, -3, 0] }
                  }
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          opacity: { duration: 0.3, delay: 0.7 + i * 0.08 },
                          scale: { duration: 0.3, delay: 0.7 + i * 0.08 },
                          rotate: { duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut" },
                          y: { duration: 2.6 + i * 0.25, repeat: Infinity, ease: "easeInOut" },
                        }
                  }
                >
                  <PaperDoc doc={p.doc} flag={p.flag} tilt={p.rotate < 0 ? 1 : -1} />
                </motion.span>
              ))}
            </motion.div>

          </div>

          {/* Process rail */}
          <div ref={railRef} className="relative z-20 mb-2 grid shrink-0 grid-cols-5 gap-7 px-2">
            {PROCESS.map((step, i) => (
              <Stagger key={step.id} delay={220 + i * 45} className="relative">
                <motion.div
                  className="flex h-full flex-col items-center justify-center gap-1 rounded-[16px] px-1 pt-1.5 pb-2 text-center shadow-[0_6px_16px_rgba(40,80,110,.14),inset_0_1px_0_rgba(255,255,255,.95)] ring-1 ring-white/90"
                  style={{ background: `linear-gradient(180deg, rgba(255,255,255,.97) 0%, ${step.tint} 100%)` }}
                  whileHover={reduce ? undefined : { y: -2 }}
                >
                  <motion.img
                    src={step.img}
                    alt=""
                    aria-hidden
                    draggable={false}
                    className="pointer-events-none size-12 shrink-0 object-contain mix-blend-multiply select-none"
                    initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: reduce ? 0 : 0.3 + i * 0.06, ease }}
                  />
                  <strong className="text-[length:var(--ps-16)] leading-tight font-extrabold text-[#102b57]">
                    {step.label}
                  </strong>
                </motion.div>
                {i < PROCESS.length - 1 ? (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute top-1/2 -right-[23px] z-10 flex -translate-y-1/2 items-center"
                    animate={reduce ? undefined : { x: [0, 3, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                  >
                    <svg width="18" height="20" viewBox="0 0 12 14" className="overflow-visible drop-shadow-[0_2px_3px_rgba(0,0,0,0.15)]">
                      <path d="M0 4.5h5.5V0L12 7l-6.5 7V9.5H0z" fill={PROCESS_ARROW_COLORS[i]} />
                    </svg>
                  </motion.span>
                ) : null}
              </Stagger>
            ))}
          </div>

          <ProcessBranches reduce={!!reduce} middleRef={middleRef} cloudRef={cloudRef} railRef={railRef} />
        </motion.div>

        {/* Right — Key issues */}
        <motion.aside
          className="flex min-h-0 flex-col overflow-hidden rounded-[18px] border border-[rgba(80,150,220,.28)] bg-[rgba(255,255,255,.9)] shadow-[0_10px_28px_rgba(29,82,130,.12)]"
          initial={reduce ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease, delay: reduce ? 0 : 0.08 }}
        >
          <div className="flex h-10 shrink-0 items-center gap-2 bg-[linear-gradient(90deg,#ed252d,#ff3b3f)] px-3 text-white">
            <span className="grid size-7 place-items-center rounded-full bg-white text-[#ed252d] shadow-sm">
              <WarningCircle weight="fill" className="size-3.5" />
            </span>
            <span className="font-display text-[length:var(--ps-14)] font-extrabold tracking-wide">KEY ISSUES</span>
          </div>
          <div
            className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] gap-0.5 p-1"
            style={{ gridTemplateRows: `repeat(${KEY_ISSUES.length}, minmax(0, 1fr))` }}
          >
            {KEY_ISSUES.map((issue, i) => (
              <Stagger key={issue.id} delay={100 + i * 40} className="h-full min-h-0">
                <motion.div
                  className="flex h-full min-h-0 items-center gap-1.5 overflow-hidden rounded-[10px] px-1 py-0.5 shadow-[0_3px_10px_rgba(40,70,110,0.08)] ring-1 ring-[#0b2f5c]/[0.06]"
                  style={{ background: `linear-gradient(90deg, ${issue.tint} 0%, #ffffff 75%)` }}
                  whileHover={reduce ? undefined : { x: 2 }}
                  transition={{ duration: 0.18 }}
                >
                  <span
                    className="grid size-7 shrink-0 place-items-center rounded-full text-[length:var(--ps-10)] font-black text-white shadow-[0_4px_10px_rgba(0,0,0,0.18)] ring-2 ring-white"
                    style={{ background: issue.numSoft }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="relative aspect-square h-[88%] max-h-10 shrink-0 overflow-hidden rounded-[8px] shadow-[0_3px_8px_rgba(40,70,110,0.12)] ring-1 ring-white"
                    style={{ background: `linear-gradient(135deg, #ffffff 0%, ${issue.tint} 100%)` }}
                  >
                    <motion.img
                      src={issue.icon3d}
                      alt=""
                      aria-hidden
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-contain mix-blend-multiply select-none"
                      initial={reduce ? false : { scale: 0.7, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, delay: reduce ? 0 : 0.25 + i * 0.06, ease }}
                    />
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="font-display block text-[length:var(--ps-14)] leading-[1.05] font-extrabold text-[#102b57]">
                      {issue.label}
                    </span>
                    <span className="mt-px line-clamp-2 block text-[length:var(--ps-10)] leading-[1.15] font-semibold text-[#5d7186]">
                      {issue.support}
                    </span>
                  </span>
                </motion.div>
              </Stagger>
            ))}
          </div>
        </motion.aside>
      </section>

      {/* Impact footer */}
      <motion.section
        className="relative z-10 grid h-[13%] min-h-[78px] shrink-0 grid-cols-[15%_repeat(4,1fr)] overflow-hidden rounded-[16px] border border-[#bcdcf2] bg-[rgba(255,255,255,.94)] shadow-[0_8px_20px_rgba(40,80,120,.1)]"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease, delay: reduce ? 0 : 0.15 }}
      >
        <div className="relative h-full">
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 right-0 bg-[#9fd0f5]"
            style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)" }}
          />
          <div
            className="relative flex h-full items-center gap-2.5 bg-[linear-gradient(110deg,#062d63,#0a5cb0)] pr-6 pl-3 text-white"
            style={{ clipPath: "polygon(0 0, calc(100% - 34px) 0, calc(100% - 18px) 50%, calc(100% - 34px) 100%, 0 100%)" }}
          >
            <ChartLineUp weight="bold" className="size-7 shrink-0 text-white/95" aria-hidden />
            <div className="font-display text-[length:var(--ps-18)] leading-tight font-black">
              IMPACT
              <br />
              ON THE BOARD
            </div>
          </div>
        </div>
        {IMPACTS.map((item, i) => (
          <Stagger key={item.id} delay={280 + i * 50} className="h-full min-h-0">
            <div
              className={cn(
                "flex h-full items-center gap-2.5 px-3",
                i < IMPACTS.length - 1 && "border-r border-[#d9e7f2]",
              )}
            >
              <motion.img
                src={item.icon3d}
                alt=""
                aria-hidden
                draggable={false}
                className="h-[78%] max-h-16 w-auto shrink-0 object-contain mix-blend-multiply select-none"
                initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: reduce ? 0 : 0.4 + i * 0.08, ease }}
              />
              <div className="min-w-0 leading-tight">
                <div className="font-display text-[length:var(--ps-18)] font-extrabold text-[#102b57]">{item.label}</div>
                <div className="mt-0.5 text-[length:var(--ps-14)] leading-snug font-semibold text-[#61778c]">
                  {item.support}
                </div>
              </div>
            </div>
          </Stagger>
        ))}
      </motion.section>
    </div>
  );
}
