import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchSites, getSiteMinPrice } from "@/services/api"
import { ExploreSearchResultsView } from "@/components/employee/ExploreSearchResultsView"
import { PopularHomesCarousel } from "@/components/employee/PopularHomesCarousel"
import { useExploreSearch } from "@/context/ExploreSearchContext"
import { Skeleton } from "@/components/ui/skeleton"

function destinationCity(destination: string) {
  return destination.split(",")[0]?.trim() ?? ""
}

function siteMatchesDestination(destination: string, city: string) {
  const destCity = destinationCity(destination)
  if (!destCity || destCity === "Nearby" || destCity === "Nandi Hills") return true
  return city.toLowerCase() === destCity.toLowerCase()
}

export function EmployeeExploreView() {
  const { searchSubmitted, destination } = useExploreSearch()
  const { data: sites, isLoading } = useQuery({
    queryKey: ["sites"],
    queryFn: fetchSites,
  })

  const sitesWithPrice = useMemo(
    () =>
      (sites ?? []).map((site) => ({
        site,
        price: getSiteMinPrice(site.id),
      })),
    [sites]
  )

  const filteredSites = useMemo(() => {
    if (!searchSubmitted || !destination) return sitesWithPrice
    return sitesWithPrice.filter(({ site }) => siteMatchesDestination(destination, site.city))
  }, [sitesWithPrice, searchSubmitted, destination])

  const popularListings = useMemo(
    () => [...sitesWithPrice].sort((a, b) => b.site.rating - a.site.rating),
    [sitesWithPrice]
  )

  const weekendListings = useMemo(
    () => [...sitesWithPrice].sort((a, b) => a.price - b.price),
    [sitesWithPrice]
  )

  const southListings = useMemo(
    () => sitesWithPrice.filter((s) => ["Bengaluru", "Mysuru", "Mangaluru"].includes(s.site.city)),
    [sitesWithPrice]
  )

  if (searchSubmitted) {
    return (
      <ExploreSearchResultsView
        destination={destination}
        listings={filteredSites}
        isLoading={isLoading}
      />
    )
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <div className="space-y-10 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        {isLoading ? (
          <>
            <Skeleton className="h-7 w-72" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-[280px] shrink-0">
                  <Skeleton className="aspect-[20/19] w-full rounded-xl" />
                  <Skeleton className="mt-3 h-4 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <PopularHomesCarousel
              title="Popular guest houses in Bengaluru"
              listings={popularListings}
            />
            <PopularHomesCarousel
              title="Available this weekend"
              listings={weekendListings}
            />
            {southListings.length > 0 && (
              <PopularHomesCarousel
                title="Popular across Karnataka"
                listings={southListings}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
