import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Building2, Eye, Plus } from "lucide-react"
import { createAdminBuilding, fetchAdminBuildings, fetchAdminSites } from "@/services/adminApi"
import { AdminCardGrid } from "@/components/admin/AdminCardGrid"
import { AdminListToolbar } from "@/components/admin/AdminListToolbar"
import { AdminListView } from "@/components/admin/AdminListView"
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge"
import { DataTable } from "@/components/admin/DataTable"
import { ExportMenu } from "@/components/admin/ExportMenu"
import { BuildingEntityCard } from "@/components/cards/admin/AdminEntityCards"
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
import type { AdminBuilding } from "@/types/admin"

type BuildingFormData = {
  name: string
  buildingCode: string
  siteId: string
  description: string
}

const EMPTY_BUILDING_FORM: BuildingFormData = {
  name: "",
  buildingCode: "",
  siteId: "",
  description: "",
}

const BUILDING_FORM_FIELDS: { label: string; key: keyof Omit<BuildingFormData, "siteId"> }[] = [
  { label: "Building Name", key: "name" },
  { label: "Building Code", key: "buildingCode" },
  { label: "Description", key: "description" },
]

export function BuildingManagementPage() {
  const pageRef = usePageTransition()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [buildingForm, setBuildingForm] = useState<BuildingFormData>(EMPTY_BUILDING_FORM)
  const [isCreating, setIsCreating] = useState(false)
  const [viewMode, setViewMode] = useViewMode("admin-buildings-view")

  const handleCreateOpenChange = (open: boolean) => {
    setCreateOpen(open)
    if (!open) setBuildingForm(EMPTY_BUILDING_FORM)
  }

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-buildings", page, search],
    queryFn: () => fetchAdminBuildings({ page, pageSize: 20, search }),
  })

  const { data: sitesResult } = useQuery({
    queryKey: ["admin-sites", "building-form"],
    queryFn: () => fetchAdminSites({ pageSize: 100 }),
    enabled: createOpen,
  })

  const sites = sitesResult?.data ?? []

  const fillDemoBuildingForm = () => {
    const site = sites.find((s) => s.name === "Demo Guest House") ?? sites[0]
    setBuildingForm({
      name: "Demo Building A",
      buildingCode: "GH-DEMO-001-B1",
      siteId: site?.id ?? "",
      description: "Administrative block at demo site",
    })
  }

  const handleCreateBuilding = async () => {
    if (!buildingForm.siteId) {
      toast.error("Please select a site")
      return
    }

    setIsCreating(true)
    try {
      await createAdminBuilding(buildingForm)
      await queryClient.invalidateQueries({ queryKey: ["admin-buildings"] })
      toast.success("Building created successfully")
      handleCreateOpenChange(false)
      setPage(1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create building")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Buildings"
        description={`${result?.total.toLocaleString("en-IN") ?? "500"} buildings across all listings`}
        action={
          <div className="flex gap-2">
            <ExportMenu />
            <Button size="sm" className="rounded-full px-5" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Add building
            </Button>
          </div>
        }
      />

      <Sheet open={createOpen} onOpenChange={handleCreateOpenChange}>
        <AdminSheetContent size="sm">
          <AdminSheetShell
            icon={Building2}
            title="Add building"
            description="Create a new building under an existing guest house listing."
            headerAction={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={fillDemoBuildingForm}
              >
                Demo
              </Button>
            }
            footer={
              <AdminSheetSubmitButton
                disabled={isCreating || !buildingForm.siteId}
                loading={isCreating}
                onClick={handleCreateBuilding}
              >
                {isCreating ? "Saving..." : "Save building"}
              </AdminSheetSubmitButton>
            }
          >
            <AdminFormSection title="Building details">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Site</Label>
                <Select
                  value={buildingForm.siteId || undefined}
                  onValueChange={(value) =>
                    setBuildingForm((prev) => ({ ...prev, siteId: value }))
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
              {BUILDING_FORM_FIELDS.map(({ label, key }) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-medium">{label}</Label>
                  <Input
                    className={adminFieldInputClass}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    value={buildingForm[key]}
                    onChange={(e) => setBuildingForm((prev) => ({ ...prev, [key]: e.target.value }))}
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
        placeholder="Search buildings..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <AdminListView
        viewMode={viewMode}
        table={
          <DataTable<AdminBuilding>
            columns={[
              { key: "name", header: "Building", cell: (b) => <span className="font-medium">{b.name}</span> },
              { key: "code", header: "Code", cell: (b) => <span className="font-mono text-xs">{b.buildingCode}</span> },
              { key: "site", header: "Site", cell: (b) => b.siteName },
              { key: "floors", header: "Floors", cell: (b) => b.floors },
              { key: "rooms", header: "Rooms", cell: (b) => b.rooms },
              { key: "occupancy", header: "Occupancy", cell: (b) => `${b.occupancy}%` },
              { key: "status", header: "Status", cell: (b) => <AdminStatusBadge status={b.status} /> },
              { key: "actions", header: "", cell: (b) => <Button size="sm" variant="ghost" asChild><Link to={`/admin/buildings/${b.id}`}><Eye className="size-4" /></Link></Button> },
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
            renderCard={(b) => <BuildingEntityCard building={b} />}
          />
        }
      />
    </div>
  )
}
