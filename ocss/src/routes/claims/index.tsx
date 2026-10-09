import { useEffect, useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { FileStack, Search, Wallet } from "lucide-react"
import { claimRecords, kpiLabels, matchesPersonSearch, programmeTotals } from "@/data/kpi-drilldown-data"
import { formatINR, formatNumber } from "@/lib/format"
import { EntityCard } from "@/components/drilldown/entity-card"
import { EntityTable } from "@/components/drilldown/entity-table"
import { FilterToolbar } from "@/components/drilldown/filter-toolbar"
import {
  getPageItems,
  getTotalPages,
  ListPagination,
} from "@/components/drilldown/list-pagination"
import {
  type EntityView,
  PageHero,
  PageShell,
  SectionCard,
  SparkStatCard,
  ViewToggle,
} from "@/components/drilldown/page-shell"

export const Route = createFileRoute("/claims/")({
  component: ClaimsPage,
})

const PAGE_SIZE = 4
const accents = ["#3b82f6", "#0ea5e9", "#8b5cf6", "#22c55e", "#f59e0b", "#f97316", "#6366f1", "#f43f5e"]

const statusLabel: Record<string, string> = {
  Approved: "Approved",
  "Settlement calculated": "Settlement",
  "Under Evaluation": "Evaluation",
  "Documents pending": "Pending",
  "Payment queued": "Queued",
}

const statusFilters = [
  { value: "all", label: "All" },
  ...[...new Set(claimRecords.map((c) => c.status))].map((status) => ({
    value: status,
    label: statusLabel[status] ?? status,
  })),
]

function ClaimsPage() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const [view, setView] = useState<EntityView>("table")
  const [page, setPage] = useState(1)

  const filtered = useMemo(
    () =>
      claimRecords.filter((c) => {
        if (filter !== "all" && c.status !== filter) return false
        return matchesPersonSearch(query, c)
      }),
    [filter, query],
  )

  useEffect(() => {
    setPage(1)
  }, [filter, query])

  useEffect(() => {
    const max = getTotalPages(filtered.length, PAGE_SIZE)
    if (page > max) setPage(max)
  }, [filtered.length, page])

  const paged = useMemo(
    () => getPageItems(filtered, page, PAGE_SIZE),
    [filtered, page],
  )

  return (
    <PageShell>
      <PageHero
        eyebrow="Settlement requests"
        title={kpiLabels.claims}
        description="Search claimants by name, PAN, Aadhaar, or customer ID. Open a claim to view fraudulent entities, schemes, deposit amounts, and returns received."
        icon={FileStack}
        backTo="/"
        accent="#3b82f6"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <SparkStatCard
          id="cl-total"
          label={kpiLabels.claims}
          value={formatNumber(programmeTotals.claims)}
          tone="blue"
          icon={FileStack}
          spark={[131000, 142000, 138500, 149200, 146800, 154600, programmeTotals.claims]}
        />
        <SparkStatCard
          id="cl-match"
          label="Matching records"
          value={formatNumber(filtered.length)}
          tone="cyan"
          icon={Search}
          spark={[8, 7, 6, 5, 6, 7, filtered.length || 1]}
        />
        <SparkStatCard
          id="cl-amt"
          label="Total claim amount"
          value={formatINR(claimRecords.reduce((s, c) => s + c.claimAmount, 0))}
          tone="gold"
          icon={Wallet}
          spark={[50, 58, 64, 72, 80, 88, 95]}
        />
      </div>

      <SectionCard
        title="Claims register"
        description="Open a claim for full deposit detail"
        toolbar={
          <FilterToolbar
            search={query}
            onSearchChange={setQuery}
            searchPlaceholder="Search claims…"
            searchLabel="Search claims"
            filters={statusFilters}
            filterValue={filter}
            onFilterChange={setFilter}
            filterLabel="Filter by status"
            trailing={<ViewToggle view={view} onChange={setView} />}
          />
        }
      >
        {view === "card" ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paged.map((c, idx) => (
              <li key={c.id}>
                <EntityCard
                  layout="card"
                  to="/claims/$claimId"
                  params={{ claimId: c.id }}
                  accent={accents[((page - 1) * PAGE_SIZE + idx) % accents.length]}
                  icon={FileStack}
                  title={c.name}
                  badge={c.status}
                  metrics={[
                    {
                      value: formatINR(c.claimAmount, false),
                      label: "claim",
                      emphasize: true,
                    },
                    { value: c.claimId, label: "claim ID" },
                    { value: c.district, label: "district" },
                    { value: c.pan, label: "PAN" },
                  ]}
                />
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="rounded-md border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                No claims match this search
              </li>
            )}
          </ul>
        ) : (
          <EntityTable
            emptyLabel="No claims match this search"
            columns={[
              { key: "claimId", header: "Claim ID" },
              { key: "status", header: "Status" },
              { key: "district", header: "District" },
              { key: "amount", header: "Amount", align: "right" },
            ]}
            rows={paged.map((c, idx) => ({
              id: c.id,
              to: "/claims/$claimId" as const,
              params: { claimId: c.id },
              accent: accents[((page - 1) * PAGE_SIZE + idx) % accents.length],
              icon: FileStack,
              title: c.name,
              subtitle: c.customerId,
              cells: {
                claimId: { value: c.claimId },
                status: { value: c.status },
                district: { value: c.district },
                amount: { value: formatINR(c.claimAmount, false) },
              },
            }))}
          />
        )}

        <ListPagination
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          onPageChange={setPage}
        />
      </SectionCard>
    </PageShell>
  )
}
