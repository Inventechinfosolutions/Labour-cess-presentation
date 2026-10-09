import { Link } from "@tanstack/react-router"
import {
  ArrowLeft,
  Building2,
  LayoutGrid,
  Table2,
  type LucideIcon,
} from "lucide-react"
import { HeroKarnatakaGraphic } from "@/components/drilldown/hero-karnataka-graphic"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main
      className={cn(
        "mx-auto w-full max-w-[1600px] min-w-0 space-y-4 overflow-x-clip px-3 pt-0 pb-24 sm:space-y-5 sm:px-5 lg:px-6 lg:pb-8",
        className,
      )}
    >
      {children}
    </main>
  )
}

export function PageHero({
  eyebrow,
  title,
  description,
  icon: Icon,
  backTo,
  backParams,
  backLabel = "Back to overview",
  actions,
  accent = "#3b82f6",
}: {
  eyebrow?: string
  title: string
  description: string
  icon: LucideIcon
  backTo?:
    | "/"
    | "/companies"
    | "/victims"
    | "/claims"
    | "/assets"
    | "/reports"
    | "/companies/$companyId"
  backParams?: { companyId: string }
  backLabel?: string
  actions?: React.ReactNode
  accent?: string
}) {
  return (
    <header className="relative overflow-hidden rounded-md">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-90 dark:opacity-50"
        style={{
          background: `radial-gradient(80% 120% at 0% 0%, ${accent}18 0%, transparent 55%), radial-gradient(60% 80% at 100% 20%, ${accent}10 0%, transparent 50%)`,
        }}
      />
      <div className="relative flex items-center gap-3 px-0 py-1 sm:gap-6 sm:py-2">
        <div className="min-w-0 flex-1 space-y-2 sm:space-y-3">
          {backTo && (
            <Link
              to={backTo}
              params={backParams}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "-ml-2 h-7 gap-1 text-muted-foreground hover:text-foreground sm:h-8 sm:gap-1.5",
              )}
            >
              <ArrowLeft className="size-3.5" />
              <span className="sm:hidden">Back</span>
              <span className="hidden sm:inline">{backLabel}</span>
            </Link>
          )}

          <div className="flex items-center gap-2.5 sm:items-start sm:gap-3.5">
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-md sm:mt-0.5 sm:size-12"
              style={{
                background: `linear-gradient(145deg, ${accent}, ${accent}cc)`,
                boxShadow: `0 8px 18px ${accent}35`,
              }}
            >
              <Icon className="size-4 text-white sm:size-5" strokeWidth={1.85} />
            </div>
            <div className="min-w-0 flex-1">
              {eyebrow && (
                <p
                  className="truncate text-[10px] font-bold tracking-[0.14em] uppercase sm:text-[11px] sm:tracking-[0.16em]"
                  style={{ color: accent }}
                >
                  {eyebrow}
                </p>
              )}
              <h1 className="mt-0.5 font-display text-xl leading-none font-semibold tracking-tight text-foreground sm:mt-1 sm:text-3xl sm:leading-tight lg:text-[2.15rem]">
                {title}
              </h1>
              <p className="mt-1 line-clamp-2 max-w-xl text-[12.5px] leading-snug text-muted-foreground sm:mt-2 sm:line-clamp-none sm:text-[0.95rem] sm:leading-relaxed">
                {description}
              </p>
              {actions && <div className="mt-2 sm:mt-3">{actions}</div>}
            </div>
          </div>
        </div>

        <HeroKarnatakaGraphic accent={accent} icon={Icon} />
      </div>
    </header>
  )
}

const toneMap = {
  blue: { color: "#3b82f6", soft: "#dbeafe", softDark: "rgba(59,130,246,0.18)" },
  violet: { color: "#8b5cf6", soft: "#ede9fe", softDark: "rgba(139,92,246,0.18)" },
  success: { color: "#22c55e", soft: "#dcfce7", softDark: "rgba(34,197,94,0.18)" },
  gold: { color: "#f59e0b", soft: "#fef3c7", softDark: "rgba(245,158,11,0.18)" },
  rose: { color: "#f43f5e", soft: "#ffe4e6", softDark: "rgba(244,63,94,0.18)" },
  cyan: { color: "#0ea5e9", soft: "#e0f2fe", softDark: "rgba(14,165,233,0.18)" },
} as const

export type StatTone = keyof typeof toneMap

export function SparkStatCard({
  label,
  value,
  tone = "blue",
  icon: Icon = Building2,
}: {
  label: string
  value: string
  tone?: StatTone
  icon?: LucideIcon
  spark?: number[]
  id?: string
}) {
  const t = toneMap[tone]
  return (
    <div className="group relative overflow-hidden rounded-md border border-black/[0.04] bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_4px_14px_rgba(15,23,42,0.05)] dark:border-white/[0.07] dark:bg-[#141c2c] dark:shadow-[0_2px_10px_rgba(0,0,0,0.2)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-80 dark:hidden"
        style={{
          background: `linear-gradient(160deg, ${t.soft} 0%, #ffffff 72%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          background: `linear-gradient(160deg, ${t.softDark} 0%, rgba(20,28,44,1) 75%)`,
        }}
      />
      <div className="relative flex min-w-0 items-center gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-sm"
          style={{ background: t.soft, color: t.color }}
        >
          <Icon className="size-4 dark:brightness-125" strokeWidth={2} />
        </div>
        <p className="text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase leading-snug">
          {label}
        </p>
      </div>
      <p
        className="relative mt-3 font-display text-[1.55rem] leading-none font-semibold tracking-tight tabular-nums"
        style={{ color: t.color }}
      >
        {value}
      </p>
    </div>
  )
}

/** @deprecated prefer SparkStatCard — kept for simple detail metrics */
export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  tone?: "default" | "success" | "rose" | "gold" | "blue"
}) {
  const color =
    tone === "success"
      ? "#22c55e"
      : tone === "rose"
        ? "#f43f5e"
        : tone === "gold"
          ? "#f59e0b"
          : tone === "blue"
            ? "#3b82f6"
            : undefined

  return (
    <div className="rounded-lg border border-black/[0.04] bg-white p-4 shadow-[0_1px_6px_rgba(15,23,42,0.03)] dark:border-white/[0.06] dark:bg-[#141c2c]">
      <p className="text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
        {label}
      </p>
      <p
        className="mt-1.5 font-display text-2xl font-semibold tracking-tight tabular-nums text-foreground"
        style={color ? { color } : undefined}
      >
        {value}
      </p>
    </div>
  )
}

export function SectionCard({
  title,
  description,
  children,
  className,
  toolbar,
}: {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  toolbar?: React.ReactNode
}) {
  const hasHeader = Boolean(title || description || toolbar)

  return (
    <section
      className={cn(
        "rounded-md border border-black/[0.04] bg-white p-4 shadow-[0_1px_4px_rgba(15,23,42,0.02)] sm:p-5 dark:border-white/[0.07] dark:bg-[#121a28] dark:shadow-none",
        className,
      )}
    >
      {hasHeader ? (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          {(title || description) && (
            <div className="min-w-0">
              {title ? (
                <h2 className="font-display text-xl font-semibold text-foreground">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-0.5 text-sm text-sky-600/90 dark:text-sky-400/90">
                  {description}
                </p>
              ) : null}
            </div>
          )}
          {toolbar ? (
            <div className="w-full shrink-0 sm:ml-auto sm:w-auto sm:max-w-[min(100%,28rem)] md:max-w-none">
              {toolbar}
            </div>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export type EntityView = "card" | "table"

export function ViewToggle({
  view,
  onChange,
}: {
  view: EntityView
  onChange: (v: EntityView) => void
}) {
  return (
    <div className="inline-flex items-center rounded-md border border-border/70 bg-muted/40 p-0.5">
      <button
        type="button"
        onClick={() => onChange("card")}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-sm transition-colors",
          view === "card"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-label="Card view"
        aria-pressed={view === "card"}
      >
        <LayoutGrid className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-sm transition-colors",
          view === "table"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        aria-label="Table view"
        aria-pressed={view === "table"}
      >
        <Table2 className="size-4" />
      </button>
    </div>
  )
}
