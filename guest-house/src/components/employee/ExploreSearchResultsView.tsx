import { useMemo, useState } from "react"
import type { Site } from "@/types"
import { ExploreMapPanel, buildMapMarkers } from "@/components/employee/ExploreMapPanel"
import { AirbnbListingCard } from "@/components/employee/AirbnbListingCard"
import { useExploreSearch } from "@/context/ExploreSearchContext"
import { buildSpreadMapListings, getStayTotalPrice } from "@/utils/siteCoordinates"
import { getListingImage } from "@/utils/entityImages"
import { Tag } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface SiteWithPrice {
  site: Site
  price: number
}

interface ExploreSearchResultsViewProps {
  destination: string
  listings: SiteWithPrice[]
  isLoading?: boolean
}

function destinationCity(destination: string) {
  return destination.split(",")[0]?.trim() ?? destination
}

const MOCK_SUBTITLES = [
  "Comfortable stay for government travel",
  "Central location · Easy check-in",
  "Quiet rooms near the city centre",
  "Spacious guest house with parking",
  "Well-maintained official accommodation",
]

export function ExploreSearchResultsView({
  destination,
  listings,
  isLoading = false,
}: ExploreSearchResultsViewProps) {
  const [hoveredListingId, setHoveredListingId] = useState<string | undefined>()
  const { nights } = useExploreSearch()

  const cityLabel = destinationCity(destination)

  const spreadListings = useMemo(
    () =>
      buildSpreadMapListings(
        listings.map(({ site, price }) => ({ id: site.id, basePrice: price }))
      ),
    [listings]
  )

  const resultItems = useMemo(
    () =>
      spreadListings
        .map((item, index) => {
          const site = listings.find((l) => l.site.id === item.siteId)?.site
          if (!site) return null
          return {
            id: item.id,
            site,
            price: item.price,
            subtitle: MOCK_SUBTITLES[index % MOCK_SUBTITLES.length],
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null),
    [spreadListings, listings]
  )

  const mapMarkers = useMemo(
    () =>
      buildMapMarkers(
        spreadListings.map((listing) => ({
          ...listing,
          price: getStayTotalPrice(listing.price, nights),
        }))
      ),
    [spreadListings, nights]
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(340px,44%)] lg:overflow-hidden">
        <div className="min-h-0 overflow-y-auto">
          <div className="px-4 py-5 sm:px-6 lg:px-10 lg:py-6">
            <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <h1 className="text-lg font-semibold text-foreground sm:text-xl">
                {isLoading ? (
                  <Skeleton className="h-7 w-56" />
                ) : (
                  <>
                    {resultItems.length} guest house{resultItems.length === 1 ? "" : "s"} in{" "}
                    {cityLabel}
                  </>
                )}
              </h1>
              {!isLoading && (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Tag className="size-3.5 fill-primary/20 text-primary" />
                  Prices include all fees
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="aspect-[20/19] w-full rounded-xl" />
                    <Skeleton className="mt-3 h-4 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-1/2" />
                    <Skeleton className="mt-2 h-4 w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                {resultItems.map(({ id, site, price, subtitle }) => (
                  <div
                    key={id}
                    className={cn(
                      "rounded-xl transition-opacity duration-150",
                      hoveredListingId && hoveredListingId !== id && "opacity-60"
                    )}
                    onMouseEnter={() => setHoveredListingId(id)}
                    onMouseLeave={() => setHoveredListingId(undefined)}
                  >
                    <AirbnbListingCard
                      variant="results"
                      site={site}
                      pricePerNight={price}
                      image={getListingImage(id)}
                      imageKey={id}
                      linkTo={`/employee/locations/${site.id}`}
                      guestFavorite={site.rating >= 4.6}
                      subtitle={subtitle}
                      nights={nights}
                      reviewCount={Math.round(site.rating * 8 + 12)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative hidden min-h-0 border-l border-border/60 lg:block">
          <ExploreMapPanel
            markers={mapMarkers}
            activeId={hoveredListingId}
            onMarkerHover={setHoveredListingId}
            className="sticky top-[var(--explore-header-offset)] h-[calc(100svh-var(--explore-header-offset))]"
          />
        </div>
      </div>

      <div className="relative min-h-[240px] shrink-0 border-t border-border/60 lg:hidden">
        <ExploreMapPanel
          markers={mapMarkers}
          activeId={hoveredListingId}
          onMarkerHover={setHoveredListingId}
          className="h-[240px] sm:h-[320px]"
        />
      </div>
    </div>
  )
}
