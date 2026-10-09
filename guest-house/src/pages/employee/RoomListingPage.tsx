import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { DoorOpen, Layers } from "lucide-react"
import {
  fetchBuilding,
  fetchFloors,
  fetchRooms,
  fetchSite,
} from "@/services/api"
import { BookingFlowHeader } from "@/components/employee/BookingFlowHeader"
import { EmployeeRoomCard } from "@/components/employee/EmployeeRoomCard"
import { useExploreSearch } from "@/context/ExploreSearchContext"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

type RoomFilter = "all" | "available"

export function RoomListingPage() {
  const { locationId, buildingId, floorId } = useParams<{
    locationId: string
    buildingId: string
    floorId: string
  }>()
  const [filter, setFilter] = useState<RoomFilter>("all")
  const { nights, dateRange, guests } = useExploreSearch()

  const { data: site } = useQuery({
    queryKey: ["site", locationId],
    queryFn: () => fetchSite(locationId!),
    enabled: !!locationId,
  })

  const { data: building } = useQuery({
    queryKey: ["building", buildingId],
    queryFn: () => fetchBuilding(buildingId!),
    enabled: !!buildingId,
  })

  const { data: floors } = useQuery({
    queryKey: ["floors", buildingId],
    queryFn: () => fetchFloors(buildingId!),
    enabled: !!buildingId,
  })

  const { data: rooms, isLoading } = useQuery({
    queryKey: ["rooms", floorId],
    queryFn: () => fetchRooms(floorId!),
    enabled: !!floorId,
  })

  const floor = floors?.find((f) => f.id === floorId)

  const filteredRooms = useMemo(() => {
    const list = rooms ?? []
    if (filter === "available") return list.filter((room) => room.available)
    return list
  }, [rooms, filter])

  const availableCount = rooms?.filter((room) => room.available).length ?? 0

  const buildBookingLink = useMemo(() => {
    return (roomId: string) => {
      const params = new URLSearchParams({
        site: locationId!,
        building: buildingId!,
      })
      if (dateRange?.from) params.set("checkIn", format(dateRange.from, "yyyy-MM-dd"))
      if (dateRange?.to) params.set("checkOut", format(dateRange.to, "yyyy-MM-dd"))
      if (guests >= 1) params.set("guests", String(guests))
      return `/employee/booking/${roomId}?${params.toString()}`
    }
  }, [locationId, buildingId, dateRange?.from, dateRange?.to, guests])

  const breadcrumbs = [
    { label: site?.name ?? "Guest house", href: `/employee/locations/${locationId}` },
    {
      label: building?.name ?? "Building",
      href: `/employee/locations/${locationId}/buildings/${buildingId}`,
    },
    { label: floor?.name ?? "Floor" },
    { label: "Rooms" },
  ]

  return (
    <div>
      <BookingFlowHeader
        backHref={`/employee/locations/${locationId}/buildings/${buildingId}`}
        breadcrumbs={breadcrumbs}
        title={`${floor?.name ?? "Floor"} — Choose a room`}
        description={
          site && building
            ? `${site.name} · ${building.name} · ${availableCount} of ${rooms?.length ?? 0} rooms available`
            : "Select an available room to continue your booking"
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
          <Layers className="size-4" />
          {floor?.name ?? "Floor"}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
          <DoorOpen className="size-4" />
          {availableCount} available
        </div>

        <div className="ml-auto flex gap-2">
          {(["all", "available"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                filter === value
                  ? "border-foreground bg-foreground text-background"
                  : "border-border/80 bg-card text-foreground hover:border-foreground/40"
              )}
            >
              {value === "all" ? "All rooms" : "Available only"}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border/60">
              <Skeleton className="aspect-[5/3] w-full" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-6 py-16 text-center">
          <p className="text-lg font-semibold text-foreground">No rooms match this filter</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try showing all rooms or pick another floor.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filteredRooms.map((room) => (
            <EmployeeRoomCard
              key={room.id}
              room={room}
              nights={nights}
              linkTo={buildBookingLink(room.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
