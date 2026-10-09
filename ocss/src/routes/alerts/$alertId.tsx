import { useMemo, useState } from "react"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import {
  AlertTriangle,
  Bell,
  Building2,
  CalendarClock,
  Copy,
  FileWarning,
  MessageSquareWarning,
  Search,
  Users,
} from "lucide-react"
import { ExecutiveMetricTile } from "@/components/drilldown/companies-executive-panel"
import {
  PageHero,
  PageShell,
  SectionCard,
} from "@/components/drilldown/page-shell"
import { ReportSectionIntro } from "@/components/drilldown/report-shell"
import {
  getAlertDetail,
  type AlertCaseRow,
} from "@/data/alert-drilldown-data"
import { alerts } from "@/data/dashboard-data"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/alerts/$alertId")({
  component: AlertDetailPage,
})

const titleIcons = {
  a1: Copy,
  a2: FileWarning,
  a3: MessageSquareWarning,
  a4: FileWarning,
  a5: CalendarClock,
} as const

function CaseLink({
  c,
  children,
  className,
}: {
  c: AlertCaseRow
  children: React.ReactNode
  className?: string
}) {
  if (c.to === "/victims/$victimId" && c.params && "victimId" in c.params) {
    return (
      <Link to={c.to} params={c.params} className={className}>
        {children}
      </Link>
    )
  }
  if (c.to === "/claims/$claimId" && c.params && "claimId" in c.params) {
    return (
      <Link to={c.to} params={c.params} className={className}>
        {children}
      </Link>
    )
  }
  if (c.to === "/companies/$companyId" && c.params && "companyId" in c.params) {
    return (
      <Link to={c.to} params={c.params} className={className}>
        {children}
      </Link>
    )
  }
  return <div className={className}>{children}</div>
}

function AlertDetailPage() {
  const { alertId } = Route.useParams()
  const detail = getAlertDetail(alertId)
  if (!detail) throw notFound()

  const [query, setQuery] = useState("")
  const Icon =
    titleIcons[alertId as keyof typeof titleIcons] ?? AlertTriangle

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return detail.cases
    return detail.cases.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.meta.toLowerCase().includes(q),
    )
  }, [detail.cases, query])

  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow={`Alert · ${detail.alert.severity}`}
        title={detail.alert.title}
        description={detail.alert.detail}
        icon={Icon}
        backTo="/"
        backLabel="Back to overview"
        accent={detail.accent}
      />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ExecutiveMetricTile
          label="Items flagged"
          value={formatNumber(detail.alert.count)}
          hint={`Updated ${detail.alert.time}`}
          icon={Bell}
          color={detail.accent}
          soft={detail.soft}
          style={{ animationDelay: "0ms" }}
        />
        <ExecutiveMetricTile
          label="Severity"
          value={detail.alert.severity.toUpperCase()}
          hint="Officer priority band"
          icon={AlertTriangle}
          color={detail.accent}
          soft={detail.soft}
          style={{ animationDelay: "55ms" }}
        />
        <ExecutiveMetricTile
          label="Related cases"
          value={formatNumber(detail.cases.length)}
          hint="Shown in this drill-down"
          icon={Users}
          color="#3b82f6"
          soft="#dbeafe"
          style={{ animationDelay: "110ms" }}
        />
        <ExecutiveMetricTile
          label="Active alerts"
          value={formatNumber(alerts.length)}
          hint="On the home attention list"
          icon={Bell}
          color="#0ea5e9"
          soft="#e0f2fe"
          style={{ animationDelay: "165ms" }}
        />
      </ul>

      <div
        className="stagger-in rounded-md border border-black/[0.05] p-4 dark:border-white/[0.08]"
        style={{
          background: `linear-gradient(135deg, ${detail.soft} 0%, transparent 70%)`,
        }}
      >
        <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
          Recommended action
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground">
          {detail.actionHint}
        </p>
      </div>

      <SectionCard className="stagger-in">
        <div className="mb-5 flex flex-col gap-4 border-b border-border/50 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <ReportSectionIntro
            title="Related records"
            countLabel={`${filtered.length} shown`}
            description="People and claims linked to this alert — open any row for full detail."
            accent={detail.accent}
            soft={detail.soft}
          />
          <label className="relative w-full min-w-0 sm:w-[240px]">
            <span className="sr-only">Search related records</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-3.5 -translate-y-1/2 text-muted-foreground/80" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search related records…"
              className={cn(
                "h-10 w-full rounded-full border border-black/[0.08] bg-white pl-9 pr-3.5 text-sm",
                "outline-none dark:border-white/10 dark:bg-[#141c2c]",
              )}
            />
          </label>
        </div>

        <ul className="space-y-2.5">
          {filtered.map((c, i) => (
            <li
              key={`${c.id}-${i}`}
              className="stagger-in"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <CaseLink
                c={c}
                className={cn(
                  "block rounded-md border border-black/[0.05] bg-white p-3.5 transition-all",
                  "hover:shadow-[0_8px_24px_rgba(15,23,42,0.06)]",
                  "dark:border-white/[0.08] dark:bg-[#141c2c]",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-md text-white"
                    style={{
                      background: `linear-gradient(145deg, ${c.accent}, ${c.accent}cc)`,
                    }}
                  >
                    {c.to?.includes("companies") ? (
                      <Building2 className="size-4" />
                    ) : (
                      <Users className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-semibold text-foreground">
                      {c.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {c.subtitle}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground/90">
                      {c.meta}
                    </p>
                  </div>
                </div>
              </CaseLink>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="rounded-md border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
              No related records match this search
            </li>
          )}
        </ul>
      </SectionCard>

      <div className="flex flex-wrap gap-2">
        {alerts.map((a) => {
          const active = a.id === alertId
          const tone =
            a.severity === "critical"
              ? "#f43f5e"
              : a.severity === "warning"
                ? "#f59e0b"
                : "#3b82f6"
          return (
            <Link
              key={a.id}
              to="/alerts/$alertId"
              params={{ alertId: a.id }}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "text-white"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              style={active ? { background: tone } : undefined}
            >
              {a.title}
            </Link>
          )
        })}
      </div>

    </PageShell>
  )
}
