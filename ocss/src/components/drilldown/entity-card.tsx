import { Link } from "@tanstack/react-router"
import { ArrowUpRight, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type EntityLinkProps =
  | { to: "/companies/$companyId"; params: { companyId: string } }
  | {
      to: "/companies/$companyId/schemes/$schemeId"
      params: { companyId: string; schemeId: string }
    }
  | { to: "/victims/$victimId"; params: { victimId: string } }
  | { to: "/claims/$claimId"; params: { claimId: string } }
  | { to?: undefined; params?: undefined }

type Metric = { label: string; value: string; emphasize?: boolean }

type EntityCardProps = {
  accent: string
  icon: LucideIcon
  title: string
  metrics: Metric[]
  badge?: string
  className?: string
  /** Vertical metric grid (card) vs compact horizontal row */
  layout?: "card" | "row"
} & EntityLinkProps

export function EntityCard({
  to,
  params,
  accent,
  icon: Icon,
  title,
  metrics,
  badge,
  className,
  layout = "row",
}: EntityCardProps) {
  const interactive = Boolean(to && params)

  if (layout === "card") {
    const primary = metrics.find((m) => m.emphasize) ?? metrics[0]
    const rest = metrics.filter((m) => m !== primary)

    const body = (
      <>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-90 dark:opacity-50"
          style={{
            background: `radial-gradient(120% 90% at 0% 0%, ${accent}28 0%, transparent 62%), linear-gradient(180deg, ${accent}12 0%, transparent 100%)`,
          }}
        />

        <div className="relative flex flex-1 flex-col p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-md text-white shadow-md"
              style={{
                background: `linear-gradient(145deg, ${accent}, ${accent}cc)`,
                boxShadow: `0 10px 22px ${accent}40`,
              }}
            >
              <Icon className="size-5" strokeWidth={1.85} />
            </div>

            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-foreground ring-1 ring-black/[0.05] backdrop-blur-sm dark:bg-white/10 dark:ring-white/10">
              {badge ?? (interactive ? "Open" : "Scheme")}
              {interactive ? (
                <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              ) : null}
            </span>
          </div>

          <h3 className="mt-4 font-display text-[1.2rem] leading-snug font-semibold tracking-tight text-foreground">
            {title}
          </h3>

          {primary && (
            <div className="mt-4 rounded-md bg-white/80 px-3.5 py-3 ring-1 ring-black/[0.04] backdrop-blur-sm dark:bg-white/[0.04] dark:ring-white/[0.06]">
              <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                {primary.label || "Highlight"}
              </p>
              <p
                className={cn(
                  "mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums",
                  primary.emphasize
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-foreground",
                )}
                style={!primary.emphasize ? { color: accent } : undefined}
              >
                {primary.value}
              </p>
            </div>
          )}

          {rest.length > 0 && (
            <div
              className={cn(
                "mt-3 grid gap-2",
                rest.length === 1 ? "grid-cols-1" : "grid-cols-3",
              )}
            >
              {rest.map((m) => (
                <div
                  key={`${m.label}-${m.value}`}
                  className="min-w-0 rounded-md bg-muted/50 px-2.5 py-2.5 dark:bg-white/[0.04]"
                >
                  <p className="truncate text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {m.label || "Detail"}
                  </p>
                  <p className="mt-1 truncate text-[13px] font-semibold tabular-nums text-foreground">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    )

    const shellClass = cn(
      "group relative flex h-full flex-col overflow-hidden rounded-md border border-black/[0.05] bg-white",
      "shadow-[0_4px_18px_rgba(15,23,42,0.04)] transition-all duration-300",
      "hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)]",
      "dark:border-white/[0.08] dark:bg-[#161e2e] dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)]",
      "dark:hover:border-white/[0.14] dark:hover:shadow-[0_16px_40px_rgba(0,0,0,0.5)]",
      className,
    )

    if (interactive && to && params) {
      return (
        <Link to={to} params={params} className={shellClass}>
          {body}
        </Link>
      )
    }

    return <article className={shellClass}>{body}</article>
  }

  const rowBody = (
    <>
      <span
        aria-hidden
        className="absolute inset-y-2.5 left-0 w-[3px] rounded-full"
        style={{
          background: accent,
          boxShadow: `0 0 14px ${accent}`,
        }}
      />
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-md"
        style={{
          background: `${accent}22`,
          color: accent,
          boxShadow: `0 0 22px ${accent}30`,
        }}
      >
        <Icon className="size-5" strokeWidth={1.85} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-display text-[1.05rem] font-semibold text-foreground">
            {title}
          </p>
          {badge && (
            <span
              className="inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: `${accent}20`, color: accent }}
            >
              {badge}
            </span>
          )}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center text-[12.5px] text-muted-foreground">
          {metrics.map((m, i) => (
            <span key={`${m.label}-${m.value}`} className="inline-flex items-center">
              {i > 0 && <span className="mx-2 h-3 w-px bg-border/80" aria-hidden />}
              <span
                className={
                  m.emphasize
                    ? "font-semibold text-emerald-600 dark:text-emerald-400"
                    : undefined
                }
              >
                {m.value}
                {m.label ? (
                  <span
                    className={
                      m.emphasize
                        ? "font-normal text-emerald-600/80 dark:text-emerald-400/80"
                        : undefined
                    }
                  >
                    {" "}
                    {m.label}
                  </span>
                ) : null}
              </span>
            </span>
          ))}
        </div>
      </div>
      {interactive ? (
        <ArrowUpRight className="size-5 shrink-0 text-muted-foreground/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
      ) : null}
    </>
  )

  const rowClass = cn(
    "group relative flex items-center gap-3.5 overflow-hidden rounded-md border border-black/[0.05] bg-white/90 p-4 transition-all duration-300",
    "hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)]",
    "dark:border-white/[0.08] dark:bg-[#161e2e]/90 dark:hover:border-white/[0.14] dark:hover:shadow-[0_14px_40px_rgba(0,0,0,0.45)]",
    className,
  )

  if (interactive && to && params) {
    return (
      <Link to={to} params={params} className={rowClass}>
        {rowBody}
      </Link>
    )
  }

  return <article className={rowClass}>{rowBody}</article>
}
