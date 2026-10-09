import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Layers, Plus } from "lucide-react"
import { createAdminFloor, fetchAdminBuildings, fetchAdminFloors } from "@/services/adminApi"
import { AdminCardGrid } from "@/components/admin/AdminCardGrid"
import { AdminListToolbar } from "@/components/admin/AdminListToolbar"
import { AdminListView } from "@/components/admin/AdminListView"
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge"
import { DataTable } from "@/components/admin/DataTable"
import { ExportMenu } from "@/components/admin/ExportMenu"
import { FloorEntityCard } from "@/components/cards/admin/AdminEntityCards"
import { useViewMode } from "@/hooks/useViewMode"
import {
  AdminFormSection,
  AdminSheetContent,
  AdminSheetShell,
  AdminSheetSubmitButton,
  adminFieldInputClass,
  adminFieldSelectClass,
} from "@/components/admin/AdminSheetPanel"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sheet } from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { usePageTransition } from "@/hooks/useGsap"
import type { AdminFloor } from "@/types/admin"

type FloorFormData = {
  name: string
  floorNumber: string
  buildingId: string
  description: string
}

const EMPTY_FLOOR_FORM: FloorFormData = {
  name: "",
  floorNumber: "",
  buildingId: "",
  description: "",
}

const FLOOR_FORM_FIELDS: { label: string; key: keyof Omit<FloorFormData, "buildingId"> }[] = [
  { label: "Floor Name", key: "name" },
  { label: "Floor Number", key: "floorNumber" },
  { label: "Description", key: "description" },
]

export function FloorManagementPage() {
  const pageRef = usePageTransition()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [floorForm, setFloorForm] = useState<FloorFormData>(EMPTY_FLOOR_FORM)
  const [isCreating, setIsCreating] = useState(false)
  const [viewMode, setViewMode] = useViewMode("admin-floors-view")

  const handleCreateOpenChange = (open: boolean) => {
    setCreateOpen(open)
    if (!open) setFloorForm(EMPTY_FLOOR_FORM)
  }

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-floors", page, search],
    queryFn: () => fetchAdminFloors({ page, pageSize: 20, search }),
  })

  const { data: buildingsResult } = useQuery({
    queryKey: ["admin-buildings", "floor-form"],
    queryFn: () => fetchAdminBuildings({ pageSize: 100 }),
    enabled: createOpen,
  })

  const buildings = buildingsResult?.data ?? []

  const fillDemoFloorForm = () => {
    const building = buildings.find((b) => b.name === "Demo Building A") ?? buildings[0]
    setFloorForm({
      name: "Floor 1",
      floorNumber: "1",
      buildingId: building?.id ?? "",
      description: "Level 1 accommodation wing",
    })
  }

  const handleCreateFloor = async () => {
    if (!floorForm.buildingId) {
      toast.error("Please select a building")
      return
    }

    setIsCreating(true)
    try {
      await createAdminFloor(floorForm)
      await queryClient.invalidateQueries({ queryKey: ["admin-floors"] })
      toast.success("Floor created successfully")
      handleCreateOpenChange(false)
      setPage(1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create floor")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Floors"
        description={`${result?.total.toLocaleString("en-IN") ?? "—"} floors across all buildings`}
        action={
          <div className="flex gap-2">
            <ExportMenu />
            <Button size="sm" className="rounded-full px-5" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Add floor
            </Button>
          </div>
        }
      />

      <Sheet open={createOpen} onOpenChange={handleCreateOpenChange}>
        <AdminSheetContent size="sm">
          <AdminSheetShell
            icon={Layers}
            title="Add floor"
            description="Add a floor to an existing building in your listing."
            headerAction={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={fillDemoFloorForm}
              >
                Demo
              </Button>
            }
            footer={
              <AdminSheetSubmitButton
                disabled={isCreating || !floorForm.buildingId}
                loading={isCreating}
                onClick={handleCreateFloor}
              >
                {isCreating ? "Saving..." : "Save floor"}
              </AdminSheetSubmitButton>
            }
          >
            <AdminFormSection title="Floor details">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Building</Label>
                <Select
                  value={floorForm.buildingId || undefined}
                  onValueChange={(value) =>
                    setFloorForm((prev) => ({ ...prev, buildingId: value }))
                  }
                >
                  <SelectTrigger className={adminFieldSelectClass}>
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {buildings.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.siteName} — {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {FLOOR_FORM_FIELDS.map(({ label, key }) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-medium">{label}</Label>
                  <Input
                    className={adminFieldInputClass}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    value={floorForm[key]}
                    onChange={(e) => setFloorForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </AdminFormSection>
          </AdminSheetShell>
        </AdminSheetContent>
      </Sheet>

      <AdminListToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        placeholder="Search floors..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <AdminListView
        viewMode={viewMode}
        table={
          <DataTable<AdminFloor>
            columns={[
              { key: "site", header: "Site", cell: (f) => f.siteName },
              { key: "building", header: "Building", cell: (f) => f.buildingName },
              { key: "name", header: "Floor", cell: (f) => <span className="font-medium">{f.name}</span> },
              { key: "number", header: "Number", cell: (f) => f.floorNumber },
              { key: "rooms", header: "Rooms", cell: (f) => f.rooms },
              { key: "occupancy", header: "Occupancy", cell: (f) => `${f.occupancy}%` },
              { key: "status", header: "Status", cell: (f) => <AdminStatusBadge status={f.status} /> },
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
            renderCard={(f) => <FloorEntityCard floor={f} />}
          />
        }
      />
    </div>
  )
}
