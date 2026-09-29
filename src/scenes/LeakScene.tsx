import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowRight,
  Bank,
  Bell,
  Buildings,
  CalendarBlank,
  CaretDown,
  CaretRight,
  ClipboardText,
  Clock,
  Eye,
  Funnel,
  GpsFix,
  IdentificationCard,
  Lightning,
  LinkBreak,
  MapPin,
  MapTrifold,
  Receipt,
  Scales,
  ShieldCheck,
  SquaresFour,
  User,
  Wallet,
  WarningCircle,
  X,
} from "@/lib/icons";
import { CessMap } from "@/components/CessMap";
import { Hold, Reveal, Stagger } from "@/components/SlideKit";
import { CESS_SITES, DISTRICT, TERRITORY, WEST } from "@/lib/gisGeometry";
import { HEX } from "@/lib/palette";
import { cn } from "@/lib/utils";
import problemStageBg from "@/assets/problem-stage-bg.png";

/** Beat map: 0 correlate · 1–5 cases A–E */

/** Only case projects are clickable on the map — fewer pins, clearer story. */
const MAP_SITE_IDS = ["sky", "orion", "jaya", "abc", "hsr"] as const;
const MAP_SITES = MAP_SITE_IDS.map((id) => CESS_SITES.find((s) => s.id === id)).filter(
  (s): s is (typeof CESS_SITES)[number] => Boolean(s),
);

type SourceId = "external" | "registration" | "assessment" | "gps" | "collection" | "remittance" | "gis";
type SourceSignal = "ok" | "gap" | "pending" | "idle";

const SOURCES: { id: SourceId; label: string; short: string; Icon: CessIcon }[] = [
  { id: "external", label: "Building plan / approval", short: "Approval", Icon: Buildings },
  { id: "registration", label: "CESS registration", short: "Registration", Icon: IdentificationCard },
  { id: "assessment", label: "CESS assessment", short: "Assessment", Icon: ClipboardText },
  { id: "gps", label: "GPS field visit", short: "GPS visit", Icon: GpsFix },
  { id: "collection", label: "CESS amount collected", short: "Payment", Icon: Wallet },
  { id: "remittance", label: "Amount remitted to Board", short: "Remittance", Icon: Bank },
  { id: "gis", label: "Map location", short: "Map", Icon: MapTrifold },
];

const CASES: {
  id: string;
  letter: string;
  at: number;
  kind: "expected" | "followup" | "exception";
  title: string;
  /** Verified lifecycle steps — done | current (stuck here) | gap | pending | idle */
  steps: { label: string; state: "done" | "current" | "gap" | "pending" | "idle" }[];
  note: string;
  badge: string;
  signals: Partial<Record<SourceId, SourceSignal>>;
  flowAt: number;
  mismatch: string;
}[] = [
  {
    id: "sky",
    letter: "A",
    at: 1,
    kind: "expected",
    title: "Normal path — records match",
    steps: [
      { label: "Registered", state: "done" },
      { label: "Assessment done", state: "done" },
      { label: "CESS paid", state: "done" },
      { label: "Remitted to Board", state: "done" },
    ],
    note: "This is how a project should look when records match and CESS is paid.",
    badge: "CESS paid",
    signals: {
      external: "ok",
      registration: "ok",
      assessment: "ok",
      gps: "ok",
      collection: "ok",
      remittance: "ok",
      gis: "ok",
    },
    flowAt: 5,
    mismatch: "All records match. Nothing to chase.",
  },
  {
    id: "orion",
    letter: "B",
    at: 2,
    kind: "followup",
    title: "Assessment done · payment pending",
    steps: [
      { label: "Registered", state: "done" },
      { label: "Assessment done", state: "done" },
      { label: "Payment pending", state: "gap" },
      { label: "Remittance", state: "idle" },
    ],
    note: "Assessment is done, but payment has not come in. An officer should follow up.",
    badge: "Payment pending",
    signals: {
      external: "ok",
      registration: "ok",
      assessment: "ok",
      gps: "ok",
      collection: "gap",
      remittance: "idle",
      gis: "ok",
    },
    flowAt: 0,
    mismatch: "Assessment done · Payment missing.",
  },
  {
    id: "jaya",
    letter: "C",
    at: 3,
    kind: "exception",
    title: "Approval seen · registration missing",
    steps: [
      { label: "Approval on file", state: "done" },
      { label: "CESS registration not found", state: "gap" },
      { label: "Assessment", state: "idle" },
      { label: "Payment", state: "idle" },
    ],
    note: "Building approval is visible, but CESS registration is not. Flag for review.",
    badge: "Needs review",
    signals: {
      external: "ok",
      registration: "gap",
      assessment: "idle",
      gps: "idle",
      collection: "idle",
      remittance: "idle",
      gis: "ok",
    },
    flowAt: 0,
    mismatch: "Approval found · Registration missing.",
  },
  {
    id: "abc",
    letter: "D",
    at: 4,
    kind: "followup",
    title: "Registered · assessment pending",
    steps: [
      { label: "Registered", state: "done" },
      { label: "GPS visit pending", state: "pending" },
      { label: "Assessment pending", state: "current" },
      { label: "Payment", state: "idle" },
    ],
    note: "The project is registered, but assessment is still pending. Follow up with the officer.",
    badge: "Assessment pending",
    signals: {
      external: "ok",
      registration: "ok",
      assessment: "pending",
      gps: "pending",
      collection: "idle",
      remittance: "idle",
      gis: "ok",
    },
    flowAt: 2,
    mismatch: "Registered · Assessment still pending.",
  },
  {
    id: "hsr",
    letter: "E",
    at: 5,
    kind: "followup",
    title: "CESS deducted · remittance late",
    steps: [
      { label: "Registered", state: "done" },
      { label: "Assessment done", state: "done" },
      { label: "CESS deducted", state: "done" },
      { label: "Remittance past 30 days", state: "gap" },
      { label: "Reconciliation pending", state: "pending" },
    ],
    note: "Money may have been deducted, but remittance to the Board is overdue.",
    badge: "Remittance late",
    signals: {
      external: "ok",
      registration: "ok",
      assessment: "ok",
      gps: "ok",
      collection: "ok",
      remittance: "gap",
      gis: "ok",
    },
    flowAt: 3,
    mismatch: "Payment seen · Remittance to Board is late.",
  },
];

const BEAT_HEAD: readonly { kicker: string; title: string; support: string }[] = [
  {
    kicker: "Government of Karnataka · Labour CESS",
    title: "Compare Project Records",
    support: "Put every detail for one project side by side.",
  },
  {
    kicker: "Project A · Normal path",
    title: "Records Match",
    support: "Registered, assessed, and CESS paid — the baseline.",
  },
  {
    kicker: "Project B · Follow-up",
    title: "Payment Pending",
    support: "Assessment is done. Payment has not arrived.",
  },
  {
    kicker: "Project C · Needs review",
    title: "Registration Missing",
    support: "Approval is seen. CESS registration is not.",
  },
  {
    kicker: "Project D · Follow-up",
    title: "Assessment Pending",
    support: "The project is registered. Assessment is still open.",
  },
  {
    kicker: "Project E · Follow-up",
    title: "Remittance Late",
    support: "CESS may be deducted. Remittance to the Board is overdue.",
  },
];

const SPACE_HINTS = [
  "Space · Project A",
  "Space · Project B",
  "Space · Project C",
  "Space · Project D",
  "Space · Project E",
  "Space · Next",
] as const;

const WORKFLOW: { label: string; Icon: CessIcon }[] = [
  { label: "Flag", Icon: LinkBreak },
  { label: "Alert", Icon: Bell },
  { label: "Assign", Icon: User },
  { label: "Follow up", Icon: Eye },
  { label: "Act", Icon: Lightning },
  { label: "Close", Icon: ShieldCheck },
];

const CHALLENGES: { id: string; title: string; body: string; Icon: CessIcon }[] = [
  {
    id: "display",
    title: "Only showing on a map",
    body: "Problems appear on screen, but nobody is assigned to fix them.",
    Icon: Eye,
  },
  {
    id: "auto",
    title: "Calling it leakage too soon",
    body: "A missing record is not proof of leakage until an officer reviews it.",
    Icon: WarningCircle,
  },
  {
    id: "owner",
    title: "No officer in charge",
    body: "The case has no assigned person for that territory.",
    Icon: User,
  },
  {
    id: "trail",
    title: "No closing note",
    body: "Alerts go out, but the final result is not written on the project record.",
    Icon: LinkBreak,
  },
];

const LOGIC = [
  { label: "Watch for mismatches", Icon: ShieldCheck },
  { label: "Flag for review", Icon: LinkBreak },
  { label: "Officer checks and follows up", Icon: Eye },
];

/** Opening overview KPIs — same visual language as Territory Dashboard */
const COMPARE_OVERVIEW_KPIS: {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  Icon: CessIcon;
  card: string;
  iconBg: string;
}[] = [
  {
    label: "Projects Watched",
    value: "5",
    delta: "A–E",
    up: true,
    Icon: Buildings,
    card: "bg-linear-to-br from-[#277eff] to-[#5f9dff] text-white",
    iconBg: "bg-[#064ebd]",
  },
  {
    label: "Records Match",
    value: "1",
    delta: "Case A",
    up: true,
    Icon: ShieldCheck,
    card: "bg-linear-to-br from-[#27b98a] to-[#57d9ae] text-white",
    iconBg: "bg-[#07865e]",
  },
  {
    label: "Follow-ups Open",
    value: "3",
    delta: "B · D · E",
    up: false,
    Icon: Clock,
    card: "bg-linear-to-br from-[#ffe39c] to-[#ffd05d] text-[#294267]",
    iconBg: "bg-[#d88b00] text-white",
  },
  {
    label: "Needs Review",
    value: "1",
    delta: "Case C",
    up: false,
    Icon: WarningCircle,
    card: "bg-linear-to-br from-[#ffc7ca] to-[#ffb2b8] text-[#294267]",
    iconBg: "bg-[#d92838] text-white",
  },
  {
    label: "Sources Compared",
    value: "7",
    delta: "Side by side",
    up: true,
    Icon: Scales,
    card: "bg-linear-to-br from-[#d4c5ff] to-[#c5adff] text-[#294267]",
    iconBg: "bg-[#6335cf] text-white",
  },
  {
    label: "Officer Actions",
    value: "4",
    delta: "In queue",
    up: false,
    Icon: Lightning,
    card: "bg-linear-to-br from-[#a7ecee] to-[#7adfe3] text-[#294267]",
    iconBg: "bg-[#008f96] text-white",
  },
];

const COMPARE_FILTERS: { id: string; label: string; Icon: CessIcon }[] = [
  { id: "zone", label: "East Zone", Icon: MapTrifold },
  { id: "ulb", label: "BBMP", Icon: Buildings },
  { id: "window", label: "Last 30 days", Icon: CalendarBlank },
];

const CASE_QUEUE: {
  id: string;
  letter: string;
  name: string;
  status: string;
  tone: string;
  hint: string;
}[] = [
  { id: "sky", letter: "A", name: "Skyline Towers", status: "Match", tone: "bg-[#ebfaf4] text-[#079764]", hint: "CESS paid" },
  { id: "orion", letter: "B", name: "Orion Mall", status: "Follow-up", tone: "bg-[#fff6e5] text-[#b07616]", hint: "Payment pending" },
  { id: "jaya", letter: "C", name: "Jayanagar Plot", status: "Review", tone: "bg-[#fff0f1] text-[#df3c4b]", hint: "Registration missing" },
  { id: "abc", letter: "D", name: "ABC Complex", status: "Follow-up", tone: "bg-[#fff6e5] text-[#b07616]", hint: "Assessment pending" },
  { id: "hsr", letter: "E", name: "HSR Block", status: "Follow-up", tone: "bg-[#fff6e5] text-[#b07616]", hint: "Remittance late" },
];

const COMPARE_MIX: { label: string; count: number; pct: number; color: string }[] = [
  { label: "Records match", count: 1, pct: 20, color: "#14b879" },
  { label: "Follow-up", count: 3, pct: 60, color: "#f5a313" },
  { label: "Needs review", count: 1, pct: 20, color: "#e53d50" },
];

const KPI_CARD_TONES: { card: string; iconBg: string }[] = [
  { card: "bg-linear-to-br from-[#277eff] to-[#5f9dff] text-white", iconBg: "bg-[#064ebd]" },
  { card: "bg-linear-to-br from-[#27b98a] to-[#57d9ae] text-white", iconBg: "bg-[#07865e]" },
  { card: "bg-linear-to-br from-[#ffe39c] to-[#ffd05d] text-[#294267]", iconBg: "bg-[#d88b00] text-white" },
  { card: "bg-linear-to-br from-[#ffc7ca] to-[#ffb2b8] text-[#294267]", iconBg: "bg-[#d92838] text-white" },
  { card: "bg-linear-to-br from-[#d4c5ff] to-[#c5adff] text-[#294267]", iconBg: "bg-[#6335cf] text-white" },
  { card: "bg-linear-to-br from-[#a7ecee] to-[#7adfe3] text-[#294267]", iconBg: "bg-[#008f96] text-white" },
];

function MountainDecor() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute right-[-8px] bottom-[-12px] h-12 w-16 opacity-40"
      style={{
        background: "repeating-linear-gradient(to right, transparent 0 6px, rgba(255,255,255,0.35) 6px 10px)",
        clipPath:
          "polygon(0 100%,0 70%,12% 82%,12% 55%,25% 76%,25% 40%,38% 68%,38% 50%,50% 64%,50% 26%,63% 56%,63% 18%,76% 47%,76% 8%,89% 38%,89% 0,100% 30%,100% 100%)",
      }}
    />
  );
}

function LivePill({ reduce, label = "Live Data" }: { reduce: boolean; label?: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded-[13px] bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#087a52] shadow-[0_5px_18px_rgba(189,209,233,0.12)] ring-1 ring-[#d6e5f6]"
    >
      <motion.span
        className="size-2 rounded-full bg-[#14b879] shadow-[0_0_0_4px_rgba(20,184,121,0.12)]"
        animate={reduce ? undefined : { opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
      {label}
      <ArrowRight weight="bold" className="size-2.5" />
    </button>
  );
}

function FilterChips({ filters = COMPARE_FILTERS }: { filters?: { id: string; label: string; Icon: CessIcon }[] }) {
  return (
    <>
      {filters.map((f) => (
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
    </>
  );
}

/** Per-project desk metrics — ultradetailed operational dashboard */
const PROJECT_DESK: Record<
  string,
  {
    idCode: string;
    zone: string;
    ward: string;
    ulb: string;
    officer: string;
    designation: string;
    phone: string;
    builder: string;
    category: string;
    areaSqm: string;
    amount: string;
    amountLabel: string;
    demand: string;
    collected: string;
    remitted: string;
    balance: string;
    due: string;
    sla: string;
    matchPct: number;
    visits: { n: number; label: string; when: string }[];
    docs: { name: string; status: "ok" | "gap" | "pending"; ref: string }[];
    finance: { label: string; value: string; tone: string }[];
    alerts: { label: string; tone: "ok" | "wait" | "bad" }[];
    activity: { t: string; line: string; by: string }[];
    nextAction: string;
    kpis: { label: string; value: string; hint: string; delta: string; tone: "ok" | "wait" | "bad" | "idle"; Icon: CessIcon }[];
  }
> = {
  sky: {
    idCode: "CESS-BLR-2401",
    zone: "West Zone",
    ward: "Ward 18",
    ulb: "BBMP",
    officer: "Shri Ramesh K.",
    designation: "Labour Inspector",
    phone: "080-XXXX-2401",
    builder: "Skyline Builders Pvt Ltd",
    category: "Residential · G+12",
    areaSqm: "18,420 sqm",
    amount: "₹2.40 L",
    amountLabel: "CESS paid in full",
    demand: "₹2.40 L",
    collected: "₹2.40 L",
    remitted: "₹2.40 L",
    balance: "₹0",
    due: "Closed · on time",
    sla: "Met",
    matchPct: 100,
    visits: [
      { n: 1, label: "Final verification", when: "28 Aug" },
      { n: 2, label: "Assessment visit", when: "20 Aug" },
      { n: 3, label: "First site mark", when: "12 Aug" },
    ],
    docs: [
      { name: "Building approval", status: "ok", ref: "BBMP/WA/19/2025" },
      { name: "CESS registration", status: "ok", ref: "CESS-BLR-2401" },
      { name: "Assessment order", status: "ok", ref: "AO/W18/882" },
      { name: "Payment challan", status: "ok", ref: "CH/04Sep/1102" },
      { name: "Remittance advice", status: "ok", ref: "RA/Board/4401" },
    ],
    finance: [
      { label: "Demand", value: "₹2.40 L", tone: "text-navy" },
      { label: "Collected", value: "₹2.40 L", tone: "text-ok-ink" },
      { label: "Remitted", value: "₹2.40 L", tone: "text-ok-ink" },
      { label: "Balance", value: "₹0", tone: "text-ok-ink" },
    ],
    alerts: [
      { label: "All records match", tone: "ok" },
      { label: "No open follow-up", tone: "ok" },
    ],
    activity: [
      { t: "04 Sep · 11:20", line: "Full CESS remitted to Board", by: "Finance desk" },
      { t: "28 Aug · 16:05", line: "Assessment completed and locked", by: "Ramesh K." },
      { t: "20 Aug · 10:40", line: "GPS visit uploaded with photos", by: "Field app" },
      { t: "12 Aug · 09:15", line: "Registration confirmed on platform", by: "System" },
    ],
    nextAction: "No action — file closed",
    kpis: [
      { label: "Match score", value: "100%", hint: "7 of 7 records", delta: "OK", tone: "ok", Icon: Scales },
      { label: "Registration", value: "Done", hint: "On file", delta: "Live", tone: "ok", Icon: IdentificationCard },
      { label: "Assessment", value: "Done", hint: "28 Aug 2026", delta: "Lock", tone: "ok", Icon: ClipboardText },
      { label: "Payment", value: "Paid", hint: "₹2.40 L", delta: "Full", tone: "ok", Icon: Wallet },
      { label: "Remittance", value: "On time", hint: "Day 7 of 30", delta: "SLA", tone: "ok", Icon: Bank },
      { label: "GPS visits", value: "3", hint: "Evidence on file", delta: "+1", tone: "ok", Icon: GpsFix },
    ],
  },
  orion: {
    idCode: "CESS-BLR-2412",
    zone: "West Zone",
    ward: "Ward 42",
    ulb: "BBMP",
    officer: "Smt. Priya N.",
    designation: "Labour Inspector",
    phone: "080-XXXX-2412",
    builder: "Orion Infra Developments",
    category: "Commercial · Mall expansion",
    areaSqm: "24,800 sqm",
    amount: "₹1.85 L",
    amountLabel: "Demand raised · unpaid",
    demand: "₹1.85 L",
    collected: "₹0",
    remitted: "₹0",
    balance: "₹1.85 L",
    due: "12 days overdue",
    sla: "At risk",
    matchPct: 71,
    visits: [
      { n: 1, label: "Assessment complete", when: "02 Sep" },
      { n: 2, label: "Measurement visit", when: "28 Aug" },
      { n: 3, label: "Site open", when: "18 Aug" },
    ],
    docs: [
      { name: "Building approval", status: "ok", ref: "BBMP/WE/42/2025" },
      { name: "CESS registration", status: "ok", ref: "CESS-BLR-2412" },
      { name: "Assessment order", status: "ok", ref: "AO/W42/901" },
      { name: "Payment challan", status: "gap", ref: "Not received" },
      { name: "Remittance advice", status: "pending", ref: "After payment" },
    ],
    finance: [
      { label: "Demand", value: "₹1.85 L", tone: "text-navy" },
      { label: "Collected", value: "₹0", tone: "text-risk-ink" },
      { label: "Remitted", value: "₹0", tone: "text-muted-foreground" },
      { label: "Balance", value: "₹1.85 L", tone: "text-risk-ink" },
    ],
    alerts: [
      { label: "Payment pending 12 days", tone: "bad" },
      { label: "Reminder sent · 10 Sep", tone: "wait" },
    ],
    activity: [
      { t: "16 Sep · 09:30", line: "Flagged for officer follow-up", by: "Central Platform" },
      { t: "10 Sep · 14:12", line: "Payment reminder issued to builder", by: "Priya N." },
      { t: "02 Sep · 17:40", line: "Assessment completed — demand raised", by: "Priya N." },
      { t: "28 Aug · 11:05", line: "GPS measurement visit uploaded", by: "Field app" },
    ],
    nextAction: "Call builder · confirm payment plan",
    kpis: [
      { label: "Match score", value: "71%", hint: "5 of 7 records", delta: "Gap", tone: "bad", Icon: Scales },
      { label: "Registration", value: "Done", hint: "On file", delta: "OK", tone: "ok", Icon: IdentificationCard },
      { label: "Assessment", value: "Done", hint: "Demand raised", delta: "Lock", tone: "ok", Icon: ClipboardText },
      { label: "Payment", value: "Pending", hint: "₹1.85 L due", delta: "12d", tone: "bad", Icon: Wallet },
      { label: "Remittance", value: "—", hint: "After payment", delta: "Wait", tone: "idle", Icon: Bank },
      { label: "SLA", value: "At risk", hint: "Follow-up due", delta: "High", tone: "wait", Icon: Clock },
    ],
  },
  jaya: {
    idCode: "EXT-BBMP-7781",
    zone: "East Zone",
    ward: "Ward 9",
    ulb: "BBMP",
    officer: "Unassigned",
    designation: "—",
    phone: "—",
    builder: "Jayanagar Precinct Dev.",
    category: "Mixed use · proposed",
    areaSqm: "9,640 sqm",
    amount: "—",
    amountLabel: "No CESS file yet",
    demand: "—",
    collected: "—",
    remitted: "—",
    balance: "—",
    due: "Needs officer review",
    sla: "Open",
    matchPct: 29,
    visits: [
      { n: 1, label: "No GPS visit yet", when: "—" },
    ],
    docs: [
      { name: "Building approval", status: "ok", ref: "BBMP/EA/09/7781" },
      { name: "CESS registration", status: "gap", ref: "Not found" },
      { name: "Assessment order", status: "pending", ref: "Blocked" },
      { name: "Payment challan", status: "pending", ref: "—" },
      { name: "Remittance advice", status: "pending", ref: "—" },
    ],
    finance: [
      { label: "Demand", value: "—", tone: "text-muted-foreground" },
      { label: "Collected", value: "—", tone: "text-muted-foreground" },
      { label: "Remitted", value: "—", tone: "text-muted-foreground" },
      { label: "Balance", value: "—", tone: "text-muted-foreground" },
    ],
    alerts: [
      { label: "Potential exception — not leakage", tone: "bad" },
      { label: "Assign territory officer", tone: "wait" },
    ],
    activity: [
      { t: "16 Sep · 08:55", line: "Marked potential exception for review", by: "Compare engine" },
      { t: "14 Sep · 13:20", line: "No matching CESS registration found", by: "System match" },
      { t: "08 Sep · 10:05", line: "Approval details received from local body", by: "BBMP feed" },
    ],
    nextAction: "Assign officer · verify registration",
    kpis: [
      { label: "Match score", value: "29%", hint: "2 of 7 records", delta: "Gap", tone: "bad", Icon: Scales },
      { label: "Approval", value: "Seen", hint: "Local body feed", delta: "Ext", tone: "ok", Icon: Buildings },
      { label: "Registration", value: "Missing", hint: "Not on platform", delta: "Gap", tone: "bad", Icon: IdentificationCard },
      { label: "Assessment", value: "—", hint: "Blocked", delta: "—", tone: "idle", Icon: ClipboardText },
      { label: "Officer", value: "Open", hint: "No owner", delta: "Assign", tone: "wait", Icon: User },
      { label: "Map pin", value: "Provisional", hint: "From approval address", delta: "GIS", tone: "wait", Icon: MapPin },
    ],
  },
  abc: {
    idCode: "CESS-BLR-2388",
    zone: "East Zone",
    ward: "Ward 7",
    ulb: "BBMP",
    officer: "Shri Anil M.",
    designation: "Labour Inspector",
    phone: "080-XXXX-2388",
    builder: "ABC Infra Projects",
    category: "Commercial complex",
    areaSqm: "14,200 sqm",
    amount: "TBD",
    amountLabel: "After assessment",
    demand: "Not raised",
    collected: "₹0",
    remitted: "₹0",
    balance: "TBD",
    due: "Assessment open · 7 days",
    sla: "Within window",
    matchPct: 57,
    visits: [
      { n: 1, label: "Visit scheduled", when: "18 Sep" },
      { n: 2, label: "Site open mark", when: "01 Sep" },
    ],
    docs: [
      { name: "Building approval", status: "ok", ref: "BBMP/EA/07/2388" },
      { name: "CESS registration", status: "ok", ref: "CESS-BLR-2388" },
      { name: "Assessment order", status: "pending", ref: "In progress" },
      { name: "GPS field pack", status: "pending", ref: "Scheduled" },
      { name: "Payment challan", status: "pending", ref: "After demand" },
    ],
    finance: [
      { label: "Demand", value: "Not raised", tone: "text-gold-ink" },
      { label: "Collected", value: "₹0", tone: "text-muted-foreground" },
      { label: "Remitted", value: "₹0", tone: "text-muted-foreground" },
      { label: "Balance", value: "TBD", tone: "text-gold-ink" },
    ],
    alerts: [
      { label: "Assessment pending with officer", tone: "wait" },
      { label: "GPS visit due 18 Sep", tone: "wait" },
    ],
    activity: [
      { t: "16 Sep · 10:10", line: "Assessment still open — reminder to officer", by: "SLA watch" },
      { t: "09 Sep · 15:30", line: "GPS visit scheduled for East Zone", by: "Anil M." },
      { t: "01 Sep · 09:45", line: "Project registered on Central Platform", by: "Builder desk" },
    ],
    nextAction: "Complete GPS visit · finish assessment",
    kpis: [
      { label: "Match score", value: "57%", hint: "4 of 7 records", delta: "Open", tone: "wait", Icon: Scales },
      { label: "Registration", value: "Done", hint: "On file", delta: "OK", tone: "ok", Icon: IdentificationCard },
      { label: "GPS visit", value: "Pending", hint: "Due 18 Sep", delta: "Sched", tone: "wait", Icon: GpsFix },
      { label: "Assessment", value: "Open", hint: "Officer Anil M.", delta: "7d", tone: "wait", Icon: ClipboardText },
      { label: "Payment", value: "—", hint: "After demand", delta: "—", tone: "idle", Icon: Wallet },
      { label: "SLA", value: "On track", hint: "Within window", delta: "OK", tone: "ok", Icon: Clock },
    ],
  },
  hsr: {
    idCode: "CESS-BLR-2290",
    zone: "East Zone",
    ward: "Ward 22",
    ulb: "BBMP",
    officer: "Smt. Kavitha S.",
    designation: "Accounts Officer",
    phone: "080-XXXX-2290",
    builder: "HSR Layout Block Society",
    category: "Residential · G+8",
    areaSqm: "11,050 sqm",
    amount: "₹3.10 L",
    amountLabel: "Deducted at source",
    demand: "₹3.10 L",
    collected: "₹3.10 L",
    remitted: "₹0",
    balance: "₹3.10 L to Board",
    due: "34 days late",
    sla: "Breached",
    matchPct: 86,
    visits: [
      { n: 1, label: "Post-payment check", when: "12 Aug" },
      { n: 2, label: "Assessment visit", when: "22 Jul" },
      { n: 3, label: "Registration visit", when: "05 Jul" },
    ],
    docs: [
      { name: "Building approval", status: "ok", ref: "BBMP/EA/22/2290" },
      { name: "CESS registration", status: "ok", ref: "CESS-BLR-2290" },
      { name: "Assessment order", status: "ok", ref: "AO/W22/640" },
      { name: "Deduction advice", status: "ok", ref: "DA/HSR/05Aug" },
      { name: "Remittance advice", status: "gap", ref: "Overdue >30 days" },
    ],
    finance: [
      { label: "Demand", value: "₹3.10 L", tone: "text-navy" },
      { label: "Collected", value: "₹3.10 L", tone: "text-ok-ink" },
      { label: "Remitted", value: "₹0", tone: "text-risk-ink" },
      { label: "Interest risk", value: "Yes", tone: "text-risk-ink" },
    ],
    alerts: [
      { label: "Remittance overdue 34 days", tone: "bad" },
      { label: "Interest / reconciliation risk", tone: "wait" },
    ],
    activity: [
      { t: "16 Sep · 11:00", line: "Finance follow-up raised — remittance late", by: "Kavitha S." },
      { t: "20 Aug · 09:00", line: "30-day remittance window closed", by: "System" },
      { t: "05 Aug · 16:45", line: "CESS deducted at source by collecting agency", by: "Agency feed" },
      { t: "22 Jul · 12:20", line: "Assessment completed and demand locked", by: "Field officer" },
    ],
    nextAction: "Chase remittance · confirm Board credit",
    kpis: [
      { label: "Match score", value: "86%", hint: "6 of 7 records", delta: "Gap", tone: "wait", Icon: Scales },
      { label: "Payment", value: "Seen", hint: "Deducted", delta: "OK", tone: "ok", Icon: Wallet },
      { label: "Remittance", value: "Late", hint: "34 days", delta: "SLA", tone: "bad", Icon: Bank },
      { label: "Interest", value: "At risk", hint: "Finance review", delta: "High", tone: "wait", Icon: Receipt },
      { label: "Officer", value: "Assigned", hint: "Kavitha S.", delta: "Live", tone: "ok", Icon: User },
      { label: "Balance", value: "₹3.10 L", hint: "Due to Board", delta: "Open", tone: "bad", Icon: Scales },
    ],
  },
};

function siteOf(id: string) {
  return CESS_SITES.find((site) => site.id === id);
}

function leakLook(id: string, beat: number) {
  const site = siteOf(id);
  if (!site) return { color: HEX.muted, label: "Unknown", bucket: "plain" as const };
  if (id === "jaya" && beat >= 3) return { color: HEX.risk, label: "Registration missing", bucket: "exception" as const };
  if (id === "hsr" && beat >= 5) return { color: HEX.port6, label: "Remittance pending", bucket: "followup" as const };
  if (site.status === "compliant") return { color: site.color, label: site.label, bucket: "expected" as const };
  if (site.status === "assessment" || site.status === "payment" || site.status === "demand") {
    return { color: site.color, label: site.label, bucket: "followup" as const };
  }
  return { color: site.color, label: site.label, bucket: "plain" as const };
}

export function LeakScene({ beat }: { beat: number }) {
  const [pin, setPin] = useState("sky");
  const [challengesOpen, setChallengesOpen] = useState(false);
  const reduce = useReducedMotion();
  const focus = CASES.find((item) => item.id === pin) ?? CASES[0];
  const head = BEAT_HEAD[Math.min(beat, BEAT_HEAD.length - 1)];
  const spaceHint = SPACE_HINTS[Math.min(beat, SPACE_HINTS.length - 1)];
  const showCaseFlow = beat >= 2 && beat <= 5;

  useEffect(() => {
    if (beat >= 1 && beat <= 5) {
      const next = CASES.find((item) => item.at === beat);
      if (next) setPin(next.id);
    }
  }, [beat]);

  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr_auto] gap-2">
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
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={head.title + beat}
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
                    <Scales weight="fill" className="relative z-[1] size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex items-center rounded-full bg-teal px-2 py-0.5 text-[8px] font-extrabold tracking-[0.12em] text-navy-deep uppercase">
                        Compare · Flag · Follow-up
                      </span>
                      <span className="text-[9px] font-extrabold tracking-[0.12em] text-teal uppercase">{head.kicker}</span>
                    </div>
                    <h2 className="font-display mt-0.5 text-[18px] leading-tight font-extrabold text-navy">{head.title}</h2>
                  </div>
                </div>
                <p className="mt-0.5 max-w-[40rem] text-[11px] font-semibold text-muted-foreground">{head.support}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-md bg-white/90 px-2 py-0.5 font-mono text-[10px] font-bold text-navy ring-1 ring-[#d6e5f6]">
                {MAP_SITES.length} projects · click a pin
              </span>
              <button
                type="button"
                aria-expanded={challengesOpen}
                aria-label={challengesOpen ? "Close key issues" : "Show key issues"}
                onClick={() => setChallengesOpen((open) => !open)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase transition",
                  challengesOpen ? "bg-risk text-white" : "bg-risk-soft text-risk-ink",
                )}
              >
                {challengesOpen ? <X weight="bold" className="size-3.5" /> : <WarningCircle weight="fill" className="size-3.5" />}
                Key issues
              </button>
              {spaceHint ? (
                <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[9px] font-extrabold text-navy ring-1 ring-[#d6e5f6]">
                  {spaceHint}
                </span>
              ) : null}
            </div>
          </div>

          {challengesOpen ? (
            <div className="absolute top-16 right-4 z-40 w-[min(320px,calc(100%-2rem))] overflow-hidden rounded-2xl bg-white shadow-[0_18px_44px_rgba(7,20,51,0.18)] ring-1 ring-risk/20">
              <div className="border-b border-risk/15 bg-risk-soft px-3 py-2">
                <div className="text-[9px] font-extrabold tracking-[0.14em] text-risk-ink uppercase">Key issues</div>
                <div className="font-display text-[13px] font-bold text-navy">Why a gap on the map is not enough</div>
              </div>
              <ul className="space-y-2.5 p-3">
                {CHALLENGES.map((item, i) => (
                  <Stagger key={item.id} delay={40 + i * 50}>
                    <li className="flex items-start gap-2.5">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-risk text-white">
                        <item.Icon weight="fill" className="size-3.5" />
                      </span>
                      <span className="min-w-0">
                        <b className="block text-[12px] leading-tight text-risk-ink">{item.title}</b>
                        <span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">{item.body}</span>
                      </span>
                    </li>
                  </Stagger>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="relative min-h-0 flex-1 grid grid-cols-[minmax(220px,0.58fr)_minmax(0,1.85fr)] gap-2 overflow-hidden">
            <Reveal beat={beat} at={0} className="flex h-full min-h-0 flex-col gap-2">
              <div className="min-h-0 shrink-0 basis-[40%]">
                <SourcePanel beat={beat} pin={pin} onPin={setPin} compact reduce={!!reduce} />
              </div>
              <div className="min-h-0 flex-1">
                <MapPane beat={beat} pin={pin} focus={focus} onPin={setPin} reduce={!!reduce} compact />
              </div>
            </Reveal>
            <Reveal beat={beat} at={0} className="h-full min-h-0">
              <ProjectDesk beat={beat} focus={focus} reduce={!!reduce} />
            </Reveal>
          </div>
        </div>
      </div>

      <StoryFooter beat={beat} focus={focus} showCaseFlow={showCaseFlow} />
    </div>
  );
}

function StoryFooter({
  beat,
  focus,
  showCaseFlow,
}: {
  beat: number;
  focus: (typeof CASES)[number];
  showCaseFlow: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-1.5">
      {showCaseFlow ? (
        <Reveal beat={beat} at={2}>
          <div className="rounded-xl bg-mist/90 px-3 py-2 shadow-sm ring-1 ring-navy/8">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <div className="text-[9px] font-extrabold tracking-[0.12em] text-primary uppercase">
                Officer path · Project {focus.letter}
              </div>
              <span className="text-[9px] font-bold text-muted-foreground">Not only a map pin</span>
            </div>
            <WorkflowStrip active={focus.flowAt} compact />
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}

function SourcePanel({
  beat,
  pin,
  onPin,
  compact = false,
  reduce = false,
}: {
  beat: number;
  pin: string;
  onPin: (id: string) => void;
  compact?: boolean;
  reduce?: boolean;
}) {
  const focus = CASES.find((item) => item.id === pin) ?? CASES[0];
  const caseMode = beat >= 1 && beat <= 5;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
      <header className={cn("px-2.5 pt-2 pb-1", compact && "pb-0.5")}>
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-[12px] font-extrabold text-[#10275b]">
            {caseMode ? `Project ${focus.letter}` : "Compare records"}
          </h3>
          <span className="text-[9px] font-extrabold text-[#1470e8]">
            {CASES.filter((item) => beat >= item.at).length}/{CASES.length}
          </span>
        </div>
        <p className="mt-0.5 text-[10px] font-semibold text-[#71809d]">
          {caseMode ? "Record status" : "All details together"}
        </p>
      </header>

      <div className="min-h-0 flex-1 overflow-auto px-1.5 pb-2">
        <div className="mb-1 px-1 text-[8px] font-extrabold tracking-[0.12em] text-[#7a8bab] uppercase">
          {caseMode ? "Status" : "Records"}
        </div>
        <div className="flex flex-wrap gap-1 px-0.5">
          {SOURCES.map((source, i) => {
            const signal: SourceSignal = caseMode ? focus.signals[source.id] ?? "idle" : "ok";
            return (
              <Stagger key={source.id} delay={30 + i * 30}>
                <SourceStamp
                  source={source}
                  signal={signal}
                  live
                  emphasize={caseMode && (signal === "gap" || signal === "pending")}
                  reduce={reduce}
                />
              </Stagger>
            );
          })}
        </div>

        <div className="mt-2 mb-1 flex items-center justify-between px-1">
          <div className="text-[8px] font-extrabold tracking-[0.12em] text-[#7a8bab] uppercase">Projects</div>
        </div>
        <div className="flex flex-wrap gap-1 px-0.5">
          {CASES.map((item, i) => {
            const on = beat >= item.at;
            const next = beat + 1 === item.at;
            const active = on && pin === item.id;
            const site = siteOf(item.id);
            const pulse = !reduce && (on || next);
            return (
              <Stagger key={item.id} delay={40 + i * 35}>
                {on ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPin(item.id);
                    }}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-left transition ring-1",
                      active ? "bg-[#10275b] text-[#7dfff0] ring-[#1470e8]/35" : "bg-[#edf6ff] text-[#10275b] ring-[#d6e5f6] hover:ring-[#1470e8]/40",
                    )}
                  >
                    <motion.span
                      className={cn(
                        "grid size-4 place-items-center rounded-full font-mono text-[8px] font-extrabold",
                        active ? "bg-[#7dfff0] text-[#10275b]" : "bg-[#10275b] text-white",
                      )}
                      animate={pulse ? { scale: active ? [1, 1.22, 1] : [1, 1.12, 1] } : undefined}
                      transition={
                        pulse
                          ? { duration: active ? 1.35 : 1.7, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }
                          : undefined
                      }
                    >
                      {item.letter}
                    </motion.span>
                    <span className="max-w-[72px] truncate text-[9px] font-bold">{site?.name ?? item.id}</span>
                  </button>
                ) : (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 ring-1",
                      next ? "bg-[#edf6ff] text-[#10275b] ring-[#1470e8]/30" : "bg-[#f3f7fc] text-[#8a9bb5] ring-[#dce9f6] opacity-60",
                    )}
                  >
                    <motion.span
                      className="grid size-4 place-items-center rounded-full bg-[#e8eef6] font-mono text-[8px] font-extrabold"
                      animate={next && !reduce ? { scale: [1, 1.16, 1] } : undefined}
                      transition={
                        next && !reduce
                          ? { duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }
                          : undefined
                      }
                    >
                      {item.letter}
                    </motion.span>
                    <span className="text-[9px] font-bold">{next ? "Next" : "—"}</span>
                  </span>
                )}
              </Stagger>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SourceStamp({
  source,
  signal,
  live,
  emphasize,
  reduce = false,
}: {
  source: (typeof SOURCES)[number];
  signal: SourceSignal;
  live: boolean;
  emphasize?: boolean;
  reduce?: boolean;
}) {
  const isGap = live && signal === "gap";
  const isPending = live && signal === "pending";
  const tone =
    !live
      ? { ring: "ring-navy/8 bg-white/60 text-muted-foreground", chip: "—" }
      : isGap
        ? { ring: "ring-risk/50 bg-risk-soft text-risk-ink", chip: "Gap" }
        : isPending
          ? { ring: "ring-gold/50 bg-gold-soft text-gold-ink", chip: "Pending" }
          : signal === "ok"
            ? { ring: "ring-ok/30 bg-ok-soft text-ok-ink", chip: "OK" }
            : { ring: "ring-navy/8 bg-white text-muted-foreground", chip: "—" };

  return (
    <motion.span
      className={cn(
        "relative inline-flex items-center gap-1.5 rounded-full px-2 py-1 ring-1",
        tone.ring,
        emphasize && "ring-2",
        isGap && !reduce && "risk-gap-pulse risk-gap-flash",
        isPending && !reduce && "wait-gap-pulse",
      )}
      animate={
        isGap && !reduce
          ? { scale: [1, 1.06, 1] }
          : isPending && !reduce
            ? { scale: [1, 1.03, 1] }
            : undefined
      }
      transition={isGap || isPending ? { duration: 1.55, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {isGap && !reduce ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-full border border-[#e53d50]/50"
          animate={{ opacity: [0.85, 0.15, 0.85], scale: [1, 1.18, 1] }}
          transition={{ duration: 1.55, repeat: Infinity, ease: "easeOut" }}
        />
      ) : null}
      <source.Icon weight="fill" className="relative size-3" />
      <span className="relative text-[10px] font-bold">{source.short}</span>
      <span
        className={cn(
          "relative text-[8px] font-extrabold tracking-wide uppercase",
          isGap ? "opacity-100" : "opacity-80",
        )}
      >
        {tone.chip}
      </span>
    </motion.span>
  );
}

function MapPane({
  beat,
  pin,
  focus,
  onPin,
  reduce,
  compact = false,
}: {
  beat: number;
  pin: string;
  focus: (typeof CASES)[number];
  onPin: (id: string) => void;
  reduce: boolean;
  compact?: boolean;
}) {
  const site = siteOf(pin);
  const look = leakLook(pin, beat);

  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-[14px] bg-[#b9d8bd] shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
      <CessMap kind="gis" active pin={undefined} className="rounded-none" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-white/35 via-transparent to-white/20" />
      <LeakCanvas beat={beat} pin={pin} onPin={onPin} />

      {!reduce && beat >= 1 ? (
        <motion.div
          className="pointer-events-none absolute top-1/2 left-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal/20"
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}

      <div className={cn("pointer-events-none absolute left-2", compact ? "top-2 max-w-[160px]" : "top-3 max-w-[200px]")}>
        <div className="rounded-[10px] bg-white/94 px-2.5 py-1.5 shadow-[0_6px_18px_rgba(40,78,109,0.14)]">
          <div className="text-[8px] font-extrabold tracking-[0.12em] text-[#1470e8] uppercase">
            {beat >= 1 ? `Project ${focus.letter}` : "Territory map"}
          </div>
          <b className="block text-[11px] leading-tight text-[#10275b]">{beat >= 1 ? (site?.name ?? focus.title) : "Bengaluru examples"}</b>
        </div>
      </div>

      {beat >= 1 && site && !compact ? (
        <Hold className="pointer-events-none absolute top-3 right-3 w-[148px] rounded-[10px] bg-white/94 px-2 py-1.5 shadow-[0_6px_18px_rgba(40,78,109,0.14)]">
          <b className="block text-[11px] leading-tight text-[#10275b]">{site.fullName}</b>
          <p className="mt-0.5 flex items-center gap-1.5 text-[9px] font-bold" style={{ color: look.color }}>
            <span className="size-1.5 rounded-full" style={{ background: look.color }} />
            {look.label}
          </p>
        </Hold>
      ) : null}

      {beat >= 1 ? (
        <Hold className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          {[
            { label: "OK", color: HEX.ok },
            { label: "Follow-up", color: HEX.goldDeep },
            { label: "Review", color: HEX.risk },
          ].map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1 rounded-full bg-white/94 px-1.5 py-0.5 text-[8px] font-extrabold tracking-wide text-[#10275b] uppercase shadow-sm ring-1 ring-[#d6e5f6]"
            >
              <span className="size-1.5 rounded-full" style={{ background: item.color }} />
              {item.label}
            </span>
          ))}
        </Hold>
      ) : null}
    </div>
  );
}

function LeakCanvas({ beat, pin, onPin }: { beat: number; pin: string; onPin: (id: string) => void }) {
  const revealed = new Set(CASES.filter((item) => beat >= item.at).map((item) => item.id));

  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <path d={DISTRICT} fill={`${HEX.navy}12`} stroke={HEX.navy} strokeWidth="1.1" strokeDasharray="5 3.5" />
      <path d={WEST} fill={`${HEX.port4}14`} stroke={HEX.port4} strokeWidth="0.8" />
      <path d={TERRITORY} fill={`${HEX.tealBright}22`} stroke={HEX.teal} strokeWidth={1} />
      <HaloText x="548" y="128" fill={HEX.teal} size={9}>
        East Zone
      </HaloText>
      <HaloText x="176" y="360" fill={HEX.port4} size={9}>
        West Zone
      </HaloText>

      {MAP_SITES.map((site) => {
        const look = leakLook(site.id, beat);
        const on = revealed.has(site.id);
        const emphasis = pin === site.id && beat >= 1;
        const opacity = beat < 1 ? 0.85 : emphasis ? 1 : on ? 1 : 0.28;
        const item = CASES.find((entry) => entry.id === site.id);
        return (
          <g
            key={site.id}
            className="cursor-pointer"
            style={{ pointerEvents: item && beat >= item.at ? "auto" : "none" }}
            opacity={opacity}
            onClick={(e) => {
              e.stopPropagation();
              if (item && beat >= item.at) onPin(site.id);
            }}
          >
            {look.bucket === "exception" && on ? (
              <circle cx={site.x} cy={site.y} r="26" fill="none" stroke={HEX.risk} strokeWidth="2" strokeDasharray="4 3" />
            ) : null}
            {look.bucket === "followup" && on ? <circle cx={site.x} cy={site.y} r="22" fill={look.color} opacity="0.12" /> : null}
            <CessPin
              x={site.x}
              y={site.y}
              color={look.color}
              name={site.name}
              status={look.label}
              emphasis={emphasis}
              tagged={emphasis || (on && look.bucket === "exception")}
              delay={(site.id.charCodeAt(0) % 5) * 140}
            />
          </g>
        );
      })}
    </svg>
  );
}

function ProjectDesk({
  beat,
  focus,
  reduce,
}: {
  beat: number;
  focus: (typeof CASES)[number];
  reduce: boolean;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {beat >= 1 ? <CaseProjectDesk beat={beat} focus={focus} reduce={reduce} /> : <OpeningDesk reduce={reduce} />}
    </div>
  );
}

function CaseProjectDesk({
  beat,
  focus,
  reduce,
}: {
  beat: number;
  focus: (typeof CASES)[number];
  reduce: boolean;
}) {
  const site = siteOf(focus.id);
  const desk = PROJECT_DESK[focus.id];
  const look = leakLook(focus.id, beat);
  const kindWord = focus.kind === "exception" ? "Needs review" : focus.kind === "expected" ? "Normal path" : "Follow-up";
  const kindTone =
    focus.kind === "exception"
      ? "bg-[#fff0f1] text-[#df3c4b] ring-[#ffc7ca]"
      : focus.kind === "expected"
        ? "bg-[#ebfaf4] text-[#079764] ring-[#b6ead4]"
        : "bg-[#fff6e5] text-[#b07616] ring-[#ffe2a8]";
  const matchPct = desk?.matchPct ?? 0;
  const donutSize = 88;
  const donutStroke = 10;
  const donutR = (donutSize - donutStroke) / 2;
  const donutC = 2 * Math.PI * donutR;
  const okCount = SOURCES.filter((s) => (focus.signals[s.id] ?? "idle") === "ok").length;
  const gapCount = SOURCES.filter((s) => {
    const sig = focus.signals[s.id] ?? "idle";
    return sig === "gap" || sig === "pending";
  }).length;
  const idleCount = SOURCES.length - okCount - gapCount;
  const ringSegs = [
    { id: "ok", color: "#14b879", count: okCount, label: "OK" },
    { id: "gap", color: "#e53d50", count: gapCount, label: "Gap" },
    { id: "idle", color: "#b8c5d8", count: idleCount, label: "Idle" },
  ];
  let donutCursor = 0;
  const donutGap = donutC * 0.012;
  const donutArcs = ringSegs
    .filter((row) => row.count > 0)
    .map((row) => {
      const sweep = (row.count / SOURCES.length) * donutC;
      const length = Math.max(sweep - donutGap, 1);
      const arc = { ...row, dash: `${length} ${donutC - length}`, offset: -donutCursor };
      donutCursor += sweep;
      return arc;
    });
  const caseKpis = (desk?.kpis ?? []).slice(0, 6);

  if (!desk) return null;

  return (
    <motion.div
      key={focus.id}
      className="flex h-full min-h-0 flex-col gap-1.5 overflow-hidden"
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Filters + live */}
      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        <span className="mr-auto inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-[13px] bg-[#10275b] px-2.5 py-1.5 text-[10px] font-extrabold text-white shadow-[0_5px_18px_rgba(16,39,91,0.2)]">
          <span className="grid size-5 shrink-0 place-items-center rounded-md bg-white/15 font-mono text-[11px] text-[#7dfff0]">
            {focus.letter}
          </span>
          <span className="shrink-0">Project {focus.letter} · {desk.idCode}</span>
          <span className="hidden h-3 w-px shrink-0 bg-white/25 sm:block" />
          <span className="min-w-0 truncate font-bold text-[#7dfff0]">
            {site?.fullName ?? focus.title}
          </span>
        </span>
        <FilterChips
          filters={[
            { id: "zone", label: desk.zone, Icon: MapTrifold },
            { id: "ward", label: desk.ward, Icon: Buildings },
            { id: "case", label: kindWord, Icon: Funnel },
          ]}
        />
        <LivePill reduce={reduce} />
      </div>

      {/* Colour KPI strip */}
      <div className="grid shrink-0 grid-cols-6 gap-1.5">
        {caseKpis.map((kpi, i) => {
          const tone = KPI_CARD_TONES[i % KPI_CARD_TONES.length];
          const isGapKpi = kpi.tone === "bad";
          const isWaitKpi = kpi.tone === "wait";
          return (
            <Stagger key={kpi.label} delay={12 + i * 24}>
              <motion.div
                className={cn(
                  "relative overflow-hidden rounded-[14px] px-2.5 py-2 shadow-[0_8px_20px_rgba(36,73,125,0.12)]",
                  tone.card,
                  isGapKpi && !reduce && "risk-gap-pulse",
                  isWaitKpi && !reduce && "wait-gap-pulse",
                )}
                animate={isGapKpi && !reduce ? { scale: [1, 1.03, 1] } : undefined}
                transition={isGapKpi && !reduce ? { duration: 1.55, repeat: Infinity, ease: "easeInOut" } : undefined}
              >
                <MountainDecor />
                <span className={cn("relative mb-1 grid size-7 place-items-center rounded-[10px]", tone.iconBg)}>
                  <kpi.Icon weight="fill" className="size-3.5 text-white" />
                </span>
                <small className="relative block text-[8px] font-bold leading-tight opacity-90">{kpi.label}</small>
                <div className="relative mt-0.5 flex items-baseline gap-1">
                  <b className="font-display text-[14px] leading-none tracking-tight">{kpi.value}</b>
                  <span className="text-[8px] font-extrabold opacity-85">{kpi.delta}</span>
                </div>
              </motion.div>
            </Stagger>
          );
        })}
      </div>

      {/* Main: sources · match story · money */}
      <div className="grid min-h-0 flex-1 grid-cols-[0.9fr_1.35fr_0.95fr] gap-1.5 overflow-hidden">
        <article className="flex min-h-0 flex-col overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="flex shrink-0 items-center justify-between px-2.5 pt-2 pb-1">
            <h3 className="text-[12px] font-extrabold text-[#10275b]">Record Compare</h3>
            <span className="text-[9px] font-extrabold text-[#1470e8]">
              {okCount}/{SOURCES.length} OK
            </span>
          </div>
          <ul className="min-h-0 flex-1 space-y-0.5 overflow-auto px-1.5 pb-2">
            {SOURCES.map((source, i) => {
              const signal = focus.signals[source.id] ?? "idle";
              const bar =
                signal === "gap" ? "#e53d50" : signal === "pending" ? "#f5a313" : signal === "ok" ? "#14b879" : "#9aabc4";
              const word = signal === "gap" ? "Gap" : signal === "pending" ? "Pending" : signal === "ok" ? "OK" : "—";
              const isGap = signal === "gap";
              const isPending = signal === "pending";
              return (
                <Stagger key={source.id} delay={16 + i * 16}>
                  <motion.li
                    className={cn(
                      "relative flex items-center justify-between overflow-hidden rounded-[10px] px-2 py-1.5 text-[10px]",
                      isGap
                        ? "border-l-[3px] border-[#e53d50] font-extrabold text-[#b42334]"
                        : isPending
                          ? "border-l-[3px] border-[#f5a313] bg-[#fff6e5] font-extrabold text-[#b07616]"
                          : "font-semibold text-[#425a7f]",
                      isGap && !reduce && "risk-gap-flash risk-gap-pulse",
                      isPending && !reduce && "wait-gap-pulse",
                    )}
                    animate={
                      isGap && !reduce
                        ? { scale: [1, 1.015, 1] }
                        : undefined
                    }
                    transition={isGap && !reduce ? { duration: 1.55, repeat: Infinity, ease: "easeInOut" } : undefined}
                  >
                    {isGap && !reduce ? (
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-[#e53d50]"
                        animate={{ opacity: [1, 0.35, 1] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                      />
                    ) : null}
                    <span className="relative inline-flex min-w-0 items-center gap-2">
                      <motion.span
                        className="grid size-6 shrink-0 place-items-center rounded-full text-white"
                        style={{ background: bar }}
                        animate={
                          isGap && !reduce
                            ? { scale: [1, 1.12, 1], boxShadow: ["0 0 0 0 rgba(229,61,80,0.55)", "0 0 0 6px rgba(229,61,80,0)", "0 0 0 0 rgba(229,61,80,0.55)"] }
                            : undefined
                        }
                        transition={isGap && !reduce ? { duration: 1.55, repeat: Infinity } : undefined}
                      >
                        <source.Icon weight="fill" className="size-3" />
                      </motion.span>
                      <span className="truncate">{source.short}</span>
                    </span>
                    <b className="relative" style={{ color: bar }}>
                      {word}
                      {isGap ? " ·" : ""}
                    </b>
                  </motion.li>
                </Stagger>
              );
            })}
          </ul>
        </article>

        <article className="flex min-h-0 flex-col overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="flex shrink-0 items-center justify-between gap-2 px-2.5 pt-2 pb-1">
            <div className="min-w-0">
              <h3 className="truncate text-[12px] font-extrabold text-[#10275b]">{site?.fullName ?? focus.title}</h3>
              <small className="block truncate text-[9px] text-[#7384a1]">
                {desk.builder} · {desk.ulb}
              </small>
            </div>
            <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[9px] font-extrabold ring-1", kindTone)}>{kindWord}</span>
          </div>

          <div className="flex shrink-0 items-center gap-3 px-2.5 pb-2">
            <div className="relative grid size-[88px] shrink-0 place-items-center">
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
                transition={{ duration: 0.45 }}
              >
                <circle cx={donutSize / 2} cy={donutSize / 2} r={donutR} fill="none" stroke="#e8eef6" strokeWidth={donutStroke} />
                {donutArcs.map((arc, i) => (
                  <motion.circle
                    key={arc.id}
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={donutR}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={donutStroke}
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
                  <b className="block text-[16px] leading-none tracking-tight text-[#10275b]">{matchPct}%</b>
                  <span className="mt-0.5 block text-[6.5px] font-extrabold tracking-[0.1em] text-[#7a8bab] uppercase">Match</span>
                </div>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <motion.b
                className={cn(
                  "block text-[12px] leading-snug",
                  focus.kind === "expected" ? "text-[#10275b]" : "text-[#df3c4b]",
                )}
                animate={
                  focus.kind !== "expected" && !reduce
                    ? { opacity: [1, 0.72, 1] }
                    : undefined
                }
                transition={
                  focus.kind !== "expected" && !reduce
                    ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                    : undefined
                }
              >
                {focus.mismatch}
              </motion.b>
              <p className="mt-1 text-[10px] leading-snug text-[#71809d]">{focus.note}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {ringSegs.map((row) => (
                  <span
                    key={row.id}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full bg-[#f3f7fc] px-1.5 py-0.5 text-[8px] font-bold text-[#4a6288]",
                      row.id === "gap" && row.count > 0 && !reduce && "risk-gap-pulse bg-[#fff0f1] text-[#df3c4b]",
                    )}
                  >
                    <span className="size-1.5 rounded-full" style={{ background: row.color }} />
                    {row.label} {row.count}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto border-t border-[#e8eff7] px-2 pb-2 pt-1.5">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[9px] font-extrabold tracking-[0.12em] text-[#10275b] uppercase">Project path</span>
              <span className="text-[8px] font-bold text-[#8a9bb5]">
                {focus.steps.filter((s) => s.state === "done").length}/{focus.steps.length} done
              </span>
            </div>
            <ol className="space-y-1">
              {focus.steps.map((step, i) => {
                const isGap = step.state === "gap";
                const isPending = step.state === "pending" || step.state === "current";
                const chip =
                  step.state === "done"
                    ? { bg: "bg-[#ebfaf4]", ink: "text-[#079764]", word: "Done" }
                    : isGap
                      ? { bg: "bg-[#fff0f1]", ink: "text-[#df3c4b]", word: "Gap" }
                      : step.state === "current"
                        ? { bg: "bg-[#fff6e5]", ink: "text-[#b07616]", word: "Here" }
                        : step.state === "pending"
                          ? { bg: "bg-[#fff6e5]", ink: "text-[#b07616]", word: "Pending" }
                          : { bg: "bg-[#f3f7fc]", ink: "text-[#8a9bb5]", word: "—" };
                return (
                  <motion.li
                    key={step.label}
                    className={cn(
                      "relative flex items-center gap-2 overflow-hidden rounded-[10px] px-2 py-1.5",
                      chip.bg,
                      isGap && !reduce && "risk-gap-pulse risk-gap-flash",
                      isPending && !isGap && !reduce && "wait-gap-pulse",
                    )}
                    animate={isGap && !reduce ? { scale: [1, 1.02, 1] } : undefined}
                    transition={isGap && !reduce ? { duration: 1.55, repeat: Infinity, ease: "easeInOut" } : undefined}
                  >
                    {isGap && !reduce ? (
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-[10px] ring-2 ring-[#e53d50]/45"
                        animate={{ opacity: [0.9, 0.25, 0.9] }}
                        transition={{ duration: 1.55, repeat: Infinity }}
                      />
                    ) : null}
                    <span
                      className={cn(
                        "relative grid size-5 place-items-center rounded-full font-mono text-[8px] font-extrabold ring-1",
                        isGap ? "bg-[#e53d50] text-white ring-[#e53d50]" : "bg-white text-[#10275b] ring-[#d6e5f6]",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <b className="relative min-w-0 flex-1 truncate text-[11px] text-[#10275b]">{step.label}</b>
                    <span className={cn("relative text-[8px] font-extrabold uppercase", chip.ink)}>{chip.word}</span>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </article>

        <article className="flex min-h-0 flex-col overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="flex shrink-0 items-center justify-between px-2.5 pt-2 pb-1">
            <h3 className="text-[12px] font-extrabold text-[#10275b]">Money Trail</h3>
            <span className="inline-flex items-center gap-1 rounded-[10px] bg-white px-2 py-1 text-[8px] font-bold text-[#18345f] ring-1 ring-[#d6e5f6]">
              This project
              <CaretDown weight="bold" className="size-2.5 opacity-60" />
            </span>
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-1 px-2 pb-1.5">
            {desk.finance.map((row) => (
              <div
                key={row.label}
                className={cn(
                  "rounded-[9px] px-1.5 py-1.5",
                  row.tone.includes("risk")
                    ? "bg-[#fff0f1]"
                    : row.tone.includes("ok")
                      ? "bg-[#ebfaf4]"
                      : row.tone.includes("gold")
                        ? "bg-[#fff6e5]"
                        : "bg-[#edf6ff]",
                )}
              >
                <b
                  className={cn(
                    "block text-[11px] leading-none",
                    row.tone.includes("risk")
                      ? "text-[#df3c4b]"
                      : row.tone.includes("ok")
                        ? "text-[#079764]"
                        : row.tone.includes("gold")
                          ? "text-[#b07616]"
                          : "text-[#1470e8]",
                  )}
                >
                  {row.value}
                </b>
                <small className="text-[7px] font-semibold text-[#71809d]">{row.label}</small>
              </div>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-auto border-t border-[#e8eff7] px-2 pt-1.5 pb-2">
            <div className="mb-1 text-[9px] font-extrabold tracking-[0.12em] text-[#10275b] uppercase">Next action</div>
            <div className="rounded-[12px] bg-[#10275b] p-2.5 text-white shadow-[0_8px_18px_rgba(16,39,91,0.18)]">
              <b className="block text-[12px] leading-snug">{desk.nextAction}</b>
              <div className="mt-2 space-y-1 border-t border-white/15 pt-1.5 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <User weight="fill" className="size-3 text-[#7dfff0]" />
                  <span className="font-bold">{desk.officer}</span>
                </div>
                <div className="flex items-center gap-1.5 text-white/70">
                  <MapPin weight="fill" className="size-3 text-[#7dfff0]" />
                  {desk.zone} · {desk.ward}
                </div>
                <div
                  className="flex items-center gap-1.5 font-bold"
                  style={{ color: look.color === HEX.risk ? "#ff8a8a" : "#7dfff0" }}
                >
                  <Clock weight="fill" className="size-3" />
                  {desk.due}
                </div>
              </div>
            </div>
            {focus.kind === "exception" ? (
              <p className="mt-2 text-[10px] font-semibold text-[#df3c4b]">Potential exception for review — not confirmed leakage.</p>
            ) : null}
          </div>
        </article>
      </div>

      {/* Bottom: docs · activity · officer path */}
      <div className="grid shrink-0 grid-cols-[1fr_1.15fr_1fr] gap-1.5">
        <article className="overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <h3 className="text-[12px] font-extrabold text-[#10275b]">Documents</h3>
            <span className="text-[9px] font-extrabold text-[#1470e8]">{desk.docs.length}</span>
          </div>
          <ul className="px-1.5 pb-1.5">
            {desk.docs.slice(0, 4).map((doc, i) => {
              const isGap = doc.status === "gap";
              const isPending = doc.status === "pending";
              return (
                <Stagger key={doc.name} delay={16 + i * 16}>
                  <motion.li
                    className={cn(
                      "relative flex items-center gap-2 overflow-hidden rounded-[10px] px-1.5 py-1.5",
                      isGap && !reduce && "risk-gap-pulse risk-gap-flash",
                      isPending && !reduce && "wait-gap-pulse",
                    )}
                    animate={isGap && !reduce ? { scale: [1, 1.02, 1] } : undefined}
                    transition={isGap && !reduce ? { duration: 1.55, repeat: Infinity, ease: "easeInOut" } : undefined}
                  >
                    <motion.span
                      className={cn(
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[7px] font-extrabold uppercase",
                        doc.status === "ok" && "bg-[#14b879] text-white",
                        isGap && "bg-[#e53d50] text-white",
                        isPending && "bg-[#f5a313] text-white",
                      )}
                      animate={
                        isGap && !reduce
                          ? { boxShadow: ["0 0 0 0 rgba(229,61,80,0.55)", "0 0 0 5px rgba(229,61,80,0)", "0 0 0 0 rgba(229,61,80,0.55)"] }
                          : undefined
                      }
                      transition={isGap && !reduce ? { duration: 1.55, repeat: Infinity } : undefined}
                    >
                      {doc.status === "ok" ? "OK" : isGap ? "Gap" : "Pend"}
                    </motion.span>
                    <span className="min-w-0 flex-1">
                      <b className={cn("block truncate text-[9px]", isGap ? "text-[#df3c4b]" : "text-[#10275b]")}>{doc.name}</b>
                      <small className="block truncate font-mono text-[7px] text-[#8a9bb5]">{doc.ref}</small>
                    </span>
                  </motion.li>
                </Stagger>
              );
            })}
          </ul>
        </article>

        <article className="overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <h3 className="text-[12px] font-extrabold text-[#10275b]">Recent Activity</h3>
            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-[#1470e8]">
              View All
              <ArrowRight weight="bold" className="size-2.5" />
            </span>
          </div>
          <ul className="px-1.5 pb-1.5">
            {desk.activity.slice(0, 3).map((row, i) => (
              <Stagger key={row.line} delay={18 + i * 18}>
                <li className="grid grid-cols-[auto_1fr] gap-2 rounded-[10px] px-1.5 py-1.5">
                  <span className="font-mono text-[8px] font-bold text-[#1470e8]">{row.t.split(" · ")[0]}</span>
                  <span className="min-w-0">
                    <b className="block truncate text-[9px] text-[#10275b]">{row.line}</b>
                    <small className="block truncate text-[7.5px] text-[#7a8bab]">{row.by}</small>
                  </span>
                </li>
              </Stagger>
            ))}
          </ul>
        </article>

        <article className="overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1">
            <h3 className="text-[12px] font-extrabold text-[#10275b]">Officer Path</h3>
            {focus.kind !== "expected" ? (
              <span className="rounded-full bg-[#e53d50] px-1.5 py-0.5 text-[8px] font-extrabold text-white">Open</span>
            ) : (
              <span className="rounded-full bg-[#14b879] px-1.5 py-0.5 text-[8px] font-extrabold text-white">Closed</span>
            )}
          </div>
          <div className="px-2 pb-2">
            {focus.kind !== "expected" ? (
              <WorkflowStrip active={focus.flowAt} compact />
            ) : (
              <div className="rounded-[10px] bg-[#ebfaf4] px-2.5 py-2 text-[11px] font-bold text-[#079764]">
                No follow-up needed. File is closed.
              </div>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {desk.alerts.slice(0, 2).map((a) => (
                <span
                  key={a.label}
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[7px] font-extrabold",
                    a.tone === "ok" && "bg-[#ebfaf4] text-[#079764]",
                    a.tone === "wait" && "bg-[#fff6e5] text-[#b07616]",
                    a.tone === "bad" && "bg-[#fff0f1] text-[#df3c4b]",
                  )}
                >
                  {a.label.length > 32 ? `${a.label.slice(0, 30)}…` : a.label}
                </span>
              ))}
            </div>
          </div>
        </article>
      </div>

      {/* Live activity */}
      <div className="flex shrink-0 items-stretch overflow-hidden rounded-[14px] bg-white shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
        <div className="flex shrink-0 items-center gap-1.5 px-3 py-2 text-[10px] font-extrabold text-[#10275b]">
          <span className="size-2 rounded-full bg-[#14b879]" />
          Live Compare Feed
        </div>
        <div className="flex min-w-0 flex-1 items-stretch overflow-hidden">
          {desk.activity.slice(0, 3).map((row) => (
            <div key={row.line} className="relative min-w-0 flex-1 border-l border-[#edf2f7] px-2.5 py-1.5">
              <span className="absolute top-3 -left-[3.5px] size-1.5 rounded-full bg-[#14b879]" />
              <b className="block truncate text-[8px] text-[#10275b]">{row.line}</b>
              <small className="block truncate text-[7px] text-[#7384a1]">
                {row.by} · {row.t.split(" · ")[0]}
              </small>
            </div>
          ))}
          <div className="flex shrink-0 items-center px-2.5 text-[9px] font-extrabold text-[#1470e8]">View All →</div>
        </div>
      </div>
    </motion.div>
  );
}

function OpeningDesk({ reduce }: { reduce: boolean }) {
  const donutSize = 92;
  const donutStroke = 11;
  const donutR = (donutSize - donutStroke) / 2;
  const donutC = 2 * Math.PI * donutR;
  const donutGap = donutC * 0.012;
  let donutCursor = 0;
  const donutArcs = COMPARE_MIX.map((row) => {
    const sweep = (row.pct / 100) * donutC;
    const length = Math.max(sweep - donutGap, 1);
    const arc = { ...row, dash: `${length} ${donutC - length}`, offset: -donutCursor };
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
      <div className="flex shrink-0 flex-wrap items-center gap-1.5">
        <span className="mr-auto inline-flex items-center gap-1.5 rounded-[13px] bg-[#10275b] px-2.5 py-1.5 text-[10px] font-extrabold text-white shadow-[0_5px_18px_rgba(16,39,91,0.2)]">
          <SquaresFour weight="fill" className="size-3.5 text-[#7dfff0]" />
          Compare desk · Central Platform
        </span>
        <FilterChips />
        <LivePill reduce={reduce} />
      </div>

      <div className="grid shrink-0 grid-cols-6 gap-1.5">
        {COMPARE_OVERVIEW_KPIS.map((kpi, i) => (
          <Stagger key={kpi.label} delay={12 + i * 24}>
            <div className={cn("relative overflow-hidden rounded-[14px] px-2.5 py-2 shadow-[0_8px_20px_rgba(36,73,125,0.12)]", kpi.card)}>
              <MountainDecor />
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

      <div className="grid min-h-0 flex-1 grid-cols-[0.95fr_1.25fr_0.95fr] gap-1.5 overflow-hidden">
        <article className="flex min-h-0 flex-col overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="flex shrink-0 items-center justify-between px-2.5 pt-2 pb-1">
            <h3 className="text-[12px] font-extrabold text-[#10275b]">Case Queue</h3>
            <span className="text-[9px] font-extrabold text-[#1470e8]">View All →</span>
          </div>
          <ul className="min-h-0 flex-1 space-y-0.5 overflow-auto px-1.5 pb-2">
            {CASE_QUEUE.map((row, i) => (
              <Stagger key={row.id} delay={18 + i * 16}>
                <li
                  className={cn(
                    "flex items-center justify-between rounded-[10px] px-2 py-1.5 text-[10px]",
                    i === 0 ? "border-l-[3px] border-[#2380ff] bg-[#e9f3ff] font-extrabold text-[#0f58bf]" : "font-semibold text-[#425a7f]",
                  )}
                >
                  <span className="inline-flex min-w-0 items-center gap-2">
                    <span className="grid size-5 place-items-center rounded-md bg-[#10275b] font-mono text-[9px] text-white">
                      {row.letter}
                    </span>
                    <span className="truncate">{row.name}</span>
                  </span>
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[8px] font-extrabold", row.tone)}>{row.status}</span>
                </li>
              </Stagger>
            ))}
          </ul>
        </article>

        <article className="flex min-h-0 flex-col overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="px-3 pt-2.5 pb-1">
            <h3 className="text-[12px] font-extrabold text-[#10275b]">When project records do not match</h3>
            <p className="mt-1 text-[11px] leading-snug text-[#71809d]">
              Approval, registration, assessment, GPS, payment and remittance sit together.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {LOGIC.map((item, i) => (
              <Stagger key={item.label} delay={40 + i * 40}>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#edf6ff] px-2.5 py-1.5 text-[10px] font-bold text-[#10275b] ring-1 ring-[#d6e5f6]">
                  <span className="grid size-5 place-items-center rounded-full bg-[#10275b] text-[#7dfff0]">
                    <item.Icon weight="fill" className="size-3" />
                  </span>
                  {item.label}
                </span>
              </Stagger>
            ))}
          </div>
          <div className="mt-auto border-t border-[#e8eff7] bg-[#f7fbff] px-3 py-2.5">
            <div className="text-[8px] font-extrabold tracking-[0.14em] text-[#1470e8] uppercase">Next · Space</div>
            <p className="mt-1 text-[12px] font-semibold leading-snug text-[#10275b]">
              Project A opens a normal, paid desk. Then B–E show gaps for review.
            </p>
          </div>
        </article>

        <article className="flex min-h-0 flex-col overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="flex shrink-0 items-center justify-between px-2.5 pt-2 pb-1">
            <h3 className="text-[12px] font-extrabold text-[#10275b]">Case Mix</h3>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#f3f7fc] px-2 py-0.5 text-[8px] font-bold text-[#4a6288] ring-1 ring-[#d9e6f5]">
              This zone
              <CaretDown weight="bold" className="size-2.5 opacity-55" />
            </span>
          </div>
          <div className="flex items-center gap-3 px-2.5 pb-2.5 pt-0.5">
            <div className="relative grid size-[92px] shrink-0 place-items-center">
              <motion.svg
                width={donutSize}
                height={donutSize}
                viewBox={`0 0 ${donutSize} ${donutSize}`}
                className="relative -rotate-90"
                initial={reduce ? false : { opacity: 0.4, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }}
              >
                <circle cx={donutSize / 2} cy={donutSize / 2} r={donutR} fill="none" stroke="#e8eef6" strokeWidth={donutStroke} />
                {donutArcs.map((arc, i) => (
                  <motion.circle
                    key={arc.label}
                    cx={donutSize / 2}
                    cy={donutSize / 2}
                    r={donutR}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={donutStroke}
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
                  <b className="block text-[16px] leading-none tracking-tight text-[#10275b]">5</b>
                  <span className="mt-0.5 block text-[6.5px] font-extrabold tracking-[0.1em] text-[#7a8bab] uppercase">Cases</span>
                </div>
              </div>
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5">
              {COMPARE_MIX.map((row) => (
                <li key={row.label} className="min-w-0">
                  <div className="mb-0.5 flex items-center gap-1.5">
                    <span className="size-1.5 shrink-0 rounded-full" style={{ background: row.color }} />
                    <span className="min-w-0 flex-1 truncate text-[8px] font-semibold text-[#40587e]">{row.label}</span>
                    <b className="text-[9px] font-extrabold text-[#10275b]">{row.count}</b>
                  </div>
                  <div className="h-[3px] overflow-hidden rounded-full bg-[#eef3f9]">
                    <motion.i
                      className="block h-full rounded-full"
                      style={{ background: row.color }}
                      initial={reduce ? false : { width: 0 }}
                      animate={{ width: `${row.pct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </article>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-1.5">
        <article className="overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <h3 className="text-[12px] font-extrabold text-[#10275b]">Watch Points</h3>
            <span className="rounded-full bg-[#e53d50] px-1.5 py-0.5 text-[8px] font-extrabold text-white">{CHALLENGES.length}</span>
          </div>
          <ul className="px-2 pb-1.5">
            {CHALLENGES.map((row, i) => (
              <Stagger key={row.id} delay={20 + i * 18}>
                <li className="grid grid-cols-[26px_1fr] items-center gap-1.5 border-b border-[#edf2f8] py-1.5 last:border-0">
                  <span className="grid size-[26px] place-items-center rounded-[8px] bg-[#fff0f1] text-[#df3c4b]">
                    <row.Icon weight="fill" className="size-3" />
                  </span>
                  <span className="min-w-0">
                    <b className="block truncate text-[9px] text-[#10275b]">{row.title}</b>
                    <small className="block truncate text-[7px] text-[#71809d]">{row.body}</small>
                  </span>
                </li>
              </Stagger>
            ))}
          </ul>
        </article>

        <article className="overflow-hidden rounded-[14px] bg-white/96 shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
          <div className="flex items-center justify-between px-2.5 pt-2 pb-1">
            <h3 className="text-[12px] font-extrabold text-[#10275b]">Case Snapshot</h3>
            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-[#1470e8]">
              Space · Project A
              <CaretRight weight="bold" className="size-2.5" />
            </span>
          </div>
          <ul className="px-1.5 pb-1.5">
            {CASE_QUEUE.map((row, i) => (
              <Stagger key={row.id} delay={18 + i * 16}>
                <li className="flex items-center gap-2 rounded-[10px] px-1.5 py-1.5">
                  <span className="grid size-7 place-items-center rounded-[8px] bg-[#edf6ff] font-mono text-[10px] font-extrabold text-[#1470e8]">
                    {row.letter}
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-[9px] text-[#10275b]">{row.name}</b>
                    <small className="block truncate text-[7.5px] text-[#7a8bab]">{row.hint}</small>
                  </span>
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[7px] font-extrabold", row.tone)}>{row.status}</span>
                </li>
              </Stagger>
            ))}
          </ul>
        </article>
      </div>

      <div className="flex shrink-0 items-stretch overflow-hidden rounded-[14px] bg-white shadow-[0_8px_22px_rgba(36,73,125,0.1)] ring-1 ring-[#dce9f6]">
        <div className="flex shrink-0 items-center gap-1.5 px-3 py-2 text-[10px] font-extrabold text-[#10275b]">
          <span className="size-2 rounded-full bg-[#14b879]" />
          Live Compare Feed
        </div>
        <div className="flex min-w-0 flex-1 items-stretch overflow-hidden">
          {[
            { label: "Five case projects ready", detail: "Map pins A–E" },
            { label: "Sources held side by side", detail: "Seven records" },
            { label: "Gaps flagged for review", detail: "Not confirmed leakage" },
          ].map((row) => (
            <div key={row.label} className="relative min-w-0 flex-1 border-l border-[#edf2f7] px-2.5 py-1.5">
              <span className="absolute top-3 -left-[3.5px] size-1.5 rounded-full bg-[#14b879]" />
              <b className="block truncate text-[8px] text-[#10275b]">{row.label}</b>
              <small className="block truncate text-[7px] text-[#7384a1]">{row.detail}</small>
            </div>
          ))}
          <div className="flex shrink-0 items-center px-2.5 text-[9px] font-extrabold text-[#1470e8]">View All →</div>
        </div>
      </div>
    </motion.div>
  );
}

function WorkflowStrip({ active, compact, emphasize }: { active?: number; compact?: boolean; emphasize?: boolean }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", emphasize && "gap-2")}>
      {WORKFLOW.map((item, i) => {
        const on = active === undefined || i <= active;
        const current = active !== undefined && i === active;
        return (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            {i > 0 ? <span className="text-[10px] font-extrabold text-primary">→</span> : null}
            <Stagger delay={emphasize ? i * 70 : 0}>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 transition",
                  current
                    ? "bg-navy text-teal-bright ring-teal-bright/40"
                    : on
                      ? "bg-white text-navy ring-primary/20 shadow-sm"
                      : "bg-mist/50 text-muted-foreground ring-border",
                  compact && "px-2 py-0.5 text-[9px]",
                )}
              >
                <item.Icon weight="fill" className={cn("size-3.5", compact && "size-3")} />
                {item.label}
              </span>
            </Stagger>
          </span>
        );
      })}
    </div>
  );
}

function HaloText({
  x,
  y,
  children,
  fill = HEX.navy,
  size = 9,
}: {
  x: number | string;
  y: number | string;
  children: string;
  fill?: string;
  size?: number;
}) {
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontSize={size}
      fontWeight={600}
      stroke={HEX.paper}
      strokeWidth={2.6}
      paintOrder="stroke"
      style={{ fontFamily: "Ubuntu, ui-sans-serif, system-ui" }}
    >
      {children}
    </text>
  );
}

function CessPin({
  x,
  y,
  color,
  name,
  status,
  emphasis,
  tagged,
  delay = 0,
}: {
  x: number;
  y: number;
  color: string;
  name: string;
  status: string;
  emphasis?: boolean;
  tagged?: boolean;
  delay?: number;
}) {
  const plate = Math.min(92, status.length * 4.6 + 10);
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="18" fill={color} className="pin-ring" style={{ animationDelay: `${delay}ms` }} />
      <circle r="18" fill={color} className="pin-ring" style={{ animationDelay: `${delay + 700}ms` }} />
      <circle
        r={emphasis ? 22 : 14}
        fill={color}
        opacity={emphasis ? 0.22 : 0.12}
        className="pin-soft"
        style={{ animationDelay: `${delay}ms` }}
      />
      <g className="pin-bob" style={{ animationDelay: `${delay}ms` }}>
        <path
          d="M0-20c-7.1 0-12.8 5.6-12.8 13.2 0 9.6 12.8 22.4 12.8 22.4s12.8-12.8 12.8-22.4C12.8-14.4 7.1-20 0-20z"
          fill={color}
          stroke={HEX.paper}
          strokeWidth={emphasis ? 2.2 : 1.6}
        />
        <circle cy="-9.2" r="4.2" fill={HEX.paper} />
      </g>
      {tagged ? (
        <g>
          <rect x="14" y="-18" width={plate} height="15" rx="3.5" fill={HEX.paper} stroke={color} strokeWidth="1.3" />
          <rect x="14" y="-18" width="4" height="15" rx="1" fill={color} />
          <text x="22" y="-7" fill={HEX.navyInk} fontSize={7.5} fontWeight={800} style={{ fontFamily: "Ubuntu, ui-sans-serif, system-ui" }}>
            {status}
          </text>
        </g>
      ) : null}
      {emphasis ? (
        <HaloText x="14" y="10" fill={HEX.navyInk} size={8}>
          {name}
        </HaloText>
      ) : null}
    </g>
  );
}
