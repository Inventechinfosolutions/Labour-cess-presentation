import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo"
import { useEffect, useId, useMemo, useState } from "react"
import { Building2, Search, type LucideIcon } from "lucide-react"
import { cn, publicUrl } from "@/lib/utils"

type GeoFeature = {
  type: "Feature"
  properties: { district: string; [key: string]: unknown }
  geometry: GeoPermissibleObjects
}

type GeoCollection = {
  type: "FeatureCollection"
  features: GeoFeature[]
}

const W = 300
const H = 240

const BLUE = {
  line: "#3b82f6",
  soft: "#93c5fd",
  fill: "#dbeafe",
  fillDeep: "#bfdbfe",
  glow: "#60a5fa",
  text: "#60a5fa",
  /** Dark-mode map body — deep navy, not white */
  darkFill: "#1e3a5f",
  darkFillDeep: "#172554",
  darkEdge: "#0f172a",
  darkSoft: "#38bdf8",
  darkGlow: "#3b82f6",
}

const HUBS = [
  "Bangalore",
  "Mysore",
  "Belgaum",
  "Dharwad",
  "Gulbarga",
  "Dakshina Kannada",
  "Shimoga",
  "Bellary",
  "Tumkur",
  "Hassan",
  "Udupi",
  "Raichur",
]

type Props = {
  accent?: string
  icon?: LucideIcon
  className?: string
}

export function HeroKarnatakaGraphic({
  accent = BLUE.line,
  icon: Icon = Building2,
  className,
}: Props) {
  const uid = useId().replace(/:/g, "")
  const [geo, setGeo] = useState<GeoCollection | null>(null)
  const mapBlue = accent || BLUE.line

  useEffect(() => {
    let cancelled = false
    fetch(publicUrl("geo/karnataka-districts.geojson"))
      .then((r) => {
        if (!r.ok) throw new Error("map load failed")
        return r.json()
      })
      .then((data: GeoCollection) => {
        if (!cancelled) setGeo(data)
      })
      .catch(() => {
        if (!cancelled) setGeo(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const { paths, hubs } = useMemo(() => {
    if (!geo) {
      return {
        paths: [] as string[],
        hubs: [] as { name: string; x: number; y: number }[],
      }
    }

    const projection = geoMercator().fitExtent(
      [
        [8, 4],
        [W - 88, H - 28],
      ],
      geo as never,
    )
    const path = geoPath(projection)

    const paths: string[] = []
    const centers: Record<string, [number, number]> = {}
    for (const f of geo.features) {
      const d = path(f as never)
      if (d) paths.push(d)
      const c = path.centroid(f as never)
      if (Number.isFinite(c[0]) && Number.isFinite(c[1])) {
        centers[f.properties.district] = c as [number, number]
      }
    }

    const hubPts = HUBS.map((name) => {
      const c = centers[name]
      if (!c) return null
      return { name, x: c[0], y: c[1] }
    }).filter(Boolean) as { name: string; x: number; y: number }[]

    return { paths, hubs: hubPts }
  }, [geo])

  return (
    <div
      aria-hidden
      className={cn(
        "relative h-[96px] w-[100px] shrink-0 overflow-visible sm:h-[156px] sm:w-[200px] md:h-[176px] md:w-[240px] lg:h-[210px] lg:w-[300px]",
        className,
      )}
    >
      {/* Soft wash — light */}
      <div
        className="absolute inset-0 rounded-[2rem] dark:hidden"
        style={{
          background: `radial-gradient(ellipse 70% 75% at 42% 48%, ${BLUE.fill}cc 0%, transparent 70%)`,
        }}
      />
      {/* Soft wash — dark */}
      <div
        className="absolute inset-0 hidden rounded-[2rem] dark:block"
        style={{
          background: `radial-gradient(ellipse 70% 75% at 42% 48%, ${BLUE.darkGlow}33 0%, transparent 70%)`,
        }}
      />

      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible">
        <defs>
          <linearGradient id={`${uid}-fill`} x1="30%" y1="5%" x2="75%" y2="95%">
            <stop offset="0%" stopColor={BLUE.fillDeep} stopOpacity="0.95" />
            <stop offset="55%" stopColor={BLUE.fill} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#eff6ff" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id={`${uid}-fill-dark`} x1="30%" y1="5%" x2="75%" y2="95%">
            <stop offset="0%" stopColor={BLUE.darkFillDeep} stopOpacity="0.95" />
            <stop offset="50%" stopColor={BLUE.darkFill} stopOpacity="0.92" />
            <stop offset="100%" stopColor={BLUE.darkEdge} stopOpacity="0.98" />
          </linearGradient>
          <filter id={`${uid}-map-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor={BLUE.glow} floodOpacity="0.28" />
          </filter>
          <filter id={`${uid}-map-shadow-dark`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={BLUE.darkGlow} floodOpacity="0.45" />
          </filter>
          <filter id={`${uid}-dot-glow`} x="-120%" y="-120%" width="340%" height="340%">
            <feGaussianBlur stdDeviation="2.4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={`${uid}-halo`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={BLUE.glow} stopOpacity="0.45" />
            <stop offset="70%" stopColor={BLUE.glow} stopOpacity="0.12" />
            <stop offset="100%" stopColor={BLUE.glow} stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${uid}-halo-dark`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={BLUE.darkSoft} stopOpacity="0.4" />
            <stop offset="70%" stopColor={BLUE.darkGlow} stopOpacity="0.15" />
            <stop offset="100%" stopColor={BLUE.darkGlow} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Curves — light */}
        <g className="dark:hidden" fill="none" stroke={BLUE.soft} strokeWidth="1" opacity="0.35">
          <path d="M-10 55 Q90 30 180 58 T320 40" />
          <path d="M-5 95 Q100 70 195 100 T325 78" />
          <path d="M0 145 Q110 120 205 152 T330 130" />
        </g>
        {/* Curves — dark */}
        <g className="hidden dark:block" fill="none" stroke={BLUE.darkSoft} strokeWidth="1" opacity="0.22">
          <path d="M-10 55 Q90 30 180 58 T320 40" />
          <path d="M-5 95 Q100 70 195 100 T325 78" />
          <path d="M0 145 Q110 120 205 152 T330 130" />
        </g>

        {paths.length > 0 ? (
          <>
            {/* Map — light */}
            <g className="dark:hidden" filter={`url(#${uid}-map-shadow)`}>
              {paths.map((d, i) => (
                <path
                  key={`fl-${i}`}
                  d={d}
                  fill={`url(#${uid}-fill)`}
                  stroke={mapBlue}
                  strokeWidth="0.9"
                  strokeLinejoin="round"
                  strokeOpacity="0.55"
                />
              ))}
              {paths.map((d, i) => (
                <path
                  key={`ol-${i}`}
                  d={d}
                  fill="none"
                  stroke={mapBlue}
                  strokeWidth="1.35"
                  strokeLinejoin="round"
                  strokeOpacity="0.22"
                />
              ))}
              {hubs.map((h) => {
                const isHub = h.name === "Bangalore" || h.name === "Mysore"
                return (
                  <g key={`hl-${h.name}`}>
                    <circle cx={h.x} cy={h.y} r={isHub ? 11 : 8} fill={`url(#${uid}-halo)`} />
                    <circle
                      cx={h.x}
                      cy={h.y}
                      r={isHub ? 3.2 : 2.4}
                      fill={mapBlue}
                      filter={`url(#${uid}-dot-glow)`}
                    />
                  </g>
                )
              })}
            </g>

            {/* Map — dark */}
            <g className="hidden dark:block" filter={`url(#${uid}-map-shadow-dark)`}>
              {paths.map((d, i) => (
                <path
                  key={`fd-${i}`}
                  d={d}
                  fill={`url(#${uid}-fill-dark)`}
                  stroke={BLUE.darkSoft}
                  strokeWidth="1"
                  strokeLinejoin="round"
                  strokeOpacity="0.45"
                />
              ))}
              {paths.map((d, i) => (
                <path
                  key={`od-${i}`}
                  d={d}
                  fill="none"
                  stroke={mapBlue}
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                  strokeOpacity="0.35"
                />
              ))}
              {hubs.map((h) => {
                const isHub = h.name === "Bangalore" || h.name === "Mysore"
                return (
                  <g key={`hd-${h.name}`}>
                    <circle cx={h.x} cy={h.y} r={isHub ? 11 : 8} fill={`url(#${uid}-halo-dark)`} />
                    <circle
                      cx={h.x}
                      cy={h.y}
                      r={isHub ? 3.2 : 2.4}
                      fill={BLUE.darkSoft}
                      filter={`url(#${uid}-dot-glow)`}
                    />
                  </g>
                )
              })}
            </g>
          </>
        ) : (
          <>
            <g className="dark:hidden" opacity="0.5">
              <circle cx="110" cy="110" r="42" fill={BLUE.fill} />
              <circle cx="110" cy="110" r="24" fill={BLUE.fillDeep} className="animate-pulse" />
            </g>
            <g className="hidden dark:block" opacity="0.7">
              <circle cx="110" cy="110" r="42" fill={BLUE.darkFill} />
              <circle cx="110" cy="110" r="24" fill={BLUE.darkFillDeep} className="animate-pulse" />
            </g>
          </>
        )}

        <text
          x={W - 10}
          y={H - 10}
          textAnchor="end"
          className="fill-[#60a5fa] dark:fill-sky-400"
          fontSize="12"
          fontWeight="700"
          letterSpacing="3"
          opacity="0.7"
        >
          KARNATAKA
        </text>
      </svg>

      {/* Floating icon card */}
      <div className="absolute top-[44%] right-[2%] flex -translate-y-1/2 items-center justify-center">
        <div
          className={cn(
            "relative flex size-[36px] items-center justify-center rounded-[12px] border sm:size-[64px] sm:rounded-[22px] md:size-[84px] md:rounded-[28px] lg:size-[96px] lg:rounded-[32px]",
            "border-sky-100/80 bg-white",
            "dark:border-sky-500/25 dark:bg-[#0f172a]",
          )}
          style={{
            boxShadow: `0 18px 40px rgba(59,130,246,0.22), 0 4px 12px rgba(15,23,42,0.06)`,
          }}
        >
          <Icon
            className="size-4 sm:size-6 md:size-9 lg:size-10"
            style={{ color: mapBlue }}
            strokeWidth={1.6}
          />
          <span
            className={cn(
              "absolute -right-0.5 -bottom-0.5 flex size-4 items-center justify-center rounded-full border-2 sm:size-5 md:size-7 sm:-right-1 sm:-bottom-1",
              "border-white bg-sky-50",
              "dark:border-[#0f172a] dark:bg-sky-500/25",
            )}
            style={{ boxShadow: `0 4px 12px ${mapBlue}33` }}
          >
            <Search className="size-2 sm:size-2.5 md:size-3.5" style={{ color: mapBlue }} strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </div>
  )
}
