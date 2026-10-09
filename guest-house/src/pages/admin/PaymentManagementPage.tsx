import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  IndianRupee,
  Landmark,
  RefreshCcw,
  Smartphone,
  Wallet,
  X,
  XCircle,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { fetchAdminRefunds, fetchAdminTransactions, simulateAction } from "@/services/adminApi"
import { AdminHeroMetric } from "@/components/admin/AdminAnalyticsUI"
import { AdminListToolbar } from "@/components/admin/AdminListToolbar"
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge"
import { DataTable } from "@/components/admin/DataTable"
import { ExportMenu } from "@/components/admin/ExportMenu"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/utils/format"
import { toast } from "sonner"
import { usePageTransition } from "@/hooks/useGsap"
import type { RefundRequest, Transaction } from "@/types/admin"

const PAYMENT_METHODS: {
  id: string
  label: string
  description: string
  icon: LucideIcon
  tone: string
}[] = [
  {
    id: "upi",
    label: "UPI",
    description: "Instant transfers",
    icon: Smartphone,
    tone: "bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400",
  },
  {
    id: "card",
    label: "Cards",
    description: "Credit & debit",
    icon: CreditCard,
    tone: "bg-primary/10 text-primary",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    description: "Bank transfers",
    icon: Landmark,
    tone: "bg-sky-100 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400",
  },
  {
    id: "wallet",
    label: "Wallet",
    description: "Prepaid balance",
    icon: Wallet,
    tone: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
  },
]

export function PaymentManagementPage() {
  const pageRef = usePageTransition()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")

  const { data: result, isLoading } = useQuery({
    queryKey: ["admin-transactions", page, search, status],
    queryFn: () =>
      fetchAdminTransactions({
        page,
        pageSize: 20,
        search,
        status: status === "all" ? undefined : status,
      }),
  })

  const { data: refunds } = useQuery({
    queryKey: ["admin-refunds"],
    queryFn: fetchAdminRefunds,
  })

  const success = result?.data.filter((t) => t.status === "success").length ?? 0
  const failed = result?.data.filter((t) => t.status === "failed").length ?? 0
  const pending = result?.data.filter((t) => t.status === "pending").length ?? 0
  const revenue = result?.data.reduce((s, t) => s + t.amount, 0) ?? 0
  const refundsPending = refunds?.filter((r) => r.status === "pending").length ?? 0

  const refundRows = useMemo(() => {
    const list = refunds ?? []
    const pendingFirst = [
      ...list.filter((r) => r.status === "pending"),
      ...list.filter((r) => r.status !== "pending"),
    ]
    return pendingFirst.slice(0, 8)
  }, [refunds])

  const handleRefund = async (action: string) => {
    await simulateAction(action)
    toast.success(`Refund ${action} (demo)`)
  }

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Earnings"
        description="Transaction history, payment channels, and refund requests"
        action={<ExportMenu />}
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <AdminHeroMetric
          label="Revenue (page)"
          value={formatCurrency(revenue)}
          icon={IndianRupee}
          iconTone="coral"
          hint="Current page total"
        />
        <AdminHeroMetric
          label="Success"
          value={success}
          icon={CheckCircle2}
          iconTone="green"
          hint="Completed payments"
        />
        <AdminHeroMetric
          label="Failed"
          value={failed}
          icon={XCircle}
          iconTone="rose"
          hint="Declined transactions"
        />
        <AdminHeroMetric
          label="Pending"
          value={pending}
          icon={Clock}
          iconTone="amber"
          hint="Awaiting confirmation"
        />
        <AdminHeroMetric
          label="Refunds pending"
          value={refundsPending}
          icon={RefreshCcw}
          iconTone="violet"
          hint="Needs review"
        />
      </div>

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <section className="admin-card overflow-hidden">
          <div className="border-b border-border/40 px-5 py-4">
            <h3 className="text-sm font-semibold text-foreground">Payment methods</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Channels enabled for guest payments</p>
          </div>
          <ul className="divide-y divide-border/40">
            {PAYMENT_METHODS.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${m.tone}`}>
                  <m.icon className="size-4" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.description}</p>
                </div>
                <AdminStatusBadge status="active" />
              </li>
            ))}
          </ul>
        </section>

        <section className="admin-card overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-border/40 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Refund requests</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {refundsPending > 0
                  ? `${refundsPending} pending · review and approve`
                  : "No pending refunds"}
              </p>
            </div>
            {refundsPending > 0 && (
              <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-950/50 dark:text-violet-400">
                {refundsPending} open
              </span>
            )}
          </div>

          {refundRows.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
              No refund requests yet
            </div>
          ) : (
            <div className="admin-table-wrap overflow-x-auto rounded-none border-0 shadow-none">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="admin-table-head">Guest</th>
                    <th className="admin-table-head">Amount</th>
                    <th className="admin-table-head">Status</th>
                    <th className="admin-table-head text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {refundRows.map((r) => (
                    <RefundRow key={r.id} refund={r} onApprove={() => handleRefund("approved")} onReject={() => handleRefund("rejected")} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <AdminListToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        placeholder="Search transaction, guest, or booking..."
        status={status}
        onStatusChange={(v) => {
          setStatus(v)
          setPage(1)
        }}
        statusOptions={[
          { value: "success", label: "Success" },
          { value: "pending", label: "Pending" },
          { value: "failed", label: "Failed" },
          { value: "refunded", label: "Refunded" },
        ]}
        showViewToggle={false}
      />

      <DataTable<Transaction>
        columns={[
          { key: "id", header: "TXN ID", cell: (t) => <span className="font-mono text-xs">{t.id}</span> },
          { key: "booking", header: "Booking", cell: (t) => t.bookingId },
          { key: "guest", header: "Guest", cell: (t) => <span className="font-medium">{t.guest}</span> },
          { key: "method", header: "Method", cell: (t) => <AdminStatusBadge status={t.method} /> },
          { key: "amount", header: "Amount", cell: (t) => <span className="font-semibold tabular-nums">{formatCurrency(t.amount)}</span> },
          { key: "status", header: "Status", cell: (t) => <AdminStatusBadge status={t.status} /> },
        ]}
        result={result}
        isLoading={isLoading}
        page={page}
        onPageChange={setPage}
      />
    </div>
  )
}

function RefundRow({
  refund,
  onApprove,
  onReject,
}: {
  refund: RefundRequest
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <tr className="transition-colors hover:bg-muted/30">
      <td className="px-5 py-3.5">
        <p className="font-medium">{refund.guest}</p>
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{refund.bookingId}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{refund.reason}</p>
      </td>
      <td className="px-5 py-3.5">
        <p className="font-semibold tabular-nums">{formatCurrency(refund.requestedAmount)}</p>
        <p className="text-xs text-muted-foreground">of {formatCurrency(refund.amount)}</p>
      </td>
      <td className="px-5 py-3.5">
        <AdminStatusBadge status={refund.status} />
        <p className="mt-1 text-[11px] text-muted-foreground">{formatDate(refund.createdAt)}</p>
      </td>
      <td className="px-5 py-3.5">
        {refund.status === "pending" ? (
          <div className="flex items-center justify-end gap-1.5">
            <Button size="sm" className="h-8 rounded-full px-3" onClick={onApprove}>
              <Check className="mr-1 size-3.5" />
              Approve
            </Button>
            <Button size="sm" variant="outline" className="size-8 rounded-full" onClick={onReject}>
              <X className="size-3.5" />
            </Button>
          </div>
        ) : (
          <span className="block text-right text-xs text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  )
}
