import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { CalendarClock, ClipboardCheck, DoorOpen, Receipt, Timer } from "lucide-react"
import { fetchAdminCheckOuts, simulateAction } from "@/services/adminApi"
import { AdminHeroMetric } from "@/components/admin/AdminAnalyticsUI"
import { AdminListToolbar } from "@/components/admin/AdminListToolbar"
import { AdminListView } from "@/components/admin/AdminListView"
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge"
import { CheckOutEntityCard } from "@/components/cards/admin/AdminEntityCards"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useViewMode } from "@/hooks/useViewMode"
import { toast } from "sonner"
import { usePageTransition } from "@/hooks/useGsap"
import type { CheckOutRecord } from "@/types/admin"

const FALLBACK_CHECKOUTS: CheckOutRecord[] = [
  { id: "1", bookingId: "GHB-2026-010", guest: "Amit Patel", site: "Mysuru Guest House", room: "105", expectedTime: "11:00", status: "expected" },
  { id: "2", bookingId: "GHB-2026-011", guest: "Sneha Reddy", site: "Mangaluru Guest House", room: "302", expectedTime: "10:00", status: "overstay" },
]

export function CheckOutManagementPage() {
  const pageRef = usePageTransition()
  const [viewMode, setViewMode] = useViewMode("admin-checkout-view")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const { data: checkOuts, isLoading } = useQuery({
    queryKey: ["admin-checkouts"],
    queryFn: fetchAdminCheckOuts,
  })

  const items = checkOuts?.length ? checkOuts : FALLBACK_CHECKOUTS
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((c) => {
      const matchesSearch =
        !q ||
        c.guest.toLowerCase().includes(q) ||
        c.site.toLowerCase().includes(q) ||
        c.bookingId.toLowerCase().includes(q) ||
        c.room.toLowerCase().includes(q)
      const matchesStatus = status === "all" || c.status === status
      return matchesSearch && matchesStatus
    })
  }, [items, search, status])

  const expected = items.filter((c) => c.status === "expected").length
  const completed = items.filter((c) => c.status === "completed").length
  const overstays = items.filter((c) => c.status === "overstay").length

  const handleAction = async (action: string) => {
    await simulateAction(action)
    toast.success(`${action} (demo)`)
  }

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Check-Out Management"
        description="Expected departures, room inspection, and stay closure"
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <AdminHeroMetric
          label="Expected"
          value={expected}
          icon={CalendarClock}
          iconTone="blue"
          hint="Departures today"
        />
        <AdminHeroMetric
          label="Completed"
          value={completed}
          icon={DoorOpen}
          iconTone="green"
          hint="Rooms released"
        />
        <AdminHeroMetric
          label="Overstays"
          value={overstays}
          icon={Timer}
          iconTone="rose"
          hint="Past checkout time"
        />
      </div>

      <AdminListToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search guest, site, room, or booking..."
        status={status}
        onStatusChange={setStatus}
        statusOptions={[
          { value: "expected", label: "Expected" },
          { value: "completed", label: "Completed" },
          { value: "overstay", label: "Overstay" },
        ]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <AdminListView
          viewMode={viewMode}
          table={
            <Card className="admin-card gap-0 py-0">
              <CardHeader className="border-b border-border/40 px-6 py-5">
                <CardTitle className="text-lg font-semibold">
                  Today&apos;s check-outs
                  {filteredItems.length !== items.length && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      ({filteredItems.length} of {items.length})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filteredItems.length === 0 ? (
                  <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                    No check-outs match your search or filter
                  </div>
                ) : (
                <div className="admin-table-wrap overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="admin-table-head">Guest</th>
                        <th className="admin-table-head">Site / Room</th>
                        <th className="admin-table-head">Booking</th>
                        <th className="admin-table-head">Expected</th>
                        <th className="admin-table-head">Status</th>
                        <th className="admin-table-head text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredItems.map((c) => (
                        <tr key={c.id} className="transition-colors hover:bg-muted/30">
                          <td className="px-6 py-4 font-medium">{c.guest}</td>
                          <td className="px-6 py-4 text-muted-foreground">{c.site} · Room {c.room}</td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{c.bookingId}</td>
                          <td className="px-6 py-4">{c.expectedTime}</td>
                          <td className="px-6 py-4"><AdminStatusBadge status={c.status} /></td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap items-center justify-end gap-2">
                              <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleAction("Inspect Room")}>
                                <ClipboardCheck className="mr-1 size-3.5" />Inspect
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleAction("Generate Bill")}>
                                <Receipt className="mr-1 size-3.5" />Bill
                              </Button>
                              <Button size="sm" className="rounded-full" onClick={() => handleAction("Release Room")}>
                                <DoorOpen className="mr-1 size-3.5" />Close Stay
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )}
              </CardContent>
            </Card>
          }
          cards={
            filteredItems.length === 0 ? (
              <div className="admin-card flex h-48 items-center justify-center text-muted-foreground">
                No check-outs match your search or filter
              </div>
            ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((c) => (
                <CheckOutEntityCard
                  key={c.id}
                  record={c}
                  onInspect={() => handleAction("Inspect Room")}
                  onBill={() => handleAction("Generate Bill")}
                  onClose={() => handleAction("Release Room")}
                />
              ))}
            </div>
            )
          }
        />
      )}
    </div>
  )
}
