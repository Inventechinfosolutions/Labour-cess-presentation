import { Link } from "react-router-dom"
import { ArrowRight, Heart, MapPin, Star } from "lucide-react"
import { sites } from "@/mock-data/sites"
import { formatCurrency } from "@/utils/format"

const NIGHTLY_FROM = 1200

function LocationCard({
  site,
  guestFavorite = false,
}: {
  site: (typeof sites)[number]
  guestFavorite?: boolean
}) {
  return (
    <Link
      to="/login"
      className="location-item group block min-w-[260px] snap-start sm:min-w-0"
    >
      <div className="relative aspect-[20/19] overflow-hidden rounded-xl bg-muted">
        <img
          src={site.image}
          alt={site.name}
          className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {guestFavorite && (
          <span className="absolute left-3 top-3 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-[#222222] shadow-sm">
            Guest favorite
          </span>
        )}
        <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full">
          <Heart className="size-[22px] fill-black/40 text-white drop-shadow-md transition group-hover:scale-110" />
        </span>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[15px] font-semibold text-[#222222]">{site.city}</h3>
          <span className="flex shrink-0 items-center gap-0.5 text-sm text-[#222222]">
            <Star className="size-3.5 fill-[#222222]" />
            {site.rating}
          </span>
        </div>
        <p className="line-clamp-1 text-sm text-[#717171]">{site.name}</p>
        <p className="line-clamp-1 text-sm text-[#717171]">
          {site.availableRooms} rooms available · {site.buildingsCount} buildings
        </p>
        <p className="pt-0.5 text-[15px] text-[#222222]">
          <span className="font-semibold">{formatCurrency(NIGHTLY_FROM)}</span>
          <span className="text-[#717171]"> / night</span>
        </p>
      </div>
    </Link>
  )
}

export function LandingLocations() {
  return (
    <section id="locations" className="border-t border-border/50 bg-[#f7f7f7] py-20 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-12">
        <div className="location-header flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white px-4 py-2">
              <MapPin className="size-4 text-primary" strokeWidth={2.25} />
              <span className="text-sm font-medium text-[#222222]">Popular destinations</span>
            </div>
            <h2 className="mt-5 text-[2rem] font-semibold leading-[1.12] tracking-[-0.02em] text-[#222222] sm:text-[2.75rem]">
              Explore guest houses near you
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#717171] sm:text-[17px]">
              Official government accommodation across Karnataka —
              with live availability and transparent rates.
            </p>
          </div>

          <Link
            to="/login"
            className="hidden shrink-0 items-center gap-2 rounded-full border border-[#222222] px-5 py-3 text-sm font-semibold text-[#222222] transition hover:bg-[#222222] hover:text-white sm:inline-flex"
          >
            Show all locations
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="location-grid mt-12 flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {sites.map((site, index) => (
            <LocationCard key={site.id} site={site} guestFavorite={index === 0} />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#222222] underline underline-offset-4"
          >
            Show all locations
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
