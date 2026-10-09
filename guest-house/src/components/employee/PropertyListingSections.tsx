import { useState } from "react"
import {
  BadgeCheck,
  Building2,
  DoorOpen,
  MapPin,
  ShieldCheck,
  Star,
  Wifi,
} from "lucide-react"
import type { Site } from "@/types"
import { getSiteMinPrice } from "@/services/api"
import { PropertyLocationMap, getMapsDirectionsUrl } from "@/components/employee/PropertyLocationMap"
import { formatCurrency } from "@/utils/format"
import { cn } from "@/lib/utils"

export function PropertySectionDivider({ className }: { className?: string }) {
  return <hr className={cn("border-border/60", className)} />
}

interface PropertyListingMetaProps {
  site: Site
  reviewCount?: number
}

export function PropertyListingMeta({ site, reviewCount }: PropertyListingMetaProps) {
  const reviews = reviewCount ?? Math.round(site.rating * 12)

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm">
      <span className="inline-flex items-center gap-1 font-semibold text-foreground">
        <Star className="size-3.5 fill-foreground text-foreground" />
        {site.rating.toFixed(2)}
      </span>
      <span className="text-muted-foreground">·</span>
      <button type="button" className="font-semibold text-foreground underline decoration-foreground/30 underline-offset-2">
        {reviews} reviews
      </button>
      <span className="text-muted-foreground">·</span>
      <span className="inline-flex items-center gap-1 font-semibold text-foreground underline decoration-foreground/30 underline-offset-2">
        <MapPin className="size-3.5" />
        {site.city}
      </span>
    </div>
  )
}

export function PropertyHostBanner() {
  return (
    <div className="flex items-start gap-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
        <ShieldCheck className="size-6 text-foreground" />
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-base font-semibold text-foreground">
          Official government guest house
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Verified bookings for eligible government employees only
        </p>
      </div>
    </div>
  )
}

const HIGHLIGHTS = [
  { icon: BadgeCheck, label: "Employee ID verified at check-in" },
  { icon: Wifi, label: "Free Wi‑Fi in all buildings" },
  { icon: ShieldCheck, label: "24/7 security on campus" },
]

export function PropertyHighlightsRow() {
  return (
    <div className="grid gap-6 sm:grid-cols-3 sm:gap-4">
      {HIGHLIGHTS.map(({ icon: Icon, label }) => (
        <div key={label} className="flex items-start gap-3 sm:flex-col sm:gap-2">
          <Icon className="size-6 shrink-0 text-foreground" strokeWidth={1.5} />
          <p className="text-sm leading-snug text-foreground">{label}</p>
        </div>
      ))}
    </div>
  )
}

interface PropertyAboutProps {
  site: Site
}

export function PropertyAbout({ site }: PropertyAboutProps) {
  const [expanded, setExpanded] = useState(false)
  const minPrice = getSiteMinPrice(site.id)

  const fullText = `Welcome to ${site.name}, an official government guest house in ${site.city}. This campus offers ${site.buildingsCount} buildings with ${site.totalRooms} rooms for employee travel. ${site.availableRooms} rooms are currently available. Rooms include AC, attached bath, and daily housekeeping. Check-in requires a valid employee ID and booking confirmation. Transparent pricing starts from ${formatCurrency(minPrice)} per night with secure online payment and instant booking confirmation.`

  return (
    <section>
      <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
        About this guest house
      </h2>
      <p className={cn("mt-4 text-base leading-relaxed text-foreground", !expanded && "line-clamp-3")}>
        {fullText}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-sm font-semibold text-foreground underline underline-offset-4"
      >
        {expanded ? "Show less" : "Show more"}
      </button>
    </section>
  )
}

const AMENITIES = [
  { icon: Wifi, label: "Wi‑Fi" },
  { icon: DoorOpen, label: "AC rooms" },
  { icon: ShieldCheck, label: "Attached bath" },
  { icon: ShieldCheck, label: "24/7 security" },
  { icon: BadgeCheck, label: "Employee verification" },
  { icon: Building2, label: "Multiple buildings" },
]

export function PropertyAmenitiesSection() {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? AMENITIES : AMENITIES.slice(0, 6)

  return (
    <section>
      <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
        What this place offers
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {visible.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-4 text-base text-foreground">
            <Icon className="size-6 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            {label}
          </li>
        ))}
      </ul>
      {AMENITIES.length > 6 && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mt-6 rounded-lg border border-foreground px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
        >
          Show all {AMENITIES.length} amenities
        </button>
      )}
    </section>
  )
}

interface PropertyLocationSectionProps {
  site: Site
}

export function PropertyLocationSection({ site }: PropertyLocationSectionProps) {
  const directionsUrl = getMapsDirectionsUrl(site.id)

  return (
    <section>
      <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
        Where you&apos;ll be
      </h2>
      <p className="mt-1 text-base text-muted-foreground">{site.address}</p>
      <div className="property-location-map-panel mt-6 overflow-hidden rounded-xl border border-border/60">
        <div className="aspect-[16/9] min-h-[280px] sm:aspect-[21/9]">
          <PropertyLocationMap siteId={site.id} siteName={site.name} />
        </div>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Exact location provided after booking.{" "}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-foreground underline underline-offset-2"
        >
          Open in Google Maps
        </a>
      </p>
    </section>
  )
}
