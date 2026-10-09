import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Building2, Plus } from "lucide-react"
import { createAdminSite, fetchAdminSites } from "@/services/adminApi"
import { AdminSiteCard } from "@/components/cards/AdminSiteCard"
import { ExportMenu } from "@/components/admin/ExportMenu"
import {
  AdminFormSection,
  AdminSheetContent,
  AdminSheetShell,
  AdminSheetSubmitButton,
  adminFieldInputClass,
} from "@/components/admin/AdminSheetPanel"
import { RoomImageUpload } from "@/components/admin/RoomImageUpload"
import { SearchFilterBar } from "@/components/admin/SearchFilterBar"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { usePageTransition } from "@/hooks/useGsap"

type SiteFormData = {
  name: string
  siteCode: string
  address: string
  state: string
  district: string
  pinCode: string
  latitude: string
  longitude: string
  contactNumber: string
  email: string
  image: string
}

const DEFAULT_SITE_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"

const EMPTY_SITE_FORM: SiteFormData = {
  name: "",
  siteCode: "",
  address: "",
  state: "",
  district: "",
  pinCode: "",
  latitude: "",
  longitude: "",
  contactNumber: "",
  email: "",
  image: "",
}

const DEMO_SITE_FORM: SiteFormData = {
  name: "Demo Guest House",
  siteCode: "GH-DEMO-001",
  address: "MG Road, Bengaluru, Karnataka 560001",
  state: "Karnataka",
  district: "Bengaluru Urban",
  pinCode: "560001",
  latitude: "12.9716",
  longitude: "77.5946",
  contactNumber: "+91 80 2222 1001",
  email: "demo@guesthouse.gov.in",
  image: DEFAULT_SITE_IMAGE,
}

const SITE_FORM_FIELDS: { label: string; key: keyof Omit<SiteFormData, "image"> }[] = [
  { label: "Guest House Name", key: "name" },
  { label: "Guest House Code", key: "siteCode" },
  { label: "Address", key: "address" },
  { label: "State", key: "state" },
  { label: "District", key: "district" },
  { label: "Pin Code", key: "pinCode" },
  { label: "Latitude", key: "latitude" },
  { label: "Longitude", key: "longitude" },
  { label: "Contact Number", key: "contactNumber" },
  { label: "Email", key: "email" },
]

export function SiteManagementPage() {
  const pageRef = usePageTransition()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [createOpen, setCreateOpen] = useState(searchParams.get("action") === "add")
  const [siteForm, setSiteForm] = useState<SiteFormData>(EMPTY_SITE_FORM)
  const [isCreating, setIsCreating] = useState(false)

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-sites", page, search, status],
    queryFn: () =>
      fetchAdminSites({
        page,
        pageSize: 12,
        search,
        status: status === "all" ? undefined : status,
      }),
  })

  const handleAction = (action: string) => {
    toast.success(`${action} completed (demo)`)
  }

  useEffect(() => {
    if (searchParams.get("action") === "add") {
      setCreateOpen(true)
    }
  }, [searchParams])

  const handleCreateOpenChange = (open: boolean) => {
    setCreateOpen(open)
    if (!open) {
      setSiteForm(EMPTY_SITE_FORM)
      if (searchParams.get("action") === "add") {
        const next = new URLSearchParams(searchParams)
        next.delete("action")
        setSearchParams(next, { replace: true })
      }
    }
  }

  const fillDemoSiteForm = () => {
    setSiteForm(DEMO_SITE_FORM)
  }

  const handleCreateSite = async () => {
    setIsCreating(true)
    try {
      await createAdminSite(siteForm)
      await queryClient.invalidateQueries({ queryKey: ["admin-sites"] })
      toast.success("Guest house created successfully")
      handleCreateOpenChange(false)
      setPage(1)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create guest house")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Your listings"
        description={`${result?.total.toLocaleString("en-IN") ?? "100"} guest houses across India`}
        action={
          <div className="flex items-center gap-2">
            <ExportMenu />
            <Button className="rounded-full px-5" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-1.5 size-4" />
              Add listing
            </Button>
          </div>
        }
      />

      <Sheet open={createOpen} onOpenChange={handleCreateOpenChange}>
        <AdminSheetContent>
          <AdminSheetShell
            icon={Building2}
            title="Add a listing"
            description="Create a new guest house with photos, location, and contact details."
            headerAction={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full"
                onClick={fillDemoSiteForm}
              >
                Demo
              </Button>
            }
            footer={
              <AdminSheetSubmitButton
                disabled={isCreating}
                loading={isCreating}
                onClick={handleCreateSite}
              >
                {isCreating ? "Creating..." : "Create listing"}
              </AdminSheetSubmitButton>
            }
          >
            <div className="space-y-5">
              <AdminFormSection title="Photos">
                <RoomImageUpload
                  label="Cover photo"
                  image={siteForm.image}
                  onChange={(image) => setSiteForm((prev) => ({ ...prev, image }))}
                  hint="No photo selected — a default image will be used on the listing card."
                />
              </AdminFormSection>

              <AdminFormSection title="Location & contact">
                <div className="grid gap-4 sm:grid-cols-2">
                  {SITE_FORM_FIELDS.map(({ label, key }) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-sm font-medium">{label}</Label>
                      <Input
                        className={adminFieldInputClass}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        value={siteForm[key]}
                        onChange={(e) => setSiteForm((prev) => ({ ...prev, [key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </AdminFormSection>
            </div>
          </AdminSheetShell>
        </AdminSheetContent>
      </Sheet>

      <SearchFilterBar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        placeholder="Search by name, city, or code..."
        status={status}
        onStatusChange={(v) => { setStatus(v); setPage(1) }}
        statusOptions={[
          { value: "active", label: "Live" },
          { value: "inactive", label: "Unpublished" },
        ]}
      />

      <div className="space-y-4">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border/50 bg-card">
                <Skeleton className="h-44 w-full rounded-none sm:h-48" />
                <div className="space-y-2 p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-1 w-full rounded-full" />
                  <Skeleton className="h-6 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result?.data.map((site) => (
              <AdminSiteCard
                key={site.id}
                site={site}
                onEdit={() => handleAction("Site updated")}
                onToggleStatus={() =>
                  handleAction(site.status === "active" ? "Deactivated" : "Activated")
                }
              />
            ))}
          </div>
        )}
        {result && result.totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="flex items-center px-3 text-sm">Page {page} of {result.totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= result.totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </div>
    </div>
  )
}
