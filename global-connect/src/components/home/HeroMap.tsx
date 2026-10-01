import { useMemo, type ReactNode } from "react";
import { motion } from "motion/react";
import { WorldTiles } from "@/components/WorldTiles";
import { useElementSize } from "@/hooks/useElementSize";
import { fitPoints, toScreen, type Inset, type LatLng, type Size } from "@/lib/geo";
import { BENGALURU_POINT, KARNATAKA_DISTRICTS } from "@/lib/karnatakaMap";

const NIGHT_LIGHTS =
  "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_Black_Marble/default/2016-01-01/GoogleMapsCompatible_Level8/{z}/{y}/{x}.png";

const HUB: LatLng = [12.97, 77.59];

export type MapSource = { label: string; at: LatLng; dx: number; dy: number; anchor: "start" | "middle" | "end" };

const SOURCES: MapSource[] = [
  { label: "USA", at: [40.71, -74.0], dx: 0, dy: -14, anchor: "middle" },
  { label: "UK", at: [51.5, -0.13], dx: -8, dy: -12, anchor: "end" },
  { label: "EUROPE", at: [48.2, 16.4], dx: 6, dy: -14, anchor: "start" },
  { label: "MIDDLE EAST", at: [25.2, 55.3], dx: -10, dy: -10, anchor: "end" },
  { label: "SINGAPORE", at: [1.35, 103.8], dx: 10, dy: 12, anchor: "start" },
  { label: "JAPAN", at: [35.68, 139.7], dx: 12, dy: -6, anchor: "start" },
  { label: "AUSTRALIA", at: [-33.87, 151.2], dx: -12, dy: 4, anchor: "end" },
];

function defaultInset({ w, h }: Size): Inset {
  if (w >= 1024) return { l: w * 0.36, r: 70, t: 190, b: 190 };
  if (w >= 640) return { l: 70, r: 96, t: h * 0.5, b: 120 };
  return { l: 40, r: 74, t: h * 0.56, b: 110 };
}

/** Curved arc from a source to the hub, bowed upward. */
function arcPath([x1, y1]: [number, number], [x2, y2]: [number, number]) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  let nx = -dy / len;
  let ny = dx / len;
  if (ny > 0) {
    nx = -nx;
    ny = -ny;
  }
  const bow = Math.min(160, len * 0.28);
  return `M${x1.toFixed(1)},${y1.toFixed(1)} Q${(mx + nx * bow).toFixed(1)},${(my + ny * bow).toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`;
}

const DEFAULT_TAGLINE = (
  <>
    Connect <span className="text-[#ffcf6b]">•</span> Collaborate <span className="text-[#ffcf6b]">•</span> Invest{" "}
    <span className="text-[#ffcf6b]">•</span> Grow
  </>
);

export function HeroMap({
  reduce,
  sources = SOURCES,
  insetFor = defaultInset,
  tagline = DEFAULT_TAGLINE,
  arcDuration = 1.4,
}: {
  reduce: boolean;
  sources?: MapSource[];
  insetFor?: (size: Size) => Inset;
  tagline?: ReactNode;
  arcDuration?: number;
}) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const view = useMemo(
    () => (size ? fitPoints([...sources.map((s) => s.at), HUB], size, insetFor(size)) : null),
    [size, sources, insetFor],
  );

  const geo = useMemo(() => {
    if (!view || !size) return null;
    const hub = toScreen(view, size, HUB);
    return {
      hub,
      sources: sources.map((s) => {
        const p = toScreen(view, size, s.at);
        return { ...s, p, d: arcPath(p, hub) };
      }),
    };
  }, [view, size, sources]);

  const compact = (size?.w ?? 1200) < 640;
  const k = compact ? 0.18 : 0.3;
  /** Distance from the Bengaluru hub down to the state's southern edge. */
  const below = (473 - BENGALURU_POINT.y) * k;

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-[#030b22]">
      {view && size ? (
        <WorldTiles
          view={view}
          size={size}
          url={NIGHT_LIGHTS}
          maxZoom={8}
          className="pointer-events-none absolute inset-0 overflow-hidden [filter:brightness(1.45)_contrast(1.08)_saturate(1.2)]"
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_68%_45%,rgba(40,110,220,0.18),transparent_60%)]" />

      {geo && size ? (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden>
          <defs>
            <linearGradient id="arc-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={size.w} y2="0">
              <stop offset="0" stopColor="#ffd77a" stopOpacity="0.55" />
              <stop offset="1" stopColor="#ffe9b0" stopOpacity="0.95" />
            </linearGradient>
            <radialGradient id="hub-glow">
              <stop offset="0" stopColor="#ffd56a" stopOpacity="0.85" />
              <stop offset="0.45" stopColor="#ffb938" stopOpacity="0.35" />
              <stop offset="1" stopColor="#ffb938" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ka-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#ffe08a" />
              <stop offset="1" stopColor="#f5a524" />
            </linearGradient>
            <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {geo.sources.map((s, i) => (
            <g key={s.label}>
              <path d={s.d} fill="none" stroke="#ffcf6b" strokeOpacity={0.18} strokeWidth={5} />
              <motion.path
                d={s.d}
                fill="none"
                stroke="url(#arc-grad)"
                strokeWidth={1.6}
                strokeLinecap="round"
                filter="url(#soft-glow)"
                initial={reduce ? false : { pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: arcDuration, delay: 0.5 + i * 0.16, ease: [0.4, 0, 0.2, 1] }}
              />
              {!reduce ? (
                <circle r={2.6} fill="#fff4d1" filter="url(#soft-glow)">
                  <animateMotion dur={`${3.4 + (i % 3) * 0.5}s`} begin={`${2 + i * 0.35}s`} repeatCount="indefinite" path={s.d} />
                  <animate
                    attributeName="opacity"
                    values="0;1;1;0"
                    keyTimes="0;0.1;0.85;1"
                    dur={`${3.4 + (i % 3) * 0.5}s`}
                    begin={`${2 + i * 0.35}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              ) : null}
            </g>
          ))}

          {geo.sources.map((s, i) => (
            <motion.g
              key={`${s.label}-pt`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.16 }}
            >
              <circle cx={s.p[0]} cy={s.p[1]} r={9} fill="#ffc94d" opacity={0.18} />
              <circle cx={s.p[0]} cy={s.p[1]} r={3.6} fill="#ffe7a3" filter="url(#soft-glow)" />
              <text
                x={s.p[0] + s.dx}
                y={s.p[1] + s.dy}
                textAnchor={s.anchor}
                className="fill-white font-display font-medium"
                style={{ fontSize: compact ? 9 : 12.5, letterSpacing: "0.08em", paintOrder: "stroke" }}
                stroke="rgba(3,11,34,0.65)"
                strokeWidth={3}
              >
                {s.label}
              </text>
            </motion.g>
          ))}

          <g>
            <circle cx={geo.hub[0]} cy={geo.hub[1] - 473 * k * 0.35} r={compact ? 80 : 160} fill="url(#hub-glow)" />
            {!reduce
              ? [0, 1].map((n) => (
                  <motion.circle
                    key={n}
                    cx={geo.hub[0]}
                    cy={geo.hub[1]}
                    fill="none"
                    stroke="#ffd56a"
                    strokeWidth={1.2}
                    initial={{ r: 6, opacity: 0.7 }}
                    animate={{ r: compact ? 44 : 80, opacity: 0 }}
                    transition={{ duration: 2.8, delay: 1.6 + n * 1.4, repeat: Infinity, ease: "easeOut" }}
                  />
                ))
              : null}
            <motion.g
              initial={reduce ? false : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: `${geo.hub[0]}px ${geo.hub[1]}px` }}
            >
              <g
                transform={`translate(${geo.hub[0] - BENGALURU_POINT.x * k} ${geo.hub[1] - BENGALURU_POINT.y * k}) scale(${k})`}
                filter="url(#soft-glow)"
              >
                {KARNATAKA_DISTRICTS.map((d) => (
                  <path
                    key={d.name}
                    d={d.d}
                    fill="url(#ka-fill)"
                    fillOpacity={0.92}
                    stroke="#fff3c8"
                    strokeOpacity={0.55}
                    strokeWidth={0.8}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </g>
              <circle cx={geo.hub[0]} cy={geo.hub[1]} r={4.5} fill="#ffffff" filter="url(#soft-glow)" />
            </motion.g>
          </g>
        </svg>
      ) : null}

      {geo ? (
        <motion.div
          className="pointer-events-none absolute -translate-x-full text-right"
          style={{ left: geo.hub[0] + (compact ? 24 : 40), top: geo.hub[1] + below + (compact ? 4 : 8) }}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          <div
            className={
              compact
                ? "font-display text-[13px] font-semibold tracking-[0.22em] text-white"
                : "font-display text-[20px] font-semibold tracking-[0.24em] text-white"
            }
            style={{ textShadow: "0 0 18px rgba(255,200,90,0.55)" }}
          >
            KARNATAKA
          </div>
          <div
            className={
              compact
                ? "mt-0.5 whitespace-nowrap text-[10px] text-white/85"
                : "mt-1 whitespace-nowrap text-[14px] font-medium text-white/90"
            }
          >
            {tagline}
          </div>
        </motion.div>
      ) : null}

      <span className="absolute right-3 bottom-[72px] z-10 text-[9px] text-white/35 sm:bottom-[92px]">
        Night lights imagery: NASA Earth Observatory / GIBS
      </span>
    </div>
  );
}
