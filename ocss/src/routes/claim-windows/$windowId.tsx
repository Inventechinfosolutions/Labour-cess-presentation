import { useMemo, useState } from "react"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import {
  Building2,
  CalendarClock,
  FileStack,
  Search,
  Users,
} from "lucide-react"
import { ExecutiveMetricTile } from "@/components/drilldown/companies-executive-panel"
import { EntityTable } from "@/components/drilldown/entity-table"
import {
  type EntityView,
  PageHero,
  PageShell,
  SectionCard,
  ViewToggle,
} from "@/components/drilldown/page-shell"
import { EntityCard } from "@/components/drilldown/entity-card"
import { ReportSectionIntro } from "@/components/drilldown/report-shell"
import { claimWindows } from "@/data/dashboard-data"
import { claimRecords, feCompanies } from "@/data/kpi-drilldown-data"
import { formatINR, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/claim-windows/$windowId")({
  component: ClaimWindowDetailPage,
})

const statusLabel = {
  open: "Open now",
  "closing-soon": "Closing soon",
  closed: "Closed",
} as const

const statusAccent = {
  open: "#16a34a",
  "closing-soon": "#f59e0b",
  closed: "#64748b",
} as const

function ClaimWindowDetailPage() {
  const { windowId } = Route.useParams()
  const window = claimWindows.find((w) => w.id === windowId)
  if (!window) throw notFound()

  const company = feCompanies.find((c) => c.id === window.companyId)
  const accent = company?.accent ?? statusAccent[window.status]

  const [view, setView] = useState<EntityView>("table")
  const [query, setQuery] = useState("")

  const relatedClaims = useMemo(
    () =>
      claimRecords.filter((c) =>
        c.investments.some((i) => i.companyId === window.companyId),
      ),
    [window.companyId],
  )

  const filteredClaims = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return relatedClaims
    return relatedClaims.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.claimId.toLowerCase().includes(q) ||
        c.customerId.toLowerCase().includes(q),
    )
  }, [relatedClaims, query])

  const sampleAmount = relatedClaims.reduce((s, c) => s + c.claimAmount, 0)

  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow={`Claim window · ${statusLabel[window.status]}`}
        title={window.company}
        description={`Depositors may file claims from ${window.from} to ${window.to}. ${formatNumber(window.claimsReceived)} claims received in this notification window.`}
        icon={CalendarClock}
        backTo="/"
        backLabel="Back to overview"
        accent={accent}
      />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ExecutiveMetricTile
          label="Claims in window"
          value={formatNumber(window.claimsReceived)}
          hint={`${window.from} → ${window.to}`}
          icon={FileStack}
          color={accent}
          soft="#e0f2fe"
          style={{ animationDelay: "0ms" }}
        />
        <ExecutiveMetricTile
          label="Window status"
          value={statusLabel[window.status]}
          hint="Filing invitation state"
          icon={CalendarClock}
          color={statusAccent[window.status]}
          soft={
            window.status === "open"
              ? "#dcfce7"
              : window.status === "closing-soon"
                ? "#fef3c7"
                : "#f1f5f9"
          }
          style={{ animationDelay: "55ms" }}
        />
        <ExecutiveMetricTile
          label="Depositors affected"
          value={formatNumber(company?.victims ?? 0)}
          hint="Depositors linked to this entity"
          icon={Users}
          color="#0ea5e9"
          soft="#e0f2fe"
          style={{ animationDelay: "110ms" }}
        />
        <ExecutiveMetricTile
          label="Total claim amount"
          value={formatINR(sampleAmount, false)}
          hint={`${formatNumber(relatedClaims.length)} related claims`}
          icon={Building2}
          color="#f59e0b"
          soft="#fef3c7"
          style={{ animationDelay: "165ms" }}
        />
      </ul>

      {company && (
        <Link
          to="/companies/$companyId"
          params={{ companyId: company.id }}
          className="stagger-in flex items-center justify-between gap-3 rounded-md border border-black/[0.05] bg-white p-4 transition-all hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)] dark:border-white/[0.08] dark:bg-[#141c2c]"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex size-11 items-center justify-center rounded-md text-white"
              style={{
                background: `linear-gradient(145deg, ${company.accent}, ${company.accent}cc)`,
              }}
            >
              <Building2 className="size-5" />
            </div>
            <div>
              <p className="font-display text-base font-semibold text-foreground">
                {company.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Open full fraudulent entity profile — schemes, recovery, disbursements
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold" style={{ color: accent }}>
            Open entity →
          </span>
        </Link>
      )}

      <SectionCard className="stagger-in">
        <div className="mb-5 flex flex-col gap-4 border-b border-border/50 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <ReportSectionIntro
            title="Claims in this window"
            countLabel={`${filteredClaims.length} shown`}
            description="Claims filed against this fraudulent entity during the notification period."
            accent={accent}
            soft="#e0f2fe"
          />
          <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 sm:w-auto">
            <label className="relative min-w-0 flex-1 sm:w-[240px] sm:flex-none">
              <span className="sr-only">Search claims</span>
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-muted-foreground/80" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search claims…"
                className={cn(
                  "h-10 w-full rounded-full border border-black/[0.08] bg-white pl-9 pr-3.5 text-sm",
                  "outline-none dark:border-white/10 dark:bg-[#141c2c]",
                )}
              />
            </label>
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>

        {view === "card" ? (
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredClaims.map((c, i) => (
              <li
                key={c.id}
                className="stagger-in"
                style={{ animationDelay: `${i * 55}ms` }}
              >
                <EntityCard
                  layout="card"
                  to="/claims/$claimId"
                  params={{ claimId: c.id }}
                  accent={accent}
                  icon={FileStack}
                  title={c.name}
                  badge={c.status}
                  metrics={[
                    {
                      value: formatINR(c.claimAmount, false),
                      label: "claim amount",
                      emphasize: true,
                    },
                    { value: c.claimId, label: "claim ID" },
                    { value: c.district, label: "district" },
                    { value: c.customerId, label: "customer" },
                  ]}
                />
              </li>
            ))}
            {filteredClaims.length === 0 && (
              <li className="rounded-md border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                No claims match this search
              </li>
            )}
          </ul>
        ) : (
          <EntityTable
            emptyLabel="No claims match this search"
            columns={[
              { key: "status", header: "Status", align: "left" },
              { key: "amount", header: "Amount", align: "right" },
              { key: "district", header: "District", align: "left" },
            ]}
            rows={filteredClaims.map((c) => ({
              id: c.id,
              to: "/claims/$claimId" as const,
              params: { claimId: c.id },
              accent,
              icon: FileStack,
              title: c.name,
              subtitle: c.claimId,
              cells: {
                status: { value: c.status },
                amount: {
                  value: formatINR(c.claimAmount, false),
                  emphasize: true,
                },
                district: { value: c.district },
              },
            }))}
          />
        )}
      </SectionCard>

      <div className="flex flex-wrap gap-2">
        {claimWindows.map((w) => {
          const active = w.id === windowId
          const c = feCompanies.find((x) => x.id === w.companyId)
          const a = c?.accent ?? statusAccent[w.status]
          return (
            <Link
              key={w.id}
              to="/claim-windows/$windowId"
              params={{ windowId: w.id }}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "text-white"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              style={active ? { background: a } : undefined}
            >
              {w.company}
            </Link>
          )
        })}
      </div>

    </PageShell>
  )
}
