import { useParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Building2, Layers } from "lucide-react"
import { fetchBuilding, fetchFloors, fetchSite } from "@/services/api"
import { BookingFlowHeader } from "@/components/employee/BookingFlowHeader"
import { EmployeeFloorCard } from "@/components/employee/EmployeeFloorCard"
import { Skeleton } from "@/components/ui/skeleton"

export function FloorViewPage() {
  const { locationId, buildingId } = useParams<{
    locationId: string
    buildingId: string
  }>()

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

  const { data: floors, isLoading } = useQuery({
    queryKey: ["floors", buildingId],
    queryFn: () => fetchFloors(buildingId!),
    enabled: !!buildingId,
  })

  const totalRooms = floors?.reduce((sum, floor) => sum + floor.totalRooms, 0) ?? 0

  return (
    <div>
      <BookingFlowHeader
        backHref={`/employee/locations/${locationId}`}
        breadcrumbs={[
          { label: site?.name ?? "Guest house", href: `/employee/locations/${locationId}` },
          { label: building?.name ?? "Building" },
          { label: "Floors" },
        ]}
        title={`${building?.name ?? "Building"} — Select a floor`}
        description={
          site && building
            ? `${site.name} · ${floors?.length ?? 0} floors · ${totalRooms} total rooms`
            : "Choose a floor to browse available rooms"
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
          <Building2 className="size-4" />
          {building?.name ?? "Building"}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
          <Layers className="size-4" />
          {floors?.length ?? 0} floors
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4">
          {floors?.map((floor) => (
            <EmployeeFloorCard
              key={floor.id}
              floor={floor}
              linkTo={`/employee/locations/${locationId}/buildings/${buildingId}/floors/${floor.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
