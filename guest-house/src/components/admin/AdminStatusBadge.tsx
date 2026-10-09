import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "secondary" | "outline" | "destructive"

const STATUS_STYLES: Record<string, BadgeVariant> = {
  active: "default",
  live: "default",
  confirmed: "default",
  success: "default",
  sent: "default",
  verified: "default",
  available: "default",
  checked_in: "default",
  completed: "default",
  inactive: "secondary",
  pending: "secondary",
  scheduled: "secondary",
  suspended: "outline",
  blocked: "outline",
  reserved: "outline",
  maintenance: "outline",
  cleaning: "outline",
  cancelled: "destructive",
  failed: "destructive",
  late: "destructive",
  denied: "destructive",
  expired: "destructive",
  no_show: "destructive",
  overstayed: "destructive",
  overstay: "destructive",
  expected: "outline",
  entry: "default",
  exit: "secondary",
  qr: "outline",
  token: "outline",
  pin: "outline",
}

interface AdminStatusBadgeProps {
  status: string
  className?: string
}

export function AdminStatusBadge({ status, className }: AdminStatusBadgeProps) {
  const key = status.toLowerCase().replace(/\s+/g, "_")
  const variant = STATUS_STYLES[key] ?? "outline"

  return (
    <Badge variant={variant} className={cn("rounded-full capitalize", className)}>
      {status.replace(/_/g, " ")}
    </Badge>
  )
}
