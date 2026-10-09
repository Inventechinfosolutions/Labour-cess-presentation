import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchAdminAuditLogs } from "@/services/adminApi"
import { AuditLogFeed } from "@/components/admin/AuditLogFeed"
import { AdminListToolbar } from "@/components/admin/AdminListToolbar"
import { ExportMenu } from "@/components/admin/ExportMenu"
import { PageHeader } from "@/components/shared/PageHeader"
import { usePageTransition } from "@/hooks/useGsap"

const MODULE_FILTERS = [
  { value: "Sites", label: "Sites" },
  { value: "Bookings", label: "Bookings" },
  { value: "Users", label: "Users" },
  { value: "Payments", label: "Payments" },
  { value: "Access", label: "Access" },
  { value: "Rooms", label: "Rooms" },
  { value: "Settings", label: "Settings" },
]

export function AuditLogsPage() {
  const pageRef = usePageTransition()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [module, setModule] = useState("all")

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-audit", page, search, module],
    queryFn: () =>
      fetchAdminAuditLogs({
        page,
        pageSize: 15,
        search,
        status: module === "all" ? undefined : module,
      }),
  })

  const summary = useMemo(() => {
    if (!result) return null
    return `${result.total.toLocaleString("en-IN")} events tracked`
  }, [result])

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Audit Logs"
        description="Activity trail across your guest house — who changed what, and when"
        action={<ExportMenu />}
      />

      <AdminListToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        placeholder="Search by actor, action, or IP..."
        status={module}
        onStatusChange={(v) => {
          setModule(v)
          setPage(1)
        }}
        statusOptions={MODULE_FILTERS}
        showViewToggle={false}
      />

      {summary && !isLoading && (
        <p className="-mt-3 mb-4 text-sm text-muted-foreground">{summary}</p>
      )}

      <AuditLogFeed
        result={result}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
      />
    </div>
  )
}
