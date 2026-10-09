import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { BedDouble, Plus } from "lucide-react"
import {
  createAdminRoom,
  fetchAdminBuildings,
  fetchAdminFloors,
  fetchAdminRooms,
  fetchAdminSites,
} from "@/services/adminApi"
import { AdminCardGrid } from "@/components/admin/AdminCardGrid"
import { AdminListToolbar } from "@/components/admin/AdminListToolbar"
import { AdminListView } from "@/components/admin/AdminListView"
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge"
import { DataTable } from "@/components/admin/DataTable"
import {
  AdminFormSection,
  AdminSheetContent,
  AdminSheetShell,
  AdminSheetSubmitButton,
  adminFieldInputClass,
  adminFieldSelectClass,
} from "@/components/admin/AdminSheetPanel"
import { RoomImageUpload } from "@/components/admin/RoomImageUpload"
import { ExportMenu } from "@/components/admin/ExportMenu"
import { RoomEntityCard } from "@/components/cards/admin/AdminEntityCards"
import { useViewMode } from "@/hooks/useViewMode"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Sheet } from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AMENITIES, ROOM_TYPE_DEFAULTS, ROOM_TYPES } from "@/types/admin"
import { formatCurrency } from "@/utils/format"
import { toast } from "sonner"
import { usePageTransition } from "@/hooks/useGsap"
import type { AdminRoom } from "@/types/admin"

type RoomFormData = {
  siteId: string
  buildingId: string
  floorId: string
  number: string
  name: string
  type: string
  capacity: string
  price: string
  sqFt: string
}

const EMPTY_ROOM_FORM: RoomFormData = {
  siteId: "",
  buildingId: "",
  floorId: "",
  number: "",
  name: "",
  type: "",
  capacity: "",
  price: "",
  sqFt: "",
}

const DEMO_ROOM_AMENITIES = ["AC", "TV", "WiFi", "Hot Water", "Workspace"] as const

const ROOM_FORM_FIELDS: { label: string; key: keyof Omit<RoomFormData, "siteId" | "buildingId" | "floorId"> }[] = [
  { label: "Room Number", key: "number" },
  { label: "Room Name", key: "name" },
  { label: "Room Type", key: "type" },
  { label: "Capacity", key: "capacity" },
  { label: "Price", key: "price" },
  { label: "Area (sq ft)", key: "sqFt" },
]

export function RoomManagementPage() {
  const pageRef = usePageTransition()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [createOpen, setCreateOpen] = useState(false)
  const [roomForm, setRoomForm] = useState<RoomFormData>(EMPTY_ROOM_FORM)
  const [amenities, setAmenities] = useState<string[]>([])
  const [roomImage, setRoomImage] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [viewMode, setViewMode] = useViewMode("admin-rooms-view")

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-rooms", page, search, status],
    queryFn: () =>
      fetchAdminRooms({
        page,
        pageSize: 20,
        search,
        status: status === "all" ? undefined : status,
      }),
  })

  const { data: sitesResult } = useQuery({
    queryKey: ["admin-sites", "room-form"],
    queryFn: () => fetchAdminSites({ pageSize: 100 }),
    enabled: createOpen,
  })

  const { data: buildingsResult } = useQuery({
    queryKey: ["admin-buildings", "room-form", roomForm.siteId],
    queryFn: () => fetchAdminBuildings({ siteId: roomForm.siteId, pageSize: 100 }),
    enabled: createOpen && !!roomForm.siteId,
  })

  const { data: floorsResult } = useQuery({
    queryKey: ["admin-floors", "room-form", roomForm.siteId, roomForm.buildingId],
    queryFn: () =>
      fetchAdminFloors({
        siteId: roomForm.siteId,
        buildingId: roomForm.buildingId,
        pageSize: 100,
      }),
    enabled: createOpen && !!roomForm.siteId && !!roomForm.buildingId,
  })

  const sites = sitesResult?.data ?? []
  const buildings = buildingsResult?.data ?? []
  const floors = floorsResult?.data ?? []

  const handleCreateOpenChange = (open: boolean) => {
    setCreateOpen(open)
    if (!open) {
      setRoomForm(EMPTY_ROOM_FORM)
      setAmenities([])
      setRoomImage("")
    }
  }

  const fillDemoRoomForm = () => {
    const site = sites[0]
    const building = buildings.find((b) => b.siteId === site?.id) ?? buildings[0]
    const floor = floors.find((f) => f.buildingId === building?.id) ?? floors[0]
    const defaults = ROOM_TYPE_DEFAULTS.Deluxe

    setRoomForm({
      siteId: site?.id ?? "",
      buildingId: building?.id ?? "",
      floorId: floor?.id ?? "",
      number: "101",
      name: "Deluxe 101",
      type: "Deluxe",
      capacity: String(defaults.capacity),
      price: String(defaults.price),
      sqFt: String(defaults.sqFt),
    })
    setAmenities([...DEMO_ROOM_AMENITIES])
    setRoomImage(defaults.image)
  }

  const handleCreateRoom = async () => {
    if (!roomForm.siteId || !roomForm.buildingId || !roomForm.floorId) {
      toast.error("Please select site, building, and floor")
      return
    }

    setIsCreating(true)
    try {
      await createAdminRoom({
        number: roomForm.number,
        name: roomForm.name,
        type: roomForm.type,
        siteId: roomForm.siteId,
        buildingId: roomForm.buildingId,
        floorId: roomForm.floorId,
        capacity: roomForm.capacity,
        price: roomForm.price,
        sqFt: roomForm.sqFt,
        amenities,
        image: roomImage,
      })
      await queryClient.invalidateQueries({ queryKey: ["admin-rooms"] })
      await queryClient.invalidateQueries({ queryKey: ["admin-floors"] })
      await queryClient.invalidateQueries({ queryKey: ["admin-buildings"] })
      await queryClient.invalidateQueries({ queryKey: ["admin-sites"] })
      toast.success("Room created successfully")
      handleCreateOpenChange(false)
      setPage(1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create room")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Rooms"
        description={`${result?.total.toLocaleString("en-IN") ?? "—"} rooms across all sites`}
        action={
          <div className="flex gap-2">
            <ExportMenu />
            <Button size="sm" className="rounded-full px-5" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Add room
            </Button>
          </div>
        }
      />

      <Sheet open={createOpen} onOpenChange={handleCreateOpenChange}>
        <AdminSheetContent size="lg">
          <AdminSheetShell
            icon={BedDouble}
            title="Add room"
            description="Set up a new room with photos, pricing, and amenities."
            headerAction={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={fillDemoRoomForm}
              >
                Demo
              </Button>
            }
            footer={
              <AdminSheetSubmitButton
                disabled={isCreating || !roomForm.siteId || !roomForm.buildingId || !roomForm.floorId}
                loading={isCreating}
                onClick={handleCreateRoom}
              >
                {isCreating ? "Saving..." : "Save room"}
              </AdminSheetSubmitButton>
            }
          >
            <div className="space-y-5">
              <AdminFormSection title="Location">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Site</Label>
                    <Select
                      value={roomForm.siteId || undefined}
                      onValueChange={(value) =>
                        setRoomForm((prev) => ({ ...prev, siteId: value, buildingId: "", floorId: "" }))
                      }
                    >
                      <SelectTrigger className={adminFieldSelectClass}>
                        <SelectValue placeholder="Select site" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {sites.map((site) => (
                          <SelectItem key={site.id} value={site.id}>
                            {site.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Building</Label>
                    <Select
                      value={roomForm.buildingId || undefined}
                      onValueChange={(value) =>
                        setRoomForm((prev) => ({ ...prev, buildingId: value, floorId: "" }))
                      }
                      disabled={!roomForm.siteId}
                    >
                      <SelectTrigger className={adminFieldSelectClass}>
                        <SelectValue placeholder="Select building" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {buildings.map((building) => (
                          <SelectItem key={building.id} value={building.id}>
                            {building.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Floor</Label>
                    <Select
                      value={roomForm.floorId || undefined}
                      onValueChange={(value) => setRoomForm((prev) => ({ ...prev, floorId: value }))}
                      disabled={!roomForm.buildingId}
                    >
                      <SelectTrigger className={adminFieldSelectClass}>
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {floors.map((floor) => (
                          <SelectItem key={floor.id} value={floor.id}>
                            {floor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AdminFormSection>

              <AdminFormSection title="Room details">
                <div className="grid gap-4 sm:grid-cols-2">
                  {ROOM_FORM_FIELDS.map(({ label, key }) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-sm font-medium">{label}</Label>
                      {key === "type" ? (
                        <Select
                          value={roomForm.type || undefined}
                          onValueChange={(value) => {
                            const defaults = ROOM_TYPE_DEFAULTS[value as keyof typeof ROOM_TYPE_DEFAULTS]
                            setRoomForm((prev) => ({
                              ...prev,
                              type: value,
                              capacity: String(defaults.capacity),
                              price: String(defaults.price),
                              sqFt: String(defaults.sqFt),
                            }))
                            setRoomImage(defaults.image)
                          }}
                        >
                          <SelectTrigger className={adminFieldSelectClass}>
                            <SelectValue placeholder="Select room type" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {ROOM_TYPES.map((roomType) => (
                              <SelectItem key={roomType} value={roomType}>
                                {roomType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          className={adminFieldInputClass}
                          placeholder={`Enter ${label.toLowerCase()}`}
                          value={roomForm[key]}
                          onChange={(e) => setRoomForm((prev) => ({ ...prev, [key]: e.target.value }))}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </AdminFormSection>

              <AdminFormSection title="Amenities">
                <div className="grid grid-cols-2 gap-3">
                  {AMENITIES.map((a) => (
                    <label key={a} className="flex items-center gap-2.5 text-sm">
                      <Checkbox
                        checked={amenities.includes(a)}
                        onCheckedChange={(checked) =>
                          setAmenities((prev) =>
                            checked ? [...prev, a] : prev.filter((item) => item !== a),
                          )
                        }
                      />
                      {a}
                    </label>
                  ))}
                </div>
              </AdminFormSection>

              <AdminFormSection title="Photos">
                <RoomImageUpload
                  image={roomImage}
                  onChange={setRoomImage}
                  hint="Uses a default photo for the selected room type if none is uploaded."
                />
              </AdminFormSection>
            </div>
          </AdminSheetShell>
        </AdminSheetContent>
      </Sheet>

      <AdminListToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        placeholder="Search rooms..."
        status={status}
        onStatusChange={(v) => { setStatus(v); setPage(1) }}
        statusOptions={[
          { value: "available", label: "Available" },
          { value: "occupied", label: "Occupied" },
          { value: "maintenance", label: "Maintenance" },
          { value: "reserved", label: "Reserved" },
        ]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <AdminListView
        viewMode={viewMode}
        table={
          <DataTable<AdminRoom>
            columns={[
              { key: "number", header: "Room", cell: (r) => <span className="font-medium">{r.number}</span> },
              { key: "site", header: "Site", cell: (r) => r.siteName },
              { key: "building", header: "Building", cell: (r) => r.buildingName },
              { key: "floor", header: "Floor", cell: (r) => r.floorName },
              { key: "type", header: "Type", cell: (r) => r.type },
              { key: "capacity", header: "Capacity", cell: (r) => r.capacity },
              { key: "price", header: "Price", cell: (r) => formatCurrency(r.price) },
              { key: "status", header: "Status", cell: (r) => <AdminStatusBadge status={r.status} /> },
              { key: "occupancy", header: "Occupancy", cell: (r) => `${r.occupancy}%` },
            ]}
            result={result}
            isLoading={isLoading}
            page={page}
            onPageChange={setPage}
          />
        }
        cards={
          <AdminCardGrid
            result={result}
            isLoading={isLoading}
            page={page}
            onPageChange={setPage}
            columns="4"
            renderCard={(r) => <RoomEntityCard room={r} />}
          />
        }
      />
    </div>
  )
}
