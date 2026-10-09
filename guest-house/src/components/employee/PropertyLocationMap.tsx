import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { getSiteCoordinate } from "@/utils/siteCoordinates"
import { cn } from "@/lib/utils"

interface PropertyLocationMapProps {
  siteId: string
  siteName: string
  className?: string
}

function createLocationIcon() {
  return L.divIcon({
    className: "property-map-pin-wrapper",
    html: `<div class="property-map-pin" aria-hidden="true"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  })
}

export function PropertyLocationMap({ siteId, siteName, className }: PropertyLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || mapRef.current) return

    const { lat, lng } = getSiteCoordinate(siteId)

    const map = L.map(container, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      preferCanvas: true,
    }).setView([lat, lng], 14)

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 20,
      subdomains: "abcd",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map)

    L.control.zoom({ position: "topright" }).addTo(map)

    L.marker([lat, lng], {
      icon: createLocationIcon(),
      title: siteName,
    }).addTo(map)

    map.on("click", () => {
      map.scrollWheelZoom.enable()
    })

    mapRef.current = map

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize()
    })
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      map.remove()
      mapRef.current = null
    }
  }, [siteId, siteName])

  return (
    <div
      ref={containerRef}
      className={cn("property-location-map h-full w-full min-h-[280px]", className)}
      role="img"
      aria-label={`Map showing location of ${siteName}`}
    />
  )
}

export function getMapsDirectionsUrl(siteId: string) {
  const { lat, lng } = getSiteCoordinate(siteId)
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}
