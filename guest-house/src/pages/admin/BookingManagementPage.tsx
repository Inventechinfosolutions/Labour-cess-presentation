import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Check, Eye, X } from "lucide-react"
import { fetchAdminBookings, updateAdminBookingStatus } from "@/services/adminApi"
import { AdminCardGrid } from "@/components/admin/AdminCardGrid"
import { AdminListToolbar } from "@/components/admin/AdminListToolbar"
import { AdminListView } from "@/components/admin/AdminListView"
import { DataTable } from "@/components/admin/DataTable"
import { ExportMenu } from "@/components/admin/ExportMenu"
import { BookingEntityCard } from "@/components/cards/admin/AdminEntityCards"
import { useViewMode } from "@/hooks/useViewMode"
import { PageHeader } from "@/components/shared/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/utils/format"
import { toast } from "sonner"
import { usePageTransition } from "@/hooks/useGsap"
import type { AdminBooking } from "@/types/admin"

export function BookingManagementPage() {
  const pageRef = usePageTransition()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [viewMode, setViewMode] = useViewMode("admin-bookings-view")

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-bookings", page, search, status],
    queryFn: () =>
      fetchAdminBookings({
        page,
        pageSize: 20,
        search,
        status: status === "all" ? undefined : status,
      }),
  })

  const handleAction = async (id: string, newStatus: AdminBooking["status"], label: string) => {
    await updateAdminBookingStatus(id, newStatus)
    queryClient.invalidateQueries({ queryKey: ["admin-bookings"] })
    toast.success(`Booking ${label} (demo)`)
  }

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Booking Management"
        description={`${result?.total.toLocaleString("en-IN") ?? "20,000"} bookings across all sites`}
        action={<ExportMenu />}
      />
      <AdminListToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        placeholder="Search bookings..."
        status={status}
        onStatusChange={(v) => { setStatus(v); setPage(1) }}
        statusOptions={[
          { value: "pending", label: "Pending" },
          { value: "confirmed", label: "Confirmed" },
          { value: "checked_in", label: "Checked In" },
          { value: "cancelled", label: "Cancelled" },
        ]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <AdminListView
        viewMode={viewMode}
        table={
          <DataTable<AdminBooking>
            columns={[
              { key: "id", header: "Booking ID", cell: (b) => <span className="font-mono text-xs">{b.id}</span> },
              { key: "guest", header: "Guest", cell: (b) => b.guest },
              { key: "site", header: "Site", cell: (b) => b.site },
              { key: "room", header: "Room", cell: (b) => b.room },
              { key: "dates", header: "Check-in / Out", cell: (b) => <span className="text-xs">{formatDate(b.checkIn)} — {formatDate(b.checkOut)}</span> },
              { key: "amount", header: "Amount", cell: (b) => formatCurrency(b.amount) },
              { key: "status", header: "Status", cell: (b) => <Badge variant="outline">{b.status}</Badge> },
              { key: "payment", header: "Payment", cell: (b) => <Badge>{b.paymentStatus}</Badge> },
              {
                key: "actions",
                header: "Actions",
                cell: (b) => (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" asChild><Link to={`/admin/bookings/${b.id}`}><Eye className="size-4" /></Link></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleAction(b.id, "confirmed", "approved")}><Check className="size-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleAction(b.id, "cancelled", "cancelled")}><X className="size-4" /></Button>
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
            renderCard={(b) => (
              <BookingEntityCard
                booking={b}
                onApprove={() => handleAction(b.id, "confirmed", "approved")}
                onCancel={() => handleAction(b.id, "cancelled", "cancelled")}
              />
            )}
          />
        }
      />
    </div>
  )
}
