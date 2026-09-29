import { useEffect, useRef, useState, Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowRight,
  Bank,
  Buildings,
  ChartBar,
  ChartLineDown,
  Database,
  Drop,
  FileText,
  HardHat,
  MapPin,
  UsersThree,
  WarningCircle,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Stagger } from "@/components/SlideKit";
import problemStageBg from "@/assets/problem-stage-bg.png";
import sourcePhotoBpa from "@/assets/source-photo-bpa.png";
import sourcePhotoGov from "@/assets/source-photo-gov.png";
import sourcePhotoUlb from "@/assets/source-photo-ulb.png";
import sourcePhotoPlan from "@/assets/source-photo-plan.png";
import sourcePhotoUtil from "@/assets/source-photo-util.png";
import sourcePhotoBld from "@/assets/source-photo-bld.png";
import icon3dLinkBreak from "@/assets/icon-link-break.png";
import icon3dScales from "@/assets/icon-3d-scales.png";
import icon3dClock from "@/assets/icon-3d-clock.png";
import icon3dWallet from "@/assets/icon-3d-wallet.png";
import icon3dUsers from "@/assets/icon-3d-users.png";
import icon3dClockRed from "@/assets/icon-3d-clock-red.png";
import icon3dRupee from "@/assets/icon-3d-rupee.png";
import icon3dFile from "@/assets/icon-3d-file.png";
import icon3dTarget from "@/assets/icon-3d-target.png";
import icon3dManyFiles from "@/assets/icon-3d-many-files.png";
import icon3dMismatch from "@/assets/icon-3d-mismatch.png";
import icon3dMagnify from "@/assets/icon-magnify.png";
import icon3dClockClay from "@/assets/icon-3d-clock-clay.png";

const ease = [0.22, 1, 0.36, 1] as const;

/** Fallback connector geometry — live edges override this after measure. */
const FLOW_GEO = {
  srcX: 19.0,
  hubLeft: 27.4,
  hubRight: 66.7,
  impactX: 76.6,
} as const;

type FlowGeo = {
  srcX: number;
  hubLeft: number;
  hubRight: number;
  impactX: number;
};

const SOURCES: {
  id: string;
  label: string;
  holds: string;
  Icon: CessIcon;
  soft: string;
  photo: string;
  photoPos?: string;
}[] = [
  {
    id: "bpa",
    label: "Building plan",
    holds: "Sanctions & approvals",
    Icon: FileText,
    soft: "linear-gradient(135deg,#1a9cf5,#0d6fd4)",
    photo: sourcePhotoBpa,
    photoPos: "right center",
  },
  {
    id: "gov",
    label: "Departments",
    holds: "Project files & clearances",
    Icon: Bank,
    soft: "linear-gradient(135deg,#1ab8bc,#0e8a8e)",
    photo: sourcePhotoGov,
    photoPos: "right center",
  },
  {
    id: "ulb",
    label: "ULBs",
    holds: "Permits & collections",
    Icon: Buildings,
    soft: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
    photo: sourcePhotoUlb,
    photoPos: "right center",
  },
  {
    id: "plan",
    label: "Planning",
    holds: "Zoning & land use",
    Icon: MapPin,
    soft: "linear-gradient(135deg,#fbbf24,#d97706)",
    photo: sourcePhotoPlan,
    photoPos: "right center",
  },
  {
    id: "util",
    label: "Utilities",
    holds: "Service connections",
    Icon: Drop,
    soft: "linear-gradient(135deg,#3b82f6,#1d4ed8)",
    photo: sourcePhotoUtil,
    photoPos: "right center",
  },
  {
    id: "bld",
    label: "Builders",
    holds: "Returns & payments",
    Icon: HardHat,
    soft: "linear-gradient(135deg,#34d399,#059669)",
    photo: sourcePhotoBld,
    photoPos: "right center",
  },
];

const KEY_PROBLEMS: {
  id: string;
  label: string;
  support: string;
  icon3d: string;
  accent: string;
  soft: string;
}[] = [
  {
    id: "file",
    label: "Data spread across departments and files.",
    support: "No single project file",
    icon3d: icon3dLinkBreak,
    accent: "#ef4444",
    soft: "linear-gradient(90deg,#fff0f0,#fff9f9)",
  },
  {
    id: "match",
    label: "Inconsistent information between offices.",
    support: "Records do not match",
    icon3d: icon3dScales,
    accent: "#147fe8",
    soft: "linear-gradient(90deg,#eff7ff,#fbfdff)",
  },
  {
    id: "delay",
    label: "Slow processing and manual follow-ups.",
    support: "Delays in CESS collection",
    icon3d: icon3dClock,
    accent: "#f59e0b",
    soft: "linear-gradient(90deg,#fff8e8,#fffdf7)",
  },
  {
    id: "exception",
    label: "Hard to track unpaid or under-reported CESS.",
    support: "Potential exception risk",
    icon3d: icon3dWallet,
    accent: "#7c3aed",
    soft: "linear-gradient(90deg,#f5efff,#fffaff)",
  },
  {
    id: "welfare",
    label: "Funds reach workers later than they should.",
    support: "Less welfare for workers",
    icon3d: icon3dUsers,
    accent: "#10a879",
    soft: "linear-gradient(90deg,#ecfbf6,#fbfffd)",
  },
];

const IMPACTS: {
  id: string;
  label: string;
  support: string;
  icon3d: string;
  EndIcon: CessIcon;
  accent: string;
  soft: string;
  endSoft: string;
}[] = [
  {
    id: "delayed",
    label: "Projects not tracked in real time",
    support: "Delayed collections",
    icon3d: icon3dClockRed,
    EndIcon: ChartBar,
    accent: "#ef4444",
    soft: "linear-gradient(90deg,#fff1f1,#fffafa)",
    endSoft: "#ffe4e4",
  },
  {
    id: "exception",
    label: "Under-reported or unpaid CESS",
    support: "Potential exception",
    icon3d: icon3dRupee,
    EndIcon: ChartLineDown,
    accent: "#f59e0b",
    soft: "linear-gradient(90deg,#fff8eb,#fffcf5)",
    endSoft: "#ffedd5",
  },
  {
    id: "data",
    label: "Different records in each department",
    support: "Inconsistent data",
    icon3d: icon3dFile,
    EndIcon: Database,
    accent: "#3b82f6",
    soft: "linear-gradient(90deg,#eff6ff,#f8fbff)",
    endSoft: "#dbeafe",
  },
  {
    id: "welfare",
    label: "Delay in funds reaching workers",
    support: "Reduced welfare for workers",
    icon3d: icon3dUsers,
    EndIcon: UsersThree,
    accent: "#10b981",
    soft: "linear-gradient(90deg,#ecfdf5,#f6fffb)",
    endSoft: "#d1fae5",
  },
];

const WHAT_WRONG: {
  label: string;
  support: string;
  icon3d: string;
}[] = [
  { label: "Each office keeps its own records", support: "Many files", icon3d: icon3dManyFiles },
  { label: "Inconsistent information", support: "Different details", icon3d: icon3dMismatch },
  { label: "Time-consuming reconciliations", support: "Hard to verify", icon3d: icon3dMagnify },
  { label: "Less clarity. Less for welfare", support: "Delayed collection", icon3d: icon3dClockClay },
];

/** Source → hub — Y matches measured source-row midpoints. */
const LEFT_FLOW = [
  { y: 16.7, hubY: 28, color: "#1687ef" },
  { y: 31.5, hubY: 40, color: "#16a5a5" },
  { y: 46.4, hubY: 52, color: "#7c3aed" },
  { y: 61.3, hubY: 64, color: "#f59e0b" },
  { y: 76.1, hubY: 76, color: "#1476e8" },
  { y: 90.9, hubY: 88, color: "#10b981" },
] as const;

/** Hub → impact — Y matches measured impact-row midpoints. */
const RIGHT_FLOW = [
  { y: 26.8, hubY: 36, color: "#ef4444" },
  { y: 47.2, hubY: 50, color: "#f59e0b" },
  { y: 67.7, hubY: 64, color: "#147fe8" },
  { y: 88.0, hubY: 78, color: "#10a879" },
] as const;

/** Full-bleed problem canvas — sources · key problems · impact. */
export function ProblemStage({ beat: _beat }: { beat: number }) {
  const reduce = useReducedMotion();
  const boardRef = useRef<HTMLElement>(null);
  const sourceRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<FlowGeo>({ ...FLOW_GEO });

  useEffect(() => {
    const board = boardRef.current;
    const source = sourceRef.current;
    const hub = hubRef.current;
    const impact = impactRef.current;
    if (!board || !source || !hub || !impact) return;

    const sync = () => {
      const b = board.getBoundingClientRect();
      if (b.width < 8 || b.height < 8) return;
      // Prefer the visible plaque (first child) so rails meet the white card border.
      const sourceEl = (source.firstElementChild as HTMLElement | null) ?? source;
      const hubEl = (hub.firstElementChild as HTMLElement | null) ?? hub;
      const impactEl = (impact.firstElementChild as HTMLElement | null) ?? impact;
      const s = sourceEl.getBoundingClientRect();
      const h = hubEl.getBoundingClientRect();
      const im = impactEl.getBoundingClientRect();
      // End rails just outside each plaque so strokes + packets kiss the border, never enter it.
      const gap = (12 / b.width) * 100;
      setGeo({
        srcX: ((s.right - b.left) / b.width) * 100 + gap * 0.35,
        hubLeft: ((h.left - b.left) / b.width) * 100 - gap,
        hubRight: ((h.right - b.left) / b.width) * 100 + gap,
        impactX: ((im.left - b.left) / b.width) * 100 - gap,
      });
    };

    sync();
    const raf = requestAnimationFrame(sync);
    const ro = new ResizeObserver(sync);
    ro.observe(board);
    ro.observe(source);
    ro.observe(hub);
    ro.observe(impact);
    window.addEventListener("resize", sync);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, []);

  return (
    <div
      className="relative flex h-full min-h-0 flex-col gap-2 overflow-hidden rounded-2xl p-2.5 shadow-[0_12px_36px_rgba(7,20,51,0.1)] ring-1 ring-navy/8"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <img
        src={problemStageBg}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full scale-[1.02] object-cover object-[center_38%] select-none"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: `
            linear-gradient(155deg, rgba(234,246,255,0.82) 0%, rgba(215,237,255,0.48) 48%, rgba(237,247,255,0.72) 100%),
            radial-gradient(ellipse 55% 40% at 72% 18%, rgba(120,205,255,0.42) 0%, transparent 62%),
            radial-gradient(ellipse 45% 35% at 12% 88%, rgba(102,180,255,0.28) 0%, transparent 58%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.65) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          maskImage: "linear-gradient(to bottom, black, transparent 82%)",
        }}
      />

      {/* Hero */}
      <section className="relative z-10">
        <motion.div
          className="min-w-0 max-w-[40rem]"
          initial={reduce ? false : { opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease }}
        >
          <div className="text-[9px] font-bold tracking-[0.18em] text-[#0087bd] uppercase">
            Government of Karnataka · Labour CESS
          </div>
          <h1 className="mt-0.5 font-display text-[28px] leading-[1.05] font-extrabold tracking-[-0.04em] text-navy">
            Problem <span className="text-[#1476e8]">Statement</span>
          </h1>
          <p className="mt-1.5 max-w-[36rem] text-[13px] leading-snug font-semibold text-[#456489]">
            Today, construction CESS details sit across many offices and files.
            This brings delays, mismatched records, and less for worker welfare.
          </p>
        </motion.div>
      </section>

      {/* Board */}
      <section
        ref={boardRef}
        className="relative z-10 min-h-0 flex-1"
      >
        <BoardConnectors reduce={!!reduce} geo={geo} />

        <div className="relative z-10 grid h-full min-h-0 grid-cols-[minmax(132px,0.4fr)_minmax(0,1fr)_minmax(168px,0.52fr)] gap-3">
        {/* Sources — 3D plaque */}
        <motion.div
          ref={sourceRef}
          className="relative z-10 flex min-h-0 flex-col"
          initial={reduce ? false : { opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <div
            className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/70 bg-[linear-gradient(165deg,rgba(255,255,255,0.97)_0%,rgba(236,247,255,0.9)_55%,rgba(220,236,252,0.88)_100%)] px-2 pt-2 pb-2 shadow-[0_22px_40px_rgba(20,55,110,0.16),0_8px_16px_rgba(20,55,110,0.08),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-10px_22px_rgba(80,140,200,0.08)] backdrop-blur-[16px]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-3 top-0 z-0 h-10 rounded-b-[40%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.95),transparent_70%)]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-4 bottom-1 z-0 h-3 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,70,140,0.18),transparent_70%)] blur-[2px]"
            />
            <div className="relative z-10 flex min-h-0 flex-1 flex-col gap-1">
              <SectionHead
                Icon={Buildings}
                title="Source offices"
                support="Where details are scattered"
                delay={0}
                reduce={!!reduce}
                compact
                highlight
              />
              <div className="grid min-h-0 flex-1 grid-rows-6 gap-1">
                {SOURCES.map((s, i) => (
                  <Stagger key={s.id} delay={70 + i * 45} className="h-full min-h-0">
                    <motion.div
                      className="group relative flex h-full min-h-0 items-center gap-1.5 overflow-hidden rounded-[14px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(240,248,255,0.88))] px-1.5 py-0.5 shadow-[0_8px_16px_rgba(40,90,150,0.12),inset_0_1px_0_rgba(255,255,255,1),inset_0_-3px_8px_rgba(90,140,190,0.08)]"
                      whileHover={reduce ? undefined : { y: -2, scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img
                        src={s.photo}
                        alt=""
                        aria-hidden
                        draggable={false}
                        className="pointer-events-none absolute inset-y-0 right-0 z-0 h-full w-[48%] object-cover select-none"
                        style={{
                          objectPosition: s.photoPos ?? "right center",
                          maskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.45) 28%, black 62%)",
                          WebkitMaskImage:
                            "linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.45) 28%, black 62%)",
                        }}
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[64%] bg-[linear-gradient(90deg,rgba(255,255,255,0.94)_0%,rgba(255,255,255,0.78)_55%,transparent_100%)]"
                      />
                      <span
                        className="relative z-10 grid size-6 shrink-0 place-items-center rounded-full text-white shadow-[0_4px_10px_rgba(0,80,180,0.22),inset_0_1px_0_rgba(255,255,255,0.35)] ring-2 ring-white/95"
                        style={{ background: s.soft }}
                        aria-hidden
                      >
                        <s.Icon weight="fill" className="size-3" />
                      </span>
                      <span className="relative z-10 min-w-0 flex-1 pr-0.5 leading-tight">
                        <span className="font-display block truncate text-[10px] font-bold text-navy">{s.label}</span>
                        <span className="block truncate text-[8px] font-semibold text-[#6b82a0]">{s.holds}</span>
                      </span>
                    </motion.div>
                  </Stagger>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Hub — 3D plaque */}
        <motion.div
          ref={hubRef}
          className="relative z-10 flex min-h-0 w-full flex-col items-center"
          initial={reduce ? false : { opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease, delay: reduce ? 0 : 0.08 }}
        >
          <div className="relative flex h-full min-h-0 w-full max-w-[520px] flex-col overflow-visible rounded-[24px] border border-white/75 bg-[linear-gradient(165deg,rgba(255,255,255,0.98)_0%,rgba(239,248,255,0.92)_48%,rgba(255,242,242,0.88)_100%)] px-3 pt-3 pb-2.5 shadow-[0_26px_48px_rgba(20,55,110,0.18),0_10px_18px_rgba(180,40,40,0.06),inset_0_1px_0_rgba(255,255,255,1),inset_0_-12px_28px_rgba(120,150,200,0.1)] backdrop-blur-[18px]">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-4 top-0 z-0 h-12 rounded-b-[50%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,1),transparent_72%)]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-5 bottom-1.5 z-0 h-3.5 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,60,130,0.2),transparent_72%)] blur-[2px]"
            />
            {!reduce ? (
              <>
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-[42%] z-0 h-[230px] w-[230px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(20,118,232,0.12), transparent 68%)",
                  }}
                  animate={{ scale: [0.92, 1.12, 0.92], opacity: [0.55, 1, 0.55] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.span
                  aria-hidden
                  className="pointer-events-none absolute left-1/2 top-[42%] z-0 h-[175px] w-[175px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(239,68,68,0.16), transparent 68%)",
                  }}
                  animate={{ scale: [1.05, 0.92, 1.05], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                />
              </>
            ) : null}

            <div className="relative z-10 shrink-0 text-center">
              <motion.span
                className="mx-auto mb-1 grid size-9 place-items-center rounded-[13px] bg-[linear-gradient(145deg,#ff6b6b,#e83b3b)] text-white shadow-[0_10px_20px_rgba(239,68,68,0.32),inset_0_1px_0_rgba(255,255,255,0.4)]"
                animate={reduce ? undefined : { y: [0, -2, 0], rotate: [0, -4, 0, 4, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <WarningCircle weight="fill" className="size-5" />
              </motion.span>
              <h2 className="font-display text-[20px] font-extrabold tracking-tight text-navy">
                Key <span className="text-[#e83b3b]">Problems</span>
              </h2>
              <p className="mt-0.5 text-[10px] leading-snug font-semibold text-[#71809a]">
                These gaps lead to delays and less welfare for workers.
              </p>
            </div>

            <div className="relative z-10 mt-2 grid min-h-0 flex-1 grid-rows-5 gap-1.5">
              {KEY_PROBLEMS.map((p, i) => (
                <Stagger key={p.id} delay={140 + i * 65} className="h-full min-h-0">
                  <motion.div
                    className="flex h-full items-center gap-2.5 rounded-[14px] border border-white/70 px-2.5 py-1 shadow-[0_8px_16px_rgba(40,90,140,0.1),inset_0_1px_0_rgba(255,255,255,0.9),inset_0_-4px_10px_rgba(80,120,170,0.06)]"
                    style={{ background: p.soft }}
                    whileHover={reduce ? undefined : { x: 2, y: -1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={p.icon3d}
                      alt=""
                      aria-hidden
                      draggable={false}
                      className="size-9 shrink-0 object-contain drop-shadow-[0_5px_10px_rgba(0,0,0,0.16)] select-none"
                    />
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block text-[14px] font-bold text-black">{p.label}</span>
                      <span className="mt-0.5 block truncate text-[9px] leading-snug font-bold text-[#8a97ab]">
                        {p.support}
                      </span>
                    </span>
                    <span className="grid size-6 shrink-0 place-items-center rounded-full border border-[#dbe7f4] bg-white text-[8px] font-extrabold text-[#667b98] shadow-[0_3px_8px_rgba(40,80,130,0.12),inset_0_1px_0_#fff]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </motion.div>
                </Stagger>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Impacts — 3D plaque */}
        <motion.div
          ref={impactRef}
          className="relative z-10 flex min-h-0 w-full flex-col"
          initial={reduce ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease, delay: reduce ? 0 : 0.12 }}
        >
          <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] border border-white/70 bg-[linear-gradient(165deg,rgba(255,255,255,0.97)_0%,rgba(236,247,255,0.92)_55%,rgba(224,240,255,0.9)_100%)] px-2 pt-2.5 pb-2 shadow-[0_22px_40px_rgba(20,55,110,0.16),0_8px_16px_rgba(20,55,110,0.08),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-10px_22px_rgba(80,140,200,0.08)] backdrop-blur-[16px]">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-3 top-0 z-0 h-10 rounded-b-[40%] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.95),transparent_70%)]"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-4 bottom-1 z-0 h-3 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(20,70,140,0.18),transparent_70%)] blur-[2px]"
            />

            <div className="relative z-10 mb-2 flex items-start gap-2">
              <img
                src={icon3dTarget}
                alt=""
                aria-hidden
                draggable={false}
                className="size-9 shrink-0 object-contain drop-shadow-[0_8px_14px_rgba(20,118,232,0.28)] select-none"
              />
              <div className="min-w-0 pt-0.5 leading-tight">
                <div className="font-display text-[13px] font-bold text-navy">Impact of these gaps</div>
                <div className="mt-0.5 text-[9px] leading-snug font-semibold text-[#6b82a0]">
                  Less revenue. Less for worker welfare.
                </div>
              </div>
            </div>

            <div className="relative z-10 grid min-h-0 flex-1 grid-rows-4 gap-1.5">
              {IMPACTS.map((item, i) => (
                <Stagger key={item.id} delay={160 + i * 65} className="h-full min-h-0">
                  <motion.div
                    className="relative flex h-full min-h-0 items-center gap-2 overflow-hidden rounded-[14px] border border-white/60 px-2 py-1 shadow-[0_8px_16px_rgba(40,90,140,0.1),inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-4px_10px_rgba(80,120,170,0.06)]"
                    style={{ background: item.soft }}
                    whileHover={reduce ? undefined : { y: -2, x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={item.icon3d}
                      alt=""
                      aria-hidden
                      draggable={false}
                      className="size-8 shrink-0 object-contain drop-shadow-[0_5px_12px_rgba(0,0,0,0.14)] select-none"
                    />
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-[13px] font-bold text-black">{item.label}</span>
                      <span className="mt-0.5 block truncate text-[9px] font-bold text-[#8a97ab]">{item.support}</span>
                    </span>
                    <span
                      className="grid size-7 shrink-0 place-items-center rounded-lg shadow-[0_4px_10px_rgba(40,80,130,0.1),inset_0_1px_0_rgba(255,255,255,0.8)]"
                      style={{ background: item.endSoft, color: item.accent }}
                      aria-hidden
                    >
                      <item.EndIcon weight="fill" className="size-3.5" />
                    </span>
                  </motion.div>
                </Stagger>
              ))}
            </div>
          </div>
        </motion.div>
        </div>
      </section>

      {/* What goes wrong */}
      <section className="relative z-10">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.14em] text-[#d53b3b] uppercase">
            <span className="size-1.5 rounded-full bg-[#d53b3b]" aria-hidden />
            What goes wrong
          </span>
          <span className="h-px flex-1 bg-[#d53b3b]/20" aria-hidden />
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          {WHAT_WRONG.map((step, i) => (
            <Stagger key={step.label} delay={280 + i * 70}>
              <motion.div
                className="relative flex h-[78px] items-center gap-3 rounded-[16px] border border-[rgba(115,161,205,0.23)] bg-[rgba(255,255,255,0.82)] px-3.5 py-2.5 shadow-[0_12px_32px_rgba(52,104,159,0.1)] backdrop-blur-[14px]"
                whileHover={reduce ? undefined : { y: -2 }}
                transition={{ duration: 0.2 }}
              >
                {i < WHAT_WRONG.length - 1 ? (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute -right-3.5 top-1/2 z-20 -translate-y-1/2"
                    animate={reduce ? undefined : { x: [0, 3, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                  >
                    <ArrowRight weight="bold" className="size-4 text-[#ee5252]" />
                  </motion.span>
                ) : null}
                <motion.span
                  className="grid size-12 shrink-0 place-items-center"
                  aria-hidden
                  animate={reduce ? undefined : { y: [0, -2, 0] }}
                  transition={{ duration: 2.4 + i * 0.15, repeat: Infinity, ease: "easeInOut" }}
                >
                  <img
                    src={step.icon3d}
                    alt=""
                    draggable={false}
                    className="size-12 object-contain drop-shadow-[0_6px_12px_rgba(7,20,51,0.16)] select-none"
                  />
                </motion.span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[13px] font-bold text-black">{step.label}</span>
                  <span className="mt-0.5 block text-[10px] font-bold text-[#8a97ab]">{step.support}</span>
                </span>
              </motion.div>
            </Stagger>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHead({
  Icon,
  title,
  support,
  delay,
  reduce,
  compact = false,
  highlight = false,
}: {
  Icon: CessIcon;
  title: string;
  support: string;
  delay: number;
  reduce: boolean;
  compact?: boolean;
  highlight?: boolean;
}) {
  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 px-0.5",
        highlight &&
          "rounded-xl bg-[linear-gradient(90deg,rgba(20,118,232,0.12)_0%,rgba(20,118,232,0.04)_70%,transparent_100%)] py-1 pr-2 pl-1 ring-1 ring-[#1476e8]/20",
      )}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease, delay: reduce ? 0 : delay / 1000 }}
    >
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-[11px] text-navy shadow-[0_6px_16px_rgba(50,100,150,0.14)]",
          compact ? "size-7 rounded-lg" : "size-8",
          highlight
            ? "bg-[linear-gradient(145deg,#1687ef,#0d5fbf)] text-white shadow-[0_6px_14px_rgba(20,118,232,0.35)] ring-2 ring-white/90"
            : "bg-white",
        )}
      >
        <Icon
          weight={highlight ? "fill" : "duotone"}
          className={cn(highlight ? "text-white" : "text-[#1476e8]", compact ? "size-3.5" : "size-4")}
        />
      </span>
      <div className="min-w-0 leading-tight">
        <div
          className={cn(
            "font-display font-bold",
            compact ? "text-[13px]" : "text-[15px]",
            highlight ? "bg-[linear-gradient(90deg,#0b3d7a_0%,#1476e8_100%)] bg-clip-text text-transparent" : "text-navy",
          )}
        >
          {title}
        </div>
        <div className={cn("font-semibold text-[#6b82a0]", compact ? "text-[9px]" : "text-[10px]")}>
          {support}
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Colour-coded transfer rails — dashed S-curves + glowing hub orbs + traveling packets.
 * Orbs / packets are HTML so they stay round (SVG circles stretch under preserveAspectRatio=none).
 */
function BoardConnectors({ reduce, geo }: { reduce: boolean; geo: FlowGeo }) {
  const { srcX, hubLeft, hubRight, impactX } = geo;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const sync = () => {
      const r = el.getBoundingClientRect();
      setBox({ w: r.width, h: r.height });
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const leftPaths = LEFT_FLOW.map((f) => {
    const x0 = (srcX / 100) * box.w;
    const y0 = (f.y / 100) * box.h;
    const x1 = (hubLeft / 100) * box.w;
    const y1 = (f.hubY / 100) * box.h;
    const mid = ((srcX + hubLeft) / 2 / 100) * box.w;
    return {
      vb: `M ${srcX} ${f.y} C ${(srcX + hubLeft) / 2 - 0.4} ${f.y}, ${(srcX + hubLeft) / 2 + 0.8} ${f.hubY}, ${hubLeft} ${f.hubY}`,
      px: `M ${x0} ${y0} C ${mid - 6} ${y0}, ${mid + 10} ${y1}, ${x1} ${y1}`,
    };
  });

  const rightPaths = RIGHT_FLOW.map((f) => {
    const x0 = (hubRight / 100) * box.w;
    const y0 = (f.hubY / 100) * box.h;
    const x1 = (impactX / 100) * box.w;
    const y1 = (f.y / 100) * box.h;
    const mid = ((hubRight + impactX) / 2 / 100) * box.w;
    return {
      vb: `M ${hubRight} ${f.hubY} C ${(hubRight + impactX) / 2 - 0.3} ${f.hubY}, ${(hubRight + impactX) / 2 + 0.5} ${f.y}, ${impactX} ${f.y}`,
      px: `M ${x0} ${y0} C ${mid - 4} ${y0}, ${mid + 8} ${y1}, ${x1} ${y1}`,
    };
  });

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0 z-[12]">
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        <defs>
          {LEFT_FLOW.map((f, i) => (
            <linearGradient key={`lgL${i}`} id={`flow-l-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={f.color} stopOpacity="0.15" />
              <stop offset="40%" stopColor={f.color} stopOpacity="1" />
              <stop offset="100%" stopColor={f.color} stopOpacity="0" />
            </linearGradient>
          ))}
          {RIGHT_FLOW.map((f, i) => (
            <linearGradient key={`lgR${i}`} id={`flow-r-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={f.color} stopOpacity="0.95" />
              <stop offset="70%" stopColor={f.color} stopOpacity="0.85" />
              <stop offset="100%" stopColor={f.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {LEFT_FLOW.map((f, i) => {
          const d = leftPaths[i]?.vb ?? "";
          return (
            <g key={`L${i}`}>
              <path
                d={d}
                fill="none"
                stroke={f.color}
                strokeWidth={3.2}
                strokeOpacity={0.14}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <motion.path
                d={d}
                fill="none"
                stroke={`url(#flow-l-${i})`}
                strokeWidth={1.85}
                strokeDasharray="5.5 3.2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: reduce ? 0 : 0.55, delay: reduce ? 0 : 0.2 + i * 0.05, ease }}
              />
            </g>
          );
        })}

        {RIGHT_FLOW.map((f, i) => {
          const d = rightPaths[i]?.vb ?? "";
          return (
            <g key={`R${i}`}>
              <path
                d={d}
                fill="none"
                stroke={f.color}
                strokeWidth={3}
                strokeOpacity={0.12}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <motion.path
                d={d}
                fill="none"
                stroke={`url(#flow-r-${i})`}
                strokeWidth={1.7}
                strokeDasharray="5.5 3.2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: reduce ? 0 : 0.55, delay: reduce ? 0 : 0.4 + i * 0.06, ease }}
              />
            </g>
          );
        })}
      </svg>

      {/* Source → hub transfer packets */}
      {!reduce && box.w > 0
        ? SOURCES.map((s, i) => {
            const path = leftPaths[i]?.px;
            if (!path) return null;
            const color = LEFT_FLOW[i].color;
            return (
              <Fragment key={`travel-l-${s.id}`}>
                <motion.span
                  className="absolute top-0 left-0 size-3 rounded-full"
                  style={{
                    background: color,
                    offsetPath: `path('${path}')`,
                    offsetRotate: "0deg",
                    offsetAnchor: "center",
                    filter: `blur(2px)`,
                    boxShadow: `0 0 12px 4px ${color}`,
                  }}
                  initial={{ offsetDistance: "0%", opacity: 0 }}
                  animate={{
                    offsetDistance: ["0%", "92%"],
                    opacity: [0, 0.55, 0.55, 0],
                  }}
                  transition={{
                    duration: 1.65 + i * 0.08,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 0.2 + i * 0.14,
                    times: [0, 0.1, 0.82, 1],
                  }}
                  aria-hidden
                />
                <motion.span
                  className="absolute top-0 left-0 grid size-[24px] place-items-center rounded-full text-white ring-[3px] ring-white"
                  style={{
                    background: s.soft,
                    offsetPath: `path('${path}')`,
                    offsetRotate: "0deg",
                    offsetAnchor: "center",
                    boxShadow: `0 0 0 1px ${color}66, 0 0 16px ${color}88, 0 4px 12px rgba(0,40,100,0.25)`,
                  }}
                  initial={{ offsetDistance: "0%", opacity: 0, scale: 0.65 }}
                  animate={{
                    offsetDistance: ["0%", "90%"],
                    opacity: [0, 1, 1, 0],
                    scale: [0.65, 1.08, 1, 0.85],
                  }}
                  transition={{
                    duration: 1.65 + i * 0.08,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 0.2 + i * 0.14,
                    times: [0, 0.08, 0.78, 1],
                  }}
                  aria-hidden
                >
                  <s.Icon weight="fill" className="size-2.5" />
                </motion.span>
              </Fragment>
            );
          })
        : null}

      {/* Hub → impact transfer packets */}
      {!reduce && box.w > 0
        ? RIGHT_FLOW.map((f, i) => {
            const path = rightPaths[i]?.px;
            if (!path) return null;
            return (
              <Fragment key={`travel-r-${i}`}>
                <motion.span
                  className="absolute top-0 left-0 size-2.5 rounded-full"
                  style={{
                    background: f.color,
                    offsetPath: `path('${path}')`,
                    offsetRotate: "0deg",
                    offsetAnchor: "center",
                    filter: "blur(1.5px)",
                    boxShadow: `0 0 10px 3px ${f.color}`,
                  }}
                  initial={{ offsetDistance: "0%", opacity: 0 }}
                  animate={{
                    offsetDistance: ["0%", "90%"],
                    opacity: [0, 0.7, 0.55, 0],
                  }}
                  transition={{
                    duration: 1.45 + i * 0.1,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 0.85 + i * 0.16,
                    times: [0, 0.12, 0.8, 1],
                  }}
                  aria-hidden
                />
                <motion.span
                  className="absolute top-0 left-0 size-[14px] rounded-full ring-[2.5px] ring-white"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, #fff 0%, ${f.color} 55%, ${f.color} 100%)`,
                    offsetPath: `path('${path}')`,
                    offsetRotate: "0deg",
                    offsetAnchor: "center",
                    boxShadow: `0 0 12px ${f.color}99, 0 2px 6px rgba(20,40,80,0.25)`,
                  }}
                  initial={{ offsetDistance: "0%", opacity: 0, scale: 0.6 }}
                  animate={{
                    offsetDistance: ["0%", "88%"],
                    opacity: [0, 1, 1, 0],
                    scale: [0.6, 1.1, 1, 0.7],
                  }}
                  transition={{
                    duration: 1.45 + i * 0.1,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 0.85 + i * 0.16,
                    times: [0, 0.12, 0.78, 1],
                  }}
                  aria-hidden
                />
              </Fragment>
            );
          })
        : null}
    </div>
  );
}
