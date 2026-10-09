import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { CalendarClock, Check, Clock, QrCode, UserCheck } from "lucide-react"
import { fetchAdminCheckIns, simulateAction } from "@/services/adminApi"
import { AdminHeroMetric } from "@/components/admin/AdminAnalyticsUI"
import { AdminListToolbar } from "@/components/admin/AdminListToolbar"
import { AdminListView } from "@/components/admin/AdminListView"
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge"
import { CheckInEntityCard } from "@/components/cards/admin/AdminEntityCards"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useViewMode } from "@/hooks/useViewMode"
import { toast } from "sonner"
import { usePageTransition } from "@/hooks/useGsap"
import type { CheckInRecord } from "@/types/admin"

const FALLBACK_CHECKINS: CheckInRecord[] = [
  { id: "1", bookingId: "GHB-2026-001", guest: "Rajesh Kumar", site: "Belagavi Guest House", room: "203", expectedTime: "14:00", status: "expected" },
  { id: "2", bookingId: "GHB-2026-002", guest: "Priya Sharma", site: "Bengaluru Guest House", room: "101", expectedTime: "15:30", status: "late" },
]

export function CheckInManagementPage() {
  const pageRef = usePageTransition()
  const [viewMode, setViewMode] = useViewMode("admin-checkin-view")
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const { data: checkIns, isLoading } = useQuery({
    queryKey: ["admin-checkins"],
    queryFn: fetchAdminCheckIns,
  })

  const items = checkIns?.length ? checkIns : FALLBACK_CHECKINS
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
  const late = items.filter((c) => c.status === "late").length
  const pending = items.filter((c) => c.status === "pending").length

  const handleAction = async (action: string) => {
    await simulateAction(action)
    toast.success(`${action} (demo)`)
  }

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Check-in"
        description="Manage today's arrivals, verify guests, and activate stays"
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <AdminHeroMetric
          label="Expected today"
          value={expected || 24}
          icon={CalendarClock}
          iconTone="blue"
          hint="Scheduled arrivals"
        />
        <AdminHeroMetric
          label="Late arrivals"
          value={late || 5}
          icon={Clock}
          iconTone="amber"
          hint="Past expected time"
        />
        <AdminHeroMetric
          label="Pending"
          value={pending || 8}
          icon={UserCheck}
          iconTone="violet"
          hint="Awaiting verification"
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
          { value: "late", label: "Late" },
          { value: "pending", label: "Pending" },
          { value: "completed", label: "Completed" },
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
                  Today&apos;s arrivals
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
                    No arrivals match your search or filter
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
                            <div className="flex items-center justify-end gap-2">
                              <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleAction("Verify Identity")}>
                                <UserCheck className="mr-1 size-3.5" />Verify
                              </Button>
                              <Button size="sm" variant="outline" className="rounded-full" onClick={() => handleAction("Generate QR")}>
                                <QrCode className="mr-1 size-3.5" />QR
                              </Button>
                              <Button size="sm" className="rounded-full" onClick={() => handleAction("Activate Stay")}>
                                <Check className="mr-1 size-3.5" />Check In
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
                No arrivals match your search or filter
              </div>
            ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map((c) => (
                <CheckInEntityCard
                  key={c.id}
                  record={c}
                  onVerify={() => handleAction("Verify Identity")}
                  onQr={() => handleAction("Generate QR")}
                  onCheckIn={() => handleAction("Activate Stay")}
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
