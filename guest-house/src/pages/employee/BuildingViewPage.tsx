import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { fetchSite, fetchBuildings } from "@/services/api"
import { PropertyListingHeader } from "@/components/employee/PropertyListingHeader"
import { PropertyPhotoGallery } from "@/components/employee/PropertyPhotoGallery"
import {
  PropertyAbout,
  PropertyAmenitiesSection,
  PropertyHighlightsRow,
  PropertyHostBanner,
  PropertyListingMeta,
  PropertyLocationSection,
  PropertySectionDivider,
} from "@/components/employee/PropertyListingSections"
import { SiteDetailSidebar } from "@/components/employee/SiteDetailSidebar"
import { EmployeeBuildingCard } from "@/components/employee/EmployeeBuildingCard"
import { getSiteGalleryImages } from "@/utils/entityImages"
import { Skeleton } from "@/components/ui/skeleton"

export function BuildingViewPage() {
  const { locationId } = useParams<{ locationId: string }>()

  const { data: site, isLoading: siteLoading } = useQuery({
    queryKey: ["site", locationId],
    queryFn: () => fetchSite(locationId!),
    enabled: !!locationId,
  })

  const { data: buildings, isLoading: buildingsLoading } = useQuery({
    queryKey: ["buildings", locationId],
    queryFn: () => fetchBuildings(locationId!),
    enabled: !!locationId,
  })

  const galleryImages = site ? getSiteGalleryImages(site.id) : []

  return (
    <div className="property-listing-page mx-auto w-full max-w-[1120px] pb-16 pt-2 sm:pb-20">
      {siteLoading ? (
        <>
          <Skeleton className="mb-5 h-9 w-2/3 max-w-lg" />
          <Skeleton className="mb-6 h-[min(56vh,420px)] w-full rounded-xl" />
        </>
      ) : site ? (
        <>
          <PropertyListingHeader title={site.name} />
          <PropertyPhotoGallery images={galleryImages} title={site.name} className="mb-6" />
          <PropertyListingMeta site={site} />
        </>
      ) : null}

      <div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-20 lg:mt-10">
        <div className="min-w-0 space-y-10">
          {site && (
            <>
              <PropertyHostBanner />
              <PropertySectionDivider />
              <PropertyHighlightsRow />
              <PropertySectionDivider />
              <PropertyAbout site={site} />
              <PropertySectionDivider />

              <section>
                <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
                  Choose a building
                </h2>
                <p className="mt-2 text-base text-muted-foreground">
                  Select a block to browse floors and book an available room
                </p>

                {buildingsLoading ? (
                  <div className="mt-6 space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {buildings?.map((building) => (
                      <EmployeeBuildingCard
                        key={building.id}
                        building={building}
                        linkTo={`/employee/locations/${locationId}/buildings/${building.id}`}
                        variant="list"
                      />
                    ))}
                  </div>
                )}
              </section>

              <PropertySectionDivider />
              <PropertyAmenitiesSection />
              <PropertySectionDivider />
              <PropertyLocationSection site={site} />
            </>
          )}
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-[calc(var(--explore-header-offset)+2rem)]">
            <SiteDetailSidebar />
          </div>
        </aside>
      </div>

      {site && (
        <div className="mt-10 lg:hidden">
          <SiteDetailSidebar />
        </div>
      )}
    </div>
  )
}
