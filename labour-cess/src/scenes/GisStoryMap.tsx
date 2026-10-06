import { useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { motion } from "motion/react";
import { TileLayer, type TileSize } from "@/components/TileLayer";
import { fitBounds, fitScale, useFlyView, type Inset, type LatLngBounds } from "@/lib/useFlyView";
import { cn } from "@/lib/utils";
import { DISTRICTS, TALUKS, TALUK_ORDER, TALUK_PATH, boundsOf, project, tileZoomFor, type LatLng } from "@/scenes/gisTerritoryData";

/**
 * Real map behind the first three GIS beats — ABC site close-up, then the
 * Bengaluru East taluk with Ward No. 86, then the ward with the zone office
 * and the inspector's route.
 */

export type StoryMapMode = "gps" | "hierarchy" | "people";
type Basemap = "map" | "satellite";

const ABC: LatLng = [12.9616, 77.6973];
const OFFICE: LatLng = [12.9567, 77.7092];
const ROUTE: LatLng[] = [OFFICE, [12.9585, 77.701], ABC];
const GPS_POINTS: { at: LatLng; label: string }[] = [
  { at: [12.9616, 77.6973], label: "15 Jan · 10:42" },
  { at: [12.9624, 77.6962], label: "08 Jan" },
  { at: [12.9609, 77.6983], label: "02 Jan" },
];
const FOOTPRINT: LatLng[] = [
  [12.9621, 77.6966],
  [12.9622, 77.698],
  [12.9611, 77.6981],
  [12.961, 77.6967],
];
const WARD_86: LatLng[] = [
  [12.9745, 77.6905],
  [12.976, 77.705],
  [12.969, 77.715],
  [12.956, 77.7165],
  [12.947, 77.708],
  [12.9455, 77.695],
  [12.953, 77.686],
  [12.965, 77.685],
];

const BOUNDS: Record<StoryMapMode, LatLngBounds> = {
  gps: { minLat: 12.9592, maxLat: 12.964, minLng: 77.6942, maxLng: 77.7004 },
  hierarchy: boundsOf(["blr-east"]),
  people: { minLat: 12.9445, maxLat: 12.9765, minLng: 77.684, maxLng: 77.7175 },
};

const DEFAULT_BASEMAP: Record<StoryMapMode, Basemap> = { gps: "satellite", hierarchy: "map", people: "map" };

/** Room for the name labels drawn to the right of the pins. */
const LABEL_ROOM: Record<StoryMapMode, number> = { gps: 110, hierarchy: 150, people: 170 };

/** Metres per zoom-10 pixel at Bengaluru's latitude. */
const M_PER_PX = (156543.03 * Math.cos((12.96 * Math.PI) / 180)) / 1024;

const ringD = (pts: LatLng[]) => `M${pts.map((p) => project(p).map((v) => v.toFixed(3)).join(",")).join("L")}Z`;
const lineD = (pts: LatLng[]) => `M${pts.map((p) => project(p).map((v) => v.toFixed(3)).join(",")).join("L")}`;

const FOOTPRINT_D = ringD(FOOTPRINT);
const WARD_D = ringD(WARD_86);
const ROUTE_D = lineD(ROUTE);
const PIN_D = "M0 0C-3-6-9-9-9-15a9 9 0 0 1 18 0c0 6-6 9-9 15z";

type Rect = { x: number; y: number; w: number; h: number };

/** Free areas right of the first k cards and below the rest, for every split k. */
function freeInset(size: TileSize, bounds: LatLngBounds, cards: Rect[], labelRoom: number): Inset {
  const m = 24;
  const all = { l: m, t: m, r: m + labelRoom, b: m };
  if (!cards.length) return all;
  const sorted = [...cards].sort((a, b) => a.x - b.x);
  const ok = (i: Inset) => size.w - i.l - i.r > 140 && size.h - i.t - i.b > 120;
  for (const r of [m + labelRoom, m]) {
    const options: Inset[] = [];
    for (let k = 0; k <= sorted.length; k++) {
      const left = sorted.slice(0, k);
      const rest = sorted.slice(k);
      options.push({
        l: left.length ? Math.max(...left.map((c) => c.x + c.w)) + m : m,
        t: rest.length ? Math.max(...rest.map((c) => c.y + c.h)) + m : m,
        r,
        b: m,
      });
    }
    const fits = options.filter(ok);
    if (fits.length) {
      return fits.reduce((a, b) => (fitScale(bounds, size, b) > fitScale(bounds, size, a) ? b : a));
    }
  }
  return all;
}

export function StoryMap({
  mode,
  reduce,
  obstacleRef,
  obstacleKey,
}: {
  mode: StoryMapMode;
  reduce: boolean;
  obstacleRef: RefObject<HTMLDivElement | null>;
  obstacleKey: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<TileSize | null>(null);
  const [obstacle, setObstacle] = useState<Rect[]>([]);
  const [basemapPick, setBasemapPick] = useState<{ mode: StoryMapMode; value: Basemap } | null>(null);
  const basemap = basemapPick?.mode === mode ? basemapPick.value : DEFAULT_BASEMAP[mode];

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
      const o = obstacleRef.current;
      if (!o) {
        setObstacle([]);
        return;
      }
      const a = el.getBoundingClientRect();
      const k = a.width ? el.clientWidth / a.width : 1;
      const parts = o.children.length ? Array.from(o.children) : [o];
      setObstacle(
        parts
          .map((c) => c.getBoundingClientRect())
          .filter((r) => r.width > 0 && r.height > 0)
          .map((r) => ({ x: (r.left - a.left) * k, y: (r.top - a.top) * k, w: r.width * k, h: r.height * k })),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const o = obstacleRef.current;
    if (o) {
      ro.observe(o);
      for (const c of Array.from(o.children)) ro.observe(c);
    }
    return () => ro.disconnect();
  }, [obstacleRef, obstacleKey]);

  const target = useMemo(() => {
    if (!size || size.w <= 0 || size.h <= 0) return null;
    const b = BOUNDS[mode];
    return fitBounds(b, size, freeInset(size, b, obstacle, LABEL_ROOM[mode]));
  }, [size, obstacle, mode]);

  const view = useFlyView(target, reduce);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-[#e6ebf0]">
      {view && size ? <StoryCanvas mode={mode} reduce={reduce} view={view} size={size} basemap={basemap} /> : null}

      <div className="pointer-events-auto absolute right-3 bottom-4 z-20 flex overflow-hidden rounded-lg bg-white text-[10px] font-bold shadow-md ring-1 ring-navy/10">
        {(["map", "satellite"] as const).map((b) => (
          <button
            key={b}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setBasemapPick({ mode, value: b });
            }}
            className={cn("px-2.5 py-1 capitalize", basemap === b ? "bg-[#1476e8] text-white" : "text-navy/70 hover:bg-navy/5")}
          >
            {b}
          </button>
        ))}
      </div>
      <span className="pointer-events-none absolute right-1.5 bottom-0.5 z-20 rounded bg-white/75 px-1 text-[7.5px] text-navy/60">
        {basemap === "satellite" ? "Imagery © Esri, Maxar" : "Map tiles © Esri, HERE, OpenStreetMap contributors"}
      </span>
    </div>
  );
}

function StoryCanvas({
  mode,
  reduce,
  view,
  size,
  basemap,
}: {
  mode: StoryMapMode;
  reduce: boolean;
  view: { cx: number; cy: number; s: number };
  size: TileSize;
  basemap: Basemap;
}) {
  const inv = 1 / view.s;
  const x0 = view.cx - size.w / (2 * view.s);
  const y0 = view.cy - size.h / (2 * view.s);
  const z = tileZoomFor(view.s, 3, 18);
  const sat = basemap === "satellite";
  const [ax, ay] = project(ABC);
  const [ox, oy] = project(OFFICE);
  const east = TALUKS["blr-east"];
  const [tx, ty] = project(east.labelAt);
  const [wx, wy] = project([12.9738, 77.7005]);
  const draw = (delay: number) => ({
    initial: reduce ? false : ({ pathLength: 0, fillOpacity: 0 } as const),
    transition: { duration: 0.9, delay: reduce ? 0 : delay, ease: "easeInOut" as const },
  });

  return (
    <>
      <div className={cn("absolute inset-0", !sat && "saturate-[0.85]")}>
        <TileLayer view={view} size={size} z={Math.max(3, z - 1)} service={sat ? "satellite" : "map"} />
        <TileLayer view={view} size={size} z={z} service={sat ? "satellite" : "map"} />
        {sat ? <TileLayer view={view} size={size} z={z} service="roads" /> : null}
        {sat ? <TileLayer view={view} size={size} z={z} service="labels" /> : null}
      </div>

      <svg viewBox={`${x0} ${y0} ${size.w * inv} ${size.h * inv}`} className="pointer-events-none absolute inset-0 h-full w-full">
        {mode !== "gps" ? (
          <g>
            <path
              d={DISTRICTS["blr-urban"].path}
              fill="none"
              stroke="#0b1f4a"
              strokeOpacity="0.55"
              strokeWidth="2"
              strokeDasharray="7 5"
              vectorEffect="non-scaling-stroke"
            />
            {TALUK_ORDER.filter((id) => id !== "blr-east" && TALUKS[id].district === "blr-urban").map((id) => (
              <path
                key={id}
                d={TALUK_PATH[id]}
                fill="none"
                stroke="#64748b"
                strokeOpacity="0.5"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <motion.path
              key={`taluk-${mode}`}
              d={TALUK_PATH["blr-east"]}
              fill={east.color}
              stroke={east.color}
              strokeWidth="3"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              {...draw(0.2)}
              animate={{ pathLength: 1, fillOpacity: mode === "hierarchy" ? 0.16 : 0.06 }}
            />
            <motion.path
              key={`ward-${mode}`}
              d={WARD_D}
              fill="#db2777"
              stroke="#db2777"
              strokeWidth="2.5"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              {...draw(mode === "hierarchy" ? 0.9 : 0.2)}
              animate={{ pathLength: 1, fillOpacity: 0.22 }}
            />
            <g transform={`translate(${tx} ${ty}) scale(${inv})`}>
              <text
                textAnchor="middle"
                fontSize="13"
                fontWeight="800"
                fill="#15803d"
                stroke="#ffffff"
                strokeWidth="4"
                paintOrder="stroke"
                style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
              >
                Bengaluru East Taluk
              </text>
            </g>
            <g transform={`translate(${wx} ${wy}) scale(${inv})`}>
              <text
                textAnchor="middle"
                y={mode === "people" ? -6 : -14}
                fontSize={mode === "people" ? 13 : 11}
                fontWeight="800"
                fill="#be185d"
                stroke="#ffffff"
                strokeWidth="4"
                paintOrder="stroke"
              >
                Ward No. 86 · Marathahalli
              </text>
            </g>
          </g>
        ) : null}

        {mode === "gps" ? (
          <g>
            <motion.path
              d={FOOTPRINT_D}
              fill="#14c4d4"
              stroke="#ffffff"
              strokeWidth="2"
              strokeDasharray="5 3"
              vectorEffect="non-scaling-stroke"
              initial={reduce ? false : { fillOpacity: 0 }}
              animate={{ fillOpacity: 0.28 }}
              transition={{ duration: 0.6, delay: reduce ? 0 : 0.4 }}
            />
            <circle cx={ax} cy={ay} r={25 / M_PER_PX} fill="#1476e8" fillOpacity="0.14" stroke="#1476e8" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            {GPS_POINTS.slice(1).map((g, i) => {
              const [gx, gy] = project(g.at);
              return (
                <motion.g
                  key={g.label}
                  transform={`translate(${gx} ${gy}) scale(${inv})`}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: reduce ? 0 : 0.7 + i * 0.2 }}
                >
                  <circle r="9" fill="#1476e8" opacity="0.25" />
                  <circle r="5.5" fill="#1476e8" stroke="#ffffff" strokeWidth="1.8" />
                  <text x="10" y="4" fontSize="10.5" fontWeight="700" fill="#ffffff" stroke="#0b1f4a" strokeWidth="3" paintOrder="stroke">
                    GPS visit · {g.label}
                  </text>
                </motion.g>
              );
            })}
          </g>
        ) : null}

        {mode === "people" ? (
          <g>
            <motion.path
              d={ROUTE_D}
              fill="none"
              stroke="#ea580c"
              strokeWidth="3"
              strokeDasharray="7 5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: reduce ? 0 : 0.6 }}
            />
            {!reduce ? (
              <motion.circle
                r={6 * inv}
                fill="#ea580c"
                stroke="#ffffff"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
                animate={{
                  cx: ROUTE.map((p) => project(p)[0]),
                  cy: ROUTE.map((p) => project(p)[1]),
                }}
                transition={{ duration: 3.2, delay: 1.6, repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" }}
              />
            ) : null}
            <g transform={`translate(${ox} ${oy}) scale(${inv})`}>
              <circle r="15" fill="#ea580c" opacity="0.22" />
              <circle r="11" fill="#ea580c" stroke="#ffffff" strokeWidth="2" />
              <path d="M-5 5V-3L0-6L5-3V5ZM-2.5 5V1H2.5V5" fill="#ffffff" stroke="#ea580c" strokeWidth="0.8" />
              <text x="16" y="4" fontSize="11.5" fontWeight="800" fill="#0b1f4a" stroke="#ffffff" strokeWidth="3.5" paintOrder="stroke">
                BBMP East Zone Office
              </text>
              <text x="16" y="17" fontSize="9.5" fontWeight="700" fill="#c2410c" stroke="#ffffff" strokeWidth="3" paintOrder="stroke">
                Inspector R. Kumar · ≈ 1.4 km
              </text>
            </g>
          </g>
        ) : null}

        <g transform={`translate(${ax} ${ay}) scale(${inv})`}>
          {!reduce ? (
            <motion.circle
              cx="0"
              cy="-20"
              fill="none"
              stroke="#14c4d4"
              strokeWidth="2.5"
              animate={{ r: [12, 30], opacity: [0.8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
          ) : null}
          <g transform="scale(1.6)">
            <path d={PIN_D} fill="#0b1f4a" stroke="#ffffff" strokeWidth="1.6" filter="drop-shadow(0 3px 3px rgba(7,20,51,0.4))" />
            <circle cx="0" cy="-15" r="3.6" fill="#14c4d4" />
          </g>
          <text
            x="18"
            y="-24"
            fontSize="13"
            fontWeight="800"
            fill="#0b1f4a"
            stroke="#ffffff"
            strokeWidth="4"
            paintOrder="stroke"
          >
            ABC Commercial Complex
          </text>
          <text x="18" y="-10" fontSize="10" fontWeight="700" fill="#1476e8" stroke="#ffffff" strokeWidth="3.5" paintOrder="stroke" fontFamily="ui-monospace, monospace">
            12.9616° N, 77.6973° E
          </text>
        </g>
      </svg>
    </>
  );
}
