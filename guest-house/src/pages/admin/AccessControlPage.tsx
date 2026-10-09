import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchAdminAccessLogs } from "@/services/adminApi"
import { AdminListToolbar } from "@/components/admin/AdminListToolbar"
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge"
import { DataTable } from "@/components/admin/DataTable"
import { PageHeader } from "@/components/shared/PageHeader"
import { usePageTransition } from "@/hooks/useGsap"
import type { AccessLog } from "@/types/admin"

export function AccessControlPage() {
  const pageRef = usePageTransition()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-access-logs", page, search, status],
    queryFn: () =>
      fetchAdminAccessLogs({
        page,
        pageSize: 15,
        search,
        status: status === "all" ? undefined : status,
      }),
  })

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Access Logs"
        description="Entry, exit, and credential events across all sites"
      />

      <AdminListToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        placeholder="Search user, site, or room..."
        status={status}
        onStatusChange={(v) => {
          setStatus(v)
          setPage(1)
        }}
        statusOptions={[
          { value: "entry", label: "Entry" },
          { value: "exit", label: "Exit" },
          { value: "denied", label: "Denied" },
          { value: "expired", label: "Expired" },
        ]}
        showViewToggle={false}
      />

      <DataTable<AccessLog>
        columns={[
          { key: "user", header: "User", cell: (l) => <span className="font-medium">{l.userName}</span> },
          { key: "site", header: "Site", cell: (l) => l.site },
          { key: "room", header: "Room", cell: (l) => l.room },
          { key: "event", header: "Event", cell: (l) => <AdminStatusBadge status={l.eventType} /> },
          { key: "credential", header: "Credential", cell: (l) => <AdminStatusBadge status={l.credentialType} /> },
          { key: "ip", header: "IP", cell: (l) => <span className="font-mono text-xs">{l.ipAddress}</span> },
        ]}
        result={result}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
      />
    </div>
  )
}
