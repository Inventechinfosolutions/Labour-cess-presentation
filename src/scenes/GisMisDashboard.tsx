import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  ArrowRight,
  Bank,
  Buildings,
  CalendarBlank,
  CaretDown,
  ChartBar,
  ChartLineUp,
  ClipboardText,
  Crosshair,
  CurrencyInr,
  Database,
  Gear,
  House,
  MapTrifold,
  Minus,
  Plus,
  Scales,
  ShieldCheck,
  User,
  Wallet,
  WarningCircle,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { TileLayer, type TileSize, type TileView } from "@/components/TileLayer";
import { project, tileZoomFor } from "@/scenes/gisTerritoryData";
import karnatakaEmblem from "@/assets/karnataka-emblem.png";
import abcSite from "@/assets/abc-site.png";

/**
 * Territory Dashboard beat — state-wide MIS view of the Central Platform:
 * KPIs, GIS project distribution, status, CESS funnel, territory and trend.
 */

type Pt = [number, number];

const OUTLINE_LL: Pt[] = [
  [18.45, 77.1], [18.25, 77.55], [17.85, 77.65], [17.45, 77.5], [17.05, 77.45], [16.6, 77.5], [16.25, 77.62],
  [15.9, 77.2], [15.7, 76.95], [15.3, 77.1], [14.95, 77.2], [14.55, 76.95], [14.25, 77.05], [13.95, 77.45],
  [13.85, 77.95], [13.55, 78.25], [13.1, 78.45], [12.8, 78.5], [12.6, 78.15], [12.7, 77.8], [12.3, 77.75],
  [11.95, 77.75], [11.7, 77.4], [11.6, 77.0], [11.75, 76.55], [11.85, 76.2], [12.05, 75.9], [12.35, 75.55],
  [12.75, 74.9], [13.3, 74.72], [13.9, 74.55], [14.4, 74.4], [14.85, 74.1], [15.25, 74.25], [15.6, 74.35],
  [15.85, 74.1], [16.05, 74.35], [16.4, 74.55], [16.75, 74.9], [17.1, 75.3], [17.45, 75.85], [17.7, 76.25],
  [17.95, 76.55], [18.15, 76.9],
];
type PinStatus = "completed" | "progress" | "pending" | "due";

const PIN_STATUS: Record<PinStatus, { label: string; color: string }> = {
  completed: { label: "Completed", color: "#16a34a" },
  progress: { label: "In Progress", color: "#f59e0b" },
  pending: { label: "Pending", color: "#ef4444" },
  due: { label: "Assessment Due", color: "#2563eb" },
};

const MAP_PROJECTS: {
  id: string;
  name: string;
  place: string;
  district: string;
  lat: number;
  lng: number;
  status: PinStatus;
  demand: string;
  collected: string;
}[] = [
  { id: "PRJ-000245", name: "ABC Commercial Complex", place: "Marathahalli, Bengaluru", district: "Bengaluru Urban", lat: 12.96, lng: 77.7, status: "progress", demand: "₹ 20,00,000", collected: "₹ 0 · Payment due" },
  { id: "PRJ-000321", name: "Metro Retail Building", place: "Peenya, Bengaluru", district: "Bengaluru Urban", lat: 13.03, lng: 77.52, status: "pending", demand: "₹ 12,40,000", collected: "₹ 0" },
  { id: "PRJ-000198", name: "Tech Park Phase 2", place: "Whitefield, Bengaluru", district: "Bengaluru Urban", lat: 12.9, lng: 77.78, status: "completed", demand: "₹ 81,00,000", collected: "₹ 81,00,000" },
  { id: "PRJ-000412", name: "Mysuru Heritage Mall", place: "Hebbal, Mysuru", district: "Mysuru", lat: 12.3, lng: 76.62, status: "completed", demand: "₹ 18,20,000", collected: "₹ 18,20,000" },
  { id: "PRJ-000433", name: "Belagavi Textile Park", place: "Udyambag, Belagavi", district: "Belagavi", lat: 15.85, lng: 74.5, status: "progress", demand: "₹ 26,50,000", collected: "₹ 14,00,000" },
  { id: "PRJ-000451", name: "Hubballi Logistics Hub", place: "Gokul Road, Hubballi", district: "Dharwad", lat: 15.35, lng: 75.12, status: "due", demand: "Assessment due", collected: "—" },
  { id: "PRJ-000468", name: "Kalaburagi Medical Block", place: "Sedam Road, Kalaburagi", district: "Kalaburagi", lat: 17.33, lng: 76.83, status: "completed", demand: "₹ 9,80,000", collected: "₹ 9,80,000" },
  { id: "PRJ-000472", name: "Mangaluru Port Towers", place: "Panambur, Mangaluru", district: "Dakshina Kannada", lat: 12.92, lng: 74.86, status: "progress", demand: "₹ 32,00,000", collected: "₹ 20,00,000" },
  { id: "PRJ-000485", name: "Shivamogga Civic Centre", place: "Vinoba Nagar, Shivamogga", district: "Shivamogga", lat: 13.93, lng: 75.57, status: "completed", demand: "₹ 7,60,000", collected: "₹ 7,60,000" },
  { id: "PRJ-000497", name: "Ballari Steel Housing", place: "Toranagallu, Ballari", district: "Ballari", lat: 15.18, lng: 76.7, status: "pending", demand: "₹ 15,30,000", collected: "₹ 0" },
  { id: "PRJ-000503", name: "Tumakuru Industrial Shed", place: "Vasanthanarasapura", district: "Tumakuru", lat: 13.4, lng: 77.1, status: "due", demand: "Assessment due", collected: "—" },
  { id: "PRJ-000511", name: "Vijayapura Solar Campus", place: "Athani Road, Vijayapura", district: "Vijayapura", lat: 16.83, lng: 75.7, status: "completed", demand: "₹ 11,10,000", collected: "₹ 11,10,000" },
  { id: "PRJ-000526", name: "Udupi Coastal Resort", place: "Malpe, Udupi", district: "Udupi", lat: 13.35, lng: 74.75, status: "progress", demand: "₹ 8,40,000", collected: "₹ 4,00,000" },
  { id: "PRJ-000534", name: "Hassan Agro Market", place: "BM Road, Hassan", district: "Hassan", lat: 13.0, lng: 76.1, status: "completed", demand: "₹ 5,90,000", collected: "₹ 5,90,000" },
  { id: "PRJ-000547", name: "Davanagere Textile Mill", place: "PB Road, Davanagere", district: "Davanagere", lat: 14.46, lng: 75.92, status: "pending", demand: "₹ 6,70,000", collected: "₹ 0" },
  { id: "PRJ-000552", name: "Chitradurga Wind Yard", place: "Hiriyur, Chitradurga", district: "Chitradurga", lat: 14.0, lng: 76.6, status: "completed", demand: "₹ 4,40,000", collected: "₹ 4,40,000" },
  { id: "PRJ-000561", name: "Bidar Aero Housing", place: "Naubad, Bidar", district: "Bidar", lat: 17.92, lng: 77.52, status: "progress", demand: "₹ 6,10,000", collected: "₹ 3,00,000" },
  { id: "PRJ-000574", name: "Raichur Power Colony", place: "Shaktinagar, Raichur", district: "Raichur", lat: 16.2, lng: 77.35, status: "due", demand: "Assessment due", collected: "—" },
  { id: "PRJ-000588", name: "Mandya Sugar Complex", place: "Maddur, Mandya", district: "Mandya", lat: 12.58, lng: 76.9, status: "completed", demand: "₹ 3,80,000", collected: "₹ 3,80,000" },
  { id: "PRJ-000592", name: "Kolar Gold Township", place: "KGF, Kolar", district: "Kolar", lat: 12.95, lng: 78.27, status: "pending", demand: "₹ 5,20,000", collected: "₹ 0" },
  { id: "PRJ-000603", name: "Karwar Naval Housing", place: "Karwar, Uttara Kannada", district: "Uttara Kannada", lat: 14.8, lng: 74.2, status: "completed", demand: "₹ 9,90,000", collected: "₹ 9,90,000" },
  { id: "PRJ-000617", name: "Gadag Wind Park", place: "Mundargi, Gadag", district: "Gadag", lat: 15.3, lng: 75.75, status: "progress", demand: "₹ 4,20,000", collected: "₹ 2,00,000" },
  { id: "PRJ-000629", name: "Devanahalli Aero City", place: "Devanahalli", district: "Bengaluru Rural", lat: 13.25, lng: 77.7, status: "due", demand: "Assessment due", collected: "—" },
  { id: "PRJ-000634", name: "Madikeri Hill Resort", place: "Madikeri, Kodagu", district: "Kodagu", lat: 12.42, lng: 75.74, status: "completed", demand: "₹ 3,10,000", collected: "₹ 3,10,000" },
];

const NAV: { label: string; Icon: CessIcon; active?: boolean }[] = [
  { label: "Dashboard", Icon: House, active: true },
  { label: "Map View", Icon: MapTrifold },
  { label: "Projects", Icon: Buildings },
  { label: "Assessments", Icon: ClipboardText },
  { label: "Collections", Icon: Wallet },
  { label: "Remittances", Icon: Bank },
  { label: "Reconciliation", Icon: Scales },
  { label: "Reports", Icon: ChartBar },
  { label: "Analytics", Icon: ChartLineUp },
  { label: "Master Data", Icon: Database },
  { label: "Settings", Icon: Gear },
];

const FILTERS: { label: string; value: string }[] = [
  { label: "State", value: "Karnataka" },
  { label: "Division", value: "All Divisions" },
  { label: "District", value: "All Districts" },
  { label: "Taluk", value: "All Taluks" },
  { label: "ULB / Local Area", value: "All ULBs" },
];

const KPIS: { label: string; value: string; delta: string; bad?: boolean; Icon: CessIcon; tint: string; color: string; spark: number[] }[] = [
  { label: "Total Projects", value: "12,846", delta: "12%", Icon: Buildings, tint: "#eaf2ff", color: "#2563eb", spark: [4, 5, 4, 6, 7, 6, 8, 9] },
  { label: "Assessments Completed", value: "8,942", delta: "18%", Icon: ClipboardText, tint: "#e8f8ef", color: "#16a34a", spark: [3, 4, 5, 5, 6, 7, 7, 9] },
  { label: "CESS Demand Generated", value: "₹ 1,248 Cr", delta: "22%", Icon: CurrencyInr, tint: "#fff4e5", color: "#f59e0b", spark: [3, 3, 5, 4, 6, 7, 8, 9] },
  { label: "Amount Collected", value: "₹ 892 Cr", delta: "16%", Icon: Wallet, tint: "#f3edff", color: "#7c3aed", spark: [2, 4, 4, 5, 5, 7, 8, 8] },
  { label: "Remittance Received", value: "₹ 786 Cr", delta: "19%", Icon: Bank, tint: "#e6f6f8", color: "#0891b2", spark: [3, 4, 4, 6, 6, 7, 8, 9] },
  { label: "Pending Remittance", value: "₹ 106 Cr", delta: "8%", bad: true, Icon: WarningCircle, tint: "#fdecec", color: "#dc2626", spark: [5, 4, 6, 5, 6, 7, 6, 8] },
  { label: "Compliance Exceptions", value: "452", delta: "25%", bad: true, Icon: ShieldCheck, tint: "#fdecef", color: "#e11d48", spark: [3, 4, 3, 5, 6, 6, 8, 9] },
];

const TERRITORY_BARS: { name: string; value: number; color: string }[] = [
  { name: "Bengaluru Urban", value: 2856, color: "#3b82f6" },
  { name: "Mysuru", value: 1124, color: "#8b5cf6" },
  { name: "Belagavi", value: 986, color: "#ec4899" },
  { name: "Mangaluru", value: 842, color: "#f97316" },
  { name: "Kalaburagi", value: 698, color: "#eab308" },
  { name: "Dharwad", value: 612, color: "#22c55e" },
  { name: "Shivamogga", value: 556, color: "#14b8a6" },
  { name: "Tumakuru", value: 488, color: "#06b6d4" },
  { name: "Ballari", value: 432, color: "#6366f1" },
  { name: "Others", value: 2250, color: "#94a3b8" },
];

const TREND: { m: string; demand: number; collected: number; remitted: number }[] = [
  { m: "Apr", demand: 118, collected: 82, remitted: 70 },
  { m: "May", demand: 156, collected: 108, remitted: 92 },
  { m: "Jun", demand: 204, collected: 140, remitted: 128 },
  { m: "Jul", demand: 214, collected: 152, remitted: 134 },
  { m: "Aug", demand: 262, collected: 188, remitted: 170 },
  { m: "Sep", demand: 248, collected: 170, remitted: 150 },
];

const PENDING_ASSESSMENTS: [string, string, string, string, string][] = [
  ["PRJ-000321", "Metro Retail Building", "Peenya", "Bengaluru Urban", "12 Sep 2025"],
  ["PRJ-000328", "Tech Park Phase 3", "Devanahalli", "Bengaluru Rural", "10 Sep 2025"],
  ["PRJ-000310", "Residential Layout", "Jakkur", "Bengaluru Urban", "08 Sep 2025"],
  ["PRJ-000307", "Industrial Shed", "Nelamangala", "Bengaluru Rural", "07 Sep 2025"],
  ["PRJ-000295", "Commercial Complex", "Hebbal", "Bengaluru Urban", "05 Sep 2025"],
];

const EXCEPTIONS: [string, string, string, number, "Open" | "In Review"][] = [
  ["PRJ-000246", "Yelahanka", "Unrecorded Work", 45, "Open"],
  ["PRJ-000251", "Thanisandra", "Area Mismatch", 38, "Open"],
  ["PRJ-000262", "Jakkur", "No Approved Plan", 32, "Open"],
  ["PRJ-000274", "Devanahalli", "Under-reporting", 26, "Open"],
  ["PRJ-000289", "Hebbal", "Legal Appeal", 21, "In Review"],
];

export function MisDashboard({ reduce }: { reduce: boolean }) {
  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-2xl bg-[#f1f5fb] shadow-[0_12px_32px_rgba(7,20,51,0.12)] ring-1 ring-navy/10">
      <nav className="flex w-[70px] shrink-0 flex-col gap-0.5 overflow-y-auto bg-[linear-gradient(180deg,#0b1f4a_0%,#0a2a5e_100%)] py-1.5">
        {NAV.map((item, i) => (
          <motion.span
            key={item.label}
            className={cn(
              "mx-1 flex flex-col items-center gap-0.5 rounded-lg px-0.5 py-1.5 text-center text-[8.5px] leading-tight font-semibold",
              item.active ? "bg-[#1476e8] text-white shadow-[0_6px_14px_rgba(20,118,232,0.4)]" : "text-white/75",
            )}
            initial={reduce ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, delay: reduce ? 0 : i * 0.03 }}
          >
            <item.Icon weight="fill" className="size-4" />
            {item.label}
          </motion.span>
        ))}
      </nav>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[46px] shrink-0 items-center gap-2 bg-[linear-gradient(90deg,#0b1f4a_0%,#123a7a_100%)] px-3 text-white">
          <img src={karnatakaEmblem} alt="" className="size-8 object-contain" />
          <div className="mr-2 leading-tight">
            <b className="font-display block text-[13px]">Labour CESS Tracking &amp; Monitoring System</b>
            <span className="block text-[10px] text-white/70">MIS Dashboard</span>
          </div>
          <div className="ml-auto flex min-w-0 items-center gap-1.5">
            {FILTERS.map((f) => (
              <span key={f.label} className="hidden min-w-[92px] flex-col rounded-md bg-white px-2 py-0.5 text-navy lg:flex">
                <span className="text-[7.5px] text-navy/55">{f.label}</span>
                <span className="flex items-center justify-between gap-2 text-[9.5px] font-bold">
                  {f.value}
                  <CaretDown weight="bold" className="size-2.5 text-navy/50" />
                </span>
              </span>
            ))}
            <span className="flex items-center gap-1.5 rounded-md bg-white px-2 py-1.5 text-[9.5px] font-bold text-navy">
              <CalendarBlank weight="fill" className="size-3 text-[#1476e8]" />
              01 Apr 2024 – 30 Sep 2025
            </span>
            <span className="flex items-center gap-1.5 pl-1 text-[9.5px] font-semibold">
              <span className="grid size-6 place-items-center rounded-full bg-white/15 ring-1 ring-white/30">
                <User weight="fill" className="size-3.5" />
              </span>
              Department User
            </span>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-1.5 p-1.5">
          <div className="grid shrink-0 grid-cols-7 gap-1.5">
            {KPIS.map((k, i) => (
              <KpiCard key={k.label} k={k} i={i} reduce={reduce} />
            ))}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[1.55fr_1fr_1fr] grid-rows-2 gap-1.5">
            <Panel title="Project Distribution (GIS View)" className="row-span-2" delay={0.15} reduce={reduce}>
              <GisDistribution reduce={reduce} />
            </Panel>
            <Panel title="Projects by Status" delay={0.2} reduce={reduce}>
              <StatusDonut reduce={reduce} />
            </Panel>
            <Panel title="CESS Funnel (₹ Crore)" delay={0.25} reduce={reduce}>
              <CessFunnel reduce={reduce} />
            </Panel>
            <Panel title="Projects by Territory (Top 10 Districts)" delay={0.3} reduce={reduce}>
              <TerritoryBars reduce={reduce} />
            </Panel>
            <Panel title="Monthly Trend (₹ Crore)" delay={0.35} reduce={reduce}>
              <MonthlyTrend reduce={reduce} />
            </Panel>
          </div>

          <div className="grid h-[132px] shrink-0 grid-cols-[1.3fr_0.75fr_1.25fr] gap-1.5">
            <Panel title="Pending Assessments (Top 5)" action="View All" delay={0.4} reduce={reduce}>
              <MiniTable
                head={["#", "Project ID", "Project Name", "Location", "District", "Assigned On", "Status"]}
                cols="grid-cols-[14px_62px_minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,1fr)_62px_46px]"
                rows={PENDING_ASSESSMENTS.map((r, i) => [
                  String(i + 1),
                  r[0],
                  r[1],
                  r[2],
                  r[3],
                  r[4],
                  <Chip key="s" tone="red">Pending</Chip>,
                ])}
              />
            </Panel>
            <Panel title="Remittance Status (₹ Crore)" action="View Details" delay={0.45} reduce={reduce}>
              <RemittanceDonut reduce={reduce} />
            </Panel>
            <Panel title="Compliance Exceptions (Top 5)" action="View All" delay={0.5} reduce={reduce}>
              <MiniTable
                head={["#", "Project ID", "Location", "Exception Type", "Days", "Status"]}
                cols="grid-cols-[14px_62px_minmax(0,0.9fr)_minmax(0,1.2fr)_30px_54px]"
                rows={EXCEPTIONS.map((r, i) => [
                  String(i + 1),
                  r[0],
                  r[1],
                  r[2],
                  String(r[3]),
                  <Chip key="s" tone={r[4] === "Open" ? "red" : "amber"}>
                    {r[4]}
                  </Chip>,
                ])}
              />
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({
  title,
  action,
  className,
  delay,
  reduce,
  children,
}: {
  title: string;
  action?: string;
  className?: string;
  delay: number;
  reduce: boolean;
  children: ReactNode;
}) {
  return (
    <motion.section
      className={cn("flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl bg-white px-2.5 pt-1.5 pb-2 shadow-[0_2px_8px_rgba(7,20,51,0.06)] ring-1 ring-navy/8", className)}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-1 flex shrink-0 items-center justify-between gap-2">
        <b className="truncate text-[11px] text-navy">{title}</b>
        {action ? (
          <span className="inline-flex shrink-0 items-center gap-0.5 text-[9px] font-bold text-[#1476e8]">
            {action}
            <ArrowRight weight="bold" className="size-2.5" />
          </span>
        ) : null}
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </motion.section>
  );
}

function KpiCard({ k, i, reduce }: { k: (typeof KPIS)[number]; i: number; reduce: boolean }) {
  const max = Math.max(...k.spark);
  const pts = k.spark.map((v, j) => `${(j / (k.spark.length - 1)) * 60},${22 - (v / max) * 18}`).join(" ");
  return (
    <motion.div
      className="relative flex min-w-0 flex-col overflow-hidden rounded-xl px-2 pt-1.5 pb-1 ring-1 ring-navy/6"
      style={{ background: k.tint }}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: reduce ? 0 : 0.05 + i * 0.05 }}
    >
      <div className="flex items-center gap-1.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-full text-white" style={{ background: k.color }}>
          <k.Icon weight="fill" className="size-3.5" />
        </span>
        <span className="min-w-0 text-[9px] leading-tight font-bold text-navy/80">{k.label}</span>
      </div>
      <div className="mt-0.5 flex items-end justify-between gap-1">
        <div className="min-w-0">
          <b className="font-display block truncate text-[16px] leading-tight text-navy">{k.value}</b>
          <span className={cn("text-[8.5px] font-bold", k.bad ? "text-[#dc2626]" : "text-[#16a34a]")}>
            ▲ {k.delta} <span className="font-medium text-navy/50">vs last period</span>
          </span>
        </div>
        <svg viewBox="0 0 60 24" className="h-[22px] w-[52px] shrink-0">
          <motion.polyline
            points={pts}
            fill="none"
            stroke={k.color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: reduce ? 0 : 0.3 + i * 0.05 }}
          />
        </svg>
      </div>
    </motion.div>
  );
}

type MapStyle = "map" | "satellite" | "hybrid";

const KA_SW = project([11.55, 74.0]);
const KA_NE = project([18.5, 78.6]);
const MAP_PAD = { l: 112, r: 184, t: 26, b: 8 };
const MINI_PIN = "M0 0C-3-6-9-9-9-15a9 9 0 0 1 18 0c0 6-6 9-9 15z";

function fitKarnataka(size: TileSize, zoom: number): TileView {
  const [x0, y1] = KA_SW;
  const [x1, y0] = KA_NE;
  const aw = Math.max(size.w - MAP_PAD.l - MAP_PAD.r, 100);
  const ah = Math.max(size.h - MAP_PAD.t - MAP_PAD.b, 100);
  const s = Math.min(aw / (x1 - x0), ah / (y1 - y0)) * zoom;
  const sx = MAP_PAD.l + aw / 2;
  const sy = MAP_PAD.t + ah / 2;
  return { cx: (x0 + x1) / 2 - (sx - size.w / 2) / s, cy: (y0 + y1) / 2 - (sy - size.h / 2) / s, s };
}

function GisDistribution({ reduce }: { reduce: boolean }) {
  const [selected, setSelected] = useState("PRJ-000245");
  const [style, setStyle] = useState<MapStyle>("map");
  const [zoom, setZoom] = useState(1);
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<TileSize | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const view = useMemo(() => (size && size.w > 0 ? fitKarnataka(size, zoom) : null), [size, zoom]);
  const sel = MAP_PROJECTS.find((p) => p.id === selected) ?? MAP_PROJECTS[0];
  const sat = style !== "map";

  const toScreen = (lat: number, lng: number): Pt => {
    if (!view || !size) return [0, 0];
    const [wx, wy] = project([lat, lng]);
    return [(wx - view.cx) * view.s + size.w / 2, (wy - view.cy) * view.s + size.h / 2];
  };
  const outlineD = view ? `M${OUTLINE_LL.map(([lat, lng]) => toScreen(lat, lng).map((v) => v.toFixed(1)).join(",")).join("L")}Z` : "";
  const [sx, sy] = toScreen(sel.lat, sel.lng);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden rounded-lg bg-[#dfe7ee]">
      {view && size ? (
        <>
          <div className={cn("absolute inset-0", !sat && "saturate-[0.9]")}>
            <TileLayer view={view} size={size} z={tileZoomFor(view.s)} service={sat ? "satellite" : "map"} />
            {style === "hybrid" ? <TileLayer view={view} size={size} z={tileZoomFor(view.s)} service="labels" /> : null}
          </div>

          <svg viewBox={`0 0 ${size.w} ${size.h}`} className="absolute inset-0 h-full w-full">
            <path
              d={outlineD}
              fill="#1476e8"
              fillOpacity={sat ? 0.14 : 0.08}
              stroke="#ffffff"
              strokeWidth="4"
              strokeOpacity="0.85"
              strokeLinejoin="round"
              pointerEvents="none"
            />
            <motion.path
              d={outlineD}
              fill="none"
              stroke="#1476e8"
              strokeWidth="1.8"
              strokeDasharray="6 3"
              strokeLinejoin="round"
              pointerEvents="none"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: "easeInOut" }}
            />

            {[...MAP_PROJECTS.filter((p) => p.id !== selected), sel].map((p, i) => {
              const [x, y] = toScreen(p.lat, p.lng);
              const on = p.id === selected;
              return (
                <motion.g
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => setSelected(p.id)}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: reduce ? 0 : 0.6 + i * 0.03 }}
                >
                  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${on ? 0.95 : 0.66})`}>
                    <path
                      d={MINI_PIN}
                      fill={PIN_STATUS[p.status].color}
                      stroke="#ffffff"
                      strokeWidth="2"
                      filter="drop-shadow(0 2px 2px rgba(7,20,51,0.35))"
                    />
                    <circle cx="0" cy="-15" r="3.4" fill="#ffffff" />
                  </g>
                </motion.g>
              );
            })}

            {!reduce ? (
              <motion.circle
                key={`pulse-${selected}`}
                cx={sx}
                cy={sy - 14}
                fill="none"
                stroke={PIN_STATUS[sel.status].color}
                strokeWidth="2"
                animate={{ r: [8, 20], opacity: [0.75, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
            ) : null}
          </svg>
        </>
      ) : null}

      <div className="absolute top-1.5 left-1.5 z-10 flex overflow-hidden rounded-md bg-white text-[9px] font-bold shadow-sm ring-1 ring-navy/10">
        {(["map", "satellite", "hybrid"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setStyle(m)}
            className={cn("px-2 py-0.5 capitalize", style === m ? "bg-[#1476e8] text-white" : "text-navy/70 hover:bg-navy/5")}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="absolute bottom-1.5 left-1.5 w-[102px] rounded-md bg-white/95 px-1.5 py-1 text-[8.5px] font-semibold whitespace-nowrap text-navy shadow-sm ring-1 ring-navy/10">
        {(Object.keys(PIN_STATUS) as PinStatus[]).map((k) => (
          <div key={k} className="flex items-center gap-1.5 py-px">
            <span className="size-2 rounded-full" style={{ background: PIN_STATUS[k].color }} />
            {PIN_STATUS[k].label}
          </div>
        ))}
        <div className="flex items-center gap-1.5 py-px">
          <span className="h-0 w-2.5 border-t-2 border-dashed border-[#1476e8]" />
          State Boundary
        </div>
      </div>

      <div className="absolute top-1.5 right-1.5 z-10 flex flex-col gap-1">
        <span className="flex flex-col overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-navy/10">
          <button type="button" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(z * 1.4, 3))} className="grid size-6 place-items-center border-b border-navy/10 text-navy hover:bg-navy/5">
            <Plus weight="bold" className="size-3" />
          </button>
          <button type="button" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(z / 1.4, 0.7))} className="grid size-6 place-items-center text-navy hover:bg-navy/5">
            <Minus weight="bold" className="size-3" />
          </button>
        </span>
        <button type="button" aria-label="Fit Karnataka" onClick={() => setZoom(1)} className="grid size-6 place-items-center rounded-md bg-white text-[#1476e8] shadow-sm ring-1 ring-navy/10 hover:bg-navy/5">
          <Crosshair weight="bold" className="size-3.5" />
        </button>
      </div>
      <span className="pointer-events-none absolute top-[76px] right-1.5 z-10 rounded bg-white/75 px-1 text-[7px] text-navy/60">© Esri</span>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={sel.id}
          className="absolute right-1.5 bottom-1.5 w-[172px] rounded-lg bg-white p-1.5 shadow-[0_10px_24px_rgba(7,20,51,0.18)] ring-1 ring-navy/10"
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 8 }}
          transition={{ duration: 0.22 }}
        >
          <div className="flex gap-2">
            <img src={abcSite} alt="" className="size-8 shrink-0 rounded-md object-cover object-top" />
            <div className="min-w-0">
              <b className="block truncate text-[10px] leading-tight text-navy">{sel.name}</b>
              <span
                className="mt-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-px text-[8.5px] font-bold text-white"
                style={{ background: PIN_STATUS[sel.status].color }}
              >
                {PIN_STATUS[sel.status].label}
              </span>
            </div>
          </div>
          <dl className="mt-1 grid grid-cols-[58px_minmax(0,1fr)] gap-y-px text-[8.5px]">
            {[
              ["Project ID", sel.id],
              ["Location", sel.place],
              ["CESS Demand", sel.demand],
              ["Collected", sel.collected],
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="text-navy/55">{k}</dt>
                <dd className="truncate font-semibold text-navy">{v}</dd>
              </div>
            ))}
          </dl>
          <span className="mt-0.5 flex items-center justify-end gap-0.5 text-[8.5px] font-bold text-[#1476e8]">
            View Details
            <ArrowRight weight="bold" className="size-2.5" />
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Donut({
  segments,
  size,
  thickness,
  reduce,
  children,
}: {
  segments: { value: number; color: string }[];
  size: number;
  thickness: number;
  reduce: boolean;
  children?: ReactNode;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const starts = segments.map((_, i) => segments.slice(0, i).reduce((sum, s) => sum + (s.value / total) * c, 0));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f7" strokeWidth={thickness} />
        {segments.map((s, i) => {
          const len = (s.value / total) * c;
          const dash = `${Math.max(len - 2, 0)} ${c}`;
          return (
            <motion.circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={dash}
              strokeDashoffset={-starts[i]}
              initial={reduce ? false : { opacity: 0, strokeDasharray: `0 ${c}` }}
              animate={{ opacity: 1, strokeDasharray: dash }}
              transition={{ duration: 0.7, delay: reduce ? 0 : 0.35 + i * 0.15 }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

function StatusDonut({ reduce }: { reduce: boolean }) {
  const rows = [
    { label: "Completed", value: 8942, pct: "70%", color: "#16a34a" },
    { label: "In Progress", value: 2156, pct: "17%", color: "#f59e0b" },
    { label: "Pending", value: 1748, pct: "14%", color: "#ef4444" },
  ];
  return (
    <div className="flex h-full items-center gap-3">
      <Donut segments={rows} size={104} thickness={16} reduce={reduce}>
        <div className="leading-tight">
          <b className="font-display block text-[15px] text-navy">12,846</b>
          <span className="text-[9px] text-navy/60">Projects</span>
        </div>
      </Donut>
      <ul className="flex min-w-0 flex-1 flex-col gap-1.5 text-[10px]">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-1.5">
            <span className="size-2.5 shrink-0 rounded-full" style={{ background: r.color }} />
            <span className="min-w-0 flex-1 text-navy/80">{r.label}</span>
            <b className="text-navy">{r.value.toLocaleString("en-IN")}</b>
            <span className="w-8 text-right text-navy/55">({r.pct})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CessFunnel({ reduce }: { reduce: boolean }) {
  const bars = [
    { label: "Demand Generated", value: 1248, color: "#2563eb" },
    { label: "Collected", value: 892, color: "#22c55e" },
    { label: "Remitted", value: 786, color: "#06b6d4" },
    { label: "Pending Remittance", value: 106, color: "#ef4444" },
  ];
  return (
    <div className="flex h-full items-end gap-1.5 px-1">
      {bars.map((b, i) => (
        <div key={b.label} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end">
          <b className="text-[11px] text-navy">{b.value.toLocaleString("en-IN")}</b>
          <div className="relative flex w-full flex-1 items-end">
            <motion.div
              className="w-full origin-bottom rounded-t-md"
              style={{ background: `linear-gradient(180deg, ${b.color}, ${b.color}cc)`, height: `${Math.max((b.value / 1248) * 100, 6)}%` }}
              initial={reduce ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.6, delay: reduce ? 0 : 0.35 + i * 0.12 }}
            />
            {i < bars.length - 1 ? (
              <ArrowRight weight="bold" className="absolute top-1/3 -right-2 z-[1] size-3 text-navy/35" />
            ) : null}
          </div>
          <span className="mt-0.5 line-clamp-2 text-center text-[8.5px] leading-tight text-navy/70">{b.label}</span>
        </div>
      ))}
    </div>
  );
}

function TerritoryBars({ reduce }: { reduce: boolean }) {
  const max = 2856;
  return (
    <ul className="grid h-full grid-rows-10 overflow-hidden">
      {TERRITORY_BARS.map((b, i) => (
        <li key={b.name} className="grid min-h-0 grid-cols-[82px_minmax(0,1fr)_34px] items-center gap-1.5 text-[9px] leading-none">
          <span className="truncate text-navy/80">{b.name}</span>
          <span className="relative h-[7px] rounded-full bg-[#eef2f7]">
            <motion.span
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ background: b.color, width: `${(b.value / max) * 100}%`, transformOrigin: "left" }}
              initial={reduce ? false : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: reduce ? 0 : 0.35 + i * 0.05 }}
            />
          </span>
          <b className="text-right text-navy">{b.value.toLocaleString("en-IN")}</b>
        </li>
      ))}
    </ul>
  );
}

function MonthlyTrend({ reduce }: { reduce: boolean }) {
  const W = 240;
  const H = 110;
  const max = 280;
  const bw = 11;
  const step = W / TREND.length;
  const y = (v: number) => H - (v / max) * (H - 8);
  const line = TREND.map((t, i) => `${i * step + step / 2},${y(t.remitted)}`).join(" ");
  return (
    <div className="flex h-full gap-2">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-0.5 flex gap-2.5 text-[8.5px] text-navy/70">
          <span className="inline-flex items-center gap-1"><span className="size-2 rounded-sm bg-[#3b82f6]" />Demand Generated</span>
          <span className="inline-flex items-center gap-1"><span className="size-2 rounded-sm bg-[#4ade80]" />Amount Collected</span>
          <span className="inline-flex items-center gap-1"><span className="h-0.5 w-3 bg-[#1e40af]" />Remittance Received</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H + 14}`} preserveAspectRatio="none" className="min-h-0 w-full flex-1">
          {[0, 1, 2, 3].map((g) => (
            <line key={g} x1="0" x2={W} y1={8 + (g * (H - 8)) / 3} y2={8 + (g * (H - 8)) / 3} stroke="#eef2f7" />
          ))}
          {TREND.map((t, i) => {
            const cx = i * step + step / 2;
            return (
              <g key={t.m}>
                <motion.rect
                  x={cx - bw - 1}
                  width={bw}
                  y={y(t.demand)}
                  height={H - y(t.demand)}
                  rx="1.5"
                  fill="#3b82f6"
                  style={{ transformOrigin: `0px ${H}px`, transformBox: "view-box" }}
                  initial={reduce ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: reduce ? 0 : 0.4 + i * 0.06 }}
                />
                <motion.rect
                  x={cx + 1}
                  width={bw}
                  y={y(t.collected)}
                  height={H - y(t.collected)}
                  rx="1.5"
                  fill="#4ade80"
                  style={{ transformOrigin: `0px ${H}px`, transformBox: "view-box" }}
                  initial={reduce ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.5, delay: reduce ? 0 : 0.45 + i * 0.06 }}
                />
                <text x={cx} y={H + 11} textAnchor="middle" fontSize="8" fill="#64748b">
                  {t.m}
                </text>
              </g>
            );
          })}
          <motion.polyline
            points={line}
            fill="none"
            stroke="#1e40af"
            strokeWidth="1.8"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, delay: reduce ? 0 : 0.8 }}
          />
          {TREND.map((t, i) => (
            <circle key={t.m} cx={i * step + step / 2} cy={y(t.remitted)} r="2.4" fill="#ffffff" stroke="#1e40af" strokeWidth="1.5" />
          ))}
        </svg>
      </div>
      <div className="flex w-[84px] shrink-0 flex-col justify-center gap-1 rounded-lg bg-[#f5f8fc] px-2 py-1 text-[8.5px] ring-1 ring-navy/6">
        <span className="font-bold text-navy/60">Apr – Sep 2025</span>
        {[
          ["₹ 1,248 Cr", "Demand Generated"],
          ["₹ 892 Cr", "Collected"],
          ["₹ 786 Cr", "Remitted"],
        ].map(([v, l]) => (
          <div key={l} className="leading-tight">
            <b className="font-display block text-[12px] text-navy">{v}</b>
            <span className="text-navy/60">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RemittanceDonut({ reduce }: { reduce: boolean }) {
  const rows = [
    { label: "Remitted", value: 786, pct: "88%", color: "#16a34a" },
    { label: "Pending (within 30 days)", value: 68, pct: "8%", color: "#f59e0b" },
    { label: "Overdue > 30 days", value: 38, pct: "4%", color: "#ef4444" },
  ];
  return (
    <div className="flex h-full items-center gap-2">
      <Donut segments={rows} size={86} thickness={13} reduce={reduce}>
        <div className="leading-tight">
          <b className="font-display block text-[14px] text-navy">892</b>
          <span className="text-[8px] text-navy/60">Collected</span>
        </div>
      </Donut>
      <ul className="flex min-w-0 flex-1 flex-col gap-1 text-[9px]">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-1">
            <span className="size-2 shrink-0 rounded-full" style={{ background: r.color }} />
            <span className="min-w-0 flex-1 truncate text-navy/80">{r.label}</span>
            <b className="text-navy">{r.value}</b>
            <span className="text-navy/55">({r.pct})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MiniTable({ head, cols, rows }: { head: string[]; cols: string; rows: ReactNode[][] }) {
  return (
    <div className="flex h-full flex-col text-[9px]">
      <div className={cn("grid items-center gap-1.5 border-b border-navy/8 pb-0.5 font-bold text-navy/55", cols)}>
        {head.map((h) => (
          <span key={h} className="truncate">
            {h}
          </span>
        ))}
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-around">
        {rows.map((r, i) => (
          <div key={i} className={cn("grid items-center gap-1.5 text-navy", cols)}>
            {r.map((cell, j) => (
              <span key={j} className={cn("truncate", j === 1 && "font-semibold")}>
                {cell}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Chip({ tone, children }: { tone: "red" | "amber"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-block rounded px-1.5 py-px text-center text-[8.5px] font-bold",
        tone === "red" ? "bg-[#fdecec] text-[#dc2626]" : "bg-[#fff4d6] text-[#b45309]",
      )}
    >
      {children}
    </span>
  );
}
