export type UserRole = "employee" | "admin"

export type RoomType = "Standard" | "Deluxe" | "Executive Suite"

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "active"
  | "completed"
  | "cancelled"

export type PaymentMethod = "upi" | "debit" | "credit" | "netbanking"

export type VerificationStatus = "verified" | "pending" | "rejected"

export interface User {
  id: string
  name: string
  email: string
  mobile: string
  department: string
  employeeId: string
  verificationStatus: VerificationStatus
  idDocument?: string
  role: UserRole
}

export interface Site {
  id: string
  name: string
  city: string
  address: string
  image: string
  rating: number
  totalRooms: number
  availableRooms: number
  occupancy: number
  buildingsCount: number
}

export interface Building {
  id: string
  siteId: string
  name: string
  floors: number
  totalRooms: number
  occupancy: number
}

export interface Floor {
  id: string
  buildingId: string
  name: string
  number: number
  totalRooms: number
}

export interface Room {
  id: string
  floorId: string
  buildingId: string
  siteId: string
  number: string
  type: RoomType
  capacity: number
  amenities: string[]
  price: number
  available: boolean
}

export interface Booking {
  id: string
  userId: string
  userName: string
  siteId: string
  siteName: string
  buildingName: string
  roomId: string
  roomNumber: string
  roomType: RoomType
  checkIn: string
  checkOut: string
  guests: number
  status: BookingStatus
  totalAmount: number
  createdAt: string
}

export interface Payment {
  id: string
  bookingId: string
  method: PaymentMethod
  amount: number
  status: "success" | "pending" | "failed"
  timestamp: string
}

export interface Report {
  id: string
  title: string
  type: "daily" | "weekly" | "monthly" | "revenue"
  description: string
  generatedAt: string
  metrics: Record<string, string | number>
}

export interface DashboardStats {
  totalSites: number
  totalBuildings: number
  totalRooms: number
  activeBookings: number
  revenue: number
  occupancyPercent: number
}

export interface BookingDraft {
  roomId: string
  siteId: string
  buildingId: string
  checkIn: string
  checkOut: string
  guests: number
  roomCharges: number
  taxes: number
  totalAmount: number
}

export interface EmployeeBookingAccess {
  bookingId: string
  accessId: string
  qrPayload: string
  userId: string
  userName: string
  siteId: string
  siteName: string
  buildingName: string
  roomId: string
  roomNumber: string
  roomType: RoomType
  checkIn: string
  checkOut: string
  guests: number
  totalAmount: number
  status: BookingStatus
  createdAt: string
}

export interface AuthUser {
  id: string
  name: string
  role: UserRole
  mobile?: string
  email?: string
  employeeId?: string
}
