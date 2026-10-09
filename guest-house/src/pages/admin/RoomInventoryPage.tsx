import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Ban, Crown, Sparkles, Wrench } from "lucide-react"
import { fetchAdminRooms, updateRoomInventoryStatus, simulateAction } from "@/services/adminApi"
import { AdminCardGrid } from "@/components/admin/AdminCardGrid"
import { AdminListToolbar } from "@/components/admin/AdminListToolbar"
import { AdminListView } from "@/components/admin/AdminListView"
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge"
import { DataTable } from "@/components/admin/DataTable"
import { InventoryRoomEntityCard } from "@/components/cards/admin/AdminEntityCards"
import { useViewMode } from "@/hooks/useViewMode"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { usePageTransition } from "@/hooks/useGsap"
import type { AdminRoom, RoomInventoryStatus } from "@/types/admin"

const STATUS_COUNTS: RoomInventoryStatus[] = [
  "available", "occupied", "blocked", "reserved", "maintenance", "cleaning",
]

export function RoomInventoryPage() {
  const pageRef = usePageTransition()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useViewMode("admin-inventory-view")

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-inventory", page, search],
    queryFn: () => fetchAdminRooms({ page, pageSize: 20, search }),
  })

  const handleStatus = async (id: string, status: RoomInventoryStatus, label: string) => {
    await updateRoomInventoryStatus(id, status)
    queryClient.invalidateQueries({ queryKey: ["admin-inventory"] })
    toast.success(`Room ${label} (demo)`)
  }

  const handleAction = async (action: string) => {
    await simulateAction(action)
    toast.success(`${action} scheduled (demo)`)
  }

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Room Inventory Management"
        description="Block, reserve, schedule maintenance, and manage room status"
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {STATUS_COUNTS.map((s) => (
          <Card key={s}>
            <CardContent className="p-3 text-center">
              <p className="text-xs capitalize text-muted-foreground">{s}</p>
              <p className="text-lg font-bold">
                {result?.data.filter((r) => r.status === s).length ?? "—"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AdminListToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        placeholder="Search inventory..."
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <AdminListView
        viewMode={viewMode}
        table={
          <DataTable<AdminRoom>
            columns={[
              { key: "room", header: "Room", cell: (r) => r.number },
              { key: "site", header: "Site", cell: (r) => r.siteName },
              { key: "status", header: "Status", cell: (r) => <AdminStatusBadge status={r.status} /> },
              {
                key: "actions",
                header: "Actions",
                cell: (r) => (
                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleStatus(r.id, "blocked", "blocked")}><Ban className="size-3" /></Button>
                    <Button size="sm" variant="outline" onClick={() => handleStatus(r.id, "reserved", "reserved")}><Crown className="size-3" /></Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction("Maintenance")}><Wrench className="size-3" /></Button>
                    <Button size="sm" variant="outline" onClick={() => handleAction("Cleaning")}><Sparkles className="size-3" /></Button>
                  </div>
                ),
              },
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
            renderCard={(r) => (
              <InventoryRoomEntityCard
                room={r}
                onBlock={() => handleStatus(r.id, "blocked", "blocked")}
                onReserve={() => handleStatus(r.id, "reserved", "reserved")}
              />
            )}
          />
        }
      />
    </div>
  )
}
