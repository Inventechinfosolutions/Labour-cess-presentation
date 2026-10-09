import { ChevronRight } from "lucide-react"
import type { Site } from "@/types"
import { AirbnbListingCard } from "@/components/employee/AirbnbListingCard"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { getSiteListingImage } from "@/utils/entityImages"
import { cn } from "@/lib/utils"

interface ListingItem {
  site: Site
  price: number
}

interface PopularHomesCarouselProps {
  title: string
  listings: ListingItem[]
  onHover?: (siteId: string | undefined) => void
  className?: string
}

export function PopularHomesCarousel({
  title,
  listings,
  onHover,
  className,
}: PopularHomesCarouselProps) {
  return (
    <section className={cn("relative", className)}>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-[22px]">
          {title}
        </h2>
        <ChevronRight className="size-5 text-foreground" strokeWidth={2.25} />
      </div>

      <Carousel
        opts={{ align: "start", dragFree: true }}
        className="relative w-full"
      >
        <CarouselContent className="-ml-3 md:-ml-4">
          {listings.map(({ site, price }) => (
            <CarouselItem
              key={`${title}-${site.id}`}
              className="basis-[72%] pl-3 sm:basis-[48%] md:basis-[38%] md:pl-4 lg:basis-[32%] xl:basis-[28%]"
              onMouseEnter={() => onHover?.(site.id)}
              onMouseLeave={() => onHover?.(undefined)}
            >
              <AirbnbListingCard
                variant="carousel"
                site={site}
                pricePerNight={price}
                image={getSiteListingImage(site.id)}
                imageKey={`${title}-${site.id}`}
                linkTo={`/employee/locations/${site.id}`}
                guestFavorite={site.rating >= 4.6}
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious
          className="absolute -top-12 right-12 size-8 border-border/80 bg-card shadow-sm disabled:opacity-35"
          variant="outline"
        />
        <CarouselNext
          className="absolute -top-12 right-0 size-8 border-border/80 bg-card shadow-sm disabled:opacity-35"
          variant="outline"
        />
      </Carousel>
    </section>
  )
}
