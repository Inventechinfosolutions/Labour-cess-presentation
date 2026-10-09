import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { BedDouble, Check, ShieldCheck } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useExploreSearch } from "@/context/ExploreSearchContext"
import { fetchBuilding, fetchFloors, fetchRoom, fetchSite } from "@/services/api"
import { BookingFlowHeader } from "@/components/employee/BookingFlowHeader"
import { BookingPriceWidget, BookingStayPicker } from "@/components/employee/BookingCheckout"
import { PropertySectionDivider } from "@/components/employee/PropertyListingSections"
import { PropertyPhotoGallery } from "@/components/employee/PropertyPhotoGallery"
import { getBookingImage, getSiteGalleryImages } from "@/utils/entityImages"
import {
  calculateBookingTotal,
  calculateNights,
  formatCurrency,
} from "@/utils/format"
import { resolveTripDetails } from "@/utils/bookingTrip"
import { Skeleton } from "@/components/ui/skeleton"

export function BookingPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const [searchParams] = useSearchParams()
  const siteId = searchParams.get("site") ?? ""
  const buildingId = searchParams.get("building") ?? ""
  const navigate = useNavigate()
  const { setBookingDraft } = useAuth()
  const { dateRange, guests: searchGuests } = useExploreSearch()

  const [checkIn, setCheckIn] = useState<Date | undefined>()
  const [checkOut, setCheckOut] = useState<Date | undefined>()
  const [guests, setGuests] = useState("1")
  const initializedForRoom = useRef<string | null>(null)

  const { data: room, isLoading } = useQuery({
    queryKey: ["room", roomId],
    queryFn: () => fetchRoom(roomId!),
    enabled: !!roomId,
  })

  const resolvedSiteId = siteId || room?.siteId || ""
  const resolvedBuildingId = buildingId || room?.buildingId || ""
  const floorId = room?.floorId ?? ""

  const { data: site } = useQuery({
    queryKey: ["site", resolvedSiteId],
    queryFn: () => fetchSite(resolvedSiteId),
    enabled: !!resolvedSiteId,
  })

  const { data: building } = useQuery({
    queryKey: ["building", resolvedBuildingId],
    queryFn: () => fetchBuilding(resolvedBuildingId),
    enabled: !!resolvedBuildingId,
  })

  const { data: floors } = useQuery({
    queryKey: ["floors", resolvedBuildingId],
    queryFn: () => fetchFloors(resolvedBuildingId),
    enabled: !!resolvedBuildingId,
  })

  const floor = floors?.find((f) => f.id === floorId)
  const imageSrc = room ? getBookingImage(room.id) : ""

  const galleryImages = useMemo(() => {
    if (!room) return []
    const siteGallery = resolvedSiteId ? getSiteGalleryImages(resolvedSiteId) : []
    return [imageSrc, ...siteGallery.filter((img) => img !== imageSrc)].slice(0, 5)
  }, [room, resolvedSiteId, imageSrc])

  useEffect(() => {
    initializedForRoom.current = null
  }, [roomId])

  useEffect(() => {
    if (!room || initializedForRoom.current === room.id) return
    const trip = resolveTripDetails(searchParams, dateRange, searchGuests, room.capacity)
    setCheckIn(trip.checkIn)
    setCheckOut(trip.checkOut)
    setGuests(trip.guests)
    initializedForRoom.current = room.id
  }, [room, dateRange, searchGuests, searchParams])

  const hasSelectedDates = Boolean(checkIn && checkOut)

  const nights =
    checkIn && checkOut
      ? calculateNights(format(checkIn, "yyyy-MM-dd"), format(checkOut, "yyyy-MM-dd"))
      : 0

  const totals =
    room && nights > 0
      ? calculateBookingTotal(room.price, nights, parseInt(guests))
      : null

  const backHref = useMemo(() => {
    if (resolvedSiteId && resolvedBuildingId && floorId) {
      return `/employee/locations/${resolvedSiteId}/buildings/${resolvedBuildingId}/floors/${floorId}`
    }
    if (resolvedSiteId && resolvedBuildingId) {
      return `/employee/locations/${resolvedSiteId}/buildings/${resolvedBuildingId}`
    }
    return `/employee/locations/${resolvedSiteId || ""}`
  }, [resolvedSiteId, resolvedBuildingId, floorId])

  const breadcrumbs = [
    { label: site?.name ?? "Guest house", href: `/employee/locations/${resolvedSiteId}` },
    {
      label: building?.name ?? "Building",
      href: `/employee/locations/${resolvedSiteId}/buildings/${resolvedBuildingId}`,
    },
    {
      label: floor?.name ?? "Floor",
      href: floorId
        ? `/employee/locations/${resolvedSiteId}/buildings/${resolvedBuildingId}/floors/${floorId}`
        : undefined,
    },
    { label: `Room ${room?.number ?? ""}` },
  ]

  const handleProceed = () => {
    if (!room || !checkIn || !checkOut || !totals) return
    setBookingDraft({
      roomId: room.id,
      siteId: resolvedSiteId,
      buildingId: resolvedBuildingId,
      checkIn: format(checkIn, "yyyy-MM-dd"),
      checkOut: format(checkOut, "yyyy-MM-dd"),
      guests: parseInt(guests),
      roomCharges: totals.roomCharges,
      taxes: totals.taxes,
      totalAmount: totals.total,
    })
    navigate("/employee/payment")
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-[1120px] space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[280px] w-full rounded-xl" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="mx-auto w-full max-w-[1120px] py-16 text-center">
        <p className="text-lg font-semibold text-foreground">Room not found</p>
      </div>
    )
  }

  return (
    <div className="property-listing-page mx-auto w-full max-w-[1120px] pb-16 pt-2 sm:pb-20">
      <BookingFlowHeader
        backHref={backHref}
        breadcrumbs={breadcrumbs}
        title={`Reserve Room ${room.number}`}
        description={`${room.type} · Sleeps ${room.capacity} · ${site?.name ?? "Government guest house"}`}
      />

      <PropertyPhotoGallery
        images={galleryImages}
        title={`Room ${room.number} · ${site?.name ?? "Guest house"}`}
        className="mb-6 sm:mb-8"
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16">
        <div className="min-w-0 space-y-10">
          <section>
            <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
              Your trip
            </h2>
            <p className="mt-2 text-base text-muted-foreground">
              {hasSelectedDates
                ? "Your dates and guests are shown below. You can change them before booking."
                : "Select check-in, check-out, and number of guests for this room."}
            </p>
            <div className="mt-6">
              <BookingStayPicker
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
                maxGuests={room.capacity}
                onCheckInChange={setCheckIn}
                onCheckOutChange={setCheckOut}
                onGuestsChange={setGuests}
              />
            </div>
          </section>

          <PropertySectionDivider />

          <section>
            <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
              About this room
            </h2>
            <div className="mt-4 flex items-start gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
                <BedDouble className="size-6 text-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">
                  {room.type} · Sleeps {room.capacity}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Government employee rate at {formatCurrency(room.price)} per night.
                  Includes standard amenities and verified employee check-in.
                </p>
              </div>
            </div>
          </section>

          <PropertySectionDivider />

          <section>
            <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
              What this room offers
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {room.amenities.map((amenity) => (
                <li key={amenity} className="flex items-center gap-4 text-base text-foreground">
                  <Check className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                  {amenity}
                </li>
              ))}
              <li className="flex items-center gap-4 text-base text-foreground">
                <ShieldCheck className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                Employee ID required at check-in
              </li>
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--explore-header-offset)+2rem)] lg:self-start">
          <BookingPriceWidget
            roomNumber={room.number}
            roomType={room.type}
            siteName={site?.name ?? "Guest house"}
            imageSrc={imageSrc}
            pricePerNight={room.price}
            nights={nights}
            roomCharges={totals?.roomCharges ?? null}
            taxes={totals?.taxes ?? null}
            total={totals?.total ?? null}
            canProceed={Boolean(checkIn && checkOut && totals)}
            onProceed={handleProceed}
          />
        </aside>
      </div>

      {totals && (
        <div className="fixed bottom-[4.25rem] left-0 right-0 z-40 border-t border-border/80 bg-card px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden">
          <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4">
            <div>
              <p className="text-base font-semibold text-foreground">{formatCurrency(totals.total)}</p>
              <p className="text-xs text-muted-foreground">
                {nights === 1 ? "1 night" : `${nights} nights`} · {guests} guest{parseInt(guests) > 1 ? "s" : ""}
              </p>
            </div>
            <button
              type="button"
              disabled={!checkIn || !checkOut}
              onClick={handleProceed}
              className="explore-search-btn shrink-0 rounded-lg px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              Proceed
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
