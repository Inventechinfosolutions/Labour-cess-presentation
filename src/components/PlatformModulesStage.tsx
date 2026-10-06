import { useCallback, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { motion, useReducedMotion } from "motion/react";
import { stageFont } from "@/lib/stageFont";
import hubSite from "@/assets/core-hub-site.jpg";
import stageBg from "@/assets/core-stage-bg.jpg";
import i3dGov from "@/assets/icon-3d-gov-building.png";
import i3dUlb from "@/assets/icon-3d-ulb-building.png";
import i3dBuilding from "@/assets/icon-3d-building.png";
import i3dHardhatClean from "@/assets/icon-3d-hardhat-clean.png";
import i3dHardhat from "@/assets/icon-3d-hardhat.png";
import i3dOfficer from "@/assets/icon-3d-officer-clean.png";
import i3dUsers from "@/assets/icon-3d-users.png";
import i3dEnvelope from "@/assets/icon-3d-envelope.png";
import i3dFile from "@/assets/icon-3d-file.png";
import i3dPipes from "@/assets/icon-3d-pipes.png";
import i3dMapPin from "@/assets/icon-3d-map-pin.png";
import i3dMapPinClean from "@/assets/icon-3d-map-pin-clean.png";
import i3dEvidence from "@/assets/icon-3d-evidence-clean.png";
import i3dScales from "@/assets/icon-3d-scales.png";
import i3dRupee from "@/assets/icon-3d-rupee.png";
import i3dWallet from "@/assets/icon-3d-wallet.png";
import i3dCalendar from "@/assets/icon-3d-calendar-clean.png";
import i3dBlueprints from "@/assets/icon-blueprints.png";
import i3dDocument from "@/assets/icon3d-document.jpg";
import i3dFolder from "@/assets/icon3d-folder.jpg";
import secLock from "@/assets/sec-lock.jpg";
import secUsers from "@/assets/sec-users.jpg";
import archData from "@/assets/arch-data.jpg";
import archInfra from "@/assets/arch-infra.jpg";
import archMicro from "@/assets/arch-micro.jpg";
import archChannels from "@/assets/arch-channels.jpg";
import capConnectors from "@/assets/mw-cap-connectors.jpg";
import capLogs from "@/assets/mw-cap-logs.jpg";
import capHealth from "@/assets/mw-cap-health.jpg";
import capValidation from "@/assets/mw-cap-validation.jpg";
import procDeduct from "@/assets/proc-3d-deduct.jpg";
import procRemit from "@/assets/proc-3d-remit.jpg";
import procAssess from "@/assets/proc-3d-assess.jpg";
import sysUtil from "@/assets/sys-3d-util.jpg";
import sysPsu from "@/assets/sys-3d-psu.jpg";
import sysUlb from "@/assets/sys-3d-ulb.jpg";
import sysDept from "@/assets/sys-3d-dept.jpg";
import issueScatter from "@/assets/issue-3d-scatter.jpg";
import issueShare from "@/assets/issue-3d-share.jpg";
import issueVisible from "@/assets/issue-3d-visible.jpg";
import impactVisibility from "@/assets/impact-3d-visibility.jpg";
import impactRecon from "@/assets/impact-3d-recon.jpg";

const ease = [0.22, 1, 0.36, 1] as const;

type Module = {
  n: number;
  title: string;
  points: string[];
  img: string;
  color: string;
  tint: string;
};

const BLUE = { color: "#1f6fd8", tint: "#e8f1fd" };
const AMBER = { color: "#e39a12", tint: "#fdf3df" };
const PINK = { color: "#d93a78", tint: "#fde8f0" };
const GREEN = { color: "#1c9a55", tint: "#e5f6ec" };
const ORANGE = { color: "#ea6c17", tint: "#fdeee2" };
const TEAL = { color: "#0f9aa6", tint: "#e2f5f6" };
const PURPLE = { color: "#7348d6", tint: "#efe9fd" };

const MODULES: Record<number, Module> = {
  1: { n: 1, title: "Sign-in & Session Management", points: ["User sign-in", "Session control", "Access control"], img: secLock, ...BLUE },
  2: { n: 2, title: "User & Roles Management", points: ["User master", "Roles & permissions", "Department / agency users"], img: secUsers, ...AMBER },
  3: {
    n: 3,
    title: "Master Data Management",
    points: ["Department, agency, ULB", "Territory (State · Division · District)", "Project types, CESS rates"],
    img: archData,
    ...PINK,
  },
  4: { n: 4, title: "Project Management", points: ["Project registration", "Approvals / permits", "Project details & location"], img: i3dBlueprints, ...GREEN },
  5: { n: 5, title: "Document Management (DMS)", points: ["Document upload & storage", "Version control", "Document scan & search"], img: i3dDocument, ...ORANGE },
  6: { n: 6, title: "Territory Map Management", points: ["Territory hierarchy", "Map boundaries (District, Taluk)", "Map-based view"], img: i3dMapPin, ...TEAL },
  7: { n: 7, title: "CESS Assessment", points: ["Assessment steps", "Assignment to officers", "Estimate & assessment details"], img: capLogs, ...PURPLE },
  8: { n: 8, title: "Field Assessment (GPS / Mobile)", points: ["Mobile app for field officers", "Location-tagged photos (offline)", "Site checks & reports"], img: i3dEvidence, ...BLUE },
  9: { n: 9, title: "Appeals & Revision", points: ["Appeal submission", "Review steps", "Decision & order"], img: i3dScales, ...PINK },
  10: { n: 10, title: "CESS Demand Management", points: ["Demand calculation", "Demand notice", "Demand tracking"], img: i3dRupee, ...GREEN },
  11: { n: 11, title: "CESS Collection Management", points: ["Collection tracking", "Payment linking", "Receipt generation"], img: i3dWallet, ...AMBER },
  12: { n: 12, title: "Remittance & Reconciliation", points: ["Agency remittance", "Bank matching", "Remittance status"], img: procRemit, ...PINK },
  13: { n: 13, title: "MIS & Analytical Reports", points: ["Operational MIS", "Financial reports", "Custom reports"], img: capHealth, ...PURPLE },
  14: { n: 14, title: "Exception Tracking & Monitoring", points: ["Rule-based exception checks", "Alerts & notices", "Steps to resolve"], img: issueScatter, ...GREEN },
  15: { n: 15, title: "Data Store & Forecast Analysis", points: ["Central data store", "Smart trend analysis", "Trend & forecast reports"], img: sysPsu, ...BLUE },
  16: { n: 16, title: "Meetings & Coordination", points: ["Meeting scheduling", "Agenda & minutes", "Follow-up tracking"], img: i3dCalendar, ...ORANGE },
  17: {
    n: 17,
    title: "Smart Middleware & Link Self-Service Portal",
    points: ["Register & set up links", "One common format", "Test, check & switch on", "Logs & exchange record"],
    img: capConnectors,
    ...PURPLE,
  },
};

const TOP_ROW = [1, 2, 3];
const LEFT_COL = [4, 5, 6];
const RIGHT_COL = [7, 8, 9, 10];
const BOTTOM_ROW = [11, 12, 13, 14, 15, 16];
const HUB_LINKED = [...TOP_ROW, ...LEFT_COL, ...RIGHT_COL];

const SOURCES: { id: string; label: string; sub?: string; img: string; tint: string }[] = [
  { id: "gov", label: "Government Departments", sub: "BDA, BBMP, etc.", img: i3dGov, tint: "#e7f0fc" },
  { id: "ulb", label: "ULBs & Planning Authorities", img: i3dUlb, tint: "#fdf0de" },
  { id: "boards", label: "Boards & Corporations", img: i3dBuilding, tint: "#f1e9fd" },
  { id: "agency", label: "CESS Collection Agencies", img: procDeduct, tint: "#fde6ea" },
  { id: "bld", label: "Builders & Contractors", img: i3dHardhatClean, tint: "#fdeee2" },
  { id: "apps", label: "Other Government Applications", img: sysUtil, tint: "#e4f5ec" },
  { id: "file", label: "File Upload", sub: "Offline data", img: i3dFolder, tint: "#eef2f7" },
];

const FLOWS = ["Project / Approval Data", "Master Data", "Collection & Remittance Data", "Payment & Transaction Data", "Document Data"];

type Item = { label: string; img: string; tint: string };

const USERS: Item[] = [
  { label: "Department Officials", img: i3dOfficer, tint: "#e7f0fc" },
  { label: "Field Officers / Labour Inspectors", img: i3dHardhat, tint: "#e4f5ec" },
  { label: "Agency Users (BDA / BBMP / ULBs)", img: i3dUsers, tint: "#e4f5ec" },
  { label: "Builders / Contractors", img: i3dBuilding, tint: "#fdeee2" },
  { label: "System Administrators", img: archInfra, tint: "#eef2f7" },
  { label: "Public / Other Stakeholders", img: archChannels, tint: "#e2f5f6" },
];

const SERVICES: Item[] = [
  { label: "Notification Service", img: i3dEnvelope, tint: "#fdeee2" },
  { label: "Full Activity Record", img: i3dFile, tint: "#e7f0fc" },
  { label: "Application Settings", img: archMicro, tint: "#f1e9fd" },
  { label: "Work Steps Engine", img: i3dPipes, tint: "#e7f0fc" },
  { label: "Reports & Dashboards", img: issueShare, tint: "#e4f5ec" },
  { label: "Security & Compliance", img: capValidation, tint: "#e4f5ec" },
];

const OUTCOMES: (Item & { sub: string })[] = [
  { label: "Project 360 View", sub: "Records, documents, map", img: issueVisible, tint: "#e4f5ec" },
  { label: "Live CESS Status", sub: "Demand, collection, remittance", img: procAssess, tint: "#fdf0de" },
  { label: "Map & Area Analysis", sub: "Territory, projects, exceptions", img: i3dMapPinClean, tint: "#e2f5f6" },
  { label: "Analysis & Forecast", sub: "Trends, risk, revenue forecast", img: impactVisibility, tint: "#f1e9fd" },
  { label: "Exception Alerts & Action", sub: "Resolution and compliance", img: impactRecon, tint: "#fde6ea" },
  { label: "Department Dashboards", sub: "Decision support", img: sysUlb, tint: "#e7f0fc" },
];

/** 3D icon tile — white-backed renders sit on a soft tint via multiply, like the Current Issues stamps. */
function Icon3d({ img, tint, className, round, delay, reduce }: { img: string; tint: string; className?: string; round?: boolean; delay: number; reduce: boolean }) {
  return (
    <span
      className={`relative grid aspect-square shrink-0 place-items-center overflow-hidden shadow-[0_3px_8px_rgba(40,70,110,0.14)] ring-1 ring-white ${round ? "rounded-full" : "rounded-[10px]"} ${className ?? ""}`}
      style={{ background: `linear-gradient(135deg, #ffffff 0%, ${tint} 100%)` }}
    >
      <motion.img
        src={img}
        alt=""
        aria-hidden
        draggable={false}
        className="absolute inset-[6%] h-[88%] w-[88%] object-contain mix-blend-multiply select-none"
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: reduce ? 0 : delay, ease }}
      />
    </span>
  );
}

const STAGE_TYPE = {
  containerType: "size",
  "--pm-head": stageFont(15, 9),
  "--pm-title": stageFont(14, 8.5),
  "--pm-body": stageFont(12, 7.5),
  "--pm-label": stageFont(12.5, 8),
  "--pm-tiny": stageFont(10.5, 7),
  "--pm-hub": stageFont(18, 10),
} as CSSProperties;

type Box = { x: number; y: number; w: number; h: number };

/** Offset box relative to `root`; ignores entrance transforms so lines stay put. */
function offsetBox(el: HTMLElement, root: HTMLElement): Box {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

type Pt = { x: number; y: number };

type Link = {
  id: string;
  d: string;
  color: string;
  stroke?: string;
  heads: string[];
  width: number;
  dashed?: boolean;
  flow?: boolean;
  delay: number;
};

const HEAD_LEN = 10;
const HEAD_HALF = 5;

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

const trim = (tip: Pt, dir: Pt): Pt => ({ x: tip.x - dir.x * (HEAD_LEN - 2), y: tip.y - dir.y * (HEAD_LEN - 2) });

/** Straight polyline with rounded corners; arrowhead at the end, optionally at the start too. */
function poly(pts: Pt[], both = false) {
  const n = pts.length;
  const endDir = unit(pts[n - 2], pts[n - 1]);
  const startDir = unit(pts[1], pts[0]);
  const path = [...pts];
  path[n - 1] = trim(pts[n - 1], endDir);
  if (both) path[0] = trim(pts[0], startDir);
  let d = `M ${path[0].x} ${path[0].y}`;
  for (let i = 1; i < n - 1; i++) {
    const a = path[i - 1];
    const c = path[i];
    const b = path[i + 1];
    const r = Math.min(8, Math.hypot(c.x - a.x, c.y - a.y) / 2, Math.hypot(b.x - c.x, b.y - c.y) / 2);
    const u1 = unit(c, a);
    const u2 = unit(c, b);
    d += ` L ${c.x + u1.x * r} ${c.y + u1.y * r} Q ${c.x} ${c.y} ${c.x + u2.x * r} ${c.y + u2.y * r}`;
  }
  d += ` L ${path[n - 1].x} ${path[n - 1].y}`;
  const heads = [headPoints(pts[n - 1], endDir)];
  if (both) heads.push(headPoints(pts[0], startDir));
  return { d, heads };
}

/** Curved two-way arrow from the hub rim into a module edge. */
function hubCurve(hub: Box, tip: Pt, arrive: Pt) {
  const c: Pt = { x: hub.x + hub.w / 2, y: hub.y + hub.h / 2 };
  const radial = unit(c, tip);
  const start: Pt = { x: c.x + radial.x * (hub.w / 2 + 3), y: c.y + radial.y * (hub.w / 2 + 3) };
  const k = Math.hypot(tip.x - start.x, tip.y - start.y) * 0.45;
  const c1: Pt = { x: start.x + radial.x * k, y: start.y + radial.y * k };
  const c2: Pt = { x: tip.x - arrive.x * k, y: tip.y - arrive.y * k };
  const endDir = unit(c2, tip);
  const startDir = unit(c1, start);
  const both = k / 0.45 > HEAD_LEN * 3;
  const p0 = both ? trim(start, startDir) : start;
  const p1 = trim(tip, endDir);
  return {
    d: `M ${p0.x} ${p0.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${p1.x} ${p1.y}`,
    heads: both ? [headPoints(tip, endDir), headPoints(start, startDir)] : [headPoints(tip, endDir)],
  };
}

function useLinks(rootRef: RefObject<HTMLDivElement | null>) {
  const nodes = useRef(new Map<string, HTMLElement>());
  const [links, setLinks] = useState<Link[]>([]);
  const [bus, setBus] = useState<{ x1: number; x2: number; stops: { at: number; color: string }[] } | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const reg = useCallback(
    (key: string) => (el: HTMLElement | null) => {
      if (el) nodes.current.set(key, el);
      else nodes.current.delete(key);
    },
    [],
  );

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const compute = () => {
      const b = (k: string) => {
        const el = nodes.current.get(k);
        return el ? offsetBox(el, root) : null;
      };
      const hub = b("hub");
      const next: Link[] = [];
      let nextBus: typeof bus = null;

      if (hub) {
        const cx = hub.x + hub.w / 2;
        HUB_LINKED.forEach((n, i) => {
          const m = b(`m${n}`);
          if (!m) return;
          let tip: Pt;
          let arrive: Pt;
          if (TOP_ROW.includes(n)) {
            const idx = TOP_ROW.indexOf(n);
            const x = idx === 0 ? m.x + m.w - 18 : idx === 1 ? m.x + m.w / 2 : m.x + 18;
            const t: Pt = { x, y: m.y + m.h + 1 };
            const c: Pt = { x: hub.x + hub.w / 2, y: hub.y + hub.h / 2 };
            const dir = unit(c, t);
            const s: Pt = { x: c.x + dir.x * (hub.w / 2 + 3), y: c.y + dir.y * (hub.w / 2 + 3) };
            const both = Math.hypot(t.x - s.x, t.y - s.y) > HEAD_LEN * 3;
            next.push({ id: `hub-${n}`, ...poly([s, t], both), color: MODULES[n].color, width: 2.8, flow: both, delay: 0.55 + i * 0.06 });
            return;
          } else if (LEFT_COL.includes(n)) {
            tip = { x: m.x + m.w + 1, y: m.y + m.h / 2 };
            arrive = { x: -1, y: 0 };
          } else {
            tip = { x: m.x - 1, y: m.y + m.h / 2 };
            arrive = { x: 1, y: 0 };
          }
          next.push({ id: `hub-${n}`, ...hubCurve(hub, tip, arrive), color: MODULES[n].color, width: 2.8, flow: true, delay: 0.55 + i * 0.06 });
        });

        const row = BOTTOM_ROW.map((n) => b(`m${n}`)).filter((x): x is Box => !!x);
        const users = b("users");
        if (row.length === BOTTOM_ROW.length && users) {
          const busY = users.y + users.h + 5;
          const xs = row.map((r) => r.x + r.w / 2);
          const x1 = Math.min(...xs);
          const x2 = Math.max(...xs);
          nextBus = {
            x1,
            x2,
            stops: xs.map((x, i) => ({ at: (x - x1) / (x2 - x1 || 1), color: MODULES[BOTTOM_ROW[i]].color })),
          };
          next.push({
            id: "trunk",
            d: `M ${cx} ${hub.y + hub.h + 3} L ${cx} ${busY}`,
            heads: [],
            color: "#5b6f92",
            stroke: "url(#pm-bus)",
            width: 2.6,
            delay: 0.95,
          });
          row.forEach((r, i) => {
            const x = xs[i];
            const pts: Pt[] = Math.abs(x - cx) < 2 ? [{ x, y: busY }, { x, y: r.y - 1 }] : [{ x: cx, y: busY }, { x, y: busY }, { x, y: r.y - 1 }];
            next.push({ id: `drop-${i}`, ...poly(pts), color: MODULES[BOTTOM_ROW[i]].color, stroke: "url(#pm-bus)", width: 2.6, delay: 1.0 + i * 0.05 });
          });
        }
      }

      const src = b("sources");
      if (src) {
        TOP_ROW.forEach((n, i) => {
          const m = b(`m${n}`);
          if (m) {
            const x = m.x + m.w / 2;
            next.push({ id: `src-${n}`, ...poly([{ x, y: src.y + src.h + 1 }, { x, y: m.y - 1 }]), color: "#1f7ae0", width: 2.4, delay: 0.4 + i * 0.05 });
          }
        });
      }

      const users = b("users");
      [1, 4].forEach((n) => {
        const m = b(`m${n}`);
        if (users && m) {
          const y = m.y + m.h / 2;
          next.push({ id: `user-${n}`, ...poly([{ x: users.x + users.w + 1, y }, { x: m.x - 1, y }]), color: "#1f6fd8", width: 2.4, delay: 0.5 });
        }
      });

      const services = b("services");
      if (services) {
        RIGHT_COL.forEach((n, i) => {
          const m = b(`m${n}`);
          if (m) {
            const y = m.y + m.h / 2;
            next.push({ id: `svc-${n}`, ...poly([{ x: services.x - 1, y }, { x: m.x + m.w + 1, y }]), color: "#16a34a", width: 2, dashed: true, delay: 0.8 + i * 0.05 });
          }
        });
      }

      const m17 = b("m17");
      const m3 = b("m3");
      if (m17 && src) {
        const y = m17.y + Math.min(m17.h / 2, src.h / 2);
        next.push({ id: "m17-src", ...poly([{ x: src.x + src.w + 1, y }, { x: m17.x - 1, y }], true), color: PURPLE.color, width: 2.4, delay: 1.25 });
      }
      if (m17 && m3 && services) {
        const gx = (m3.x + m3.w + services.x) / 2;
        const sy = m17.y + m17.h - 8;
        const my = m3.y + m3.h / 2;
        next.push({
          id: "m17-m3",
          ...poly(
            [
              { x: m17.x - 1, y: sy },
              { x: gx, y: sy },
              { x: gx, y: my },
              { x: m3.x + m3.w + 1, y: my },
            ],
            true,
          ),
          color: PURPLE.color,
          width: 2,
          dashed: true,
          delay: 1.3,
        });
      }

      const out = b("outcomes");
      if (out) {
        BOTTOM_ROW.forEach((n, i) => {
          const m = b(`m${n}`);
          if (m) {
            const x = m.x + m.w / 2;
            next.push({ id: `out-${n}`, ...poly([{ x, y: m.y + m.h + 1 }, { x, y: out.y - 1 }]), color: MODULES[n].color, width: 2.4, delay: 1.35 + i * 0.04 });
          }
        });
      }

      setSize({ w: root.clientWidth, h: root.clientHeight });
      setBus(nextBus);
      setLinks(next);
    };
    compute();
    let alive = true;
    document.fonts?.ready.then(() => alive && compute());
    const timers = [120, 600, 1500, 2500].map((ms) => window.setTimeout(compute, ms));
    const ro = new ResizeObserver(compute);
    ro.observe(root);
    nodes.current.forEach((el) => ro.observe(el));
    window.addEventListener("resize", compute);
    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [rootRef]);

  return { reg, links, bus, size };
}

function Links({
  links,
  bus,
  size,
  reduce,
}: {
  links: Link[];
  bus: { x1: number; x2: number; stops: { at: number; color: string }[] } | null;
  size: { w: number; h: number };
  reduce: boolean;
}) {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[5] overflow-visible"
      width={size.w}
      height={size.h}
      viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
    >
      {bus ? (
        <defs>
          <linearGradient id="pm-bus" gradientUnits="userSpaceOnUse" x1={bus.x1} y1={0} x2={bus.x2} y2={0}>
            {bus.stops.map((s) => (
              <stop key={s.at} offset={`${s.at * 100}%`} stopColor={s.color} />
            ))}
          </linearGradient>
        </defs>
      ) : null}
      {links.map((l) => (
        <path
          key={`halo-${l.id}`}
          d={l.d}
          fill="none"
          stroke="rgba(255,255,255,0.75)"
          strokeWidth={l.width + 3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
      {links.map((l) => (
        <g key={l.id}>
          {l.dashed ? (
            <motion.path
              d={l.d}
              fill="none"
              stroke={l.stroke ?? l.color}
              strokeWidth={l.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5 4"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: reduce ? 0 : l.delay }}
            />
          ) : (
            <motion.path
              d={l.d}
              fill="none"
              stroke={l.stroke ?? l.color}
              strokeWidth={l.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : l.delay, ease }}
            />
          )}
          {l.heads.map((h, i) => (
            <motion.polygon
              key={i}
              points={h}
              fill={l.color}
              stroke="rgba(255,255,255,0.75)"
              strokeWidth={1}
              strokeLinejoin="round"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25, delay: reduce ? 0 : l.delay + 0.5 }}
            />
          ))}
          {l.flow && !reduce ? (
            <circle r={2.6} fill="#fff" stroke={l.color} strokeWidth={1.6} opacity={0}>
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="2.6s" begin={`${l.delay + 0.7}s`} repeatCount="indefinite" />
              <animateMotion dur="2.6s" begin={`${l.delay + 0.7}s`} repeatCount="indefinite" path={l.d} keyPoints="1;0" keyTimes="0;1" calcMode="linear" />
            </circle>
          ) : null}
        </g>
      ))}
    </svg>
  );
}

function ModuleCard({
  n,
  reg,
  delay,
  reduce,
  dense,
  wrapTitle,
}: {
  n: number;
  reg: (k: string) => (el: HTMLElement | null) => void;
  delay: number;
  reduce: boolean;
  dense?: boolean;
  wrapTitle?: boolean;
}) {
  const m = MODULES[n];
  return (
    <motion.div
      ref={reg(`m${n}`)}
      className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden rounded-[12px] px-1.5 pt-1 pb-0.5 shadow-[0_4px_14px_rgba(30,70,120,0.1)]"
      style={{ background: `linear-gradient(135deg, ${m.tint} 0%, #ffffff 78%)`, border: `1px solid ${m.color}40` }}
      initial={reduce ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: reduce ? 0 : delay, ease }}
    >
      <div className="flex shrink-0 items-center gap-1.5">
        <span
          className="grid aspect-square w-[1.7em] shrink-0 place-items-center rounded-full text-[length:var(--pm-title)] font-black text-white shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
          style={{ background: m.color }}
        >
          {m.n}
        </span>
        <span
          className={`font-display min-w-0 text-[length:var(--pm-title)] leading-tight font-extrabold text-[#102b57] ${wrapTitle ? "line-clamp-2" : "truncate"}`}
        >
          {m.title}
        </span>
      </div>
      <div className="mt-0.5 flex min-h-0 flex-1 items-start gap-1.5 overflow-hidden">
        <Icon3d img={m.img} tint={m.tint} className="mt-px w-[2.9em] text-[length:var(--pm-title)]" delay={delay + 0.1} reduce={reduce} />
        <ul className="min-w-0 flex-1 text-[length:var(--pm-body)] leading-[1.25] font-semibold text-[#46597a]">
          {m.points.slice(0, dense ? 2 : undefined).map((p) => (
            <li key={p} className="flex items-baseline gap-1 truncate">
              <span aria-hidden className="inline-block size-[0.42em] shrink-0 -translate-y-[0.1em] rounded-full" style={{ background: m.color }} />
              <span className="truncate">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function SidePanel({
  title,
  items,
  regKey,
  reg,
  reduce,
  from,
  accent,
}: {
  title: string;
  items: Item[];
  regKey: string;
  reg: (k: string) => (el: HTMLElement | null) => void;
  reduce: boolean;
  from: number;
  accent: string;
}) {
  return (
    <motion.aside
      ref={reg(regKey)}
      className="relative z-10 flex h-full min-h-0 flex-col overflow-hidden rounded-[14px] border border-[rgba(80,150,220,.25)] bg-white/90 shadow-[0_8px_22px_rgba(29,82,130,.1)]"
      initial={reduce ? false : { opacity: 0, x: from }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, delay: reduce ? 0 : 0.15, ease }}
    >
      <div className="font-display shrink-0 px-2 pt-1.5 pb-1 text-[length:var(--pm-head)] font-black text-[#102b57]" style={{ borderBottom: `2px solid ${accent}` }}>
        {title}
      </div>
      <div className="grid min-h-0 flex-1 px-1.5 py-1" style={{ gridTemplateRows: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((it, i) => (
          <motion.div
            key={it.label}
            className="flex min-h-0 items-center gap-1.5"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: reduce ? 0 : 0.25 + i * 0.05, ease }}
          >
            <Icon3d img={it.img} tint={it.tint} round className="w-[2.9em] text-[length:var(--pm-label)]" delay={0.3 + i * 0.05} reduce={reduce} />
            <span className="min-w-0 text-[length:var(--pm-label)] leading-[1.15] font-bold text-[#1d3557]">{it.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.aside>
  );
}

/** Complete Platform — 17 modules connected around the Central Platform. */
export function PlatformModulesStage() {
  const reduce = !!useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const { reg, links, bus, size } = useLinks(rootRef);

  return (
    <div
      ref={rootRef}
      className="relative grid h-full min-h-0 grid-cols-[11.5%_minmax(0,1fr)_14%] grid-rows-[auto_minmax(0,1fr)_auto_auto] gap-x-[14px] gap-y-[10px] overflow-hidden rounded-2xl p-1"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      style={{
        ...STAGE_TYPE,
        background: `radial-gradient(ellipse 30% 40% at 50% 48%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%), linear-gradient(180deg, rgba(238,246,253,0.72) 0%, rgba(238,246,253,0.42) 45%, rgba(232,242,251,0.62) 100%), url(${stageBg}) center 55% / cover no-repeat, #eef6fd`,
      }}
    >
      <Links links={links} bus={bus} size={size} reduce={reduce} />

      {/* External systems */}
      <motion.section
        ref={reg("sources")}
        className="relative z-10 col-span-2 flex min-h-0 flex-col rounded-[14px] border border-[rgba(80,150,220,.25)] bg-white/90 px-2 pt-1 pb-1 shadow-[0_8px_22px_rgba(29,82,130,.1)]"
        initial={reduce ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease }}
      >
        <div className="font-display text-[length:var(--pm-head)] font-black text-[#102b57]">External Systems &amp; Data Sources</div>
        <div className="mt-1 grid grid-cols-7 gap-1.5">
          {SOURCES.map((s, i) => (
            <motion.div
              key={s.id}
              className="flex min-w-0 items-center gap-1.5"
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: reduce ? 0 : 0.08 + i * 0.05, ease }}
            >
              <Icon3d img={s.img} tint={s.tint} round className="w-[3em] text-[length:var(--pm-label)]" delay={0.12 + i * 0.05} reduce={reduce} />
              <span className="min-w-0 leading-[1.1]">
                <span className="block text-[length:var(--pm-label)] font-bold text-[#1d3557]">{s.label}</span>
                {s.sub ? <span className="block text-[length:var(--pm-tiny)] font-semibold text-[#61778c]">{s.sub}</span> : null}
              </span>
            </motion.div>
          ))}
        </div>
        <div className="mt-1 flex items-center gap-1 border-t border-[#d7e5f2] pt-0.5 text-[length:var(--pm-tiny)] font-bold text-[#4f6a95]">
          {FLOWS.map((f) => (
            <span key={f} className="min-w-0 flex-1 truncate text-center">
              {f}
            </span>
          ))}
          <span className="shrink-0 rounded-full bg-[#eef3fb] px-1.5 text-[#3c4a63]">Direct link · File · Portal · Officer entry</span>
        </div>
      </motion.section>

      {/* Module 17 */}
      <div className="relative z-10 min-h-0">
        <ModuleCard n={17} reg={reg} delay={1.2} reduce={reduce} wrapTitle />
      </div>

      {/* Users */}
      <SidePanel title="Users" items={USERS} regKey="users" reg={reg} reduce={reduce} from={-14} accent="#1f6fd8" />

      {/* Constellation */}
      <div className="relative grid min-h-0 grid-cols-[1fr_1.1fr_1fr] grid-rows-[minmax(0,0.9fr)_minmax(0,3fr)] gap-x-[22px] gap-y-[10px]">
        {TOP_ROW.map((n, i) => (
          <ModuleCard key={n} n={n} reg={reg} delay={0.45 + i * 0.06} reduce={reduce} dense />
        ))}
        <div className="grid min-h-0 grid-rows-3 gap-[8px]">
          {LEFT_COL.map((n, i) => (
            <ModuleCard key={n} n={n} reg={reg} delay={0.65 + i * 0.06} reduce={reduce} />
          ))}
        </div>

        {/* Central hub */}
        <div className="relative grid min-h-0 place-items-center [container-type:size]">
          <motion.div
            ref={reg("hub")}
            className="relative z-10 aspect-square overflow-hidden rounded-full shadow-[0_14px_36px_rgba(10,50,110,0.35)] ring-[3px] ring-white"
            style={{ width: "min(94cqw, 94cqh)" }}
            initial={reduce ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: reduce ? 0 : 0.3, ease }}
          >
            <img src={hubSite} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full object-cover select-none" />
            <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,40,90,0)_40%,rgba(8,30,75,0.92)_72%)]" />
            <span className="absolute top-[8%] left-1/2 grid aspect-square w-[24%] -translate-x-1/2 place-items-center overflow-hidden rounded-full bg-white shadow-[0_4px_12px_rgba(0,0,0,0.25)] ring-2 ring-white/80">
              <img src={sysDept} alt="" aria-hidden draggable={false} className="h-[82%] w-[82%] object-contain mix-blend-multiply select-none" />
            </span>
            <div className="absolute inset-x-[16%] bottom-[13%] text-center text-white">
              <div className="font-display text-[length:var(--pm-hub)] leading-[1.05] font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">Central Platform</div>
              <div className="mt-0.5 text-[length:var(--pm-tiny)] leading-[1.15] font-semibold text-white/85">Labour CESS Tracking &amp; Monitoring System</div>
            </div>
          </motion.div>
          {!reduce ? (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute aspect-square rounded-full ring-2 ring-[#3b8ff0]"
              style={{ width: "min(94cqw, 94cqh)" }}
              animate={{ scale: [1, 1.12], opacity: [0.55, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 1 }}
            />
          ) : null}
        </div>

        <div className="grid min-h-0 grid-rows-4 gap-[6px]">
          {RIGHT_COL.map((n, i) => (
            <ModuleCard key={n} n={n} reg={reg} delay={0.65 + i * 0.06} reduce={reduce} dense />
          ))}
        </div>
      </div>

      {/* Common services */}
      <SidePanel title="Common Services" items={SERVICES} regKey="services" reg={reg} reduce={reduce} from={14} accent="#1c9a55" />

      {/* Bottom modules */}
      <div className="relative z-10 col-span-3 mt-[14px] grid h-[clamp(52px,14cqh,110px)] grid-cols-6 gap-[10px]">
        {BOTTOM_ROW.map((n, i) => (
          <ModuleCard key={n} n={n} reg={reg} delay={1.0 + i * 0.06} reduce={reduce} />
        ))}
      </div>

      {/* Outcomes */}
      <motion.section
        ref={reg("outcomes")}
        className="relative z-10 col-span-3 grid h-[clamp(40px,10cqh,82px)] grid-cols-[11.5%_repeat(6,minmax(0,1fr))] overflow-hidden rounded-[14px] border border-[#bcdcf2] bg-white/95 shadow-[0_8px_20px_rgba(40,80,120,.1)]"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: reduce ? 0 : 1.3, ease }}
      >
        <div
          className="font-display flex items-center bg-[linear-gradient(110deg,#062d63,#0a5cb0)] pr-4 pl-2.5 text-[length:var(--pm-head)] leading-tight font-black text-white"
          style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)" }}
        >
          Outputs &amp; Outcomes
        </div>
        {OUTCOMES.map((o, i) => (
          <motion.div
            key={o.label}
            className="flex min-w-0 items-center gap-1.5 border-r border-[#d9e7f2] px-2 last:border-r-0"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: reduce ? 0 : 1.4 + i * 0.06, ease }}
          >
            <Icon3d img={o.img} tint={o.tint} className="h-[66%] max-h-12 w-auto text-[length:var(--pm-label)]" delay={1.45 + i * 0.06} reduce={reduce} />
            <span className="min-w-0 leading-[1.15]">
              <span className="font-display block truncate text-[length:var(--pm-label)] font-extrabold text-[#102b57]">{o.label}</span>
              <span className="block truncate text-[length:var(--pm-tiny)] font-semibold text-[#61778c]">{o.sub}</span>
            </span>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
}
