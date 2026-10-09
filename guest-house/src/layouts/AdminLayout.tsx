import {
  BarChart3,
  BedDouble,
  Building2,
  ClipboardList,
  CreditCard,
  FileText,
  Home,
  KeyRound,
  Layers,
  LayoutGrid,
  LogIn,
  LogOut,
  MapPin,
  Package,
  ScrollText,
  Settings,
  Shield,
  Users,
  Wrench,
} from "lucide-react"
import { AppShellLayout } from "./AppShellLayout"
import type { NavGroup } from "@/components/shared/AppSidebar"

const adminNavGroups: NavGroup[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Home,
    items: [
      { label: "Dashboard", href: "/admin", icon: Home },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    id: "property",
    label: "Property Management",
    icon: Building2,
    items: [
      { label: "Sites", href: "/admin/sites", icon: MapPin },
      { label: "Buildings", href: "/admin/buildings", icon: Building2 },
      { label: "Floors", href: "/admin/floors", icon: Layers },
      { label: "Rooms", href: "/admin/rooms", icon: BedDouble },
      { label: "Room Inventory", href: "/admin/inventory", icon: Package },
    ],
  },
  {
    id: "users-bookings",
    label: "Users & Bookings",
    icon: Users,
    items: [
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "Bookings", href: "/admin/bookings", icon: ClipboardList },
      { label: "Booking Override", href: "/admin/booking-override", icon: Wrench },
    ],
  },
  {
    id: "operations",
    label: "Daily Operations",
    icon: LogIn,
    items: [
      { label: "Check-In", href: "/admin/checkin", icon: LogIn },
      { label: "Check-Out", href: "/admin/checkout", icon: LogOut },
      { label: "Occupancy", href: "/admin/occupancy", icon: LayoutGrid },
      { label: "Access Control", href: "/admin/access", icon: KeyRound },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: CreditCard,
    items: [
      { label: "Payments", href: "/admin/payments", icon: CreditCard },
    ],
  },
  {
    id: "reports",
    label: "Reports & Governance",
    icon: FileText,
    items: [
      { label: "Reports", href: "/admin/reports", icon: FileText },
      { label: "Audit Logs", href: "/admin/audit", icon: ScrollText },
    ],
  },
  {
    id: "system",
    label: "System",
    icon: Settings,
    items: [
      { label: "Roles & Permissions", href: "/admin/roles", icon: Shield },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
]

export function AdminLayout() {
  return (
    <AppShellLayout
      navGroups={adminNavGroups}
      title="Host dashboard"
      subtitle=""
      homeHref="/admin"
      variant="admin"
    />
  )
}
