import { MapPin } from "lucide-react"
import { useMemo, useState } from "react"
import { districtStats } from "@/data/dashboard-data"
import { KarnatakaDistrictMap } from "@/components/dashboard/karnataka-map"
import { formatNumber, formatPercent } from "@/lib/format"
import { cn } from "@/lib/utils"

const topDistricts = districtStats.slice(0, 6)
const totalClaims = districtStats.reduce((sum, d) => sum + d.claims, 0)
const rankColors = [
  "#3b82f6",
  "#0ea5e9",
  "#16a34a",
  "#f59e0b",
  "#0891b2",
  "#f43f5e",
] as const

export function TerritorySection({ className }: { className?: string }) {
  const [selected, setSelected] = useState<string | null>("Bangalore")

  const active = useMemo(
    () => districtStats.find((d) => d.geoName === selected) ?? districtStats[0],
    [selected],
  )

  return (
    <section
      aria-labelledby="territory-heading"
      className={cn(
        "dashboard-panel stagger-in relative flex h-full flex-col overflow-hidden p-2.5 sm:p-3",
        className,
      )}
      style={{ animationDelay: "160ms" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 85% 20%, rgba(59,130,246,0.1), transparent 60%), radial-gradient(50% 40% at 10% 90%, rgba(2,132,199,0.06), transparent 55%)",
        }}
      />

      <div className="relative mb-1.5 flex items-start gap-1.5 sm:mb-2 sm:gap-2">
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#3b82f6]/12 text-[#1d4ed8] ring-1 ring-[#3b82f6]/20 sm:size-7">
          <MapPin className="size-3 sm:size-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <h2
            id="territory-heading"
            className="min-w-0 truncate font-display text-xs font-semibold tracking-tight text-foreground sm:text-sm"
          >
            District-wise claim distribution
          </h2>
          <p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">
            Hover or tap a district to see claim volume across Karnataka
          </p>
        </div>
      </div>

      <div className="relative mb-1.5 grid grid-cols-4 gap-1 sm:mb-2 sm:gap-1.5">
        <MetricChip
          label="Selected"
          value={active.displayName}
          accent="#3b82f6"
          emphasize
        />
        <MetricChip
          label="Claims here"
          value={formatNumber(active.claims)}
          accent="#0ea5e9"
        />
        <MetricChip
          label="Share"
          value={formatPercent(active.percent)}
          accent="#16a34a"
        />
        <MetricChip
          label="Statewide"
          value={formatNumber(totalClaims)}
          accent="#f59e0b"
        />
      </div>

      <div className="relative grid flex-1 grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] items-stretch gap-1.5 sm:gap-2">
        <div className="relative flex min-h-[110px] items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-[#eff6ff] via-[#f8fafc] to-[#f0f9ff] p-0.5 ring-1 ring-[#3b82f6]/15 dark:from-[#0f172a] dark:via-[#111827] dark:to-[#0c1a2e] dark:ring-[#3b82f6]/25 sm:min-h-[150px] sm:rounded-lg sm:p-1">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(59,130,246,0.14) 1px, transparent 0)",
              backgroundSize: "14px 14px",
            }}
          />
          <KarnatakaDistrictMap
            className="relative z-[1] mx-auto w-full max-w-[220px]"
            selected={selected}
            onSelect={setSelected}
          />
        </div>

        <div className="flex min-w-0 flex-col">
          <div className="mb-1 flex items-end justify-between gap-1">
            <h3 className="text-[10px] font-semibold text-foreground sm:text-[11px]">
              Top districts
            </h3>
            <span className="hidden text-[8px] font-medium text-muted-foreground sm:inline">
              Tap to focus
            </span>
          </div>

          <ul className="grid flex-1 grid-cols-1 gap-0.5 sm:gap-1">
            {topDistricts.map((d, index) => {
              const isActive = selected === d.geoName
              const accent = rankColors[index % rankColors.length]
              return (
                <li key={d.geoName} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelected(d.geoName)}
                    className={cn(
                      "group relative flex h-full w-full items-center gap-1 overflow-hidden rounded bg-card px-1.5 py-0.5 text-left transition-all sm:rounded-md sm:px-1.5 sm:py-1",
                      "ring-1 ring-border/50 hover:bg-muted/40",
                      isActive && "ring-1 ring-[#3b82f6]/40",
                    )}
                    style={
                      isActive
                        ? { backgroundColor: `${accent}0a` }
                        : undefined
                    }
                  >
                    <span
                      className="absolute inset-y-0 left-0 w-0.5 rounded-l"
                      style={{
                        background: accent,
                        opacity: isActive ? 1 : 0.45,
                      }}
                    />

                    <span
                      className="ml-0.5 flex size-3.5 shrink-0 items-center justify-center rounded text-[7px] font-bold tabular-nums text-white sm:size-4 sm:text-[8px]"
                      style={{
                        background: `linear-gradient(145deg, ${accent}, ${accent}cc)`,
                      }}
                    >
                      {index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-1">
                        <p className="truncate text-[9px] font-semibold text-foreground sm:text-[10px]">
                          {d.displayName}
                        </p>
                        <p
                          className="shrink-0 font-display text-[9px] font-semibold tabular-nums sm:text-[10px]"
                          style={{ color: isActive ? accent : undefined }}
                        >
                          {formatNumber(d.claims)}
                        </p>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1">
                        <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-[width] duration-500"
                            style={{
                              width: `${Math.max(d.percent, 4)}%`,
                              background: `linear-gradient(90deg, ${accent}99, ${accent})`,
                            }}
                          />
                        </div>
                        <span className="w-6 shrink-0 text-right text-[7px] font-semibold tabular-nums text-muted-foreground sm:w-7 sm:text-[8px]">
                          {formatPercent(d.percent)}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="mt-1 rounded bg-muted/40 px-1.5 py-0.5 ring-1 ring-border/50 sm:px-2 sm:py-1">
            <p className="text-[7px] font-semibold tracking-wide text-muted-foreground uppercase sm:text-[8px]">
              Claim intensity
            </p>
            <div
              className="mt-0.5 h-0.5 overflow-hidden rounded-full sm:h-1"
              style={{
                background:
                  "linear-gradient(90deg, #e2e8f0 0%, #bfdbfe 35%, #3b82f6 70%, #1d4ed8 100%)",
              }}
            />
            <div className="mt-0.5 flex justify-between text-[7px] text-muted-foreground sm:text-[8px]">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MetricChip({
  label,
  value,
  accent,
  emphasize = false,
}: {
  label: string
  value: string
  accent: string
  emphasize?: boolean
}) {
  return (
    <div className="rounded-md bg-card/80 px-1.5 py-1 ring-1 ring-border/50 backdrop-blur-sm sm:px-2 sm:py-1.5">
      <p className="text-[7px] font-semibold tracking-wide text-muted-foreground uppercase sm:text-[8px]">
        {label}
      </p>
      <p
        className={cn(
          "mt-px truncate font-display font-semibold tracking-tight text-foreground",
          emphasize
            ? "text-[10px] sm:text-[11px]"
            : "text-[11px] tabular-nums sm:text-xs",
        )}
        style={{ color: emphasize ? accent : undefined }}
      >
        {value}
      </p>
      <div
        className="mt-0.5 h-0.5 w-4 rounded-full"
        style={{ background: accent }}
      />
    </div>
  )
}
