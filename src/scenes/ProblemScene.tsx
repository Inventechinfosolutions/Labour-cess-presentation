import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  Bank,
  Buildings,
  Camera,
  CaretRight,
  ClipboardText,
  CloudArrowUp,
  Database,
  Drop,
  Eye,
  FileText,
  Files,
  FolderSimple,
  Globe,
  HardHat,
  Lightning,
  LinkBreak,
  MagnifyingGlass,
  MapPin,
  MapTrifold,
  PencilSimple,
  Plugs,
  Scales,
  ShieldCheck,
  Sparkle,
  TreeStructure,
  WarningCircle,
  Wallet,
  X,
} from "@/lib/icons";
import { Reveal, Stagger } from "@/components/SlideKit";
import { ProblemStage } from "@/components/ProblemStage";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RFP_INTEGRATION_HINT, RFP_INTEGRATION_LABEL, RFP_SOURCE_GROUPS } from "@/lib/rfpSources";
import { HEX } from "@/lib/palette";
import { cn } from "@/lib/utils";
import problemStageBg from "@/assets/problem-stage-bg.png";
import matchStageBg from "@/assets/match-stage-bg.jpg";
import icon3dPaperPlane from "@/assets/icon-3d-paper-plane.png";
import icon3dBuilding from "@/assets/icon-3d-building.png";
import icon3dGovBuilding from "@/assets/icon-3d-gov-building.png";
import icon3dUlbBuilding from "@/assets/icon-3d-ulb-building.png";
import icon3dMapPin from "@/assets/icon-3d-map-pin.png";
import icon3dPipes from "@/assets/icon-3d-pipes.png";
import icon3dHardhat from "@/assets/icon-3d-hardhat.png";
import icon3dEnvelope from "@/assets/icon-3d-envelope.png";
import icon3dClock from "@/assets/icon-3d-clock.png";
import icon3dOfficer from "@/assets/icon-3d-officer.png";
import folderBlue from "@/assets/folder-blue.png";
import icon3dFile from "@/assets/icon-3d-file.png";
import icon3dEvidence from "@/assets/icon-3d-evidence.png";
import icon3dTarget from "@/assets/icon-3d-target.png";
import icon3dMismatch from "@/assets/icon-3d-mismatch.png";
import icon3dUsers from "@/assets/icon-3d-users.png";
import icon3dScales from "@/assets/icon-3d-scales.png";
import icon3dManyFiles from "@/assets/icon-3d-many-files.png";

/** Offices that hold pieces of the same project — shown as one left column. */
const SOURCES: {
  id: string;
  label: string;
  holds: string;
  Icon: CessIcon;
  icon3d: string;
  actionColor: string;
}[] = [
  { id: "bpa", label: "Building plan", holds: "Sanctions", Icon: FileText, icon3d: icon3dBuilding, actionColor: "#5BB8E8" },
  { id: "gov", label: "Departments", holds: "Project files", Icon: Bank, icon3d: icon3dGovBuilding, actionColor: "#3B7DD8" },
  { id: "ulb", label: "ULBs", holds: "Permits", Icon: Buildings, icon3d: icon3dUlbBuilding, actionColor: "#E8B84A" },
  { id: "plan", label: "Planning", holds: "Zoning", Icon: MapPin, icon3d: icon3dMapPin, actionColor: "#2F5FA8" },
  { id: "util", label: "Utilities", holds: "Connections", Icon: Drop, icon3d: icon3dPipes, actionColor: "#2FAA6A" },
  { id: "bld", label: "Builders", holds: "Returns", Icon: HardHat, icon3d: icon3dHardhat, actionColor: "#7B5CE8" },
];

/** One colour per source so FlowArrow streams match the left stamps. */
const SOURCE_FLOW_COLORS = [HEX.port1, HEX.port2, HEX.port3, HEX.port4, HEX.port5, HEX.port6] as const;

/** Same ABC example — used on every solution beat so the story stays one project. */
const ABC_PACKETS: {
  office: string;
  holds: string;
  nameOnFile: string;
  code: string;
  check: string;
  when: string;
  how: string;
  Icon: CessIcon;
}[] = [
  {
    office: "Building plan",
    holds: "Sanction details",
    nameOnFile: "ABC Commercial Complex",
    code: "BPA-2024-8812",
    check: "Sanction · 1,25,000 sq ft",
    when: "10:42 AM",
    how: "Direct link",
    Icon: FileText,
  },
  {
    office: "Departments",
    holds: "Project file extract",
    nameOnFile: "ABC Comm. Complex",
    code: "PWD-EST-3310",
    check: "Name · place present",
    when: "10:44 AM",
    how: "Dept exchange",
    Icon: Bank,
  },
  {
    office: "ULBs",
    holds: "Permit record",
    nameOnFile: "ABC Commercial · BBMP",
    code: "ULB-19/2025",
    check: "Permit linked",
    when: "10:47 AM",
    how: "Periodic feed",
    Icon: Buildings,
  },
  {
    office: "Planning",
    holds: "Zoning note",
    nameOnFile: "ABC site · East Zone",
    code: "ZONE-E-BBMP",
    check: "Territory path OK",
    when: "10:51 AM",
    how: "File transfer",
    Icon: MapPin,
  },
  {
    office: "Utilities",
    holds: "Connection status",
    nameOnFile: "ABC Commercial Complex",
    code: "UTIL-CONN-88",
    check: "Connections noted",
    when: "10:55 AM",
    how: "Message pass",
    Icon: Drop,
  },
  {
    office: "Builders",
    holds: "Self return",
    nameOnFile: "ABC Commercial",
    code: "RET-2025-014",
    check: "Return on file",
    when: "11:02 AM",
    how: "Officer entry",
    Icon: HardHat,
  },
];

const ABC_PROJECT = {
  name: "ABC Commercial Complex",
  id: "CESS-2025-000123",
  place: "East Zone · BBMP",
  category: "Commercial · G+10",
};

const RECEIVE_HOW: { label: string; Icon: CessIcon }[] = [
  { label: "Many offices", Icon: Buildings },
  { label: "Same project inbox", Icon: Database },
  { label: "Await Match", Icon: MagnifyingGlass },
];

/** Match beat — visual compare: different names, same work. */
const MATCH_PAIR = {
  field: "Project name",
  left: {
    office: "Building plan",
    name: "ABC Commercial Complex",
    code: "BPA-2024-8812",
    Icon: FileText,
  },
  right: {
    office: "ULB permit",
    name: "ABC Comm. · BBMP",
    code: "ULB-19/2025",
    Icon: Buildings,
  },
  result: "Same work · merge · no duplicate file",
};

const MATCH_HINTS: { label: string; detail: string; Icon: CessIcon; tone: string }[] = [
  { label: "Place / plot", detail: "East Zone · same plot", Icon: MapPin, tone: "bg-ok text-white" },
  { label: "Office codes", detail: "Linked on both sides", Icon: ClipboardText, tone: "bg-[#1a4e8a] text-white" },
  { label: "Match strength", detail: "High · same work", Icon: Sparkle, tone: "bg-gold text-gold-ink" },
];

/** Feature stamps on the site — plain Board language. */
const MATCH_FEATURES: { label: string; Icon: CessIcon }[] = [
  { label: "Same work detection", Icon: MagnifyingGlass },
  { label: "Suggested match", Icon: Sparkle },
  { label: "Side by side compare", Icon: Scales },
  { label: "Officer review", Icon: PencilSimple },
];

/** Full-colour 3D icon stamp — solid fill + hard rim + top sheen. */
const stamp3d =
  "relative overflow-hidden shadow-[0_3px_0_0_rgba(7,20,51,0.28),0_8px_14px_rgba(7,20,51,0.18)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[45%] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.38),transparent)] before:content-['']";
const stamp3dRound = `${stamp3d} before:rounded-t-full`;
const stamp3dBox = `${stamp3d} before:rounded-t-md`;
const stamp3dXl = `${stamp3d} before:rounded-t-xl`;

/** Key matching factors on the desk plaque — solid colour stamps. */
const MATCH_FACTORS: { label: string; detail: string; Icon: CessIcon; tone: string }[] = [
  { label: "Name variants", detail: "ABC Commercial · ABC Comm.", Icon: MagnifyingGlass, tone: "bg-gold text-gold-ink" },
  { label: "Place / plot", detail: "East Zone · same plot", Icon: MapPin, tone: "bg-ok text-white" },
  { label: "Reject near miss", detail: "XYZ Towers · Whitefield", Icon: FileText, tone: "bg-risk text-white" },
  { label: "Office codes", detail: "Linked on both sides", Icon: Buildings, tone: "bg-[#1a4e8a] text-white" },
  { label: "Officer merges", detail: "High confidence", Icon: ShieldCheck, tone: "bg-teal text-white" },
  { label: "Document type", detail: "Plan + Permit", Icon: ClipboardText, tone: "bg-navy text-teal-bright" },
];

/** One clear reject — not every similar name is the same work. */
const MATCH_REJECT = {
  office: "Nearby site",
  name: "XYZ Towers · Whitefield",
  reason: "Different plot · not merged",
  Icon: LinkBreak,
};

/** Gemini-style field scan rows — A → B then Matched → Validate. */
const MATCH_SCAN_ROWS: { field: string; a: string; b: string }[] = [
  { field: "Project name", a: "ABC Commercial Complex", b: "ABC Comm. · BBMP" },
  { field: "Place / plot", a: "East Zone · same plot", b: "East Zone · same plot" },
  { field: "Office source", a: "Building plan", b: "ULB permit" },
  { field: "File code", a: "BPA-2024-8812", b: "ULB-19/2025" },
  { field: "Territory", a: "East Zone · BBMP", b: "East Zone · BBMP" },
  { field: "Match strength", a: "High · same work", b: "High · same work" },
  { field: "Nearby reject", a: "XYZ Towers · out", b: "XYZ Towers · out" },
  { field: "Outcome", a: "Merge · no duplicate", b: "Merge · no duplicate" },
];

const MATCH_FOOT_CHIPS: { label: string; Icon: CessIcon; tone: string }[] = [
  { label: "Name variants", Icon: MagnifyingGlass, tone: "bg-gold text-gold-ink" },
  { label: "Same plot", Icon: MapPin, tone: "bg-ok text-white" },
  { label: "Office codes", Icon: Buildings, tone: "bg-[#1a4e8a] text-white" },
  { label: "Officer merge", Icon: ShieldCheck, tone: "bg-teal text-white" },
  { label: "Near miss out", Icon: LinkBreak, tone: "bg-risk text-white" },
  { label: "One file", Icon: Files, tone: "bg-navy text-teal-bright" },
];

/** Process beat — office raw labels → one Board format. */
const PROCESS_ROWS: { field: string; raw: string; clean: string }[] = [
  { field: "Project name", raw: "ABC Comm. / ABC Complex", clean: "ABC Commercial Complex" },
  { field: "Place / plot", raw: "East Zone · plot notes", clean: "East Zone · BBMP" },
  { field: "Sanction", raw: "Plan file · mixed ID", clean: "Sanction linked" },
  { field: "Permit", raw: "ULB permit scan", clean: "Permit linked" },
  { field: "Builder return", raw: "Return sheet · loose", clean: "Returns locked" },
  { field: "Source mark", raw: "From which office?", clean: "Source kept" },
];

const PROCESS_FOOT_CHIPS: { label: string; Icon: CessIcon; tone: string }[] = [
  { label: "One format", Icon: Sparkle, tone: "bg-teal text-white" },
  { label: "Send again if fail", Icon: CloudArrowUp, tone: "bg-[#1476e8] text-white" },
  { label: "Exchange record", Icon: ClipboardText, tone: "bg-[#1a4e8a] text-white" },
  { label: "Source kept", Icon: MapPin, tone: "bg-ok text-white" },
  { label: "Officer check", Icon: ShieldCheck, tone: "bg-gold text-gold-ink" },
  { label: "Ready for file", Icon: FolderSimple, tone: "bg-navy text-teal-bright" },
];

/** One project beat — Board file forms with one Project ID. */
const ONE_FILE_ROWS: { field: string; value: string }[] = [
  { field: "Project name", value: "ABC Commercial Complex" },
  { field: "Project ID", value: "CESS-2025-000123" },
  { field: "Category", value: "Commercial · G+10" },
  { field: "Territory", value: "East Zone · BBMP" },
  { field: "Sanctioned area", value: "1,25,000 sq ft" },
  { field: "Sources on file", value: "Six offices marked" },
];

const ONE_FOOT_CHIPS: { label: string; Icon: CessIcon; tone: string }[] = [
  { label: "Sources on file", Icon: Buildings, tone: "bg-[#1a4e8a] text-white" },
  { label: "Details checked", Icon: Scales, tone: "bg-teal text-white" },
  { label: "One Project ID", Icon: ShieldCheck, tone: "bg-ok text-white" },
  { label: "Ready to assess", Icon: ClipboardText, tone: "bg-gold text-gold-ink" },
  { label: "No duplicate", Icon: LinkBreak, tone: "bg-[#c45c26] text-white" },
  { label: "Board file", Icon: FolderSimple, tone: "bg-navy text-teal-bright" },
];

/** Central Platform beat — Board place that holds the one project file. */
const CENTRAL_HOLD_ROWS: { field: string; value: string }[] = [
  { field: "Project on platform", value: "ABC Commercial Complex" },
  { field: "Project ID", value: "CESS-2025-000123" },
  { field: "Territory", value: "East Zone · BBMP" },
  { field: "File status", value: "Ready for Board work" },
  { field: "Sources held", value: "Six offices on file" },
  { field: "Next Board step", value: "CESS assessment" },
];

const CENTRAL_NEXT_STEPS: { label: string; detail: string; Icon: CessIcon }[] = [
  { label: "Assign", detail: "Officer takes the file", Icon: PencilSimple },
  { label: "Assess", detail: "Compute Labour CESS", Icon: Scales },
  { label: "Estimate", detail: "Draft CESS figure", Icon: ClipboardText },
  { label: "Demand", detail: "Raise Board demand", Icon: Wallet },
  { label: "Status", detail: "Track on one file", Icon: Eye },
];

const CENTRAL_FOOT_CHIPS: { label: string; Icon: CessIcon; tone: string }[] = [
  { label: "One Board place", Icon: Database, tone: "bg-[#1a4e8a] text-white" },
  { label: "Holds project file", Icon: FolderSimple, tone: "bg-ok text-white" },
  { label: "Ready to assess", Icon: Scales, tone: "bg-teal text-white" },
  { label: "Demand ready", Icon: ClipboardText, tone: "bg-gold text-gold-ink" },
  { label: "Full record", Icon: FileText, tone: "bg-navy text-teal-bright" },
  { label: "Officer work", Icon: ShieldCheck, tone: "bg-[#c45c26] text-white" },
];

/** Check beat — visual compare: one clear fail + other passes. */
const CHECK_CLASH = {
  field: "Sanctioned area",
  left: { office: "Building plan", value: "1,25,000 sq ft", Icon: FileText },
  right: { office: "Builder return", value: "98,000 sq ft", Icon: HardHat },
  flag: "Area does not agree · potential exception",
};

const CHECK_PASS: { label: string; detail: string; Icon: CessIcon; tone: string }[] = [
  { label: "Name & place", detail: "Present", Icon: ClipboardText, tone: "bg-ok text-white" },
  { label: "Territory path", detail: "East Zone · BBMP", Icon: MapPin, tone: "bg-[#1a4e8a] text-white" },
  { label: "Permit linked", detail: "Same plot", Icon: Buildings, tone: "bg-teal text-white" },
];

const CHECK_FEATURES: { label: string; Icon: CessIcon }[] = [
  { label: "Compare fields", Icon: Scales },
  { label: "Flag what fails", Icon: WarningCircle },
  { label: "Passes stay clear", Icon: ShieldCheck },
  { label: "Officer confirms", Icon: PencilSimple },
];

const CHECK_FACTORS: { label: string; detail: string; Icon: CessIcon; tone: string }[] = [
  { label: "Sanctioned area", detail: "1,25,000 vs 98,000", Icon: Scales, tone: "bg-risk text-white" },
  { label: "Name & place", detail: "Present on both", Icon: ClipboardText, tone: "bg-ok text-white" },
  { label: "Territory path", detail: "East Zone · BBMP", Icon: MapPin, tone: "bg-[#1a4e8a] text-white" },
  { label: "Permit linked", detail: "Same plot", Icon: Buildings, tone: "bg-teal text-white" },
  { label: "Officer next", detail: "Confirm exception", Icon: PencilSimple, tone: "bg-[#c45c26] text-white" },
  { label: "Other fields", detail: "Pass · no flag", Icon: ShieldCheck, tone: "bg-gold text-gold-ink" },
];

/** How the check runs — shown as a thin step chain under the clash. */
const CHECK_HOW: { label: string; Icon: CessIcon }[] = [
  { label: "Compare fields", Icon: MagnifyingGlass },
  { label: "Flag the fail", Icon: WarningCircle },
  { label: "Show what passes", Icon: ShieldCheck },
  { label: "Officer confirms", Icon: PencilSimple },
];

/** What the Board loses when there is no common file. */
const IMPACTS: { label: string; Icon: CessIcon }[] = [
  { label: "Demand not clear", Icon: ClipboardText },
  { label: "Money late", Icon: Wallet },
  { label: "Less for welfare", Icon: Eye },
  { label: "Hard to check site", Icon: Camera },
];

const WATCH_ISSUES: { label: string; Icon: CessIcon }[] = [
  { label: "Different names", Icon: Buildings },
  { label: "Details disagree", Icon: LinkBreak },
  { label: "Scans hard to search", Icon: FolderSimple },
  { label: "Unclear who changed what", Icon: ClipboardText },
];

const PROBLEM_KEY = [
  { label: "Many files", Icon: LinkBreak },
  { label: "Duplicates", Icon: Plugs },
  { label: "Wrong details", Icon: Scales },
  { label: "Hard to see", Icon: Eye },
  { label: "Slow action", Icon: Lightning },
] as const;

const SOLUTION_KEY = [
  { label: "Different sources", Icon: Buildings },
  { label: "Match", Icon: TreeStructure },
  { label: "Process", Icon: Sparkle },
  { label: "One project file", Icon: FolderSimple },
  { label: "Central Platform", Icon: Database },
] as const;

const PROTOCOLS: {
  label: string;
  support: string;
  Icon: CessIcon;
  icon3d: string;
  accent: string;
  soft: string;
  face: string;
  ring: string;
}[] = [
  {
    label: "Direct link",
    support: "Live details from source offices.",
    Icon: Globe,
    icon3d: icon3dPaperPlane,
    accent: "#0e9aa7",
    soft: "rgba(20,196,212,0.28)",
    face: "linear-gradient(145deg,#f2fcfe 0%,#d9f5fa 48%,#c5eef6 100%)",
    ring: "rgba(14,154,167,0.28)",
  },
  {
    label: "Dept exchange",
    support: "Department to platform exchange.",
    Icon: Plugs,
    icon3d: icon3dBuilding,
    accent: "#1476e8",
    soft: "rgba(20,118,232,0.24)",
    face: "linear-gradient(145deg,#f3f8ff 0%,#ddeeff 48%,#c8e2ff 100%)",
    ring: "rgba(20,118,232,0.26)",
  },
  {
    label: "File transfer",
    support: "Upload files and documents.",
    Icon: Files,
    icon3d: folderBlue,
    accent: "#0e8a72",
    soft: "rgba(14,138,114,0.22)",
    face: "linear-gradient(145deg,#f1fbf7 0%,#d8f3ea 48%,#c0ebe0 100%)",
    ring: "rgba(14,138,114,0.26)",
  },
  {
    label: "Message pass",
    support: "Message pass with checks.",
    Icon: Lightning,
    icon3d: icon3dEnvelope,
    accent: "#c4962e",
    soft: "rgba(240,193,74,0.28)",
    face: "linear-gradient(145deg,#fffdf6 0%,#fff3d6 48%,#ffe9b8 100%)",
    ring: "rgba(196,150,46,0.28)",
  },
  {
    label: "Periodic feed",
    support: "Scheduled periodic imports.",
    Icon: CloudArrowUp,
    icon3d: icon3dClock,
    accent: "#7c3aed",
    soft: "rgba(124,58,237,0.22)",
    face: "linear-gradient(145deg,#f8f3ff 0%,#eadfff 48%,#dcc9ff 100%)",
    ring: "rgba(124,58,237,0.26)",
  },
  {
    label: "Officer entry",
    support: "Officer entry with checks.",
    Icon: PencilSimple,
    icon3d: icon3dOfficer,
    accent: "#1a4e8a",
    soft: "rgba(26,78,138,0.2)",
    face: "linear-gradient(145deg,#f3f7fc 0%,#e0eaf6 48%,#cddcef 100%)",
    ring: "rgba(26,78,138,0.24)",
  },
];

const DETAIL_ICONS_3D: Record<string, string> = {
  Role: icon3dFile,
  Retry: icon3dPaperPlane,
  "Exchange record": icon3dEvidence,
  "Source mark": icon3dTarget,
  "Conflict handling": icon3dMismatch,
  "Who uses it": icon3dUsers,
  Coverage: icon3dBuilding,
  RFP: icon3dScales,
};

type HubTone = {
  plaque: string;
  ring: string;
  iconWrap: string;
  iconText: string;
  accent: string;
  soft: string;
  dot: string;
  point: string;
  line: string;
  glow: string;
};

type HubStep = {
  id: string;
  rail: string;
  hub: string;
  sub: string;
  Icon: CessIcon;
  points: string[];
  /** Ultra detail rows shown on the hub plaque */
  fields: readonly (readonly [string, string])[];
  tone: HubTone;
  ok?: boolean;
};

/** Soft colour accents per step — pleasant, still distinct. */
const HUB_BY_BEAT: HubStep[] = [
  {
    id: "middleware",
    rail: "Smart Middleware",
    hub: "Smart Middleware",
    sub: "Linking layer we will build · M06",
    Icon: Plugs,
    points: ["One format", "Send again if fail", "Full exchange record", "Where each detail came from"],
    fields: [
      ["Role", "Bring details into one format"],
      ["Retry", "Send again if a transfer fails"],
      ["Exchange record", "Kept in full for audit"],
      ["Source mark", "Where each detail came from"],
      ["Conflict handling", "Shown to authorised officers"],
      ["Who uses it", "Central Platform intake"],
      ["Coverage", "Departments · ULBs · builders"],
      ["RFP", "M06 · Smart Middleware"],
    ],
    tone: {
      plaque: "bg-white text-navy",
      ring: "ring-teal/35",
      iconWrap: "bg-teal text-navy-deep",
      iconText: "text-teal",
      accent: "text-teal",
      soft: "bg-accent",
      dot: "bg-teal",
      point: "text-navy",
      line: "#0e9aa7",
      glow: "rgba(14,154,167,0.12)",
    },
  },
  {
    id: "receive",
    rail: "Receiving",
    hub: "Central Platform",
    sub: "Same project · many offices in",
    Icon: Database,
    points: ["Six offices in", "Each packet noted", "Same project inbox", "Await Match"],
    fields: [
      ["Project", "ABC Commercial Complex"],
      ["Offices in", "Six offices · same ABC work"],
      ["What arrived", "Sanction · permits · returns"],
      ["Status", "All received · still separate"],
      ["Next", "Match · then Check · one file"],
    ],
    tone: {
      plaque: "bg-white text-navy",
      ring: "ring-[#5b9bd5]/40",
      iconWrap: "bg-[#1a4e8a] text-white",
      iconText: "text-[#1a4e8a]",
      accent: "text-[#1a4e8a]",
      soft: "bg-[#e8f1fa]",
      dot: "bg-[#5b9bd5]",
      point: "text-navy",
      line: "#5b9bd5",
      glow: "rgba(91,155,213,0.12)",
    },
  },
  {
    id: "match",
    rail: "Match",
    hub: "Match",
    sub: "Different names · same work?",
    Icon: TreeStructure,
    points: ["Name variants", "Place / plot", "Reject near miss", "Officer merges"],
    fields: [
      ["Candidate A", "ABC Commercial Complex"],
      ["Candidate B", "ABC Comm. · BBMP"],
      ["Place / plot", "East Zone · same plot"],
      ["Nearby reject", "XYZ Towers · not merged"],
      ["Match strength", "High · same work"],
      ["Outcome", "Merge · no duplicate file"],
    ],
    tone: {
      plaque: "bg-white text-navy",
      ring: "ring-gold/45",
      iconWrap: "bg-gold text-gold-ink",
      iconText: "text-gold-deep",
      accent: "text-gold-deep",
      soft: "bg-gold-soft",
      dot: "bg-gold",
      point: "text-navy",
      line: "#f0c14a",
      glow: "rgba(240,193,74,0.14)",
    },
  },
  {
    id: "check",
    rail: "Check",
    hub: "Check",
    sub: "Compare offices · flag what fails",
    Icon: Scales,
    points: ["Compare", "Flag fail", "Passes clear", "Officer confirms"],
    fields: [
      ["Field", "Sanctioned area"],
      ["Building plan", "1,25,000 sq ft"],
      ["Builder return", "98,000 sq ft"],
      ["Result", "Fail · potential exception"],
      ["Also pass", "Name · place · permit"],
      ["Next", "Officer confirms · then one file"],
    ],
    tone: {
      plaque: "bg-white text-navy",
      ring: "ring-[#f0a06a]/40",
      iconWrap: "bg-[#c45c26] text-white",
      iconText: "text-[#c45c26]",
      accent: "text-[#c45c26]",
      soft: "bg-[#fdf3ec]",
      dot: "bg-[#f0a06a]",
      point: "text-navy",
      line: "#f0a06a",
      glow: "rgba(240,160,106,0.12)",
    },
  },
  {
    id: "one",
    rail: "One file",
    hub: "One project file",
    sub: "One Project ID for all later work",
    Icon: ShieldCheck,
    ok: true,
    points: ["Sources on file", "Details checked", "One Project ID", "Ready to assess"],
    fields: [
      ["Project name", "ABC Commercial Complex"],
      ["Project ID", "CESS-2025-000123"],
      ["Category", "Commercial · G+10"],
      ["Territory", "East Zone · BBMP"],
      ["Sanctioned area", "1,25,000 sq ft"],
      ["Sources on file", "Six offices marked"],
      ["File status", "Ready for CESS assessment"],
    ],
    tone: {
      plaque: "bg-white text-navy",
      ring: "ring-ok/40",
      iconWrap: "bg-ok text-white",
      iconText: "text-ok",
      accent: "text-ok",
      soft: "bg-ok-soft",
      dot: "bg-ok",
      point: "text-navy",
      line: "#0e8a72",
      glow: "rgba(14,138,114,0.14)",
    },
  },
];

const ONE_UNLOCK = ["Assign", "Assess", "Estimate", "Demand", "Status"] as const;

const SPACE_HINTS = [
  "Space · First solution",
  "Space · Match & Validate",
  "Space · Process",
  "Space · One project",
  "Space · Central Platform",
  "Space · Next",
] as const;

/** Absolute title + supporting line — one short idea per beat. */
const BEAT_HEAD: readonly { kicker: string; title: string; support: string }[] = [
  {
    kicker: "Government of Karnataka · Labour CESS",
    title: "Problem Statement",
    support: "One project. Many separate files. No common file for the Board.",
  },
  {
    kicker: "First solution",
    title: "Smart Middleware",
    support: "We bring office details into one format for the Board.",
  },
  {
    kicker: "First solution · Match & Validate",
    title: "Match Project Information",
    support: "Different names. Same plot. Merge into one file.",
  },
  {
    kicker: "First solution · Process",
    title: "Process into One Format",
    support: "Office details become one clear Board form.",
  },
  {
    kicker: "First solution · One project",
    title: "One Project File",
    support: "One Project ID. The Board file begins to form.",
  },
  {
    kicker: "First solution · Central Platform",
    title: "Central Platform",
    support: "The Board place that holds the one project file.",
  },
];

/** Beats 1–5: Middleware journey only (Match · Process · One project · Central Platform). */
function hubIndex(beat: number) {
  if (beat < 1) return -1;
  return 0;
}

export function ProblemScene({ beat }: { beat: number; onBeat?: (n: number) => void }) {
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const reduce = useReducedMotion();
  const solving = beat >= 1;
  const hi = hubIndex(beat);
  const hub = hi >= 0 ? HUB_BY_BEAT[hi] : null;
  const journeyUnlock = Math.max(0, Math.min(4, beat - 1));
  const showSolutionKey = beat >= 5;
  const spaceHint = SPACE_HINTS[Math.min(beat, SPACE_HINTS.length - 1)] ?? null;
  const head = BEAT_HEAD[Math.min(beat, BEAT_HEAD.length - 1)];
  const matchTheme = hub?.id === "middleware" && journeyUnlock === 1;
  const processTheme = hub?.id === "middleware" && journeyUnlock === 2;
  const oneTheme = hub?.id === "middleware" && journeyUnlock === 3;
  const centralTheme = hub?.id === "middleware" && journeyUnlock === 4;
  const headChip =
    journeyUnlock === 2
      ? "First solution — one clear format"
      : journeyUnlock === 3
        ? "First solution — one project file"
        : journeyUnlock === 4
          ? "First solution — on Central Platform"
          : "First solution — one project file";

  /* Problem beat — full-bleed stage (solution layout from beat 1). */
  if (!solving) {
    return (
      <div className="grid h-full min-h-0 grid-rows-[1fr] gap-2">
        <ProblemStage beat={beat} />
      </div>
    );
  }

  return (
    <div className="grid h-full min-h-0 grid-rows-[1fr_auto] gap-2">
      <div className="relative min-h-0 overflow-hidden rounded-2xl p-2 shadow-[0_12px_36px_rgba(7,20,51,0.1)] ring-1 ring-navy/8">
        {/* Same city / mist stage as Problem Statement */}
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

        <Dialog open={sourcesOpen} onOpenChange={setSourcesOpen}>
          <DialogContent
            className="flex max-h-[min(80vh,720px)] w-[min(720px,92vw)] flex-col gap-0 overflow-hidden bg-card p-0 text-navy"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border bg-navy px-4 py-3 text-white">
              <div className="min-w-0">
                <DialogTitle className="font-display text-[17px] font-bold leading-tight text-white">
                  Applications to be linked (RFP)
                </DialogTitle>
                <p className="mt-1 text-[11px] leading-snug text-white/70">
                  {RFP_INTEGRATION_HINT}. Count:{" "}
                  <span className="font-extrabold text-teal-bright">{RFP_INTEGRATION_LABEL}</span>.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSourcesOpen(false)}
                className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-white hover:bg-white/15"
              >
                <X weight="bold" className="size-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-auto px-4 py-3">
              {RFP_SOURCE_GROUPS.filter((g) => g.id === "annexure-a" || g.id === "annexure-b" || g.id === "board").map(
                (group) => (
                  <section key={group.id} className="rounded-2xl border border-border bg-mist/40 p-3">
                    <div className="text-[10px] font-extrabold tracking-[0.14em] text-primary uppercase">{group.title}</div>
                    <ul className="mt-2 columns-1 gap-x-4 sm:columns-2">
                      {group.items.map((item) => (
                        <li key={item} className="mb-1 break-inside-avoid text-[11px] leading-snug text-navy">
                          <span className="mr-1.5 inline-block size-1 rounded-full bg-primary align-middle" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                ),
              )}
            </div>
            <footer className="border-t border-border bg-mist/50 px-4 py-2.5 text-[10px] text-muted-foreground">
              RFP — Labour CESS Tracking &amp; Monitoring System · Annexures A &amp; B · M06
            </footer>
          </DialogContent>
        </Dialog>

        {/* Slide-1 style: title inside the stage */}
        <div className="relative z-10 grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2.5">
          <div className="flex flex-wrap items-start justify-between gap-3 px-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${head.title}-${matchTheme ? "gold" : processTheme ? "process" : oneTheme ? "one" : centralTheme ? "central" : "teal"}`}
                className="min-w-0"
                initial={reduce ? false : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: 6 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={cn(
                    "text-[10px] font-bold tracking-[0.16em] uppercase whitespace-nowrap",
                    matchTheme
                      ? "text-gold-deep"
                      : processTheme
                        ? "text-teal"
                        : oneTheme
                          ? "text-ok"
                          : centralTheme
                            ? "text-[#1a4e8a]"
                            : "text-primary",
                  )}
                >
                  {head.kicker}
                </div>
                <h1
                  className={cn(
                    "mt-1 font-display text-[22px] leading-tight font-extrabold tracking-tight",
                    matchTheme
                      ? "text-gold-deep"
                      : oneTheme
                        ? "text-ok"
                        : centralTheme
                          ? "text-[#1a4e8a]"
                          : "text-navy",
                  )}
                >
                  {head.title}
                </h1>
                <p
                  className={cn(
                    "mt-1.5 max-w-[28rem] text-[12px] font-semibold",
                    matchTheme ? "text-navy/70" : "text-muted-foreground",
                  )}
                >
                  {head.support}
                </p>
                <div
                  className={cn(
                    "mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-navy ring-1",
                    matchTheme
                      ? "bg-gold-soft ring-gold/40"
                      : oneTheme
                        ? "bg-ok-soft ring-ok/35"
                        : centralTheme
                          ? "bg-[#e8f1fa] ring-[#5b9bd5]/40"
                          : processTheme
                            ? "bg-accent ring-teal/35"
                            : "bg-accent ring-teal/25",
                  )}
                >
                  <ShieldCheck
                    weight="fill"
                    className={cn(
                      "size-3.5",
                      matchTheme
                        ? "text-gold-deep"
                        : oneTheme
                          ? "text-ok"
                          : centralTheme
                            ? "text-[#1a4e8a]"
                            : "text-teal",
                    )}
                  />
                  {headChip}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex shrink-0 flex-col items-end gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSourcesOpen(true)}
                  title="Applications listed for linking (RFP)"
                  className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-[11px] font-extrabold tracking-wide text-teal-bright uppercase shadow-[0_6px_16px_rgba(11,31,74,0.28)] ring-2 ring-teal/40 transition hover:bg-navy-deep"
                >
                  <Plugs weight="fill" className="size-3.5" />
                  {RFP_INTEGRATION_LABEL} applications
                </button>
                {spaceHint ? (
                  <span className="rounded-full bg-white px-2.5 py-1 text-[9px] font-extrabold text-navy shadow-sm ring-1 ring-navy/10">
                    {spaceHint}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {hub?.id === "middleware" ? (
            <MiddlewareLinkedStage reduce={!!reduce} journeyUnlock={journeyUnlock} hub={hub} />
          ) : null}
        </div>
      </div>

      <StoryFooter
        beat={beat}
        solving={solving}
        showProblemKey={false}
        showSolutionKey={showSolutionKey}
      />
    </div>
  );
}

/** Left flow + right plaque with a glowing thread that carries details across. */
function MiddlewareLinkedStage({
  reduce,
  journeyUnlock,
  hub,
}: {
  reduce: boolean;
  journeyUnlock: number;
  hub: HubStep;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const inRef = useRef<HTMLDivElement>(null);
  const [thread, setThread] = useState<{ d: string; w: number; h: number } | null>(null);
  const [receiveTick, setReceiveTick] = useState(0);
  const [hubAlignTop, setHubAlignTop] = useState<number | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const sync = () => {
      const outEl = outRef.current;
      const inEl = inRef.current;
      if (!outEl || !inEl) return;
      const wr = wrap.getBoundingClientRect();
      const o = outEl.getBoundingClientRect();
      const n = inEl.getBoundingClientRect();
      if (wr.width < 8 || wr.height < 8) return;

      // Align the hub rail to IN — measure against the rail's positioned parent (stage),
      // not the exit-dot's parent (which is the hub card itself).
      const rail = (outEl.closest("[data-hub-rail]") as HTMLElement | null) ?? outEl;
      const stage = rail.offsetParent as HTMLElement | null;
      if (stage) {
        const sr = stage.getBoundingClientRect();
        const nextTop = n.top + n.height / 2 - sr.top;
        setHubAlignTop((prev) => (prev != null && Math.abs(prev - nextTop) < 0.5 ? prev : nextTop));
      }

      // Horizontal bridge at IN height — from hub exit to IN entrance
      const y = n.top + n.height / 2 - wr.top;
      const x1 = o.right - wr.left;
      const x2 = n.left - wr.left;
      if (x2 - x1 < 8) return;
      const d = `M ${x1} ${y} L ${x2} ${y}`;
      setThread({ d, w: wr.width, h: wr.height });
    };

    const ro = new ResizeObserver(sync);
    ro.observe(wrap);
    if (inRef.current) ro.observe(inRef.current);
    if (outRef.current) ro.observe(outRef.current);
    const timers = [40, 120, 280, 600].map((ms) => window.setTimeout(sync, ms));
    const raf = requestAnimationFrame(sync);
    window.addEventListener("resize", sync);
    return () => {
      ro.disconnect();
      timers.forEach((id) => window.clearTimeout(id));
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", sync);
    };
  }, [journeyUnlock]);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setReceiveTick((n) => n + 1), 1300);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <div
      ref={wrapRef}
      className="relative grid min-h-0 grid-cols-[minmax(0,1.2fr)_minmax(340px,1.05fr)] gap-12"
    >
      <MiddlewareFlowStage
        reduce={reduce}
        journeyUnlock={journeyUnlock}
        bridgeOutRef={outRef}
        hubAlignTop={hubAlignTop}
      />

      {/* Thread: Into Platform → right plaque */}
      {thread ? (
        <svg
          className="pointer-events-none absolute inset-0 z-[5] overflow-visible"
          width={thread.w}
          height={thread.h}
          viewBox={`0 0 ${thread.w} ${thread.h}`}
          aria-hidden
        >
          <defs>
            <linearGradient id="mw-bridge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1476e8" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#14c4d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#0e9aa7" stopOpacity="0.95" />
            </linearGradient>
            <filter id="mw-bridge-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d={thread.d} fill="none" stroke="rgba(20,118,232,0.12)" strokeWidth="14" strokeLinecap="round" />
          <path
            d={thread.d}
            fill="none"
            stroke="url(#mw-bridge-grad)"
            strokeWidth="3.2"
            strokeLinecap="round"
            filter="url(#mw-bridge-glow)"
            opacity="0.95"
          />
          {!reduce ? (
            <path
              d={thread.d}
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="7 16"
              opacity="0.85"
            >
              <animate attributeName="stroke-dashoffset" from="0" to="-23" dur="1.1s" repeatCount="indefinite" />
            </path>
          ) : null}
        </svg>
      ) : null}

      {!reduce && thread
        ? [0, 1, 2].map((n) => (
            <motion.span
              key={`bridge-pkt-${n}`}
              className="pointer-events-none absolute top-0 left-0 z-[6] grid place-items-center text-[#1476e8] drop-shadow-[0_2px_6px_rgba(20,118,232,0.45)]"
              style={{
                offsetPath: `path('${thread.d}')`,
                offsetRotate: "0deg",
                offsetAnchor: "center",
              }}
              initial={{ offsetDistance: "0%", opacity: 0, scale: 0.6 }}
              animate={{
                offsetDistance: ["0%", "100%"],
                opacity: [0, 1, 1, 0],
                scale: [0.6, 1.05, 1, 0.7],
              }}
              transition={{
                duration: 1.85,
                repeat: Infinity,
                ease: "easeIn",
                delay: 0.2 + n * 0.55,
                times: [0, 0.12, 0.82, 1],
              }}
              aria-hidden
            >
              <FileText weight="fill" className="size-3.5" />
            </motion.span>
          ))
        : null}

      <AnimatePresence mode="wait">
        <motion.div
          key="middleware-plaque"
          initial={reduce ? false : { opacity: 0, x: 18, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, x: -8 }}
          transition={{ type: "spring", stiffness: 320, damping: 26, delay: reduce ? 0 : 0.12 }}
          className="relative z-10 h-full min-h-0"
        >
          <MiddlewarePlaque
            hub={hub}
            reduce={reduce}
            intakeRef={inRef}
            receiveTick={receiveTick}
            journeyUnlock={journeyUnlock}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** 1.png left stage — offices send details into the platform. */
function MiddlewareFlowStage({
  reduce,
  journeyUnlock,
  bridgeOutRef,
  hubAlignTop,
}: {
  reduce: boolean;
  journeyUnlock: number;
  bridgeOutRef?: RefObject<HTMLDivElement | null>;
  hubAlignTop?: number | null;
}) {
  return (
    <OfficeToHubStage
      reduce={reduce}
      journeyUnlock={journeyUnlock}
      bridgeOutRef={bridgeOutRef}
      hubAlignTop={hubAlignTop}
      kicker="Details on the move"
      support="Many offices send. One path into the platform."
      officeTone="middleware"
      hub={{
        ringClass: "border-[rgba(20,118,232,0.4)]",
        cardClass:
          "bg-[linear-gradient(145deg,#f3f8ff_0%,#ddeeff_48%,#c8e2ff_100%)] text-navy shadow-[0_18px_40px_rgba(20,118,232,0.28)] ring-4 ring-[rgba(20,118,232,0.35)]",
        iconWrapClass: "bg-[#1476e8] text-white shadow-[0_8px_18px_rgba(20,118,232,0.4)]",
        Icon: Plugs,
        kicker: "Into platform",
        kickerClass: "text-[#1476e8]",
        title: "",
        chip: "Smart Middleware",
      }}
    />
  );
}

type OfficeHubStyle = {
  ringClass: string;
  cardClass: string;
  iconWrapClass: string;
  Icon: CessIcon;
  kicker: string;
  kickerClass: string;
  title: string;
  chip: string;
};

/** Shared offices → hub stage with measured rails that dock on the hub card. */
function OfficeToHubStage({
  reduce,
  kicker,
  support,
  badge,
  badgeClass,
  officeTone,
  hub,
  journeyUnlock = 0,
  bridgeOutRef,
  hubAlignTop = null,
}: {
  reduce: boolean;
  kicker: string;
  support: string;
  badge?: string;
  badgeClass?: string;
  officeTone: "middleware" | "receive";
  hub: OfficeHubStyle;
  journeyUnlock?: number;
  bridgeOutRef?: RefObject<HTMLDivElement | null>;
  hubAlignTop?: number | null;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const stampRefs = useRef<(HTMLElement | null)[]>([]);
  const [rails, setRails] = useState<{ vb: string; px: string; color: string }[]>([]);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const wrap = wrapRef.current;
    const hubEl = hubRef.current;
    if (!wrap || !hubEl) return;

    const sync = () => {
      const w = wrap.getBoundingClientRect();
      if (w.width < 8 || w.height < 8) return;
      setStageSize({ w: w.width, h: w.height });
      const h = hubEl.getBoundingClientRect();
      const endX = ((h.left - w.left) / w.width) * 100 + 0.35;
      const endY = ((h.top + h.height / 2 - w.top) / w.height) * 100;
      const endPxX = h.left - w.left + 3;
      const endPxY = h.top + h.height / 2 - w.top;

      const next = SOURCES.map((_, i) => {
        const stamp = stampRefs.current[i];
        const color = SOURCES[i].actionColor;
        if (!stamp) {
          const y = 14 + i * 15.2;
          return {
            color,
            vb: `M 22 ${y} C 42 ${y}, 55 ${endY}, ${endX} ${endY}`,
            px: `M ${(22 / 100) * w.width} ${(y / 100) * w.height} C ${(42 / 100) * w.width} ${(y / 100) * w.height}, ${(55 / 100) * w.width} ${endPxY}, ${endPxX} ${endPxY}`,
          };
        }
        const r = stamp.getBoundingClientRect();
        const x0 = ((r.right - w.left) / w.width) * 100;
        const y0 = ((r.top + r.height / 2 - w.top) / w.height) * 100;
        const x0px = r.right - w.left;
        const y0px = r.top + r.height / 2 - w.top;
        const midX = (x0 + endX) / 2;
        const midXpx = (x0px + endPxX) / 2;
        return {
          color,
          vb: `M ${x0} ${y0} C ${midX} ${y0}, ${midX + 4} ${endY}, ${endX} ${endY}`,
          px: `M ${x0px} ${y0px} C ${midXpx} ${y0px}, ${midXpx + 24} ${endPxY}, ${endPxX} ${endPxY}`,
        };
      });
      setRails(next);
    };

    const ro = new ResizeObserver(sync);
    ro.observe(wrap);
    ro.observe(hubEl);
    const watchStamps = () => {
      stampRefs.current.forEach((el) => {
        if (el) ro.observe(el);
      });
      sync();
    };
    watchStamps();
    const t = window.setTimeout(watchStamps, 40);
    const t2 = window.setTimeout(watchStamps, 220);
    const raf = requestAnimationFrame(watchStamps);
    window.addEventListener("resize", sync);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", sync);
    };
  }, [journeyUnlock, officeTone]);

  const navyStamp = officeTone === "middleware";
  const hubCollapsed = officeTone === "middleware" && journeyUnlock > 0;

  return (
    <motion.div
      className="relative flex h-full min-h-0 flex-col overflow-hidden"
      initial={reduce ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative z-10 flex items-center justify-between gap-2 px-1 pb-2">
        <div className="min-w-0">
          <div
            className={cn(
              "text-[9px] font-extrabold tracking-[0.14em] uppercase",
              navyStamp ? "text-teal" : "text-[#1a4e8a]",
            )}
          >
            {kicker}
          </div>
          {navyStamp ? (
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[rgba(240,248,255,0.92)] px-3 py-1.5 text-[12px] font-semibold shadow-[0_4px_14px_rgba(20,118,232,0.1)] ring-1 ring-[rgba(126,184,232,0.45)] backdrop-blur-[2px]">
                <ShieldCheck weight="fill" className="size-3.5 shrink-0 text-teal" />
                <span className="min-w-0 leading-snug">
                  <span className="text-teal">Many offices send. </span>
                  <span className="text-navy">One path into the platform.</span>
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(240,248,255,0.92)] px-3 py-1.5 text-[12px] font-semibold text-navy shadow-[0_4px_14px_rgba(20,118,232,0.1)] ring-1 ring-[rgba(126,184,232,0.45)] backdrop-blur-[2px]">
                <Lightning weight="fill" className="size-3.5 shrink-0 text-[#1476e8]" />
                Faster, Accurate, Audit-ready
              </span>
            </div>
          ) : (
            <p className="mt-0.5 text-[12px] font-semibold text-muted-foreground">{support}</p>
          )}
        </div>
        {badge ? (
          <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-extrabold", badgeClass)}>{badge}</span>
        ) : null}
      </div>

      <div ref={wrapRef} className="relative min-h-0 flex-1">
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 right-[18%] size-[240px] -translate-y-1/2 rounded-full",
            navyStamp
              ? "bg-[radial-gradient(circle,rgba(20,196,212,0.12)_0%,transparent_70%)]"
              : "bg-[radial-gradient(circle,rgba(91,155,213,0.14)_0%,transparent_70%)]",
          )}
        />

        <svg
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full overflow-visible"
          width={stageSize.w || "100%"}
          height={stageSize.h || "100%"}
          viewBox={stageSize.w > 0 ? `0 0 ${stageSize.w} ${stageSize.h}` : "0 0 100 100"}
          aria-hidden
        >
          <defs>
            {rails.map((rail, i) => (
              <linearGradient key={`wire-grad-${i}`} id={`wire-grad-${i}`} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={stageSize.w || 100} y2="0">
                <stop offset="0%" stopColor={rail.color} stopOpacity="0.5" />
                <stop offset="60%" stopColor={rail.color} stopOpacity="1" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
              </linearGradient>
            ))}
            <filter id="wire-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {rails.map((rail, i) => {
            const d = rail.px;
            return (
              <g key={`wire-${i}`} filter="url(#wire-glow)">
                <path d={d} fill="none" stroke={rail.color} strokeWidth="14" strokeLinecap="round" opacity="0.16" />
                <path d={d} fill="none" stroke={rail.color} strokeWidth="8" strokeLinecap="round" opacity="0.32" />
                <path d={d} fill="none" stroke={rail.color} strokeWidth="5" strokeLinecap="round" opacity="0.55" />
                <path d={d} fill="none" stroke={`url(#wire-grad-${i})`} strokeWidth="3.5" strokeLinecap="round" opacity="1" />
                <path d={d} fill="none" stroke="#ffffff" strokeWidth="1.35" strokeLinecap="round" opacity="0.8" />
                <path d={d} fill="none" stroke={rail.color} strokeWidth="1.1" strokeLinecap="round" opacity="0.65" transform="translate(0 -2.2)" />
                <path d={d} fill="none" stroke="#ffffff" strokeWidth="0.85" strokeLinecap="round" opacity="0.5" transform="translate(0 2)" />
                {!reduce ? (
                  <path d={d} fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="10 70" opacity="0.9">
                    <animate
                      attributeName="stroke-dashoffset"
                      from="0"
                      to="-80"
                      dur={`${2 + i * 0.12}s`}
                      begin={`${i * 0.14}s`}
                      repeatCount="indefinite"
                    />
                  </path>
                ) : null}
              </g>
            );
          })}
        </svg>

        {/* Traveling file discs on wires */}
        {!reduce
          ? rails.map((rail, i) => {
              const s = SOURCES[i];
              return (
                <motion.span
                  key={`packet-${s.id}`}
                  className="absolute top-0 left-0 z-[2] grid size-[26px] place-items-center rounded-full bg-white"
                  style={{
                    offsetPath: `path('${rail.px}')`,
                    offsetRotate: "0deg",
                    offsetAnchor: "center",
                    boxShadow: `0 0 0 2.5px ${rail.color}, 0 0 16px ${rail.color}aa, 0 0 28px ${rail.color}55, 0 4px 10px rgba(7,20,51,0.16)`,
                    color: rail.color,
                  }}
                  initial={{ offsetDistance: "0%", opacity: 0, scale: 0.7 }}
                  animate={{
                    offsetDistance: ["0%", "100%"],
                    opacity: [0, 1, 1, 1, 0],
                    scale: [0.7, 1.08, 1, 1, 0.8],
                  }}
                  transition={{
                    duration: 1.9 + i * 0.1,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 0.15 + i * 0.14,
                    times: [0, 0.08, 0.55, 0.9, 1],
                  }}
                  aria-hidden
                >
                  <FileText weight="fill" className="size-3" style={{ color: rail.color }} />
                </motion.span>
              );
            })
          : null}

        {/* Convergence glow at hub */}
        {!reduce ? (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-[11%] z-[2] size-16 -translate-y-1/2 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(20,196,212,0.45) 28%, transparent 70%)",
              boxShadow: "0 0 28px rgba(20,196,212,0.45), 0 0 48px rgba(255,255,255,0.35)",
            }}
            animate={{ scale: [0.85, 1.15, 0.85], opacity: [0.45, 0.9, 0.45] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}

        <div className="absolute inset-y-3 left-0 z-[3] flex w-[min(265px,25%)] flex-col">
          <div className="mb-2 text-[9px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
            Sending offices
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-between gap-1.5 py-0.5">
            {SOURCES.map((s, i) => (
              <Stagger key={s.id} delay={30 + i * 40}>
                <div
                  ref={(el) => {
                    stampRefs.current[i] = el;
                  }}
                  className="flex w-full items-center gap-2 rounded-2xl bg-white px-2 py-3.5 shadow-[0_6px_18px_rgba(7,20,51,0.08)] ring-1 ring-navy/6"
                >
                  <img
                    src={s.icon3d}
                    alt=""
                    className="size-11 shrink-0 object-contain drop-shadow-[0_3px_6px_rgba(11,31,74,0.12)]"
                    draggable={false}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12px] font-bold leading-tight text-navy">{s.label}</span>
                    <span className="mt-0.5 block truncate text-[10px] font-semibold text-slate-500">{s.holds}</span>
                  </span>
                  <span
                    className="grid size-8 shrink-0 place-items-center rounded-full text-white shadow-[0_4px_10px_rgba(11,31,74,0.18)]"
                    style={{ background: s.actionColor }}
                    aria-hidden
                  >
                    <FileText weight="fill" className="size-3.5" />
                  </span>
                </div>
              </Stagger>
            ))}
          </div>
        </div>

        <div
          ref={officeTone === "middleware" && hubCollapsed ? bridgeOutRef : undefined}
          data-hub-rail=""
          className={cn(
            "absolute z-10 flex -translate-y-1/2 items-center",
            hubAlignTop == null && "top-1/2",
            officeTone === "middleware" ? "right-2 gap-2" : "right-14 w-[150px] flex-col",
          )}
          style={hubAlignTop != null ? { top: hubAlignTop } : undefined}
        >
          {!reduce && officeTone !== "middleware" ? (
            <motion.div
              className={cn("pointer-events-none absolute size-36 rounded-full border", hub.ringClass)}
              animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null}

          {/* Into Platform / receive hub — morphs to icon when journey advances */}
          <motion.div
            layout
            className={cn(
              "relative flex flex-col items-center",
              hubCollapsed ? "w-[58px]" : "w-[150px]",
            )}
            transition={{ layout: { type: "spring", stiffness: 420, damping: 32, mass: 0.7 } }}
          >
            {!reduce && !hubCollapsed ? (
              <motion.div
                className={cn("pointer-events-none absolute size-36 rounded-full border", hub.ringClass)}
                initial={{ opacity: 0 }}
                animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.7, 0.35] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : null}
            <motion.div
              ref={hubRef}
              layout
              className={cn(
                "relative flex flex-col items-center overflow-hidden text-center",
                hubCollapsed
                  ? "size-12 rounded-xl ring-2 ring-white"
                  : cn("w-full rounded-2xl px-4 py-4", hub.cardClass),
              )}
              title={hubCollapsed ? hub.chip : undefined}
              transition={{ layout: { type: "spring", stiffness: 420, damping: 32, mass: 0.7 } }}
            >
              {officeTone === "middleware" && !hubCollapsed ? (
                <span
                  ref={bridgeOutRef}
                  className="pointer-events-none absolute top-1/2 -right-0.5 z-20 size-2.5 -translate-y-1/2 rounded-full bg-[#1476e8] opacity-90 shadow-[0_0_0_3px_rgba(20,118,232,0.28)]"
                  aria-hidden
                />
              ) : null}
              <motion.span
                layout="position"
                className={cn(
                  "grid shrink-0 place-items-center rounded-xl shadow-md",
                  hub.iconWrapClass,
                  hubCollapsed ? "size-full" : "size-12",
                )}
              >
                <hub.Icon weight="fill" className="size-6" />
              </motion.span>
              <AnimatePresence initial={false} mode="popLayout">
                {!hubCollapsed ? (
                  <motion.div
                    key="hub-copy"
                    className="flex w-full flex-col items-center"
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: 6 }}
                    transition={{ duration: 0.26, ease: "easeOut" }}
                  >
                    <div className={cn("mt-2 text-[9px] font-extrabold tracking-[0.14em] uppercase", hub.kickerClass)}>
                      {hub.kicker}
                    </div>
                    {hub.title ? <b className="mt-1 text-[13px] leading-snug">{hub.title}</b> : null}
                    {officeTone === "middleware" ? (
                      <span className="relative mt-2.5 inline-flex max-w-full flex-col items-center rounded-xl bg-white/95 px-3 py-1.5 shadow-[0_6px_16px_rgba(20,118,232,0.22)] ring-1 ring-[rgba(20,118,232,0.32)]">
                        <span className="font-display text-[12px] leading-tight font-extrabold tracking-tight text-navy">
                          {hub.chip}
                        </span>
                        <span className="mt-0.5 text-[8px] font-bold tracking-[0.12em] text-[#1476e8] uppercase">
                          Linking layer
                        </span>
                      </span>
                    ) : (
                      <span className="mt-2 rounded-full bg-white/12 px-2.5 py-0.5 text-[9px] font-bold text-white/90">
                        {hub.chip}
                      </span>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
            {hubCollapsed ? (
              <span className="mt-1.5 max-w-[58px] text-center text-[9px] leading-tight font-extrabold tracking-tight text-navy">
                Middleware
              </span>
            ) : null}
          </motion.div>

          <AnimatePresence initial={false} mode="popLayout">
            {officeTone === "middleware" && journeyUnlock > 0 ? (
              <motion.div
                key="journey-chain"
                className="relative flex items-center"
                initial={reduce ? false : { opacity: 0, x: -16, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, x: -12, scale: 0.88 }}
                transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.7 }}
              >
                <MiddlewareJourneyChain reduce={reduce} unlock={journeyUnlock} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

const JOURNEY_STEPS: {
  id: string;
  label: string;
  short: string;
  support: string;
  Icon: CessIcon;
  accent: string;
  soft: string;
  face: string;
  live: string;
}[] = [
  {
    id: "mv",
    label: "Match & Validate",
    short: "Match",
    support: "Same work?",
    Icon: TreeStructure,
    accent: "#b8872b",
    soft: "rgba(240,193,74,0.35)",
    face: "linear-gradient(145deg,#fffdf6 0%,#fff3d6 48%,#ffe9b8 100%)",
    live: "Matching · Validating…",
  },
  {
    id: "process",
    label: "Process",
    short: "Process",
    support: "One clear format",
    Icon: Sparkle,
    accent: "#0e9aa7",
    soft: "rgba(20,196,212,0.35)",
    face: "linear-gradient(145deg,#f2fcfe 0%,#d9f5fa 48%,#c5eef6 100%)",
    live: "Processing…",
  },
  {
    id: "one",
    label: "One project",
    short: "One file",
    support: "Board project file",
    Icon: ShieldCheck,
    accent: "#0e8a72",
    soft: "rgba(14,138,114,0.35)",
    face: "linear-gradient(145deg,#f1fbf7 0%,#d8f3ea 48%,#c0ebe0 100%)",
    live: "Building file…",
  },
  {
    id: "central",
    label: "Central Platform",
    short: "Platform",
    support: "One Board place",
    Icon: Database,
    accent: "#1a4e8a",
    soft: "rgba(26,78,138,0.3)",
    face: "linear-gradient(145deg,#f3f7fc 0%,#e0eaf6 48%,#cddcef 100%)",
    live: "On platform…",
  },
];

/** Horizontal unlock chain — expands forward, shrinks back; prior steps stay as icons. */
function MiddlewareJourneyChain({ reduce, unlock }: { reduce: boolean; unlock: number }) {
  const prevUnlock = useRef(unlock);
  const goingBack = unlock < prevUnlock.current;
  useEffect(() => {
    prevUnlock.current = unlock;
  }, [unlock]);

  const visible = JOURNEY_STEPS.slice(0, unlock);
  const active = visible[visible.length - 1] ?? null;

  return (
    <div className="relative flex items-center gap-1.5">
      <AnimatePresence initial={false} mode="popLayout">
        {visible.map((step, i) => {
          const isActive = i === visible.length - 1;
          return (
            <motion.div
              key={step.id}
              layout
              className="flex items-center gap-1.5"
              initial={reduce ? false : { opacity: 0, x: goingBack ? 12 : -18, scale: 0.86 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={
                reduce
                  ? undefined
                  : goingBack
                    ? { opacity: 0, scale: 0.72, x: 10 }
                    : { opacity: 0, x: 14, scale: 0.84 }
              }
              transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.65 }}
            >
              <div className={cn("relative shrink-0", isActive ? "h-10 w-7" : "h-8 w-5")} aria-hidden>
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 28 40">
                  <path d="M 1 20 C 9 20, 19 20, 27 20" fill="none" stroke={step.accent} strokeWidth="7" strokeLinecap="round" opacity="0.14" />
                  <path d="M 1 20 C 9 20, 19 20, 27 20" fill="none" stroke={step.accent} strokeWidth="2.4" strokeLinecap="round" opacity="0.95" />
                  {isActive && !reduce ? (
                    <path d="M 1 20 C 9 20, 19 20, 27 20" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="5 12">
                      <animate attributeName="stroke-dashoffset" from="0" to="-17" dur="0.95s" repeatCount="indefinite" />
                    </path>
                  ) : null}
                </svg>
                {isActive && !reduce ? (
                  <motion.span
                    className="absolute top-1/2 left-0 grid size-3.5 -translate-y-1/2 place-items-center rounded-full bg-white"
                    style={{ boxShadow: `0 0 0 1.5px ${step.accent}` }}
                    animate={{ x: [0, 10, 20], opacity: [0, 1, 0], scale: [0.6, 1, 0.5] }}
                    transition={{ duration: 1.05, repeat: Infinity, ease: "easeIn" }}
                  >
                    <FileText weight="fill" className="size-1.5" style={{ color: step.accent }} />
                  </motion.span>
                ) : null}
              </div>

              <motion.div
                layout
                title={isActive ? undefined : step.label}
                className={cn(
                  "relative flex flex-col items-center text-center",
                  isActive
                    ? "w-[150px] overflow-hidden rounded-2xl px-4 py-4 text-navy"
                    : "w-[56px]",
                )}
                style={
                  isActive
                    ? {
                        background: step.face,
                        boxShadow: `0 0 0 4px ${step.soft}, 0 18px 40px rgba(7,20,51,0.16)`,
                      }
                    : undefined
                }
                initial={false}
                transition={{ layout: { type: "spring", stiffness: 420, damping: 32, mass: 0.65 } }}
              >
                <motion.span
                  layout="position"
                  className={cn(
                    "grid shrink-0 place-items-center rounded-xl text-white",
                    isActive ? "size-12 shadow-md" : "size-12 ring-2 ring-white",
                  )}
                  style={{
                    background: step.accent,
                    boxShadow: isActive ? undefined : "0 8px 18px rgba(7,20,51,0.18)",
                  }}
                >
                  <step.Icon weight="fill" className="size-6" />
                </motion.span>

                <AnimatePresence initial={false} mode="popLayout">
                  {isActive ? (
                    <motion.div
                      key={`${step.id}-copy`}
                      className="flex flex-col items-center"
                      initial={reduce ? false : { opacity: 0, y: goingBack ? -4 : 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0, y: 6 }}
                      transition={{ duration: 0.24, ease: "easeOut" }}
                    >
                      <div className="mt-2 font-display text-[12px] leading-tight font-extrabold text-navy">{step.label}</div>
                      <div className="mt-0.5 text-[8px] font-semibold text-muted-foreground">{step.support}</div>
                      {!reduce ? (
                        <motion.span
                          className="mt-2.5 rounded-full px-2.5 py-0.5 text-[8px] font-extrabold text-white uppercase"
                          style={{ background: step.accent }}
                          animate={{ opacity: [0.75, 1, 0.75] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {active?.live ?? "Live"}
                        </motion.span>
                      ) : (
                        <span className="mt-2.5 text-[8px] font-extrabold uppercase" style={{ color: step.accent }}>
                          Live
                        </span>
                      )}
                    </motion.div>
                  ) : (
                    <motion.span
                      key={`${step.id}-short`}
                      className="mt-1.5 max-w-[56px] text-[9px] leading-tight font-extrabold tracking-tight text-navy"
                      initial={reduce ? false : { opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduce ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {step.short}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/** How match runs — A↔B match · Matched · green seal (no loader skeleton). */
function MatchHowRunsPanel({
  reduce,
  title = "How match runs",
  support,
  fill = false,
  className,
}: {
  reduce: boolean;
  title?: string;
  support?: string;
  fill?: boolean;
  className?: string;
}) {
  type RowPhase = "idle" | "scanning" | "linked" | "matched" | "ok";
  type Finale = "idle" | "matched" | "validated";

  const [rowPhase, setRowPhase] = useState<RowPhase[]>(() =>
    MATCH_SCAN_ROWS.map(() => (reduce ? "ok" : "idle")),
  );
  const [scanIdx, setScanIdx] = useState(reduce ? -1 : -1);
  const [finale, setFinale] = useState<Finale>(reduce ? "validated" : "idle");
  const [cycle, setCycle] = useState(0);
  const [score, setScore] = useState(reduce ? 96 : 0);

  useEffect(() => {
    if (reduce) {
      setRowPhase(MATCH_SCAN_ROWS.map(() => "ok"));
      setScanIdx(-1);
      setFinale("validated");
      setScore(96);
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) fn();
        }, ms),
      );
    };

    setRowPhase(MATCH_SCAN_ROWS.map(() => "idle"));
    setScanIdx(-1);
    setFinale("idle");
    setScore(0);

    later(() => {
      setScanIdx(0);
      setScore(8);
    }, 120);

    const SCAN_MS = 560;
    const LINK_MS = 260;
    const MATCH_MS = 320;
    const GAP_MS = 80;
    const rowSpan = SCAN_MS + LINK_MS + MATCH_MS + GAP_MS;

    MATCH_SCAN_ROWS.forEach((_, i) => {
      const t0 = 120 + i * rowSpan;
      later(() => {
        setScanIdx(i);
        setRowPhase((prev) => prev.map((p, j) => (j === i ? "scanning" : p)));
      }, t0);
      later(() => {
        setRowPhase((prev) => prev.map((p, j) => (j === i ? "linked" : p)));
        setScore(Math.min(88, 8 + (i + 1) * 10));
      }, t0 + SCAN_MS);
      later(() => {
        setRowPhase((prev) => prev.map((p, j) => (j === i ? "matched" : p)));
      }, t0 + SCAN_MS + LINK_MS);
      later(() => {
        setRowPhase((prev) => prev.map((p, j) => (j === i ? "ok" : p)));
        setScore(Math.min(96, 12 + (i + 1) * 10));
      }, t0 + SCAN_MS + LINK_MS + MATCH_MS);
    });

    const afterRows = 120 + MATCH_SCAN_ROWS.length * rowSpan;
    later(() => {
      setScanIdx(-1);
      setFinale("matched");
      setScore(96);
    }, afterRows);
    later(() => {
      setFinale("validated");
    }, afterRows + 720);
    later(() => {
      setCycle((n) => n + 1);
    }, afterRows + 720 + 2200);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [reduce, cycle]);

  const live = scanIdx >= 0 ? MATCH_SCAN_ROWS[scanIdx] : null;
  const livePhase = scanIdx >= 0 ? rowPhase[scanIdx] : "idle";
  const doneCount = rowPhase.filter((p) => p === "ok").length;
  const pulling = !reduce && finale === "idle" && (livePhase === "linked" || livePhase === "matched");
  const sealed = finale === "validated";
  const merged = finale === "matched" || sealed;

  return (
    <div className={cn("relative flex min-h-0 flex-col overflow-hidden", fill && "flex-1", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl transition-[background] duration-700"
        style={{
          background: sealed
            ? "radial-gradient(460px 200px at 50% 28%, rgba(14,138,114,0.16), transparent 68%)"
            : "radial-gradient(520px 220px at 50% 22%, rgba(240,193,74,0.18), transparent 64%)",
        }}
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
      {/* Header: title · phase beads · score ring */}
      <div className="relative z-10 mb-2 flex shrink-0 items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-extrabold tracking-[0.14em] text-gold-deep uppercase">{title}</div>
          {support ? <p className="mt-0.5 truncate text-[11px] font-bold text-navy">{support}</p> : null}
        </div>

        <div className="flex items-center gap-1">
          {(
            [
              { id: "m1", label: "Match", on: finale === "idle" && scanIdx >= 0, done: finale !== "idle" || doneCount > 0 },
              { id: "m2", label: "Matched", on: finale === "matched", done: sealed },
              { id: "m3", label: "Validate", on: sealed, done: sealed },
            ] as const
          ).map((bead, i) => (
            <div key={bead.id} className="flex items-center gap-1">
              {i > 0 ? (
                <span
                  className={cn("h-0.5 w-3 rounded-full transition-colors", bead.done || bead.on ? "bg-ok" : "bg-navy/10")}
                  aria-hidden
                />
              ) : null}
              <motion.span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.06em]",
                  bead.on
                    ? bead.id === "m3"
                      ? "bg-ok text-white shadow-[0_6px_14px_rgba(14,138,114,0.35)]"
                      : "bg-gold text-gold-ink shadow-[0_6px_14px_rgba(240,193,74,0.35)]"
                    : bead.done
                      ? "bg-ok-soft text-ok"
                      : "bg-white text-muted-foreground ring-1 ring-navy/10",
                )}
                animate={bead.on && !reduce ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={{ duration: 1.1, repeat: bead.on ? Infinity : 0 }}
              >
                {bead.label}
              </motion.span>
            </div>
          ))}
        </div>

        <div className="relative grid size-12 shrink-0 place-items-center">
          <svg className="absolute inset-0 size-12 -rotate-90" viewBox="0 0 40 40" aria-hidden>
            <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(11,31,74,0.08)" strokeWidth="3.5" />
            <motion.circle
              cx="20"
              cy="20"
              r="16"
              fill="none"
              stroke={sealed ? "#0e8a72" : "#f0c14a"}
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 100.5} 100.5`}
              initial={false}
              animate={{ strokeDasharray: `${(score / 100) * 100.5} 100.5` }}
              transition={{ type: "spring", stiffness: 160, damping: 20 }}
            />
          </svg>
          <span className="text-[10px] font-extrabold text-navy">{score}%</span>
        </div>
      </div>

      {/* Side-by-side like Smart Middleware: merge stage | fields lock in */}
      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-[minmax(0,1.4fr)_minmax(0,0.95fr)] gap-2.5 overflow-hidden">
        {/* Magnetic merge stage */}
        <div className="relative flex min-h-0 flex-col overflow-hidden rounded-[20px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,250,236,0.92)_100%)] px-2.5 pt-2.5 pb-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_28px_rgba(240,193,74,0.12)] ring-1 ring-gold/30">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px]">
            <motion.div
              className="absolute top-1/2 left-1/2 size-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/20"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute top-1/2 left-1/2 size-[110px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-navy/10"
              animate={reduce ? undefined : { rotate: -360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
          </div>

          <div className="relative z-10 mb-1.5 flex shrink-0 items-center justify-between gap-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${finale}-${live?.field ?? "idle"}-${cycle}`}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="min-w-0"
              >
                <div className="text-[8px] font-extrabold tracking-[0.14em] text-gold-deep uppercase">
                  {sealed
                    ? "Seal complete"
                    : merged
                      ? "Same work found"
                      : live
                        ? `Comparing · ${live.field}`
                        : "Ready"}
                </div>
                <b className="mt-0.5 block truncate font-display text-[14px] leading-tight font-extrabold text-navy">
                  {sealed
                    ? "Validated · one project file"
                    : merged
                      ? "Matched · merge into one"
                      : live
                        ? live.field
                        : "Field by field"}
                </b>
              </motion.div>
            </AnimatePresence>
            {!reduce && finale === "idle" && live ? (
              <motion.span
                className="shrink-0 rounded-full bg-gold px-2.5 py-1 text-[8px] font-extrabold text-gold-ink uppercase"
                animate={{ opacity: [0.65, 1, 0.65], scale: [1, 1.04, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              >
                Live
              </motion.span>
            ) : sealed ? (
              <span className="shrink-0 rounded-full bg-ok px-2.5 py-1 text-[8px] font-extrabold text-white uppercase">Ok</span>
            ) : merged ? (
              <span className="shrink-0 rounded-full bg-gold px-2.5 py-1 text-[8px] font-extrabold text-gold-ink uppercase">
                Matched
              </span>
            ) : null}
          </div>

          <div className="relative z-10 flex min-h-0 flex-1 items-center justify-center">
            <svg
              className="pointer-events-none absolute inset-x-[8%] top-1/2 h-14 -translate-y-1/2 overflow-visible"
              viewBox="0 0 280 64"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="matchBridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#5b9bd5" stopOpacity="0.85" />
                  <stop offset="50%" stopColor={sealed ? "#0e8a72" : "#f0c14a"} stopOpacity="1" />
                  <stop offset="100%" stopColor="#c45c26" stopOpacity="0.85" />
                </linearGradient>
              </defs>
              <path
                d="M 10 32 C 70 12, 210 52, 270 32"
                fill="none"
                stroke="url(#matchBridgeGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                opacity={0.55}
              />
              <path
                d="M 10 32 C 70 52, 210 12, 270 32"
                fill="none"
                stroke="url(#matchBridgeGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                opacity={0.35}
              />
              {!reduce && finale === "idle" && live ? (
                <>
                  <motion.circle
                    r="5"
                    fill="#1476e8"
                    animate={{
                      cx: [14, 266],
                      cy: [32, 32],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.circle
                    r="4"
                    fill="#c45c26"
                    animate={{
                      cx: [266, 14],
                      cy: [32, 32],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut", delay: 0.28 }}
                  />
                </>
              ) : null}
              {merged && !reduce ? (
                <motion.circle
                  cx="140"
                  cy="32"
                  r="6"
                  fill={sealed ? "#0e8a72" : "#f0c14a"}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.85] }}
                  transition={{ duration: 0.7 }}
                />
              ) : null}
            </svg>

            <div className="relative z-10 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-0.5">
              <motion.div
                className="flex flex-col items-center gap-1"
                animate={
                  reduce
                    ? { x: 0 }
                    : sealed
                      ? { x: 14, scale: 0.92 }
                      : merged
                        ? { x: 10 }
                        : pulling
                          ? { x: [0, 8, 8] }
                          : livePhase === "scanning"
                            ? { x: [0, 3, 0], rotate: [0, -2, 0] }
                            : { x: 0 }
                }
                transition={{ duration: pulling || livePhase === "scanning" ? 0.95 : 0.55, ease: "easeInOut", repeat: livePhase === "scanning" && !merged ? Infinity : 0 }}
              >
                <div className="relative">
                  {!reduce && finale === "idle" ? (
                    <motion.span
                      aria-hidden
                      className="absolute -inset-2 rounded-full border border-[#5b9bd5]/40"
                      animate={{ scale: [0.92, 1.18], opacity: [0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    />
                  ) : null}
                  <span
                    className={cn(
                      "relative grid size-[52px] place-items-center rounded-full text-white",
                      stamp3dRound,
                      "bg-[linear-gradient(145deg,#1a4e8a_0%,#2f6bb0_100%)] shadow-[0_12px_24px_rgba(26,78,138,0.32)]",
                    )}
                  >
                    <FileText weight="duotone" className="relative z-[1] size-5" />
                  </span>
                  <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-[#1a4e8a] text-[9px] font-extrabold text-white ring-2 ring-white">
                    A
                  </span>
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.b
                    key={live?.a ?? "a0"}
                    className="max-w-[100px] truncate text-center text-[10px] font-extrabold text-navy"
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    {live?.a ?? MATCH_SCAN_ROWS[0].a}
                  </motion.b>
                </AnimatePresence>
                <span className="text-[7px] font-bold tracking-[0.08em] text-[#1a4e8a] uppercase">Office A</span>
              </motion.div>

              <div className="relative grid size-[64px] place-items-center">
                {!reduce && finale === "idle" ? (
                  <motion.span
                    aria-hidden
                    className="absolute size-[58px] rounded-full border-2 border-gold/45"
                    animate={{ scale: [0.88, 1.22], opacity: [0.55, 0] }}
                    transition={{ duration: 1.35, repeat: Infinity, ease: "easeOut" }}
                  />
                ) : null}
                {sealed && !reduce ? (
                  <motion.span
                    aria-hidden
                    className="absolute size-[70px] rounded-full border-2 border-ok/50"
                    initial={{ scale: 0.6, opacity: 0.8 }}
                    animate={{ scale: 1.35, opacity: 0 }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                ) : null}
                <AnimatePresence mode="wait" initial={false}>
                  {sealed ? (
                    <motion.span
                      key="seal"
                      className={cn("grid size-[52px] place-items-center rounded-full bg-ok text-white", stamp3dRound)}
                      initial={reduce ? false : { scale: 0.15, rotate: -70 }}
                      animate={{ scale: [0.15, 1.28, 1], rotate: 0 }}
                      transition={{ type: "spring", stiffness: 520, damping: 13 }}
                    >
                      <ShieldCheck weight="bold" className="relative z-[1] size-6" />
                    </motion.span>
                  ) : merged ? (
                    <motion.span
                      key="merge"
                      className={cn("grid size-[52px] place-items-center rounded-[16px] bg-gold text-gold-ink", stamp3dXl)}
                      initial={reduce ? false : { scale: 0.45, rotate: -12 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 16 }}
                    >
                      <Sparkle weight="fill" className="relative z-[1] size-6" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="hub"
                      className="relative grid size-[52px] place-items-center rounded-[16px] bg-navy text-white shadow-[0_12px_26px_rgba(11,31,74,0.32)]"
                      animate={reduce ? undefined : { rotate: [0, 8, -8, 0], scale: [1, 1.04, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <TreeStructure weight="duotone" className="size-6 text-gold" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <motion.div
                className="flex flex-col items-center gap-1"
                animate={
                  reduce
                    ? { x: 0 }
                    : sealed
                      ? { x: -14, scale: 0.92 }
                      : merged
                        ? { x: -10 }
                        : pulling
                          ? { x: [0, -8, -8] }
                          : livePhase === "scanning"
                            ? { x: [0, -3, 0], rotate: [0, 2, 0] }
                            : { x: 0 }
                }
                transition={{ duration: pulling || livePhase === "scanning" ? 0.95 : 0.55, ease: "easeInOut", repeat: livePhase === "scanning" && !merged ? Infinity : 0 }}
              >
                <div className="relative">
                  {!reduce && finale === "idle" ? (
                    <motion.span
                      aria-hidden
                      className="absolute -inset-2 rounded-full border border-[#c45c26]/40"
                      animate={{ scale: [0.92, 1.18], opacity: [0.5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.25 }}
                    />
                  ) : null}
                  <span
                    className={cn(
                      "relative grid size-[52px] place-items-center rounded-full text-white",
                      stamp3dRound,
                      "bg-[linear-gradient(145deg,#c45c26_0%,#d97845_100%)] shadow-[0_12px_24px_rgba(196,92,38,0.32)]",
                    )}
                  >
                    <Buildings weight="duotone" className="relative z-[1] size-5" />
                  </span>
                  <span className="absolute -top-1 -left-1 grid size-5 place-items-center rounded-full bg-[#c45c26] text-[9px] font-extrabold text-white ring-2 ring-white">
                    B
                  </span>
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.b
                    key={live?.b ?? "b0"}
                    className="max-w-[100px] truncate text-center text-[10px] font-extrabold text-navy"
                    initial={reduce ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                  >
                    {live?.b ?? MATCH_SCAN_ROWS[0].b}
                  </motion.b>
                </AnimatePresence>
                <span className="text-[7px] font-bold tracking-[0.08em] text-[#c45c26] uppercase">Office B</span>
              </motion.div>
            </div>
          </div>

          <div className="relative z-10 mt-1.5 flex shrink-0 justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={live ? `${live.field}-${livePhase}` : finale}
                initial={reduce ? false : { opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6 }}
                className={cn(
                  "inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 shadow-[0_8px_20px_rgba(7,20,51,0.08)]",
                  sealed
                    ? "bg-ok text-white"
                    : merged
                      ? "bg-gold text-gold-ink"
                      : "bg-white/95 text-navy ring-1 ring-gold/35",
                )}
              >
                {sealed ? (
                  <>
                    <ShieldCheck weight="bold" className="size-3.5 shrink-0" />
                    <b className="truncate text-[9px] font-extrabold">Green seal · one Board file</b>
                  </>
                ) : merged ? (
                  <>
                    <Sparkle weight="fill" className="size-3.5 shrink-0" />
                    <b className="truncate text-[9px] font-extrabold">Same plot · ready to merge</b>
                  </>
                ) : live ? (
                  <>
                    <span className="max-w-[72px] truncate text-[8px] font-bold text-[#1a4e8a]">{live.a}</span>
                    <span className="grid size-4 shrink-0 place-items-center rounded-full bg-navy text-[7px] font-extrabold text-gold">
                      ↔
                    </span>
                    <span className="max-w-[72px] truncate text-[8px] font-bold text-[#c45c26]">{live.b}</span>
                  </>
                ) : (
                  <b className="text-[9px] font-extrabold">Ready to compare</b>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Fields lock in — right column */}
        <div className="relative flex min-h-0 flex-col overflow-hidden rounded-[20px] bg-white/90 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_28px_rgba(240,193,74,0.1)] ring-1 ring-navy/8">
          <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2 px-0.5">
            <span className="text-[8px] font-extrabold tracking-[0.12em] text-gold-deep uppercase">Fields lock in</span>
            <span className="text-[9px] font-extrabold text-navy">
              {doneCount}/{MATCH_SCAN_ROWS.length}
            </span>
          </div>
          <div className="grid min-h-0 flex-1 grid-cols-2 content-evenly gap-x-1.5 gap-y-1">
            {MATCH_SCAN_ROWS.map((row, i) => {
              const phase = rowPhase[i] ?? "idle";
              const scanning = phase === "scanning";
              const ok = phase === "ok" || phase === "matched" || phase === "linked";
              const active = scanning || phase === "linked" || phase === "matched";
              return (
                <motion.div
                  key={row.field}
                  className={cn(
                    "relative flex min-h-0 items-center gap-1.5 overflow-hidden rounded-xl px-1.5 py-1",
                    active
                      ? "bg-gold-soft ring-1 ring-gold/40"
                      : ok
                        ? "bg-ok-soft/80 ring-1 ring-ok/25"
                        : "bg-mist/60 ring-1 ring-navy/5",
                  )}
                  animate={active && !reduce ? { y: [0, -1.5, 0] } : { y: 0 }}
                  transition={{ duration: 1, repeat: active ? Infinity : 0, ease: "easeInOut" }}
                >
                  {scanning && !reduce ? (
                    <motion.span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.55)_48%,transparent_66%)]"
                      animate={{ x: ["-70%", "130%"] }}
                      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ) : null}
                  <span
                    className={cn(
                      "relative z-[1] grid size-7 shrink-0 place-items-center rounded-full",
                      stamp3dRound,
                      ok
                        ? "bg-ok text-white"
                        : active
                          ? "bg-gold text-gold-ink"
                          : "bg-white text-navy/40 ring-1 ring-navy/10",
                    )}
                  >
                    {ok ? (
                      <ShieldCheck weight="bold" className="relative z-[1] size-3.5" />
                    ) : (
                      <MagnifyingGlass weight="bold" className="relative z-[1] size-3" />
                    )}
                  </span>
                  <div className="relative z-[1] min-w-0 flex-1">
                    <b
                      className={cn(
                        "block truncate text-[8px] font-extrabold leading-tight",
                        ok ? "text-ok" : active ? "text-gold-deep" : "text-navy",
                      )}
                    >
                      {row.field}
                    </b>
                    <span className="mt-0.5 block truncate text-[6px] font-bold text-[#1a4e8a]/80">{row.a}</span>
                    <span className="block truncate text-[6px] font-bold text-[#c45c26]/80">{row.b}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Foot check stamps */}
      <div className="relative z-10 mt-2 flex shrink-0 items-center gap-1.5 overflow-hidden">
        {MATCH_FOOT_CHIPS.map((chip, i) => {
          const lit = reduce || finale !== "idle" || i <= Math.max(0, scanIdx);
          return (
            <motion.span
              key={chip.label}
              className={cn(
                "inline-flex min-w-0 flex-1 items-center gap-1 rounded-full bg-white/90 px-1.5 py-1 ring-1 ring-navy/8",
                lit ? "opacity-100" : "opacity-35",
              )}
              title={chip.label}
              animate={lit && !reduce && finale === "idle" && i === scanIdx ? { y: [0, -1.5, 0] } : { y: 0 }}
              transition={{ duration: 0.9, repeat: i === scanIdx && finale === "idle" ? Infinity : 0 }}
            >
              <span className={cn("grid size-5 shrink-0 place-items-center rounded-full", stamp3dRound, chip.tone)}>
                <chip.Icon weight="fill" className="relative z-[1] size-2.5" />
              </span>
              <b className="min-w-0 truncate text-[7px] font-bold text-navy">{chip.label}</b>
            </motion.span>
          );
        })}
      </div>
      </div>
    </div>
  );
}

/** How process runs — skeleton first, then raw → one clear Board format. */
function ProcessHowRunsPanel({
  reduce,
  title = "How process runs",
  support,
  fill = false,
  className,
}: {
  reduce: boolean;
  title?: string;
  support?: string;
  fill?: boolean;
  className?: string;
}) {
  type RowPhase = "idle" | "rewriting" | "clean" | "ok";
  type Finale = "idle" | "formatted" | "ready";
  type Boot = "skeleton" | "ready";

  const [boot, setBoot] = useState<Boot>(reduce ? "ready" : "skeleton");
  const [rowPhase, setRowPhase] = useState<RowPhase[]>(() =>
    PROCESS_ROWS.map(() => (reduce ? "ok" : "idle")),
  );
  const [scanIdx, setScanIdx] = useState(reduce ? -1 : -1);
  const [finale, setFinale] = useState<Finale>(reduce ? "ready" : "idle");
  const [cycle, setCycle] = useState(0);
  const [score, setScore] = useState(reduce ? 100 : 0);

  useEffect(() => {
    if (reduce) {
      setBoot("ready");
      setRowPhase(PROCESS_ROWS.map(() => "ok"));
      setScanIdx(-1);
      setFinale("ready");
      setScore(100);
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(
        window.setTimeout(() => {
          if (!cancelled) fn();
        }, ms),
      );
    };

    setBoot("skeleton");
    setRowPhase(PROCESS_ROWS.map(() => "idle"));
    setScanIdx(-1);
    setFinale("idle");
    setScore(0);

    const SKELETON_MS = 1400;

    later(() => {
      setBoot("ready");
      setScanIdx(0);
      setScore(6);
    }, SKELETON_MS);

    const REWRITE_MS = 520;
    const CLEAN_MS = 280;
    const OK_MS = 260;
    const GAP_MS = 70;
    const rowSpan = REWRITE_MS + CLEAN_MS + OK_MS + GAP_MS;

    PROCESS_ROWS.forEach((_, i) => {
      const t0 = SKELETON_MS + 160 + i * rowSpan;
      later(() => {
        setScanIdx(i);
        setRowPhase((prev) => prev.map((p, j) => (j === i ? "rewriting" : p)));
      }, t0);
      later(() => {
        setRowPhase((prev) => prev.map((p, j) => (j === i ? "clean" : p)));
        setScore(Math.min(92, 8 + (i + 1) * 12));
      }, t0 + REWRITE_MS);
      later(() => {
        setRowPhase((prev) => prev.map((p, j) => (j === i ? "ok" : p)));
        setScore(Math.min(100, 10 + (i + 1) * 14));
      }, t0 + REWRITE_MS + CLEAN_MS + OK_MS);
    });

    const afterRows = SKELETON_MS + 160 + PROCESS_ROWS.length * rowSpan;
    later(() => {
      setScanIdx(-1);
      setFinale("formatted");
      setScore(100);
    }, afterRows);
    later(() => {
      setFinale("ready");
    }, afterRows + 680);
    later(() => {
      setCycle((n) => n + 1);
    }, afterRows + 680 + 2200);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [reduce, cycle]);

  const live = scanIdx >= 0 ? PROCESS_ROWS[scanIdx] : null;
  const doneCount = rowPhase.filter((p) => p === "ok").length;
  const sealed = finale === "ready";
  const formatted = finale === "formatted" || sealed;
  const showSkeleton = boot === "skeleton" && !reduce;

  return (
    <div className={cn("relative flex min-h-0 flex-col overflow-hidden", fill && "flex-1", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl transition-[background] duration-700"
        style={{
          background: sealed
            ? "radial-gradient(460px 200px at 50% 28%, rgba(14,138,114,0.14), transparent 68%)"
            : "radial-gradient(520px 220px at 50% 22%, rgba(20,196,212,0.18), transparent 64%)",
        }}
      />

      <AnimatePresence mode="wait" initial={false}>
        {showSkeleton ? (
          <motion.div
            key={`proc-skel-${cycle}`}
            className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28 }}
          >
            <div className="mb-2 flex shrink-0 items-center gap-2.5">
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="h-2 w-24 overflow-hidden rounded-full bg-teal/25">
                  <motion.span
                    className="block h-full w-1/2 rounded-full bg-teal/55"
                    animate={{ x: ["-40%", "180%"] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <div className="h-3 w-44 overflow-hidden rounded-full bg-navy/8">
                  <motion.span
                    className="block h-full w-1/3 rounded-full bg-navy/15"
                    animate={{ x: ["-30%", "220%"] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: 0.12 }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-4 w-12 overflow-hidden rounded-full bg-navy/8">
                    <motion.span
                      className="block h-full w-1/2 rounded-full bg-teal/30"
                      animate={{ x: ["-50%", "160%"] }}
                      transition={{ duration: 1.05, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 }}
                    />
                  </span>
                ))}
              </div>
              <span className="size-12 overflow-hidden rounded-full bg-navy/8 ring-2 ring-teal/20">
                <motion.span
                  className="block h-full w-1/2 bg-teal/35"
                  animate={{ x: ["-60%", "160%"] }}
                  transition={{ duration: 1.15, repeat: Infinity, ease: "easeInOut" }}
                />
              </span>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.15fr)_minmax(0,1.1fr)] gap-2.5 overflow-hidden">
              <div className="relative flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-[20px] bg-white/90 p-3 ring-1 ring-teal/25">
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_35%,rgba(20,196,212,0.16)_48%,transparent_62%)]"
                  animate={{ x: ["-80%", "120%"] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative z-[1] mb-3 flex w-full items-center justify-between px-1">
                  <div className="h-2.5 w-28 rounded-full bg-navy/10" />
                  <div className="h-4 w-12 rounded-full bg-teal/30" />
                </div>
                <div className="relative z-[1] flex w-full flex-col items-center gap-2">
                  <div className="flex w-full justify-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-7 w-[28%] rounded-lg bg-navy/8" />
                    ))}
                  </div>
                  <span className="size-10 rounded-2xl bg-teal/25" />
                  <div className="h-8 w-[70%] rounded-xl bg-navy/10" />
                </div>
                <p className="relative z-[1] mt-3 text-[9px] font-extrabold tracking-[0.12em] text-teal uppercase">
                  Preparing format…
                </p>
              </div>

              <div className="relative flex min-h-0 flex-col overflow-hidden rounded-[20px] bg-white/90 p-2 ring-1 ring-navy/8">
                <div className="mb-1.5 flex items-center justify-between px-0.5">
                  <span className="h-2 w-24 rounded-full bg-teal/30" />
                  <span className="h-2 w-8 rounded-full bg-navy/10" />
                </div>
                <div className="flex min-h-0 flex-1 flex-col justify-evenly gap-1.5">
                  {PROCESS_ROWS.map((row, i) => (
                    <div
                      key={`psk-${row.field}`}
                      className="relative flex items-center gap-1.5 overflow-hidden rounded-xl bg-mist/70 px-1.5 py-1.5 ring-1 ring-navy/5"
                    >
                      <motion.span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.7)_48%,transparent_66%)]"
                        animate={{ x: ["-70%", "130%"] }}
                        transition={{ duration: 1.05, repeat: Infinity, ease: "easeInOut", delay: i * 0.06 }}
                      />
                      <span className="size-6 shrink-0 rounded-lg bg-navy/10" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <span className="block h-1.5 w-[70%] rounded-full bg-navy/12" />
                        <span className="block h-1 w-[90%] rounded-full bg-navy/8" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-2 flex shrink-0 items-center gap-1.5">
              {PROCESS_FOOT_CHIPS.map((chip, i) => (
                <span
                  key={`psk-foot-${chip.label}`}
                  className="h-6 min-w-0 flex-1 overflow-hidden rounded-full bg-navy/6 ring-1 ring-navy/5"
                >
                  <motion.span
                    className="block h-full w-1/3 bg-teal/25"
                    animate={{ x: ["-50%", "200%"] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: i * 0.05 }}
                  />
                </span>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`proc-live-${cycle}`}
            className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <div className="relative z-10 mb-2 flex shrink-0 items-center gap-2.5">
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-extrabold tracking-[0.14em] text-teal uppercase">{title}</div>
                {support ? <p className="mt-0.5 truncate text-[11px] font-bold text-navy">{support}</p> : null}
              </div>

              <div className="flex items-center gap-1">
                {(
                  [
                    { id: "p1", label: "Rewrite", on: finale === "idle" && scanIdx >= 0, done: finale !== "idle" || doneCount > 0 },
                    { id: "p2", label: "One format", on: finale === "formatted", done: sealed },
                    { id: "p3", label: "Ready", on: sealed, done: sealed },
                  ] as const
                ).map((bead, i) => (
                  <div key={bead.id} className="flex items-center gap-1">
                    {i > 0 ? (
                      <span
                        className={cn("h-0.5 w-3 rounded-full transition-colors", bead.done || bead.on ? "bg-ok" : "bg-navy/10")}
                        aria-hidden
                      />
                    ) : null}
                    <motion.span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.06em]",
                        bead.on
                          ? bead.id === "p3"
                            ? "bg-ok text-white shadow-[0_6px_14px_rgba(14,138,114,0.35)]"
                            : "bg-teal text-white shadow-[0_6px_14px_rgba(14,154,167,0.35)]"
                          : bead.done
                            ? "bg-ok-soft text-ok"
                            : "bg-white text-muted-foreground ring-1 ring-navy/10",
                      )}
                      animate={bead.on && !reduce ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                      transition={{ duration: 1.1, repeat: bead.on ? Infinity : 0 }}
                    >
                      {bead.label}
                    </motion.span>
                  </div>
                ))}
              </div>

              <div className="relative grid size-12 shrink-0 place-items-center">
                <svg className="absolute inset-0 size-12 -rotate-90" viewBox="0 0 40 40" aria-hidden>
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(11,31,74,0.08)" strokeWidth="3.5" />
                  <motion.circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke={sealed ? "#0e8a72" : "#0e9aa7"}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeDasharray={`${(score / 100) * 100.5} 100.5`}
                    initial={false}
                    animate={{ strokeDasharray: `${(score / 100) * 100.5} 100.5` }}
                    transition={{ type: "spring", stiffness: 160, damping: 20 }}
                  />
                </svg>
                <span className="text-[10px] font-extrabold text-navy">{score}%</span>
              </div>
            </div>

            <div className="relative z-10 grid min-h-0 flex-1 grid-cols-[minmax(0,1.15fr)_minmax(0,1.1fr)] gap-2.5 overflow-hidden">
              {/* Left — funnel: many shapes → one format */}
              <div className="relative flex min-h-0 flex-col overflow-hidden rounded-[20px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(232,251,252,0.92)_100%)] px-2.5 pt-2.5 pb-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_28px_rgba(20,196,212,0.12)] ring-1 ring-teal/30">
                <div className="relative z-10 mb-1.5 flex shrink-0 items-center justify-between gap-2">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`${finale}-${live?.field ?? "idle"}-${cycle}`}
                      initial={reduce ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="min-w-0"
                    >
                      <div className="text-[8px] font-extrabold tracking-[0.14em] text-teal uppercase">
                        {sealed
                          ? "Format complete"
                          : formatted
                            ? "One clear format"
                            : live
                              ? `Rewriting · ${live.field}`
                              : "Ready"}
                      </div>
                      <b className="mt-0.5 block truncate font-display text-[14px] leading-tight font-extrabold text-navy">
                        {sealed
                          ? "Ready for one project file"
                          : formatted
                            ? "Board format locked"
                            : live
                              ? live.field
                              : "Field by field"}
                      </b>
                    </motion.div>
                  </AnimatePresence>
                  {!reduce && finale === "idle" && live ? (
                    <motion.span
                      className="shrink-0 rounded-full bg-teal px-2.5 py-1 text-[8px] font-extrabold text-white uppercase"
                      animate={{ opacity: [0.65, 1, 0.65], scale: [1, 1.04, 1] }}
                      transition={{ duration: 0.9, repeat: Infinity }}
                    >
                      Live
                    </motion.span>
                  ) : sealed ? (
                    <span className="shrink-0 rounded-full bg-ok px-2.5 py-1 text-[8px] font-extrabold text-white uppercase">Ok</span>
                  ) : formatted ? (
                    <span className="shrink-0 rounded-full bg-teal px-2.5 py-1 text-[8px] font-extrabold text-white uppercase">
                      Formatted
                    </span>
                  ) : null}
                </div>

                <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-2">
                  <div className="flex w-full flex-wrap items-center justify-center gap-1.5">
                    {["BBMP", "Plan", "ULB", "Builder"].map((tag, i) => (
                      <motion.span
                        key={tag}
                        className="rounded-full bg-white px-2 py-1 text-[8px] font-extrabold text-navy ring-1 ring-navy/10"
                        animate={
                          !reduce && finale === "idle"
                            ? { y: [0, -2, 0], opacity: [0.55, 1, 0.55] }
                            : { y: 0, opacity: formatted || sealed ? 0.35 : 0.7 }
                        }
                        transition={{ duration: 1.2, repeat: finale === "idle" ? Infinity : 0, delay: i * 0.12 }}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>

                  <motion.div
                    className={cn(
                      "relative grid size-[56px] place-items-center rounded-2xl text-white",
                      sealed ? "bg-ok" : "bg-teal",
                      stamp3dXl,
                    )}
                    animate={
                      reduce
                        ? undefined
                        : sealed
                          ? { scale: [1, 1.05, 1] }
                          : { rotate: [0, -4, 4, 0], scale: [1, 1.04, 1] }
                    }
                    transition={{ duration: sealed ? 1.4 : 1.1, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {sealed ? (
                      <ShieldCheck weight="fill" className="relative z-[1] size-7" />
                    ) : (
                      <Sparkle weight="fill" className="relative z-[1] size-7" />
                    )}
                  </motion.div>

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={live?.field ?? finale}
                      className="max-w-[92%] rounded-xl bg-white/95 px-3 py-2 text-center shadow-sm ring-1 ring-teal/25"
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                    >
                      {live && finale === "idle" ? (
                        <>
                          <p className="truncate text-[8px] font-semibold text-muted-foreground line-through decoration-risk/50">
                            {live.raw}
                          </p>
                          <b className="mt-0.5 block truncate text-[11px] font-extrabold text-navy">{live.clean}</b>
                        </>
                      ) : (
                        <b className="block text-[11px] font-extrabold text-navy">
                          {sealed ? "One clear Board format" : "Many shapes → one format"}
                        </b>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Right — fields lock into Board format */}
              <div className="relative flex min-h-0 flex-col overflow-hidden rounded-[20px] bg-white/90 p-2 ring-1 ring-navy/8">
                <div className="mb-1.5 flex items-center justify-between px-0.5">
                  <span className="text-[8px] font-extrabold tracking-[0.12em] text-teal uppercase">Board format</span>
                  <span className="text-[8px] font-extrabold text-navy">
                    {doneCount}/{PROCESS_ROWS.length}
                  </span>
                </div>
                <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
                  {PROCESS_ROWS.map((row, i) => {
                    const phase = rowPhase[i];
                    const hot = i === scanIdx && finale === "idle";
                    const locked = phase === "ok" || phase === "clean";
                    return (
                      <motion.div
                        key={row.field}
                        className={cn(
                          "relative flex min-h-0 flex-1 items-center gap-1.5 overflow-hidden rounded-xl px-1.5 py-0.5",
                          hot ? "bg-[#e7f7fa] ring-1 ring-teal/35" : locked ? "bg-[#f3fbf8]" : "bg-[#f6f8fb]",
                        )}
                        animate={hot && !reduce ? { x: [0, 2, 0] } : { x: 0 }}
                        transition={{ duration: 0.7, repeat: hot ? Infinity : 0 }}
                      >
                        <span
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded-lg",
                            locked || hot ? "bg-teal/15" : "bg-navy/5",
                          )}
                        >
                          {phase === "ok" ? (
                            <ShieldCheck weight="bold" className="size-3.5 text-teal" />
                          ) : hot ? (
                            <Sparkle weight="fill" className="size-3.5 text-teal" />
                          ) : (
                            <FileText weight="fill" className="size-3 text-navy/35" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="block truncate text-[8px] font-semibold text-muted-foreground">{row.field}</span>
                          <b className="block truncate text-[10px] font-bold text-navy">
                            {phase === "idle" ? row.raw : row.clean}
                          </b>
                        </span>
                        {hot && !reduce ? (
                          <motion.span
                            className="shrink-0 rounded-full bg-teal px-1.5 py-0.5 text-[7px] font-extrabold text-white uppercase"
                            animate={{ opacity: [0.75, 1, 0.75] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          >
                            Write
                          </motion.span>
                        ) : phase === "ok" ? (
                          <span className="shrink-0 text-[8px] font-extrabold text-teal uppercase">Ok</span>
                        ) : null}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-2 flex shrink-0 items-center gap-1.5 overflow-hidden">
              {PROCESS_FOOT_CHIPS.map((chip, i) => {
                const lit = reduce || finale !== "idle" || i <= Math.max(0, scanIdx);
                return (
                  <motion.span
                    key={chip.label}
                    className={cn(
                      "inline-flex min-w-0 flex-1 items-center gap-1 rounded-full bg-white/90 px-1.5 py-1 ring-1 ring-navy/8",
                      lit ? "opacity-100" : "opacity-35",
                    )}
                    title={chip.label}
                    animate={lit && !reduce && finale === "idle" && i === scanIdx ? { y: [0, -1.5, 0] } : { y: 0 }}
                    transition={{ duration: 0.9, repeat: i === scanIdx && finale === "idle" ? Infinity : 0 }}
                  >
                    <span className={cn("grid size-5 shrink-0 place-items-center rounded-full", stamp3dRound, chip.tone)}>
                      <chip.Icon weight="fill" className="relative z-[1] size-2.5" />
                    </span>
                    <b className="min-w-0 truncate text-[7px] font-bold text-navy">{chip.label}</b>
                  </motion.span>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** One project file — simple sealed Board file (no loader skeleton). */
function OneProjectHowRunsPanel({
  reduce,
  title = "How one file forms",
  support,
  fill = false,
  className,
}: {
  reduce: boolean;
  title?: string;
  support?: string;
  fill?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative flex min-h-0 flex-col overflow-hidden", fill && "flex-1", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: "radial-gradient(460px 200px at 50% 28%, rgba(14,138,114,0.16), transparent 68%)",
        }}
      />

      <div className="relative z-10 mb-2 flex shrink-0 items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-extrabold tracking-[0.14em] text-ok uppercase">{title}</div>
          {support ? <p className="mt-0.5 truncate text-[11px] font-bold text-navy">{support}</p> : null}
        </div>
        <div className="flex items-center gap-1">
          {(["Build", "Seal", "Ready"] as const).map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              {i > 0 ? <span className="h-0.5 w-3 rounded-full bg-ok" aria-hidden /> : null}
              <span className="rounded-full bg-ok-soft px-2 py-0.5 text-[8px] font-extrabold tracking-[0.06em] text-ok uppercase">
                {label}
              </span>
            </div>
          ))}
        </div>
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ok text-[10px] font-extrabold text-white ring-2 ring-ok/25">
          100%
        </span>
      </div>

      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-[minmax(0,1.15fr)_minmax(0,1.1fr)] gap-2.5 overflow-hidden">
        <motion.div
          className="relative flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-[20px] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(232,248,241,0.92)_100%)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_28px_rgba(14,138,114,0.12)] ring-1 ring-ok/30"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="mb-2 w-full text-center">
            <div className="text-[8px] font-extrabold tracking-[0.14em] text-ok uppercase">File ready</div>
            <b className="mt-0.5 block font-display text-[14px] font-extrabold text-navy">One Board project file</b>
          </div>
          <span className={cn("grid size-[64px] place-items-center rounded-2xl bg-ok text-white", stamp3dXl)}>
            <ShieldCheck weight="fill" className="relative z-[1] size-8" />
          </span>
          <div className="mt-3 w-full max-w-[92%] rounded-2xl bg-white/95 px-3 py-2.5 text-center shadow-sm ring-1 ring-ok/25">
            <div className="text-[8px] font-extrabold tracking-[0.14em] text-ok uppercase">Project ID</div>
            <b className="mt-1.5 inline-flex items-center rounded-lg bg-ok px-2.5 py-1 font-display text-[15px] leading-none font-extrabold tracking-tight text-white shadow-[0_6px_14px_rgba(14,138,114,0.35)] ring-2 ring-ok/25">
              {ABC_PROJECT.id}
            </b>
            <p className="mt-1.5 truncate text-[10px] font-bold text-muted-foreground">{ABC_PROJECT.name}</p>
            <p className="mt-0.5 truncate text-[9px] font-semibold text-ok">{ABC_PROJECT.place}</p>
          </div>
          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1">
            {["Matched", "Formatted", "One file"].map((tag) => (
              <span key={tag} className="rounded-full bg-ok-soft px-2 py-0.5 text-[8px] font-extrabold text-ok">
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="relative flex min-h-0 flex-col overflow-hidden rounded-[20px] bg-white/90 p-2 ring-1 ring-navy/8"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: reduce ? 0 : 0.08 }}
        >
          <div className="mb-1.5 flex items-center justify-between px-0.5">
            <span className="text-[8px] font-extrabold tracking-[0.12em] text-ok uppercase">Board project file</span>
            <span className="text-[8px] font-extrabold text-navy">
              {ONE_FILE_ROWS.length}/{ONE_FILE_ROWS.length}
            </span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
            {ONE_FILE_ROWS.map((row, i) => (
              <Stagger key={row.field} delay={10 + i * 12}>
                <div className="flex min-h-0 flex-1 items-center gap-1.5 rounded-xl bg-[#f3fbf8] px-1.5 py-0.5">
                  <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-ok/15">
                    <ShieldCheck weight="bold" className="size-3.5 text-ok" />
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-[8px] font-semibold text-muted-foreground">{row.field}</span>
                    {row.field === "Project ID" ? (
                      <b className="mt-0.5 inline-flex max-w-full truncate rounded-md bg-ok px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                        {row.value}
                      </b>
                    ) : (
                      <b className="block truncate text-[10px] font-bold text-navy">{row.value}</b>
                    )}
                  </span>
                  <span className="shrink-0 text-[8px] font-extrabold text-ok uppercase">Ok</span>
                </div>
              </Stagger>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 mt-2 flex shrink-0 items-center gap-1.5 overflow-hidden">
        {ONE_FOOT_CHIPS.map((chip) => (
          <span
            key={chip.label}
            className="inline-flex min-w-0 flex-1 items-center gap-1 rounded-full bg-white/90 px-1.5 py-1 ring-1 ring-navy/8"
            title={chip.label}
          >
            <span className={cn("grid size-5 shrink-0 place-items-center rounded-full", stamp3dRound, chip.tone)}>
              <chip.Icon weight="fill" className="relative z-[1] size-2.5" />
            </span>
            <b className="min-w-0 truncate text-[7px] font-bold text-navy">{chip.label}</b>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Central Platform — Board place holding the one project file (no loader skeleton). */
function CentralPlatformHowRunsPanel({
  reduce,
  title = "On Central Platform",
  support,
  fill = false,
  className,
}: {
  reduce: boolean;
  title?: string;
  support?: string;
  fill?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative flex min-h-0 flex-col overflow-hidden", fill && "flex-1", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            "radial-gradient(520px 240px at 30% 20%, rgba(26,78,138,0.14), transparent 62%), radial-gradient(420px 200px at 90% 80%, rgba(20,196,212,0.08), transparent 55%)",
        }}
      />

      <div className="relative z-10 mb-2 flex shrink-0 items-center gap-2.5">
        <div className="min-w-0 flex-1">
          <div className="text-[9px] font-extrabold tracking-[0.14em] text-[#1a4e8a] uppercase">{title}</div>
          {support ? <p className="mt-0.5 truncate text-[11px] font-bold text-navy">{support}</p> : null}
        </div>
        <span className="rounded-full bg-ok px-2.5 py-1 text-[8px] font-extrabold tracking-[0.08em] text-white uppercase shadow-[0_6px_14px_rgba(14,138,114,0.3)]">
          On platform
        </span>
      </div>

      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] gap-2.5 overflow-hidden">
        {/* Left — one hub: Project ID seal */}
        <motion.div
          className="relative flex min-h-0 flex-col items-center justify-center overflow-hidden rounded-[22px] bg-[linear-gradient(165deg,#ffffff_0%,#eaf2fa_100%)] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_14px_32px_rgba(26,78,138,0.14)] ring-1 ring-[#5b9bd5]/35"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36 }}
        >
          {!reduce ? (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#5b9bd5]/25"
              animate={{ scale: [0.92, 1.08, 0.92], opacity: [0.35, 0.12, 0.35] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null}

          <motion.span
            className={cn("relative z-[1] grid size-[68px] place-items-center rounded-2xl bg-[#1a4e8a] text-white", stamp3dXl)}
            animate={reduce ? undefined : { y: [0, -3, 0] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <Database weight="fill" className="relative z-[1] size-8" />
          </motion.span>

          <div className="relative z-[1] mt-3 w-full max-w-[94%] rounded-2xl bg-white px-3 py-3 text-center shadow-[0_10px_24px_rgba(26,78,138,0.12)] ring-1 ring-[#5b9bd5]/28">
            <div className="text-[8px] font-extrabold tracking-[0.14em] text-[#1a4e8a] uppercase">Project on platform</div>
            <b className="mt-1 block font-display text-[15px] leading-tight font-extrabold text-navy">
              {ABC_PROJECT.name}
            </b>
            <div className="mt-2 inline-flex items-center rounded-xl bg-[#1a4e8a] px-3 py-1.5 shadow-[0_8px_18px_rgba(26,78,138,0.35)] ring-2 ring-[#5b9bd5]/30">
              <b className="font-display text-[14px] leading-none font-extrabold tracking-tight text-white">
                {ABC_PROJECT.id}
              </b>
            </div>
            <p className="mt-2 text-[10px] font-bold text-[#1a4e8a]">{ABC_PROJECT.place}</p>
            <p className="mt-0.5 text-[9px] font-semibold text-muted-foreground">{ABC_PROJECT.category}</p>
          </div>

          <div className="relative z-[1] mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
            {[
              { label: "One file", tone: "bg-ok text-white" },
              { label: "Board owned", tone: "bg-[#1a4e8a] text-white" },
              { label: "Ready next", tone: "bg-teal text-white" },
            ].map((tag) => (
              <span key={tag.label} className={cn("rounded-full px-2.5 py-0.5 text-[8px] font-extrabold", tag.tone)}>
                {tag.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right — held stamps + next Board work */}
        <div className="relative flex min-h-0 flex-col gap-2 overflow-hidden">
          <motion.div
            className="grid min-h-0 flex-1 grid-cols-2 content-start gap-1.5 overflow-hidden"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: reduce ? 0 : 0.06 }}
          >
            {CENTRAL_HOLD_ROWS.map((row, i) => (
              <Stagger key={row.field} delay={8 + i * 10}>
                <div className="flex h-full min-h-[52px] flex-col justify-center rounded-2xl bg-white/95 px-2.5 py-2 shadow-[0_6px_16px_rgba(26,78,138,0.08)] ring-1 ring-[#5b9bd5]/20">
                  <div className="flex items-center gap-1.5">
                    <span className="grid size-6 shrink-0 place-items-center rounded-lg bg-[#1a4e8a]/12 text-[#1a4e8a]">
                      <ShieldCheck weight="bold" className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-[8px] font-extrabold tracking-[0.06em] text-[#1a4e8a] uppercase">
                      {row.field}
                    </span>
                  </div>
                  {row.field === "Project ID" ? (
                    <b className="mt-1.5 inline-flex w-fit max-w-full truncate rounded-md bg-[#1a4e8a] px-1.5 py-0.5 text-[9px] font-extrabold text-white">
                      {row.value}
                    </b>
                  ) : (
                    <b className="mt-1 block truncate text-[11px] font-bold text-navy">{row.value}</b>
                  )}
                </div>
              </Stagger>
            ))}
          </motion.div>

          <motion.div
            className="shrink-0 rounded-2xl bg-[#1a4e8a] px-2.5 py-2 text-white shadow-[0_10px_24px_rgba(26,78,138,0.28)]"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: reduce ? 0 : 0.12 }}
          >
            <div className="mb-1.5 text-[8px] font-extrabold tracking-[0.12em] text-[#a8d4ef] uppercase">
              Next Board work on this file
            </div>
            <div className="flex items-center justify-between gap-1">
              {CENTRAL_NEXT_STEPS.map((step) => (
                <div key={step.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
                  <span
                    className="grid size-8 place-items-center rounded-xl bg-white/15 ring-1 ring-white/20"
                    title={step.detail}
                  >
                    <step.Icon weight="fill" className="size-3.5 text-[#a8d4ef]" />
                  </span>
                  <b className="truncate text-[8px] font-bold text-white">{step.label}</b>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 mt-2 flex shrink-0 items-center justify-center gap-2 overflow-hidden">
        {CENTRAL_FOOT_CHIPS.slice(0, 4).map((chip) => (
          <span
            key={chip.label}
            className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 shadow-sm ring-1 ring-navy/8"
            title={chip.label}
          >
            <span className={cn("grid size-5 shrink-0 place-items-center rounded-full", stamp3dRound, chip.tone)}>
              <chip.Icon weight="fill" className="relative z-[1] size-2.5" />
            </span>
            <b className="text-[8px] font-bold text-navy">{chip.label}</b>
          </span>
        ))}
      </div>
    </div>
  );
}


function MiddlewarePlaque({
  hub,
  reduce,
  intakeRef,
  receiveTick = 0,
  journeyUnlock = 0,
}: {
  hub: HubStep;
  reduce: boolean;
  intakeRef?: RefObject<HTMLDivElement | null>;
  receiveTick?: number;
  journeyUnlock?: number;
}) {
  const pathCount = PROTOCOLS.length;
  const activePath = pathCount ? receiveTick % pathCount : 0;
  const filledPaths = Math.min(pathCount, (receiveTick % (pathCount + 2)) + 1);
  const activeDetail = hub.fields.length ? receiveTick % hub.fields.length : 0;
  const filledDetails = Math.min(hub.fields.length, (receiveTick % (hub.fields.length + 1)) + 1);
  const active = PROTOCOLS[activePath];
  const matchValidateLive = journeyUnlock === 1;
  const processLive = journeyUnlock === 2;
  const oneProjectLive = journeyUnlock === 3;
  const centralLive = journeyUnlock === 4;
  const matchHub = HUB_BY_BEAT.find((h) => h.id === "match") ?? hub;

  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden rounded-[24px]",
        matchValidateLive
          ? "bg-[linear-gradient(165deg,#fffdf6_0%,#ffffff_42%,#fff8e8_100%)] shadow-[0_18px_42px_rgba(240,193,74,0.22)] ring-1 ring-gold/40"
          : oneProjectLive
            ? "bg-[linear-gradient(165deg,#f1fbf7_0%,#ffffff_42%,#e8f7f1_100%)] shadow-[0_18px_42px_rgba(14,138,114,0.18)] ring-1 ring-ok/35"
            : centralLive
              ? "bg-[linear-gradient(165deg,#f3f7fc_0%,#ffffff_42%,#e8f1fa_100%)] shadow-[0_18px_42px_rgba(26,78,138,0.18)] ring-1 ring-[#5b9bd5]/40"
              : "bg-[linear-gradient(165deg,#f7fbfd_0%,#ffffff_42%,#f3fafb_100%)] shadow-[0_18px_42px_rgba(14,154,167,0.16)] ring-1 ring-teal/25",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: matchValidateLive
            ? "radial-gradient(520px 220px at 0% 45%, rgba(240,193,74,0.2), transparent 60%), radial-gradient(420px 200px at 100% 0%, rgba(196,92,38,0.08), transparent 55%)"
            : oneProjectLive
              ? "radial-gradient(520px 220px at 0% 45%, rgba(14,138,114,0.16), transparent 60%), radial-gradient(420px 200px at 100% 0%, rgba(20,196,212,0.06), transparent 55%)"
              : centralLive
                ? "radial-gradient(520px 220px at 0% 45%, rgba(26,78,138,0.16), transparent 60%), radial-gradient(420px 200px at 100% 0%, rgba(91,155,213,0.1), transparent 55%)"
                : "radial-gradient(520px 220px at 0% 45%, rgba(20,196,212,0.16), transparent 60%), radial-gradient(420px 200px at 100% 0%, rgba(20,118,232,0.08), transparent 55%)",
        }}
      />

      {/* Bridge dock — mid-plaque fallback when receive IN is not on screen */}
      {matchValidateLive || processLive || oneProjectLive || centralLive ? (
        <div
          ref={intakeRef}
          className="pointer-events-none absolute top-1/2 -left-1 z-30 size-3 -translate-y-1/2 opacity-0"
          aria-hidden
        />
      ) : null}

      {/* Header */}
      <div className="relative z-10 flex shrink-0 items-center gap-3 border-b border-navy/6 px-3.5 py-2.5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={
              matchValidateLive
                ? "match-icon"
                : processLive
                  ? "process-icon"
                  : oneProjectLive
                    ? "one-icon"
                    : centralLive
                      ? "central-icon"
                      : "mw-icon"
            }
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-2xl",
              matchValidateLive
                ? cn("bg-gold text-gold-ink shadow-[0_10px_20px_rgba(240,193,74,0.4)]", stamp3dXl)
                : processLive
                  ? cn("bg-teal text-white shadow-[0_10px_20px_rgba(14,154,167,0.4)]", stamp3dXl)
                  : oneProjectLive
                    ? cn("bg-ok text-white shadow-[0_10px_20px_rgba(14,138,114,0.4)]", stamp3dXl)
                    : centralLive
                      ? cn("bg-[#1a4e8a] text-white shadow-[0_10px_20px_rgba(26,78,138,0.4)]", stamp3dXl)
                      : "bg-teal text-navy-deep shadow-[0_10px_20px_rgba(14,154,167,0.35)]",
            )}
            initial={reduce ? false : { opacity: 0, scale: 0.86, rotate: -8 }}
            animate={{ opacity: 1, scale: 1, rotate: 0, y: reduce ? 0 : [0, -2, 0] }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.86 }}
            transition={{
              opacity: { duration: 0.25 },
              scale: { type: "spring", stiffness: 420, damping: 24 },
              y: { duration: 2.4, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            {matchValidateLive ? (
              <TreeStructure weight="duotone" className="relative z-[1] size-6" />
            ) : processLive ? (
              <Sparkle weight="fill" className="relative z-[1] size-6" />
            ) : oneProjectLive ? (
              <ShieldCheck weight="fill" className="relative z-[1] size-6" />
            ) : centralLive ? (
              <Database weight="fill" className="relative z-[1] size-6" />
            ) : (
              <Plugs weight="fill" className="size-6" />
            )}
          </motion.span>
        </AnimatePresence>
        <div className="min-w-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={
                matchValidateLive
                  ? "match-copy"
                  : processLive
                    ? "process-copy"
                    : oneProjectLive
                      ? "one-copy"
                      : centralLive
                        ? "central-copy"
                        : "mw-copy"
              }
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.28 }}
            >
              <div className="font-display text-[18px] leading-none font-extrabold text-navy">
                {matchValidateLive
                  ? matchHub.hub
                  : processLive
                    ? "Process"
                    : oneProjectLive
                      ? "One project file"
                      : centralLive
                        ? "Central Platform"
                        : hub.hub}
              </div>
              <div
                className={cn(
                  "mt-1 text-[12px] font-semibold",
                  matchValidateLive
                    ? "text-gold-deep"
                    : oneProjectLive
                      ? "text-ok"
                      : centralLive
                        ? "text-[#1a4e8a]"
                        : "text-teal",
                )}
              >
                {matchValidateLive
                  ? matchHub.sub
                  : processLive
                    ? "Office details → one clear Board format"
                    : oneProjectLive
                      ? "One Project ID for all later Board work"
                      : centralLive
                        ? "The Board place that holds the one project file"
                        : hub.sub}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {!matchValidateLive && !processLive && !oneProjectLive && !centralLive ? (
            <>
              <span className="rounded-full bg-navy px-2.5 py-1 text-[8px] font-extrabold tracking-[0.12em] text-teal-bright uppercase">
                Signal board
              </span>
              <div className="flex items-center gap-1">
                {PROTOCOLS.map((_, i) => (
                  <motion.span
                    key={`dot-${i}`}
                    className="size-1.5 rounded-full"
                    animate={{
                      backgroundColor: i < filledPaths ? "#0e9aa7" : "rgba(11,31,74,0.15)",
                      scale: i === activePath ? [1, 1.35, 1] : 1,
                    }}
                    transition={{ duration: 0.55 }}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>

      {matchValidateLive ? (
        <div className="relative z-10 min-h-0 flex-1 overflow-hidden p-2.5">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-[linear-gradient(180deg,rgba(248,239,214,0.55)_0%,rgba(255,255,255,0.95)_38%)] p-2.5 ring-1 ring-gold/35">
            <MatchHowRunsPanel
              reduce={reduce}
              fill
              title="How match runs"
              support="A meets B · then green seal"
            />
          </div>
        </div>
      ) : processLive ? (
        <div className="relative z-10 min-h-0 flex-1 overflow-hidden p-2.5">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-[linear-gradient(180deg,rgba(214,245,248,0.55)_0%,rgba(255,255,255,0.95)_38%)] p-2.5 ring-1 ring-teal/35">
            <ProcessHowRunsPanel
              reduce={reduce}
              fill
              title="How process runs"
              support="Load · rewrite · one clear format"
            />
          </div>
        </div>
      ) : oneProjectLive ? (
        <div className="relative z-10 min-h-0 flex-1 overflow-hidden p-2.5">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-[linear-gradient(180deg,rgba(214,245,232,0.55)_0%,rgba(255,255,255,0.95)_38%)] p-2.5 ring-1 ring-ok/35">
            <OneProjectHowRunsPanel
              reduce={reduce}
              fill
              title="How one file forms"
              support="One Project ID · Board file ready"
            />
          </div>
        </div>
      ) : centralLive ? (
        <div className="relative z-10 min-h-0 flex-1 overflow-hidden p-2.5">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-[linear-gradient(180deg,rgba(214,230,245,0.55)_0%,rgba(255,255,255,0.95)_38%)] p-2.5 ring-1 ring-[#5b9bd5]/40">
            <CentralPlatformHowRunsPanel
              reduce={reduce}
              fill
              title="On Central Platform"
              support="One project file · ready for Board work"
            />
          </div>
        </div>
      ) : (
      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)] gap-2.5 overflow-hidden p-2.5">
        <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key="receive-left"
              className="relative grid min-h-0 grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden rounded-[20px] bg-white/85 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_12px_28px_rgba(20,118,232,0.08)] ring-1 ring-navy/8"
              initial={reduce ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0, x: 8 }}
              transition={{ duration: 0.32 }}
            >
              <div className="mb-1.5 flex min-w-0 items-center gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] font-extrabold tracking-[0.14em] text-teal uppercase">Step-by-step receive</div>
                  <p className="truncate text-[10px] font-bold text-navy">One path at a time into Smart Middleware</p>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active?.label ?? "step"}
                    className="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5"
                    style={{ background: active?.soft, boxShadow: `0 0 0 1.5px ${active?.ring}` }}
                    initial={reduce ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduce ? undefined : { opacity: 0 }}
                  >
                    <span className="text-[8px] font-extrabold text-muted-foreground">
                      {activePath + 1}/{pathCount}
                    </span>
                    <span className="grid size-5 place-items-center rounded-full text-white" style={{ background: active?.accent }}>
                      {active ? <active.Icon weight="fill" className="size-2.5" /> : null}
                    </span>
                    <span className="max-w-[72px] truncate text-[9px] font-extrabold text-navy">{active?.label}</span>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="relative min-h-0 overflow-hidden rounded-xl bg-[linear-gradient(135deg,rgba(234,244,255,0.9),rgba(232,251,252,0.85))] ring-1 ring-teal/15">
                <div className="absolute top-1/2 left-1.5 z-20 flex -translate-y-1/2 flex-col items-center gap-0.5">
                  {!reduce ? (
                    <motion.span
                      className="pointer-events-none absolute top-[18px] left-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border border-teal/45"
                      animate={{ scale: [0.85, 1.55], opacity: [0.5, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                      aria-hidden
                    />
                  ) : null}
                  <div className="relative grid size-9 place-items-center rounded-xl bg-white shadow-[0_6px_14px_rgba(20,118,232,0.2)] ring-2 ring-[#1476e8]/28">
                    <span
                      ref={intakeRef}
                      className="pointer-events-none absolute -left-2 top-1/2 size-2.5 -translate-y-1/2 rounded-full bg-teal shadow-[0_0_0_3px_rgba(20,196,212,0.4)]"
                      aria-hidden
                    />
                    <CloudArrowUp weight="fill" className="size-4 text-[#1476e8]" />
                  </div>
                  <span className="rounded-full bg-white/90 px-1 py-px text-[6px] font-extrabold text-[#1476e8] uppercase shadow-sm">
                    In
                  </span>
                </div>

                <svg className="pointer-events-none absolute inset-0 z-[1] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
                  {PROTOCOLS.map((item, i) => {
                    const col = i % 3;
                    const row = Math.floor(i / 3);
                    const x2 = 30 + col * 24 + 8;
                    const y2 = 24 + row * 46;
                    const on = i === activePath;
                    const done = i < filledPaths;
                    return (
                      <path
                        key={`wire-${item.label}`}
                        d={`M 12 50 C 20 50, ${x2 - 8} ${y2}, ${x2} ${y2}`}
                        fill="none"
                        stroke={on ? item.accent : done ? `${item.accent}99` : "rgba(11,31,74,0.1)"}
                        strokeWidth={on ? 1.6 : 1}
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        opacity={on ? 1 : done ? 0.7 : 0.45}
                      />
                    );
                  })}
                </svg>

                {!reduce && active ? (
                  <motion.span
                    key={`pkt-${active.label}-${receiveTick}`}
                    className="absolute z-[5] grid size-6 place-items-center rounded-full bg-white"
                    style={{
                      boxShadow: `0 0 0 2px ${active.accent}, 0 6px 12px ${active.soft}`,
                    }}
                    initial={{ left: "10%", top: "50%", opacity: 0, scale: 0.7, x: "-50%", y: "-50%" }}
                    animate={{
                      left: `${30 + (activePath % 3) * 24 + 8}%`,
                      top: `${24 + Math.floor(activePath / 3) * 46}%`,
                      opacity: [0, 1, 1, 0],
                      scale: [0.7, 1, 1, 0.75],
                      x: "-50%",
                      y: "-50%",
                    }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  >
                    <FileText weight="fill" className="size-2.5" style={{ color: active.accent }} />
                  </motion.span>
                ) : null}

                <div className="absolute inset-y-1.5 right-1.5 left-[20%] z-[2] grid grid-cols-3 grid-rows-2 gap-1">
                  {PROTOCOLS.map((item, i) => {
                    const on = i === activePath;
                    const done = i < filledPaths && !on;
                    return (
                      <div key={item.label} className="relative flex min-h-0 flex-col items-center justify-center gap-0.5 overflow-hidden">
                        <motion.span
                          className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-white"
                          style={{
                            boxShadow: on
                              ? `0 0 0 2.5px ${item.soft}, 0 8px 16px ${item.soft}`
                              : done
                                ? `0 0 0 1.5px ${item.soft}`
                                : "0 4px 10px rgba(7,20,51,0.08)",
                          }}
                          animate={on && !reduce ? { boxShadow: [`0 0 0 2px ${item.soft}`, `0 0 0 4px ${item.soft}`, `0 0 0 2px ${item.soft}`] } : undefined}
                          transition={{ duration: 1.2, repeat: on ? Infinity : 0, ease: "easeInOut" }}
                        >
                          <span
                            className="grid size-8 place-items-center rounded-lg"
                            style={{ background: on || done ? item.accent : "rgba(11,31,74,0.1)" }}
                          >
                            <img
                              src={item.icon3d}
                              alt=""
                              aria-hidden
                              draggable={false}
                              className={cn(
                                "size-5 object-contain select-none",
                                !on && !done ? "opacity-40 grayscale" : "drop-shadow-[0_2px_4px_rgba(7,20,51,0.18)]",
                              )}
                            />
                          </span>
                          {done ? (
                            <span className="absolute -right-0.5 -bottom-0.5 grid size-3.5 place-items-center rounded-full bg-white text-teal ring-1 ring-teal/30">
                              <ShieldCheck weight="bold" className="size-2" />
                            </span>
                          ) : null}
                          {on ? (
                            <span
                              className="absolute -top-1.5 rounded-full px-1 py-px text-[6px] font-extrabold text-white uppercase"
                              style={{ background: item.accent }}
                            >
                              Now
                            </span>
                          ) : null}
                        </motion.span>
                        <span className={cn("max-w-full truncate px-0.5 text-center text-[7px] font-bold leading-none", on ? "text-navy" : "text-muted-foreground")}>
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-1.5 flex shrink-0 items-center gap-1.5 rounded-lg bg-[linear-gradient(90deg,rgba(20,196,212,0.12),rgba(14,138,114,0.1))] px-2 py-1">
                <FolderSimple weight="fill" className="size-3.5 shrink-0 text-teal" />
                <span className="shrink-0 text-[7px] font-extrabold tracking-[0.1em] text-teal uppercase">One format</span>
                <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/85 ring-1 ring-teal/20">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#1476e8,#14c4d4,#0e8a72)]"
                    animate={{ width: `${(filledPaths / pathCount) * 100}%` }}
                    transition={{ type: "spring", stiffness: 280, damping: 24 }}
                  />
                </div>
                <span className="shrink-0 text-[8px] font-extrabold text-navy">
                  {filledPaths}/{pathCount}
                </span>
              </div>
            </motion.div>
        </AnimatePresence>

        {/* RIGHT — lock-in details */}
        <div className="relative flex min-h-0 flex-col overflow-hidden rounded-2xl bg-white/90 p-2 ring-1 ring-navy/8">
          <motion.div
            key="lock-file"
            className="flex min-h-0 flex-1 flex-col"
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
          >
                <div className="mb-1.5 flex items-center gap-1.5">
                  <img
                    src={icon3dScales}
                    alt=""
                    aria-hidden
                    draggable={false}
                    className="size-6 object-contain select-none"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[9px] font-extrabold tracking-[0.14em] text-teal uppercase">Lock into file</div>
                    <p className="truncate text-[10px] font-bold text-navy">{ABC_PROJECT.name}</p>
                  </div>
                </div>

                <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
                  {hub.fields.map(([k, v], i) => {
                    const locked = i < filledDetails;
                    const hot = i === activeDetail;
                    const icon3d = DETAIL_ICONS_3D[k] ?? icon3dFile;
                    return (
                      <motion.li
                        key={k}
                        className={cn(
                          "relative flex min-h-0 flex-1 items-center gap-1.5 overflow-hidden rounded-xl px-1.5 py-0.5",
                          hot ? "bg-[#e7f7fa] ring-1 ring-teal/35" : locked ? "bg-[#f3fbf8]" : "bg-[#f6f8fb]",
                        )}
                        animate={hot && !reduce ? { x: [0, 2, 0] } : { x: 0 }}
                        transition={{ duration: 0.7, repeat: hot ? Infinity : 0 }}
                      >
                        <span
                          className={cn(
                            "grid size-6 shrink-0 place-items-center rounded-lg",
                            locked || hot ? "bg-teal/15" : "bg-navy/5",
                          )}
                        >
                          {locked || hot ? (
                            <ShieldCheck weight="bold" className="size-3.5 text-teal" />
                          ) : (
                            <img src={icon3d} alt="" className="size-4 object-contain opacity-50" draggable={false} />
                          )}
                        </span>
                        <span className="min-w-0 flex-1 leading-tight">
                          <span className="block truncate text-[8px] font-semibold text-muted-foreground">{k}</span>
                          <b className="block truncate text-[10px] font-bold text-navy">{v}</b>
                        </span>
                        {hot && !reduce ? (
                          <motion.span
                            className="shrink-0 rounded-full bg-teal px-1.5 py-0.5 text-[7px] font-extrabold text-white uppercase"
                            animate={{ opacity: [0.75, 1, 0.75] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          >
                            Write
                          </motion.span>
                        ) : locked ? (
                          <span className="shrink-0 text-[8px] font-extrabold text-teal uppercase">Ok</span>
                        ) : null}
                      </motion.li>
                    );
                  })}
                </ul>
          </motion.div>
        </div>
      </div>
      )}
    </div>
  );
}

function ReceiveFlowStage({ reduce }: { reduce: boolean }) {
  return (
    <OfficeToHubStage
      reduce={reduce}
      kicker="Arriving for one project"
      support="Six offices send ABC details into one inbox."
      badge={`${SOURCES.length} packets`}
      badgeClass="bg-[#e8f1fa] text-[#1a4e8a]"
      officeTone="receive"
      hub={{
        ringClass: "border-[#5b9bd5]/30",
        cardClass: "bg-[#1a4e8a] text-white shadow-[0_16px_36px_rgba(26,78,138,0.4)] ring-4 ring-[#5b9bd5]/35",
        iconWrapClass: "bg-[#5b9bd5] text-white",
        Icon: Database,
        kicker: "Central inbox",
        kickerClass: "text-[#a8d4ef]",
        title: "ABC project",
        chip: "Still separate",
      }}
    />
  );
}

/** Right plaque — receive detail matching Smart Middleware craft. */
function ReceivePlaque({ hub, reduce }: { hub: HubStep; reduce: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_14px_36px_rgba(91,155,213,0.16)] ring-1 ring-[#5b9bd5]/30">
      <div className="shrink-0 border-b border-navy/6 bg-[linear-gradient(180deg,rgba(91,155,213,0.12)_0%,rgba(255,255,255,0)_100%)] px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <motion.span
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#1a4e8a] text-white shadow-[0_8px_18px_rgba(26,78,138,0.35)]"
            animate={reduce ? undefined : { y: [0, -2, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <hub.Icon weight="duotone" className="size-6" />
          </motion.span>
          <div className="min-w-0">
            <div className="font-display text-[18px] leading-none font-extrabold text-navy">{hub.hub}</div>
            <div className="mt-1 text-[12px] font-semibold text-[#1a4e8a]">{hub.sub}</div>
            <div className="mt-0.5 text-[9px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
              Same project · many offices in
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-2.5 py-2.5">
        <div className="relative shrink-0 overflow-hidden rounded-2xl bg-[#e8f1fa] px-3 py-3 ring-1 ring-[#5b9bd5]/25">
          <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,0.9fr)] items-center gap-2">
            <div className="min-w-0 pl-1 text-left">
              <p
                className="font-display text-[13px] leading-snug font-extrabold text-navy/80"
                style={{ transform: "rotate(-6deg)" }}
              >
                Six offices
              </p>
              <p
                className="mt-0.5 font-display text-[12px] leading-snug font-bold text-[#1a4e8a]"
                style={{ transform: "rotate(-6deg)" }}
              >
                One inbox
              </p>
              <span
                aria-hidden
                className="mt-1 block h-0.5 w-14 rounded-full bg-[#5b9bd5]/55"
                style={{ transform: "rotate(-6deg)" }}
              />
            </div>

            <div className="min-w-0 text-center">
              <span className="inline-flex rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-extrabold tracking-[0.16em] text-[#1a4e8a] uppercase ring-1 ring-[#5b9bd5]/25">
                Same project · many offices
              </span>
              <b className="mt-2 block font-display text-[18px] leading-tight font-extrabold tracking-tight text-navy">
                {ABC_PROJECT.name}
              </b>
              <p className="mt-1.5 text-[12px] font-semibold text-[#1a4e8a]">
                {ABC_PACKETS.length} packets received · still separate
              </p>
            </div>

            <div className="min-w-0 pr-1 text-right">
              <p
                className="font-display text-[12px] leading-snug font-extrabold text-navy/80"
                style={{ transform: "rotate(5deg)" }}
              >
                All arrived
              </p>
              <p
                className="mt-0.5 font-display text-[12px] leading-snug font-bold text-[#1a4e8a]"
                style={{ transform: "rotate(5deg)" }}
              >
                Not one file yet
              </p>
              <p
                className="mt-0.5 font-display text-[12px] leading-snug font-bold text-navy/70"
                style={{ transform: "rotate(5deg)" }}
              >
                Match next
              </p>
              <span
                aria-hidden
                className="ml-auto mt-1 block h-0.5 w-16 rounded-full bg-[#5b9bd5]/55"
                style={{ transform: "rotate(5deg)" }}
              />
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-hidden">
          <div className="flex min-h-0 flex-col gap-1.5 overflow-auto border-r border-navy/8 pr-2">
            <ul className="overflow-hidden rounded-xl ring-1 ring-navy/8">
              {hub.fields.map(([k, v], i) => (
                <Stagger key={k} delay={12 + i * 14}>
                  <li
                    className={cn(
                      "flex items-baseline justify-between gap-2 px-2.5 py-1.5",
                      i % 2 === 0 ? "bg-white" : "bg-[#e8f1fa]/70",
                      i > 0 && "border-t border-navy/5",
                    )}
                  >
                    <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">{k}</span>
                    <b className="text-right text-[12px] leading-snug font-bold text-navy">{v}</b>
                  </li>
                </Stagger>
              ))}
            </ul>

            <div className="grid grid-cols-2 gap-1.5">
              {hub.points.map((label, i) => (
                <Stagger key={label} delay={30 + i * 16}>
                  <div className="flex items-center gap-1.5 rounded-xl bg-white px-2 py-2 shadow-sm ring-1 ring-navy/[0.05]">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#1a4e8a] text-white">
                      {i === 0 ? (
                        <Buildings weight="fill" className="size-3.5" />
                      ) : i === 1 ? (
                        <ClipboardText weight="fill" className="size-3.5" />
                      ) : i === 2 ? (
                        <Database weight="fill" className="size-3.5" />
                      ) : (
                        <MagnifyingGlass weight="fill" className="size-3.5" />
                      )}
                    </span>
                    <b className="text-[11px] leading-tight text-navy">{label}</b>
                  </div>
                </Stagger>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-1.5 overflow-auto pl-0.5">
            <div>
              <div className="mb-1 text-[9px] font-extrabold tracking-[0.14em] text-[#1a4e8a] uppercase">
                ABC packets · just arrived
              </div>
              <ul className="space-y-1">
                {ABC_PACKETS.map((item, i) => (
                  <Stagger key={item.office} delay={40 + i * 14}>
                    <li className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 shadow-sm ring-1 ring-navy/[0.05]">
                      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-[#e8f1fa] text-[#1a4e8a] ring-1 ring-[#5b9bd5]/25">
                        <item.Icon weight="fill" className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-[12px] text-navy">{item.office}</b>
                        <span className="block truncate text-[10px] font-semibold text-muted-foreground">{item.holds}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-[#e8f1fa] px-2 py-0.5 text-[10px] font-bold text-[#1a4e8a]">
                        {item.when}
                      </span>
                    </li>
                  </Stagger>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-1 text-[9px] font-extrabold tracking-[0.14em] text-[#1a4e8a] uppercase">
                What happens next
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {RECEIVE_HOW.map((step, i) => (
                  <Stagger key={step.label} delay={55 + i * 14}>
                    <span className="flex items-center gap-1.5 rounded-lg bg-white px-2 py-1.5 shadow-sm ring-1 ring-navy/[0.05]">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[#e8f1fa] text-[#1a4e8a]">
                        <step.Icon weight="fill" className="size-3" />
                      </span>
                      <span className="min-w-0 flex-1 text-[11px] leading-tight font-bold text-navy">{step.label}</span>
                      {i < RECEIVE_HOW.length - 1 ? (
                        <span className="text-[10px] font-extrabold text-[#5b9bd5]/60">↓</span>
                      ) : (
                        <span className="rounded-full bg-[#e8f1fa] px-1.5 py-0.5 text-[9px] font-extrabold text-[#1a4e8a]">
                          Next
                        </span>
                      )}
                    </span>
                  </Stagger>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Three-dot transfer line — packets travel toward Match & merge. */
function MatchTransferDots({
  reduce,
  toward,
  className,
}: {
  reduce: boolean;
  toward: "right" | "left";
  className?: string;
}) {
  const order = toward === "right" ? [0, 1, 2] : [2, 1, 0];

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-1/2 z-[15] flex h-5 w-[64px] -translate-y-1/2 items-center justify-between px-0.5",
        className,
      )}
      aria-hidden
    >
      {/* Soft rail */}
      <span className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-white/70 shadow-[0_0_6px_rgba(255,255,255,0.5)]" />

      {/* Station dots — light in transfer order */}
      {order.map((wave, i) => (
        <motion.span
          key={i}
          className="relative z-[1] size-2 rounded-full bg-white shadow-[0_2px_8px_rgba(14,154,167,0.45)] ring-1 ring-teal/35"
          animate={
            reduce
              ? undefined
              : {
                  scale: [0.7, 1.35, 0.7],
                  opacity: [0.3, 1, 0.3],
                }
          }
          transition={{
            duration: 1.15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: wave * 0.2,
          }}
        />
      ))}

      {/* Traveling packet */}
      {!reduce ? (
        <motion.span
          className="absolute top-1/2 z-[2] size-2.5 -translate-y-1/2 rounded-full bg-teal-bright shadow-[0_0_12px_rgba(20,196,212,0.9)] ring-2 ring-white/80"
          initial={toward === "right" ? { left: "4%", opacity: 0 } : { right: "4%", opacity: 0 }}
          animate={
            toward === "right"
              ? { left: ["4%", "88%"], opacity: [0, 1, 1, 0] }
              : { right: ["4%", "88%"], opacity: [0, 1, 1, 0] }
          }
          transition={{ duration: 1.55, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.25 }}
        />
      ) : null}
    </div>
  );
}

/** Floating 3D tile — perspective tilt + thickness + soft hover float. */
function MatchTile3D({
  reduce,
  tilt,
  className,
  children,
  delay = 0,
}: {
  reduce: boolean;
  tilt: "left" | "right" | "front";
  className?: string;
  children: ReactNode;
  delay?: number;
}) {
  const pose =
    tilt === "left"
      ? { rotateY: 18, rotateX: 10, rotateZ: -2 }
      : tilt === "right"
        ? { rotateY: -18, rotateX: 10, rotateZ: 2 }
        : { rotateY: 0, rotateX: 12, rotateZ: 0, scale: 1.06 };

  return (
    <div className={cn("relative w-full", className)} style={{ perspective: 900 }}>
      <motion.div
        className="relative"
        style={{ transformStyle: "preserve-3d", transformPerspective: 900 }}
        animate={
          reduce
            ? pose
            : {
                ...pose,
                y: [0, tilt === "front" ? -6 : -4, 0],
              }
        }
        transition={
          reduce
            ? { duration: 0.35 }
            : { duration: tilt === "front" ? 2.2 : 2.5, repeat: Infinity, ease: "easeInOut", delay }
        }
      >
        {/* Ground shadow */}
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-x-2 -bottom-3 h-5 rounded-[50%] bg-navy/30 blur-[7px]"
          style={{ transform: "translateZ(-14px) rotateX(75deg) scaleX(0.92)" }}
        />
        {/* Extruded thickness */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[4px] top-[6px] bottom-[-7px] -z-10 rounded-[18px] bg-navy/35"
          style={{ transform: "translateZ(-8px)" }}
        />
        {children}
      </motion.div>
    </div>
  );
}

/** Shared face chrome for Match 3D tiles. */
const matchTileFace =
  "relative overflow-hidden [transform-style:preserve-3d] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-[48%] before:rounded-t-[20px] before:bg-[linear-gradient(180deg,rgba(255,255,255,0.32),transparent)] before:content-['']";

/** Left stage — ABC site photo with match compare overlaid (reference desk look). */
function MatchFlowStage({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] shadow-[0_12px_32px_rgba(7,20,51,0.12)] ring-1 ring-navy/10"
      initial={reduce ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <img
        src={matchStageBg}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_40%] select-none"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, rgba(247,250,253,0.55) 0%, rgba(247,250,253,0.18) 28%, rgba(247,250,253,0.08) 55%, rgba(11,31,74,0.12) 100%),
            radial-gradient(ellipse 75% 50% at 50% 70%, rgba(255,255,255,0.35) 0%, transparent 70%)
          `,
        }}
      />

      {/* Feature stamps — right rail on the site */}
      <div className="absolute top-3 right-3 z-20 flex w-[148px] flex-col gap-1.5 [perspective:600px]">
        {MATCH_FEATURES.map((item, i) => (
          <Stagger key={item.label} delay={40 + i * 50}>
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full bg-white/95 px-2 py-1.5 ring-1 ring-navy/10 backdrop-blur-[2px]",
                "shadow-[0_2px_0_0_rgba(200,210,230,0.85),0_8px_14px_rgba(7,20,51,0.12)]",
              )}
              style={reduce ? undefined : { transform: "rotateX(8deg) rotateY(-6deg)" }}
            >
              <span className={cn("grid size-6 shrink-0 place-items-center rounded-full bg-gold text-gold-ink", stamp3dRound)}>
                <item.Icon weight="fill" className="relative z-[1] size-3" />
              </span>
              <b className="text-[10px] leading-tight text-navy">{item.label}</b>
            </span>
          </Stagger>
        ))}
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-end gap-2.5 overflow-visible p-3 pt-10 pb-3">
        <div className="mb-auto px-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-extrabold tracking-[0.14em] text-gold-deep uppercase shadow-sm ring-1 ring-gold/30">
            Names compared
          </div>
          <p className="mt-1.5 max-w-[16rem] text-[12px] font-semibold text-navy/80 drop-shadow-sm">
            Different names. Same plot. Merge into one.
          </p>
        </div>

        {/* Building plan → Match & Merge → ULB — reference triad cards */}
        <div className="relative overflow-visible px-2 pb-1">
          {/* Soft mist plate so cards float like the reference */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -inset-y-2 rounded-[28px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.72)_0%,rgba(232,242,248,0.35)_55%,transparent_75%)]"
          />

          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-5 overflow-visible px-1 [perspective:1100px]">
            {/* Left · Building plan — 3D tile */}
            <Stagger delay={20} className="relative z-10 flex justify-start overflow-visible pr-1">
              <MatchTile3D reduce={reduce} tilt="left" className="max-w-[148px]" delay={0}>
                <div
                  className={cn(
                    matchTileFace,
                    "flex flex-col rounded-[20px] bg-teal px-3 pt-2.5 pb-2.5",
                    "shadow-[0_2px_0_0_rgba(8,90,100,0.85),0_14px_28px_rgba(14,154,167,0.45),0_4px_10px_rgba(7,20,51,0.18)]",
                  )}
                >
                  <div className="relative z-[1] flex items-center gap-1.5">
                    <span className={cn("grid size-7 shrink-0 place-items-center rounded-md bg-white text-teal", stamp3dBox)}>
                      <FileText weight="duotone" className="relative z-[1] size-3.5" />
                    </span>
                    <span className="text-[8px] font-extrabold tracking-[0.14em] text-white/90 uppercase">
                      {MATCH_PAIR.left.office}
                    </span>
                  </div>
                  <b className="relative z-[1] mt-2 truncate text-[12px] leading-tight font-extrabold text-white">
                    {MATCH_PAIR.left.name}
                  </b>
                  <span className="relative z-[1] mt-1 text-[10px] font-semibold text-white/75">{MATCH_PAIR.left.code}</span>
                </div>
              </MatchTile3D>
            </Stagger>

            {/* Transfer · Building plan → hub */}
            <MatchTransferDots reduce={reduce} toward="right" className="left-[28%]" />

            {/* Centre · Match & Merge — 3D hub */}
            <div className="relative z-20 flex w-[118px] flex-col items-center px-0.5">
              {!reduce ? (
                <motion.div
                  className="pointer-events-none absolute size-28 rounded-full border border-white/40"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.65, 0.25] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : null}
              <MatchTile3D reduce={reduce} tilt="front" delay={0.15}>
                <div
                  className={cn(
                    matchTileFace,
                    "flex w-full flex-col items-center rounded-[18px] bg-navy px-2.5 pt-3 pb-2.5 text-center",
                    "shadow-[0_3px_0_0_rgba(4,12,32,0.9),0_18px_36px_rgba(11,31,74,0.55),0_6px_14px_rgba(7,20,51,0.25)]",
                    "before:rounded-t-[18px]",
                  )}
                >
                  <span className={cn("relative z-[1] grid size-9 place-items-center rounded-full bg-[#f0c14a] text-navy", stamp3dRound)}>
                    <Plugs weight="fill" className="relative z-[1] size-5" />
                  </span>
                  <div className="relative z-[1] mt-2 text-[11px] font-extrabold tracking-[0.06em] text-white uppercase">
                    Match &amp; merge
                  </div>
                  <span className="relative z-[1] mt-2 rounded-full bg-teal px-2.5 py-0.5 text-[8px] font-extrabold tracking-[0.12em] text-white uppercase shadow-[0_2px_0_0_rgba(8,90,100,0.55)]">
                    Suggested
                  </span>
                </div>
              </MatchTile3D>
            </div>

            {/* Transfer · ULB → hub */}
            <MatchTransferDots reduce={reduce} toward="left" className="right-[28%]" />

            {/* Right · ULB permit — 3D tile */}
            <Stagger delay={80} className="relative z-10 flex justify-end overflow-visible pl-1">
              <MatchTile3D reduce={reduce} tilt="right" className="max-w-[148px]" delay={0.35}>
                <div
                  className={cn(
                    matchTileFace,
                    "flex flex-col rounded-[20px] bg-white px-3 pt-2.5 pb-2.5",
                    "shadow-[0_2px_0_0_rgba(180,195,220,0.95),0_14px_28px_rgba(7,20,51,0.18),0_4px_10px_rgba(7,20,51,0.1)]",
                    "ring-1 ring-navy/10",
                  )}
                >
                  <div className="relative z-[1] flex items-center gap-1.5">
                    <span className={cn("grid size-7 shrink-0 place-items-center rounded-md bg-teal text-white", stamp3dBox)}>
                      <Buildings weight="duotone" className="relative z-[1] size-3.5" />
                    </span>
                    <span className="text-[8px] font-extrabold tracking-[0.14em] text-navy/75 uppercase">
                      {MATCH_PAIR.right.office}
                    </span>
                  </div>
                  <b className="relative z-[1] mt-2 truncate text-[12px] leading-tight font-extrabold text-navy">
                    {MATCH_PAIR.right.name}
                  </b>
                  <span className="relative z-[1] mt-1 text-[10px] font-semibold text-muted-foreground">{MATCH_PAIR.right.code}</span>
                </div>
              </MatchTile3D>
            </Stagger>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/88 px-3 py-2 shadow-[0_2px_0_0_rgba(200,210,230,0.75),0_10px_20px_rgba(7,20,51,0.1)] ring-1 ring-navy/8 backdrop-blur-[2px]">
          {MATCH_HINTS.map((item, i) => (
            <Stagger key={item.label} delay={120 + i * 40}>
              <span className="flex flex-col items-center gap-0.5">
                <span className={cn("relative grid size-9 place-items-center rounded-full ring-1 ring-white/35", stamp3dRound, item.tone)}>
                  <item.Icon weight="fill" className="relative z-[1] size-3.5" />
                  <span
                    className={cn(
                      "absolute -right-0.5 -bottom-0.5 grid size-3.5 place-items-center rounded-full bg-ok text-white",
                      stamp3dRound,
                    )}
                  >
                    <ShieldCheck weight="bold" className="relative z-[1] size-2" />
                  </span>
                </span>
                <b className="text-[9px] text-navy">{item.label}</b>
                <span className="text-[8px] font-semibold text-muted-foreground">{item.detail}</span>
              </span>
            </Stagger>
          ))}
        </div>

        <Stagger delay={220}>
          <div className="flex items-center gap-2 rounded-xl bg-risk-soft/95 px-3 py-2 shadow-[0_2px_0_0_rgba(180,80,70,0.35),0_10px_18px_rgba(180,60,50,0.14)] ring-1 ring-risk/25 backdrop-blur-[1px]">
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-full bg-risk text-white", stamp3dRound)}>
              <MATCH_REJECT.Icon weight="fill" className="relative z-[1] size-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block truncate text-[12px] text-risk-ink">{MATCH_REJECT.name}</b>
              <span className="block truncate text-[10px] font-semibold text-muted-foreground">
                {MATCH_REJECT.office} · {MATCH_REJECT.reason}
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-risk px-2 py-0.5 text-[9px] font-extrabold text-white uppercase shadow-[0_2px_0_0_rgba(120,30,30,0.45)]">
              Not same
            </span>
          </div>
        </Stagger>
      </div>
    </motion.div>
  );
}

/** Right plaque — match desk: candidates · factors · how match runs. */
function MatchPlaque({
  hub,
  reduce,
  onNext,
}: {
  hub: HubStep;
  reduce: boolean;
  onNext?: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_14px_36px_rgba(240,193,74,0.18)] ring-1 ring-gold/35">
      <div className="shrink-0 border-b border-navy/6 bg-[linear-gradient(180deg,rgba(240,193,74,0.14)_0%,rgba(255,255,255,0)_100%)] px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <motion.span
            className={cn(
              "grid size-11 shrink-0 place-items-center rounded-xl bg-gold text-gold-ink",
              stamp3dXl,
            )}
            animate={reduce ? undefined : { y: [0, -2, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <hub.Icon weight="duotone" className="relative z-[1] size-6" />
          </motion.span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[18px] leading-none font-extrabold text-navy">{hub.hub}</div>
            <div className="mt-1 text-[12px] font-semibold text-gold-deep">{hub.sub}</div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="hidden items-center gap-1 rounded-full bg-mist px-2.5 py-1.5 text-[10px] font-bold text-navy ring-1 ring-navy/8 sm:inline-flex">
              <MapTrifold weight="fill" className="size-3 text-teal" />
              View on map
            </span>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-1 rounded-full bg-navy px-3 py-1.5 text-[11px] font-extrabold text-white shadow-[0_6px_16px_rgba(11,31,74,0.28)] transition hover:bg-navy-deep"
            >
              Merge &amp; continue
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-2.5 py-2.5">
        <div className="relative shrink-0 overflow-hidden rounded-2xl bg-gold-soft px-3 py-2.5 ring-1 ring-gold/30">
          <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)_minmax(0,0.85fr)] items-center gap-2">
            <div className="min-w-0 pl-1 text-left">
              <p className="font-display text-[12px] leading-snug font-extrabold text-navy/80" style={{ transform: "rotate(-6deg)" }}>
                Different names
              </p>
              <p className="mt-0.5 font-display text-[12px] leading-snug font-bold text-gold-deep" style={{ transform: "rotate(-6deg)" }}>
                Same plot
              </p>
            </div>
            <div className="min-w-0 text-center">
              <span className="inline-flex rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] font-extrabold tracking-[0.16em] text-gold-deep uppercase ring-1 ring-gold/25">
                Same work · merge
              </span>
              <b className="mt-1.5 block font-display text-[17px] leading-tight font-extrabold tracking-tight text-navy">
                {ABC_PROJECT.name}
              </b>
              <p className="mt-1 text-[11px] font-semibold text-gold-deep">Two names · one ABC work</p>
            </div>
            <div className="min-w-0 pr-1 text-right">
              <p className="font-display text-[12px] leading-snug font-extrabold text-navy/80" style={{ transform: "rotate(5deg)" }}>
                Near miss out
              </p>
              <p className="mt-0.5 font-display text-[12px] leading-snug font-bold text-gold-deep" style={{ transform: "rotate(5deg)" }}>
                Officer merges
              </p>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.15fr)_minmax(150px,0.85fr)] gap-2 overflow-hidden">
          <div className="flex min-h-0 flex-col gap-1.5 overflow-auto">
            {/* Candidates A vs B table — reference compare desk */}
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-navy/8">
              <div className="grid grid-cols-[76px_1fr_1fr] border-b border-navy/8">
                <span className="px-2 py-2 text-[9px] font-extrabold tracking-[0.12em] text-muted-foreground uppercase" />
                <span className="bg-[#dceaf8] px-2 py-2 text-center text-[9px] font-extrabold tracking-[0.12em] text-[#1a4e8a] uppercase">
                  Candidate A
                </span>
                <span className="bg-[#fde8d8] px-2 py-2 text-center text-[9px] font-extrabold tracking-[0.12em] text-[#c45c26] uppercase">
                  Candidate B
                </span>
              </div>
              {(
                [
                  ["Project name", MATCH_PAIR.left.name, MATCH_PAIR.right.name, "row"],
                  ["Place / plot", "East Zone · same plot", "East Zone · same plot", "row"],
                  ["Nearby reject", "XYZ Towers · not merged", "XYZ Towers · not merged", "row"],
                  ["Match strength", "High · same work", "High · same work", "row"],
                  ["Outcome", "Merge · no duplicate file", "Merge · no duplicate file", "ok"],
                ] as const
              ).map(([field, a, b, tone], i) => (
                <Stagger key={field} delay={12 + i * 14}>
                  <div
                    className={cn(
                      "grid grid-cols-[76px_1fr_1fr] items-center gap-1 border-t border-navy/5 px-2 py-1.5",
                      tone === "ok" ? "bg-ok-soft" : i % 2 === 1 ? "bg-mist/40" : "bg-white",
                    )}
                  >
                    <span className="text-[10px] font-semibold text-muted-foreground">{field}</span>
                    <b
                      className={cn(
                        "text-center text-[11px] leading-snug font-bold",
                        tone === "ok" ? "text-ok" : "text-navy",
                      )}
                    >
                      {a}
                    </b>
                    <b
                      className={cn(
                        "text-center text-[11px] leading-snug font-bold",
                        tone === "ok" ? "text-ok" : "text-navy",
                      )}
                    >
                      {b}
                    </b>
                  </div>
                </Stagger>
              ))}
            </div>

            <div>
              <div className="mb-1 text-[9px] font-extrabold tracking-[0.14em] text-gold-deep uppercase">
                Key matching factors
              </div>
              <div className="grid grid-cols-3 gap-1.5 [perspective:700px]">
                {MATCH_FACTORS.map((item, i) => (
                  <Stagger key={item.label} delay={40 + i * 16}>
                    <div
                      className="flex flex-col items-start gap-1 rounded-xl bg-white px-2 py-2 shadow-[0_2px_0_0_rgba(200,210,230,0.9),0_8px_14px_rgba(7,20,51,0.08)] ring-1 ring-navy/[0.05]"
                      style={reduce ? undefined : { transform: "rotateX(7deg)" }}
                    >
                      <span className={cn("grid size-7 place-items-center rounded-full", stamp3dRound, item.tone)}>
                        <item.Icon weight="fill" className="relative z-[1] size-3.5" />
                      </span>
                      <b className="text-[10px] leading-tight text-navy">{item.label}</b>
                      <span className="text-[9px] leading-snug font-semibold text-muted-foreground">{item.detail}</span>
                    </div>
                  </Stagger>
                ))}
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-1.5 overflow-auto border-l border-navy/8 pl-2">
            <div>
              <div className="mb-1 text-[9px] font-extrabold tracking-[0.14em] text-gold-deep uppercase">
                Candidates side by side
              </div>
              <ul className="space-y-1.5 [perspective:700px]">
                {(
                  [
                    { ...MATCH_PAIR.left, tone: "bg-teal text-white" },
                    { ...MATCH_PAIR.right, tone: "bg-[#1a4e8a] text-white" },
                  ] as const
                ).map((side, i) => (
                  <Stagger key={side.code} delay={40 + i * 14}>
                    <li
                      className="rounded-xl bg-white px-2 py-2 shadow-[0_2px_0_0_rgba(200,210,230,0.9),0_8px_16px_rgba(7,20,51,0.1)] ring-1 ring-navy/[0.05]"
                      style={reduce ? undefined : { transform: `rotateX(6deg) rotateY(${i === 0 ? 4 : -4}deg)` }}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn("grid size-7 shrink-0 place-items-center rounded-md", stamp3dBox, side.tone)}>
                          <side.Icon weight="fill" className="relative z-[1] size-3.5" />
                        </span>
                        <span className="min-w-0">
                          <b className="block truncate text-[11px] text-navy">{side.office}</b>
                          <span className="block truncate text-[9px] font-semibold text-muted-foreground">{side.name}</span>
                        </span>
                      </div>
                      <span className="mt-1 block font-mono text-[9px] font-bold text-gold-deep">{side.code}</span>
                    </li>
                  </Stagger>
                ))}
                <Stagger delay={70}>
                  <li
                    className="rounded-xl bg-risk-soft/70 px-2 py-2 shadow-[0_2px_0_0_rgba(180,80,70,0.35),0_8px_16px_rgba(180,60,50,0.12)] ring-1 ring-risk/20"
                    style={reduce ? undefined : { transform: "rotateX(6deg)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("grid size-7 shrink-0 place-items-center rounded-md bg-risk text-white", stamp3dBox)}>
                        <MATCH_REJECT.Icon weight="fill" className="relative z-[1] size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-[11px] text-risk-ink">{MATCH_REJECT.name}</b>
                        <span className="block truncate text-[9px] font-semibold text-muted-foreground">{MATCH_REJECT.reason}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-risk px-1.5 py-0.5 text-[8px] font-extrabold text-white uppercase shadow-[0_2px_0_0_rgba(120,30,30,0.45)]">
                        Out
                      </span>
                    </div>
                  </li>
                </Stagger>
              </ul>
            </div>

            <div>
              <MatchHowRunsPanel reduce={reduce} title="How match runs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Left stage — ABC site photo with check compare overlaid (same craft as Match). */
function CheckFlowStage({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] shadow-[0_12px_32px_rgba(7,20,51,0.12)] ring-1 ring-navy/10"
      initial={reduce ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <img
        src={matchStageBg}
        alt=""
        aria-hidden
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_40%] select-none"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, rgba(253,243,236,0.58) 0%, rgba(253,243,236,0.16) 28%, rgba(247,250,253,0.08) 55%, rgba(196,92,38,0.14) 100%),
            radial-gradient(ellipse 75% 50% at 50% 70%, rgba(255,255,255,0.35) 0%, transparent 70%)
          `,
        }}
      />

      {/* Feature stamps — right rail */}
      <div className="absolute top-3 right-3 z-20 flex w-[148px] flex-col gap-1.5 [perspective:600px]">
        {CHECK_FEATURES.map((item, i) => (
          <Stagger key={item.label} delay={40 + i * 50}>
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full bg-white/95 px-2 py-1.5 ring-1 ring-navy/10 backdrop-blur-[2px]",
                "shadow-[0_2px_0_0_rgba(200,210,230,0.85),0_8px_14px_rgba(7,20,51,0.12)]",
              )}
              style={reduce ? undefined : { transform: "rotateX(8deg) rotateY(-6deg)" }}
            >
              <span className={cn("grid size-6 shrink-0 place-items-center rounded-full bg-[#c45c26] text-white", stamp3dRound)}>
                <item.Icon weight="fill" className="relative z-[1] size-3" />
              </span>
              <b className="text-[10px] leading-tight text-navy">{item.label}</b>
            </span>
          </Stagger>
        ))}
      </div>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-end gap-2.5 overflow-visible p-3 pt-10 pb-3">
        <div className="mb-auto px-1">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-extrabold tracking-[0.14em] text-[#c45c26] uppercase shadow-sm ring-1 ring-[#f0a06a]/35">
            Details compared
          </div>
          <p className="mt-1.5 max-w-[16rem] text-[12px] font-semibold text-navy/80 drop-shadow-sm">
            Side by side. Flag what does not agree.
          </p>
        </div>

        {/* Building plan → Fail hub → Builder return */}
        <div className="relative overflow-visible px-2 pb-1">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -inset-y-2 rounded-[28px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.72)_0%,rgba(253,243,236,0.4)_55%,transparent_75%)]"
          />

          <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-5 overflow-visible px-1 [perspective:1100px]">
            {/* Left · Building plan — pass value */}
            <Stagger delay={20} className="relative z-10 flex justify-start overflow-visible pr-1">
              <MatchTile3D reduce={reduce} tilt="left" className="max-w-[148px]" delay={0}>
                <div
                  className={cn(
                    matchTileFace,
                    "flex flex-col rounded-[20px] bg-ok px-3 pt-2.5 pb-2.5",
                    "shadow-[0_2px_0_0_rgba(8,90,70,0.75),0_14px_28px_rgba(14,138,114,0.4),0_4px_10px_rgba(7,20,51,0.16)]",
                  )}
                >
                  <div className="relative z-[1] flex items-center gap-1.5">
                    <span className={cn("grid size-7 shrink-0 place-items-center rounded-md bg-white text-ok", stamp3dBox)}>
                      <CHECK_CLASH.left.Icon weight="duotone" className="relative z-[1] size-3.5" />
                    </span>
                    <span className="text-[8px] font-extrabold tracking-[0.14em] text-white/90 uppercase">
                      {CHECK_CLASH.left.office}
                    </span>
                  </div>
                  <b className="relative z-[1] mt-2 truncate text-[11px] leading-tight font-extrabold text-white">
                    {CHECK_CLASH.field}
                  </b>
                  <span className="relative z-[1] mt-1 font-mono text-[12px] font-extrabold text-white">
                    {CHECK_CLASH.left.value}
                  </span>
                </div>
              </MatchTile3D>
            </Stagger>

            <MatchTransferDots reduce={reduce} toward="right" className="left-[28%]" />

            {/* Centre · Fail hub */}
            <div className="relative z-20 flex w-[118px] flex-col items-center px-0.5">
              {!reduce ? (
                <motion.div
                  className="pointer-events-none absolute size-28 rounded-full border border-[#f0a06a]/50"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.65, 0.25] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
              ) : null}
              <MatchTile3D reduce={reduce} tilt="front" delay={0.15}>
                <div
                  className={cn(
                    matchTileFace,
                    "flex w-full flex-col items-center rounded-[18px] bg-[#c45c26] px-2.5 pt-3 pb-2.5 text-center",
                    "shadow-[0_3px_0_0_rgba(120,40,15,0.85),0_18px_36px_rgba(196,92,38,0.5),0_6px_14px_rgba(7,20,51,0.22)]",
                    "before:rounded-t-[18px]",
                  )}
                >
                  <span className={cn("relative z-[1] grid size-9 place-items-center rounded-full bg-white text-risk", stamp3dRound)}>
                    <X weight="bold" className="relative z-[1] size-5" />
                  </span>
                  <div className="relative z-[1] mt-2 text-[11px] font-extrabold tracking-[0.06em] text-white uppercase">
                    Fail · flagged
                  </div>
                  <span className="relative z-[1] mt-2 rounded-full bg-white/20 px-2.5 py-0.5 text-[8px] font-extrabold tracking-[0.12em] text-white uppercase shadow-[0_2px_0_0_rgba(120,40,15,0.45)]">
                    Exception
                  </span>
                </div>
              </MatchTile3D>
            </div>

            <MatchTransferDots reduce={reduce} toward="left" className="right-[28%]" />

            {/* Right · Builder return — clash value */}
            <Stagger delay={80} className="relative z-10 flex justify-end overflow-visible pl-1">
              <MatchTile3D reduce={reduce} tilt="right" className="max-w-[148px]" delay={0.35}>
                <div
                  className={cn(
                    matchTileFace,
                    "flex flex-col rounded-[20px] bg-white px-3 pt-2.5 pb-2.5",
                    "shadow-[0_2px_0_0_rgba(220,160,140,0.95),0_14px_28px_rgba(196,92,38,0.22),0_4px_10px_rgba(7,20,51,0.1)]",
                    "ring-1 ring-risk/25",
                  )}
                >
                  <div className="relative z-[1] flex items-center gap-1.5">
                    <span className={cn("grid size-7 shrink-0 place-items-center rounded-md bg-risk text-white", stamp3dBox)}>
                      <CHECK_CLASH.right.Icon weight="duotone" className="relative z-[1] size-3.5" />
                    </span>
                    <span className="text-[8px] font-extrabold tracking-[0.14em] text-risk uppercase">
                      {CHECK_CLASH.right.office}
                    </span>
                  </div>
                  <b className="relative z-[1] mt-2 truncate text-[11px] leading-tight font-extrabold text-navy">
                    {CHECK_CLASH.field}
                  </b>
                  <span className="relative z-[1] mt-1 font-mono text-[12px] font-extrabold text-risk">
                    {CHECK_CLASH.right.value}
                  </span>
                </div>
              </MatchTile3D>
            </Stagger>
          </div>
        </div>

        {/* Also pass — full-colour stamps */}
        <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/88 px-3 py-2 shadow-[0_2px_0_0_rgba(200,210,230,0.75),0_10px_20px_rgba(7,20,51,0.1)] ring-1 ring-navy/8 backdrop-blur-[2px]">
          {CHECK_PASS.map((item, i) => (
            <Stagger key={item.label} delay={120 + i * 40}>
              <span className="flex flex-col items-center gap-0.5">
                <span className={cn("relative grid size-9 place-items-center rounded-full ring-1 ring-white/35", stamp3dRound, item.tone)}>
                  <item.Icon weight="fill" className="relative z-[1] size-3.5" />
                  <span className={cn("absolute -right-0.5 -bottom-0.5 grid size-3.5 place-items-center rounded-full bg-ok text-white", stamp3dRound)}>
                    <ShieldCheck weight="bold" className="relative z-[1] size-2" />
                  </span>
                </span>
                <b className="text-[9px] text-navy">{item.label}</b>
                <span className="text-[8px] font-semibold text-muted-foreground">{item.detail}</span>
              </span>
            </Stagger>
          ))}
        </div>

        <Stagger delay={220}>
          <div className="flex items-center gap-2 rounded-xl bg-risk-soft/95 px-3 py-2 shadow-[0_2px_0_0_rgba(180,80,70,0.35),0_10px_18px_rgba(180,60,50,0.14)] ring-1 ring-risk/25 backdrop-blur-[1px]">
            <span className={cn("grid size-8 shrink-0 place-items-center rounded-full bg-risk text-white", stamp3dRound)}>
              <WarningCircle weight="fill" className="relative z-[1] size-3.5" />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block truncate text-[12px] text-risk-ink">{CHECK_CLASH.flag}</b>
              <span className="block truncate text-[10px] font-semibold text-muted-foreground">
                Officer reviews · then one file
              </span>
            </span>
            <span className="shrink-0 rounded-full bg-risk px-2 py-0.5 text-[9px] font-extrabold text-white uppercase shadow-[0_2px_0_0_rgba(120,30,30,0.45)]">
              Fail
            </span>
          </div>
        </Stagger>
      </div>
    </motion.div>
  );
}

/** Right plaque — check desk: compare · factors · how check runs. */
function CheckPlaque({
  hub,
  reduce,
  onNext,
}: {
  hub: HubStep;
  reduce: boolean;
  onNext?: () => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_14px_36px_rgba(240,160,106,0.18)] ring-1 ring-[#f0a06a]/35">
      <div className="shrink-0 border-b border-navy/6 bg-[linear-gradient(180deg,rgba(240,160,106,0.14)_0%,rgba(255,255,255,0)_100%)] px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <motion.span
            className={cn("grid size-11 shrink-0 place-items-center rounded-xl bg-[#c45c26] text-white", stamp3dXl)}
            animate={reduce ? undefined : { y: [0, -2, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <hub.Icon weight="duotone" className="relative z-[1] size-6" />
          </motion.span>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[18px] leading-none font-extrabold text-navy">{hub.hub}</div>
            <div className="mt-1 text-[12px] font-semibold text-[#c45c26]">{hub.sub}</div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="hidden items-center gap-1 rounded-full bg-mist px-2.5 py-1.5 text-[10px] font-bold text-navy ring-1 ring-navy/8 sm:inline-flex">
              <MapTrifold weight="fill" className="size-3 text-teal" />
              View on map
            </span>
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-1 rounded-full bg-navy px-3 py-1.5 text-[11px] font-extrabold text-white shadow-[0_6px_16px_rgba(11,31,74,0.28)] transition hover:bg-navy-deep"
            >
              Confirm &amp; continue
              <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-2.5 py-2.5">
        <div className="relative shrink-0 overflow-hidden rounded-2xl bg-[#fdf3ec] px-3 py-2.5 ring-1 ring-[#f0a06a]/30">
          <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)_minmax(0,0.85fr)] items-center gap-2">
            <div className="min-w-0 pl-1 text-left">
              <p className="font-display text-[12px] leading-snug font-extrabold text-navy/80" style={{ transform: "rotate(-6deg)" }}>
                Plan area
              </p>
              <p className="mt-0.5 font-display text-[12px] leading-snug font-bold text-ok" style={{ transform: "rotate(-6deg)" }}>
                1,25,000 sq ft
              </p>
            </div>
            <div className="min-w-0 text-center">
              <span className="inline-flex rounded-full bg-white/85 px-2.5 py-0.5 text-[10px] font-extrabold tracking-[0.16em] text-[#c45c26] uppercase ring-1 ring-[#f0a06a]/25">
                Potential exception
              </span>
              <b className="mt-1.5 block font-display text-[17px] leading-tight font-extrabold tracking-tight text-navy">
                {ABC_PROJECT.name}
              </b>
              <p className="mt-1 text-[11px] font-semibold text-[#c45c26]">Area does not agree</p>
            </div>
            <div className="min-w-0 pr-1 text-right">
              <p className="font-display text-[12px] leading-snug font-extrabold text-navy/80" style={{ transform: "rotate(5deg)" }}>
                Builder return
              </p>
              <p className="mt-0.5 font-display text-[12px] leading-snug font-bold text-risk" style={{ transform: "rotate(5deg)" }}>
                98,000 sq ft
              </p>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1.15fr)_minmax(150px,0.85fr)] gap-2 overflow-hidden">
          <div className="flex min-h-0 flex-col gap-1.5 overflow-auto">
            {/* Side-by-side compare table */}
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-navy/8">
              <div className="grid grid-cols-[76px_1fr_1fr] border-b border-navy/8">
                <span className="px-2 py-2" />
                <span className="bg-ok-soft px-2 py-2 text-center text-[9px] font-extrabold tracking-[0.12em] text-ok uppercase">
                  Building plan
                </span>
                <span className="bg-risk-soft px-2 py-2 text-center text-[9px] font-extrabold tracking-[0.12em] text-risk uppercase">
                  Builder return
                </span>
              </div>
              {(
                [
                  ["Field", CHECK_CLASH.field, CHECK_CLASH.field, "row"],
                  ["Value", CHECK_CLASH.left.value, CHECK_CLASH.right.value, "row"],
                  ["Name & place", "Present", "Present", "ok"],
                  ["Permit", "Linked", "Linked", "ok"],
                  ["Outcome", "Pass on other fields", "Area fail · exception", "bad"],
                ] as const
              ).map(([field, a, b, tone], i) => (
                <Stagger key={field} delay={12 + i * 14}>
                  <div
                    className={cn(
                      "grid grid-cols-[76px_1fr_1fr] items-center gap-1 border-t border-navy/5 px-2 py-1.5",
                      tone === "ok" ? "bg-ok-soft/70" : tone === "bad" ? "bg-risk-soft" : i % 2 === 1 ? "bg-[#fdf3ec]/60" : "bg-white",
                    )}
                  >
                    <span className="text-[10px] font-semibold text-muted-foreground">{field}</span>
                    <b
                      className={cn(
                        "text-center text-[11px] leading-snug font-bold",
                        tone === "ok" ? "text-ok" : tone === "bad" ? "text-risk-ink" : "text-navy",
                      )}
                    >
                      {a}
                    </b>
                    <b
                      className={cn(
                        "text-center text-[11px] leading-snug font-bold",
                        tone === "ok" ? "text-ok" : tone === "bad" ? "text-risk-ink" : "text-navy",
                      )}
                    >
                      {b}
                    </b>
                  </div>
                </Stagger>
              ))}
            </div>

            <div>
              <div className="mb-1 text-[9px] font-extrabold tracking-[0.14em] text-[#c45c26] uppercase">
                Key check factors
              </div>
              <div className="grid grid-cols-3 gap-1.5 [perspective:700px]">
                {CHECK_FACTORS.map((item, i) => (
                  <Stagger key={item.label} delay={40 + i * 16}>
                    <div
                      className="flex flex-col items-start gap-1 rounded-xl bg-white px-2 py-2 shadow-[0_2px_0_0_rgba(200,210,230,0.9),0_8px_14px_rgba(7,20,51,0.08)] ring-1 ring-navy/[0.05]"
                      style={reduce ? undefined : { transform: "rotateX(7deg)" }}
                    >
                      <span className={cn("grid size-7 place-items-center rounded-full", stamp3dRound, item.tone)}>
                        <item.Icon weight="fill" className="relative z-[1] size-3.5" />
                      </span>
                      <b className="text-[10px] leading-tight text-navy">{item.label}</b>
                      <span className="text-[9px] leading-snug font-semibold text-muted-foreground">{item.detail}</span>
                    </div>
                  </Stagger>
                ))}
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-1.5 overflow-auto border-l border-navy/8 pl-2">
            <div>
              <div className="mb-1 text-[9px] font-extrabold tracking-[0.14em] text-[#c45c26] uppercase">
                Clash · side by side
              </div>
              <ul className="space-y-1.5 [perspective:700px]">
                <Stagger delay={40}>
                  <li
                    className="rounded-xl bg-white px-2 py-2 shadow-[0_2px_0_0_rgba(200,210,230,0.9),0_8px_16px_rgba(7,20,51,0.1)] ring-1 ring-ok/25"
                    style={reduce ? undefined : { transform: "rotateX(6deg) rotateY(4deg)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("grid size-7 shrink-0 place-items-center rounded-md bg-ok text-white", stamp3dBox)}>
                        <CHECK_CLASH.left.Icon weight="fill" className="relative z-[1] size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-[11px] text-navy">{CHECK_CLASH.left.office}</b>
                        <span className="block truncate text-[9px] font-semibold text-muted-foreground">{CHECK_CLASH.field}</span>
                      </span>
                    </div>
                    <span className="mt-1 block font-mono text-[10px] font-extrabold text-ok">{CHECK_CLASH.left.value}</span>
                  </li>
                </Stagger>
                <Stagger delay={55}>
                  <li
                    className="rounded-xl bg-white px-2 py-2 shadow-[0_2px_0_0_rgba(220,160,140,0.9),0_8px_16px_rgba(196,92,38,0.12)] ring-1 ring-risk/25"
                    style={reduce ? undefined : { transform: "rotateX(6deg) rotateY(-4deg)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("grid size-7 shrink-0 place-items-center rounded-md bg-risk text-white", stamp3dBox)}>
                        <CHECK_CLASH.right.Icon weight="fill" className="relative z-[1] size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-[11px] text-navy">{CHECK_CLASH.right.office}</b>
                        <span className="block truncate text-[9px] font-semibold text-muted-foreground">{CHECK_CLASH.field}</span>
                      </span>
                    </div>
                    <span className="mt-1 block font-mono text-[10px] font-extrabold text-risk">{CHECK_CLASH.right.value}</span>
                  </li>
                </Stagger>
                <Stagger delay={70}>
                  <li
                    className="rounded-xl bg-risk-soft/70 px-2 py-2 shadow-[0_2px_0_0_rgba(180,80,70,0.35),0_8px_16px_rgba(180,60,50,0.12)] ring-1 ring-risk/20"
                    style={reduce ? undefined : { transform: "rotateX(6deg)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("grid size-7 shrink-0 place-items-center rounded-md bg-risk text-white", stamp3dBox)}>
                        <WarningCircle weight="fill" className="relative z-[1] size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-[11px] text-risk-ink">Potential exception</b>
                        <span className="block truncate text-[9px] font-semibold text-muted-foreground">Area does not agree</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-risk px-1.5 py-0.5 text-[8px] font-extrabold text-white uppercase shadow-[0_2px_0_0_rgba(120,30,30,0.45)]">
                        Fail
                      </span>
                    </div>
                  </li>
                </Stagger>
              </ul>
            </div>

            <div>
              <div className="mb-1 text-[9px] font-extrabold tracking-[0.14em] text-[#c45c26] uppercase">How check runs</div>
              <div className="grid grid-cols-1 gap-1.5 [perspective:600px]">
                {CHECK_HOW.map((step, i) => (
                  <Stagger key={step.label} delay={55 + i * 14}>
                    <span
                      className="flex items-center gap-1.5 rounded-lg bg-white px-2 py-1.5 shadow-[0_2px_0_0_rgba(200,210,230,0.9),0_6px_12px_rgba(7,20,51,0.08)] ring-1 ring-navy/[0.05]"
                      style={reduce ? undefined : { transform: "rotateX(5deg)" }}
                    >
                      <span className={cn("grid size-6 shrink-0 place-items-center rounded-full bg-[#c45c26] text-white", stamp3dRound)}>
                        <ShieldCheck weight="bold" className="relative z-[1] size-3" />
                      </span>
                      <span className="min-w-0 flex-1 text-[11px] leading-tight font-bold text-navy">{step.label}</span>
                      <CaretRight weight="bold" className="size-3 text-muted-foreground" />
                    </span>
                  </Stagger>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Left stage — six sources land on one Board file. */
function OneFlowStage({ reduce }: { reduce: boolean }) {
  const midY = [14, 30, 46, 62, 78, 90];
  return (
    <motion.div
      className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-white/55 shadow-[0_12px_32px_rgba(7,20,51,0.08)] ring-1 ring-navy/8 backdrop-blur-[1.5px]"
      initial={reduce ? false : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative z-10 flex items-center justify-between gap-2 border-b border-navy/6 px-4 py-2.5">
        <div>
          <div className="text-[9px] font-extrabold tracking-[0.14em] text-ok uppercase">One Board file</div>
          <p className="mt-0.5 text-[12px] font-semibold text-muted-foreground">
            All offices on one Project ID.
          </p>
        </div>
        <span className="rounded-full bg-ok-soft px-2.5 py-1 text-[10px] font-extrabold text-ok">
          {ABC_PROJECT.id}
        </span>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 right-[18%] size-[240px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(14,138,114,0.18)_0%,transparent_70%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[8%] left-[20%] h-[28%] w-[55%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.55)_0%,rgba(180,220,210,0.22)_45%,transparent_72%)]"
        />

        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          {SOURCES.map((_, i) => {
            const y = midY[i];
            const d = `M 22 ${y} C 42 ${y}, 55 48, 72 50`;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={HEX.ok} strokeWidth="0.55" strokeDasharray="1.4 1.2" opacity="0.5" />
                {!reduce ? (
                  <circle r="1.1" fill={HEX.ok} opacity="0.95">
                    <animateMotion dur={`${2.1 + i * 0.12}s`} repeatCount="indefinite" begin={`${i * 0.18}s`} path={d} />
                    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur={`${2.1 + i * 0.12}s`} repeatCount="indefinite" begin={`${i * 0.18}s`} />
                  </circle>
                ) : null}
              </g>
            );
          })}
        </svg>

        <div className="absolute inset-y-3 left-3 flex w-[44%] flex-col">
          <div className="mb-2 text-[9px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
            On this file
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-between py-0.5">
            {SOURCES.map((s, i) => (
              <Stagger key={s.id} delay={30 + i * 40}>
                <div className="flex items-center gap-2.5">
                  <span className="relative shrink-0">
                    <span className="grid size-11 place-items-center rounded-full bg-ok text-white shadow-[0_6px_14px_rgba(14,138,114,0.28)] ring-2 ring-ok/35">
                      <s.Icon weight="duotone" className="size-[18px]" />
                    </span>
                    <span className="absolute -top-0.5 -right-0.5 grid size-3.5 place-items-center rounded-full bg-ok text-white shadow-sm ring-[1.5px] ring-white">
                      <ShieldCheck weight="bold" className="size-2" />
                    </span>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-bold leading-tight text-navy">{s.label}</span>
                    <span className="block truncate text-[11px] font-semibold text-muted-foreground">{s.holds}</span>
                  </span>
                </div>
              </Stagger>
            ))}
          </div>
        </div>

        <div className="absolute top-1/2 right-4 z-10 flex w-[150px] -translate-y-1/2 flex-col items-center">
          {!reduce ? (
            <motion.div
              className="pointer-events-none absolute size-36 rounded-full border border-ok/30"
              animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
          ) : null}
          <motion.div
            className="relative flex flex-col items-center rounded-2xl bg-navy px-4 py-4 text-center text-white shadow-[0_16px_36px_rgba(11,31,74,0.35)] ring-4 ring-ok/35"
            animate={reduce ? undefined : { scale: [1, 1.03, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="grid size-12 place-items-center rounded-xl bg-ok text-white shadow-md">
              <FolderSimple weight="fill" className="size-6" />
            </span>
            <div className="mt-2 text-[9px] font-extrabold tracking-[0.14em] text-teal-bright uppercase">One file</div>
            <b className="mt-1 font-mono text-[11px] leading-snug">{ABC_PROJECT.id}</b>
            <span className="mt-2 rounded-full bg-ok px-2.5 py-0.5 text-[9px] font-bold text-white">Ready</span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/** Right plaque — one project file detail. */
function OnePlaque({ hub, reduce }: { hub: HubStep; reduce: boolean }) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[22px] bg-white shadow-[0_14px_36px_rgba(14,138,114,0.16)] ring-1 ring-ok/30">
      <div className="shrink-0 border-b border-navy/6 bg-[linear-gradient(180deg,rgba(14,138,114,0.12)_0%,rgba(255,255,255,0)_100%)] px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <motion.span
            className="grid size-11 shrink-0 place-items-center rounded-xl bg-ok text-white shadow-[0_8px_18px_rgba(14,138,114,0.35)]"
            animate={reduce ? undefined : { y: [0, -2, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <hub.Icon weight="duotone" className="size-6" />
          </motion.span>
          <div className="min-w-0">
            <div className="font-display text-[18px] leading-none font-extrabold text-navy">{hub.hub}</div>
            <div className="mt-1 text-[12px] font-semibold text-ok">{hub.sub}</div>
            <div className="mt-0.5 text-[9px] font-extrabold tracking-[0.14em] text-muted-foreground uppercase">
              Ready for CESS assessment
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-2.5 py-2.5">
        <div className="relative shrink-0 overflow-hidden rounded-2xl bg-ok-soft px-3 py-3 ring-1 ring-ok/25">
          <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,0.9fr)] items-center gap-2">
            <div className="min-w-0 pl-1 text-left">
              <p className="font-display text-[13px] leading-snug font-extrabold text-navy/80" style={{ transform: "rotate(-6deg)" }}>
                Six sources
              </p>
              <p className="mt-0.5 font-display text-[12px] leading-snug font-bold text-ok" style={{ transform: "rotate(-6deg)" }}>
                One file
              </p>
              <span aria-hidden className="mt-1 block h-0.5 w-14 rounded-full bg-ok/55" style={{ transform: "rotate(-6deg)" }} />
            </div>
            <div className="min-w-0 text-center">
              <span className="inline-flex rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] font-extrabold tracking-[0.16em] text-ok uppercase ring-1 ring-ok/25">
                One Project ID
              </span>
              <b className="mt-2 block font-mono text-[16px] leading-tight font-extrabold tracking-tight text-navy">
                {ABC_PROJECT.id}
              </b>
              <p className="mt-1 text-[13px] font-extrabold text-navy">{ABC_PROJECT.name}</p>
              <p className="mt-1 text-[11px] font-semibold text-ok">
                {ABC_PROJECT.category} · {ABC_PROJECT.place}
              </p>
            </div>
            <div className="min-w-0 pr-1 text-right">
              <p className="font-display text-[12px] leading-snug font-extrabold text-navy/80" style={{ transform: "rotate(5deg)" }}>
                Checked
              </p>
              <p className="mt-0.5 font-display text-[12px] leading-snug font-bold text-ok" style={{ transform: "rotate(5deg)" }}>
                Ready
              </p>
              <p className="mt-0.5 font-display text-[12px] leading-snug font-bold text-navy/70" style={{ transform: "rotate(5deg)" }}>
                Assess next
              </p>
              <span aria-hidden className="ml-auto mt-1 block h-0.5 w-16 rounded-full bg-ok/55" style={{ transform: "rotate(5deg)" }} />
            </div>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-2 gap-2 overflow-hidden">
          <div className="flex min-h-0 flex-col gap-1.5 overflow-auto border-r border-navy/8 pr-2">
            <ul className="overflow-hidden rounded-xl ring-1 ring-navy/8">
              {hub.fields.map(([k, v], i) => (
                <Stagger key={k} delay={12 + i * 14}>
                  <li
                    className={cn(
                      "flex items-baseline justify-between gap-2 px-2.5 py-1.5",
                      i % 2 === 0 ? "bg-white" : "bg-ok-soft/70",
                      i > 0 && "border-t border-navy/5",
                    )}
                  >
                    <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">{k}</span>
                    <b className="text-right text-[12px] leading-snug font-bold text-navy">{v}</b>
                  </li>
                </Stagger>
              ))}
            </ul>
            <div className="grid grid-cols-2 gap-1.5">
              {hub.points.map((label, i) => (
                <Stagger key={label} delay={30 + i * 16}>
                  <div className="flex items-center gap-1.5 rounded-xl bg-white px-2 py-2 shadow-sm ring-1 ring-navy/[0.05]">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ok text-white">
                      {i === 0 ? (
                        <Buildings weight="fill" className="size-3.5" />
                      ) : i === 1 ? (
                        <Scales weight="fill" className="size-3.5" />
                      ) : i === 2 ? (
                        <FolderSimple weight="fill" className="size-3.5" />
                      ) : (
                        <ShieldCheck weight="fill" className="size-3.5" />
                      )}
                    </span>
                    <b className="text-[11px] leading-tight text-navy">{label}</b>
                  </div>
                </Stagger>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-1.5 overflow-auto pl-0.5">
            <div>
              <div className="mb-1 text-[9px] font-extrabold tracking-[0.14em] text-ok uppercase">
                Sources on this file
              </div>
              <ul className="space-y-1">
                {ABC_PACKETS.map((item, i) => (
                  <Stagger key={item.office} delay={40 + i * 14}>
                    <li className="flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 shadow-sm ring-1 ring-navy/[0.05]">
                      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-ok-soft text-ok ring-1 ring-ok/25">
                        <item.Icon weight="fill" className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <b className="block truncate text-[12px] text-navy">{item.office}</b>
                        <span className="block truncate text-[10px] font-semibold text-muted-foreground">{item.code}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-ok px-2 py-0.5 text-[9px] font-extrabold text-white uppercase">
                        On file
                      </span>
                    </li>
                  </Stagger>
                ))}
              </ul>
            </div>
            <div>
              <div className="mb-1 text-[9px] font-extrabold tracking-[0.14em] text-ok uppercase">What this unlocks</div>
              <div className="flex flex-wrap items-center gap-1">
                {ONE_UNLOCK.map((label, i) => (
                  <Stagger key={label} delay={55 + i * 12}>
                    <span className="inline-flex items-center gap-1">
                      {i > 0 ? <span className="text-[10px] font-extrabold text-ok/40">→</span> : null}
                      <span className="rounded-full bg-ok px-2 py-0.5 text-[10px] font-extrabold text-white">{label}</span>
                    </span>
                  </Stagger>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StoryFooter({
  beat,
  solving,
  showProblemKey,
  showSolutionKey,
}: {
  beat: number;
  solving: boolean;
  showProblemKey: boolean;
  showSolutionKey: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-1.5">
      {!solving ? (
        <div className="flex flex-wrap items-center gap-2.5 rounded-2xl bg-[linear-gradient(180deg,rgba(255,241,238,0.92),rgba(255,247,244,0.88))] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_18px_rgba(7,20,51,0.05)] ring-1 ring-risk/12 backdrop-blur-md">
          <span className="inline-flex shrink-0 items-center gap-1.5 pr-0.5">
            <span className="grid size-5 place-items-center rounded-full bg-risk text-white shadow-[0_2px_6px_rgba(196,92,38,0.35)]">
              <WarningCircle weight="fill" className="size-3" />
            </span>
            <span className="text-[12px] font-extrabold text-risk">What goes wrong</span>
          </span>
          {IMPACTS.map((item, i) => (
            <Stagger key={item.label} delay={40 + i * 40}>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-1.5 text-[12px] font-bold text-navy shadow-[0_2px_8px_rgba(7,20,51,0.07)] ring-1 ring-navy/5">
                <item.Icon weight="fill" className="size-3.5 shrink-0 text-risk" />
                {item.label}
              </span>
            </Stagger>
          ))}
        </div>
      ) : !showSolutionKey ? (
        <div className="flex flex-wrap items-center gap-2.5 rounded-2xl bg-[linear-gradient(180deg,rgba(232,242,250,0.94),rgba(236,246,252,0.88))] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_6px_18px_rgba(7,20,51,0.05)] ring-1 ring-navy/8 backdrop-blur-md">
          <span className="inline-flex shrink-0 items-center gap-1.5 pr-0.5">
            <span className="grid size-5 place-items-center rounded-full bg-risk text-white shadow-[0_2px_6px_rgba(196,92,38,0.35)]">
              <WarningCircle weight="fill" className="size-3" />
            </span>
            <span className="text-[12px] font-extrabold text-risk">Watch for</span>
          </span>
          {WATCH_ISSUES.map((item, i) => (
            <Stagger key={item.label} delay={15 + i * 25}>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-1.5 text-[12px] font-bold text-navy shadow-[0_2px_8px_rgba(7,20,51,0.07)] ring-1 ring-navy/5">
                <item.Icon weight="fill" className="size-3.5 shrink-0 text-risk" />
                {item.label}
              </span>
            </Stagger>
          ))}
        </div>
      ) : null}

      {showProblemKey ? (
        <Reveal beat={beat} at={0}>
          <div className="rounded-xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-risk/20">
            <div className="mb-1 text-[9px] font-extrabold tracking-[0.12em] text-risk uppercase">Key message</div>
            <p className="font-display text-[14px] font-bold text-navy">
              Many separate files. No one common project file for the Board.
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {PROBLEM_KEY.map((item, i) => (
                <span key={item.label} className="inline-flex items-center gap-1">
                  {i > 0 ? <span className="text-[11px] font-extrabold text-risk/50">→</span> : null}
                  <Stagger delay={i * 35}>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-risk-ink">
                      <item.Icon weight="fill" className="size-3.5 text-risk" />
                      {item.label}
                    </span>
                  </Stagger>
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      ) : null}

      {showSolutionKey ? (
        <Reveal beat={beat} at={5}>
          <div className="rounded-xl bg-[#e8f1fa]/90 px-3 py-2.5 shadow-sm ring-1 ring-[#5b9bd5]/30">
            <div className="mb-1 text-[9px] font-extrabold tracking-[0.12em] text-[#1a4e8a] uppercase">Key message</div>
            <p className="font-display text-[14px] font-bold text-navy">
              Different sources become one official project file on the Central Platform.
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {SOLUTION_KEY.map((item, i) => (
                <span key={item.label} className="inline-flex items-center gap-1">
                  {i > 0 ? <span className="text-[11px] font-extrabold text-[#1a4e8a]/40">→</span> : null}
                  <Stagger delay={i * 30}>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-navy">
                      <item.Icon weight="fill" className="size-3.5 text-[#1a4e8a]" />
                      {item.label}
                    </span>
                  </Stagger>
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
