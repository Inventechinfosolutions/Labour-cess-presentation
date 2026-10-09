import { useMemo, useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import {
  Building2,
  IndianRupee,
  Landmark,
  MapPin,
} from "lucide-react"
import { feCompanies, kpiLabels, programmeTotals, recoveredAssets } from "@/data/kpi-drilldown-data"
import { formatINR, formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  PageHero,
  PageShell,
  SectionCard,
  SparkStatCard,
} from "@/components/drilldown/page-shell"

export const Route = createFileRoute("/assets/")({
  component: AssetsPage,
})

function AssetsPage() {
  const grouped = useMemo(() => {
    const map = new Map<
      string,
      {
        companyName: string
        accent: string
        assets: typeof recoveredAssets
        total: number
      }
    >()
    for (const a of recoveredAssets) {
      const company = feCompanies.find((c) => c.id === a.companyId)
      const cur = map.get(a.companyId) ?? {
        companyName: a.companyName,
        accent: company?.accent ?? "#22c55e",
        assets: [],
        total: 0,
      }
      cur.assets.push(a)
      cur.total += a.recoveredAmount
      map.set(a.companyId, cur)
    }
    return [...map.entries()]
  }, [])

  const grandTotal = programmeTotals.recovered
  const [openId, setOpenId] = useState<string | null>(grouped[0]?.[0] ?? null)

  return (
    <PageShell>
      <PageHero
        eyebrow="Asset recovery"
        title={kpiLabels.recovered}
        description="Attached property, bank accounts, and other assets of fraudulent entities — and the amount recovered from each."
        icon={IndianRupee}
        backTo="/"
        accent="#22c55e"
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <SparkStatCard
          id="as-count"
          label="Assets listed"
          value={formatNumber(programmeTotals.assetsListed)}
          tone="blue"
          icon={Landmark}
          spark={[10, 12, 13, 14, 15, 17, programmeTotals.assetsListed]}
        />
        <SparkStatCard
          id="as-co"
          label="Fraudulent entities"
          value={formatNumber(grouped.length)}
          tone="violet"
          icon={Building2}
          spark={[2, 3, 3, 4, 4, 5, 5]}
        />
        <SparkStatCard
          id="as-total"
          label={kpiLabels.recovered}
          value={formatINR(grandTotal)}
          tone="success"
          icon={IndianRupee}
          spark={[980, 1040, 1080, 1120, 1140, 1160, 1180]}
        />
      </div>

      <SectionCard
        title="Assets by fraudulent entities"
        description="Expand a fraudulent entity to view each attached asset and the recovered amount"
      >
        <ul className="space-y-3">
          {grouped.map(([companyId, group]) => {
            const open = openId === companyId
            return (
              <li
                key={companyId}
                className="overflow-hidden rounded-2xl border border-black/[0.05] bg-white/90 dark:border-white/[0.08] dark:bg-[#161e2e]/90"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : companyId)}
                  className="relative flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/30"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-2.5 left-0 w-[3px] rounded-full"
                    style={{
                      background: group.accent,
                      boxShadow: `0 0 14px ${group.accent}`,
                    }}
                  />
                  <div
                    className="flex size-12 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: `${group.accent}22`,
                      color: group.accent,
                      boxShadow: `0 0 22px ${group.accent}30`,
                    }}
                  >
                    <Landmark className="size-5" strokeWidth={1.85} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-lg font-semibold text-foreground">
                      {group.companyName}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {group.assets.length} assets
                      <span className="mx-2 inline-block h-3 w-px bg-border align-middle" />
                      recovered{" "}
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatINR(group.total)}
                      </span>
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-[11px] font-bold tracking-wide uppercase",
                      open ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
                    )}
                  >
                    {open ? "Hide" : "Show"}
                  </span>
                </button>

                {open && (
                  <div className="border-t border-border/60 bg-muted/15 p-3 sm:p-4">
                    <ul className="grid gap-3 lg:grid-cols-2">
                      {group.assets.map((a) => (
                        <li
                          key={a.id}
                          className="rounded-2xl border border-black/[0.05] bg-white p-4 shadow-sm dark:border-white/[0.08] dark:bg-[#121a28]"
                        >
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px]">
                              {a.assetType}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className={cn(
                                "text-[10px]",
                                (a.status === "Sold" || a.status === "Transferred") &&
                                  "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
                              )}
                            >
                              {a.status}
                            </Badge>
                          </div>
                          <p className="mt-2.5 font-medium text-foreground">{a.description}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" />
                            {a.location}
                          </p>
                          <div className="mt-3 rounded-xl bg-emerald-50 px-3 py-2.5 dark:bg-emerald-500/10">
                            <p className="text-[10px] font-bold tracking-wide text-emerald-700/80 uppercase dark:text-emerald-300/80">
                              Amount recovered
                            </p>
                            <p className="mt-0.5 font-display text-xl font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                              {formatINR(a.recoveredAmount)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </SectionCard>
    </PageShell>
  )
}
