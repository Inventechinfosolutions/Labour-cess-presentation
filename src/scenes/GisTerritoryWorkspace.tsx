import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { CessIcon } from "@/lib/icons";
import {
  Bank,
  Buildings,
  Camera,
  CaretDown,
  CaretRight,
  ChartBar,
  Check,
  ClipboardText,
  Crosshair,
  CurrencyInr,
  FileText,
  Files,
  Gear,
  GpsFix,
  House,
  MagnifyingGlass,
  MapPin,
  MapTrifold,
  Minus,
  Plus,
  Stack,
  TreeStructure,
  User,
  UsersThree,
  VideoCamera,
  WarningCircle,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { TileLayer, type TileSize, type TileView } from "@/components/TileLayer";
import {
  BASE_ZOOM,
  DISTRICTS,
  PHASES,
  PHASE_INDEX,
  PROJECTS,
  PROJECT_STATUS,
  STATUSES,
  STATUS_BY_ID,
  STATUS_INDEX,
  TALUKS,
  TALUK_ORDER,
  TALUK_PATH,
  TREE,
  PARENT,
  boundsOf,
  focusFor,
  pathTo,
  project,
  type DistrictId,
  type Focus,
  type Project,
  type StatusId,
  type TalukId,
  type TreeNode,
} from "@/scenes/gisTerritoryData";
import abcSite from "@/assets/abc-site.png";
import assessSiteHero from "@/assets/assess-site-hero.jpg";
import buildStage1 from "@/assets/build-stage-1.png";
import hubCenterAbc from "@/assets/hub-center-abc.jpg";

/**
 * Territory workspace — territory tree, a real street / satellite map with
 * colour-coded taluks, every project with its GPS visits, field evidence and
 * CESS status, and the selected project's lifecycle.
 */

type ColorBy = "territory" | "status";
type Layer = "territories" | "projects" | "gps" | "evidence";
type Basemap = "map" | "satellite";

const NAV: { label: string; Icon: CessIcon; active?: boolean }[] = [
  { label: "Dashboard", Icon: House },
  { label: "GIS Map", Icon: MapTrifold, active: true },
  { label: "Projects", Icon: Buildings },
  { label: "Assessments", Icon: ClipboardText },
  { label: "Demand Notices", Icon: Files },
  { label: "Collections", Icon: CurrencyInr },
  { label: "Reports", Icon: ChartBar },
  { label: "Territory Master", Icon: TreeStructure },
  { label: "Users & Roles", Icon: UsersThree },
  { label: "Settings", Icon: Gear },
];

const LAYERS: { id: Layer; label: string; Icon: CessIcon; color: string }[] = [
  { id: "territories", label: "Territories", Icon: Stack, color: "#16a34a" },
  { id: "projects", label: "Projects", Icon: Buildings, color: "#0b1f4a" },
  { id: "gps", label: "GPS Visits", Icon: GpsFix, color: "#1476e8" },
  { id: "evidence", label: "Evidence", Icon: Camera, color: "#f97316" },
];

const TOUR: { node: string; color: ColorBy; filter: StatusId | "all"; project: string }[] = [
  { node: "blr-urban", color: "territory", filter: "all", project: "abc" },
  { node: "blr-east", color: "territory", filter: "all", project: "abc" },
  { node: "blr-east", color: "status", filter: "all", project: "abc" },
  { node: "blr-east", color: "status", filter: "notice-issued", project: "abc" },
  { node: "blr-south", color: "status", filter: "remit-overdue", project: "vija" },
  { node: "anekal", color: "status", filter: "all", project: "banner" },
  { node: "blr-div", color: "status", filter: "all", project: "abc" },
];

const DEFAULT_OPEN = ["ka", "blr-div", "blr-urban", "blr-rural"];
const THUMBS = [buildStage1, abcSite, hubCenterAbc, assessSiteHero];
const PROJECT_BY_ID = Object.fromEntries(PROJECTS.map((p) => [p.id, p])) as Record<string, Project>;
const PROJECT_XY = Object.fromEntries(PROJECTS.map((p) => [p.id, project(p.at)])) as Record<string, [number, number]>;

function inFocus(p: Project, focus: Focus) {
  return focus.taluks.includes(p.taluk) && (!focus.hobli || p.hobli === focus.hobli);
}

function withAncestors(prev: Set<string>, id: string) {
  const next = new Set(prev);
  let cur = PARENT[id];
  while (cur) {
    next.add(cur);
    cur = PARENT[cur];
  }
  return next;
}

export function TerritoryWorkspace({ reduce }: { reduce: boolean }) {
  const [node, setNode] = useState("blr-urban");
  const [open, setOpen] = useState<Set<string>>(() => new Set(DEFAULT_OPEN));
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("abc");
  const [filter, setFilter] = useState<StatusId | "all">("all");
  const [colorBy, setColorBy] = useState<ColorBy>("territory");
  const [layers, setLayers] = useState<Record<Layer, boolean>>({ territories: true, projects: true, gps: true, evidence: true });
  const [basemap, setBasemap] = useState<Basemap>("map");
  const [zoom, setZoom] = useState(1);
  const [touched, setTouched] = useState(false);
  const focus = useMemo(() => focusFor(node), [node]);

  useEffect(() => {
    if (reduce || touched) return;
    let i = 0;
    const timer = window.setInterval(() => {
      i = (i + 1) % TOUR.length;
      const step = TOUR[i];
      setNode(step.node);
      setColorBy(step.color);
      setFilter(step.filter);
      setSelected(step.project);
      setZoom(1);
      setOpen((prev) => withAncestors(prev, step.node));
    }, 3200);
    return () => window.clearInterval(timer);
  }, [reduce, touched]);

  const pickNode = (id: string) => {
    setTouched(true);
    setNode(id);
    setZoom(1);
    setOpen((prev) => withAncestors(prev, id));
    const next = focusFor(id);
    if (!inFocus(PROJECT_BY_ID[selected], next)) {
      const first = PROJECTS.find((p) => inFocus(p, next));
      if (first) setSelected(first.id);
    }
  };

  const pickStatus = (id: StatusId | "all") => {
    setTouched(true);
    setFilter(id);
    if (id === "all") return;
    setColorBy("status");
    if (PROJECT_STATUS[selected] === id && inFocus(PROJECT_BY_ID[selected], focus)) return;
    const match = PROJECTS.find((p) => PROJECT_STATUS[p.id] === id && inFocus(p, focus)) ?? PROJECTS.find((p) => PROJECT_STATUS[p.id] === id);
    if (!match) return;
    setSelected(match.id);
    if (!inFocus(match, focus)) {
      setNode(match.taluk);
      setZoom(1);
      setOpen((prev) => withAncestors(prev, match.taluk));
    }
  };

  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-2xl bg-white shadow-[0_12px_32px_rgba(7,20,51,0.12)] ring-1 ring-navy/10">
      <NavRail reduce={reduce} />
      <TreePanel
        reduce={reduce}
        selected={node}
        open={open}
        query={query}
        onQuery={(q) => {
          setTouched(true);
          setQuery(q);
        }}
        onPick={pickNode}
        onToggle={(id) => {
          setTouched(true);
          setOpen((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          });
        }}
      />
      <TerritoryMap
        reduce={reduce}
        node={node}
        focus={focus}
        filter={filter}
        colorBy={colorBy}
        layers={layers}
        basemap={basemap}
        zoom={zoom}
        selected={selected}
        onProject={(id) => {
          setTouched(true);
          setSelected(id);
        }}
        onTaluk={pickNode}
        onZoom={(z) => {
          setTouched(true);
          setZoom(z);
        }}
        onBasemap={(b) => {
          setTouched(true);
          setBasemap(b);
        }}
      />
      <ControlPanel
        reduce={reduce}
        focus={focus}
        filter={filter}
        colorBy={colorBy}
        layers={layers}
        onFilter={pickStatus}
        onColorBy={(c) => {
          setTouched(true);
          setColorBy(c);
        }}
        onLayer={(id) => {
          setTouched(true);
          setLayers((prev) => ({ ...prev, [id]: !prev[id] }));
        }}
      />
    </div>
  );
}

function NavRail({ reduce }: { reduce: boolean }) {
  return (
    <nav className="flex w-[66px] shrink-0 flex-col gap-0.5 overflow-y-auto bg-[linear-gradient(180deg,#0b1f4a_0%,#0a2a5e_100%)] py-2">
      {NAV.map((item, i) => (
        <motion.span
          key={item.label}
          className={cn(
            "mx-1 flex flex-col items-center gap-0.5 rounded-lg px-0.5 py-1.5 text-center text-[8.5px] leading-tight font-semibold",
            item.active ? "bg-[#1476e8] text-white shadow-[0_6px_14px_rgba(20,118,232,0.4)]" : "text-white/80",
          )}
          initial={reduce ? false : { opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: reduce ? 0 : i * 0.04 }}
        >
          <item.Icon weight="fill" className="size-4" />
          {item.label}
        </motion.span>
      ))}
    </nav>
  );
}

function matches(node: TreeNode, q: string): boolean {
  if (node.label.toLowerCase().includes(q)) return true;
  return Boolean(node.children?.some((child) => matches(child, q)));
}

function TreePanel({
  reduce,
  selected,
  open,
  query,
  onQuery,
  onPick,
  onToggle,
}: {
  reduce: boolean;
  selected: string;
  open: Set<string>;
  query: string;
  onQuery: (q: string) => void;
  onPick: (id: string) => void;
  onToggle: (id: string) => void;
}) {
  const q = query.trim().toLowerCase();
  const rows: { node: TreeNode; depth: number }[] = [];
  (function walk(node: TreeNode, depth: number) {
    if (q && !matches(node, q)) return;
    rows.push({ node, depth });
    if (node.children && (q || open.has(node.id))) node.children.forEach((child) => walk(child, depth + 1));
  })(TREE, 0);

  return (
    <aside className="flex w-[212px] shrink-0 flex-col border-r border-navy/8 bg-[#f7fafd]">
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5">
        <b className="font-display text-[13px] text-navy">Territory Hierarchy</b>
        <CaretDown weight="bold" className="size-3 text-navy/60" />
      </div>
      <label className="mx-2.5 mb-1.5 flex items-center gap-2 rounded-lg bg-white px-2 py-1.5 ring-1 ring-navy/12 focus-within:ring-[#1476e8]/50">
        <MagnifyingGlass weight="bold" className="size-3.5 text-navy/50" />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
          placeholder="Search district, taluk..."
          className="min-w-0 flex-1 bg-transparent text-[10.5px] text-navy outline-none placeholder:text-navy/40"
        />
      </label>
      <ul className="min-h-0 flex-1 overflow-y-auto px-1 pb-2">
        {rows.map(({ node, depth }, i) => {
          const isOpen = Boolean(q) || open.has(node.id);
          const on = node.id === selected;
          const taluk = node.id in TALUKS ? TALUKS[node.id as TalukId] : undefined;
          const count = taluk ? PROJECTS.filter((p) => p.taluk === node.id).length : undefined;
          const Icon = node.kind === "state" ? MapTrifold : node.kind === "hobli" ? Bank : Buildings;
          return (
            <motion.li
              key={node.id}
              className="flex items-center"
              style={{ paddingLeft: depth * 11 }}
              initial={reduce ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: reduce ? 0 : Math.min(i * 0.02, 0.4) }}
            >
              {node.children ? (
                <button
                  type="button"
                  onClick={() => onToggle(node.id)}
                  className="grid size-4.5 shrink-0 place-items-center rounded text-navy/60 hover:bg-navy/5"
                  aria-label={isOpen ? `Collapse ${node.label}` : `Expand ${node.label}`}
                >
                  {isOpen ? <CaretDown weight="bold" className="size-2.5" /> : <CaretRight weight="bold" className="size-2.5" />}
                </button>
              ) : (
                <span className="size-4.5 shrink-0" />
              )}
              <button
                type="button"
                onClick={() => onPick(node.id)}
                className={cn(
                  "flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1.5 py-[2.5px] text-left text-[11px] transition-colors",
                  on ? "bg-[#e8f1fd] font-bold text-[#0f5fcf] ring-1 ring-[#1476e8]/25" : "text-navy hover:bg-navy/5",
                  node.kind === "district" && (node.id === "blr-urban" || node.id === "blr-rural") && !on && "font-semibold",
                )}
              >
                <Icon
                  weight="fill"
                  className={cn("size-3 shrink-0", node.kind === "state" ? "text-[#16a34a]" : on ? "text-[#1476e8]" : "text-navy/55")}
                />
                <span className="truncate">{node.label}</span>
                {taluk ? (
                  <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[9.5px] font-semibold text-navy/55">
                    {count}
                    <span className="size-2.5 rounded-full ring-2 ring-white" style={{ background: taluk.color }} />
                  </span>
                ) : null}
              </button>
            </motion.li>
          );
        })}
        {rows.length === 0 ? <li className="px-3 py-4 text-center text-[11px] text-navy/50">No matching area.</li> : null}
      </ul>
    </aside>
  );
}

type View = TileView;
type Size = TileSize;

const CARD_W = 236;
const PAD = { l: 16, t: 64, b: 40 };

function fitView(taluks: TalukId[], size: Size, zoom: number): View {
  const b = boundsOf(taluks);
  const [x0, y1] = project([b.minLat, b.minLng]);
  const [x1, y0] = project([b.maxLat, b.maxLng]);
  const padR = CARD_W + 24;
  const aw = Math.max(size.w - PAD.l - padR, 140);
  const ah = Math.max(size.h - PAD.t - PAD.b, 140);
  const s = Math.min(aw / (x1 - x0), ah / (y1 - y0)) * zoom;
  const sx = PAD.l + aw / 2;
  const sy = PAD.t + ah / 2;
  return { cx: (x0 + x1) / 2 - (sx - size.w / 2) / s, cy: (y0 + y1) / 2 - (sy - size.h / 2) / s, s };
}

const PIN_D = "M0 0C-3-6-9-9-9-15a9 9 0 0 1 18 0c0 6-6 9-9 15z";
const TRAIL: [number, number][] = [
  [-36, 26],
  [-18, 40],
  [2, 26],
];

function TerritoryMap({
  reduce,
  node,
  focus,
  filter,
  colorBy,
  layers,
  basemap,
  zoom,
  selected,
  onProject,
  onTaluk,
  onZoom,
  onBasemap,
}: {
  reduce: boolean;
  node: string;
  focus: Focus;
  filter: StatusId | "all";
  colorBy: ColorBy;
  layers: Record<Layer, boolean>;
  basemap: Basemap;
  zoom: number;
  selected: string;
  onProject: (id: string) => void;
  onTaluk: (id: string) => void;
  onZoom: (z: number) => void;
  onBasemap: (b: Basemap) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [view, setView] = useState<View | null>(null);
  const viewRef = useRef<View | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const focusKey = focus.taluks.join("|");
  const target = useMemo(
    () => (size && size.w > 0 && size.h > 0 ? fitView(focusKey.split("|") as TalukId[], size, zoom) : null),
    [size, focusKey, zoom],
  );

  useEffect(() => {
    if (!target) return;
    const from = viewRef.current;
    if (!from || reduce) {
      viewRef.current = target;
      setView(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 900);
      const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
      const next = {
        cx: from.cx + (target.cx - from.cx) * e,
        cy: from.cy + (target.cy - from.cy) * e,
        s: from.s * (target.s / from.s) ** e,
      };
      viewRef.current = next;
      setView(next);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, reduce]);

  const statusCount = PROJECTS.filter((p) => inFocus(p, focus) && (filter === "all" || PROJECT_STATUS[p.id] === filter)).length;

  return (
    <div ref={ref} className="relative min-w-0 flex-1 overflow-hidden bg-[#eef1f4]">
      {view && size ? (
        <MapCanvas
          reduce={reduce}
          view={view}
          size={size}
          focus={focus}
          filter={filter}
          colorBy={colorBy}
          layers={layers}
          basemap={basemap}
          selected={selected}
          onProject={onProject}
          onTaluk={onTaluk}
        />
      ) : null}

      <TerritoryInfo reduce={reduce} node={node} focus={focus} count={statusCount} filter={filter} />

      <div className="absolute top-2.5 right-2.5 z-10" style={{ width: CARD_W }}>
        <ProjectCard reduce={reduce} id={selected} />
      </div>

      <MapLegend colorBy={colorBy} />

      <div className="absolute right-2.5 bottom-5 z-10 flex items-end gap-1.5">
        <div className="flex overflow-hidden rounded-lg bg-white text-[9.5px] font-bold shadow-sm ring-1 ring-navy/10">
          {(["map", "satellite"] as const).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => onBasemap(b)}
              className={cn("px-2 py-1 capitalize", basemap === b ? "bg-[#1476e8] text-white" : "text-navy/70 hover:bg-navy/5")}
            >
              {b}
            </button>
          ))}
        </div>
        <div className="flex flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-navy/10">
          <button type="button" aria-label="Zoom in" onClick={() => onZoom(Math.min(zoom * 1.5, 5))} className="grid size-6.5 place-items-center border-b border-navy/10 text-navy hover:bg-navy/5">
            <Plus weight="bold" className="size-3" />
          </button>
          <button type="button" aria-label="Zoom out" onClick={() => onZoom(Math.max(zoom / 1.5, 0.45))} className="grid size-6.5 place-items-center border-b border-navy/10 text-navy hover:bg-navy/5">
            <Minus weight="bold" className="size-3" />
          </button>
          <button type="button" aria-label="Fit territory" onClick={() => onZoom(1)} className="grid size-6.5 place-items-center text-[#1476e8] hover:bg-navy/5">
            <Crosshair weight="bold" className="size-3.5" />
          </button>
        </div>
      </div>
      <span className="pointer-events-none absolute right-1.5 bottom-0.5 z-10 rounded bg-white/75 px-1 text-[7.5px] text-navy/60">
        {basemap === "satellite" ? "Imagery © Esri, Maxar" : "Map tiles © Esri, HERE, OpenStreetMap contributors"}
      </span>
    </div>
  );
}

function MapCanvas({
  reduce,
  view,
  size,
  focus,
  filter,
  colorBy,
  layers,
  basemap,
  selected,
  onProject,
  onTaluk,
}: {
  reduce: boolean;
  view: View;
  size: Size;
  focus: Focus;
  filter: StatusId | "all";
  colorBy: ColorBy;
  layers: Record<Layer, boolean>;
  basemap: Basemap;
  selected: string;
  onProject: (id: string) => void;
  onTaluk: (id: string) => void;
}) {
  const inv = 1 / view.s;
  const x0 = view.cx - size.w / (2 * view.s);
  const y0 = view.cy - size.h / (2 * view.s);
  const detailZ = Math.min(15, BASE_ZOOM + Math.max(0, Math.floor(Math.log2(view.s) + 0.35)));
  const sat = basemap === "satellite";
  const single = Boolean(focus.taluk);
  const ordered = [...PROJECTS.filter((p) => p.id !== selected), PROJECT_BY_ID[selected]];
  const sel = PROJECT_BY_ID[selected];
  const [sx, sy] = PROJECT_XY[selected];
  const selColor = colorBy === "territory" ? TALUKS[sel.taluk].color : STATUS_BY_ID[PROJECT_STATUS[sel.id]].color;

  return (
    <>
      <div className={cn("absolute inset-0", !sat && "saturate-[0.85]")}>
        <TileLayer view={view} size={size} z={BASE_ZOOM} service={basemap} />
        {detailZ > BASE_ZOOM ? <TileLayer view={view} size={size} z={detailZ} service={basemap} /> : null}
      </div>

      <svg viewBox={`${x0} ${y0} ${size.w * inv} ${size.h * inv}`} className="absolute inset-0 h-full w-full">
        {layers.territories ? (
          <g>
            {TALUK_ORDER.map((id, i) => {
              const t = TALUKS[id];
              const on = focus.taluks.includes(id);
              const fill = colorBy === "territory" ? (on ? (single ? 0.3 : 0.22) : 0.07) : on ? 0.12 : 0.05;
              return (
                <motion.path
                  key={id}
                  d={TALUK_PATH[id]}
                  fill={t.color}
                  stroke={t.color}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  className="cursor-pointer"
                  onClick={() => onTaluk(id)}
                  initial={reduce ? false : { fillOpacity: 0, pathLength: 0 }}
                  animate={{
                    fillOpacity: sat ? (on ? fill + 0.06 : 0.03) : fill,
                    strokeOpacity: on ? 1 : 0.45,
                    strokeWidth: focus.taluk === id ? 3.2 : 1.8,
                    pathLength: 1,
                  }}
                  transition={{ duration: 0.6, delay: reduce ? 0 : i * 0.06 }}
                />
              );
            })}
            {(Object.keys(DISTRICTS) as DistrictId[]).map((id) => (
              <path
                key={id}
                d={DISTRICTS[id].path}
                fill="none"
                stroke={sat ? "#ffffff" : "#0b1f4a"}
                strokeWidth={focus.district === id ? 3 : 2}
                strokeDasharray="7 5"
                strokeOpacity={focus.district === id ? 0.9 : 0.55}
                vectorEffect="non-scaling-stroke"
                pointerEvents="none"
              />
            ))}
            {(Object.keys(DISTRICTS) as DistrictId[]).map((id) => {
              const [x, y] = project(DISTRICTS[id].labelAt);
              return (
                <g key={`${id}-label`} transform={`translate(${x} ${y}) scale(${inv})`} pointerEvents="none">
                  <text
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="800"
                    fill={sat ? "#ffffff" : "#0b1f4a"}
                    fillOpacity="0.7"
                    stroke={sat ? "#0b1f4a" : "#ffffff"}
                    strokeWidth="3"
                    paintOrder="stroke"
                    style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}
                  >
                    {DISTRICTS[id].label}
                  </text>
                </g>
              );
            })}
            {TALUK_ORDER.map((id) => {
              const t = TALUKS[id];
              const on = focus.taluks.includes(id);
              const [x, y] = project(t.labelAt);
              return (
                <g key={`${id}-name`} transform={`translate(${x} ${y}) scale(${inv})`} opacity={on ? 1 : 0.5} pointerEvents="none">
                  <text
                    textAnchor="middle"
                    fontSize={focus.taluk === id ? 13 : 11}
                    fontWeight="800"
                    fill={t.color}
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    paintOrder="stroke"
                    style={{ letterSpacing: "0.06em", textTransform: "uppercase", filter: "brightness(0.85)" }}
                  >
                    {t.label}
                  </text>
                </g>
              );
            })}
          </g>
        ) : null}

        {layers.gps && layers.projects ? (
          <g key={`trail-${selected}`} transform={`translate(${sx} ${sy}) scale(${inv})`} pointerEvents="none">
            <motion.polyline
              points={[...TRAIL, [0, -17]].map(([x, y]) => `${x},${y}`).join(" ")}
              fill="none"
              stroke="#1476e8"
              strokeWidth="2"
              strokeDasharray="4 4"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8 }}
            />
            {TRAIL.map(([x, y], i) => (
              <motion.g
                key={i}
                transform={`translate(${x} ${y})`}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: reduce ? 0 : 0.2 + i * 0.2 }}
              >
                <circle r="8" fill="#1476e8" opacity="0.18" />
                <circle r="4" fill="#1476e8" stroke="#ffffff" strokeWidth="1.5" />
                <text y="3" textAnchor="middle" fontSize="5.5" fontWeight="800" fill="#ffffff">
                  {i + 1}
                </text>
              </motion.g>
            ))}
          </g>
        ) : null}

        {layers.projects
          ? ordered.map((p, i) => {
              const [x, y] = PROJECT_XY[p.id];
              const status = STATUS_BY_ID[PROJECT_STATUS[p.id]];
              const color = colorBy === "territory" ? TALUKS[p.taluk].color : status.color;
              const inside = focus.taluks.includes(p.taluk);
              const hobliOk = !focus.hobli || p.hobli === focus.hobli;
              const statusOk = filter === "all" || status.id === filter;
              const visible = inside && statusOk;
              const isSel = p.id === selected;
              const showName = isSel || (visible && hobliOk && (single || filter !== "all"));
              return (
                <motion.g
                  key={p.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProject(p.id);
                  }}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: visible ? (hobliOk ? 1 : 0.45) : 0.2 }}
                  transition={{ duration: 0.35, delay: reduce ? 0 : Math.min(0.3 + i * 0.03, 1) }}
                >
                  <g transform={`translate(${x} ${y}) scale(${inv * (isSel ? 1.3 : 1)})`}>
                    <path d={PIN_D} fill={color} stroke="#ffffff" strokeWidth="1.8" filter="drop-shadow(0 2px 2px rgba(7,20,51,0.35))" />
                    <circle cx="0" cy="-15" r="3.2" fill="#ffffff" />
                    {status.exception ? <circle cx="0" cy="-15" r="1.8" fill={status.color} /> : null}
                    {layers.evidence && STATUS_INDEX[status.id] >= 1 ? (
                      <g transform="translate(8 -24)">
                        <circle r="5.5" fill="#f97316" stroke="#ffffff" strokeWidth="1.4" />
                        <rect x="-2.6" y="-1.8" width="5.2" height="3.8" rx="0.8" fill="#ffffff" />
                      </g>
                    ) : null}
                  </g>
                  {showName ? (
                    <g transform={`translate(${x} ${y}) scale(${inv})`} pointerEvents="none">
                      <text
                        x={isSel ? 15 : 12}
                        y={isSel ? -16 : -12}
                        fontSize={isSel ? 11.5 : 10}
                        fontWeight="700"
                        fill="#0b1f4a"
                        stroke="#ffffff"
                        strokeWidth="3.2"
                        paintOrder="stroke"
                      >
                        {p.name}
                      </text>
                    </g>
                  ) : null}
                </motion.g>
              );
            })
          : null}

        {!reduce && layers.projects ? (
          <g transform={`translate(${sx} ${sy}) scale(${inv})`} pointerEvents="none">
            <motion.circle
              key={`pulse-${selected}`}
              cx="0"
              cy="-20"
              fill="none"
              stroke={selColor}
              strokeWidth="2"
              animate={{ r: [12, 28], opacity: [0.7, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          </g>
        ) : null}
      </svg>
    </>
  );
}

function TerritoryInfo({
  reduce,
  node,
  focus,
  count,
  filter,
}: {
  reduce: boolean;
  node: string;
  focus: Focus;
  count: number;
  filter: StatusId | "all";
}) {
  const crumbs = pathTo(node);
  const t = focus.taluk ? TALUKS[focus.taluk] : undefined;
  const chips: { key: string; Icon: CessIcon; text: string }[] = t
    ? [
        { key: "body", Icon: Bank, text: t.localBody },
        { key: "officer", Icon: User, text: `Inspector ${t.inspector}` },
      ]
    : [{ key: "taluks", Icon: Stack, text: `${focus.taluks.length} taluks` }];

  return (
    <div className="pointer-events-none absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1" style={{ maxWidth: `calc(100% - ${CARD_W + 30}px)` }}>
      <span className="inline-flex max-w-full flex-wrap items-center gap-x-1 rounded-full bg-white/95 px-2.5 py-1 text-[9.5px] font-semibold text-navy/65 shadow-sm ring-1 ring-navy/10">
        {crumbs.map((c, i) => (
          <span key={c.id} className={cn(i === crumbs.length - 1 && "font-extrabold text-navy")}>
            {i ? "› " : ""}
            {c.label.replace(" (31 Districts)", "")}
          </span>
        ))}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${node}-${filter}`}
          className="flex flex-wrap items-center gap-1"
          initial={reduce ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9.5px] font-bold text-white shadow-sm"
            style={{ background: t ? t.color : filter === "all" ? "#1476e8" : STATUS_BY_ID[filter].color }}
          >
            <MapPin weight="fill" className="size-3" />
            {focus.mapped ? `${count} projects` : "Map shows Bengaluru area"}
            {filter !== "all" ? ` · ${STATUS_BY_ID[filter].label}` : ""}
          </span>
          {focus.mapped
            ? chips.map((c) => (
                <span
                  key={c.key}
                  className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[9.5px] font-semibold text-navy shadow-sm ring-1 ring-navy/10"
                >
                  <c.Icon weight="fill" className="size-3 text-navy/55" />
                  {c.text}
                </span>
              ))
            : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function MapLegend({ colorBy }: { colorBy: ColorBy }) {
  return (
    <div className="pointer-events-none absolute bottom-5 left-2.5 z-10 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-white/95 px-2.5 py-1.5 text-[9.5px] font-semibold text-navy shadow-md ring-1 ring-navy/10">
      <span className="inline-flex items-center gap-1">
        <svg viewBox="-10 -26 20 28" className="h-3.5 w-3">
          <path d={PIN_D} fill="#0b1f4a" />
        </svg>
        Pin colour = {colorBy}
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="size-2.5 rounded-full bg-[#1476e8] ring-2 ring-[#1476e8]/20" />
        GPS visit
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="grid size-3.5 place-items-center rounded-full bg-[#f97316]">
          <Camera weight="fill" className="size-2 text-white" />
        </span>
        Field evidence
      </span>
      <span className="inline-flex items-center gap-1">
        <span className="h-0 w-4 border-t-2 border-dashed border-navy/60" />
        District boundary
      </span>
    </div>
  );
}

function projectFacts(id: string) {
  const p = PROJECT_BY_ID[id];
  const status = STATUS_BY_ID[PROJECT_STATUS[id]];
  const idx = STATUS_INDEX[status.id];
  const visits = id === "abc" ? 3 : idx === 0 ? 0 : Math.min(idx, 4);
  const evidence =
    id === "abc"
      ? { photos: 12, videos: 2, notes: 3 }
      : { photos: idx === 0 ? 0 : Math.min(idx, 4) * 3, videos: idx > 1 ? 1 : 0, notes: Math.min(idx, 4) };
  const thumb = id === "abc" ? abcSite : THUMBS[PROJECTS.indexOf(p) % THUMBS.length];
  const coords = `${p.at[0].toFixed(4)}° N, ${p.at[1].toFixed(4)}° E`;
  return { p, status, visits, evidence, thumb, coords };
}

function ProjectCard({ reduce, id }: { reduce: boolean; id: string }) {
  const f = projectFacts(id);
  const t = TALUKS[f.p.taluk];
  const cur = PHASE_INDEX[f.status.phase];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={id}
        className="rounded-xl bg-white/97 p-2.5 shadow-[0_12px_28px_rgba(7,20,51,0.2)] ring-1 ring-navy/10 backdrop-blur-sm"
        initial={reduce ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduce ? undefined : { opacity: 0, y: -8 }}
        transition={{ duration: 0.22 }}
      >
        <div className="flex gap-2">
          <img src={f.thumb} alt="" className="size-[46px] shrink-0 rounded-lg object-cover object-top ring-1 ring-navy/10" />
          <div className="min-w-0">
            <b className="font-display block truncate text-[12.5px] leading-tight text-navy">{f.p.name}</b>
            <span className="mt-0.5 flex items-center gap-1 truncate text-[9.5px] text-navy/60">
              <span className="size-2 shrink-0 rounded-full" style={{ background: t.color }} />
              {f.p.place} · {t.label}
            </span>
            <span className="mt-0.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white" style={{ background: f.status.color }}>
              {f.status.exception ? <WarningCircle weight="fill" className="size-2.5" /> : <span className="size-1.5 rounded-full bg-white" />}
              {f.status.label}
            </span>
          </div>
        </div>
        <p className="mt-1 text-[9.5px] leading-snug text-navy/60">{f.status.meaning}.</p>

        <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-[#e8f1fd] px-2 py-1">
          <Crosshair weight="bold" className="size-3 shrink-0 text-[#1476e8]" />
          <b className="min-w-0 flex-1 truncate font-mono text-[9.5px] text-navy">{f.coords}</b>
          <span className="shrink-0 text-[9px] font-bold text-[#1476e8]">{f.visits} GPS visits</span>
        </div>

        {f.evidence.photos ? (
          <div className="mt-1.5">
            <div className="grid grid-cols-3 gap-1">
              {THUMBS.slice(0, 3).map((src, i) => (
                <motion.img
                  key={src}
                  src={src}
                  alt=""
                  className="h-8 w-full rounded-md object-cover ring-1 ring-navy/10"
                  initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.22, delay: reduce ? 0 : 0.1 + i * 0.06 }}
                />
              ))}
            </div>
            <div className="mt-1 flex gap-2.5 text-[9px] font-semibold text-navy/75">
              <span className="inline-flex items-center gap-0.5">
                <Camera weight="fill" className="size-2.5 text-[#f97316]" />
                {f.evidence.photos} photos
              </span>
              <span className="inline-flex items-center gap-0.5">
                <VideoCamera weight="fill" className="size-2.5 text-[#7c3aed]" />
                {f.evidence.videos} videos
              </span>
              <span className="inline-flex items-center gap-0.5">
                <FileText weight="fill" className="size-2.5 text-[#1476e8]" />
                {f.evidence.notes} notes
              </span>
            </div>
          </div>
        ) : (
          <p className="mt-1.5 rounded-md bg-[#f7fafd] px-2 py-1.5 text-[9.5px] text-navy/60">Field visit not yet done.</p>
        )}

        <div className="relative mt-2 flex justify-between">
          <span aria-hidden className="absolute top-[8px] right-3 left-3 h-[2px] bg-navy/10" />
          {PHASES.map((ph, i) => {
            const done = i < cur || (i === cur && f.status.id === "closed");
            const current = i === cur && f.status.id !== "closed";
            const color = current ? f.status.color : done ? "#16a34a" : undefined;
            return (
              <motion.div
                key={ph.id}
                className="relative z-[1] flex w-8 flex-col items-center gap-0.5"
                initial={reduce ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: reduce ? 0 : 0.15 + i * 0.06 }}
              >
                <span
                  className={cn(
                    "relative grid size-[18px] place-items-center rounded-full ring-2 ring-white",
                    color ? "text-white" : "bg-[#eef2f7] text-navy/35",
                  )}
                  style={color ? { background: color } : undefined}
                >
                  {done ? (
                    <Check weight="bold" className="size-2.5" />
                  ) : current && f.status.exception ? (
                    <WarningCircle weight="fill" className="size-3" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-current" />
                  )}
                  {current && !reduce ? (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      animate={{ boxShadow: [`0 0 0 0 ${f.status.color}88`, `0 0 0 6px ${f.status.color}00`] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                  ) : null}
                </span>
                <span className={cn("text-[8px] leading-none", done || current ? "font-bold text-navy" : "text-navy/45")}>{ph.short}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ControlPanel({
  reduce,
  focus,
  filter,
  colorBy,
  layers,
  onFilter,
  onColorBy,
  onLayer,
}: {
  reduce: boolean;
  focus: Focus;
  filter: StatusId | "all";
  colorBy: ColorBy;
  layers: Record<Layer, boolean>;
  onFilter: (id: StatusId | "all") => void;
  onColorBy: (c: ColorBy) => void;
  onLayer: (id: Layer) => void;
}) {
  const scoped = PROJECTS.filter((p) => inFocus(p, focus));
  const counts = Object.fromEntries(STATUSES.map((s) => [s.id, scoped.filter((p) => PROJECT_STATUS[p.id] === s.id).length])) as Record<StatusId, number>;

  return (
    <aside className="flex w-[204px] shrink-0 flex-col overflow-y-auto border-l border-navy/8 bg-[#f7fafd] px-2.5 pt-2.5 pb-2">
      <b className="font-display text-[13px] text-navy">Map Layers</b>
      <div className="mt-1.5 grid grid-cols-2 gap-1">
        {LAYERS.map((layer) => {
          const on = layers[layer.id];
          return (
            <button
              key={layer.id}
              type="button"
              onClick={() => onLayer(layer.id)}
              className={cn(
                "flex items-center gap-1 rounded-md px-1.5 py-1 text-left text-[10px] font-semibold ring-1 transition-colors",
                on ? "bg-white text-navy ring-navy/12" : "bg-transparent text-navy/45 ring-navy/8",
              )}
            >
              <span
                className={cn("grid size-3.5 shrink-0 place-items-center rounded", on ? "text-white" : "bg-white ring-1 ring-navy/20")}
                style={on ? { background: layer.color } : undefined}
              >
                {on ? <Check weight="bold" className="size-2" /> : null}
              </span>
              <span className="truncate">{layer.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 mb-1 text-[8.5px] font-extrabold tracking-[0.12em] text-navy/55 uppercase">Colour pins by</div>
      <div className="grid grid-cols-2 overflow-hidden rounded-lg bg-white text-[10px] font-bold ring-1 ring-navy/12">
        {(["territory", "status"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onColorBy(c)}
            className={cn("py-1 capitalize transition-colors", colorBy === c ? "bg-[#1476e8] text-white" : "text-navy/70 hover:bg-navy/5")}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-2.5 mb-1 text-[8.5px] font-extrabold tracking-[0.12em] text-navy/55 uppercase">Status · assessment to closure</div>
      <button
        type="button"
        onClick={() => onFilter("all")}
        className={cn(
          "mb-0.5 flex items-center justify-between rounded-md px-2 py-[3px] text-[10.5px] font-bold",
          filter === "all" ? "bg-[#e8f1fd] text-[#0f5fcf] ring-1 ring-[#1476e8]/25" : "text-navy hover:bg-navy/5",
        )}
      >
        All statuses
        <span className="text-[9.5px] font-semibold text-navy/55">{scoped.length}</span>
      </button>
      {PHASES.map((ph, pi) => (
        <motion.div
          key={ph.id}
          className="mt-0.5"
          initial={reduce ? false : { opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, delay: reduce ? 0 : 0.15 + pi * 0.06 }}
        >
          <div className="px-2 text-[8px] font-extrabold tracking-[0.1em] text-navy/40 uppercase">{ph.label}</div>
          {STATUSES.filter((st) => st.phase === ph.id).map((st) => {
            const on = filter === st.id;
            return (
              <button
                key={st.id}
                type="button"
                title={st.meaning}
                onClick={() => onFilter(st.id)}
                className={cn(
                  "flex w-full items-center gap-1.5 rounded-md px-2 py-[2px] text-left text-[10.5px] transition-colors",
                  on ? "bg-white font-bold text-navy shadow-sm ring-1 ring-navy/10" : "text-navy/85 hover:bg-navy/5",
                )}
              >
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: st.color }} />
                <span className={cn("min-w-0 flex-1 truncate", st.exception && "text-[#b91c1c]")}>{st.label}</span>
                <span className={cn("text-[9.5px] font-semibold", counts[st.id] ? "text-navy/60" : "text-navy/25")}>{counts[st.id]}</span>
              </button>
            );
          })}
        </motion.div>
      ))}
    </aside>
  );
}
