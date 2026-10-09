import { Link } from "@tanstack/react-router"
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  MapPin,
  Shield,
} from "lucide-react"
import type { VictimInvestment } from "@/data/kpi-drilldown-data"
import { feCompanies, schemeIdFromName } from "@/data/kpi-drilldown-data"
import { formatINR } from "@/lib/format"
import { cn } from "@/lib/utils"

export function IdentityPanel({
  pan,
  aadhaar,
  customerId,
  district,
  name,
  accent = "#6366f1",
  extra,
  className,
}: {
  pan: string
  aadhaar: string
  customerId: string
  district: string
  name?: string
  accent?: string
  extra?: { label: string; value: string }[]
  className?: string
}) {
  const initials = (name ?? customerId)
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")

  const fields = [
    { label: "Customer ID", value: customerId },
    { label: "PAN", value: pan },
    { label: "Aadhaar", value: aadhaar },
    ...(extra ?? []),
  ]

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-black/[0.05] bg-white dark:border-white/[0.08] dark:bg-[#141c2c]",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90 dark:opacity-45"
        style={{
          background: `radial-gradient(90% 120% at 0% 0%, ${accent}22 0%, transparent 55%), linear-gradient(135deg, ${accent}10 0%, transparent 48%)`,
        }}
      />

      <div className="relative flex flex-col gap-5 p-4 sm:p-5">
        <div className="flex items-start gap-3.5 sm:gap-4">
          <div
            className="flex size-14 shrink-0 items-center justify-center rounded-md font-display text-xl font-semibold tracking-tight text-white sm:size-16 sm:text-2xl"
            style={{
              background: `linear-gradient(145deg, ${accent}, ${accent}b8)`,
              boxShadow: `0 12px 28px ${accent}40`,
            }}
          >
            {initials || "?"}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                Registered depositor
              </p>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase"
                style={{ background: `${accent}18`, color: accent }}
              >
                <CheckCircle2 className="size-3" strokeWidth={2.4} />
                Verified
              </span>
            </div>

            {name ? (
              <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {name}
              </h2>
            ) : (
              <h2 className="mt-1 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Identity record
              </h2>
            )}

            <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" style={{ color: accent }} />
              <span>{district}</span>
              <span className="text-border">·</span>
              <span>Karnataka</span>
            </p>
          </div>

          <div
            className="hidden size-10 shrink-0 items-center justify-center rounded-md sm:flex"
            style={{ background: `${accent}14`, color: accent }}
            aria-hidden
          >
            <Shield className="size-5" strokeWidth={1.75} />
          </div>
        </div>

        <div
          className="h-px w-full"
          style={{
            background: `linear-gradient(90deg, ${accent}35 0%, ${accent}10 55%, transparent 100%)`,
          }}
        />

        <dl
          className={cn(
            "grid gap-x-6 gap-y-4",
            fields.length <= 3
              ? "sm:grid-cols-3"
              : "sm:grid-cols-2 xl:grid-cols-4",
          )}
        >
          {fields.map((f) => (
            <div key={f.label} className="min-w-0">
              <dt className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                {f.label}
              </dt>
              <dd className="mt-1.5 truncate font-display text-[0.95rem] font-semibold tracking-tight tabular-nums text-foreground sm:text-base">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

/** @deprecated prefer IdentityPanel */
export function IdentityGrid({
  pan,
  aadhaar,
  customerId,
  district,
  extra,
}: {
  pan: string
  aadhaar: string
  customerId: string
  district: string
  extra?: { label: string; value: string }[]
}) {
  return (
    <IdentityPanel
      pan={pan}
      aadhaar={aadhaar}
      customerId={customerId}
      district={district}
      extra={extra}
    />
  )
}

export function InvestmentList({
  investments,
  className,
}: {
  investments: VictimInvestment[]
  className?: string
}) {
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {investments.map((inv, i) => {
        const company = feCompanies.find((c) => c.id === inv.companyId)
        const accent = company?.accent ?? "#3b82f6"
        const outstanding = Math.max(0, inv.invested - inv.returnsTaken)
        const schemeId = schemeIdFromName(inv.scheme)

        return (
          <li
            key={`${inv.companyId}-${inv.scheme}-${i}`}
            className="stagger-in"
            style={{ animationDelay: `${i * 55}ms` }}
          >
            <Link
              to="/companies/$companyId/schemes/$schemeId"
              params={{ companyId: inv.companyId, schemeId }}
              className={cn(
                "group relative flex h-full flex-col overflow-hidden rounded-md border border-black/[0.05] bg-white",
                "shadow-[0_4px_18px_rgba(15,23,42,0.04)] transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(15,23,42,0.1)]",
                "dark:border-white/[0.08] dark:bg-[#161e2e] dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)]",
                "dark:hover:border-white/[0.14]",
              )}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-90 dark:opacity-50"
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
                    <Building2 className="size-5" strokeWidth={1.85} />
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-foreground ring-1 ring-black/[0.05] backdrop-blur-sm dark:bg-white/10 dark:ring-white/10">
                    Open scheme
                    <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>

                <h3 className="mt-4 font-display text-[1.15rem] leading-snug font-semibold tracking-tight text-foreground">
                  {inv.scheme}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {inv.companyName}
                </p>

                <div className="mt-4 rounded-md bg-white/80 px-3.5 py-3 ring-1 ring-black/[0.04] backdrop-blur-sm dark:bg-white/[0.04] dark:ring-white/[0.06]">
                  <p className="text-[10px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                    Money deposited
                  </p>
                  <p
                    className="mt-1 font-display text-2xl font-semibold tracking-tight tabular-nums"
                    style={{ color: accent }}
                  >
                    {formatINR(inv.invested, false)}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-muted/50 px-2.5 py-2.5 dark:bg-white/[0.04]">
                    <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                      Returns taken
                    </p>
                    <p className="mt-1 text-[13px] font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatINR(inv.returnsTaken, false)}
                    </p>
                  </div>
                  <div className="rounded-md bg-muted/50 px-2.5 py-2.5 dark:bg-white/[0.04]">
                    <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                      Outstanding liability
                    </p>
                    <p className="mt-1 text-[13px] font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                      {formatINR(outstanding, false)}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
