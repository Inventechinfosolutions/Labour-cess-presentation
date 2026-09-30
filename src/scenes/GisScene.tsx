import { useEffect, useState, type MouseEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowRight,
  Bank,
  Buildings,
  CalendarBlank,
  CaretDown,
  CaretRight,
  ClipboardText,
  CloudArrowUp,
  CornersOut,
  Crosshair,
  FileText,
  Globe,
  GpsFix,
  Hourglass,
  IdentificationCard,
  LinkBreak,
  MapPin,
  MapTrifold,
  Minus,
  Phone,
  Plus,
  Receipt,
  ShieldCheck,
  SquaresFour,
  Stack,
  StackSimple,
  TreeStructure,
  User,
  UsersThree,
  Wallet,
  WarningCircle,
  X,
} from "@/lib/icons";
import { CessMap } from "@/components/CessMap";
import { MapPinMarker } from "@/components/MapPinMarker";
import { Reveal, SlideTitle, Stagger } from "@/components/SlideKit";
import { HEX } from "@/lib/palette";
import { PROJECTS } from "@/lib/maps";
import {
  CESS_SITES,
  CESS_VALUES,
  DISTRICT,
  GPS_VISITS,
  INFRA,
  ROADS,
  TERRITORY,
  TERRITORY_RING,
  ULB,
  WARDS,
  xy,
} from "@/lib/gisGeometry";
import { TERRITORY_PATH_SHORT } from "@/lib/territory";
import { cn } from "@/lib/utils";
import abcSite from "@/assets/abc-site.png";
import assessSiteHero from "@/assets/assess-site-hero.jpg";
import buildStage1 from "@/assets/build-stage-1.png";
import hubCenterAbc from "@/assets/hub-center-abc.jpg";
import inspectorPhoto from "@/assets/inspector-r-kumar.jpg";
import problemStageBg from "@/assets/problem-stage-bg.png";

/**
 * Scene 4 — field location → territory → officers → nearby →
 * GPS field assessment + CESS status → territory dashboard → next (exceptions).
 */

const ABC = PROJECTS.find((p) => p.id === "abc");
const COORDS = "12.9616° N, 77.6973° E";
const PROJECT_NAME = "ABC Commercial Complex";
const PROJECT_ID = "CESS-2025-000123";
const ABC_CESS = CESS_SITES.find((s) => s.id === "abc");

/** Fewer pins on the map — one of each main CESS status, clickable. */
const MAP_SITE_IDS = ["abc", "tech", "maple", "orion", "sky", "jaya"] as const;
const MAP_SITES = MAP_SITE_IDS.map((id) => CESS_SITES.find((s) => s.id === id)).filter(
  (s): s is (typeof CESS_SITES)[number] => Boolean(s),
);
const GPS_PTS = GPS_VISITS.map((visit, i) => {
  const [x, y] = xy(visit.lat, visit.lng);
  return { ...visit, x, y, n: i + 1 };
});

const STAGES: { id: string; label: string; Icon: CessIcon; tone: string }[] = [
  { id: "gps", label: "Field location", Icon: GpsFix, tone: "bg-[#1a4e8a] text-white ring-[#5b9bd5]/40" },
  { id: "path", label: "Territory map", Icon: TreeStructure, tone: "bg-teal text-navy-deep ring-teal/35" },
  { id: "officer", label: "Responsible officers", Icon: UsersThree, tone: "bg-gold text-gold-ink ring-gold/45" },
  { id: "nearby", label: "Nearby projects", Icon: Stack, tone: "bg-[#c45c26] text-white ring-[#f0a06a]/40" },
  { id: "status", label: "Field & CESS", Icon: Receipt, tone: "bg-ok text-white ring-ok/40" },
  { id: "dashboard", label: "Dashboard", Icon: SquaresFour, tone: "bg-navy text-teal-bright ring-teal/35" },
];

const PATH_STEPS: {
  id: string;
  label: string;
  value: string;
  note: string;
  Icon: CessIcon;
  wrap: string;
  soft: string;
}[] = [
  { id: "state", label: "State", value: "Karnataka", note: "Territory mapping begins here", Icon: Globe, wrap: "bg-navy text-teal-bright", soft: "bg-mist" },
  { id: "zone", label: "Territory / Zone", value: "East Zone", note: "Board territory level", Icon: MapTrifold, wrap: "bg-teal text-navy-deep", soft: "bg-accent" },
  { id: "district", label: "District", value: "Bengaluru Urban", note: "District monitoring area", Icon: Globe, wrap: "bg-[#1a4e8a] text-white", soft: "bg-[#e8f1fa]" },
  { id: "ulb", label: "Local body", value: "BBMP", note: "Urban local body on the map", Icon: Bank, wrap: "bg-gold text-gold-ink", soft: "bg-gold-soft" },
  { id: "project", label: "Project", value: "ABC Commercial Complex", note: "Same Project ID as the field visit", Icon: GpsFix, wrap: "bg-ok text-white", soft: "bg-ok-soft" },
];

const OFFICERS: {
  id: string;
  name: string;
  designation: string;
  area: string;
  duty: string;
  Icon: CessIcon;
  wrap: string;
  soft: string;
}[] = [
  {
    id: "district-charge",
    name: "District desk",
    designation: "District in-charge",
    area: "Bengaluru Urban",
    duty: "Prepares assessment lists for the district.",
    Icon: IdentificationCard,
    wrap: "bg-[#1a4e8a] text-white",
    soft: "bg-[#e8f1fa] ring-[#5b9bd5]/30",
  },
  {
    id: "inspector",
    name: "R. Kumar",
    designation: "Labour Inspector",
    area: "BBMP · assigned projects",
    duty: "Conducts field visit, estimation, and GPS record.",
    Icon: User,
    wrap: "bg-gold text-gold-ink",
    soft: "bg-gold-soft ring-gold/35",
  },
];

const GPS_FACTS: { label: string; value: string; Icon: CessIcon; accent: string }[] = [
  { label: "Coordinates", value: COORDS, Icon: Crosshair, accent: "#1a4e8a" },
  { label: "Project ID", value: PROJECT_ID, Icon: IdentificationCard, accent: HEX.teal },
  { label: "Source", value: "GPS field visit", Icon: GpsFix, accent: HEX.tealBright },
  { label: "Assessment", value: ABC_CESS?.label ?? "Assessment pending", Icon: ClipboardText, accent: HEX.goldDeep },
];

const KEY_ISSUES: { label: string; Icon: CessIcon }[] = [
  { label: "Location alone is not enough", Icon: GpsFix },
  { label: "Territory coverage is unclear", Icon: LinkBreak },
  { label: "No responsible officer is mapped", Icon: UsersThree },
];

const BEAT_HEAD: readonly {
  kicker: string;
  title: string;
  support: string;
  step: string;
  accent: string;
}[] = [
  {
    kicker: "Government of Karnataka · Labour CESS",
    title: "Field Location",
    support: "The field visit recorded a location. That is only the first step.",
    step: "01 · Location",
    accent: "#1a4e8a",
  },
  {
    kicker: "Territory · MIS & GIS",
    title: "Territory Map",
    support: "The project is placed on the Board territory map.",
    step: "02 · Territory",
    accent: HEX.teal,
  },
  {
    kicker: "Territory · MIS & GIS",
    title: "Responsible Officers",
    support: "Officers are mapped to this territory path.",
    step: "03 · Officers",
    accent: HEX.goldDeep,
  },
  {
    kicker: "Territory · MIS & GIS",
    title: "Nearby Projects",
    support: "Roads and nearby projects appear on the same map.",
    step: "04 · Nearby",
    accent: "#c45c26",
  },
  {
    kicker: "Territory · MIS & GIS",
    title: "Field Evidence and CESS",
    support: "GPS visits and CESS status sit on the same map.",
    step: "05 · Evidence",
    accent: HEX.ok,
  },
  {
    kicker: "Territory · MIS & GIS",
    title: "Territory Dashboard",
    support: "One Board dashboard — many projects, field visits, and CESS status together.",
    step: "06 · Dashboard",
    accent: HEX.navy,
  },
];

type MapMode = "gps" | "hierarchy" | "people" | "context" | "status" | "dashboard";

function mapMode(beat: number): MapMode {
  if (beat <= 0) return "gps";
  if (beat === 1) return "hierarchy";
  if (beat === 2) return "people";
  if (beat === 3) return "context";
  if (beat === 4) return "status";
  return "dashboard";
}

function stageIndex(mode: MapMode): number {
  if (mode === "gps") return 0;
  if (mode === "hierarchy") return 1;
  if (mode === "people") return 2;
  if (mode === "context") return 3;
  if (mode === "status") return 4;
  return 5;
}

const CESS_COUNTS = CESS_VALUES.map((value) => ({
  ...value,
  count: CESS_SITES.filter((site) => site.status === value.id).length,
}));

const DASH_KPIS: {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  Icon: CessIcon;
  card: string;
  iconBg: string;
}[] = [
  {
    label: "Total Projects",
    value: "538",
    delta: "↑ 12%",
    up: true,
    Icon: Buildings,
    card: "bg-linear-to-br from-[#277eff] to-[#5f9dff] text-white",
    iconBg: "bg-[#064ebd]",
  },
  {
    label: "Field Visits (This Month)",
    value: "146",
    delta: "↑ 8%",
    up: true,
    Icon: MapPin,
    card: "bg-linear-to-br from-[#27b98a] to-[#57d9ae] text-white",
    iconBg: "bg-[#07865e]",
  },
  {
    label: "Demand Generated",
    value: "₹ 12.84 Cr",
    delta: "↑ 18%",
    up: true,
    Icon: FileText,
    card: "bg-linear-to-br from-[#ffe39c] to-[#ffd05d] text-[#294267]",
    iconBg: "bg-[#d88b00] text-white",
  },
  {
    label: "Collection Received",
    value: "₹ 9.21 Cr",
    delta: "↑ 24%",
    up: true,
    Icon: Wallet,
    card: "bg-linear-to-br from-[#ffc7ca] to-[#ffb2b8] text-[#294267]",
    iconBg: "bg-[#d92838] text-white",
  },
  {
    label: "Pending Collection",
    value: "₹ 3.63 Cr",
    delta: "↓ 6%",
    up: false,
    Icon: Hourglass,
    card: "bg-linear-to-br from-[#d4c5ff] to-[#c5adff] text-[#294267]",
    iconBg: "bg-[#6335cf] text-white",
  },
  {
    label: "Compliant Projects",
    value: "68%",
    delta: "↑ 5%",
    up: true,
    Icon: ShieldCheck,
    card: "bg-linear-to-br from-[#a7ecee] to-[#7adfe3] text-[#294267]",
    iconBg: "bg-[#008f96] text-white",
  },
];

const ZONE_ROWS: { id: string; label: string; count: number; color: string; active?: boolean }[] = [
  { id: "east", label: "East Zone", count: 538, color: "#3188f6", active: true },
  { id: "blu", label: "Bengaluru Urban", count: 214, color: "#4ba7ff" },
  { id: "blr", label: "Bengaluru Rural", count: 86, color: "#19b985" },
  { id: "kolar", label: "Kolar", count: 64, color: "#f5a313" },
  { id: "chikka", label: "Chikkaballapur", count: 58, color: "#ef8fa5" },
  { id: "rama", label: "Ramanagara", count: 54, color: "#ef4650" },
  { id: "tum", label: "Tumakuru", count: 62, color: "#19b985" },
];

const TREND_MONTHS = [
  { m: "Jan", demand: 28, collected: 19 },
  { m: "Feb", demand: 36, collected: 24 },
  { m: "Mar", demand: 46, collected: 31 },
  { m: "Apr", demand: 52, collected: 37 },
  { m: "May", demand: 67, collected: 50 },
  { m: "Jun", demand: 61, collected: 43 },
  { m: "Jul", demand: 76, collected: 53 },
  { m: "Aug", demand: 91, collected: 67 },
  { m: "Sep", demand: 100, collected: 72 },
];

const PROJECT_STATUS: { label: string; count: number; pct: number; color: string }[] = [
  { label: "Ongoing", count: 312, pct: 58, color: "#1677ff" },
  { label: "Completed", count: 89, pct: 17, color: "#0e9a6e" },
  { label: "On Hold", count: 48, pct: 9, color: "#e89a0c" },
  { label: "Not Started", count: 55, pct: 10, color: "#7b6fd6" },
  { label: "Cancelled", count: 34, pct: 6, color: "#e13c5a" },
];

const FIELD_VISITS: {
  id: string;
  name: string;
  area: string;
  status: string;
  when: string;
  tone: string;
  img: string;
}[] = [
  {
    id: "abc",
    name: "ABC Commercial Complex",
    area: "Bengaluru Urban",
    status: "Completed",
    when: "2h ago",
    tone: "bg-[#ddf7eb] text-[#0b9460]",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "maple",
    name: "Maple Apartments",
    area: "Anekal",
    status: "In Progress",
    when: "5h ago",
    tone: "bg-[#e4f3ff] text-[#1472db]",
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "tech",
    name: "Tech Park Phase 2",
    area: "Hoskote",
    status: "Completed",
    when: "Yesterday",
    tone: "bg-[#ddf7eb] text-[#0b9460]",
    img: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=160&q=80",
  },
  {
    id: "sky",
    name: "Skyline Residency",
    area: "Whitefield",
    status: "Pending Sync",
    when: "Yesterday",
    tone: "bg-[#fff0d3] text-[#d88800]",
    img: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=160&q=80",
  },
];

const PENDING_ACTIONS: {
  id: string;
  title: string;
  detail: string;
  due: string;
  urgent?: boolean;
  Icon: CessIcon;
  wrap: string;
}[] = [
  {
    id: "orion",
    title: "Demand notice to be issued",
    detail: "Orion Mall Expansion · Bengaluru Urban",
    due: "Today ›",
    urgent: true,
    Icon: WarningCircle,
    wrap: "bg-[#edf5ff] text-[#1677ff]",
  },
  {
    id: "maple",
    title: "Follow-up with defaulting project",
    detail: "Maple Apartments · Anekal",
    due: "1 day ›",
    Icon: Phone,
    wrap: "bg-[#e7f9f1] text-[#18a874]",
  },
  {
    id: "tech",
    title: "Field visit report pending",
    detail: "Tech Park Phase 2 · Hoskote",
    due: "2 days ›",
    Icon: MapPin,
    wrap: "bg-[#edf5ff] text-[#1677ff]",
  },
  {
    id: "sky",
    title: "Document verification pending",
    detail: "Skyline Residency · Whitefield",
    due: "3 days ›",
    Icon: CloudArrowUp,
    wrap: "bg-[#fff4d9] text-[#ef9b00]",
  },
];

const LIVE_FEED: { label: string; detail: string }[] = [
  { label: "New project registered", detail: "Skyline Residency · 10:30 AM" },
  { label: "Field visit completed", detail: "ABC Commercial Complex · 11:15 AM" },
  { label: "Demand generated", detail: "₹ 48.5 Lakhs · 12:20 PM" },
  { label: "Payment received", detail: "₹ 32.0 Lakhs · 02:10 PM" },
  { label: "Compliance status updated", detail: "Tech Park Phase 2 · 03:45 PM" },
];

const MAP_LEGEND: { label: string; color: string }[] = [
  { label: "Project (124)", color: "#1885ff" },
  { label: "Field Visit (28)", color: "#17b879" },
  { label: "Non-Compliant (16)", color: "#ef6747" },
  { label: "Pending Demand (12)", color: "#f6a719" },
];

const DASH_FILTERS: { id: string; label: string; Icon: CessIcon }[] = [
  { id: "zone", label: "East Zone", Icon: MapPin },
  { id: "district", label: "Bengaluru Urban", Icon: Buildings },
  { id: "period", label: "Last 30 days", Icon: CalendarBlank },
];

const TERRITORY_PROJECTS = MAP_SITES.map((site, i) => ({
  ...site,
  visits: [3, 1, 2, 4, 2, 1][i] ?? 1,
}));

const SITE_FOCUS: Record<
  string,
  {
    cess: string;
    due: string;
    place: string;
    city: string;
    district: string;
    stage: string;
    stageTone: string;
    img: string;
  }
> = {
  abc: {
    cess: "₹ 12.4 Cr",
    due: "12 Oct 2026",
    place: "Indiranagar",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    stage: "Ongoing",
    stageTone: "bg-[#dff8eb] text-[#0b9360]",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=300&q=80",
  },
  tech: {
    cess: "₹ 8.1 Cr",
    due: "28 Oct 2026",
    place: "Whitefield",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    stage: "Ongoing",
    stageTone: "bg-[#dff8eb] text-[#0b9360]",
    img: buildStage1,
  },
  maple: {
    cess: "₹ 4.6 Cr",
    due: "05 Nov 2026",
    place: "RR Nagar",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    stage: "On Hold",
    stageTone: "bg-[#fff0d3] text-[#d88800]",
    img: assessSiteHero,
  },
  orion: {
    cess: "₹ 2.48 Cr",
    due: "18 Oct 2026",
    place: "Rajajinagar",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    stage: "Ongoing",
    stageTone: "bg-[#dff8eb] text-[#0b9360]",
    img: abcSite,
  },
  sky: {
    cess: "₹ 3.8 Cr",
    due: "Closed",
    place: "Hebbal",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    stage: "Completed",
    stageTone: "bg-[#e4f3ff] text-[#1472db]",
    img: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=300&q=80",
  },
  jaya: {
    cess: "₹ 2.1 Cr",
    due: "On track",
    place: "Jayanagar",
    city: "Bengaluru",
    district: "Bengaluru Urban",
    stage: "Not Started",
    stageTone: "bg-[#eeeaff] text-[#6b5fd4]",
    img: hubCenterAbc,
  },
};


export function GisScene({ beat }: { beat: number; onBeat: (n: number) => void }) {
  const [mapPin, setMapPin] = useState("abc");
  /** Field Location opens the site dossier immediately — no pin click required. */
  const [pinOpen, setPinOpen] = useState(true);
  const reduce = useReducedMotion();
  const head = BEAT_HEAD[Math.min(beat, BEAT_HEAD.length - 1)];
  const mode = mapMode(beat);
  const showIssues = beat === 0;
  const showKey = beat >= 5;
  const stageMeta = STAGES[stageIndex(mode)];

  useEffect(() => {
    if (mode === "gps") {
      setMapPin("abc");
      setPinOpen(true);
      return;
    }
    if (mode === "hierarchy" || mode === "people") {
      setMapPin("abc");
      setPinOpen(false);
      return;
    }
    if (mode === "context") {
      setMapPin("tech");
      setPinOpen(true);
      return;
    }
    if (mode === "status") {
      setMapPin("abc");
      setPinOpen(true);
      return;
    }
    setPinOpen(false);
  }, [mode]);

  const pickPin = (id: string) => {
    if (!id) {
      setPinOpen(false);
      return;
    }
    if (mode === "context" || mode === "status") {
      setMapPin(id);
      setPinOpen(true);
      return;
    }
    if (pinOpen && mapPin === id) {
      setPinOpen(false);
      return;
    }
    setMapPin(id);
    setPinOpen(true);
  };

  const mapShowPopup = pinOpen;

  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr_auto] gap-2" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
      <div className="relative flex min-h-0 h-full flex-col overflow-hidden rounded-2xl shadow-[0_12px_36px_rgba(7,20,51,0.1)] ring-1 ring-navy/8">
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
          <GisBeatHeader head={head} stage={stageMeta} mode={mode} beat={beat} reduce={!!reduce} />

          <div className="relative min-h-0 flex-1 overflow-hidden">
            {mode === "dashboard" ? (
              <TerritoryDashboard reduce={!!reduce} pin={mapPin} onPin={pickPin} showPopup={mapShowPopup} />
            ) : (
              <MapStage
                mode={mode}
                reduce={!!reduce}
                pin={mapPin}
                onPin={pickPin}
                showPopup={mapShowPopup}
              />
            )}
          </div>
        </div>
      </div>

      <StoryFooter showIssues={showIssues} showKey={showKey} beat={beat} />
    </div>
  );
}

function GisBeatHeader({
  head,
  stage,
  mode,
  beat,
  reduce,
}: {
  head: (typeof BEAT_HEAD)[number];
  stage: (typeof STAGES)[number];
  mode: MapMode;
  beat: number;
  reduce: boolean;
}) {
  const storySteps = STAGES.slice(0, 5);
  const active = stageIndex(mode);

  return (
    <div className="flex shrink-0 flex-col gap-1 px-1">
      <motion.div
        key={head.step + beat}
        className="text-center"
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28 }}
      >
        <SlideTitle>{head.title}</SlideTitle>
        <p className="mx-auto mt-1 max-w-[40rem] text-[12px] font-semibold text-muted-foreground">{head.support}</p>
      </motion.div>
      <div className={cn("flex flex-wrap items-end justify-between gap-2", mode === "dashboard" && "items-center")}>
      <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "relative grid shrink-0 place-items-center rounded-2xl shadow-[0_4px_0_0_rgba(7,20,51,0.18),0_1.5px_0_rgba(255,255,255,0.4)_inset] ring-[3px] ring-white",
              mode === "dashboard" ? "size-9" : "size-11",
              stage.tone,
            )}
          >
            <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent)]" />
            <stage.Icon weight="fill" className={cn("relative z-[1]", mode === "dashboard" ? "size-4" : "size-5")} />
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[8px] font-extrabold tracking-[0.12em] text-white uppercase"
              style={{ background: head.accent }}
            >
              {head.step}
            </span>
            <span className="text-[9px] font-extrabold tracking-[0.12em] text-teal uppercase">{head.kicker}</span>
          </div>
      </div>

      {mode !== "dashboard" ? (
        <div className="pointer-events-none flex flex-wrap items-center gap-1 pb-0.5">
          {storySteps.map((row, i) => {
            const on = i === active;
            const done = i < active;
            return (
              <span
                key={row.id}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-extrabold tracking-wide uppercase ring-1",
                  on
                    ? cn(row.tone, "shadow-sm ring-white")
                    : done
                      ? "bg-ok-soft text-ok ring-ok/25"
                      : "bg-white/80 text-muted-foreground ring-navy/8",
                )}
              >
                <row.Icon weight="fill" className="size-2.5" />
                <span className="hidden lg:inline">{row.label}</span>
                <span className="lg:hidden">{String(i + 1).padStart(2, "0")}</span>
              </span>
            );
          })}
        </div>
      ) : null}
      </div>
    </div>
  );
}

function MapStage({
  mode,
  reduce,
  compact = false,
  bare = false,
  pin,
  onPin,
  showPopup = true,
}: {
  mode: MapMode;
  reduce: boolean;
  compact?: boolean;
  /** Map only — no compact chrome (legend / zoom / mini map). */
  bare?: boolean;
  pin: string;
  onPin: (id: string) => void;
  /** When true with a pin — open site facts on the map (no satellite dive). */
  showPopup?: boolean;
}) {
  const layersOn = mode !== "gps";
  const pinMapMode = mode === "gps" || mode === "people" || mode === "status" || mode === "context";
  const selected = MAP_SITES.find((s) => s.id === pin);
  const pinActive = Boolean(showPopup && pin && selected);
  /** Dashboard keeps the selected pin hot so the preview card stays in sync. */
  const pinLit =
    mode === "dashboard"
      ? Boolean(pin && selected)
      : pinMapMode || compact
        ? pinActive
        : Boolean(showPopup);
  /** Story map never dives into satellite / 3D — overlays stay on this screen. */
  const overviewPin = layersOn ? undefined : ABC;
  /** Field dossier stacks through Officers; Nearby keeps the map clear for pin cards. */
  const showFieldDossier =
    Boolean(selected) &&
    ((mode === "gps" && pinActive) || mode === "hierarchy" || mode === "people");
  const showTerritoryUnder =
    Boolean(selected) && (mode === "hierarchy" || mode === "people");
  const showOfficersUnder = mode === "people" && Boolean(selected);
  const dossierSite = selected;
  const showGpsFacts = mode === "gps" && pinActive && selected;
  const showCompactChrome = compact && !bare;

  /** Nearby / Field & CESS — keep the selected pin lit even if the popup toggle was closed. */
  const nearbyPinLit = mode === "context" || mode === "status" ? Boolean(selected) : pinLit;

  return (
    <div
      className={cn(
        "relative h-full min-h-0 overflow-hidden rounded-2xl bg-white/40 shadow-[0_12px_32px_rgba(7,20,51,0.12)] ring-1 ring-white/60 backdrop-blur-[1px]",
        compact && "absolute inset-0 h-auto rounded-none shadow-none ring-0",
      )}
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={`map-${mode}`}
          className={cn(
            "absolute inset-0",
            (mode === "gps" || mode === "hierarchy" || mode === "people" || mode === "context" || mode === "status") &&
              "pointer-events-none",
          )}
          initial={reduce ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <CessMap
            kind={layersOn ? "gis" : "gps"}
            active
            pin={overviewPin}
            satellite={false}
            showPulse={!layersOn || Boolean(overviewPin)}
            className="rounded-none"
          />
        </motion.div>
      </AnimatePresence>

      <div
        className={cn(
          "pointer-events-none absolute inset-0",
          compact
            ? "bg-linear-to-t from-white/15 via-transparent to-white/10"
            : mode === "gps"
              ? "bg-[radial-gradient(ellipse_70%_55%_at_50%_48%,transparent_0%,rgba(247,250,253,0.12)_55%,rgba(232,241,250,0.42)_100%)]"
              : "bg-linear-to-t from-white/35 via-transparent to-white/20",
        )}
      />
      <GisLayerCanvas
        mode={mode}
        pin={pin}
        onPin={onPin}
        hotPin={nearbyPinLit}
      />
      {showFieldDossier && dossierSite ? (
        <LocationFactPlaque
          site={dossierSite}
          reduce={reduce}
          showTerritory={showTerritoryUnder}
          showOfficers={showOfficersUnder}
          onClose={mode === "gps" ? () => onPin("") : undefined}
        />
      ) : null}

      {!reduce && mode !== "gps" && mode !== "hierarchy" && mode !== "people" && mode !== "context" && !compact ? (
        <motion.div
          className="pointer-events-none absolute top-1/2 left-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal/20"
          animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}

      {showCompactChrome ? (
        <div className="pointer-events-none absolute top-2 left-2 z-20 w-[148px]">
          <div
            className="overflow-hidden rounded-xl bg-white/96 backdrop-blur-md ring-1 ring-navy/10"
            style={{
              boxShadow:
                "0 1px 0 rgba(255,255,255,0.95) inset, 0 3px 0 0 rgba(11,31,74,0.07), 0 10px 22px rgba(7,20,51,0.14)",
            }}
          >
            <div className="flex items-center justify-between gap-1.5 border-b border-navy/6 bg-linear-to-b from-[#f7fafd] to-white px-2 py-1.5">
              <div>
                <div className="text-[6.5px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase">Total Projects</div>
                <b className="font-display text-[18px] leading-none text-navy">{CESS_SITES.length}</b>
              </div>
              <span
                className="relative grid size-7 place-items-center rounded-lg text-teal-bright ring-2 ring-white"
                style={{
                  background: "radial-gradient(circle at 32% 26%, #3d5f9a 0%, #12305f 48%, #0b1f4a 100%)",
                  boxShadow: "0 2px 0 0 rgba(7,20,51,0.2), 0 1px 0 rgba(255,255,255,0.4) inset",
                }}
              >
                <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-lg bg-[linear-gradient(180deg,rgba(255,255,255,0.35),transparent)]" />
                <Buildings weight="fill" className="relative z-[1] size-3" />
              </span>
            </div>
            <ul className="space-y-px px-1 py-1">
              {CESS_COUNTS.map((row) => (
                <li key={row.id} className="flex items-center gap-1 rounded-lg px-1 py-0.5">
                  <span
                    className="size-2 shrink-0 rounded-full ring-1 ring-white"
                    style={{
                      background: row.color,
                      boxShadow: `0 1px 0 0 rgba(7,20,51,0.15)`,
                    }}
                  />
                  <span className="min-w-0 flex-1 truncate text-[8px] font-bold text-navy">{row.label}</span>
                  <b className="font-mono text-[9px] text-navy">{row.count}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {showCompactChrome ? (
        <>
          <div className="pointer-events-none absolute top-2 right-2 z-20 flex flex-col gap-1">
            {[
              { Icon: Plus, key: "in" },
              { Icon: Minus, key: "out" },
              { Icon: Crosshair, key: "loc" },
            ].map(({ Icon, key }) => (
              <span
                key={key}
                className="grid size-7 place-items-center rounded-lg bg-white/96 text-navy ring-1 ring-navy/10 backdrop-blur-sm"
                style={{
                  boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 0 0 rgba(11,31,74,0.08), 0 6px 12px rgba(7,20,51,0.12)",
                }}
              >
                <Icon weight="bold" className="size-3" />
              </span>
            ))}
            <span
              className="mt-0.5 inline-flex items-center gap-1 rounded-lg bg-white/96 px-1.5 py-1 text-[7px] font-extrabold text-navy ring-1 ring-navy/10 backdrop-blur-sm"
              style={{
                boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 2px 0 0 rgba(11,31,74,0.08), 0 6px 12px rgba(7,20,51,0.12)",
              }}
            >
              <Stack weight="fill" className="size-2.5 text-[#1a4e8a]" />
              Layers
            </span>
          </div>

          <div
            className="pointer-events-none absolute right-2 bottom-2 z-20 overflow-hidden rounded-xl bg-white/96 ring-1 ring-navy/10 backdrop-blur-sm"
            style={{
              boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 3px 0 0 rgba(11,31,74,0.07), 0 8px 18px rgba(7,20,51,0.14)",
            }}
          >
            <div className="relative h-[52px] w-[76px] bg-linear-to-br from-[#eef3f9] via-[#d7e4f2] to-[#b8c9dc]">
              <svg viewBox="0 0 100 76" className="absolute inset-0 h-full w-full" aria-hidden>
                <path d="M8 62 L20 30 L38 38 L52 16 L72 28 L90 20 L90 68 L8 68 Z" fill="#c5d4e6" stroke="#9eb4cc" strokeWidth="0.9" />
                <path d="M40 58 L52 22 L72 30 L84 50 L66 62 Z" fill="#1a4e8a" opacity="0.9" />
                <path d="M40 58 L52 22 L72 30 L84 50 L66 62 Z" fill="none" stroke="#0b1f4a" strokeWidth="1.1" />
                <circle cx="58" cy="40" r="2.5" fill="#14c4d4" stroke="#fff" strokeWidth="1" />
              </svg>
              <span className="absolute top-0.5 right-0.5 grid size-3 place-items-center rounded bg-white/90 text-navy/50 ring-1 ring-navy/10">
                <CornersOut weight="bold" className="size-2" />
              </span>
              <span className="absolute inset-x-1 bottom-0.5 rounded bg-white/90 px-0.5 py-px text-center text-[6px] font-extrabold tracking-wide text-navy uppercase">
                BBMP East
              </span>
            </div>
          </div>
        </>
      ) : null}

      {mode === "gps" && !showGpsFacts ? (
        <div className="absolute inset-x-0 bottom-3 z-30 flex justify-center px-3">
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: [0, -3, 0] }}
            transition={
              reduce
                ? undefined
                : { opacity: { duration: 0.35 }, y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } }
            }
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPin("abc");
              }}
              className="group inline-flex items-center gap-2.5 rounded-full bg-navy px-4 py-2.5 text-left shadow-[0_12px_32px_rgba(7,20,51,0.28)] ring-1 ring-teal-bright/40 transition hover:bg-navy-deep"
            >
              <span className="relative grid size-9 place-items-center rounded-full bg-teal-bright text-navy shadow-[0_2px_0_0_rgba(7,20,51,0.25)]">
                <MapPin weight="fill" className="size-4" />
                {!reduce ? (
                  <motion.span
                    aria-hidden
                    className="absolute inset-[-4px] rounded-full border border-teal-bright/60"
                    animate={{ scale: [1, 1.35], opacity: [0.55, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                ) : null}
              </span>
              <span className="min-w-0">
                <span className="block text-[8px] font-extrabold tracking-[0.14em] text-teal-bright uppercase">
                  Field visit location
                </span>
                <b className="block text-[12px] text-white">Open the site dossier</b>
              </span>
              <span className="ml-1 grid size-7 place-items-center rounded-full bg-white/10 text-teal-bright ring-1 ring-white/15 transition group-hover:bg-white/15">
                <CaretRight weight="bold" className="size-3.5" />
              </span>
            </button>
          </motion.div>
        </div>
      ) : null}

      {mode === "gps" && !showGpsFacts ? (
        <div className="pointer-events-none absolute top-3 left-3 z-20 max-w-[240px]">
          <div
            className="overflow-hidden rounded-[20px] bg-white/95 shadow-[0_14px_34px_rgba(7,20,51,0.16)] ring-1 ring-navy/10 backdrop-blur-md"
            style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.95) inset, 0 14px 34px rgba(7,20,51,0.16)" }}
          >
            <div className="relative h-[54px] overflow-hidden">
              <img src={abcSite} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-[center_30%]" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,20,51,0.75),rgba(7,20,51,0.25))]" />
              <div className="absolute inset-x-2.5 bottom-2 flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-teal-bright text-navy ring-2 ring-white/80">
                  <GpsFix weight="fill" className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[7.5px] font-extrabold tracking-[0.14em] text-teal-bright uppercase">ABC · GPS</div>
                  <b className="block truncate text-[12px] leading-tight text-white">{PROJECT_NAME}</b>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-2.5 py-2">
              <Crosshair weight="bold" className="size-3.5 shrink-0 text-[#1a4e8a]" />
              <span className="min-w-0 font-mono text-[10px] font-bold text-navy">{COORDS}</span>
            </div>
          </div>
        </div>
      ) : null}

      {mode === "gps" && !showGpsFacts && !reduce ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
          {[
            "left-3 top-3 border-l-2 border-t-2 rounded-tl-md",
            "right-3 top-3 border-r-2 border-t-2 rounded-tr-md",
            "left-3 bottom-3 border-l-2 border-b-2 rounded-bl-md",
            "right-3 bottom-3 border-r-2 border-b-2 rounded-br-md",
          ].map((cls) => (
            <span key={cls} className={cn("absolute size-6 border-teal/35", cls)} />
          ))}
        </div>
      ) : null}

      {mode === "status" && !compact ? (
        <div className="pointer-events-none absolute right-3 bottom-3 z-20 overflow-hidden rounded-xl bg-white/96 px-3 py-2.5 shadow-[0_10px_28px_rgba(7,20,51,0.16)] ring-1 ring-navy/10">
          <div className="text-[8px] font-extrabold tracking-wide text-navy uppercase">Project status</div>
          <ul className="mt-1.5 space-y-1">
            {CESS_COUNTS.map((row) => (
              <li key={row.id} className="flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full" style={{ background: row.color }} />
                <span className="text-[10px] font-bold text-navy">{row.label}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {mode === "hierarchy" && !compact ? (
        <>
          <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
            {[
              "left-3 top-3 border-l-2 border-t-2 rounded-tl-md",
              "right-3 top-3 border-r-2 border-t-2 rounded-tr-md",
              "left-3 bottom-3 border-l-2 border-b-2 rounded-bl-md",
              "right-3 bottom-3 border-r-2 border-b-2 rounded-br-md",
            ].map((cls) => (
              <span key={cls} className={cn("absolute size-7 border-teal/40", cls)} />
            ))}
          </div>

          <div className="pointer-events-none absolute top-3 right-3 z-20">
            <div
              className="relative grid size-[72px] place-items-center overflow-hidden rounded-full bg-white/96 ring-1 ring-navy/10 backdrop-blur-md"
              style={{
                boxShadow:
                  "0 1px 0 rgba(255,255,255,0.95) inset, 0 10px 24px rgba(7,20,51,0.14), 0 0 0 1px rgba(20,196,212,0.2)",
              }}
            >
              <svg viewBox="0 0 72 72" className="absolute inset-0 size-full" aria-hidden>
                <circle cx="36" cy="36" r="33" fill="none" stroke={`${HEX.navy}18`} strokeWidth="1" />
                <circle cx="36" cy="36" r="24" fill={`${HEX.teal}12`} stroke={HEX.teal} strokeWidth="1.2" opacity="0.7" />
                <path d="M36 10 L40 36 L36 32 L32 36 Z" fill={HEX.navy} />
                <path d="M36 62 L32 36 L36 40 L40 36 Z" fill={`${HEX.navy}55`} />
                <path d="M10 36 L36 32 L32 36 L36 40 Z" fill={`${HEX.navy}40`} />
                <path d="M62 36 L36 40 L40 36 L36 32 Z" fill={`${HEX.navy}40`} />
                <circle cx="36" cy="36" r="3.2" fill={HEX.teal} stroke="#fff" strokeWidth="1.2" />
              </svg>
              <span className="relative z-[1] mt-[-34px] text-[8px] font-extrabold tracking-wide text-navy">N</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

/** Field visit dossier — Territory and Officers stack under the same plaque. */
function LocationFactPlaque({
  site,
  reduce,
  onClose,
  showTerritory = false,
  showOfficers = false,
}: {
  site: (typeof CESS_SITES)[number];
  reduce: boolean;
  onClose?: () => void;
  showTerritory?: boolean;
  showOfficers?: boolean;
}) {
  const stacked = showTerritory || showOfficers;
  const deepStack = showOfficers;

  return (
    <AnimatePresence>
      <motion.div
        className="pointer-events-none absolute inset-0 z-30"
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduce ? undefined : { opacity: 0 }}
        transition={{ duration: 0.28 }}
      >
        {/* Soft survey-frame corners — no dark map veil */}
        <div aria-hidden className="absolute inset-4">
          {[
            "left-0 top-0 border-l-2 border-t-2 rounded-tl-lg",
            "right-0 top-0 border-r-2 border-t-2 rounded-tr-lg",
            "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-lg",
            "right-0 bottom-0 border-r-2 border-b-2 rounded-br-lg",
          ].map((cls) => (
            <span
              key={cls}
              className={cn(
                "absolute size-7",
                deepStack ? "border-gold/50" : stacked ? "border-teal/45" : "border-teal/40",
                cls,
              )}
            />
          ))}
        </div>

        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: deepStack
              ? "radial-gradient(ellipse 44% 40% at 22% 22%, rgba(212,168,75,0.14) 0%, transparent 70%)"
              : stacked
                ? "radial-gradient(ellipse 42% 38% at 24% 28%, rgba(20,196,212,0.14) 0%, transparent 68%)"
                : "radial-gradient(ellipse 40% 36% at 26% 40%, rgba(20,196,212,0.08) 0%, transparent 65%)",
          }}
        />

        {!reduce && !stacked ? (
          <motion.div
            aria-hidden
            className="absolute inset-x-0 top-0 h-[18%] bg-[linear-gradient(180deg,rgba(20,196,212,0.1),transparent)]"
            initial={{ y: "-40%", opacity: 0 }}
            animate={{ y: ["-40%", "280%"], opacity: [0, 0.35, 0] }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        ) : null}

        <motion.div
          layout={!reduce}
          className="pointer-events-auto absolute top-3 left-3 z-10 flex max-h-[calc(100%-1.25rem)] w-[min(318px,calc(100%-1.5rem))] flex-col"
          initial={reduce ? false : { opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="relative min-h-0 overflow-hidden rounded-[24px] bg-white/96 ring-1 ring-navy/10 backdrop-blur-md"
            style={{
              boxShadow: deepStack
                ? "0 1px 0 rgba(255,255,255,0.95) inset, 0 16px 40px rgba(7,20,51,0.18), 0 0 0 1px rgba(212,168,75,0.32)"
                : stacked
                  ? "0 1px 0 rgba(255,255,255,0.95) inset, 0 14px 36px rgba(7,20,51,0.16), 0 0 0 1px rgba(20,196,212,0.28)"
                  : "0 1px 0 rgba(255,255,255,0.95) inset, 0 10px 28px rgba(7,20,51,0.12), 0 0 0 1px rgba(26,78,138,0.12)",
            }}
          >
            {/* Spine — navy → teal → gold as the story deepens */}
            <div
              aria-hidden
              className="absolute inset-y-0 left-0 w-[7px]"
              style={{
                background: deepStack
                  ? "linear-gradient(180deg, #0b1f4a 0%, #14c4d4 38%, #d4a84b 100%)"
                  : stacked
                    ? "linear-gradient(180deg, #0b1f4a 0%, #1a4e8a 28%, #14c4d4 72%, #0e9aa7 100%)"
                    : "linear-gradient(180deg, #0b1f4a 0%, #1a4e8a 45%, #14c4d4 100%)",
                boxShadow: "2px 0 0 rgba(255,255,255,0.35)",
              }}
            />

            <div className="max-h-[inherit] overflow-y-auto overscroll-contain">
              {/* Hero site strip — tighter as layers stack */}
              <div
                className={cn(
                  "relative ml-[7px] overflow-hidden",
                  deepStack ? "h-[56px]" : stacked ? "h-[68px]" : "h-[92px]",
                )}
              >
                <img
                  src={abcSite}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 h-full w-full object-cover object-[center_35%]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,20,51,0.15)_0%,rgba(7,20,51,0.72)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(20,196,212,0.35),transparent_45%)]" />

                {onClose ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-white/90 text-navy shadow-sm ring-1 ring-white/80 transition hover:bg-white"
                    aria-label="Close site details"
                  >
                    <X weight="bold" className="size-3" />
                  </button>
                ) : null}

                <div className="absolute inset-x-3 bottom-1.5 flex items-end gap-2">
                  <span
                    className={cn(
                      "relative grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-navy ring-[3px] ring-white/90 shadow-lg",
                      deepStack ? "size-8" : stacked ? "size-9" : "size-11",
                    )}
                  >
                    <GpsFix
                      weight="fill"
                      className={cn("text-teal-bright", deepStack ? "size-3.5" : stacked ? "size-4" : "size-5")}
                    />
                    {!reduce ? (
                      <motion.span
                        aria-hidden
                        className="absolute inset-0 rounded-2xl border border-teal-bright/50"
                        animate={{ opacity: [0.3, 0.9, 0.3] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                      />
                    ) : null}
                  </span>
                  <div className="min-w-0 flex-1 pb-0.5">
                    <div className="text-[7.5px] font-extrabold tracking-[0.16em] text-teal-bright uppercase">
                      Field visit record
                    </div>
                    <b
                      className={cn(
                        "font-display block truncate leading-tight text-white drop-shadow",
                        deepStack ? "text-[12px]" : stacked ? "text-[13px]" : "text-[15px]",
                      )}
                    >
                      {site.fullName}
                    </b>
                    {!deepStack ? (
                      <span
                        className="mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-extrabold text-white"
                        style={{ background: `${site.color}ee` }}
                      >
                        <span className="size-1.5 rounded-full bg-white" />
                        {site.label}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Compass + locked seal */}
              <div
                className={cn(
                  "ml-[7px] flex items-center gap-2 border-b border-navy/6 bg-[linear-gradient(90deg,#e8f1fa_0%,#fff_55%)] px-3",
                  deepStack ? "py-1" : stacked ? "py-1.5" : "py-2",
                )}
              >
                <span
                  className={cn(
                    "relative grid shrink-0 place-items-center rounded-full bg-navy text-teal-bright ring-2 ring-white",
                    deepStack
                      ? "size-8 shadow-[0_2px_0_0_rgba(7,20,51,0.16)]"
                      : stacked
                        ? "size-9 shadow-[0_2px_0_0_rgba(7,20,51,0.18)]"
                        : "size-12 shadow-[0_4px_0_0_rgba(7,20,51,0.2)]",
                  )}
                >
                  <Crosshair weight="bold" className={deepStack ? "size-3.5" : stacked ? "size-4" : "size-5"} />
                  {!reduce ? (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-[-3px] rounded-full border border-dashed border-teal-bright/50"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    />
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[8px] font-extrabold tracking-[0.12em] text-[#1a4e8a] uppercase">
                    Locked coordinates
                  </div>
                  <b
                    className={cn(
                      "block font-mono leading-tight text-navy",
                      deepStack ? "text-[11px]" : stacked ? "text-[12px]" : "text-[13px]",
                    )}
                  >
                    {COORDS}
                  </b>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-ok px-2 py-1 text-[8px] font-extrabold tracking-wide text-white uppercase shadow-sm">
                  <ShieldCheck weight="fill" className="size-3" />
                  Locked
                </span>
              </div>

              {/* Full fact stamps only on Field Location beat */}
              {!stacked ? (
                <div className="ml-[7px] flex items-stretch justify-between gap-1 px-2.5 py-3">
                  {GPS_FACTS.filter((row) => row.label !== "Coordinates").map((row, i) => (
                    <motion.div
                      key={row.label}
                      className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center"
                      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.92 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 22,
                        delay: reduce ? 0 : 0.12 + i * 0.08,
                      }}
                    >
                      <span
                        className="relative grid size-10 place-items-center rounded-full text-white ring-[3px] ring-white"
                        style={{
                          background: row.accent,
                          boxShadow: `0 3px 0 0 rgba(7,20,51,0.14), 0 10px 18px ${row.accent}38`,
                        }}
                      >
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-x-0 top-0 h-[48%] rounded-t-full bg-[linear-gradient(180deg,rgba(255,255,255,0.38),transparent)]"
                        />
                        <row.Icon weight="fill" className="relative z-[1] size-4" />
                      </span>
                      <span className="text-[7px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
                        {row.label}
                      </span>
                      <b className="max-w-full px-0.5 text-[10px] leading-snug text-navy">
                        {row.label === "Project ID" ? (
                          <span className="font-mono text-[9px] font-extrabold tracking-tight">{row.value}</span>
                        ) : (
                          row.value
                        )}
                      </b>
                    </motion.div>
                  ))}
                </div>
              ) : null}

              <div className="ml-[7px] flex items-center justify-between gap-2 border-t border-dashed border-navy/10 bg-mist/60 px-3 py-1.5">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-navy/70">
                  <MapPin weight="fill" className="size-3 text-[#1a4e8a]" />
                  ABC · GPS field visit
                </span>
                <span className="font-mono text-[9px] font-extrabold text-teal">{PROJECT_ID}</span>
              </div>

              {/* Territory path — under field card */}
              <AnimatePresence initial={false}>
                {showTerritory ? (
                  <motion.div
                    key="territory-under"
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduce ? undefined : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <TerritoryPathUnder reduce={reduce} compact={deepStack} />
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Officers — under territory on Next */}
              <AnimatePresence initial={false}>
                {showOfficers ? (
                  <motion.div
                    key="officers-under"
                    initial={reduce ? false : { opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={reduce ? undefined : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay: reduce ? 0 : 0.08 }}
                    className="overflow-hidden"
                  >
                    <OfficersUnder reduce={reduce} compact={false} />
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/** Territory path block — sits under the field visit record on the same plaque. */
function TerritoryPathUnder({ reduce, compact = false }: { reduce: boolean; compact?: boolean }) {
  return (
    <div className="ml-[7px] border-t border-navy/8">
      <div
        className={cn(
          "flex items-center justify-between gap-2 bg-[linear-gradient(180deg,#f0fafb,#ffffff)] px-3",
          compact ? "py-1.5" : "py-2",
        )}
      >
        <div className="min-w-0">
          <div className="text-[8px] font-extrabold tracking-[0.16em] text-teal uppercase">Board territory atlas</div>
          <b className={cn("font-display block leading-tight text-navy", compact ? "text-[12px]" : "text-[13px]")}>
            Territory map
          </b>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-navy px-2 py-1 text-[7.5px] font-extrabold tracking-wide text-teal-bright uppercase shadow-[0_2px_0_0_rgba(7,20,51,0.22)] ring-1 ring-white/20">
          <MapTrifold weight="fill" className="size-3" />
          Placed
        </span>
      </div>

      <div className={cn("px-3", compact ? "pt-1 pb-1.5" : "pt-1.5 pb-2")}>
        <div className={cn("flex items-center justify-between gap-2", compact ? "mb-1" : "mb-1.5")}>
          <span className="text-[8px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
            Path to the project
          </span>
          <span className="rounded-full bg-ok/15 px-2 py-0.5 text-[7.5px] font-extrabold tracking-wide text-ok uppercase">
            5 levels
          </span>
        </div>

        <div className="relative pl-0.5">
          <div
            aria-hidden
            className="absolute top-3 bottom-3 left-[13px] w-[2px] rounded-full"
            style={{
              background: `linear-gradient(180deg, ${HEX.navy}, ${HEX.teal}, ${HEX.goldDeep}, ${HEX.ok})`,
              opacity: 0.45,
            }}
          />
          <ul className={cn("relative", compact ? "space-y-0.5" : "space-y-1")}>
            {PATH_STEPS.map((node, i) => (
              <motion.li
                key={node.id}
                className="flex items-center gap-2"
                initial={reduce ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 + i * 0.05 }}
              >
                <span
                  className={cn(
                    "relative z-[1] grid shrink-0 place-items-center rounded-full shadow-[0_2px_0_0_rgba(7,20,51,0.14)] ring-[2.5px] ring-white",
                    compact ? "size-6" : "size-7",
                    node.wrap,
                  )}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-full bg-[linear-gradient(180deg,rgba(255,255,255,0.4),transparent)]"
                  />
                  <node.Icon weight="fill" className={cn("relative z-[1]", compact ? "size-2.5" : "size-3")} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[7px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase">
                    {node.label}
                  </span>
                  <b className={cn("block truncate leading-tight text-navy", compact ? "text-[10px]" : "text-[11px]")}>
                    {node.value}
                  </b>
                </span>
                {i === PATH_STEPS.length - 1 ? (
                  <span className="shrink-0 rounded-full bg-ok px-1.5 py-0.5 text-[7px] font-extrabold text-white uppercase shadow-sm">
                    Site
                  </span>
                ) : null}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {!compact ? (
        <div className="border-t border-dashed border-navy/10 bg-[linear-gradient(90deg,#e8f7f9,#f7fafd)] px-3 py-1.5 text-center">
          <p className="font-mono text-[9.5px] font-extrabold tracking-wide text-teal">{TERRITORY_PATH_SHORT}</p>
        </div>
      ) : null}
    </div>
  );
}

/** Officers block — stacks under territory on the same plaque. */
function OfficersUnder({ reduce, compact = false }: { reduce: boolean; compact?: boolean }) {
  return (
    <div className="ml-[7px] border-t border-navy/8">
      <div
        className={cn(
          "flex items-center justify-between gap-2 bg-[linear-gradient(180deg,#fff8e8,#ffffff)] px-3",
          compact ? "py-1" : "py-1.5",
        )}
      >
        <div className="min-w-0">
          <div className="text-[8px] font-extrabold tracking-[0.16em] text-gold-ink uppercase">On this territory</div>
          <b className={cn("font-display block leading-tight text-navy", compact ? "text-[11px]" : "text-[12px]")}>
            Responsible officers
          </b>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-gold px-2 py-1 text-[7.5px] font-extrabold tracking-wide text-gold-ink uppercase shadow-[0_2px_0_0_rgba(120,80,10,0.2)] ring-1 ring-white/40">
          <UsersThree weight="fill" className="size-3" />
          Mapped
        </span>
      </div>

      <ul className={cn("px-2.5", compact ? "space-y-1 py-1.5" : "space-y-1 py-2")}>
        {OFFICERS.map((row, i) => (
          <motion.li
            key={row.id}
            className={cn(
              "flex items-center gap-2 rounded-xl bg-white ring-1 ring-navy/8",
              compact ? "px-1.5 py-1" : "gap-2.5 px-2 py-1.5",
            )}
            style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 12px rgba(7,20,51,0.06)" }}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 + i * 0.08 }}
          >
            {row.id === "inspector" ? (
              <img
                src={inspectorPhoto}
                alt=""
                aria-hidden
                className={cn("shrink-0 rounded-full object-cover ring-2 ring-white shadow-sm", compact ? "size-8" : "size-9")}
              />
            ) : (
              <span
                className={cn(
                  "relative grid shrink-0 place-items-center rounded-full shadow-[0_2px_0_0_rgba(7,20,51,0.14)] ring-2 ring-white",
                  compact ? "size-8" : "size-9",
                  row.wrap,
                )}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-[45%] rounded-t-full bg-[linear-gradient(180deg,rgba(255,255,255,0.4),transparent)]"
                />
                <row.Icon weight="fill" className={cn("relative z-[1]", compact ? "size-3" : "size-3.5")} />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <b className={cn("block truncate leading-tight text-navy", compact ? "text-[11px]" : "text-[12px]")}>
                {row.name}
              </b>
              <span className="block truncate text-[9px] font-bold text-navy/75">{row.designation}</span>
              {!compact ? (
                <span className="mt-0.5 block truncate text-[9px] font-semibold text-teal">{row.area}</span>
              ) : null}
            </span>
          </motion.li>
        ))}
      </ul>

      {!compact ? (
        <div className="border-t border-dashed border-navy/10 bg-[linear-gradient(90deg,#fff6e5,#f7fafd)] px-3 py-1.5 text-center">
          <p className="text-[9px] font-bold text-muted-foreground">Officers linked to this territory path</p>
        </div>
      ) : null}
    </div>
  );
}

function TerritoryDashboard({
  reduce,
  pin,
  onPin,
  showPopup = false,
}: {
  reduce: boolean;
  pin: string;
  onPin: (id: string) => void;
  showPopup?: boolean;
}) {
  const projectTotal = 538;
  const selectedSite = MAP_SITES.find((s) => s.id === pin) ?? MAP_SITES[0] ?? ABC_CESS!;
  const selectedFocus = SITE_FOCUS[selectedSite.id] ?? SITE_FOCUS.abc;
  const donutSize = 92;
  const donutStroke = 11;
  const donutR = (donutSize - donutStroke) / 2;
  const donutC = 2 * Math.PI * donutR;
  const donutGap = donutC * 0.012;
  let donutCursor = 0;
  const donutArcs = PROJECT_STATUS.map((row) => {
    const sweep = (row.pct / 100) * donutC;
    const length = Math.max(sweep - donutGap, 1);
    const arc = {
      ...row,
      dash: `${length} ${donutC - length}`,
      offset: -donutCursor,
    };
    donutCursor += sweep;
    return arc;
  });

  return (
    <motion.div
      className="flex h-full min-h-0 flex-col gap-1.5 overflow-hidden"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Filters + live */}
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
        {DASH_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-[13px] bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#18345f] shadow-[0_5px_18px_rgba(189,209,233,0.12)] ring-1 ring-[#d6e5f6]"
          >
            <f.Icon weight="fill" className="size-3 text-[#1677ff]" />
            {f.label}
            <CaretDown weight="bold" className="size-2.5 opacity-60" />
          </button>
        ))}
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-[13px] bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#087a52] shadow-[0_5px_18px_rgba(189,209,233,0.12)] ring-1 ring-[#d6e5f6]"
        >
          <motion.span
            className="size-2 rounded-full bg-[#14b879] shadow-[0_0_0_4px_rgba(20,184,121,0.12)]"
            animate={reduce ? undefined : { opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
          Live Data
          <ArrowRight weight="bold" className="size-2.5" />
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid shrink-0 grid-cols-6 gap-1.5">
        {DASH_KPIS.map((kpi, i) => (
          <Stagger key={kpi.label} delay={12 + i * 24}>
            <div
              className={cn(
                "relative overflow-hidden rounded-[14px] px-2.5 py-2 shadow-[0_8px_20px_rgba(36,73,125,0.12)]",
                kpi.card,
              )}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute right-[-8px] bottom-[-12px] h-12 w-16 opacity-40"
                style={{
                  background: "repeating-linear-gradient(to right, transparent 0 6px, rgba(255,255,255,0.35) 6px 10px)",
                  clipPath:
                    "polygon(0 100%,0 70%,12% 82%,12% 55%,25% 76%,25% 40%,38% 68%,38% 50%,50% 64%,50% 26%,63% 56%,63% 18%,76% 47%,76% 8%,89% 38%,89% 0,100% 30%,100% 100%)",
                }}
              />
              <span className={cn("relative mb-1 grid size-7 place-items-center rounded-[10px]", kpi.iconBg)}>
                <kpi.Icon weight="fill" className="size-3.5 text-white" />
              </span>
              <small className="relative block text-[8px] font-bold leading-tight opacity-90">{kpi.label}</small>
              <div className="relative mt-0.5 flex items-baseline gap-1">
                <b className="font-display text-[15px] leading-none tracking-tight">{kpi.value}</b>
                <span className={cn("text-[8px] font-extrabold", kpi.up ? "opacity-90" : "opacity-80")}>{kpi.delta}</span>
              </div>
            </div>
          </Stagger>
        ))}
      </div>

      {/* Main: zones · map · trend */}
      <div className="grid min-h-0 flex-1 grid-cols-[0.85fr_1.55fr_0.95fr] gap-1.5 overflow-hidden">
        <article className="flex min-h-0 flex-col overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="flex shrink-0 items-center justify-between px-2.5 pt-2 pb-1">
            <h3 className="text-[12px] font-extrabold text-[#10275b]">Zone Overview</h3>
            <span className="text-[9px] font-extrabold text-[#1470e8]">View All →</span>
          </div>
          <ul className="min-h-0 flex-1 space-y-0.5 overflow-auto px-1.5 pb-2">
            {ZONE_ROWS.map((row, i) => (
              <Stagger key={row.id} delay={20 + i * 18}>
                <li
                  className={cn(
                    "flex items-center justify-between rounded-[10px] px-2 py-1.5 text-[10px]",
                    row.active
                      ? "border-l-[3px] border-[#2380ff] bg-[#e9f3ff] font-extrabold text-[#0f58bf]"
                      : "font-semibold text-[#425a7f]",
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: row.color }} />
                    {row.label}
                  </span>
                  <b>{row.count} ›</b>
                </li>
              </Stagger>
            ))}
          </ul>
        </article>

        <article className="relative min-h-0 overflow-hidden rounded-[14px] bg-[#b9d8bd] shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <MapStage mode="dashboard" reduce={reduce} compact bare pin={pin} onPin={onPin} showPopup={showPopup} />
          <div className="pointer-events-none absolute top-2 left-2 z-20 rounded-[10px] bg-white/94 px-2.5 py-1.5 shadow-[0_6px_18px_rgba(40,78,109,0.14)]">
            {MAP_LEGEND.map((row) => (
              <div key={row.label} className="flex items-center gap-1.5 py-0.5 text-[8px] font-bold text-[#294267]">
                <span className="size-2 rounded-full" style={{ background: row.color }} />
                {row.label}
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute top-2 right-2 z-20 grid gap-1">
            {[Plus, Minus, StackSimple].map((Icon, i) => (
              <span
                key={i}
                className="grid size-7 place-items-center rounded-[10px] bg-white/92 text-[#18345f] shadow-sm ring-1 ring-[#d6e5f6]"
              >
                <Icon weight="bold" className="size-3" />
              </span>
            ))}
          </div>
          <div className="pointer-events-none absolute right-2 bottom-2 z-20 w-[210px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedSite.id}
                initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-2 rounded-[12px] bg-white p-1.5 shadow-[0_8px_22px_rgba(41,77,107,0.2)] ring-1 ring-[#d6e5f6]/80"
              >
                <img
                  src={selectedFocus.img}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1 py-0.5">
                  <b className="block truncate text-[10px] leading-tight text-[#10275b]">{selectedSite.fullName}</b>
                  <small className="mt-0.5 block truncate text-[8px] text-[#7384a1]">
                    {selectedFocus.district}
                  </small>
                  <span
                    className={cn(
                      "mt-1 inline-block rounded-full px-1.5 py-0.5 text-[8px] font-extrabold",
                      selectedFocus.stageTone,
                    )}
                  >
                    {selectedFocus.stage}
                  </span>
                  <strong className="mt-1 block text-[11px] leading-none text-[#10275b]">{selectedFocus.cess}</strong>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </article>

        <article className="flex min-h-0 flex-col overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="flex shrink-0 items-center justify-between px-2.5 pt-2 pb-1">
            <h3 className="text-[12px] font-extrabold text-[#10275b]">CESS Collection Trend</h3>
            <span className="inline-flex items-center gap-1 rounded-[10px] bg-white px-2 py-1 text-[8px] font-bold text-[#18345f] ring-1 ring-[#d6e5f6]">
              This Year
              <CaretDown weight="bold" className="size-2.5 opacity-60" />
            </span>
          </div>
          <div className="grid shrink-0 grid-cols-3 gap-1 px-2 pb-1.5">
            {[
              { v: "₹ 42.18 Cr", l: "Total Demand", bg: "bg-[#edf6ff]", ink: "text-[#1470e8]" },
              { v: "₹ 31.06 Cr", l: "Collected", bg: "bg-[#ebfaf4]", ink: "text-[#079764]" },
              { v: "₹ 11.12 Cr", l: "Pending", bg: "bg-[#fff0f1]", ink: "text-[#df3c4b]" },
            ].map((s) => (
              <div key={s.l} className={cn("rounded-[9px] px-1.5 py-1.5", s.bg)}>
                <b className={cn("block text-[11px] leading-none", s.ink)}>{s.v}</b>
                <small className="text-[7px] font-semibold text-[#71809d]">{s.l}</small>
              </div>
            ))}
          </div>
          <div className="flex min-h-0 flex-1 items-end gap-1 border-t border-[#e8eff7] px-2.5 pt-1.5 pb-4">
            {TREND_MONTHS.map((row, i) => (
              <div key={row.m} className="relative flex h-full min-h-[72px] flex-1 items-end justify-center gap-0.5">
                <motion.i
                  className="w-[45%] rounded-t-[4px] bg-[#62b6ff]"
                  initial={reduce ? false : { height: 0 }}
                  animate={{ height: `${row.demand}%` }}
                  transition={{ duration: 0.45, delay: 0.04 * i }}
                />
                <motion.i
                  className="w-[45%] rounded-t-[4px] bg-[#135da8]"
                  initial={reduce ? false : { height: 0 }}
                  animate={{ height: `${row.collected}%` }}
                  transition={{ duration: 0.45, delay: 0.04 * i + 0.05 }}
                />
                <label className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[7px] font-bold text-[#7889a4]">
                  {row.m}
                </label>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* Bottom: status · visits · actions */}
      <div className="grid shrink-0 grid-cols-[0.95fr_1.15fr_1.1fr] gap-1.5">
        <article className="overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <h3 className="text-[12px] font-extrabold text-[#10275b]">Project Status</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f3f7fc] px-2 py-0.5 text-[8px] font-bold text-[#4a6288] ring-1 ring-[#d9e6f5]">
              This Zone
              <CaretDown weight="bold" className="size-2.5 opacity-55" />
            </span>
          </div>
          <div className="flex items-center gap-3 px-2.5 pb-2.5 pt-0.5">
            <div className="relative grid size-[92px] shrink-0 place-items-center">
              <span
                aria-hidden
                className="absolute inset-[-2px] rounded-full bg-[radial-gradient(circle_at_50%_45%,rgba(22,119,255,0.1),transparent_62%)]"
              />
              <motion.svg
                width={donutSize}
                height={donutSize}
                viewBox={`0 0 ${donutSize} ${donutSize}`}
                className="relative -rotate-90"
                initial={reduce ? false : { opacity: 0.4, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <circle
                  cx={donutSize / 2}
                  cy={donutSize / 2}
                  r={donutR}
                  fill="none"
                  stroke="#e8eef6"
                  strokeWidth={donutStroke}
                />
                {donutArcs.map((arc, i) => (
                  <motion.circle
                    key={arc.label}
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={donutR}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={donutStroke}
                    strokeLinecap="butt"
                    strokeDasharray={arc.dash}
                    strokeDashoffset={arc.offset}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.35, delay: 0.05 * i }}
                  />
                ))}
              </motion.svg>
              <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                <div>
                  <b className="block text-[16px] leading-none tracking-tight text-[#10275b]">{projectTotal}</b>
                  <span className="mt-0.5 block text-[6.5px] font-extrabold tracking-[0.1em] text-[#7a8bab] uppercase">
                    Projects
                  </span>
                </div>
              </div>
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5">
              {PROJECT_STATUS.map((row) => (
                <li key={row.label} className="min-w-0">
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <span
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: row.color }}
                    />
                    <span className="min-w-0 flex-1 truncate text-[8px] font-semibold text-[#40587e]">
                      {row.label}
                    </span>
                    <span className="flex shrink-0 items-baseline gap-1 tabular-nums">
                      <b className="text-[9px] font-extrabold text-[#10275b]">{row.count}</b>
                      <small className="text-[7px] font-bold text-[#8a9bb5]">{row.pct}%</small>
                    </span>
                  </div>
                  <div className="h-[3px] overflow-hidden rounded-full bg-[#eef3f9]">
                    <motion.i
                      className="block h-full rounded-full"
                      style={{ background: row.color }}
                      initial={reduce ? false : { width: 0 }}
                      animate={{ width: `${row.pct}%` }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <h3 className="text-[12px] font-extrabold text-[#10275b]">Recent Field Visits</h3>
            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-[#1470e8]">
              View All
              <ArrowRight weight="bold" className="size-2.5" />
            </span>
          </div>
          <ul className="px-1.5 pb-1.5">
            {FIELD_VISITS.map((row, i) => (
              <Stagger key={row.id} delay={20 + i * 20}>
                <li>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPin(row.id);
                    }}
                    className={cn(
                      "group grid w-full grid-cols-[40px_1fr_auto] items-center gap-2 rounded-[10px] px-1.5 py-1.5 text-left transition-colors",
                      pin === row.id ? "bg-[#edf6ff]" : "hover:bg-[#f5f9fd]",
                    )}
                  >
                    <img
                      src={row.img}
                      alt=""
                      className="h-8 w-10 rounded-[8px] object-cover bg-[#dfeaf5] ring-1 ring-[#d8e5f3]"
                    />
                    <span className="min-w-0">
                      <b className="block truncate text-[9px] leading-tight text-[#10275b]">{row.name}</b>
                      <small className="mt-0.5 flex min-w-0 items-center gap-1 text-[7.5px] text-[#7a8bab]">
                        <MapPin weight="fill" className="size-2 shrink-0 opacity-70" />
                        <span className="truncate">
                          {row.area} · {row.when}
                        </span>
                      </small>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      <span className={cn("rounded-full px-1.5 py-0.5 text-[7px] font-extrabold", row.tone)}>
                        {row.status}
                      </span>
                      <CaretRight
                        weight="bold"
                        className="size-2.5 text-[#9aabc4] transition-transform group-hover:translate-x-0.5 group-hover:text-[#1470e8]"
                      />
                    </span>
                  </button>
                </li>
              </Stagger>
            ))}
          </ul>
        </article>

        <article className="overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1">
            <h3 className="text-[12px] font-extrabold text-[#10275b]">Pending Actions</h3>
            <span className="rounded-full bg-[#e53d50] px-1.5 py-0.5 text-[8px] font-extrabold text-white">
              {PENDING_ACTIONS.length}
            </span>
          </div>
          <ul className="px-2 pb-1.5">
            {PENDING_ACTIONS.map((row, i) => (
              <Stagger key={row.id + row.title} delay={24 + i * 20}>
                <li>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPin(row.id);
                    }}
                    className="grid w-full grid-cols-[26px_1fr_auto] items-center gap-1.5 border-b border-[#edf2f8] py-1.5 text-left last:border-0"
                  >
                    <span className={cn("grid size-[26px] place-items-center rounded-[8px]", row.wrap)}>
                      <row.Icon weight="fill" className="size-3" />
                    </span>
                    <span className="min-w-0">
                      <b className="block truncate text-[9px] text-[#10275b]">{row.title}</b>
                      <small className="block truncate text-[7px] text-[#71809d]">{row.detail}</small>
                    </span>
                    <span
                      className={cn(
                        "text-[8px] font-extrabold",
                        row.urgent ? "text-[#e13c4d]" : "text-[#6c7e9c]",
                      )}
                    >
                      {row.due}
                    </span>
                  </button>
                </li>
              </Stagger>
            ))}
          </ul>
        </article>
      </div>

      {/* Live activity */}
      <div className="flex shrink-0 items-stretch overflow-hidden rounded-[14px] bg-white shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
        <div className="flex shrink-0 items-center gap-1.5 px-3 py-2 text-[10px] font-extrabold text-[#10275b]">
          <span className="size-2 rounded-full bg-[#14b879]" />
          Live Activity Feed
        </div>
        <div className="flex min-w-0 flex-1 items-stretch overflow-hidden">
          {LIVE_FEED.map((row) => (
            <div
              key={row.label}
              className="relative min-w-0 flex-1 border-l border-[#edf2f7] px-2.5 py-1.5"
            >
              <span className="absolute top-3 -left-[3.5px] size-1.5 rounded-full bg-[#14b879]" />
              <b className="block truncate text-[8px] text-[#10275b]">{row.label}</b>
              <small className="block truncate text-[7px] text-[#7384a1]">{row.detail}</small>
            </div>
          ))}
          <div className="flex shrink-0 items-center px-2.5 text-[9px] font-extrabold text-[#1470e8]">
            View All →
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StoryFooter({
  showIssues,
  showKey,
  beat,
}: {
  showIssues: boolean;
  showKey: boolean;
  beat: number;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-1.5">
      {showIssues ? (
        <Reveal beat={beat} at={0}>
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

      {showKey ? (
        <Reveal beat={beat} at={5}>
          <div className="rounded-xl bg-ok-soft/80 px-3 py-1.5 shadow-sm ring-1 ring-ok/25">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[8px] font-extrabold tracking-[0.12em] text-ok uppercase">Key message</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-navy shadow-sm">
                <GpsFix weight="fill" className="size-3.5 text-teal" />
                GPS shows the place
              </span>
              <span className="text-[11px] font-extrabold text-ok/40">→</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-2.5 py-1 text-[11px] font-bold text-teal-bright">
                <MapTrifold weight="fill" className="size-3.5" />
                Territory shows path and officer
              </span>
              <span className="text-[11px] font-extrabold text-ok/40">→</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ok px-2.5 py-1 text-[11px] font-bold text-white">
                <SquaresFour weight="fill" className="size-3.5" />
                Territory dashboard watches all projects
              </span>
            </div>
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}

/** Dashboard / Nearby pin chips — side + short name so they clear the pin tip. */
const PIN_CHIP: Record<string, { side: "left" | "right"; title: string }> = {
  abc: { side: "left", title: "ABC" },
  tech: { side: "right", title: "Tech Park" },
  maple: { side: "right", title: "Maple" },
  orion: { side: "left", title: "Orion" },
  sky: { side: "right", title: "Skyline" },
  jaya: { side: "left", title: "Jayanagar" },
};

/** Short status on map chips — keeps cards compact. */
const CHIP_STATUS: Record<string, string> = {
  registered: "Registered",
  assessment: "Assessment",
  demand: "Demand pending",
  payment: "Payment due",
  compliant: "Compliant",
};

/** Soft badge tones for Field & CESS callout cards. */
const STATUS_BADGE: Record<string, { bg: string; ink: string }> = {
  registered: { bg: "#e5f7f8", ink: "#0a7c86" },
  assessment: { bg: "#f7f0e4", ink: "#9a6b14" },
  demand: { bg: "#fdeceb", ink: "#c4453c" },
  payment: { bg: "#fff8e0", ink: "#b8872b" },
  compliant: { bg: "#e5f5f1", ink: "#0e8a72" },
};

/** Field & CESS — pin placement so full ABC-style cards clear each other. */
const STATUS_PIN_XY: Record<string, { x: number; y: number }> = {
  sky: { x: 400, y: 220 },
  orion: { x: 255, y: 330 },
  abc: { x: 440, y: 395 },
  tech: { x: 605, y: 440 },
  jaya: { x: 470, y: 565 },
  maple: { x: 235, y: 525 },
};

/** Side + offset for every project card (same ABC plaque size). */
const STATUS_PIN_CHIP: Record<string, { side: "left" | "right"; dy: number; below?: boolean }> = {
  abc: { side: "left", dy: -28 },
  tech: { side: "right", dy: -28 },
  maple: { side: "left", dy: -28 },
  orion: { side: "left", dy: -28 },
  sky: { side: "right", dy: 12, below: true },
  jaya: { side: "left", dy: -28 },
};

/** Presenter layout — pins sit inside East Zone so the short map panel reads clearly. */
const DASHBOARD_PIN_XY: Record<string, { x: number; y: number }> = {
  sky: { x: 470, y: 300 },
  orion: { x: 410, y: 360 },
  abc: { x: 560, y: 390 },
  tech: { x: 640, y: 430 },
  jaya: { x: 500, y: 470 },
  maple: { x: 380, y: 450 },
};

/** Shared project callout — Field & CESS shows GPS · CESS; Nearby shows name only. */
function StatusPinPlaque({
  site,
  hot,
  side,
  dy,
  below = false,
  /** Nearby beat — photo + project name only (no place / status / GPS / CESS). */
  nameOnly = false,
}: {
  site: (typeof CESS_SITES)[number];
  hot: boolean;
  side: "left" | "right";
  dy: number;
  below?: boolean;
  nameOnly?: boolean;
}) {
  const focus = SITE_FOCUS[site.id] ?? SITE_FOCUS.abc;
  const visits = TERRITORY_PROJECTS.find((p) => p.id === site.id)?.visits ?? 1;
  const statusLabel = CHIP_STATUS[site.status] ?? site.label;
  const badge = STATUS_BADGE[site.status] ?? STATUS_BADGE.assessment;
  const shortTitle = PIN_CHIP[site.id]?.title ?? site.name;
  const title =
    site.id === "abc"
      ? "ABC Commercial"
      : site.id === "tech"
        ? "Tech Park"
        : site.id === "sky"
          ? "Skyline"
          : site.id === "maple"
            ? "Maple"
            : site.id === "orion"
              ? "Orion"
              : site.id === "jaya"
                ? "Jayanagar"
                : shortTitle;
  const placeLine = `${focus.place}, ${focus.city}`;
  /** Jayanagar sits low on the map — keep this plaque a touch shorter when facts show. */
  const compact = !nameOnly && site.id === "jaya";
  const w = nameOnly ? 132 : compact ? 168 : 176;
  const h = nameOnly ? 36 : compact ? 48 : 60;
  const gap = 12;
  const x = side === "left" ? -(w + gap) : gap;
  const accent = site.color;
  const attach = below
    ? { x: side === "left" ? w - 24 : 24, y: 0 }
    : side === "left"
      ? { x: w, y: Math.round(h * 0.5) }
      : { x: 0, y: Math.round(h * 0.5) };
  const tip = below
    ? `${attach.x},${attach.y} ${attach.x - 5},${attach.y - 6} ${attach.x + 5},${attach.y - 6}`
    : side === "left"
      ? `${attach.x},${attach.y - 5} ${attach.x + 7},${attach.y} ${attach.x},${attach.y + 5}`
      : `${attach.x},${attach.y - 5} ${attach.x - 7},${attach.y} ${attach.x},${attach.y + 5}`;

  return (
    <g style={{ pointerEvents: "none" }} transform={`translate(${x} ${dy})`}>
      <polygon points={tip} fill="#ffffff" stroke="rgba(11,31,74,0.08)" strokeWidth="0.8" />
      <foreignObject x="0" y="0" width={w} height={h} style={{ overflow: "visible" }}>
        <div
          className={
            nameOnly
              ? "box-border flex h-full w-full items-center gap-1.5 overflow-hidden rounded-[10px] bg-white p-[4px]"
              : "box-border flex h-full w-full gap-1.5 overflow-hidden rounded-[10px] bg-white p-[4px]"
          }
          style={{
            boxShadow: hot
              ? `0 6px 16px rgba(7,20,51,0.22), 0 0 0 1.5px ${accent}50`
              : "0 5px 14px rgba(7,20,51,0.16), 0 0 0 1px rgba(11,31,74,0.08)",
            fontFamily: "ui-sans-serif, system-ui, -apple-system, sans-serif",
          }}
        >
          <img
            src={site.id === "abc" ? abcSite : focus.img}
            alt=""
            aria-hidden
            className={
              nameOnly
                ? "h-[28px] w-[28px] shrink-0 rounded-[6px] object-cover bg-[#e8eef6]"
                : compact
                  ? "h-[40px] w-[34px] shrink-0 rounded-[6px] object-cover bg-[#e8eef6]"
                  : "h-[52px] w-[42px] shrink-0 rounded-[7px] object-cover bg-[#e8eef6]"
            }
            draggable={false}
            onError={(e) => {
              const el = e.currentTarget;
              if (el.src.includes("abc-site")) return;
              el.src = abcSite;
            }}
          />
          {nameOnly ? (
            <div className="flex min-w-0 flex-1 items-center justify-between gap-1 pr-0.5">
              <div className="min-w-0 truncate text-[10px] leading-none font-extrabold text-[#0b1f4a]">{title}</div>
              <span
                className="grid size-[11px] shrink-0 place-items-center rounded-full bg-[#eef2f8] text-[7px] leading-none font-bold text-[#8a97b0]"
                aria-hidden
              >
                ×
              </span>
            </div>
          ) : (
            <div
              className={
                compact
                  ? "flex min-w-0 flex-1 flex-col justify-center gap-px py-px pr-0.5"
                  : "flex min-w-0 flex-1 flex-col justify-center gap-[2px] py-px pr-0.5"
              }
            >
              <div className="flex min-w-0 items-start justify-between gap-0.5">
                <div
                  className={
                    compact
                      ? "min-w-0 flex-1 truncate text-[8.5px] leading-none font-extrabold text-[#0b1f4a]"
                      : "min-w-0 flex-1 truncate text-[9px] leading-none font-extrabold text-[#0b1f4a]"
                  }
                >
                  {title}
                </div>
                <span
                  className="mt-px grid size-[11px] shrink-0 place-items-center rounded-full bg-[#eef2f8] text-[7px] leading-none font-bold text-[#8a97b0]"
                  aria-hidden
                >
                  ×
                </span>
              </div>
              <div className="flex min-w-0 items-center gap-0.5 truncate text-[6.5px] leading-none font-semibold text-[#7a879e]">
                <svg width="6" height="6" viewBox="0 0 8 8" aria-hidden className="shrink-0">
                  <path
                    d="M4 0.7C2.65 0.7 1.55 1.8 1.55 3.15c0 1.75 2.45 3.95 2.45 3.95s2.45-2.2 2.45-3.95C6.45 1.8 5.35 0.7 4 0.7z"
                    fill={accent}
                  />
                  <circle cx="4" cy="3.05" r="1.05" fill="#fff" />
                </svg>
                {placeLine}
              </div>
              <span
                className="inline-flex w-fit items-center gap-0.5 text-[6.5px] leading-none font-extrabold"
                style={{ color: badge.ink }}
              >
                <span className="size-[5px] rounded-full" style={{ background: badge.ink }} />
                {statusLabel}
              </span>
              <div
                className={
                  compact
                    ? "mt-px flex items-end gap-2.5 border-t border-[#edf1f7] pt-px"
                    : "mt-px flex items-end gap-3 border-t border-[#edf1f7] pt-[3px]"
                }
              >
                <div className="min-w-0">
                  <div className="text-[5px] font-bold tracking-[0.06em] text-[#9aa6bc] uppercase">GPS</div>
                  <div
                    className={
                      compact
                        ? "text-[8.5px] leading-none font-extrabold text-[#0b1f4a]"
                        : "text-[9.5px] leading-none font-extrabold text-[#0b1f4a]"
                    }
                  >
                    {visits}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-[5px] font-bold tracking-[0.06em] text-[#9aa6bc] uppercase">CESS</div>
                  <div className="truncate text-[8.5px] leading-none font-extrabold text-[#0b1f4a]">{focus.cess}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
}

function GisLayerCanvas({
  mode,
  pin,
  onPin,
  hotPin = true,
}: {
  mode: MapMode;
  pin: string;
  onPin: (id: string) => void;
  hotPin?: boolean;
}) {
  const hierarchy = mode !== "gps";
  const context = mode === "context" || mode === "status" || mode === "dashboard";
  const status = mode === "status";
  const dashboard = mode === "dashboard";
  /** Nearby + Field & CESS — project facts sit on the pin, not a left rail. */
  const pinCardMode = mode === "context" || mode === "status";
  const gpsTrail = GPS_PTS.map((p) => `${p.x},${p.y}`).join(" ");

  const pick = (id: string) => (e: MouseEvent) => {
    e.stopPropagation();
    onPin(id);
  };

  if (mode === "gps") {
    const hot = hotPin && pin === "abc";
    return (
      <>
        <svg
          className="pointer-events-none absolute inset-0 z-20 h-full w-full"
          viewBox="0 0 800 800"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          <defs>
            <filter id="gpsPinDrop" x="-50%" y="-20%" width="200%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.2" floodColor="rgba(7,20,51,0.28)" />
            </filter>
          </defs>
          <g transform="translate(400 400)">
            {hot ? (
              <>
                <circle cx="0" cy="-10" r="42" fill={HEX.tealBright} opacity="0.1" />
                <circle cx="0" cy="-10" r="32" fill="none" stroke={HEX.tealBright} strokeWidth="1.6" opacity="0.45" className="pin-ring" />
              </>
            ) : (
              <circle cx="0" cy="-10" r="30" fill={HEX.tealBright} opacity="0.08" />
            )}
            <g filter="url(#gpsPinDrop)">
              <MapPinMarker x={0} y={0} fill={HEX.tealBright} label="ABC · GPS" emphasis />
            </g>
          </g>
        </svg>
        <button
          type="button"
          aria-label="Show field visit details"
          onClick={(e) => {
            e.stopPropagation();
            onPin("abc");
          }}
          className="absolute top-1/2 left-1/2 z-30 size-16 -translate-x-1/2 -translate-y-[58%] cursor-pointer rounded-full bg-transparent"
        />
      </>
    );
  }

  const showCluster = mode === "context" || mode === "status" || mode === "dashboard";
  const showAbcOnly = mode === "hierarchy" || mode === "people";

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 800 800"
      preserveAspectRatio="xMidYMid slice"
      onClick={(e) => {
        if (!dashboard) return;
        if (e.target === e.currentTarget) onPin("");
      }}
      style={{ pointerEvents: dashboard ? "auto" : undefined }}
    >
      <defs>
        <filter id="pinBoardShadow" x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2.4" floodColor="rgba(7,20,51,0.24)" />
        </filter>
        <filter id="pinDrop" x="-50%" y="-20%" width="200%" height="160%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.4" floodColor="rgba(7,20,51,0.35)" />
        </filter>
        <filter id="bubblePinShadow" x="-60%" y="-40%" width="220%" height="200%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.8" floodColor="rgba(7,20,51,0.32)" />
        </filter>
        <linearGradient id="zoneFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5b9bd5" stopOpacity="0.42" />
          <stop offset="100%" stopColor="#1a4e8a" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="eastZoneGlowStroke" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2ec4d6" />
          <stop offset="50%" stopColor="#14c4d4" />
          <stop offset="100%" stopColor="#1a7fbf" />
        </linearGradient>
        <radialGradient
          id="eastZoneSoftFill"
          cx={`${(TERRITORY_RING.cx / 800) * 100}%`}
          cy={`${(TERRITORY_RING.cy / 800) * 100}%`}
          r="26%"
        >
          <stop offset="0%" stopColor="#14c4d4" stopOpacity="0.1" />
          <stop offset="70%" stopColor="#14c4d4" stopOpacity="0.045" />
          <stop offset="100%" stopColor="#14c4d4" stopOpacity="0" />
        </radialGradient>
        <filter id="eastZoneGlow" x="-35%" y="-35%" width="170%" height="170%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="rgba(20,196,212,0.55)" />
        </filter>
      </defs>
      {hierarchy ? (
        <g opacity={dashboard ? 0.92 : 1} style={{ pointerEvents: "none" }}>
          {mode === "hierarchy" ? (
            <g>
              {/* Soft fill only — no flat blue disk */}
              <path d={TERRITORY} fill="url(#eastZoneSoftFill)" />

              {/* Reference-style glowing blue boundary */}
              <path
                d={TERRITORY}
                fill="none"
                stroke="#14c4d4"
                strokeWidth="14"
                opacity="0.18"
                filter="url(#eastZoneGlow)"
              />
              <path
                d={TERRITORY}
                fill="none"
                stroke="#14c4d4"
                strokeWidth="6"
                opacity="0.35"
              />
              <path
                d={TERRITORY}
                fill="none"
                stroke="url(#eastZoneGlowStroke)"
                strokeWidth="3.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#eastZoneGlow)"
              />
              <path d={TERRITORY} fill="none" stroke="#ffffff" strokeWidth="1.4" opacity="0.85" />

              <HaloText x={TERRITORY_RING.cx + 8} y={TERRITORY_RING.cy - TERRITORY_RING.ry + 28} fill={HEX.teal} size={11}>
                East Zone
              </HaloText>
            </g>
          ) : (
            <>
              <path
                d={TERRITORY}
                fill={dashboard ? "url(#zoneFill)" : `${HEX.tealBright}32`}
                stroke={dashboard ? "#0b1f4a" : HEX.teal}
                strokeWidth={dashboard ? 2.2 : 1.4}
              />
              {dashboard ? (
                <path d={TERRITORY} fill="none" stroke="#fff" strokeWidth="0.9" opacity="0.55" />
              ) : null}
            </>
          )}
          {mode !== "hierarchy" && !dashboard ? (
            <HaloText x="548" y="128" fill={HEX.teal} size={9}>
              East Zone
            </HaloText>
          ) : null}
          {dashboard ? (
            <HaloText x="548" y="248" fill={HEX.navy} size={10}>
              East Zone · BBMP
            </HaloText>
          ) : null}
          <path
            d={DISTRICT}
            fill="none"
            stroke={HEX.navy}
            strokeWidth={dashboard ? 0.9 : mode === "hierarchy" ? 1.2 : 1.1}
            strokeDasharray={mode === "hierarchy" ? "6 5" : "5 3.5"}
            opacity={dashboard ? 0.4 : mode === "hierarchy" ? 0.4 : 1}
          />
          {!dashboard ? (
            <HaloText x="118" y="96" fill={HEX.navy} size={9}>
              Bengaluru Urban
            </HaloText>
          ) : null}
          <path
            d={ULB}
            fill="none"
            stroke={HEX.goldDeep}
            strokeWidth={dashboard ? 0.85 : mode === "hierarchy" ? 1.15 : 1}
            strokeDasharray={mode === "hierarchy" ? "4 4" : "3.5 2.5"}
            opacity={dashboard ? 0.5 : mode === "hierarchy" ? 0.55 : 1}
          />
          {mode !== "hierarchy"
            ? WARDS.map((d) => (
                <path key={d} d={d} fill="none" stroke={HEX.goldDeep} strokeWidth="0.45" opacity={dashboard ? 0.2 : 0.35} />
              ))
            : null}
          {!dashboard ? (
            <HaloText x="214" y="178" fill={HEX.goldInk} size={9}>
              BBMP
            </HaloText>
          ) : null}
        </g>
      ) : null}

      {context ? (
        <g opacity={status || dashboard ? 0.22 : 1} style={{ pointerEvents: "none" }}>
          {ROADS.map((road) => {
            const [lx, ly] = xy(road.labelAt[0], road.labelAt[1]);
            return (
              <g key={road.id} fill="none" strokeLinecap="round">
                <path d={road.d} stroke={HEX.navy} strokeWidth={road.w + 1.4} opacity="0.18" />
                <path d={road.d} stroke={HEX.teal} strokeWidth={road.w - 0.2} />
                {!dashboard ? (
                  <HaloText x={lx + 6} y={ly - 4} fill={HEX.navy} size={7.5}>
                    {road.label}
                  </HaloText>
                ) : null}
              </g>
            );
          })}
          {!dashboard
            ? INFRA.slice(0, 3).map((node) => (
                <g key={node.label} transform={`translate(${node.x} ${node.y})`}>
                  <circle r="4" fill={HEX.port4} stroke={HEX.navy} strokeWidth="0.8" />
                  <HaloText x="10" y="3" fill={HEX.navy} size={7.5}>
                    {node.label}
                  </HaloText>
                </g>
              ))
            : null}
        </g>
      ) : null}

      {status ? (
        <g style={{ pointerEvents: "none" }} opacity="0.55">
          <polyline points={gpsTrail} fill="none" stroke={HEX.port4} strokeWidth="1.6" strokeDasharray="4 4" opacity="0.7" />
          {GPS_PTS.map((visit) => (
            <g key={visit.label} transform={`translate(${visit.x} ${visit.y})`}>
              <circle r="10" fill={HEX.port4} opacity="0.12" />
              <circle r="4.5" fill="none" stroke={HEX.port4} strokeWidth="1.6" />
              <circle r="2" fill={HEX.tealBright} />
              <circle cx="-9" cy="-9" r="6" fill={HEX.navy} stroke={HEX.tealBright} strokeWidth="1.1" />
              <text x="-9" y="-6.5" textAnchor="middle" fill={HEX.tealBright} fontSize="6.5" fontWeight="800">
                {visit.n}
              </text>
            </g>
          ))}
        </g>
      ) : null}

      <g>
        {[...MAP_SITES.filter((site) => (showAbcOnly ? site.id === "abc" : showCluster || site.id === "abc"))]
          .sort((a, b) => {
            if (!status) return 0;
            if (a.id === pin) return 1;
            if (b.id === pin) return -1;
            return 0;
          })
          .map((site, i) => {
          const hot = pin === site.id && hotPin;
          const isAbc = site.id === "abc";
          const place = dashboard
            ? (DASHBOARD_PIN_XY[site.id] ?? { x: site.x, y: site.y })
            : pinCardMode
              ? (STATUS_PIN_XY[site.id] ?? { x: site.x, y: site.y })
              : { x: site.x, y: site.y };
          const chip = PIN_CHIP[site.id] ?? { side: "right" as const, title: site.name };
          /** Reference bubble markers — coloured disc + white centre for Field & CESS. */
          const useBubble = mode === "hierarchy" || mode === "people";
          const useStatusDot = mode === "status";
          const bubbleR = hot || isAbc ? 16 : 12;
          /** Nearby / Field & CESS — every pin shows the same ABC-style card. */
          const showSideCard = pinCardMode || (dashboard && !hot);
          const statusPlace = STATUS_PIN_CHIP[site.id] ?? { side: chip.side, dy: -28 };
          const sideTitle = chip.title;
          const sideStatus = CHIP_STATUS[site.status] ?? site.label;
          const sideW = Math.min(
            112,
            Math.max(58, 28 + Math.max(sideTitle.length, sideStatus.length) * 5.2),
          );
          const sideH = 26;
          const sideLeft = chip.side === "left";
          const sideGap = 11;
          const sideX = sideLeft ? -(sideW + sideGap) : sideGap;
          const sideY = -32;

          return (
            <g
              key={site.id}
              className="cursor-pointer"
              style={{ pointerEvents: "auto" }}
              transform={`translate(${place.x} ${place.y})`}
              onClick={pick(site.id)}
            >
              <circle r={hot ? 30 : 22} fill="transparent" />
              {useStatusDot ? (
                <g className="pin-bob" style={{ animationDelay: `${i * 80}ms` }} filter="url(#bubblePinShadow)">
                  {hot ? <circle r="18" fill={site.color} opacity="0.16" className="pin-ring" /> : null}
                  <circle r={hot ? 11 : 9} fill={site.color} stroke="#fff" strokeWidth="2.4" />
                  <circle r={hot ? 4.2 : 3.4} fill="#fff" />
                </g>
              ) : useBubble ? (
                <g className="pin-bob" style={{ animationDelay: `${i * 80}ms` }} filter="url(#bubblePinShadow)">
                  {hot ? (
                    <circle r={bubbleR + 10} fill={site.color} opacity="0.16" className="pin-ring" />
                  ) : null}
                  <circle r={bubbleR} fill={site.color} stroke="#fff" strokeWidth={hot || isAbc ? 3.2 : 2.6} />
                  <circle r={bubbleR * 0.55} fill="rgba(255,255,255,0.18)" cy={-bubbleR * 0.28} />
                  {/* White location glyph */}
                  <path
                    d={`M0 ${-bubbleR * 0.42}
                      c ${-bubbleR * 0.28} 0 ${-bubbleR * 0.5} ${bubbleR * 0.22} ${-bubbleR * 0.5} ${bubbleR * 0.48}
                      c 0 ${bubbleR * 0.38} ${bubbleR * 0.5} ${bubbleR * 0.82} ${bubbleR * 0.5} ${bubbleR * 0.82}
                      s ${bubbleR * 0.5} ${-bubbleR * 0.44} ${bubbleR * 0.5} ${-bubbleR * 0.82}
                      c 0 ${-bubbleR * 0.26} ${-bubbleR * 0.22} ${-bubbleR * 0.48} ${-bubbleR * 0.5} ${-bubbleR * 0.48}z`}
                    fill="#fff"
                  />
                  <circle cy={-bubbleR * 0.12} r={bubbleR * 0.14} fill={site.color} />
                  {!dashboard ? (
                    <HaloText x={bubbleR + 6} y="3" fill={HEX.navy} size={hot || isAbc ? 9 : 7.5}>
                      {isAbc ? "ABC" : site.name}
                    </HaloText>
                  ) : null}
                </g>
              ) : (
                <>
                  {hot && pinCardMode ? (
                    <circle r="22" fill={site.color} opacity="0.12" className="pin-ring" />
                  ) : hot ? (
                    <>
                      <circle r="28" fill={site.color} opacity="0.14" />
                      <circle r="20" fill="none" stroke={site.color} strokeWidth="1.5" opacity="0.5" className="pin-ring" />
                    </>
                  ) : (
                    <circle r="13" fill={site.color} opacity="0.1" />
                  )}
                  <ellipse
                    cx="0"
                    cy="5"
                    rx={dashboard || pinCardMode ? 5.5 : 4.5}
                    ry={dashboard || pinCardMode ? 2.2 : 1.8}
                    fill="rgba(7,20,51,0.18)"
                  />
                  <g className="pin-bob" style={{ animationDelay: `${i * 80}ms` }} filter="url(#pinDrop)">
                    <path
                      d={
                        hot || isAbc || dashboard || pinCardMode
                          ? "M0-18c-6.4 0-11.5 5-11.5 11.8 0 8.6 11.5 20 11.5 20s11.5-11.4 11.5-20C11.5-13 6.4-18 0-18z"
                          : "M0-13c-4.6 0-8.3 3.6-8.3 8.5 0 6.2 8.3 13.6 8.3 13.6s8.3-7.4 8.3-13.6C8.3-9.4 4.6-13 0-13z"
                      }
                      fill={site.color}
                      stroke="#fff"
                      strokeWidth={hot || isAbc || dashboard || pinCardMode ? 2 : 1.2}
                    />
                    <circle
                      cy={hot || isAbc || dashboard || pinCardMode ? "-8.2" : "-6"}
                      r={hot || isAbc || dashboard || pinCardMode ? 3.6 : 2.6}
                      fill="#fff"
                    />
                  </g>
                  {dashboard || pinCardMode ? null : (
                    <HaloText x="11" y="-6" fill={HEX.navy} size={hot ? 8 : 7}>
                      {isAbc ? "ABC" : site.name}
                    </HaloText>
                  )}
                </>
              )}

              {showSideCard && pinCardMode ? (
                <StatusPinPlaque
                  site={site}
                  hot={hot}
                  side={statusPlace.side}
                  dy={statusPlace.dy}
                  below={Boolean(statusPlace.below)}
                  nameOnly={mode === "context"}
                />
              ) : null}

              {showSideCard && dashboard ? (
                <g style={{ pointerEvents: "none" }} filter="url(#pinBoardShadow)">
                  <g transform={`translate(${sideX} ${sideY})`}>
                    <rect
                      x="0.5"
                      y="0.5"
                      width={sideW - 1}
                      height={sideH - 1}
                      rx="8"
                      fill="#ffffff"
                      stroke="rgba(11,31,74,0.08)"
                      strokeWidth="1"
                    />
                    <rect x="0.5" y="0.5" width="3" height={sideH - 1} rx="1.5" fill={site.color} />
                    <circle cx="12" cy={sideH / 2} r="2.6" fill={site.color} />
                    <text x="18" y="11" fill={HEX.navy} fontSize="8" fontWeight="800">
                      {sideTitle}
                    </text>
                    <text x="18" y="20.5" fill={site.color} fontSize="6.5" fontWeight="700">
                      {sideStatus}
                    </text>
                  </g>
                </g>
              ) : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function HaloText({
  x,
  y,
  fill,
  size,
  children,
}: {
  x: number | string;
  y: number | string;
  fill: string;
  size: number;
  children: string;
}) {
  return (
    <text x={x} y={y} fill={fill} fontSize={size} fontWeight="700" style={{ paintOrder: "stroke", stroke: "#fff", strokeWidth: 3 }}>
      {children}
    </text>
  );
}
