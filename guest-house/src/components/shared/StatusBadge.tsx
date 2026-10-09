import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { BookingStatus, VerificationStatus } from "@/types"

const bookingStyles: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  checked_in: "bg-emerald-100 text-emerald-800 border-emerald-200",
  active: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-slate-100 text-slate-700 border-slate-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
}

const verificationStyles: Record<VerificationStatus, string> = {
  verified: "bg-emerald-100 text-emerald-800 border-emerald-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
}

interface StatusBadgeProps {
  status: BookingStatus | VerificationStatus
  type?: "booking" | "verification"
}

export function StatusBadge({ status, type = "booking" }: StatusBadgeProps) {
  const styles =
    type === "verification"
      ? verificationStyles[status as VerificationStatus]
      : bookingStyles[status as BookingStatus]

  return (
    <Badge variant="outline" className={cn("capitalize font-medium", styles)}>
      {status.replace("_", " ")}
    </Badge>
  )
}
