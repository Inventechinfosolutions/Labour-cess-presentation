export type EntityStatus = "active" | "inactive"

export type ExtendedRoomType =
  | "Standard"
  | "Deluxe"
  | "Executive"
  | "VIP Suite"
  | "Conference Room"

export type RoomInventoryStatus =
  | "available"
  | "occupied"
  | "blocked"
  | "reserved"
  | "maintenance"
  | "cleaning"

export type ExtendedBookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "expired"
  | "no_show"

export type PaymentStatus = "success" | "pending" | "failed" | "refunded" | "partial_refund"

export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet"

export type UserStatus = "active" | "suspended" | "pending"

export type AccessEventType = "entry" | "exit" | "denied" | "expired"

export type NotificationChannel = "sms" | "email" | "push" | "whatsapp"

export type AdminRole =
  | "super_admin"
  | "site_admin"
  | "building_manager"
  | "reception"
  | "finance"
  | "auditor"
  | "support"

export type OverrideReason =
  | "vip_guest"
  | "delegation"
  | "emergency"
  | "inspection"
  | "special_event"

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AdminSite {
  id: string
  name: string
  siteCode: string
  address: string
  state: string
  district: string
  city: string
  pinCode: string
  latitude: number
  longitude: number
  contactNumber: string
  email: string
  status: EntityStatus
  occupancy: number
  revenue: number
  buildingsCount: number
  roomsCount: number
  image: string
  rating: number
}

export interface AdminBuilding {
  id: string
  siteId: string
  siteName: string
  name: string
  buildingCode: string
  description: string
  floors: number
  rooms: number
  occupancy: number
  revenue: number
  status: EntityStatus
}

export interface AdminFloor {
  id: string
  siteId: string
  siteName: string
  buildingId: string
  buildingName: string
  name: string
  floorNumber: number
  description: string
  rooms: number
  occupancy: number
  status: EntityStatus
}

export interface AdminRoom {
  id: string
  number: string
  name: string
  type: ExtendedRoomType
  siteId: string
  siteName: string
  buildingId: string
  buildingName: string
  floorId: string
  floorName: string
  capacity: number
  price: number
  sqFt: number
  image: string
  status: RoomInventoryStatus
  occupancy: number
  amenities: string[]
}

export interface AdminUser {
  id: string
  employeeId: string
  name: string
  department: string
  designation: string
  email: string
  mobile: string
  verificationStatus: "verified" | "pending" | "rejected"
  status: UserStatus
  governmentId: string
  bookingsCount: number
}

export interface AdminBooking {
  id: string
  userId: string
  guest: string
  siteId: string
  site: string
  building: string
  roomId: string
  room: string
  roomType: ExtendedRoomType
  checkIn: string
  checkOut: string
  amount: number
  status: ExtendedBookingStatus
  paymentStatus: PaymentStatus
  createdAt: string
}

export interface Transaction {
  id: string
  bookingId: string
  guest: string
  site: string
  method: PaymentMethod
  amount: number
  status: PaymentStatus
  timestamp: string
}

export interface RefundRequest {
  id: string
  bookingId: string
  guest: string
  amount: number
  requestedAmount: number
  reason: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export interface AccessLog {
  id: string
  userId: string
  userName: string
  site: string
  building: string
  room: string
  eventType: AccessEventType
  credentialType: "qr" | "token" | "pin"
  timestamp: string
  ipAddress: string
}

export interface AuditLog {
  id: string
  actor: string
  action: string
  module: string
  timestamp: string
  oldValue: string
  newValue: string
  ipAddress: string
}

export interface NotificationItem {
  id: string
  title: string
  message: string
  channel: NotificationChannel
  template: string
  status: "sent" | "scheduled" | "failed"
  recipient: string
  timestamp: string
}

export interface ActivityItem {
  id: string
  type: "booking" | "user" | "payment" | "checkin" | "release"
  title: string
  description: string
  timestamp: string
  actor?: string
}

export interface AdminDashboardStats {
  totalSites: number
  totalBuildings: number
  totalFloors: number
  totalRooms: number
  activeBookings: number
  todayCheckIns: number
  todayCheckOuts: number
  occupiedRooms: number
  availableRooms: number
  revenueToday: number
  revenueMonth: number
  pendingRefunds: number
}

export interface CheckInRecord {
  id: string
  bookingId: string
  guest: string
  site: string
  room: string
  expectedTime: string
  status: "expected" | "late" | "pending" | "completed"
}

export interface CheckOutRecord {
  id: string
  bookingId: string
  guest: string
  site: string
  room: string
  expectedTime: string
  status: "expected" | "completed" | "overstay"
}

export interface RoleDefinition {
  id: AdminRole
  name: string
  description: string
  usersCount: number
  permissions: Record<string, boolean>
}

export const PERMISSION_MODULES = [
  "sites",
  "buildings",
  "floors",
  "rooms",
  "inventory",
  "users",
  "bookings",
  "checkin",
  "checkout",
  "occupancy",
  "access",
  "payments",
  "reports",
  "audit",
  "roles",
  "settings",
  "analytics",
] as const

export const PERMISSION_ACTIONS = [
  "create",
  "read",
  "update",
  "delete",
  "approve",
  "export",
  "override",
  "manage_settings",
] as const

export const ROOM_TYPES: ExtendedRoomType[] = [
  "Standard",
  "Deluxe",
  "Executive",
  "VIP Suite",
  "Conference Room",
]

export const AMENITIES = [
  "AC",
  "TV",
  "WiFi",
  "Parking",
  "Hot Water",
  "Laundry",
  "Kitchen",
  "Fridge",
  "Workspace",
  "Balcony",
] as const

export const ROOM_TYPE_DEFAULTS: Record<
  ExtendedRoomType,
  { capacity: number; price: number; sqFt: number; amenities: readonly string[]; image: string }
> = {
  Standard: {
    capacity: 2,
    price: 1500,
    sqFt: 180,
    amenities: ["AC", "WiFi", "Hot Water"],
    image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
  },
  Deluxe: {
    capacity: 2,
    price: 2200,
    sqFt: 280,
    amenities: ["AC", "TV", "WiFi", "Hot Water", "Workspace"],
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
  },
  Executive: {
    capacity: 2,
    price: 4500,
    sqFt: 400,
    amenities: ["AC", "TV", "WiFi", "Hot Water", "Workspace", "Fridge", "Parking"],
    image: "https://images.unsplash.com/photo-1618773928128-c85592739700?w=800&q=80",
  },
  "VIP Suite": {
    capacity: 4,
    price: 8500,
    sqFt: 650,
    amenities: AMENITIES,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
  },
  "Conference Room": {
    capacity: 20,
    price: 6000,
    sqFt: 800,
    amenities: ["AC", "WiFi", "TV", "Workspace", "Parking", "Hot Water"],
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80",
  },
}
