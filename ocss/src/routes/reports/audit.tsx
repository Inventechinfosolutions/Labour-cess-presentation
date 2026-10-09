import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  Gavel,
  Scale,
  ScrollText,
  Shield,
  Workflow,
} from "lucide-react"
import { ExecutiveMetricTile } from "@/components/drilldown/companies-executive-panel"
import { FilterToolbar } from "@/components/drilldown/filter-toolbar"
import {
  PageHero,
  PageShell,
  SectionCard,
} from "@/components/drilldown/page-shell"
import { ReportSectionIntro } from "@/components/drilldown/report-shell"
import { auditEventRows } from "@/data/report-data"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/reports/audit")({
  component: AuditReportPage,
})

const categoryIcon = {
  Court: Gavel,
  Audit: ScrollText,
  Authority: Shield,
  System: Workflow,
} as const

function AuditReportPage() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")

  const filters = [
    { value: "all", label: "All categories" },
    { value: "Court", label: "Court" },
    { value: "Audit", label: "Audit" },
    { value: "Authority", label: "Authority" },
    { value: "System", label: "System" },
  ]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return auditEventRows.filter((r) => {
      if (filter !== "all" && r.category !== filter) return false
      if (!q) return true
      return (
        r.title.toLowerCase().includes(q) ||
        r.ref.toLowerCase().includes(q) ||
        r.detail.toLowerCase().includes(q) ||
        r.actor.toLowerCase().includes(q)
      )
    })
  }, [filter, query])

  const counts = useMemo(() => {
    const by = (cat: string) =>
      auditEventRows.filter((r) => r.category === cat).length
    return {
      court: by("Court"),
      audit: by("Audit"),
      authority: by("Authority"),
      system: by("System"),
    }
  }, [])

  const metrics = [
    {
      id: "court",
      label: "Court references",
      value: formatNumber(counts.court),
      hint: "Writs, listings, interim orders",
      icon: Gavel,
      color: "#f43f5e",
      soft: "#ffe4e6",
    },
    {
      id: "audit",
      label: "Audit actions",
      value: formatNumber(counts.audit),
      hint: "Internal checks and recovery trails",
      icon: ScrollText,
      color: "#8b5cf6",
      soft: "#ede9fe",
    },
    {
      id: "authority",
      label: "Authority orders",
      value: formatNumber(counts.authority),
      hint: "CA notices and settlement ratios",
      icon: Shield,
      color: "#3b82f6",
      soft: "#dbeafe",
    },
    {
      id: "system",
      label: "System events",
      value: formatNumber(counts.system),
      hint: "Payments, KYC, automated flags",
      icon: Workflow,
      color: "#0ea5e9",
      soft: "#e0f2fe",
    },
  ] as const

  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow="CSMS · Detailed report"
        title="Court & audit report"
        description="Case references and full activity history across court, audit, authority, and system events."
        icon={Scale}
        backTo="/reports"
        backLabel="Back to detailed reports"
        accent="#f43f5e"
      />

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m, i) => (
          <ExecutiveMetricTile
            key={m.id}
            {...m}
            style={{ animationDelay: `${i * 55}ms` }}
          />
        ))}
      </ul>

      <SectionCard className="stagger-in">
        <div className="mb-5 flex flex-col gap-4 border-b border-border/50 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <ReportSectionIntro
            title="Activity timeline"
            countLabel={`${filtered.length} events`}
            description="Search by case reference, actor, or keyword. Newest programme activity first."
            accent="#be123c"
            soft="#ffe4e6"
          />
          <FilterToolbar
            search={query}
            onSearchChange={setQuery}
            searchPlaceholder="Search ref, title, actor…"
            searchLabel="Search audit log"
            filters={filters}
            filterValue={filter}
            onFilterChange={setFilter}
            filterLabel="Filter by category"
          />
        </div>

        <ol className="relative space-y-3">
          {filtered.map((r, i) => {
            const Icon = categoryIcon[r.category]
            return (
              <li
                key={r.id}
                className="stagger-in relative"
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <article
                  className={cn(
                    "group relative overflow-hidden rounded-md border border-black/[0.05] bg-white p-4",
                    "transition-all hover:shadow-[0_10px_28px_rgba(15,23,42,0.06)]",
                    "dark:border-white/[0.08] dark:bg-[#141c2c]",
                  )}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-0 w-[3px]"
                    style={{ background: r.accent }}
                  />
                  <div className="flex flex-wrap items-start gap-3 pl-1">
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-md text-white"
                      style={{
                        background: `linear-gradient(145deg, ${r.accent}, ${r.accent}cc)`,
                      }}
                    >
                      <Icon className="size-5" strokeWidth={1.9} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
                          style={{
                            background: `${r.accent}18`,
                            color: r.accent,
                          }}
                        >
                          {r.category}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                          {r.ref}
                        </span>
                      </div>
                      <h3 className="mt-1.5 font-display text-base font-semibold tracking-tight text-foreground">
                        {r.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {r.detail}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>
                          Actor{" "}
                          <span className="font-semibold text-foreground">
                            {r.actor}
                          </span>
                        </span>
                        <span>{r.when}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
          {filtered.length === 0 && (
            <li className="rounded-md border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
              No audit events match this search
            </li>
          )}
        </ol>
      </SectionCard>

    </PageShell>
  )
}
