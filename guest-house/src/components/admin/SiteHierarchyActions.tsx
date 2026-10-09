import { useState, type ComponentType, type ReactNode } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  BedDouble,
  Building2,
  Check,
  ChevronRight,
  Layers,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react"
import {
  bulkCreateAdminFloors,
  bulkCreateAdminRooms,
  createAdminBuilding,
  createAdminFloor,
  createAdminRoom,
  fetchAdminBuildings,
  fetchAdminFloors,
  type BulkCreateRoomsScope,
  type BulkRoomTypeSlot,
} from "@/services/adminApi"
import { RoomImageUpload } from "@/components/admin/RoomImageUpload"
import {
  AdminFormSection,
  AdminSheetContent,
  AdminSheetPreview,
  AdminSheetShell,
  AdminSheetSubmitButton,
  adminFieldInputClass,
  adminFieldSelectClass,
} from "@/components/admin/AdminSheetPanel"
import { Button } from "@/components/ui/button"
import { Sheet } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AMENITIES, ROOM_TYPE_DEFAULTS, ROOM_TYPES } from "@/types/admin"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { AdminSite, ExtendedRoomType } from "@/types/admin"

type HierarchyStep = "building" | "floor" | "room"
type FloorMode = "single" | "bulk"
type RoomMode = "single" | "bulk"

type BulkRoomSlotRow = BulkRoomTypeSlot & { id: string }

let bulkSlotId = 0

function nextSlotId() {
  bulkSlotId += 1
  return `slot-${bulkSlotId}`
}

function createBulkRoomSlotRow(type: ExtendedRoomType, count: string): BulkRoomSlotRow {
  const defaults = ROOM_TYPE_DEFAULTS[type]
  return {
    id: nextSlotId(),
    type,
    count,
    capacity: String(defaults.capacity),
    price: String(defaults.price),
    sqFt: String(defaults.sqFt),
    amenities: [...defaults.amenities],
    image: defaults.image,
  }
}

function roomDefaultsForType(type: ExtendedRoomType) {
  return ROOM_TYPE_DEFAULTS[type]
}

const DEFAULT_BULK_ROOM_SLOTS: BulkRoomSlotRow[] = [
  createBulkRoomSlotRow("VIP Suite", "2"),
  createBulkRoomSlotRow("Deluxe", "2"),
  createBulkRoomSlotRow("Standard", "1"),
]

const ROOM_TYPE_STYLES: Record<ExtendedRoomType, { card: string; badge: string }> = {
  Standard: {
    card: "border-slate-200/80 bg-gradient-to-br from-slate-50/80 to-background dark:from-slate-900/20",
    badge: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  },
  Deluxe: {
    card: "border-sky-200/80 bg-gradient-to-br from-sky-50/80 to-background dark:from-sky-950/20",
    badge: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  },
  Executive: {
    card: "border-violet-200/80 bg-gradient-to-br from-violet-50/80 to-background dark:from-violet-950/20",
    badge: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  },
  "VIP Suite": {
    card: "border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-background dark:from-amber-950/25",
    badge: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  },
  "Conference Room": {
    card: "border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-background dark:from-emerald-950/20",
    badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
}

interface SiteHierarchyActionsProps {
  site: AdminSite
  compact?: boolean
}

export function SiteHierarchyActions({ site, compact = false }: SiteHierarchyActionsProps) {
  const queryClient = useQueryClient()
  const [activeSheet, setActiveSheet] = useState<HierarchyStep | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [floorMode, setFloorMode] = useState<FloorMode>("bulk")
  const [roomMode, setRoomMode] = useState<RoomMode>("bulk")

  const [buildingForm, setBuildingForm] = useState({ name: "", buildingCode: "", description: "" })
  const [floorForm, setFloorForm] = useState({ name: "", floorNumber: "", buildingId: "", description: "" })
  const [bulkFloorForm, setBulkFloorForm] = useState({ buildingId: "", count: "10", startFloorNumber: "1" })
  const [roomForm, setRoomForm] = useState({
    number: "",
    name: "",
    type: "",
    capacity: "",
    price: "",
    sqFt: "",
    buildingId: "",
    floorId: "",
  })
  const [bulkRoomForm, setBulkRoomForm] = useState({
    buildingId: "",
    scope: "single_floor" as BulkCreateRoomsScope,
    floorId: "",
  })
  const [bulkRoomSlots, setBulkRoomSlots] = useState<BulkRoomSlotRow[]>(DEFAULT_BULK_ROOM_SLOTS)
  const [singleRoomAmenities, setSingleRoomAmenities] = useState<string[]>([
    ...ROOM_TYPE_DEFAULTS.Standard.amenities,
  ])
  const [singleRoomImage, setSingleRoomImage] = useState(ROOM_TYPE_DEFAULTS.Standard.image)

  const { data: buildingsResult } = useQuery({
    queryKey: ["admin-buildings", site.id],
    queryFn: () => fetchAdminBuildings({ siteId: site.id, pageSize: 100 }),
  })

  const { data: floorsResult } = useQuery({
    queryKey: ["admin-floors", site.id],
    queryFn: () => fetchAdminFloors({ siteId: site.id, pageSize: 100 }),
  })

  const buildings = buildingsResult?.data ?? []
  const floors = floorsResult?.data ?? []

  const hasBuildings = buildings.length > 0
  const hasFloors = floors.length > 0
  const hasRooms = site.roomsCount > 0

  const nextStep: HierarchyStep | "complete" = !hasBuildings
    ? "building"
    : !hasFloors
      ? "floor"
      : !hasRooms
        ? "room"
        : "complete"

  const floorsForBuilding = (buildingId: string) =>
    floors.filter((f) => f.buildingId === buildingId).sort((a, b) => a.floorNumber - b.floorNumber)

  const nextFloorNumber = (buildingId: string) => {
    const existing = floorsForBuilding(buildingId)
    if (existing.length === 0) return 1
    return Math.max(...existing.map((f) => f.floorNumber)) + 1
  }

  const invalidateHierarchy = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-sites"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-buildings", site.id] }),
      queryClient.invalidateQueries({ queryKey: ["admin-floors", site.id] }),
    ])
  }

  const openSheet = (step: HierarchyStep) => {
    if (step === "floor" && !hasBuildings) return
    if (step === "room" && !hasFloors) return

    const defaultBuildingId = buildings[0]?.id ?? ""

    if (step === "building") {
      setBuildingForm({
        name: `${site.city} Block A`,
        buildingCode: `${site.siteCode}-B${buildings.length + 1}`,
        description: `Main accommodation block at ${site.name}`,
      })
    }
    if (step === "floor") {
      const start = nextFloorNumber(defaultBuildingId)
      setFloorForm({
        name: `Floor ${start}`,
        floorNumber: String(start),
        buildingId: defaultBuildingId,
        description: "",
      })
      setBulkFloorForm({
        buildingId: defaultBuildingId,
        count: "10",
        startFloorNumber: String(start),
      })
      setFloorMode("bulk")
    }
    if (step === "room") {
      const floorId = floors.find((f) => f.buildingId === defaultBuildingId)?.id ?? floors[0]?.id ?? ""
      const standardDefaults = roomDefaultsForType("Standard")
      setRoomForm({
        number: "101",
        name: "Standard 101",
        type: "Standard",
        capacity: String(standardDefaults.capacity),
        price: String(standardDefaults.price),
        sqFt: String(standardDefaults.sqFt),
        buildingId: defaultBuildingId,
        floorId,
      })
      setBulkRoomForm({
        buildingId: defaultBuildingId,
        scope: "single_floor",
        floorId,
      })
      setBulkRoomSlots(
        DEFAULT_BULK_ROOM_SLOTS.map((slot) => ({
          ...createBulkRoomSlotRow(slot.type as ExtendedRoomType, slot.count),
        })),
      )
      setSingleRoomAmenities([...ROOM_TYPE_DEFAULTS.Standard.amenities])
      setSingleRoomImage(ROOM_TYPE_DEFAULTS.Standard.image)
      setRoomMode("bulk")
    }
    setActiveSheet(step)
  }

  const handleCreateBuilding = async () => {
    setIsCreating(true)
    try {
      await createAdminBuilding({ ...buildingForm, siteId: site.id })
      await invalidateHierarchy()
      toast.success("Building created")
      setActiveSheet(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create building")
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateFloor = async () => {
    setIsCreating(true)
    try {
      await createAdminFloor({
        name: floorForm.name,
        floorNumber: floorForm.floorNumber,
        buildingId: floorForm.buildingId,
        description: floorForm.description,
      })
      await invalidateHierarchy()
      toast.success("Floor created")
      setActiveSheet(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create floor")
    } finally {
      setIsCreating(false)
    }
  }

  const handleBulkCreateFloors = async () => {
    setIsCreating(true)
    try {
      const { count } = await bulkCreateAdminFloors(bulkFloorForm)
      await invalidateHierarchy()
      toast.success(`Created ${count} floors`)
      setActiveSheet(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create floors")
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateRoom = async () => {
    setIsCreating(true)
    try {
      await createAdminRoom({
        ...roomForm,
        siteId: site.id,
        amenities: singleRoomAmenities,
        image: singleRoomImage,
      })
      await invalidateHierarchy()
      toast.success("Room created")
      setActiveSheet(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create room")
    } finally {
      setIsCreating(false)
    }
  }

  const handleBulkCreateRooms = async () => {
    setIsCreating(true)
    try {
      const { count } = await bulkCreateAdminRooms({
        siteId: site.id,
        buildingId: bulkRoomForm.buildingId,
        scope: bulkRoomForm.scope,
        floorId: bulkRoomForm.scope === "single_floor" ? bulkRoomForm.floorId : undefined,
        slots: bulkRoomSlots.map(({ type, count: slotCount, capacity, price, sqFt, amenities, image }) => ({
          type,
          count: slotCount,
          capacity,
          price,
          sqFt,
          amenities,
          image,
        })),
      })
      await invalidateHierarchy()
      toast.success(`Created ${count} rooms`)
      setActiveSheet(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create rooms")
    } finally {
      setIsCreating(false)
    }
  }

  const roomFloors = floors.filter((f) => f.buildingId === roomForm.buildingId)
  const bulkRoomFloors = floorsForBuilding(bulkRoomForm.buildingId)

  const bulkFloorCount = Number.parseInt(bulkFloorForm.count, 10) || 0
  const bulkFloorStart = Number.parseInt(bulkFloorForm.startFloorNumber, 10) || 0
  const bulkFloorEnd = bulkFloorStart + bulkFloorCount - 1

  const bulkRoomsPerFloor = bulkRoomSlots.reduce(
    (sum, slot) => sum + (Number.parseInt(slot.count, 10) || 0),
    0,
  )
  const bulkRoomFloorCount =
    bulkRoomForm.scope === "all_floors" ? bulkRoomFloors.length : bulkRoomForm.floorId ? 1 : 0
  const bulkRoomTotal = bulkRoomsPerFloor * bulkRoomFloorCount
  const bulkMixSummary = bulkRoomSlots
    .filter((slot) => (Number.parseInt(slot.count, 10) || 0) > 0)
    .map(
      (slot) =>
        `${slot.count}× ${slot.type} (${slot.sqFt} sq ft, ₹${slot.price}/night, ${slot.capacity} guests)`,
    )
    .join(" · ")
  const selectedFloorNumber =
    bulkRoomFloors.find((f) => f.id === bulkRoomForm.floorId)?.floorNumber ?? 1
  const bulkRoomPreview =
    bulkRoomsPerFloor > 0 && bulkRoomFloorCount > 0
      ? bulkRoomForm.scope === "all_floors"
        ? `${bulkRoomTotal} rooms (${bulkRoomsPerFloor} per floor × ${bulkRoomFloorCount} floors)`
        : `${bulkRoomsPerFloor} rooms on Floor ${selectedFloorNumber} — ${selectedFloorNumber}01–${selectedFloorNumber}${String(bulkRoomsPerFloor).padStart(2, "0")}`
      : null

  return (
    <>
      {compact ? (
        <div className="flex flex-wrap gap-1.5">
          <CompactAddButton
            label="Building"
            count={buildings.length}
            disabled={false}
            onClick={() => openSheet("building")}
          />
          <CompactAddButton
            label="Floor"
            count={floors.length}
            disabled={!hasBuildings}
            onClick={() => openSheet("floor")}
          />
          <CompactAddButton
            label="Room"
            count={site.roomsCount}
            disabled={!hasFloors}
            onClick={() => openSheet("room")}
          />
        </div>
      ) : (
      <div className="relative overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/[0.06] via-background to-accent/20 p-3.5 shadow-sm">
        <div className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full bg-primary/10 blur-2xl" />
        <p className="relative mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          <Sparkles className="size-3 text-primary/70" />
          Site → Building → Floor → Room
        </p>
        <div className="relative flex items-center justify-between gap-1">
          <HierarchyStepNode label="Site" icon={Check} status="complete" />

          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />

          <HierarchyStepNode
            label="Building"
            icon={Building2}
            count={buildings.length}
            status={hasBuildings ? "complete" : nextStep === "building" ? "active" : "locked"}
            canAdd
            highlight={nextStep === "building"}
            onAdd={() => openSheet("building")}
          />

          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />

          <HierarchyStepNode
            label="Floor"
            icon={Layers}
            count={floors.length}
            status={!hasBuildings ? "locked" : hasFloors ? "complete" : nextStep === "floor" ? "active" : "locked"}
            canAdd={hasBuildings}
            highlight={nextStep === "floor"}
            onAdd={() => openSheet("floor")}
          />

          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground/50" />

          <HierarchyStepNode
            label="Room"
            icon={BedDouble}
            count={site.roomsCount}
            status={!hasFloors ? "locked" : hasRooms ? "complete" : nextStep === "room" ? "active" : "locked"}
            canAdd={hasFloors}
            highlight={nextStep === "room"}
            onAdd={() => openSheet("room")}
          />
        </div>
      </div>
      )}

      <Sheet open={activeSheet === "building"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <AdminSheetContent size="sm">
          <AdminSheetShell
            icon={Building2}
            title="Add building"
            description={`Create a new accommodation block at ${site.name}.`}
            footer={
              <AdminSheetSubmitButton disabled={isCreating} loading={isCreating} onClick={handleCreateBuilding}>
                Create building
              </AdminSheetSubmitButton>
            }
          >
            <AdminFormSection title="Building details">
              <FormField label="Building name">
                <Input
                  className={adminFieldInputClass}
                  value={buildingForm.name}
                  onChange={(e) => setBuildingForm((p) => ({ ...p, name: e.target.value }))}
                />
              </FormField>
              <FormField label="Building code">
                <Input
                  className={adminFieldInputClass}
                  value={buildingForm.buildingCode}
                  onChange={(e) => setBuildingForm((p) => ({ ...p, buildingCode: e.target.value }))}
                />
              </FormField>
              <FormField label="Description">
                <Input
                  className={adminFieldInputClass}
                  value={buildingForm.description}
                  onChange={(e) => setBuildingForm((p) => ({ ...p, description: e.target.value }))}
                />
              </FormField>
            </AdminFormSection>
          </AdminSheetShell>
        </AdminSheetContent>
      </Sheet>

      <Sheet open={activeSheet === "floor"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <AdminSheetContent size="md">
          <AdminSheetShell
            icon={Layers}
            title="Add floors"
            description={`Bulk-create levels or add one floor at a time for ${site.name}.`}
            footer={
              floorMode === "bulk" ? (
                <AdminSheetSubmitButton
                  disabled={isCreating || !bulkFloorForm.buildingId}
                  loading={isCreating}
                  onClick={handleBulkCreateFloors}
                >
                  Create {bulkFloorCount || 0} floors
                </AdminSheetSubmitButton>
              ) : (
                <AdminSheetSubmitButton
                  disabled={isCreating || !floorForm.buildingId}
                  loading={isCreating}
                  onClick={handleCreateFloor}
                >
                  Create floor
                </AdminSheetSubmitButton>
              )
            }
          >
            <Tabs value={floorMode} onValueChange={(v) => setFloorMode(v as FloorMode)}>
            <TabsList className="mb-4 grid h-11 w-full grid-cols-2 rounded-2xl bg-muted/60 p-1">
              <TabsTrigger value="bulk" className="rounded-xl text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Bulk add
              </TabsTrigger>
              <TabsTrigger value="single" className="rounded-xl text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Single floor
              </TabsTrigger>
            </TabsList>
            <TabsContent value="bulk" className="mt-0 space-y-4">
              <AdminFormSection title="Location">
              <FormField label="Building">
                <Select
                  value={bulkFloorForm.buildingId}
                  onValueChange={(v) =>
                    setBulkFloorForm((p) => ({
                      ...p,
                      buildingId: v,
                      startFloorNumber: String(nextFloorNumber(v)),
                    }))
                  }
                >
                  <SelectTrigger className={adminFieldSelectClass}>
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              </AdminFormSection>
              <AdminFormSection title="Floor range">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Number of floors">
                  <Input
                    className={adminFieldInputClass}
                    type="number"
                    min={1}
                    max={50}
                    value={bulkFloorForm.count}
                    onChange={(e) => setBulkFloorForm((p) => ({ ...p, count: e.target.value }))}
                  />
                </FormField>
                <FormField label="Start from floor number">
                  <Input
                    className={adminFieldInputClass}
                    type="number"
                    min={0}
                    value={bulkFloorForm.startFloorNumber}
                    onChange={(e) => setBulkFloorForm((p) => ({ ...p, startFloorNumber: e.target.value }))}
                  />
                </FormField>
              </div>
              {bulkFloorCount > 0 && bulkFloorStart >= 0 && (
                <AdminSheetPreview>
                  Will create <strong className="text-foreground">{bulkFloorCount}</strong> floors — Floor{" "}
                  {bulkFloorStart}
                  {bulkFloorCount > 1 ? ` to Floor ${bulkFloorEnd}` : ""}
                </AdminSheetPreview>
              )}
              </AdminFormSection>
            </TabsContent>

            <TabsContent value="single" className="mt-0 space-y-4">
              <AdminFormSection title="Floor details">
              <FormField label="Building">
                <Select
                  value={floorForm.buildingId}
                  onValueChange={(v) => {
                    const start = nextFloorNumber(v)
                    setFloorForm((p) => ({
                      ...p,
                      buildingId: v,
                      name: `Floor ${start}`,
                      floorNumber: String(start),
                    }))
                  }}
                >
                  <SelectTrigger className={adminFieldSelectClass}>
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Floor name">
                <Input
                  className={adminFieldInputClass}
                  value={floorForm.name}
                  onChange={(e) => setFloorForm((p) => ({ ...p, name: e.target.value }))}
                />
              </FormField>
              <FormField label="Floor number">
                <Input
                  className={adminFieldInputClass}
                  value={floorForm.floorNumber}
                  onChange={(e) => setFloorForm((p) => ({ ...p, floorNumber: e.target.value }))}
                />
              </FormField>
              <FormField label="Description">
                <Input
                  className={adminFieldInputClass}
                  value={floorForm.description}
                  onChange={(e) => setFloorForm((p) => ({ ...p, description: e.target.value }))}
                />
              </FormField>
              </AdminFormSection>
            </TabsContent>
          </Tabs>
          </AdminSheetShell>
        </AdminSheetContent>
      </Sheet>

      <Sheet open={activeSheet === "room"} onOpenChange={(open) => !open && setActiveSheet(null)}>
        <AdminSheetContent size="lg">
          <AdminSheetShell
            icon={BedDouble}
            title="Add rooms"
            description={`Configure room mix, pricing, amenities, and placement for ${site.name}.`}
            footer={
              roomMode === "bulk" ? (
                <AdminSheetSubmitButton
                  disabled={
                    isCreating ||
                    !bulkRoomForm.buildingId ||
                    (bulkRoomForm.scope === "single_floor" && !bulkRoomForm.floorId) ||
                    bulkRoomTotal === 0
                  }
                  loading={isCreating}
                  onClick={handleBulkCreateRooms}
                >
                  Create {bulkRoomTotal || 0} rooms
                </AdminSheetSubmitButton>
              ) : (
                <AdminSheetSubmitButton
                  disabled={isCreating || !roomForm.buildingId || !roomForm.floorId}
                  loading={isCreating}
                  onClick={handleCreateRoom}
                >
                  Create room
                </AdminSheetSubmitButton>
              )
            }
          >
            <Tabs value={roomMode} onValueChange={(v) => setRoomMode(v as RoomMode)}>
            <TabsList className="mb-4 grid h-11 w-full grid-cols-2 rounded-2xl bg-muted/60 p-1">
              <TabsTrigger value="bulk" className="rounded-xl text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Bulk add
              </TabsTrigger>
              <TabsTrigger value="single" className="rounded-xl text-sm data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Single room
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bulk" className="mt-0 space-y-4">
              <AdminFormSection title="Placement">
              <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Building">
                <Select
                  value={bulkRoomForm.buildingId}
                  onValueChange={(v) =>
                    setBulkRoomForm((p) => ({
                      ...p,
                      buildingId: v,
                      floorId: floorsForBuilding(v)[0]?.id ?? "",
                    }))
                  }
                >
                  <SelectTrigger className={adminFieldSelectClass}>
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Apply to">
                <Select
                  value={bulkRoomForm.scope}
                  onValueChange={(v) =>
                    setBulkRoomForm((p) => ({ ...p, scope: v as BulkCreateRoomsScope }))
                  }
                >
                  <SelectTrigger className={adminFieldSelectClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all_floors">All floors in building</SelectItem>
                    <SelectItem value="single_floor">One floor only</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
              </div>
              {bulkRoomForm.scope === "single_floor" && (
                <FormField label="Floor">
                  <Select
                    value={bulkRoomForm.floorId}
                    onValueChange={(v) => setBulkRoomForm((p) => ({ ...p, floorId: v }))}
                  >
                    <SelectTrigger className={adminFieldSelectClass}>
                      <SelectValue placeholder="Select floor" />
                    </SelectTrigger>
                    <SelectContent>
                      {bulkRoomFloors.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}
              </AdminFormSection>
              <BulkRoomMixEditor slots={bulkRoomSlots} onChange={setBulkRoomSlots} />
              {bulkRoomPreview && (
                <AdminSheetPreview>
                  <p>
                    Will create <strong className="text-foreground">{bulkRoomTotal}</strong> rooms —{" "}
                    {bulkRoomPreview}
                  </p>
                  {bulkMixSummary && (
                    <p className="mt-1.5 border-t border-primary/10 pt-1.5">
                      Mix per floor: <span className="font-medium text-foreground">{bulkMixSummary}</span>
                    </p>
                  )}
                </AdminSheetPreview>
              )}
            </TabsContent>

            <TabsContent value="single" className="mt-0 space-y-4">
              <AdminFormSection title="Location">
              <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Building">
                <Select
                  value={roomForm.buildingId}
                  onValueChange={(v) =>
                    setRoomForm((p) => ({
                      ...p,
                      buildingId: v,
                      floorId: floors.find((f) => f.buildingId === v)?.id ?? "",
                    }))
                  }
                >
                  <SelectTrigger className={adminFieldSelectClass}>
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildings.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Floor">
                <Select
                  value={roomForm.floorId}
                  onValueChange={(v) => setRoomForm((p) => ({ ...p, floorId: v }))}
                >
                  <SelectTrigger className={adminFieldSelectClass}>
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomFloors.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              </div>
              </AdminFormSection>
              <AdminFormSection title="Room details">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Room number">
                  <Input
                    className={adminFieldInputClass}
                    value={roomForm.number}
                    onChange={(e) => setRoomForm((p) => ({ ...p, number: e.target.value }))}
                  />
                </FormField>
                <FormField label="Room name">
                  <Input
                    className={adminFieldInputClass}
                    value={roomForm.name}
                    onChange={(e) => setRoomForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </FormField>
              </div>
            <FormField label="Room type">
              <Select
                value={roomForm.type}
                onValueChange={(v) => {
                  const defaults = roomDefaultsForType(v as ExtendedRoomType)
                  setRoomForm((p) => ({
                    ...p,
                    type: v,
                    capacity: String(defaults.capacity),
                    price: String(defaults.price),
                    sqFt: String(defaults.sqFt),
                  }))
                  setSingleRoomAmenities([...defaults.amenities])
                  setSingleRoomImage(defaults.image)
                }}
              >
                <SelectTrigger className={adminFieldSelectClass}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <div className="grid gap-4 sm:grid-cols-3">
              <FormField label="Capacity">
                <Input
                  className={adminFieldInputClass}
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm((p) => ({ ...p, capacity: e.target.value }))}
                />
              </FormField>
              <FormField label="Price (₹/night)">
                <Input
                  className={adminFieldInputClass}
                  value={roomForm.price}
                  onChange={(e) => setRoomForm((p) => ({ ...p, price: e.target.value }))}
                />
              </FormField>
              <FormField label="Area (sq ft)">
                <Input
                  className={adminFieldInputClass}
                  value={roomForm.sqFt}
                  onChange={(e) => setRoomForm((p) => ({ ...p, sqFt: e.target.value }))}
                />
              </FormField>
            </div>
            <AmenitiesPicker
              label="Amenities"
              selected={singleRoomAmenities}
              onChange={setSingleRoomAmenities}
            />
            <RoomImageUpload
              image={singleRoomImage}
              onChange={setSingleRoomImage}
              hint="Uses a default photo for this room type if none is uploaded."
            />
            </AdminFormSection>
            </TabsContent>
          </Tabs>
          </AdminSheetShell>
        </AdminSheetContent>
      </Sheet>
    </>
  )
}

function CompactAddButton({
  label,
  count,
  disabled,
  onClick,
}: {
  label: string
  count: number
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
        disabled
          ? "cursor-not-allowed border-border/50 bg-muted/30 text-muted-foreground/50"
          : "border-border/70 bg-background text-foreground hover:border-foreground/20 hover:bg-muted/50"
      )}
    >
      <Plus className="size-3" />
      {label}
      <span className="tabular-nums text-muted-foreground">({count})</span>
    </button>
  )
}

function HierarchyStepNode({
  label,
  icon: Icon,
  count,
  status,
  canAdd = false,
  highlight,
  onAdd,
}: {
  label: string
  icon: ComponentType<{ className?: string }>
  count?: number
  status: "complete" | "active" | "locked"
  canAdd?: boolean
  highlight?: boolean
  onAdd?: () => void
}) {
  const isLocked = status === "locked"

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-1">
      <div className="relative">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-full border shadow-sm transition-all duration-300",
            status === "complete" && "border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 text-emerald-600",
            status === "active" && "border-primary/40 bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-primary/10",
            isLocked && "border-border/60 bg-muted/40 text-muted-foreground/40",
            highlight && "ring-2 ring-primary/30 ring-offset-2 ring-offset-card"
          )}
        >
          {status === "complete" ? <Check className="size-4" /> : <Icon className="size-4" />}
        </div>
        {canAdd && onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className={cn(
              "absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full border bg-background shadow-md transition-all duration-200",
              isLocked
                ? "cursor-not-allowed border-border text-muted-foreground/40"
                : "border-primary/40 text-primary hover:scale-105 hover:bg-primary hover:text-primary-foreground hover:shadow-primary/20"
            )}
            disabled={isLocked}
            aria-label={`Add ${label.toLowerCase()}`}
          >
            <Plus className="size-2.5" />
          </button>
        )}
      </div>
      <span className="text-[9px] font-medium text-muted-foreground">{label}</span>
      {count !== undefined && (
        <span className="text-[10px] font-semibold tabular-nums text-foreground">{count}</span>
      )}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-foreground/80">{label}</Label>
      {children}
    </div>
  )
}

function AmenitiesPicker({
  label,
  selected,
  onChange,
  compact,
}: {
  label: string
  selected: string[]
  onChange: (amenities: string[]) => void
  compact?: boolean
}) {
  const toggleAmenity = (amenity: string, checked: boolean) => {
    onChange(checked ? [...selected, amenity] : selected.filter((item) => item !== amenity))
  }

  return (
    <div className="space-y-2.5">
      <Label className="text-xs font-medium text-foreground/80">{label}</Label>
      <div className={cn("flex flex-wrap gap-2", !compact && "sm:gap-2.5")}>
        {AMENITIES.map((amenity) => {
          const isSelected = selected.includes(amenity)
          return (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleAmenity(amenity, !isSelected)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                isSelected
                  ? "border-primary/30 bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "border-border/60 bg-muted/30 text-muted-foreground hover:border-primary/20 hover:bg-muted/60 hover:text-foreground",
              )}
            >
              {amenity}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BulkRoomMixEditor({
  slots,
  onChange,
}: {
  slots: BulkRoomSlotRow[]
  onChange: (slots: BulkRoomSlotRow[]) => void
}) {
  const roomsPerFloor = slots.reduce((sum, slot) => sum + (Number.parseInt(slot.count, 10) || 0), 0)

  const updateSlot = (id: string, patch: Partial<BulkRoomSlotRow>) => {
    onChange(slots.map((slot) => (slot.id === id ? { ...slot, ...patch } : slot)))
  }

  const updateSlotType = (id: string, type: ExtendedRoomType) => {
    const defaults = roomDefaultsForType(type)
    onChange(
      slots.map((slot) =>
        slot.id === id
          ? {
              ...slot,
              type,
              capacity: String(defaults.capacity),
              price: String(defaults.price),
              sqFt: String(defaults.sqFt),
              amenities: [...defaults.amenities],
              image: defaults.image,
            }
          : slot,
      ),
    )
  }

  const addSlot = () => {
    const usedTypes = new Set(slots.map((slot) => slot.type))
    const nextType = ROOM_TYPES.find((type) => !usedTypes.has(type)) ?? "Standard"
    onChange([...slots, createBulkRoomSlotRow(nextType, "1")])
  }

  const removeSlot = (id: string) => {
    if (slots.length <= 1) return
    onChange(slots.filter((slot) => slot.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 rounded-xl bg-muted/40 px-3 py-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Room mix</Label>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {roomsPerFloor} / floor
        </span>
      </div>

      <div className="space-y-3">
        {slots.map((slot, index) => {
          const typeStyle = ROOM_TYPE_STYLES[slot.type as ExtendedRoomType] ?? ROOM_TYPE_STYLES.Standard
          return (
          <div
            key={slot.id}
            className={cn("rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md", typeStyle.card)}
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Row {index + 1}
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", typeStyle.badge)}>
                  {slot.type}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                disabled={slots.length <= 1}
                onClick={() => removeSlot(slot.id)}
                aria-label="Remove room type row"
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Room type">
                <Select value={slot.type} onValueChange={(v) => updateSlotType(slot.id, v as ExtendedRoomType)}>
                  <SelectTrigger className={adminFieldSelectClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Count">
                <Input
                  className={adminFieldInputClass}
                  type="number"
                  min={1}
                  max={50}
                  value={slot.count}
                  onChange={(e) => updateSlot(slot.id, { count: e.target.value })}
                />
              </FormField>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <FormField label="Capacity">
                <Input
                  className={adminFieldInputClass}
                  value={slot.capacity}
                  onChange={(e) => updateSlot(slot.id, { capacity: e.target.value })}
                />
              </FormField>
              <FormField label="Price (₹/night)">
                <Input
                  className={adminFieldInputClass}
                  value={slot.price}
                  onChange={(e) => updateSlot(slot.id, { price: e.target.value })}
                />
              </FormField>
              <FormField label="Area (sq ft)">
                <Input
                  className={adminFieldInputClass}
                  value={slot.sqFt}
                  onChange={(e) => updateSlot(slot.id, { sqFt: e.target.value })}
                />
              </FormField>
            </div>

            <div className="mt-3 border-t border-border/40 pt-3">
              <AmenitiesPicker
                label="Amenities"
                selected={slot.amenities}
                onChange={(amenities) => updateSlot(slot.id, { amenities })}
                compact
              />
            </div>
            <div className="mt-3">
              <RoomImageUpload
                label="Room photos"
                image={slot.image}
                onChange={(image) => updateSlot(slot.id, { image })}
                compact
                hint="Same photo applies to all rooms of this type in the mix."
              />
            </div>
          </div>
        )})}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-10 w-full rounded-2xl border-dashed border-primary/30 bg-primary/[0.03] text-primary hover:bg-primary/10"
        onClick={addSlot}
      >
        <Plus className="mr-1.5 size-3.5" />
        Add room type
      </Button>
    </div>
  )
}
