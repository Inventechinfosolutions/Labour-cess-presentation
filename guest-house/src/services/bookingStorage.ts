import type { Booking, EmployeeBookingAccess } from "@/types"

const SESSION_BOOKINGS_KEY = "ghb_session_bookings"

export function saveSessionBooking(booking: EmployeeBookingAccess) {
  const existing = getSessionBookings()
  const next = [booking, ...existing.filter((item) => item.bookingId !== booking.bookingId)]
  sessionStorage.setItem(SESSION_BOOKINGS_KEY, JSON.stringify(next))
}

export function getSessionBookings(): EmployeeBookingAccess[] {
  try {
    const raw = sessionStorage.getItem(SESSION_BOOKINGS_KEY)
    return raw ? (JSON.parse(raw) as EmployeeBookingAccess[]) : []
  } catch {
    return []
  }
}

export function getSessionBookingById(bookingId: string): EmployeeBookingAccess | undefined {
  return getSessionBookings().find((booking) => booking.bookingId === bookingId)
}

export function toBookingRecord(access: EmployeeBookingAccess): Booking {
  return {
    id: access.bookingId,
    userId: access.userId,
    userName: access.userName,
    siteId: access.siteId,
    siteName: access.siteName,
    buildingName: access.buildingName,
    roomId: access.roomId,
    roomNumber: access.roomNumber,
    roomType: access.roomType,
    checkIn: access.checkIn,
    checkOut: access.checkOut,
    guests: access.guests,
    status: access.status,
    totalAmount: access.totalAmount,
    createdAt: access.createdAt,
  }
}
