import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Check, Eye, UserPlus, X } from "lucide-react"
import { fetchAdminUsers } from "@/services/adminApi"
import { AdminCardGrid } from "@/components/admin/AdminCardGrid"
import { AdminListToolbar } from "@/components/admin/AdminListToolbar"
import { AdminListView } from "@/components/admin/AdminListView"
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge"
import { DataTable } from "@/components/admin/DataTable"
import { ExportMenu } from "@/components/admin/ExportMenu"
import { UserAvatarCell } from "@/components/admin/UserAvatarCell"
import { UserEntityCard } from "@/components/cards/admin/AdminEntityCards"
import { useViewMode } from "@/hooks/useViewMode"
import { PageHeader } from "@/components/shared/PageHeader"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { usePageTransition } from "@/hooks/useGsap"
import type { AdminUser } from "@/types/admin"

export function UserManagementPage() {
  const pageRef = usePageTransition()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [viewMode, setViewMode] = useViewMode("admin-users-view")

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, status],
    queryFn: () =>
      fetchAdminUsers({
        page,
        pageSize: 20,
        search,
        status: status === "all" ? undefined : status,
      }),
  })

  const handleAction = (action: string) => toast.success(`User ${action} (demo)`)

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="User Management"
        description={`${result?.total.toLocaleString("en-IN") ?? "5,000"} government employees`}
        action={
          <div className="flex gap-2">
            <ExportMenu />
            <Button size="sm" className="rounded-full px-5" onClick={() => handleAction("invited")}>
              <UserPlus className="mr-1.5 size-4" />
              Invite User
            </Button>
          </div>
        }
      />
      <AdminListToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        placeholder="Search users..."
        status={status}
        onStatusChange={(v) => { setStatus(v); setPage(1) }}
        statusOptions={[
          { value: "active", label: "Active" },
          { value: "suspended", label: "Suspended" },
          { value: "pending", label: "Pending" },
        ]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <AdminListView
        viewMode={viewMode}
        table={
          <DataTable<AdminUser>
            columns={[
              {
                key: "name",
                header: "User",
                cell: (u) => (
                  <UserAvatarCell
                    id={u.id}
                    name={u.name}
                    subtitle={u.employeeId}
                    href={`/admin/users/${u.id}`}
                  />
                ),
              },
              { key: "dept", header: "Department", cell: (u) => u.department },
              { key: "designation", header: "Designation", cell: (u) => u.designation },
              { key: "email", header: "Email", cell: (u) => <span className="text-xs">{u.email}</span> },
              { key: "mobile", header: "Mobile", cell: (u) => u.mobile },
              { key: "verification", header: "Verification", cell: (u) => <Badge variant={u.verificationStatus === "verified" ? "default" : "secondary"}>{u.verificationStatus}</Badge> },
              { key: "status", header: "Status", cell: (u) => <AdminStatusBadge status={u.status} /> },
              {
                key: "actions",
                header: "Actions",
                cell: (u) => (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" asChild><Link to={`/admin/users/${u.id}`}><Eye className="size-4" /></Link></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleAction("approved")}><Check className="size-4 text-emerald-600" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleAction("rejected")}><X className="size-4 text-destructive" /></Button>
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
            renderCard={(u) => (
              <UserEntityCard
                user={u}
                onApprove={() => handleAction("approved")}
                onReject={() => handleAction("rejected")}
              />
            )}
          />
        }
      />
    </div>
  )
}
