import { Link } from "react-router-dom"
import { ArrowRight, Heart, Star } from "lucide-react"
import { sites } from "@/mock-data/sites"

const HIGHLIGHTS = [
  "Real photos and availability for every location",
  "Filter by city, dates, and room type in seconds",
  "Book, pay, and get your QR access — all in one place",
]

function ListingPreviewCard({ siteIndex }: { siteIndex: number }) {
  const site = sites[siteIndex]
  if (!site) return null

  return (
    <div className="preview-card overflow-hidden rounded-xl border border-border/40 bg-white shadow-sm">
      <div className="relative aspect-[5/4] overflow-hidden bg-muted">
        <img src={site.image} alt={site.name} className="size-full object-cover" />
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm"
        >
          <Heart className="size-3.5 fill-white/90 text-white" />
        </button>
        {siteIndex === 0 && (
          <span className="absolute left-2.5 top-2.5 rounded-md bg-white px-2 py-0.5 text-[10px] font-semibold text-[#222222] shadow-sm">
            Popular
          </span>
        )}
      </div>
      <div className="space-y-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 text-sm font-semibold text-[#222222]">{site.city}</p>
          <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-[#222222]">
            <Star className="size-3 fill-[#222222]" />
            {site.rating}
          </span>
        </div>
        <p className="line-clamp-1 text-xs text-[#717171]">{site.name}</p>
        <p className="pt-0.5 text-sm text-[#222222]">
          <span className="font-semibold">₹1,200</span>
          <span className="text-[#717171]"> / night</span>
        </p>
      </div>
    </div>
  )
}

export function LandingAppPreview() {
  return (
    <section className="border-t border-border/50 bg-[#f7f7f7] py-20 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          <div className="preview-header max-w-lg">
            <p className="text-sm font-medium text-primary">Employee experience</p>
            <h2 className="mt-3 text-[2rem] font-semibold leading-[1.12] tracking-[-0.02em] text-[#222222] sm:text-[2.75rem]">
              Browse guest houses like you&apos;re used to
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#717171] sm:text-[17px]">
              A familiar, Airbnb-style flow — search destinations, compare locations,
              and confirm your stay without paperwork or phone calls.
            </p>

            <ul className="mt-8 space-y-4">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-[#484848]">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              to="/login"
              className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#222222] underline underline-offset-4 transition hover:text-primary"
            >
              Try the employee portal
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="preview-showcase relative mx-auto w-full max-w-[520px] lg:max-w-none">
            <div className="overflow-hidden rounded-[1.75rem] border border-border/50 bg-white shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-2 border-b border-border/50 bg-[#fafafa] px-4 py-3">
                <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                <span className="size-2.5 rounded-full bg-[#febc2e]" />
                <span className="size-2.5 rounded-full bg-[#28c840]" />
                <div className="mx-auto flex h-7 min-w-0 max-w-[220px] flex-1 items-center justify-center rounded-md bg-white px-3 text-[11px] text-[#717171] sm:max-w-none">
                  govguesthouse.gov.in/employee
                </div>
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#222222]">Homes in Bengaluru</p>
                    <p className="text-xs text-[#717171]">12 guest houses · 45 rooms available</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-[#222222] px-3 py-1.5 text-[11px] font-medium text-white">
                    Map
                  </span>
                </div>

                <div className="preview-phones grid grid-cols-2 gap-3">
                  <ListingPreviewCard siteIndex={0} />
                  <ListingPreviewCard siteIndex={2} />
                </div>

                <div className="preview-phone rounded-xl border border-dashed border-border/60 bg-[#fafafa] px-4 py-3 text-center">
                  <p className="text-xs text-[#717171]">
                    Scroll to explore Mysuru, Belagavi, Mangaluru & more
                  </p>
                </div>
              </div>
            </div>

            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-6 -right-4 -z-10 size-32 rounded-full bg-primary/10 blur-2xl sm:size-40"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
