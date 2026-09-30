import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  Buildings,
  Calculator,
  Camera,
  Check,
  CheckCircle,
  ClipboardText,
  Clock,
  CloudArrowDown,
  CloudArrowUp,
  CreditCard,
  Database,
  DeviceMobile,
  GpsFix,
  House,
  LinkBreak,
  MapPin,
  PaperPlaneTilt,
  Path,
  Phone,
  Receipt,
  Scissors,
  ShieldCheck,
  User,
  VideoCamera,
  WarningCircle,
  WifiSlash,
  X,
} from "@/lib/icons";
import inspectorPhoto from "@/assets/inspector-r-kumar.jpg";
import abcSite from "@/assets/abc-site.png";
import assessSiteHero from "@/assets/assess-site-hero.jpg";
import buildStage1 from "@/assets/build-stage-1.png";
import buildStage2 from "@/assets/build-stage-2.png";
import hubCenterAbc from "@/assets/hub-center-abc.jpg";
import hubCenterSite from "@/assets/hub-center-site.jpg";
import hubStageCity from "@/assets/hub-stage-city.jpg";
import demandNotice3d from "@/assets/demand-notice-3d.png";
import icon3dCalendar from "@/assets/icon-3d-calendar.png";
import icon3dClockRed from "@/assets/icon-3d-clock-red.png";
import icon3dEvidence from "@/assets/icon-3d-evidence.png";
import icon3dRupee from "@/assets/icon-3d-rupee.png";
import karnatakaEmblem from "@/assets/karnataka-emblem.png";
import problemStageBg from "@/assets/problem-stage-bg.png";
import savedSafelyOnDevice from "@/assets/saved-safely-on-device.png";
import { NoticeArt } from "@/components/Art";
import { Reveal, SceneHead, Stagger } from "@/components/SlideKit";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const COORDS = "12.9616° N, 77.6973° E";
const PROJECT_ID = "CESS-2025-000123";
const PROJECT_NAME = "ABC Commercial Complex";

const CAPABILITIES: {
  label: string;
  detail: string;
  Icon: CessIcon;
  glow: string;
  shade: string;
}[] = [
  {
    label: "On-site place check",
    detail: "Capture live place and verify details.",
    Icon: MapPin,
    glow: "rgba(26,78,138,0.42)",
    shade: "radial-gradient(circle at 32% 26%, #6b9ad4 0%, #2a5f9e 48%, #1a4e8a 100%)",
  },
  {
    label: "Photos · video · notes",
    detail: "Evidence with time on every file.",
    Icon: Camera,
    glow: "rgba(107,76,230,0.42)",
    shade: "radial-gradient(circle at 32% 26%, #a78bfa 0%, #7c5cf0 48%, #6b4ce6 100%)",
  },
  {
    label: "Works offline",
    detail: "Keeps capturing on a weak network.",
    Icon: CloudArrowDown,
    glow: "rgba(14,138,114,0.42)",
    shade: "radial-gradient(circle at 32% 26%, #4ec9b0 0%, #1aa88a 48%, #0e8a72 100%)",
  },
  {
    label: "Secure record",
    detail: "Government-grade security on file.",
    Icon: ShieldCheck,
    glow: "rgba(217,119,6,0.42)",
    shade: "radial-gradient(circle at 32% 26%, #fbbf24 0%, #e8950f 48%, #d97706 100%)",
  },
];

const CAPTURES: {
  id: string;
  label: string;
  holds: string;
  Icon: CessIcon;
  wrap: string;
  soft: string;
  thumb: string;
  thumbFit?: "cover" | "contain";
  color: string;
}[] = [
  { id: "photo", label: "Photos", holds: "Site photos", Icon: Camera, wrap: "bg-[#1a4e8a] text-white", soft: "bg-[#e8eef8]", thumb: buildStage1, color: "#1a4e8a" },
  { id: "video", label: "Video", holds: "Site clips", Icon: VideoCamera, wrap: "bg-[#6b4ce6] text-white", soft: "bg-[#f0ebff]", thumb: assessSiteHero, color: "#6b4ce6" },
  { id: "notes", label: "Notes", holds: "Remarks · quantities", Icon: ClipboardText, wrap: "bg-[#db2777] text-white", soft: "bg-[#fce7f3]", thumb: icon3dEvidence, thumbFit: "contain", color: "#db2777" },
  { id: "place", label: "Place", holds: "GPS at ABC site", Icon: GpsFix, wrap: "bg-teal text-white", soft: "bg-accent", thumb: hubCenterSite, color: "#0e9aa7" },
  { id: "time", label: "Time", holds: "Visit stamp", Icon: Clock, wrap: "bg-gold text-gold-ink", soft: "bg-gold-soft", thumb: icon3dCalendar, thumbFit: "contain", color: "#c9a227" },
  { id: "demand", label: "Demand", holds: "On-spot notice", Icon: Receipt, wrap: "bg-ok text-white", soft: "bg-ok-soft", thumb: buildStage2, color: "#0e8a72" },
];

const PHOTO_STRIP = [buildStage1, abcSite, assessSiteHero, hubCenterAbc] as const;

const RECENT_VISITS = [
  { site: "ABC Commercial Complex", id: "CESS-2025-000123", when: "18 Mar · 10:24", done: true, img: abcSite },
  { site: "East Zone Site 14", id: "CESS-2025-000098", when: "12 Mar · 15:10", done: true, img: hubCenterAbc },
  { site: "Hebbal Tower Works", id: "CESS-2025-000071", when: "05 Mar · 09:42", done: true, img: buildStage2 },
] as const;

const KEY_ISSUES: {
  label: string;
  detail: string;
  Icon: CessIcon;
  glow: string;
  shade: string;
}[] = [
  {
    label: "Poor network on site",
    detail: "Capture must continue without LTE.",
    Icon: LinkBreak,
    glow: "rgba(196,69,60,0.42)",
    shade: "radial-gradient(circle at 32% 26%, #f48a82 0%, #e0453c 48%, #b82e28 100%)",
  },
  {
    label: "Unclear if Board got it",
    detail: "Officer must see send status.",
    Icon: CloudArrowUp,
    glow: "rgba(180,83,9,0.4)",
    shade: "radial-gradient(circle at 32% 26%, #fbbf24 0%, #e8950f 48%, #c45c26 100%)",
  },
  {
    label: "Send errors must show",
    detail: "Failed send cannot stay silent.",
    Icon: WarningCircle,
    glow: "rgba(185,28,28,0.42)",
    shade: "radial-gradient(circle at 32% 26%, #f87171 0%, #dc2626 48%, #991b1b 100%)",
  },
  {
    label: "Evidence must stay on file",
    detail: "Photos and place stay with Project ID.",
    Icon: ClipboardText,
    glow: "rgba(127,29,29,0.4)",
    shade: "radial-gradient(circle at 32% 26%, #fca5a5 0%, #c4453c 48%, #7a221c 100%)",
  },
];

const BEAT_HEAD: readonly { kicker: string; title: string; support: string }[] = [
  {
    kicker: "Government of Karnataka · Labour CESS",
    title: "Field Mobile App",
    support: "The Labour Inspector opens the mobile application at ABC.",
  },
  {
    kicker: "Mobile application",
    title: "Key Issues",
    support: "What the field mobile app must support on site.",
  },
  {
    kicker: "Mobile application",
    title: "Works Offline",
    support: "The mobile app keeps capturing when the network is weak.",
  },
  {
    kicker: "Mobile application",
    title: "Online · Happy Path",
    support: "Network is good. Every capture reaches the Board file.",
  },
  {
    kicker: "Mobile application",
    title: "On-spot Demand",
    support: "An on-spot demand can be drafted from the mobile app.",
  },
];

const SPACE_HINTS = [
  "Space · Key issues",
  "Space · Works offline",
  "Space · Online happy path",
  "Space · On-spot demand",
  "Space · Next",
] as const;

export function GpsScene({ beat }: { beat: number }) {
  const [issuesOpen, setIssuesOpen] = useState(false);
  const reduce = useReducedMotion();
  const head = BEAT_HEAD[Math.min(beat, BEAT_HEAD.length - 1)];
  const spaceHint = SPACE_HINTS[Math.min(beat, SPACE_HINTS.length - 1)];
  const offline = beat === 2;
  const happy = beat === 3;
  const sending = beat >= 3;
  const showDemand = beat >= 4;
  const demandOnly = beat === 4;
  const showIssues = beat === 1;
  const showCaps = beat === 0;
  const showSendFlow = beat === 2 || beat === 3;
  const capturing = beat >= 2 || happy;

  const storyChips = offline
    ? [
        { label: "Capture on phone", tone: "bg-gold-soft text-gold-ink ring-gold/25" },
        { label: "Held offline", tone: "bg-gold text-gold-ink ring-gold/30" },
        { label: "Send later", tone: "bg-white text-navy ring-navy/10" },
      ]
    : happy
      ? [
          { label: "Online", tone: "bg-ok-soft text-ok ring-ok/25" },
          { label: "All reached", tone: "bg-ok text-white ring-ok/30" },
          { label: "Board file", tone: "bg-white text-navy ring-navy/10" },
        ]
      : demandOnly
        ? [
            { label: "On-site capture", tone: "bg-white text-navy ring-navy/10" },
            { label: "On-spot demand", tone: "bg-navy text-teal-bright ring-teal/30" },
            { label: "Central Platform", tone: "bg-white text-navy ring-navy/10" },
          ]
        : [
            { label: "Field phone", tone: "bg-white text-navy ring-navy/10" },
            { label: "Capture", tone: "bg-accent text-teal ring-teal/20" },
            { label: "Central Platform", tone: "bg-white text-navy ring-navy/10" },
          ];

  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr_auto] gap-2">
      <div
        className="relative grid h-full min-h-0 grid-cols-[minmax(0,0.95fr)_minmax(280px,1.2fr)_minmax(0,1fr)] grid-rows-[auto_auto_minmax(0,1fr)] gap-x-3 gap-y-2 overflow-hidden rounded-2xl p-2.5 shadow-[0_12px_36px_rgba(7,20,51,0.1)] ring-1 ring-navy/8"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
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
              linear-gradient(165deg, rgba(247,250,253,0.72) 0%, rgba(232,235,240,0.45) 45%, rgba(228,234,243,0.62) 100%),
              radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,255,255,0.28) 0%, transparent 65%)
            `,
          }}
        />

        {issuesOpen && !showIssues ? (
          <div
            className="absolute top-3 right-3 z-40 w-[min(320px,calc(100%-1.5rem))] overflow-hidden rounded-2xl bg-white shadow-[0_18px_44px_rgba(7,20,51,0.18)] ring-1 ring-risk/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-risk/15 bg-risk-soft px-3 py-2">
              <div className="text-[9px] font-extrabold tracking-[0.14em] text-risk-ink uppercase">Key issues</div>
              <div className="font-display text-[13px] font-bold text-navy">What field capture must support</div>
            </div>
            <ul className="space-y-2 p-3">
              {KEY_ISSUES.map((item, i) => (
                <Stagger key={item.label} delay={40 + i * 45}>
                  <li className="flex items-center gap-2">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-risk text-white">
                      <item.Icon weight="fill" className="size-3.5" />
                    </span>
                    <b className="text-[12px] text-risk-ink">{item.label}</b>
                  </li>
                </Stagger>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Row 1 — title · story strip · status (same craft as Problem Statement) */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 col-span-3 text-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={head.title + beat}
              initial={reduce ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: 4 }}
              transition={{ duration: 0.25 }}
            >
              <SceneHead kicker={head.kicker} title={head.title} />
              <p className="mx-auto mt-1.5 max-w-[36rem] text-[12px] font-semibold text-muted-foreground">{head.support}</p>
              <div className="mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-[11px] font-bold text-teal-bright shadow-sm">
                <DeviceMobile weight="fill" className="size-3.5" />
                CESS Field App · mobile
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="relative z-10 col-span-3 grid grid-cols-[minmax(0,0.95fr)_minmax(280px,1.2fr)_minmax(0,1fr)] gap-x-3">
        <div />
        <motion.div
          className="relative z-10 flex min-h-0 flex-col items-center justify-end gap-2 text-center"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: reduce ? 0 : 0.06 }}
        >
          <div className="text-[9px] font-extrabold tracking-[0.14em] text-navy/55 uppercase">
            Phone · capture · Board file
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {storyChips.map((item, i) => (
              <span key={item.label} className="inline-flex items-center gap-1.5">
                {i > 0 ? <span className="text-[12px] font-extrabold text-teal/45">→</span> : null}
                <Stagger delay={50 + i * 55}>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold shadow-sm ring-1",
                      item.tone,
                    )}
                  >
                    {item.label}
                  </span>
                </Stagger>
              </span>
            ))}
          </div>
          <p className="max-w-[34rem] text-[12px] font-semibold text-muted-foreground">
            Labour Inspector captures on site. Evidence reaches one Project ID.
          </p>
        </motion.div>

        <motion.div
          className="relative z-10 flex min-h-0 flex-col items-center justify-end gap-2 text-center"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: reduce ? 0 : 0.12 }}
        >
          <div className="text-[9px] font-extrabold tracking-[0.14em] text-teal uppercase">On this file</div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="rounded-full bg-white/95 px-2.5 py-1.5 font-mono text-[11px] font-bold text-navy shadow-sm ring-1 ring-navy/10">
              {PROJECT_ID}
            </span>
            <button
              type="button"
              aria-expanded={issuesOpen}
              onClick={(e) => {
                e.stopPropagation();
                setIssuesOpen((o) => !o);
              }}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold shadow-sm ring-1 transition",
                issuesOpen || showIssues
                  ? "bg-risk text-white ring-risk/30"
                  : "bg-risk-soft text-risk-ink ring-risk/20",
              )}
            >
              {issuesOpen ? <X weight="bold" className="size-3.5" /> : <WarningCircle weight="fill" className="size-3.5" />}
              Key issues
            </button>
          </div>
          {spaceHint ? (
            <span className="rounded-full bg-navy/90 px-2.5 py-1 text-[9px] font-extrabold text-white shadow-sm">
              {spaceHint}
            </span>
          ) : (
            <p className="max-w-[18rem] text-[12px] font-semibold text-muted-foreground">
              Same project file as assessment.
            </p>
          )}
        </motion.div>
        </div>

        {/* Row 2 — left panel by beat · phone · Central Platform */}
        {showIssues || showCaps ? (
          <CapabilityRail mode={showIssues ? "issues" : "caps"} reduce={!!reduce} />
        ) : demandOnly ? (
          <OnSpotDemandStage reduce={!!reduce} />
        ) : showSendFlow ? (
          <FieldFlowStage
            beat={beat}
            offline={offline}
            happy={happy}
            sending={sending}
            reduce={!!reduce}
          />
        ) : (
          <CapabilityRail mode="caps" reduce={!!reduce} />
        )}

        <div className="relative z-10 h-full min-h-0">
          <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.18)_100%)] shadow-[0_12px_36px_rgba(7,20,51,0.1)] ring-1 ring-white/55 backdrop-blur-[2px]">
            <MobileAppStage
              beat={beat}
              offline={offline}
              happy={happy}
              sending={sending}
              showDemand={showDemand}
              showIssues={showIssues}
              capturing={capturing}
              reduce={!!reduce}
            />
            <div className="pointer-events-none absolute top-1/2 right-0 z-20 -translate-y-1/2 translate-x-1/2">
              <FlowArrow offline={offline} happy={happy} sending={sending} reduce={!!reduce} />
            </div>
          </div>
        </div>

        <div className="relative z-10 h-full min-h-0">
          <PlatformHub
            beat={beat}
            offline={offline}
            happy={happy}
            sending={sending}
            showDemand={showDemand}
            reduce={!!reduce}
          />
        </div>
      </div>

      <StoryFooter showIssues={showIssues} beat={beat} />
    </div>
  );
}

/** Field captures → Central Platform — Problem Statement transfer craft. */
function FieldFlowStage({
  beat,
  offline,
  happy,
  sending,
  reduce,
}: {
  beat: number;
  offline: boolean;
  happy: boolean;
  sending: boolean;
  reduce: boolean;
}) {
  const midY = [12, 28, 46, 64, 82];
  /* Cone tip — wide fan on left, tight cluster into the hub / saved image */
  const hubYs = offline ? [40, 43, 45, 47, 50] : [46, 48, 50, 52, 54];
  const items = CAPTURES.filter((c) => c.id !== "demand");
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

  const srcX = 22;
  /* Offline tip meets left edge of Saved-safely image (~67%) */
  const hubX = offline ? 66.5 : 74;
  const hubTone = offline
    ? { ring: "ring-gold/40", glow: "rgba(201,162,39,0.22)", box: "bg-gold text-gold-ink", chip: "bg-gold-ink/10 text-gold-ink" }
    : happy || sending
      ? { ring: "ring-ok/40", glow: "rgba(14,138,114,0.22)", box: "bg-ok text-white", chip: "bg-white/15 text-white" }
      : { ring: "ring-[#5b9bd5]/40", glow: "rgba(91,155,213,0.22)", box: "bg-[#1a4e8a] text-white", chip: "bg-white/12 text-white/90" };

  const hubLabel = offline
    ? "Held on phone"
    : happy || sending
      ? "On Board file"
      : beat < 1
        ? "Waiting"
        : "Receiving";

  const paths = items.map((item, i) => {
    const y = midY[i] ?? 50;
    const hy = hubYs[i] ?? 50;
    /* Colour-matched rails — S-curve that funnels into one cone tip */
    const stroke = item.color;
    const mid = (srcX + hubX) / 2;
    const vb = `M ${srcX} ${y} C ${mid - 2} ${y}, ${mid + 6} ${hy}, ${hubX} ${hy}`;
    const x0 = (srcX / 100) * box.w;
    const y0 = (y / 100) * box.h;
    const x1 = (hubX / 100) * box.w;
    const y1 = (hy / 100) * box.h;
    const cx0 = ((mid - 2) / 100) * box.w;
    const cx1 = ((mid + 6) / 100) * box.w;
    return {
      item,
      y,
      hy,
      stroke,
      vb,
      px: `M ${x0} ${y0} C ${cx0} ${y0}, ${cx1} ${y1}, ${x1} ${y1}`,
    };
  });

  return (
    <motion.div
      className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-white/55 shadow-[0_12px_32px_rgba(7,20,51,0.08)] ring-1 ring-navy/8 backdrop-blur-[1.5px]"
      initial={reduce ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-navy/6 px-3.5 py-2">
        <div className="min-w-0">
          <div className="text-[9px] font-extrabold tracking-[0.14em] text-[#1a4e8a] uppercase">
            Field capture to Board file
          </div>
          <p className="mt-0.5 truncate text-[12px] font-semibold text-muted-foreground">
            Place · photos · notes · demand reach one Project ID.
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-extrabold",
            offline ? "bg-gold-soft text-gold-deep" : happy || sending ? "bg-ok-soft text-ok" : "bg-[#e8f1fa] text-[#1a4e8a]",
          )}
        >
          {items.length} captures
        </span>
      </div>

      <div ref={wrapRef} className="relative min-h-0 flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-[16%] size-[200px] -translate-y-1/2 rounded-full"
          style={{ background: `radial-gradient(circle, ${hubTone.glow} 0%, transparent 70%)` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[8%] left-[18%] h-[28%] w-[55%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.55)_0%,rgba(180,210,230,0.22)_45%,transparent_72%)]"
        />

        {/* Transfer rails — Problem Statement craft */}
        <svg
          className="pointer-events-none absolute inset-0 z-[6] h-full w-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            {paths.map((p, i) => (
              <linearGradient key={`gps-lg-${i}`} id={`gps-flow-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={p.stroke} stopOpacity="0.12" />
                <stop offset="55%" stopColor={p.stroke} stopOpacity="0.85" />
                <stop offset="100%" stopColor={p.stroke} stopOpacity="1" />
              </linearGradient>
            ))}
          </defs>

          {paths.map((p, i) => (
            <g key={`rail-${p.item.id}`}>
              <path
                d={p.vb}
                fill="none"
                stroke={p.stroke}
                strokeWidth={3.4}
                strokeOpacity={0.14}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <motion.path
                d={p.vb}
                fill="none"
                stroke={`url(#gps-flow-${i})`}
                strokeWidth={2.2}
                strokeDasharray="5.5 3.2"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: reduce ? 0 : 0.55, delay: reduce ? 0 : 0.2 + i * 0.06, ease }}
              />
            </g>
          ))}
        </svg>

        {/* Traveling capture icons along rails */}
        {!reduce && box.w > 0
          ? paths.map((p, i) => (
              <motion.span
                key={`travel-${p.item.id}`}
                className="absolute top-0 left-0 z-[8] grid size-[22px] place-items-center rounded-full text-white ring-[3px] ring-white"
                style={{
                  background: p.stroke,
                  offsetPath: `path('${p.px}')`,
                  offsetRotate: "0deg",
                  offsetAnchor: "center",
                  boxShadow: `0 0 0 1px ${p.stroke}55, 0 0 12px ${p.stroke}55, 0 4px 10px rgba(0,40,100,0.18)`,
                }}
                initial={{ offsetDistance: "0%", opacity: 0, scale: 0.7 }}
                animate={{
                  offsetDistance: ["0%", "100%"],
                  opacity: [0, 1, 1, 0],
                  scale: [0.7, 1, 1, 0.82],
                }}
                transition={{
                  duration: (offline ? 1.7 : 2.05) + i * 0.12,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.3 + i * 0.16,
                  times: [0, 0.12, 0.82, 1],
                }}
                aria-hidden
              >
                <p.item.Icon weight="fill" className="size-2.5" />
              </motion.span>
            ))
          : null}

        <div className="absolute inset-y-2.5 left-2.5 z-10 flex w-[48%] flex-col">
          <div className="mb-1.5 text-[9px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
            Sending from phone
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-between py-0.5">
            {items.map((item, i) => (
              <Stagger key={item.id} delay={30 + i * 35}>
                <motion.div
                  className="flex items-center gap-2"
                  whileHover={reduce ? undefined : { x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="relative shrink-0">
                    <motion.span
                      className="grid size-9 place-items-center rounded-full text-white shadow-[0_6px_14px_rgba(7,20,51,0.2)] ring-2 ring-white"
                      style={{ background: item.color }}
                      animate={reduce ? undefined : { scale: [1, 1.05, 1] }}
                      transition={{ duration: 2.4 + i * 0.12, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                    >
                      <item.Icon weight="fill" className="size-3.5" />
                    </motion.span>
                    <span
                      className={cn(
                        "absolute -top-0.5 -right-0.5 grid size-3.5 place-items-center rounded-full text-white shadow-sm ring-[1.5px] ring-white",
                        offline ? "bg-gold" : happy || sending ? "bg-ok" : "bg-[#1a4e8a]",
                      )}
                    >
                      {offline ? (
                        <LinkBreak weight="bold" className="size-2 text-gold-ink" />
                      ) : happy || sending ? (
                        <Check weight="bold" className="size-2" />
                      ) : (
                        <CloudArrowUp weight="bold" className="size-2" />
                      )}
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[12px] font-bold leading-tight text-navy">{item.label}</span>
                    <span className="block truncate text-[10px] font-semibold text-muted-foreground">{item.holds}</span>
                  </span>
                </motion.div>
              </Stagger>
            ))}
          </div>
        </div>

        <div className="absolute top-1/2 right-3 z-10 flex w-[148px] -translate-y-1/2 flex-col items-center">
          {offline ? (
            <motion.div
              className="relative flex flex-col items-center bg-transparent"
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease }}
            >
              <motion.img
                src={savedSafelyOnDevice}
                alt="Saved safely on device"
                draggable={false}
                className="relative z-[1] w-[118px] bg-transparent object-contain select-none drop-shadow-[0_10px_22px_rgba(7,20,51,0.14)]"
                animate={reduce ? undefined : { y: [0, -3, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          ) : (
            <>
              {!reduce ? (
                <motion.div
                  className={cn("pointer-events-none absolute size-32 rounded-full border", hubTone.ring)}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.65, 0.3] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : null}
              <motion.div
                className={cn(
                  "relative flex flex-col items-center rounded-2xl px-3 py-3.5 text-center shadow-[0_16px_36px_rgba(7,20,51,0.28)] ring-4",
                  hubTone.box,
                  hubTone.ring,
                )}
                animate={reduce ? undefined : { scale: [1, 1.03, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span
                  className={cn(
                    "grid size-11 place-items-center rounded-xl shadow-md",
                    happy || sending ? "bg-white/20 text-white" : "bg-[#5b9bd5] text-white",
                  )}
                >
                  <Database weight="fill" className="size-5" />
                </span>
                <div className="mt-2 text-[8px] font-extrabold tracking-[0.12em] text-white/70 uppercase">
                  Central Platform
                </div>
                <b className="mt-0.5 text-[12px] leading-snug">ABC project</b>
                <span className={cn("mt-1.5 rounded-full px-2 py-0.5 text-[8px] font-bold", hubTone.chip)}>
                  {hubLabel}
                </span>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/** Formal GoK On-spot Demand — panel (left) or phone (compact). */
function FormalDemandNotice({ compact = false }: { compact?: boolean }) {
  const projectFields = [
    { label: "Project ID", value: PROJECT_ID },
    { label: "Project Name", value: PROJECT_NAME },
    { label: "Project Location", value: "Bengaluru, Karnataka" },
    { label: "Project Type", value: "Commercial Complex" },
    { label: "Applicant / Builder", value: "ABC Builders & Developers Pvt. Ltd." },
    { label: "Sanction Reference", value: "BBMP/BNG/2025/12345" },
  ] as const;

  const calcRows = [
    { sl: "1", desc: "Estimated Construction Cost", rate: "—", amount: "12,00,00,000" },
    { sl: "2", desc: "Labour Cess Rate", rate: "1%", amount: "12,00,000" },
  ] as const;

  const bankRows = [
    { label: "Beneficiary", value: "Karnataka Labour Cess Collection" },
    { label: "Bank", value: "Karnataka Bank" },
    { label: "Account No.", value: "12345678901234" },
    { label: "IFSC", value: "KARB0000123" },
    { label: "Reference", value: "DN-2025-00412" },
  ] as const;

  const slipFields: { label: string; value: string; strong?: boolean }[] = [
    { label: "Demand No.", value: "DN-2025-00412" },
    { label: "Project ID", value: PROJECT_ID },
    { label: "Project Name", value: PROJECT_NAME },
    { label: "Due Date", value: "25 Oct 2026" },
    { label: "Total Amount", value: "₹ 12,00,000", strong: true },
  ];

  return (
    <div className={cn("bg-white text-[#102653]", compact ? "text-[9px]" : "")}>
      <header
        className={cn(
          "relative overflow-hidden border-b border-[#d8e3ea]",
          compact ? "px-2 pt-2 pb-1.5" : "px-3.5 pt-3 pb-2.5",
        )}
      >
        <img
          src={hubStageCity}
          alt=""
          aria-hidden
          className={cn(
            "pointer-events-none absolute -top-4 -right-6 object-cover opacity-[0.2] mix-blend-multiply",
            compact ? "h-16 w-28" : "h-28 w-44",
          )}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -top-14 -right-16 size-44 rounded-full bg-[linear-gradient(135deg,rgba(0,102,204,0.12),rgba(0,174,170,0.03))]"
        />

        <div className="relative z-[1] flex items-center gap-2">
          <span
            className={cn(
              "grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#eef7ff] ring-1 ring-[#d4e5f2]",
              compact ? "size-8" : "size-11",
            )}
          >
            <img
              src={karnatakaEmblem}
              alt=""
              aria-hidden
              className={cn("object-contain", compact ? "size-6" : "size-9")}
              draggable={false}
            />
          </span>
          <div className="min-w-0 flex-1 text-center">
            <div
              className={cn(
                "font-extrabold tracking-[0.14em] text-[#0b5fa5] uppercase",
                compact ? "text-[6px]" : "text-[8px]",
              )}
            >
              Government of Karnataka
            </div>
            <div
              className={cn(
                "mt-0.5 leading-snug font-extrabold text-[#102653]",
                compact ? "text-[8px]" : "text-[11px]",
              )}
            >
              Karnataka Building and Other Construction Workers Welfare Board
            </div>
            <div className={cn("mt-0.5 font-semibold text-[#60738e]", compact ? "text-[7px]" : "text-[9px]")}>
              Labour Department · Government of Karnataka
            </div>
          </div>
        </div>

        <div
          className={cn(
            "relative z-[1] mt-2 flex items-center justify-between gap-2 rounded-xl border border-[#d5e5ef] bg-[linear-gradient(90deg,#edf6ff,#f7fbfd)]",
            compact ? "px-2 py-1.5" : "px-3 py-2",
          )}
        >
          <div className="min-w-0">
            <div className={cn("font-black tracking-wide text-[#123c88]", compact ? "text-[11px]" : "text-[15px]")}>
              ON-SPOT DEMAND
            </div>
            <div className={cn("font-semibold text-[#5c6e87]", compact ? "text-[7px]" : "text-[9px]")}>
              For Labour Cess Collection
            </div>
          </div>
          <div className={cn("shrink-0 border-l border-[#c9d9e6] text-right", compact ? "pl-2" : "pl-3")}>
            <div className={cn("font-semibold text-[#667891]", compact ? "text-[6px]" : "text-[8px]")}>Demand No.</div>
            <div className={cn("font-mono font-extrabold text-[#0b2b68]", compact ? "text-[9px]" : "text-[12px]")}>
              DN-2025-00412
            </div>
            <div className={cn("mt-0.5 font-semibold text-[#667891]", compact ? "text-[6px]" : "text-[8px]")}>
              Date: 25 Sep 2026
            </div>
          </div>
        </div>
      </header>

      <main className={cn("space-y-2", compact ? "px-2 py-1.5" : "space-y-2.5 px-3.5 py-2.5")}>
        <section className="overflow-hidden rounded-xl border border-[#d9e4eb] bg-white">
          <div className={cn("flex items-center gap-1.5 border-b border-[#dce7ed] bg-[#f6fafc]", compact ? "px-1.5 py-1" : "px-2.5 py-1.5")}>
            <span className={cn("grid place-items-center rounded-md bg-[#e5f3ff] text-[#0875ca]", compact ? "size-4" : "size-5")}>
              <Buildings weight="fill" className={compact ? "size-2.5" : "size-3"} />
            </span>
            <span className={cn("font-extrabold tracking-[0.08em] text-[#0c3f88] uppercase", compact ? "text-[7px]" : "text-[9px]")}>
              Project details
            </span>
          </div>
          <div className="grid grid-cols-2">
            {projectFields.map((field, i) => (
              <div
                key={field.label}
                className={cn(
                  compact ? "px-1.5 py-1" : "px-2.5 py-1.5",
                  i < projectFields.length - 2 && "border-b border-[#e3ebef]",
                  i % 2 === 0 && "border-r border-[#e3ebef]",
                )}
              >
                <div className={cn("font-semibold text-[#718198]", compact ? "text-[6px]" : "text-[7px]")}>{field.label}</div>
                <div className={cn("truncate font-bold text-[#142d62]", compact ? "text-[8px]" : "text-[10px]")}>{field.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-[#d9e4eb] bg-white">
          <div className={cn("flex items-center gap-1.5 border-b border-[#dce7ed] bg-[#f6fafc]", compact ? "px-1.5 py-1" : "px-2.5 py-1.5")}>
            <span className={cn("grid place-items-center rounded-md bg-[#e5f3ff] text-[#0875ca]", compact ? "size-4" : "size-5")}>
              <Calculator weight="fill" className={compact ? "size-2.5" : "size-3"} />
            </span>
            <span className={cn("font-extrabold tracking-[0.08em] text-[#0c3f88] uppercase", compact ? "text-[7px]" : "text-[9px]")}>
              Cess calculation
            </span>
          </div>
          <div className={compact ? "p-1.5" : "p-2"}>
            <table className={cn("w-full border-collapse", compact ? "text-[7px]" : "text-[9px]")}>
              <thead>
                <tr className="bg-[#edf6ff] text-left text-[#17366e]">
                  <th className="border border-[#d7e4ed] px-1 py-0.5 font-extrabold">Sl.</th>
                  <th className="border border-[#d7e4ed] px-1 py-0.5 font-extrabold">Description</th>
                  <th className="border border-[#d7e4ed] px-1 py-0.5 text-right font-extrabold">Rate</th>
                  <th className="border border-[#d7e4ed] px-1 py-0.5 text-right font-extrabold">₹</th>
                </tr>
              </thead>
              <tbody>
                {calcRows.map((row) => (
                  <tr key={row.sl} className="text-[#344968]">
                    <td className="border border-[#dce6ec] px-1 py-0.5">{row.sl}</td>
                    <td className="border border-[#dce6ec] px-1 py-0.5 font-semibold">{row.desc}</td>
                    <td className="border border-[#dce6ec] px-1 py-0.5 text-right font-bold">{row.rate}</td>
                    <td className="border border-[#dce6ec] px-1 py-0.5 text-right font-bold">{row.amount}</td>
                  </tr>
                ))}
                <tr className="bg-[#e9f5ff] font-black text-[#0a2e70]">
                  <td className="border border-[#dce6ec] px-1 py-1" colSpan={2}>
                    Total Cess Demand
                  </td>
                  <td className={cn("border border-[#dce6ec] px-1 py-1 text-right font-bold", compact ? "text-[6px]" : "text-[8px]")}>
                    1% of cost
                  </td>
                  <td className={cn("border border-[#dce6ec] px-1 py-1 text-right", compact ? "text-[9px]" : "text-[11px]")}>
                    ₹ 12,00,000
                  </td>
                </tr>
              </tbody>
            </table>
            <p className={cn("mt-1 font-semibold text-[#526681]", compact ? "text-[6px]" : "text-[8px]")}>
              Amount in words: <span className="font-extrabold text-[#172e61]">Rupees Twelve Lakh Only</span>
            </p>
          </div>
        </section>

        <div
          className={cn(
            "flex items-center gap-2 rounded-xl border border-[#bcd9ec] bg-[linear-gradient(110deg,#edf8ff,#f5fbff)]",
            compact ? "px-1.5 py-1.5" : "gap-2.5 px-2.5 py-2",
          )}
        >
          <img
            src={icon3dRupee}
            alt=""
            aria-hidden
            className={cn("shrink-0 object-contain drop-shadow-sm", compact ? "size-8" : "size-11")}
          />
          <div className="min-w-0 flex-1">
            <div className={cn("font-extrabold tracking-[0.1em] text-[#5b708b] uppercase", compact ? "text-[6px]" : "text-[8px]")}>
              Total Cess Demand
            </div>
            <div className={cn("font-display leading-none font-black text-[#09265e]", compact ? "text-[15px]" : "text-[22px]")}>
              ₹ 12,00,000
            </div>
          </div>
          <div className={cn("shrink-0 border-l border-[#cbdde8]", compact ? "pl-1.5" : "pl-2.5")}>
            <div className={cn("font-semibold text-[#65758c]", compact ? "text-[6px]" : "text-[7px]")}>Payment Status</div>
            <div
              className={cn(
                "mt-0.5 inline-flex items-center gap-1 rounded-full bg-[#fff0f0] font-extrabold text-[#bd3030]",
                compact ? "px-1.5 py-0.5 text-[6px]" : "px-2 py-1 text-[8px]",
              )}
            >
              <img src={icon3dClockRed} alt="" aria-hidden className={cn("object-contain", compact ? "size-2.5" : "size-3.5")} />
              AWAITING
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-xl border border-[#d9e4eb] bg-white">
          <div className={cn("flex items-center gap-1.5 border-b border-[#dce7ed] bg-[#f6fafc]", compact ? "px-1.5 py-1" : "px-2.5 py-1.5")}>
            <span className={cn("grid place-items-center rounded-md bg-[#e5f3ff] text-[#0875ca]", compact ? "size-4" : "size-5")}>
              <CreditCard weight="fill" className={compact ? "size-2.5" : "size-3"} />
            </span>
            <span className={cn("font-extrabold tracking-[0.08em] text-[#0c3f88] uppercase", compact ? "text-[7px]" : "text-[9px]")}>
              Payment details
            </span>
          </div>
          <div
            className={cn(
              "grid items-center gap-1.5",
              compact ? "grid-cols-[52px_minmax(0,1fr)] p-1.5" : "grid-cols-[72px_minmax(0,1fr)_88px] gap-2 p-2",
            )}
          >
            <div className="text-center">
              <div
                className={cn(
                  "mx-auto grid place-items-center rounded-md bg-white shadow-[0_3px_10px_rgba(0,0,0,0.12)] ring-2 ring-white",
                  compact ? "size-11" : "size-[58px] ring-4",
                )}
                style={{
                  backgroundImage: "repeating-conic-gradient(#111 0% 25%, #fff 0% 50%)",
                  backgroundPosition: "50%",
                  backgroundSize: compact ? "8px 8px" : "10px 10px",
                }}
              >
                <span className={cn("rounded bg-white font-extrabold leading-tight text-navy", compact ? "px-0.5 text-[5px]" : "px-1 py-0.5 text-[6px]")}>
                  QR
                  <br />
                  PAY
                </span>
              </div>
              {!compact ? <div className="mt-1 text-[7px] font-semibold text-[#64758a]">Scan &amp; Pay</div> : null}
            </div>

            <div className="min-w-0 border-l border-[#dce5eb] pl-1.5">
              {bankRows.map((row) => (
                <div
                  key={row.label}
                  className={cn("grid gap-0.5 py-px", compact ? "grid-cols-1 text-[6px]" : "grid-cols-[62px_minmax(0,1fr)] text-[8px]")}
                >
                  {compact ? (
                    <span className="truncate font-bold text-[#18356d]">
                      <span className="font-semibold text-[#718096]">{row.label}: </span>
                      {row.value}
                    </span>
                  ) : (
                    <>
                      <span className="font-semibold text-[#718096]">{row.label}</span>
                      <span className="truncate font-bold text-[#18356d]">{row.value}</span>
                    </>
                  )}
                </div>
              ))}
            </div>

            {!compact ? (
              <div className="rounded-lg border border-[#d2e8f7] bg-[#edf7ff] px-1.5 py-2 text-center">
                <div className="text-[7px] font-extrabold tracking-wide text-[#657890]">PAY THIS AMOUNT</div>
                <div className="mt-0.5 text-[13px] font-black text-[#0b397d]">₹ 12,00,000</div>
                <button
                  type="button"
                  className="mt-1.5 inline-flex w-full items-center justify-center gap-1 rounded-md bg-[#0875d1] px-1.5 py-1.5 text-[8px] font-extrabold text-white shadow-sm"
                >
                  <CreditCard weight="fill" className="size-2.5" />
                  Pay Online
                </button>
              </div>
            ) : null}
          </div>
          {compact ? (
            <div className="border-t border-[#dce7ed] bg-[#edf7ff] px-1.5 py-1.5 text-center">
              <div className="text-[6px] font-extrabold tracking-wide text-[#657890]">PAY THIS AMOUNT</div>
              <div className="text-[12px] font-black text-[#0b397d]">₹ 12,00,000</div>
              <button
                type="button"
                className="mt-1 inline-flex items-center justify-center gap-1 rounded-md bg-[#0875d1] px-2 py-1 text-[7px] font-extrabold text-white"
              >
                <CreditCard weight="fill" className="size-2.5" />
                Pay Online
              </button>
            </div>
          ) : null}
        </section>

        <div
          className={cn(
            "flex items-center gap-1 font-extrabold tracking-[0.08em] text-[#77899b] uppercase",
            compact ? "text-[6px]" : "gap-1.5 text-[8px]",
          )}
        >
          <span className="h-px flex-1 border-t border-dashed border-[#b9c8d2]" />
          <Scissors weight="bold" className={cn("shrink-0 -scale-x-100", compact ? "size-2.5" : "size-3")} />
          <span className="shrink-0">Payment slip</span>
          <span className="h-px flex-1 border-t border-dashed border-[#b9c8d2]" />
        </div>

        <section className="overflow-hidden rounded-xl border border-[#b9cad7] bg-white">
          <div className={cn("flex items-center justify-between gap-1 border-b border-[#d6e2e9] bg-[#f4f9fc]", compact ? "px-1.5 py-1" : "px-2.5 py-1.5")}>
            <div className="flex min-w-0 items-center gap-1">
              <img src={karnatakaEmblem} alt="" aria-hidden className={cn("object-contain", compact ? "size-4" : "size-5")} />
              <div className="min-w-0">
                <div className={cn("truncate font-extrabold text-[#123777]", compact ? "text-[6px]" : "text-[8px]")}>
                  KBOCWWB · Labour Department
                </div>
              </div>
            </div>
            <div className={cn("shrink-0 text-right font-extrabold text-[#123777]", compact ? "text-[7px]" : "text-[9px]")}>
              PAYMENT SLIP
            </div>
          </div>
          <div className={compact ? "p-1.5" : "p-2"}>
            <div className={cn("grid overflow-hidden rounded-lg border border-[#d6e2e9]", compact ? "grid-cols-2" : "grid-cols-5")}>
              {slipFields.map((field, i) => (
                <div
                  key={field.label}
                  className={cn(
                    compact ? "px-1 py-1" : "px-1.5 py-1.5",
                    compact
                      ? i < slipFields.length - 1 && "border-b border-[#d6e2e9]"
                      : i < slipFields.length - 1 && "border-r border-[#d6e2e9]",
                    compact && i % 2 === 0 && "border-r border-[#d6e2e9]",
                  )}
                >
                  <div className={cn("font-semibold text-[#73849a]", compact ? "text-[5px]" : "text-[6px]")}>{field.label}</div>
                  <div
                    className={cn(
                      "truncate font-extrabold text-[#102e66]",
                      field.strong ? (compact ? "text-[8px]" : "text-[10px]") : compact ? "text-[7px]" : "text-[8px]",
                    )}
                  >
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
            {!compact ? (
              <div className="mt-2 flex items-start justify-between gap-2 text-[7px] leading-snug text-[#5f7188]">
                <div className="min-w-0">
                  <div className="font-extrabold text-[#18366c]">Payment instructions</div>
                  <p className="mt-0.5">1. Pay by QR or bank details above.</p>
                  <p>2. Mention Demand No. DN-2025-00412.</p>
                  <p>3. Receipt issues after successful payment.</p>
                </div>
                <div className="shrink-0">
                  <div className="font-extrabold text-[#18366c]">Support</div>
                  <p className="mt-0.5 inline-flex items-center gap-1">
                    <Phone weight="fill" className="size-2.5 text-[#0875ca]" />
                    1800 425 1234
                  </p>
                  <p className="mt-0.5">cesssupport@karnataka.gov.in</p>
                </div>
              </div>
            ) : (
              <p className="mt-1 text-[6px] font-semibold text-[#5f7188]">
                Support: 1800 425 1234 · cesssupport@karnataka.gov.in
              </p>
            )}
          </div>
        </section>
      </main>

      <footer
        className={cn(
          "flex items-center justify-between gap-2 border-t border-[#dce5ea] bg-[#f7fafc] font-semibold text-[#75859a]",
          compact ? "px-2 py-1 text-[5px]" : "px-3.5 py-1.5 text-[7px]",
        )}
      >
        <span>Labour CESS Tracking &amp; Monitoring System</span>
        <span>System-generated</span>
      </footer>
    </div>
  );
}

/** On-spot demand — full notice, edge-to-edge width, scroll for height. */
function OnSpotDemandStage({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-[linear-gradient(165deg,#f7fbff_0%,#eef5fa_42%,#e8f1f6_100%)] shadow-[0_12px_32px_rgba(7,20,51,0.08)] ring-1 ring-navy/8"
      initial={reduce ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <img
        src={hubStageCity}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.1] mix-blend-multiply"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(247,251,255,0.35)_0%,rgba(238,245,250,0.5)_50%,rgba(232,241,246,0.65)_100%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 -left-8 size-56 rounded-full bg-[radial-gradient(circle,rgba(20,196,212,0.12)_0%,transparent_68%)]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-12 top-[18%] size-52 rounded-full bg-[radial-gradient(circle,rgba(26,78,138,0.07)_0%,transparent_70%)]"
      />

      <div className="relative z-[1] min-h-0 flex-1 overflow-x-hidden overflow-y-auto [scrollbar-width:thin]">
        <motion.img
          src={demandNotice3d}
          alt="On-spot Demand for Labour Cess Collection — DN-2025-00412"
          className="block w-full h-auto object-contain object-top drop-shadow-[0_12px_28px_rgba(7,20,51,0.14)]"
          draggable={false}
          initial={reduce ? false : { opacity: 0.92, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease }}
        />
      </div>
    </motion.div>
  );
}

/** Red rubber DRAFT stamp — stamps in when on-spot demand opens. */
function DraftStamp({ reduce, compact = false }: { reduce: boolean; compact?: boolean }) {
  return (
    <motion.div
      aria-label="Draft"
      className={cn(
        "pointer-events-none absolute z-30 select-none rounded-[4px] border-[2.5px] border-[#c62828] font-black tracking-[0.2em] text-[#c62828] uppercase",
        compact
          ? "top-[48%] right-[8%] px-2.5 py-1 text-[15px]"
          : "top-[20%] right-[10%] px-3 py-1 text-[22px]",
      )}
      style={{
        background: "rgba(255, 240, 240, 0.72)",
        boxShadow: "0 2px 8px rgba(198,40,40,0.22), inset 0 0 0 1px rgba(198,40,40,0.18)",
        textShadow: "0 1px 0 rgba(255,255,255,0.4)",
      }}
      initial={reduce ? false : { opacity: 0, scale: 2.6, rotate: -48 }}
      animate={{ opacity: 0.95, scale: 1, rotate: -18 }}
      exit={reduce ? undefined : { opacity: 0, scale: 0.85, rotate: -8 }}
      transition={
        reduce
          ? { duration: 0 }
          : { type: "spring", stiffness: 340, damping: 13, mass: 0.65, delay: 0.22 }
      }
    >
      Draft
    </motion.div>
  );
}

function CapabilityRail({ mode, reduce }: { mode: "caps" | "issues"; reduce: boolean }) {
  const isIssues = mode === "issues";
  const rows = isIssues
    ? KEY_ISSUES.map((item) => ({
        label: item.label,
        detail: item.detail,
        Icon: item.Icon,
        glow: item.glow,
        shade: item.shade,
        risk: true as const,
      }))
    : CAPABILITIES.map((item) => ({
        label: item.label,
        detail: item.detail,
        Icon: item.Icon,
        glow: item.glow,
        shade: item.shade,
        risk: false as const,
      }));

  return (
    <div
      className={cn(
        "relative z-10 flex min-h-0 flex-col overflow-hidden rounded-2xl border shadow-[0_10px_28px_rgba(7,20,51,0.06)] backdrop-blur-sm",
        isIssues ? "border-risk/20 bg-white/95" : "border-navy/8 bg-white/92",
      )}
    >
      {isIssues ? (
        <div className="shrink-0 border-b border-risk/15 bg-risk-soft px-3.5 py-2">
          <div className="flex items-center gap-1.5">
            <span className="grid size-5 place-items-center rounded-full bg-risk text-white shadow-sm">
              <WarningCircle weight="fill" className="size-3" />
            </span>
            <div>
              <div className="text-[9px] font-extrabold tracking-[0.14em] text-risk uppercase">Key issues</div>
              <div className="text-[11px] font-bold text-risk-ink">What field capture must support</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="shrink-0 border-b border-navy/6 px-3.5 py-2">
          <div className="text-[9px] font-extrabold tracking-[0.14em] text-teal uppercase">Field capabilities</div>
          <div className="text-[11px] font-bold text-navy">What the Field Mobile App does</div>
        </div>
      )}

      <ol className="grid min-h-0 flex-1 grid-rows-4">
        {rows.map((item, i) => (
          <motion.li
            key={`${mode}-${item.label}`}
            initial={reduce ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, delay: reduce ? 0 : i * 0.05 }}
            className="min-h-0 border-b border-navy/6 last:border-b-0"
          >
            <div
              className={cn(
                "flex h-full w-full items-center gap-3 px-3.5 text-left",
                isIssues && "bg-risk-soft/25",
              )}
            >
              <span
                className={cn(
                  "font-display w-5 shrink-0 text-[13px] font-extrabold",
                  isIssues ? "text-risk/55" : "text-navy/30",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <CapDisc3D Icon={item.Icon} glow={item.glow} shade={item.shade} />
              <span className="min-w-0 flex-1">
                <b
                  className={cn(
                    "block text-[14px] leading-snug font-extrabold",
                    item.risk ? "text-risk-ink" : "text-navy",
                  )}
                >
                  {item.label}
                </b>
                <span className="mt-0.5 block text-[11px] leading-snug font-semibold text-muted-foreground">
                  {item.detail}
                </span>
              </span>
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

/** Clay 3D disc — same craft as Assess / Problem stamps. */
function CapDisc3D({
  Icon,
  glow,
  shade,
}: {
  Icon: CessIcon;
  glow: string;
  shade: string;
}) {
  return (
    <span className="relative grid size-12 shrink-0 place-items-center" aria-hidden>
      <span
        className="pointer-events-none absolute top-[88%] left-1/2 h-2 w-8 -translate-x-1/2 rounded-[100%] blur-[1px]"
        style={{ background: `radial-gradient(ellipse at center, ${glow} 0%, transparent 70%)` }}
      />
      <span
        className="relative grid size-12 place-items-center rounded-full shadow-[0_5px_12px_rgba(7,20,51,0.24),0_2px_0_rgba(255,255,255,0.55)_inset,0_-3px_6px_rgba(0,0,0,0.22)_inset] ring-[3px] ring-white"
        style={{ background: shade }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[46%] rounded-t-full bg-[linear-gradient(180deg,rgba(255,255,255,0.4),transparent)]"
        />
        <Icon weight="fill" className="relative z-[1] size-5 text-white drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.32)]" />
      </span>
    </span>
  );
}

/** Offline beat — Network Unavailable + saved-on-phone status inside the field app. */
function OfflineSavedPanel({ reduce }: { reduce: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-1">
      <motion.div
        className="flex shrink-0 items-start gap-2 rounded-2xl bg-[#fbf3e8] px-2 py-1.5 ring-1 ring-[#e8d4b8]/80"
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease }}
      >
        <span className="relative mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[#f0e0c4] text-[#6b4a1e] shadow-sm ring-1 ring-[#e2c99a]/70">
          <WifiSlash weight="bold" className="size-3.5" />
          <span className="absolute -right-0.5 -bottom-0.5 grid size-2.5 place-items-center rounded-full bg-[#e0453c] text-white ring-1 ring-white">
            <X weight="bold" className="size-1.5" />
          </span>
        </span>
        <div className="min-w-0 leading-tight">
          <div className="text-[10px] font-extrabold text-[#5c3d18]">Network Unavailable</div>
          <p className="mt-0.5 text-[8px] font-semibold leading-snug text-[#7a6248]">
            Data is saved on your phone and will sync automatically.
          </p>
        </div>
      </motion.div>

      <motion.div
        className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#f7fafc_0%,#eef5f8_100%)] px-1.5 py-1.5 ring-1 ring-navy/6"
        initial={reduce ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: reduce ? 0 : 0.08, ease }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute top-[38%] left-1/2 size-[5.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(120,190,230,0.38)_0%,transparent_70%)]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute top-[38%] left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(160,210,240,0.5)_0%,transparent_72%)]"
        />

        <motion.div
          className="relative z-[1]"
          animate={reduce ? undefined : { y: [0, -2, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="relative block">
            {/* Outline handset — soft blue screen, matches offline reference */}
            <span className="relative block h-[52px] w-[34px] rounded-[9px] bg-[#1a3a66] p-[2.5px] shadow-[0_6px_14px_rgba(13,58,110,0.28)] ring-1 ring-white/80">
              <span className="absolute top-[3px] left-1/2 z-[1] h-[2px] w-2.5 -translate-x-1/2 rounded-full bg-[#1a3a66]/55" />
              <span className="block h-full w-full rounded-[6.5px] bg-[linear-gradient(165deg,#c8e8f8_0%,#9fd0ec_45%,#7eb8dc_100%)]" />
            </span>
            <span className="absolute -right-1.5 -bottom-1 grid size-5 place-items-center rounded-full bg-ok text-white shadow-[0_3px_8px_rgba(14,138,114,0.4)] ring-[2px] ring-white">
              <Check weight="bold" className="size-2.5" />
            </span>
          </span>
        </motion.div>

        <div className="relative z-[1] mt-1.5 text-center text-[9px] font-extrabold text-[#0e6b5c]">
          Saved on phone · Sync pending
        </div>

        <div className="relative z-[1] mt-1 flex flex-wrap justify-center gap-1">
          {CAPTURES.map((item, i) => (
            <Stagger key={item.id} delay={80 + i * 28}>
              <span
                className="grid size-5 place-items-center rounded-full text-white shadow-sm ring-1 ring-white"
                style={{ background: item.color }}
                title={item.label}
              >
                <item.Icon weight="fill" className="size-2.5" />
              </span>
            </Stagger>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function MobileAppStage({
  beat,
  offline,
  happy,
  sending,
  showDemand,
  showIssues,
  capturing,
  reduce,
}: {
  beat: number;
  offline: boolean;
  happy: boolean;
  sending: boolean;
  showDemand: boolean;
  showIssues: boolean;
  capturing: boolean;
  reduce: boolean;
}) {
  const onlineLabel = offline ? "Offline" : "Online";

  return (
    <div className="relative flex h-full min-h-0 w-full items-center justify-center px-1 py-1">
      <motion.div
        className="relative flex h-full max-h-full w-auto max-w-[min(100%,360px)] aspect-[9/18.8] flex-col"
        animate={reduce ? undefined : { y: [0, -3, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="flex h-full min-h-0 flex-col rounded-[42px] bg-[#1a1f2e] p-[8px] shadow-[0_28px_60px_rgba(7,20,51,0.42)] ring-1 ring-white/30">
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[34px] bg-[#f3f6fb]">
            <div className="pointer-events-none absolute top-0 left-1/2 z-20 h-5 w-28 -translate-x-1/2 rounded-b-2xl bg-[#1a1f2e]" />

            <div className="relative z-10 flex shrink-0 items-center justify-between px-3.5 pt-2.5 pb-0.5 text-[9px] font-bold text-navy">
              <span>10:24</span>
              <span className="tracking-tighter text-navy/35">▮▮▮</span>
            </div>

            <div className="shrink-0 border-b border-navy/8 bg-white px-2.5 py-2">
              <div className="flex items-center gap-2">
                <span className="relative grid size-8 place-items-center rounded-full bg-navy text-teal-bright shadow-[0_3px_0_0_rgba(7,20,51,0.28),0_1.5px_0_rgba(255,255,255,0.35)_inset]">
                  <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-full bg-[linear-gradient(180deg,rgba(255,255,255,0.28),transparent)]" />
                  <DeviceMobile weight="fill" className="relative z-[1] size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[7px] font-extrabold tracking-[0.14em] text-teal uppercase">CESS Field App</div>
                  <div className="truncate text-[12px] font-extrabold leading-tight text-navy">Field Visit</div>
                </div>
                <motion.span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[8px] font-extrabold uppercase shadow-sm",
                    offline ? "bg-gold text-gold-ink" : happy ? "bg-ok text-white" : "bg-ok-soft text-ok",
                  )}
                  animate={reduce ? undefined : { opacity: [1, 0.75, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {onlineLabel}
                </motion.span>
              </div>
            </div>

            <div className="relative flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden px-2 py-1.5">
              <AnimatePresence>
                {showDemand && !happy ? (
                  <DraftStamp key="draft-stamp" reduce={reduce} compact />
                ) : null}
              </AnimatePresence>
              <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-white px-2 py-1.5 shadow-sm ring-1 ring-navy/8">
                <img
                  src={inspectorPhoto}
                  alt=""
                  aria-hidden
                  className="size-9 shrink-0 rounded-full object-cover ring-2 ring-accent"
                />
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-[11px] text-navy">{PROJECT_NAME}</b>
                  <span className="block text-[9px] font-semibold text-muted-foreground">R. Kumar · Site Inspector</span>
                </div>
              </div>

              <div className="relative shrink-0 overflow-hidden rounded-2xl bg-navy text-white shadow-[0_8px_18px_rgba(7,20,51,0.22)]">
                <div aria-hidden className="pointer-events-none absolute -top-3 -left-2 h-12 w-12 rounded-full border border-teal-bright/25" />
                <div aria-hidden className="pointer-events-none absolute -right-2 -bottom-3 h-14 w-14 rounded-full border border-teal-bright/15" />
                <div className="relative flex items-center gap-2.5 px-2.5 py-2">
                  <motion.span
                    className="relative grid size-9 shrink-0 place-items-center rounded-full bg-teal-bright text-navy shadow-[0_3px_0_0_rgba(7,20,51,0.2),0_1.5px_0_rgba(255,255,255,0.55)_inset]"
                    animate={reduce || !capturing ? undefined : { scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <MapPin weight="fill" className="size-4" />
                  </motion.span>
                  <div className="min-w-0">
                    <div className="text-[7px] font-extrabold tracking-[0.14em] text-teal-bright uppercase">
                      {capturing ? "Place captured" : "Tap to capture place"}
                    </div>
                    <div className="truncate text-[11px] font-bold">
                      {capturing ? COORDS : "Standing at ABC site"}
                    </div>
                  </div>
                </div>
              </div>

              {showIssues ? (
                <Reveal beat={beat} at={1}>
                  <div className="flex min-h-0 flex-1 flex-col gap-1.5">
                    <div className="shrink-0 rounded-2xl bg-risk-soft px-2 py-1.5 ring-1 ring-risk/25">
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="grid size-4 place-items-center rounded-full bg-risk text-white shadow-sm">
                          <WarningCircle weight="fill" className="size-2.5" />
                        </span>
                        <span className="text-[8px] font-extrabold tracking-[0.12em] text-risk uppercase">Must support</span>
                      </div>
                      <ul className="grid grid-cols-1 gap-1">
                        {KEY_ISSUES.map((item, i) => (
                          <Stagger key={item.label} delay={30 + i * 35}>
                            <li className="flex items-center gap-1.5 rounded-xl bg-white/90 px-1.5 py-1 shadow-sm">
                              <span className="grid size-5 shrink-0 place-items-center rounded-full bg-risk text-white">
                                <item.Icon weight="fill" className="size-2.5" />
                              </span>
                              <b className="text-[9px] leading-snug text-risk-ink">{item.label}</b>
                            </li>
                          </Stagger>
                        ))}
                      </ul>
                    </div>
                    <div className="min-h-0 flex-1 opacity-40">
                      <div className="mb-1 px-0.5 text-[7px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
                        Capture ready next
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        {CAPTURES.map((item) => (
                          <div
                            key={item.id}
                            className="flex flex-col items-center gap-0.5 rounded-xl bg-white px-0.5 py-1 ring-1 ring-navy/8"
                          >
                            <span className={cn("grid size-5 place-items-center rounded-full", item.wrap)}>
                              <item.Icon weight="fill" className="size-2.5" />
                            </span>
                            <b className="text-[7px] font-extrabold text-navy">{item.label}</b>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ) : null}

              {/* Capture grid — offline status · demand shows formal notice · else chips */}
              {!showIssues ? (
                <div className="min-h-0 flex-1">
                  {offline ? (
                    <OfflineSavedPanel reduce={!!reduce} />
                  ) : showDemand && !happy ? (
                    <div className="h-full min-h-0 overflow-auto rounded-xl shadow-sm ring-1 ring-[#c9dbe5]">
                      <FormalDemandNotice compact />
                    </div>
                  ) : (
                    <>
                      <div className="mb-1 flex items-center justify-between gap-1 px-0.5">
                        <span className="text-[7px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
                          Capture on this visit
                        </span>
                        {happy ? (
                          <span className="rounded-full bg-ok-soft px-1.5 py-px text-[6px] font-extrabold text-ok uppercase">
                            All reached
                          </span>
                        ) : null}
                      </div>

                      <div className="grid grid-cols-3 gap-1.5">
                        {CAPTURES.map((item, i) => {
                          const isDemand = item.id === "demand";
                          const active = capturing && (item.id !== "demand" || showDemand || happy);
                          const focusDemand = showDemand && isDemand && !happy;
                          const reached =
                            active &&
                            (happy ||
                              (sending && item.id !== "demand") ||
                              (showDemand && item.id === "demand"));
                          return (
                            <Stagger key={item.id} delay={20 + i * 28}>
                              <div
                                className={cn(
                                  "relative flex flex-col items-center gap-0.5 rounded-2xl px-1 py-1.5 ring-1 transition",
                                  focusDemand
                                    ? "bg-ok-soft ring-ok/40 shadow-[0_4px_10px_rgba(14,138,114,0.18)]"
                                    : happy && active
                                      ? "bg-ok-soft ring-ok/30"
                                      : "bg-white ring-navy/8 shadow-sm",
                                )}
                              >
                                <span
                                  className={cn(
                                    "relative grid size-7 place-items-center rounded-full shadow-[0_3px_0_0_rgba(7,20,51,0.18),0_1px_0_rgba(255,255,255,0.45)_inset]",
                                    focusDemand
                                      ? "bg-ok text-white"
                                      : happy && active
                                        ? "bg-ok text-white"
                                        : item.wrap,
                                  )}
                                >
                                  <span
                                    aria-hidden
                                    className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-full bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent)]"
                                  />
                                  {happy && active ? (
                                    <Check weight="bold" className="relative z-[1] size-3" />
                                  ) : (
                                    <item.Icon weight="fill" className="relative z-[1] size-3" />
                                  )}
                                </span>
                                <b
                                  className={cn(
                                    "text-[8px] font-extrabold",
                                    focusDemand ? "text-ok" : "text-navy",
                                  )}
                                >
                                  {item.label}
                                </b>
                                {focusDemand ? (
                                  <span className="text-[7px] font-extrabold text-ok">₹12L</span>
                                ) : null}
                                {reached && !focusDemand ? (
                                  <span className="absolute -top-0.5 -right-0.5 grid size-3.5 place-items-center rounded-full bg-ok text-white shadow-sm ring-1 ring-white">
                                    <Check weight="bold" className="size-2" />
                                  </span>
                                ) : null}
                              </div>
                            </Stagger>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              ) : null}
            </div>

            <div className="shrink-0 border-t border-navy/8 bg-white px-2.5 pt-1.5 pb-2">
              <motion.div
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-2xl px-3 py-2.5 text-[10px] font-extrabold shadow-[0_4px_0_0_rgba(7,20,51,0.18)]",
                  offline
                    ? "bg-gold text-gold-ink"
                    : happy
                      ? "bg-ok text-white"
                      : showDemand
                        ? "bg-navy text-teal-bright"
                        : sending
                          ? "bg-ok text-white"
                          : "bg-[#1a4e8a] text-white",
                )}
                animate={reduce ? undefined : { scale: [1, 1.015, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {beat < 1
                  ? "Start field visit"
                  : showIssues
                    ? "Continue to capture"
                    : offline
                      ? "Save on phone · send later"
                      : happy
                        ? "Sent · all reached"
                        : showDemand
                          ? "Demand draft ready · send"
                          : "Save capture"}
                <PaperPlaneTilt weight="fill" className="size-3.5 opacity-90" />
              </motion.div>

              <div className="mt-1.5 flex items-center justify-around px-1 pb-0.5 text-navy/40">
                <House weight="fill" className="size-3.5 text-teal" />
                <Path weight="bold" className="size-3.5" />
                <span className="relative">
                  <CloudArrowUp weight="bold" className="size-3.5" />
                  {sending && !offline ? (
                    <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-ok ring-1 ring-white" />
                  ) : null}
                </span>
                <User weight="bold" className="size-3.5" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FlowArrow({
  offline,
  happy,
  sending,
  reduce,
}: {
  offline: boolean;
  happy: boolean;
  sending: boolean;
  reduce: boolean;
}) {
  const live = happy || sending;
  return (
    <span className="relative grid place-items-center">
      {!reduce && live ? (
        <>
          <motion.span
            aria-hidden
            className="absolute size-3 rounded-full bg-ok"
            style={{ boxShadow: "0 0 12px 3px rgba(14,138,114,0.55)" }}
            animate={{ x: [-18, 18], opacity: [0, 1, 0], scale: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
          <motion.span
            aria-hidden
            className="absolute size-2 rounded-full bg-teal-bright"
            style={{ boxShadow: "0 0 8px 2px rgba(20,196,212,0.5)" }}
            animate={{ x: [-18, 18], opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear", delay: 0.4 }}
          />
        </>
      ) : null}
      <motion.span
        aria-hidden
        className={cn(
          "relative z-[1] grid size-11 place-items-center rounded-full shadow-[0_10px_24px_rgba(7,20,51,0.22)] ring-2 ring-white",
          offline ? "bg-gold text-gold-ink" : live ? "bg-ok text-white" : "bg-navy text-teal-bright",
        )}
        animate={reduce ? undefined : { x: offline ? [0, -2, 0] : [0, 5, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
      >
        {offline ? (
          <LinkBreak weight="bold" className="size-4" />
        ) : happy ? (
          <ShieldCheck weight="bold" className="size-4" />
        ) : (
          <CloudArrowUp weight="bold" className="size-4" />
        )}
      </motion.span>
    </span>
  );
}

function PlatformHub({
  beat,
  offline,
  happy,
  sending,
  showDemand,
  reduce,
}: {
  beat: number;
  offline: boolean;
  happy: boolean;
  sending: boolean;
  showDemand: boolean;
  reduce: boolean;
}) {
  const status =
    beat < 1
      ? "Waiting for field evidence"
      : beat === 1
        ? "Awaiting capture"
        : offline
          ? "Waiting · held on phone"
          : happy
            ? "All reached"
            : sending
              ? "On Board file"
              : "Linked to this file";

  return (
    <motion.div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-navy/8 bg-white/92 shadow-[0_10px_28px_rgba(7,20,51,0.08)] backdrop-blur-sm ring-2",
        happy ? "ring-ok/35" : "ring-teal/20",
      )}
      animate={reduce ? undefined : { y: [0, -1.5, 0] }}
      transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="relative shrink-0 border-b border-navy/6 px-3.5 pt-3.5 pb-2.5">
        <div className="flex items-start gap-2.5">
          <motion.span
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-2xl shadow-md",
              happy ? "bg-ok text-white" : "bg-navy text-teal-bright",
            )}
            animate={reduce ? undefined : { scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <ShieldCheck weight="duotone" className="size-5" />
          </motion.span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[15px] font-extrabold leading-tight text-navy">Central Platform</div>
            <div className="mt-0.5 font-mono text-[11px] font-bold text-teal">{PROJECT_ID}</div>
            <div
              className={cn(
                "mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-extrabold tracking-[0.1em] uppercase",
                happy ? "bg-ok-soft text-ok" : offline ? "bg-gold-soft text-gold-deep" : "bg-accent text-teal",
              )}
            >
              {status}
            </div>
          </div>
          <KarnatakaMapPin lit={capturingOrSent(beat, offline, happy, sending)} />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-3 py-2.5">
        <div className="mb-1.5 text-[9px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
          Field evidence on this file
        </div>

        {/* Real site photo strip — offline: not yet on Board file (waiting look) */}
        <div className="mb-2 grid grid-cols-4 gap-1">
          {PHOTO_STRIP.map((src, i) => {
            const onFile = beat >= 2 && !offline;
            return (
              <Stagger key={src} delay={20 + i * 35}>
                <div
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-lg ring-1",
                    onFile ? "ring-ok/30 shadow-sm" : "ring-navy/8 opacity-45 grayscale",
                  )}
                >
                  <img src={src} alt="" aria-hidden className="h-full w-full object-cover" />
                  {onFile ? (
                    <span className="absolute top-0.5 right-0.5 grid size-3.5 place-items-center rounded-full bg-ok text-white shadow-sm">
                      <Check weight="bold" className="size-2" />
                    </span>
                  ) : null}
                </div>
              </Stagger>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {CAPTURES.map((item, i) => {
            /* Offline: evidence stays on phone — Central Platform keeps the waiting look. */
            const lit = beat >= 2 && !offline && (item.id !== "demand" || showDemand || happy);
            const allGood =
              lit &&
              (happy || sending) &&
              (item.id !== "demand" || showDemand || happy);
            const placeDone = item.id === "place" && beat >= 2 && !offline;
            return (
              <Stagger key={item.id} delay={40 + i * 30}>
                <span
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-1.5 py-1.5 ring-1",
                    !lit && "bg-mist/40 ring-navy/5 opacity-55",
                    lit && allGood && "bg-ok-soft ring-ok/25",
                    lit && !allGood && "bg-white ring-navy/8",
                    placeDone && !allGood && "bg-ok-soft/60 ring-ok/20",
                  )}
                >
                  <span className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-mist ring-1 ring-navy/8">
                    <img
                      src={item.thumb}
                      alt=""
                      aria-hidden
                      className={cn(
                        "h-full w-full",
                        item.thumbFit === "contain" ? "object-contain p-0.5" : "object-cover",
                        !lit && "grayscale opacity-70",
                      )}
                    />
                    {item.id === "video" ? (
                      <span className="absolute inset-0 grid place-items-center bg-navy/25">
                        <span className="grid size-4 place-items-center rounded-full bg-white/95 text-navy">
                          <VideoCamera weight="fill" className="size-2.5" />
                        </span>
                      </span>
                    ) : null}
                    {(allGood && lit) || placeDone ? (
                      <span className="absolute -top-0.5 -right-0.5 grid size-3.5 place-items-center rounded-full bg-ok text-white shadow-sm ring-1 ring-white">
                        <Check weight="bold" className="size-2" />
                      </span>
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <b className="block truncate text-[11px] text-navy">{item.label}</b>
                    <span className="block truncate text-[9px] font-semibold text-muted-foreground">
                      {!lit
                        ? item.id === "photo"
                          ? "0 / 10"
                          : "—"
                        : allGood || placeDone
                          ? "Reached"
                          : "Waiting"}
                    </span>
                  </span>
                </span>
              </Stagger>
            );
          })}
        </div>

        {showDemand ? (
          <Reveal beat={beat} at={4}>
            <motion.div
              className="relative mt-2 overflow-hidden rounded-2xl bg-linear-to-br from-white via-[#e8f7f5] to-[#d8f0ec] p-2.5 shadow-[0_2px_0_0_rgba(14,138,114,0.22),0_10px_22px_rgba(7,20,51,0.12)] ring-1 ring-ok/25"
              initial={reduce ? false : { opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.35 }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[42%] bg-[linear-gradient(180deg,rgba(255,255,255,0.55),transparent)]"
              />
              <div className="relative z-[1] flex items-center gap-2.5">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-navy/10">
                  <NoticeArt className="h-full w-full scale-110 object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2 py-0.5 text-[8px] font-extrabold tracking-[0.12em] text-teal-bright uppercase">
                      <Receipt weight="fill" className="size-2.5" />
                      On-spot demand
                    </span>
                    <span className="rounded-full bg-ok-soft px-1.5 py-0.5 text-[8px] font-extrabold text-ok uppercase">
                      Drafted on site
                    </span>
                  </div>
                  <div className="mt-1 font-mono text-[11px] font-bold text-navy/70">DN-2025-00412</div>
                  <div className="font-display text-[20px] leading-none font-extrabold tracking-tight text-navy">
                    ₹ 12,00,000
                  </div>
                  <div className="mt-1 truncate text-[9px] font-semibold text-muted-foreground">
                    Same Project ID · ABC Commercial Complex
                  </div>
                </div>
              </div>
            </motion.div>
          </Reveal>
        ) : null}

        <div className="mt-2.5 flex items-center gap-2 rounded-xl bg-mist/70 px-2.5 py-2">
          <CloudArrowUp weight="fill" className={cn("size-4", sending && !offline ? "text-ok" : "text-teal")} />
          <span className="text-[10px] font-bold text-navy">
            {offline ? "Held on phone · send when online" : happy || sending ? "Synced to Central Platform" : "Ready to receive"}
          </span>
        </div>

        <div className="mt-2.5">
          <div className="mb-1.5 text-[9px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
            Recent field visits
          </div>
          <ul className="space-y-1.5">
            {RECENT_VISITS.slice(0, 2).map((visit, i) => (
              <Stagger key={visit.id} delay={80 + i * 40}>
                <li className="flex items-center gap-2 rounded-xl bg-white px-2 py-1.5 ring-1 ring-navy/6">
                  <img
                    src={visit.img}
                    alt=""
                    aria-hidden
                    className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-navy/8"
                  />
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-[10px] text-navy">{visit.site}</b>
                    <span className="block truncate text-[8px] font-semibold text-muted-foreground">
                      {visit.id} · {visit.when}
                    </span>
                  </span>
                  <CheckCircle weight="fill" className="size-4 shrink-0 text-ok" />
                </li>
              </Stagger>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

function capturingOrSent(beat: number, offline: boolean, happy: boolean, sending: boolean) {
  /* Pin lights only when evidence has reached the Central Platform — not while held offline. */
  return beat >= 2 && !offline && (happy || sending);
}

function KarnatakaMapPin({ lit }: { lit: boolean }) {
  return (
    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#e8f0f8] ring-1 ring-navy/10">
      <svg viewBox="0 0 56 56" className="absolute inset-0 h-full w-full" aria-hidden>
        <path
          d="M18 12c4-6 16-6 20 0 6 8 8 16 2 26-4 6-10 10-12 10s-8-4-12-10c-6-10-4-18 2-26z"
          fill="#c5d6e8"
          stroke="#1a4e8a"
          strokeWidth="1.2"
        />
        <path d="M22 18c3-4 10-4 13 0 4 5 5 11 1 17-2 4-6 7-7.5 7S25 39 23 35c-4-6-3-12-1-17z" fill="#a8c4de" />
        <motion.g
          animate={lit ? { y: [0, -1.5, 0] } : undefined}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="28" cy="26" r="4.5" fill={lit ? "#0e8a72" : "#1a4e8a"} />
          <circle cx="28" cy="26" r="2" fill="#fff" />
        </motion.g>
      </svg>
    </div>
  );
}

function StoryFooter({
  showIssues,
  beat,
}: {
  showIssues: boolean;
  beat: number;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-1.5">
      {showIssues ? (
        <Reveal beat={beat} at={1}>
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-risk-soft/80 px-3 py-2 ring-1 ring-risk/15">
            <span className="text-[9px] font-extrabold tracking-[0.12em] text-risk uppercase">Key issues</span>
            {KEY_ISSUES.map((item, i) => (
              <Stagger key={item.label} delay={40 + i * 40}>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-risk-ink shadow-sm">
                  <item.Icon weight="fill" className="size-3 text-risk" />
                  {item.label}
                </span>
              </Stagger>
            ))}
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
