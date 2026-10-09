import { createFileRoute, Link } from "@tanstack/react-router"
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  ClipboardCheck,
  Landmark,
  Scale,
  UserRound,
  Wallet,
} from "lucide-react"
import { reports } from "@/data/dashboard-data"
import { PageHero, PageShell } from "@/components/drilldown/page-shell"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/reports/")({
  component: ReportsHubPage,
})

const reportThemes = {
  building: {
    accent: "#0ea5e9",
    soft: "#e0f2fe",
    Icon: Building2,
  },
  user: {
    accent: "#3b82f6",
    soft: "#dbeafe",
    Icon: UserRound,
  },
  clipboard: {
    accent: "#22c55e",
    soft: "#dcfce7",
    Icon: ClipboardCheck,
  },
  wallet: {
    accent: "#f59e0b",
    soft: "#fef3c7",
    Icon: Wallet,
  },
  bank: {
    accent: "#0284c7",
    soft: "#e0f2fe",
    Icon: Landmark,
  },
  scale: {
    accent: "#f43f5e",
    soft: "#ffe4e6",
    Icon: Scale,
  },
} as const

function ReportsHubPage() {
  return (
    <PageShell className="space-y-5 sm:space-y-6">
      <PageHero
        eyebrow="Checks & records"
        title="Detailed reports"
        description="Open full reports for government, courts, and audit teams — pick a report below to view complete operational detail."
        icon={BarChart3}
        backTo="/"
        backLabel="Back to dashboard"
        accent="#3b82f6"
      />

      <section aria-labelledby="report-catalog-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2
              id="report-catalog-heading"
              className="font-display text-base font-semibold tracking-tight text-foreground"
            >
              Report catalogue
            </h2>
            <p className="text-sm text-muted-foreground">
              {reports.length} official report types available
            </p>
          </div>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {reports.map((report, index) => {
            const theme = reportThemes[report.icon]
            const Icon = theme.Icon
            const number = String(index + 1).padStart(2, "0")

            return (
              <li key={report.id}>
                <Link
                  to={report.to}
                  className={cn(
                    "group relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-5",
                    "shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_12px_32px_rgba(12,25,41,0.06)]",
                    "transition-all duration-300 hover:-translate-y-1 hover:border-primary/30",
                    "hover:shadow-[0_20px_44px_rgba(12,25,41,0.12)]",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-90 transition-opacity duration-300 group-hover:opacity-100 dark:opacity-50"
                    style={{
                      background: `linear-gradient(155deg, ${theme.soft} 0%, transparent 62%)`,
                    }}
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-8 -top-10 size-36 rounded-full opacity-40 blur-2xl transition-transform duration-500 group-hover:scale-110"
                    style={{ background: theme.accent }}
                  />

                  <div className="relative flex items-start justify-between gap-3">
                    <span
                      className="flex size-12 items-center justify-center rounded-2xl text-white shadow-md"
                      style={{
                        background: `linear-gradient(145deg, ${theme.accent}, ${theme.accent}cc)`,
                        boxShadow: `0 10px 24px ${theme.accent}33`,
                      }}
                    >
                      <Icon className="size-5" strokeWidth={2.1} />
                    </span>
                    <span className="font-display text-2xl font-semibold tabular-nums text-muted-foreground/35">
                      {number}
                    </span>
                  </div>

                  <div className="relative mt-5 min-w-0 flex-1">
                    <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
                      {report.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {report.description}
                    </p>
                  </div>

                  <div className="relative mt-6 flex items-center justify-between gap-2 border-t border-border/60 pt-4">
                    <span
                      className="text-xs font-semibold tracking-wide uppercase"
                      style={{ color: theme.accent }}
                    >
                      Open full report
                    </span>
                    <span
                      className="flex size-9 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      style={{
                        background: `${theme.accent}18`,
                        color: theme.accent,
                      }}
                    >
                      <ArrowUpRight className="size-4" strokeWidth={2.25} />
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
    </PageShell>
  )
}
