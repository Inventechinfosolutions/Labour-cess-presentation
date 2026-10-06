import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowsLeftRight,
  ArrowsSplit,
  Bank,
  Buildings,
  ChartBar,
  Factory,
  FileText,
  GearSix,
  HardHat,
  Lightning,
  LinkSimple,
  Monitor,
  PencilSimple,
  Plugs,
  Shuffle,
  SquaresFour,
  TreeStructure,
  UploadSimple,
  UsersThree,
} from "@/lib/icons";
import { stageFont } from "@/lib/stageFont";
import srcGov from "@/assets/mw-src-gov.jpg";
import srcUlb from "@/assets/mw-src-ulb.jpg";
import srcBoards from "@/assets/mw-src-boards.jpg";
import srcUtil from "@/assets/mw-src-util.jpg";
import srcAgency from "@/assets/mw-src-agency.jpg";
import srcBuilders from "@/assets/mw-src-builders.jpg";
import hubPodium from "@/assets/mw-hub-podium.png";
import centralPlatform from "@/assets/mw-central-platform.png";
import capConnectors from "@/assets/mw-cap-connectors.jpg";
import capMapping from "@/assets/mw-cap-mapping.jpg";
import capValidation from "@/assets/mw-cap-validation.jpg";
import capSandbox from "@/assets/mw-cap-sandbox.jpg";
import capHealth from "@/assets/mw-cap-health.jpg";
import capVersion from "@/assets/mw-cap-version.jpg";
import capLogs from "@/assets/mw-cap-logs.jpg";
import capAccess from "@/assets/mw-cap-access.jpg";
import stageBg from "@/assets/mw-stage-bg.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

const SOURCES: {
  id: string;
  title: string;
  lines: string[];
  Icon: CessIcon;
  color: string;
  grad: string;
  tag: string;
  photo: string;
}[] = [
  {
    id: "gov",
    title: "Government Departments",
    lines: ["Project / Tender data", "Approval / Permit data", "Construction details", "Budget and expenditure data"],
    Icon: Bank,
    color: "#1f6fd8",
    grad: "linear-gradient(135deg,#0a3f8f,#1561c4)",
    tag: "Data",
    photo: srcGov,
  },
  {
    id: "ulb",
    title: "ULBs & Planning Authorities",
    lines: ["Building plan approvals", "Project information", "Land use / property details", "Construction activity data"],
    Icon: Buildings,
    color: "#e0800b",
    grad: "linear-gradient(135deg,#9a4d00,#c96f00)",
    tag: "Data",
    photo: srcUlb,
  },
  {
    id: "boards",
    title: "Boards & Corporations",
    lines: ["Project data", "Infrastructure works", "Construction contracts", "Periodic updates"],
    Icon: Factory,
    color: "#7041d9",
    grad: "linear-gradient(135deg,#3f1a8c,#5b2bc0)",
    tag: "Data",
    photo: srcBoards,
  },
  {
    id: "util",
    title: "Utilities & Infrastructure Providers",
    lines: ["Project information", "Utility connection data", "Construction activity indicators", "Periodic updates"],
    Icon: Lightning,
    color: "#169c57",
    grad: "linear-gradient(135deg,#0b5e33,#138049)",
    tag: "Data",
    photo: srcUtil,
  },
  {
    id: "agency",
    title: "PSUs & Other Agencies",
    lines: ["Various government undertakings and notified agencies"],
    Icon: UsersThree,
    color: "#e43a70",
    grad: "linear-gradient(135deg,#8f1640,#bc2257)",
    tag: "Data",
    photo: srcAgency,
  },
  {
    id: "builders",
    title: "Builders / Contractors",
    lines: [
      "Project / registration details",
      "Construction information",
      "Supporting documents",
      "Payment information (where applicable)",
    ],
    Icon: HardHat,
    color: "#d69108",
    grad: "linear-gradient(135deg,#7f5500,#a87400)",
    tag: "Portal / Manual",
    photo: srcBuilders,
  },
];

/** Where each source line lands on the podium, as fractions of the hub image box. */
const HUB_TARGETS: readonly [number, number][] = [
  [0.3, 0.3],
  [0.22, 0.4],
  [0.14, 0.5],
  [0.09, 0.6],
  [0.06, 0.72],
  [0.09, 0.85],
];

const HUB_FUNCTIONS: { label: string; Icon: CessIcon; grad: string }[] = [
  { label: "Connect", Icon: LinkSimple, grad: "linear-gradient(135deg,#1aa55f,#46d083)" },
  { label: "Validate", Icon: GearSix, grad: "linear-gradient(135deg,#ec7d0c,#f7ac34)" },
  { label: "Transform", Icon: Shuffle, grad: "linear-gradient(135deg,#6d3bd9,#9e67ff)" },
  { label: "Route", Icon: ArrowsSplit, grad: "linear-gradient(135deg,#1573d8,#3fa6ff)" },
  { label: "Monitor", Icon: Monitor, grad: "linear-gradient(135deg,#e0335f,#ff6a8e)" },
];

const PROTOCOLS = ["Data", "REST", "SOAP", "Portal", "Manual"];

const PORTAL_STEPS: { label: string; color: string }[] = [
  { label: "Agency Registration", color: "#1f7fe3" },
  { label: "Configure Connector", color: "#ee9212" },
  { label: "Data Mapping", color: "#1f7fe3" },
  { label: "Sandbox Testing", color: "#ee9212" },
  { label: "Activation", color: "#1aa55f" },
  { label: "Monitor & Manage", color: "#1f7fe3" },
];

const PORTAL_MENU: { label: string; Icon: CessIcon }[] = [
  { label: "Dashboard", Icon: SquaresFour },
  { label: "Connectors", Icon: Plugs },
  { label: "Data Mapping", Icon: TreeStructure },
  { label: "Test & Validate", Icon: GearSix },
  { label: "Monitoring", Icon: ChartBar },
  { label: "Logs & Audit", Icon: FileText },
];

const PORTAL_TILES: { label: string; Icon: CessIcon }[] = [
  { label: "REST API", Icon: Plugs },
  { label: "SOAP API", Icon: GearSix },
  { label: "File Upload", Icon: UploadSimple },
  { label: "Manual Entry", Icon: PencilSimple },
];

const CAPABILITIES: { label: [string, string]; img: string }[] = [
  { label: ["Pre-configured", "Connectors"], img: capConnectors },
  { label: ["Data Mapping", "& Transformation"], img: capMapping },
  { label: ["Validation", "& Governance"], img: capValidation },
  { label: ["Sandbox", "Testing"], img: capSandbox },
  { label: ["Connector", "Health Monitoring"], img: capHealth },
  { label: ["Version", "Management"], img: capVersion },
  { label: ["Logs &", "Audit Trails"], img: capLogs },
  { label: ["Role Based", "Access Control"], img: capAccess },
];

const STAGE_TYPE = {
  containerType: "size",
  "--mw-26": stageFont(26, 15),
  "--mw-22": stageFont(22, 14),
  "--mw-18": stageFont(18, 11),
  "--mw-16": stageFont(16, 10),
  "--mw-14": stageFont(14, 9),
  "--mw-12": stageFont(12, 8),
  "--mw-9": stageFont(9, 6),
  "--mw-8": stageFont(8, 5.5),
} as CSSProperties;

type Flow = { d: string; color: string; tag: string; tx: number; ty: number };

function bezierPoint(p0: number, p1: number, p2: number, p3: number, t: number) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

/** Full poster-style Smart Middleware & CESS Self-Service Portal stage. */
export function MiddlewareStage() {
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [flows, setFlows] = useState<Flow[]>([]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const hub = hubRef.current;
    if (!stage || !hub) return;
    const sync = () => {
      const s = stage.getBoundingClientRect();
      const h = hub.getBoundingClientRect();
      if (!s.width || !h.width) return;
      // SlideViewport may scale the canvas; convert screen px back to stage px.
      const k = stage.offsetWidth / s.width;
      const next: Flow[] = [];
      SOURCES.forEach((src, i) => {
        const card = cardRefs.current[i];
        if (!card) return;
        const c = card.getBoundingClientRect();
        const sx = (c.right - s.left) * k;
        const sy = (c.top + c.height / 2 - s.top) * k;
        const [fx, fy] = HUB_TARGETS[i];
        const ex = (h.left - s.left + h.width * fx) * k;
        const ey = (h.top - s.top + h.height * fy) * k;
        const dx = Math.max(24, ex - sx);
        const c1x = sx + dx * 0.55;
        const c2x = ex - dx * 0.45;
        const t = 0.32;
        next.push({
          d: `M ${sx} ${sy} C ${c1x} ${sy}, ${c2x} ${ey}, ${ex} ${ey}`,
          color: src.color,
          tag: src.tag,
          tx: bezierPoint(sx, c1x, c2x, ex, t),
          ty: bezierPoint(sy, sy, ey, ey, t),
        });
      });
      setFlows(next);
    };
    sync();
    // Cards slide in with a transform, which ResizeObserver does not report.
    const timers = [700, 1400].map((ms) => window.setTimeout(sync, ms));
    const ro = new ResizeObserver(sync);
    ro.observe(stage);
    ro.observe(hub);
    return () => {
      ro.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  const fade = (delay: number, y = 10) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, delay, ease },
        };

  return (
    <div
      ref={stageRef}
      className="relative h-full min-h-0 w-full overflow-hidden text-[#122b50]"
      style={{
        ...STAGE_TYPE,
        background:
          `radial-gradient(circle at 50% 48%, rgba(48,155,255,0.13), transparent 32%), url(${stageBg}) center bottom / cover no-repeat, #f4f9ff`,
      }}
    >
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <defs>
          {flows.map((f, i) => (
            <marker
              key={i}
              id={`mw-arrow-${i}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0 0 L10 5 L0 10 z" fill={f.color} />
            </marker>
          ))}
        </defs>
        {flows.map((f, i) => (
          <g key={i}>
            <motion.path
              d={f.d}
              fill="none"
              stroke={f.color}
              strokeWidth={2.4}
              strokeLinecap="round"
              markerEnd={`url(#mw-arrow-${i})`}
              initial={reduce ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.35 + i * 0.08, ease }}
            />
            {!reduce &&
              [0, 1.4].map((offset) => (
                <g key={offset} opacity={0}>
                  <FilePacket color={f.color} />
                  <animateMotion
                    dur="2.8s"
                    repeatCount="indefinite"
                    begin={`${1.3 + i * 0.35 + offset}s`}
                    path={f.d}
                  />
                  <set attributeName="opacity" to="1" begin={`${1.3 + i * 0.35 + offset}s`} />
                </g>
              ))}
          </g>
        ))}
      </svg>

      <div className="relative grid h-full min-h-0 grid-cols-[29%_minmax(0,1fr)_30%] gap-x-[1.4%] px-[1%] py-[0.9%]">
        {/* Left — sending offices */}
        <div className="flex min-h-0 flex-col gap-[1.1%]">
          {SOURCES.map((src, i) => (
            <motion.div
              key={src.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="flex min-h-0 flex-1 items-stretch gap-[2.5%]"
              initial={reduce ? false : { opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.07, ease }}
            >
              <img
                src={src.photo}
                alt=""
                draggable={false}
                className="w-[27%] shrink-0 rounded-lg object-cover shadow-[0_4px_12px_rgba(20,50,90,0.18)]"
              />
              <div
                className="flex min-w-0 flex-1 items-center gap-[4%] rounded-xl border-[1.5px] px-[4%] py-[1.5%]"
                style={{
                  borderColor: `${src.color}99`,
                  background: `linear-gradient(90deg,${src.color}3d 0%,${src.color}14 75%),#ffffff`,
                  boxShadow: `0 5px 14px ${src.color}33, inset 0 1px 0 rgba(255,255,255,0.8)`,
                }}
              >
                <span
                  className="grid aspect-square w-[17%] max-w-[46px] shrink-0 place-items-center rounded-full text-white shadow-[0_4px_10px_rgba(0,0,0,0.16)] ring-2 ring-white"
                  style={{ background: src.grad }}
                >
                  <src.Icon weight="fill" className="size-[55%]" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-[length:var(--mw-18)] leading-[1.1] font-extrabold text-[#153d70]">
                    {src.title}
                  </h3>
                  <ul className="mt-[2px] space-y-px">
                    {src.lines.map((line) => (
                      <li
                        key={line}
                        className="flex items-start gap-1 text-[length:var(--mw-14)] leading-[1.2] font-semibold text-[#52708e]"
                      >
                        <span className="mt-[0.45em] size-[0.36em] shrink-0 rounded-full" style={{ background: src.color }} />
                        <span className="min-w-0">{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Centre — Smart Middleware → Integration Hub → Central CESS Platform */}
        <div className="relative flex min-h-0 flex-col items-center">
          <motion.div
            {...fade(0.15, -8)}
            className="relative z-[2] mt-[1%] rounded-xl bg-[linear-gradient(135deg,#174d91,#2269bd)] px-[5%] py-[0.9%] text-center text-white shadow-[0_9px_25px_rgba(18,71,130,0.25)] ring-2 ring-white/70"
          >
            <strong className="font-display block text-[length:var(--mw-22)] leading-tight font-extrabold">
              Smart Middleware
            </strong>
            <span className="block text-[length:var(--mw-14)] font-semibold text-white/85">Integration Engine</span>
          </motion.div>

          <div ref={hubRef} className="relative -mt-[1.5%] aspect-[949/792] h-[55%] max-w-full shrink-0 [container-type:inline-size]">
            {!reduce && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute top-[2%] left-1/2 h-[40%] w-[62%] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(40,170,255,0.35),transparent_68%)]"
                animate={{ opacity: [0.45, 1, 0.45], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <motion.img
              src={hubPodium}
              alt=""
              draggable={false}
              className="absolute inset-0 h-full w-full object-contain select-none"
              initial={reduce ? false : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.25, ease }}
            />
            <motion.svg
              {...fade(0.55, 6)}
              viewBox="0 0 840 168"
              role="img"
              aria-label="CESS Integration Hub"
              className="font-display absolute inset-x-[8%] top-[43.5%] h-[20%] w-[84%] overflow-visible"
            >
              <defs>
                <linearGradient id="mw-hub-text" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="0.5" stopColor="#ffffff" />
                  <stop offset="1" stopColor="#d6e2f2" />
                </linearGradient>
                <path id="mw-hub-arc-1" d="M 230 72 Q 420 94 610 72" />
                <path id="mw-hub-arc-2" d="M 50 132 Q 420 170 790 132" />
              </defs>
              <g
                fill="url(#mw-hub-text)"
                fontSize={60}
                fontWeight={900}
                letterSpacing={-0.6}
                textAnchor="middle"
                style={{ filter: "drop-shadow(0 2px 2px rgba(4,20,70,0.7))" }}
              >
                <text>
                  <textPath href="#mw-hub-arc-1" startOffset="50%">
                    CESS
                  </textPath>
                </text>
                <text>
                  <textPath href="#mw-hub-arc-2" startOffset="50%">
                    INTEGRATION HUB
                  </textPath>
                </text>
              </g>
            </motion.svg>
            <div className="absolute inset-x-[9%] top-[61%] flex items-start justify-between">
              {HUB_FUNCTIONS.map((fn, i) => (
                <motion.div
                  key={fn.label}
                  className="relative flex w-[18.6%] flex-col items-center"
                  style={{ marginTop: `${[0, 1.9, 2.7, 1.9, 0][i]}cqw`, rotate: `${[7, 3.5, 0, -3.5, -7][i]}deg` }}
                  initial={reduce ? false : { opacity: 0, y: 8, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, delay: 0.75 + i * 0.08, ease }}
                >
                  <span
                    className="relative z-[1] grid aspect-square w-[58%] place-items-center rounded-full text-white shadow-[0_4px_10px_rgba(0,0,0,0.35)] ring-[0.35cqw] ring-white/90"
                    style={{ background: fn.grad }}
                  >
                    <fn.Icon weight="bold" className="size-[52%] drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]" />
                  </span>
                  <span className="-mt-[26%] flex w-full justify-center rounded-[1.6cqw] bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(234,241,255,0.96))] px-[4%] pt-[30%] pb-[7%] shadow-[0_6px_14px_rgba(4,20,70,0.35),inset_0_1px_0_rgba(255,255,255,0.95)] ring-1 ring-white/70 backdrop-blur-sm">
                    <span className="text-[length:clamp(7px,2.6cqw,15px)] leading-none font-extrabold whitespace-nowrap text-[#14305e]">
                      {fn.label}
                    </span>
                  </span>
                </motion.div>
              ))}
            </div>
            <motion.svg
              {...fade(1.05, 4)}
              viewBox="0 0 760 100"
              role="img"
              aria-label={PROTOCOLS.join(", ")}
              className="absolute inset-x-[12%] top-[80.5%] h-[12%] w-[76%] overflow-visible"
            >
              <defs>
                <path id="mw-protocol-arc" d="M 30 52 Q 380 88 730 52" />
              </defs>
              <text
                fill="#fff"
                fontSize={30}
                fontWeight={700}
                textAnchor="middle"
                style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.45))", whiteSpace: "pre" }}
              >
                <textPath href="#mw-protocol-arc" startOffset="50%">
                  {PROTOCOLS.map((p, i) => (
                    <tspan key={p}>
                      {i > 0 && <tspan fill="rgba(103,232,249,0.75)">{"  |  "}</tspan>}
                      {p}
                    </tspan>
                  ))}
                </textPath>
              </text>
            </motion.svg>
          </div>

          <motion.span
            aria-hidden
            className="relative z-[2] mt-[0.5%] mb-[1%] grid shrink-0 place-items-center text-[#1574d1]"
            animate={reduce ? undefined : { y: [0, 5, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg viewBox="0 0 60 44" className="h-[clamp(20px,4.6cqh,40px)] w-auto drop-shadow-[0_4px_8px_rgba(21,116,209,0.4)]">
              <defs>
                <linearGradient id="mw-down-arrow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#3f9bff" />
                  <stop offset="1" stopColor="#1256c4" />
                </linearGradient>
              </defs>
              <path d="M19 0 H41 V20 H58 L30 44 L2 20 H19 Z" fill="url(#mw-down-arrow)" />
            </svg>
          </motion.span>

          <motion.div
            className="relative mt-[0.5%] aspect-[1153/621] min-h-0 max-w-full flex-1 [container-type:inline-size]"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1, ease }}
          >
            <img src={centralPlatform} alt="" draggable={false} className="absolute inset-0 h-full w-full object-contain select-none" />
            <svg
              viewBox="0 0 920 120"
              role="img"
              aria-label="Central CESS Platform"
              className="font-display absolute inset-x-[4%] top-[73%] h-[22%] w-[92%] overflow-visible"
            >
              <defs>
                <linearGradient id="mw-platform-text" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="0.5" stopColor="#ffffff" />
                  <stop offset="1" stopColor="#d6e2f2" />
                </linearGradient>
                <path id="mw-platform-arc" d="M 40 66 Q 460 102 880 66" />
              </defs>
              <text
                fill="url(#mw-platform-text)"
                fontSize={56}
                fontWeight={900}
                letterSpacing={-0.5}
                textAnchor="middle"
                style={{ filter: "drop-shadow(0 2px 2px rgba(4,20,70,0.65))" }}
              >
                <textPath href="#mw-platform-arc" startOffset="50%">
                  CENTRAL CESS PLATFORM
                </textPath>
              </text>
            </svg>
          </motion.div>
        </div>

        {/* Right — self-service portal + capabilities */}
        <div className="relative flex min-h-0 flex-col gap-[2.2%] pt-[1.5%]">
          <motion.span
            aria-hidden
            className="absolute top-[19%] -left-[13%] z-[3] grid place-items-center text-[#6a3fe0]"
            initial={reduce ? false : { opacity: 0, scale: 0.6 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, x: [0, 4, 0, -4, 0] }}
            transition={
              reduce
                ? undefined
                : { opacity: { delay: 1.2 }, scale: { delay: 1.2 }, x: { duration: 2.4, repeat: Infinity, delay: 1.6 } }
            }
          >
            <ArrowsLeftRight weight="bold" className="size-[clamp(20px,3cqw,46px)] drop-shadow-[0_3px_6px_rgba(106,63,224,0.35)]" />
          </motion.span>

          <motion.section
            className="overflow-hidden rounded-2xl border border-[#6c94c8]/25 bg-white/95 shadow-[0_8px_24px_rgba(42,91,139,0.12)]"
            initial={reduce ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.5, ease }}
          >
            <div className="bg-[linear-gradient(135deg,#1b3f9a,#5232c7_55%,#713ee7)] px-[5%] py-[2.6%] text-white">
              <h2 className="font-display text-[length:var(--mw-22)] leading-tight font-extrabold">CESS Self-Service Portal</h2>
              <p className="text-[length:var(--mw-14)] font-medium text-white/85">For connector onboarding and management</p>
            </div>
            <div className="grid grid-cols-[57%_1fr] items-center gap-[4%] px-[4%] py-[3.5%]">
              <PortalLaptop />
              <ol className="flex flex-col gap-[0.5em] text-[length:var(--mw-14)]">
                {PORTAL_STEPS.map((step, i) => (
                  <motion.li
                    key={step.label}
                    className="flex items-center gap-[0.5em] leading-tight font-bold text-[#23466f]"
                    initial={reduce ? false : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 + i * 0.07, ease }}
                  >
                    <span
                      className="grid size-[1.7em] shrink-0 place-items-center rounded-full text-[0.9em] font-extrabold text-white shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
                      style={{ background: step.color }}
                    >
                      {i + 1}
                    </span>
                    {step.label}
                  </motion.li>
                ))}
              </ol>
            </div>
          </motion.section>

          <motion.section
            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#6c94c8]/25 bg-white/95 shadow-[0_8px_24px_rgba(42,91,139,0.12)]"
            initial={reduce ? false : { opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.7, ease }}
          >
            <div className="font-display bg-[linear-gradient(135deg,#118f86,#20b7a8)] px-[5%] py-[2.4%] text-[length:var(--mw-18)] leading-tight font-extrabold text-white">
              Supported Integration Capabilities
            </div>
            <div className="grid min-h-0 flex-1 grid-cols-4 grid-rows-2 gap-[2.5%] p-[3.5%]">
              {CAPABILITIES.map((cap, i) => (
                <motion.div
                  key={cap.label.join(" ")}
                  className="flex min-h-0 flex-col items-center justify-center rounded-xl border border-[#d8e6f2] bg-white px-[1.5%] py-[5%] text-center shadow-[0_3px_10px_rgba(42,91,139,0.07)]"
                  initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 1 + i * 0.06, ease }}
                >
                  <img
                    src={cap.img}
                    alt=""
                    draggable={false}
                    className="aspect-square h-auto max-h-[64%] w-[74%] min-h-0 object-contain mix-blend-multiply"
                  />
                  <span className="mt-[6%] text-[length:var(--mw-14)] leading-[1.18] font-bold text-[#27496f]">
                    {cap.label[0]}
                    <br />
                    {cap.label[1]}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>

      {flows.map((f, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute z-[4] -translate-x-1/2 -translate-y-1/2 rounded-full px-[0.9em] py-[0.35em] text-[length:var(--mw-12)] leading-none font-extrabold whitespace-nowrap text-white shadow-[0_4px_10px_rgba(0,0,0,0.14)] ring-2 ring-white"
          style={{ left: f.tx, top: f.ty, background: f.color }}
          initial={reduce ? false : { opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.9 + i * 0.08, ease }}
        >
          {f.tag}
        </motion.span>
      ))}
    </div>
  );
}

/** Small document glyph centred on (0,0) so it rides the flow path. */
export function FilePacket({ color }: { color: string }) {
  return (
    <g transform="translate(-7.5 -9.5)" style={{ filter: "drop-shadow(0 1.5px 2px rgba(20,50,90,0.3))" }}>
      <path d="M1.5 0 H10 L15 5 V17.5 A1.5 1.5 0 0 1 13.5 19 H1.5 A1.5 1.5 0 0 1 0 17.5 V1.5 A1.5 1.5 0 0 1 1.5 0 Z" fill="#fff" stroke={color} strokeWidth={1.4} />
      <path d="M10 0 V5 H15" fill={color} fillOpacity={0.25} stroke={color} strokeWidth={1.2} strokeLinejoin="round" />
      <rect x={3} y={8} width={9} height={1.6} rx={0.8} fill={color} />
      <rect x={3} y={11.2} width={9} height={1.6} rx={0.8} fill={color} opacity={0.7} />
      <rect x={3} y={14.4} width={6} height={1.6} rx={0.8} fill={color} opacity={0.5} />
    </g>
  );
}

function PortalLaptop() {
  return (
    <div className="flex flex-col items-center">
      <div className="aspect-[16/10] w-full rounded-[7px] bg-[#1c2a44] p-[2.2%] shadow-[0_8px_16px_rgba(0,0,0,0.18)]">
        <div className="flex h-full overflow-hidden rounded-[3px] bg-white">
          <div className="flex w-[27%] flex-col gap-[5%] bg-[#123a6e] px-[3%] py-[5%] text-white">
            <span className="text-[length:var(--mw-8)] leading-none font-extrabold">Connexus</span>
            {PORTAL_MENU.map((m) => (
              <span key={m.label} className="flex items-center gap-[4%] text-[length:var(--mw-8)] leading-none whitespace-nowrap text-white/85">
                <m.Icon weight="bold" className="size-[1em] shrink-0" />
                {m.label}
              </span>
            ))}
          </div>
          <div className="flex min-w-0 flex-1 flex-col bg-[#f5f9fd]">
            <div className="flex items-center justify-between border-b border-[#dce8f4] bg-white px-[5%] py-[2.5%] text-[length:var(--mw-8)] font-bold text-[#1d4577]">
              Portal
              <span className="flex gap-[3px]">
                <span className="size-[0.6em] rounded-full bg-[#c8d8ea]" />
                <span className="size-[0.6em] rounded-full bg-[#c8d8ea]" />
              </span>
            </div>
            <div className="flex min-h-0 flex-1 flex-col px-[6%] py-[4%]">
              <span className="text-[length:var(--mw-9)] leading-none font-extrabold text-[#123a6e]">Add New Connector</span>
              <div className="mt-[5%] grid flex-1 grid-cols-2 gap-[5%]">
                {PORTAL_TILES.map((t) => (
                  <span
                    key={t.label}
                    className="flex flex-col items-center justify-center gap-[6%] rounded-[3px] border border-[#c9dbee] bg-white text-[length:var(--mw-8)] leading-none font-bold whitespace-nowrap text-[#1d4577]"
                  >
                    <t.Icon weight="duotone" className="size-[1.4em] text-[#1f7fe3]" />
                    {t.label}
                  </span>
                ))}
              </div>
              <span className="mx-auto mt-[5%] rounded-[3px] bg-[#1f7fe3] px-[8%] py-[2%] text-[length:var(--mw-8)] leading-none font-bold whitespace-nowrap text-white">
                Create Connector
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[7px] w-[112%] rounded-b-[8px] bg-[linear-gradient(180deg,#b8c3d2,#6b7a90)] shadow-[0_4px_8px_rgba(0,0,0,0.15)]" />
    </div>
  );
}
