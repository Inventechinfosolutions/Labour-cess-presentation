import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Heart, Star } from "lucide-react"
import type { Site } from "@/types"
import { getListingImage, getSiteListingImage } from "@/utils/entityImages"
import { cn } from "@/lib/utils"

interface AirbnbListingCardProps {
  site: Site
  pricePerNight: number
  linkTo: string
  image?: string
  imageKey?: string
  guestFavorite?: boolean
  subtitle?: string
  variant?: "grid" | "carousel" | "results"
  nights?: number
  reviewCount?: number
}

export function AirbnbListingCard({
  site,
  pricePerNight,
  linkTo,
  image,
  imageKey,
  guestFavorite = false,
  subtitle,
  variant = "grid",
  nights = 2,
  reviewCount,
}: AirbnbListingCardProps) {
  const reviews = reviewCount ?? Math.round(site.rating * 10)
  const nightsLabel = nights === 1 ? "1 night" : `${nights} nights`
  const [saved, setSaved] = useState(false)
  const fallbackKey = imageKey ?? site.id
  const primaryImage = image ?? getSiteListingImage(site.id)

  const [imageSrc, setImageSrc] = useState(primaryImage)

  useEffect(() => {
    setImageSrc(primaryImage)
  }, [primaryImage])

  const handleImageError = () => {
    setImageSrc(getListingImage(fallbackKey))
  }

  return (
    <article className="group">
      <Link to={linkTo} className="block">
        <div className="relative aspect-[20/19] overflow-hidden rounded-xl bg-muted">
          <img
            src={imageSrc}
            alt={site.name}
            loading="lazy"
            onError={handleImageError}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          {guestFavorite && (
            <span className="absolute left-3 top-3 rounded-md bg-card/95 px-2 py-1 text-xs font-semibold text-foreground shadow-sm">
              Guest favorite
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setSaved((v) => !v)
            }}
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full transition-transform hover:scale-110"
            aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          >
            <Heart
              className={cn(
                "size-[22px] drop-shadow-md transition-colors",
                saved ? "fill-primary text-primary" : "fill-black/50 text-white"
              )}
            />
          </button>
        </div>

        <div className="mt-3 space-y-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[15px] font-semibold text-foreground">
              Guest house in {site.city}
            </h3>
            <div className="flex shrink-0 items-center gap-1 text-sm">
              <Star className="size-3.5 fill-foreground text-foreground" />
              <span>
                {site.rating.toFixed(1)}
                {variant === "results" && (
                  <span className="text-muted-foreground"> ({reviews})</span>
                )}
              </span>
            </div>
          </div>
          {variant === "carousel" ? (
            <p className="text-[15px] text-foreground">
              <span className="font-semibold">
                ₹{(pricePerNight * nights).toLocaleString("en-IN")}
              </span>
              <span className="font-normal"> for {nightsLabel}</span>
            </p>
          ) : variant === "results" ? (
            <>
              <p className="truncate text-sm text-muted-foreground">
                {subtitle ?? site.name}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {site.availableRooms} rooms available · Government guest house
              </p>
              <p className="pt-0.5 text-[15px] text-foreground">
                <span className="font-semibold">
                  ₹{(pricePerNight * nights).toLocaleString("en-IN")}
                </span>
                <span className="font-normal"> for {nightsLabel}</span>
              </p>
            </>
          ) : (
            <>
              <p className="truncate text-sm text-muted-foreground">
                {subtitle ?? `${site.availableRooms} rooms available`}
              </p>
              <p className="truncate text-sm text-muted-foreground">{site.name}</p>
              <p className="pt-0.5 text-[15px]">
                <span className="font-semibold">₹{pricePerNight.toLocaleString("en-IN")}</span>
                <span className="font-normal text-foreground"> night</span>
              </p>
            </>
          )}
        </div>
      </Link>
    </article>
  )
}
