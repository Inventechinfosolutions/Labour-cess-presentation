import { geoMercator, geoPath, type GeoPermissibleObjects } from "d3-geo"
import { useEffect, useId, useMemo, useState } from "react"
import {
  districtStatsByGeoName,
  territories,
  type DistrictStat,
} from "@/data/dashboard-data"
import { formatNumber, formatPercent } from "@/lib/format"
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

const WIDTH = 420
const HEIGHT = 520

function claimsColor(claims: number, max: number, active: boolean): string {
  const t = Math.pow(Math.min(1, Math.max(0, claims / max)), 0.55)
  // Soft slate → rich project blue
  const r = Math.round(226 - t * (226 - 37))
  const g = Math.round(232 - t * (232 - 99))
  const b = Math.round(240 - t * (240 - 235))
  if (active) {
    return `rgb(${Math.max(0, r - 18)}, ${Math.max(0, g - 12)}, ${Math.min(255, b + 8)})`
  }
  return `rgba(${r},${g},${b},${0.62 + t * 0.35})`
}

/** Decorative silhouette used in the hero banner. */
export function KarnatakaMap({ className }: { className?: string }) {
  const KARNATAKA_PATH =
    "M40 6 L57 8 L66 16 L62 27 L71 33 L67 45 L75 53 L66 61 L69 72 L58 82 L51 93 L45 84 L41 73 L33 69 L29 59 L21 53 L26 43 L19 35 L26 27 L35 21 L33 12 Z"

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="Karnataka — decorative outline"
    >
      <defs>
        <radialGradient id="km-fill" cx="60%" cy="40%" r="80%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.28" />
          <stop offset="55%" stopColor="#1d4ed8" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#0b1424" stopOpacity="0.05" />
        </radialGradient>
        <pattern id="km-dots" width="3" height="3" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.45" fill="#93c5fd" fillOpacity="0.35" />
        </pattern>
        <filter id="km-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id="km-clip">
          <path d={KARNATAKA_PATH} />
        </clipPath>
      </defs>

      <path d={KARNATAKA_PATH} fill="url(#km-fill)" />
      <g clipPath="url(#km-clip)">
        <rect x="0" y="0" width="100" height="100" fill="url(#km-dots)" />
      </g>
      <path
        d={KARNATAKA_PATH}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="0.6"
        strokeOpacity="0.7"
        filter="url(#km-glow)"
      />

      {territories.slice(1).map((t) => (
        <line
          key={`line-${t.id}`}
          x1={territories[0].x}
          y1={territories[0].y}
          x2={t.x}
          y2={t.y}
          stroke="#3b82f6"
          strokeWidth="0.25"
          strokeOpacity="0.28"
          strokeDasharray="1 1.2"
        />
      ))}

      {territories.map((t) => (
        <g key={t.id}>
          <circle cx={t.x} cy={t.y} r={t.size * 1.8} fill={t.color} fillOpacity="0.14" />
          <circle
            cx={t.x}
            cy={t.y}
            r={t.size}
            fill={t.color}
            className="map-node"
            style={{ ["--node-r" as string]: t.size }}
          />
          <circle cx={t.x} cy={t.y} r={t.size * 0.4} fill="#ffffff" fillOpacity="0.9" />
        </g>
      ))}
    </svg>
  )
}

type DistrictMapProps = {
  className?: string
  selected?: string | null
  onSelect?: (geoName: string | null) => void
  /** Smaller decorative map — no callout card, transparent backdrop */
  compact?: boolean
}

/** Real district choropleth from GeoJSON (Hindustan Times Labs / Census). */
export function KarnatakaDistrictMap({
  className,
  selected,
  onSelect,
  compact = false,
}: DistrictMapProps) {
  const uid = useId().replace(/:/g, "")
  const [geo, setGeo] = useState<GeoCollection | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch(publicUrl("geo/karnataka-districts.geojson"))
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load map")
        return r.json()
      })
      .then((data: GeoCollection) => {
        if (!cancelled) setGeo(data)
      })
      .catch(() => {
        if (!cancelled) setLoadError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const maxClaims = useMemo(
    () => Math.max(...Object.values(districtStatsByGeoName).map((d) => d.claims), 1),
    [],
  )

  const { pathGen, centroids } = useMemo(() => {
    if (!geo) return { pathGen: null, centroids: {} as Record<string, [number, number]> }
    const projection = geoMercator().fitSize([WIDTH, HEIGHT], geo as never)
    const path = geoPath(projection)
    const centers: Record<string, [number, number]> = {}
    for (const f of geo.features) {
      const c = path.centroid(f as never)
      if (Number.isFinite(c[0]) && Number.isFinite(c[1])) {
        centers[f.properties.district] = c as [number, number]
      }
    }
    return { pathGen: path, centroids: centers }
  }, [geo])

  const activeName = hovered ?? selected ?? (compact ? null : "Bangalore")
  const activeStat: DistrictStat | undefined = activeName
    ? districtStatsByGeoName[activeName]
    : undefined
  const activeCentroid = activeName ? centroids[activeName] : undefined

  if (loadError) {
    return (
      <div
        className={cn(
          "flex aspect-[420/520] items-center justify-center rounded-2xl bg-muted/40 text-sm text-muted-foreground",
          className,
        )}
      >
        Unable to load Karnataka district map
      </div>
    )
  }

  if (!geo || !pathGen) {
    return (
      <div
        className={cn(
          "flex aspect-[420/520] items-center justify-center rounded-2xl bg-muted/20",
          className,
        )}
      >
        <div className="size-8 animate-pulse rounded-full bg-[#3b82f6]/30" />
      </div>
    )
  }

  const tipLeft = activeCentroid
    ? Math.min(72, Math.max(8, (activeCentroid[0] / WIDTH) * 100))
    : 50
  const tipTop = activeCentroid
    ? Math.min(78, Math.max(6, (activeCentroid[1] / HEIGHT) * 100 - 8))
    : 20

  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className={cn(
          "h-auto w-full",
          compact
            ? "drop-shadow-[0_8px_24px_rgba(37,99,235,0.18)]"
            : "drop-shadow-[0_16px_40px_rgba(37,99,235,0.16)]",
        )}
        role="img"
        aria-label="Karnataka districts — claims distribution"
      >
        <defs>
          <filter id={`${uid}-glow`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={compact ? 2.2 : 3.2} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#1e3a8a" floodOpacity="0.12" />
          </filter>
        </defs>

        <g filter={`url(#${uid}-soft)`}>
          {geo.features.map((feature) => {
            const name = feature.properties.district
            const stat = districtStatsByGeoName[name]
            const claims = stat?.claims ?? 0
            const isActive = name === activeName
            const d = pathGen(feature as never)
            if (!d) return null
            return (
              <path
                key={name}
                d={d}
                fill={claimsColor(claims, maxClaims, isActive)}
                stroke={isActive ? "#1d4ed8" : "rgba(255,255,255,0.85)"}
                strokeWidth={isActive ? (compact ? 1.6 : 2) : 0.7}
                filter={isActive ? `url(#${uid}-glow)` : undefined}
                className={cn(
                  "transition-[fill,stroke-width,filter] duration-200",
                  onSelect || !compact ? "cursor-pointer" : undefined,
                )}
                onMouseEnter={() => setHovered(name)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => onSelect?.(name === selected ? null : name)}
              >
                <title>
                  {stat?.displayName ?? name}: {formatNumber(claims)} claims
                </title>
              </path>
            )
          })}
        </g>

        {/* Active pulse pin */}
        {!compact && activeCentroid ? (
          <g transform={`translate(${activeCentroid[0]}, ${activeCentroid[1]})`}>
            <circle r="9" fill="#3b82f6" fillOpacity="0.18" className="map-node" />
            <circle r="4.5" fill="#3b82f6" fillOpacity="0.35" />
            <circle r="2.2" fill="#ffffff" />
          </g>
        ) : null}

        {compact && activeStat && activeCentroid ? (
          <g transform={`translate(${activeCentroid[0]}, ${activeCentroid[1]})`}>
            <circle r="4" fill="#3b82f6" fillOpacity="0.35" className="map-node" />
            <circle r="2" fill="#93c5fd" />
          </g>
        ) : null}
      </svg>

      {/* Modern HTML callout */}
      {!compact && activeStat ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full"
          style={{ left: `${tipLeft}%`, top: `${tipTop}%` }}
        >
          <div className="min-w-[132px] rounded-xl bg-white/95 px-3 py-2 shadow-[0_12px_28px_rgba(15,23,42,0.14)] ring-1 ring-[#3b82f6]/25 backdrop-blur-md">
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              {activeStat.displayName}
            </p>
            <p className="mt-0.5 font-display text-lg font-semibold tabular-nums text-foreground">
              {formatNumber(activeStat.claims)}
            </p>
            <p className="text-[11px] font-medium text-[#1d4ed8]">
              {formatPercent(activeStat.percent)} of claims
            </p>
          </div>
          <div className="mx-auto h-2 w-2 -translate-y-1 rotate-45 bg-white ring-1 ring-[#3b82f6]/20" />
        </div>
      ) : null}
    </div>
  )
}
