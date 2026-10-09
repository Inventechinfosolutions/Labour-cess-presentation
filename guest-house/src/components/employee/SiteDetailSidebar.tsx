import { Clock, RefreshCw } from "lucide-react"

const REFUND_POLICY = [
  {
    title: "Full refund",
    description: "Cancel at least 48 hours before check-in for a full refund.",
  },
  {
    title: "Partial refund",
    description: "Late cancellations may receive a pro-rated refund per policy.",
  },
  {
    title: "Processing time",
    description: "Refunds are credited within 5–7 business days.",
  },
]

export function SiteDetailSidebar() {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-6 shadow-[0_6px_16px_rgba(0,0,0,0.08)]">
      <h3 className="text-lg font-semibold text-foreground">Cancellation policy</h3>
      <ul className="mt-5 space-y-4">
        {REFUND_POLICY.map((item) => (
          <li key={item.title} className="flex gap-3 text-sm">
            <RefreshCw className="mt-0.5 size-4 shrink-0 text-foreground" />
            <div>
              <p className="font-semibold text-foreground">{item.title}</p>
              <p className="mt-0.5 leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-5 flex items-start gap-2 border-t border-border/60 pt-5 text-xs leading-relaxed text-muted-foreground">
        <Clock className="mt-0.5 size-3.5 shrink-0" />
        Subject to employee verification and official booking records.
      </p>
    </div>
  )
}
