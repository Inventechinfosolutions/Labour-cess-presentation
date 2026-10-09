import { CheckCircle2, Copy, KeyRound, ScanLine, ShieldCheck } from "lucide-react"
import { toast } from "sonner"
import { QRCodeDisplay } from "@/components/shared/QRCodeDisplay"
import { StatusBadge } from "@/components/shared/StatusBadge"
import type { EmployeeBookingAccess } from "@/types"
import { calculateNights, formatCurrency, formatDate } from "@/utils/format"
import { cn } from "@/lib/utils"

interface DigitalAccessCardProps {
  access: EmployeeBookingAccess
  isNew?: boolean
  onSimulateScan?: () => void
  accessGranted?: boolean
  className?: string
}

export function DigitalAccessCard({
  access,
  isNew = false,
  onSimulateScan,
  accessGranted = false,
  className,
}: DigitalAccessCardProps) {
  const nights = calculateNights(access.checkIn, access.checkOut)

  const copyText = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success(`${label} copied`)
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`)
    }
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_6px_20px_rgba(0,0,0,0.08)]", className)}>
      {isNew && (
        <div className="flex items-center gap-3 border-b border-emerald-200/80 bg-emerald-50 px-5 py-4 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="size-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Payment successful</p>
            <p className="text-xs opacity-90">Your digital entry pass is ready. Show the QR at the guest house gate.</p>
          </div>
        </div>
      )}

      <div className="p-6 sm:p-8">
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">Scan to enter</p>
          <p className="mt-1 text-xs text-muted-foreground">Present this QR code at the guest house entrance</p>
          <div className="mt-5 flex justify-center">
            <QRCodeDisplay data={access.qrPayload} size="lg" />
          </div>
        </div>

        <div className="mt-6 space-y-3 rounded-xl border border-border/60 bg-muted/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unique access ID</p>
              <p className="mt-1 font-mono text-base font-semibold text-foreground">{access.accessId}</p>
            </div>
            <button
              type="button"
              onClick={() => copyText(access.accessId, "Access ID")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/60"
            >
              <Copy className="size-3.5" />
              Copy
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Booking ID</p>
              <p className="mt-1 font-mono text-sm font-medium text-foreground">{access.bookingId}</p>
            </div>
            <button
              type="button"
              onClick={() => copyText(access.bookingId, "Booking ID")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted/60"
            >
              <Copy className="size-3.5" />
              Copy
            </button>
          </div>
        </div>

        {accessGranted ? (
          <div className="access-granted mt-6 rounded-xl bg-emerald-50 p-4 text-center dark:bg-emerald-950/30">
            <ShieldCheck className="mx-auto size-10 text-emerald-600" />
            <p className="mt-2 text-lg font-bold text-emerald-700 dark:text-emerald-400">Access granted</p>
            <p className="text-sm text-emerald-600 dark:text-emerald-300">Entry verified · Welcome!</p>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-border/60 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <div className="mt-1">
                <StatusBadge status={access.status} />
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Valid for</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {nights === 1 ? "1 night" : `${nights} nights`}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 space-y-2.5 border-t border-border/60 pt-6 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Guest house</span>
            <span className="text-right font-medium text-foreground">{access.siteName}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Room</span>
            <span className="font-medium text-foreground">
              {access.roomNumber} · {access.roomType}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Dates</span>
            <span className="text-right font-medium text-foreground">
              {formatDate(access.checkIn)} — {formatDate(access.checkOut)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Guests</span>
            <span className="font-medium text-foreground">{access.guests}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Amount paid</span>
            <span className="font-semibold text-foreground">{formatCurrency(access.totalAmount)}</span>
          </div>
        </div>

        {!accessGranted && onSimulateScan && (
          <button
            type="button"
            onClick={onSimulateScan}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            <ScanLine className="size-4" />
            Simulate gate scan
          </button>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <KeyRound className="size-3.5" />
          <span>Secure digital key · Active for your stay duration</span>
        </div>
      </div>
    </div>
  )
}
