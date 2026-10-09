import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { cn } from "@/lib/utils"
import { formatMapPrice } from "@/utils/siteCoordinates"

export interface MapMarker {
  id: string
  siteId?: string
  lat: number
  lng: number
  price: number
}

interface ExploreMapPanelProps {
  markers: MapMarker[]
  activeId?: string
  onMarkerClick?: (id: string) => void
  onMarkerHover?: (id: string | undefined) => void
  className?: string
}

function measurePinWidth(label: string) {
  return Math.max(52, label.length * 7.5 + 22)
}

function createPriceIcon(price: number, active: boolean, dimmed: boolean) {
  const label = formatMapPrice(price)
  const width = measurePinWidth(label)
  const height = 32
  const stateClass = active
    ? " explore-map-pin--active"
    : dimmed
      ? " explore-map-pin--dimmed"
      : ""

  return L.divIcon({
    className: "explore-map-pin-wrapper",
    html: `<div class="explore-map-pin${stateClass}" role="button" tabindex="0">${label}</div>`,
    iconSize: [width, height],
    iconAnchor: [width / 2, height / 2],
  })
}

export function ExploreMapPanel({
  markers,
  activeId,
  onMarkerClick,
  onMarkerHover,
  className,
}: ExploreMapPanelProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerLayerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return

    const map = L.map(container, {
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    })

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
      subdomains: "abcd",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map)

    L.control.zoom({ position: "topright" }).addTo(map)

    markerLayerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markerLayerRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const layer = markerLayerRef.current
    if (!map || !layer) return

    layer.clearLayers()

    if (markers.length === 0) {
      map.setView([12.9716, 77.5946], 11)
      return
    }

    const bounds = L.latLngBounds([])

    const hasActive = activeId != null

    for (const marker of markers) {
      const isActive = marker.id === activeId
      const isDimmed = hasActive && !isActive

      const leafletMarker = L.marker([marker.lat, marker.lng], {
        icon: createPriceIcon(marker.price, isActive, isDimmed),
        zIndexOffset: isActive ? 1000 : Math.round(marker.price),
      })

      leafletMarker.on("click", () => onMarkerClick?.(marker.id))
      leafletMarker.on("mouseover", () => onMarkerHover?.(marker.id))
      leafletMarker.on("mouseout", () => onMarkerHover?.(undefined))
      leafletMarker.addTo(layer)
      bounds.extend([marker.lat, marker.lng])
    }

    if (bounds.isValid()) {
      const isSingleCity = markers.every((m) => m.siteId === markers[0]?.siteId)
      map.fitBounds(bounds, {
        padding: [56, 56],
        maxZoom: isSingleCity || markers.length > 6 ? 13 : 11,
      })
    }
  }, [markers, activeId, onMarkerClick, onMarkerHover])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const resize = () => map.invalidateSize()
    const timer = window.setTimeout(resize, 150)
    window.addEventListener("resize", resize)

    const observer = new ResizeObserver(() => resize())
    if (containerRef.current) observer.observe(containerRef.current)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("resize", resize)
      observer.disconnect()
    }
  }, [])

  const toggleFullscreen = () => {
    const el = wrapperRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      void el.requestFullscreen()
    } else {
      void document.exitFullscreen()
    }
    mapRef.current?.invalidateSize()
  }

  return (
    <div
      ref={wrapperRef}
      className={cn("explore-map-panel relative h-full w-full min-h-[240px] bg-[#f5f5f3]", className)}
    >
      <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full" />

      <button
        type="button"
        onClick={toggleFullscreen}
        className="explore-map-fullscreen absolute right-3 top-3 z-[1000] flex size-9 items-center justify-center rounded-lg border border-black/10 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.18)] transition hover:bg-gray-50"
        aria-label="Toggle fullscreen map"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      </button>
    </div>
  )
}

export function buildMapMarkers(
  listings: { id: string; siteId: string; lat: number; lng: number; price: number }[]
): MapMarker[] {
  return listings.map((listing) => ({
    id: listing.id,
    siteId: listing.siteId,
    lat: listing.lat,
    lng: listing.lng,
    price: listing.price,
  }))
}
