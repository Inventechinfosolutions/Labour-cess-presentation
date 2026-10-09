import { funnelStages } from "@/data/dashboard-data"
import { formatNumber } from "@/lib/format"
import { cn } from "@/lib/utils"

export function ClaimsFunnel({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="funnel-heading"
      className={cn(
        "dashboard-panel stagger-in flex h-full flex-col p-2.5 sm:p-3",
        className,
      )}
    >
      <div className="mb-1.5 flex items-start justify-between gap-2 sm:mb-2">
        <div className="min-w-0">
          <h2
            id="funnel-heading"
            className="font-display text-xs font-semibold tracking-tight text-foreground sm:text-sm"
          >
            Claim processing workflow
          </h2>
          <p className="mt-0.5 hidden text-[10px] text-muted-foreground sm:block">
            Where each claim stands today, from submission to closure
          </p>
        </div>
        <p className="shrink-0 text-[10px] font-medium text-muted-foreground sm:text-[11px]">
          Number of applications
        </p>
      </div>

      <ol className="space-y-1">
        {funnelStages.map((stage, index) => (
          <li key={stage.id} className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className="flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold tabular-nums text-primary ring-1 ring-primary/25 sm:size-[18px] sm:text-[10px]"
                style={{
                  background: `color-mix(in srgb, ${stage.color} 14%, transparent)`,
                }}
              >
                {index + 1}
              </span>

              <div className="flex min-w-0 flex-1 items-baseline justify-between gap-x-1.5">
                <p className="truncate text-[11px] font-semibold leading-tight text-foreground sm:text-xs">
                  {stage.label}
                </p>
                <span className="shrink-0 text-[11px] font-semibold tabular-nums text-foreground sm:text-xs">
                  {formatNumber(stage.count)}
                </span>
              </div>
            </div>

            <div className="relative h-2.5 overflow-hidden rounded bg-muted/60 ring-1 ring-border/40 sm:h-3">
              <div
                className="funnel-bar absolute inset-y-0 left-0 rounded"
                style={{
                  width: `${Math.max(stage.percent, 3)}%`,
                  background: `linear-gradient(90deg, color-mix(in srgb, ${stage.color} 18%, transparent), color-mix(in srgb, ${stage.color} 42%, transparent))`,
                  borderRight: `1.5px solid color-mix(in srgb, ${stage.color} 65%, transparent)`,
                  animationDelay: `${index * 50}ms`,
                }}
              />
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
