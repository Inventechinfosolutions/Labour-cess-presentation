import {
  sites,
  buildings,
  floors,
  rooms,
  users,
  bookings,
  reports,
} from "@/mock-data"
import { getSessionBookings, toBookingRecord } from "@/services/bookingStorage"
import type {
  Site,
  Building,
  Floor,
  Room,
  User,
  Booking,
  Report,
  DashboardStats,
  BookingStatus,
} from "@/types"

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms))

export async function fetchSites(): Promise<Site[]> {
  await delay()
  return sites
}

export function getSiteMinPrice(siteId: string): number {
  const siteRooms = rooms.filter((r) => r.siteId === siteId)
  if (siteRooms.length === 0) return 1200
  return Math.min(...siteRooms.map((r) => r.price))
}

export async function fetchSite(id: string): Promise<Site | undefined> {
  await delay(300)
  return sites.find((s) => s.id === id)
}

export async function fetchBuildings(siteId: string): Promise<Building[]> {
  await delay(300)
  return buildings.filter((b) => b.siteId === siteId)
}

export async function fetchBuilding(id: string): Promise<Building | undefined> {
  await delay(200)
  return buildings.find((b) => b.id === id)
}

export async function fetchFloors(buildingId: string): Promise<Floor[]> {
  await delay(300)
  return floors.filter((f) => f.buildingId === buildingId)
}

export async function fetchRooms(floorId: string): Promise<Room[]> {
  await delay(300)
  return rooms.filter((r) => r.floorId === floorId)
}

export async function fetchRoom(id: string): Promise<Room | undefined> {
  await delay(200)
  return rooms.find((r) => r.id === id)
}

export async function fetchUsers(): Promise<User[]> {
  await delay()
  return users
}

export async function fetchBookings(): Promise<Booking[]> {
  await delay()
  return bookings
}

export async function fetchEmployeeBookings(userId: string): Promise<Booking[]> {
  await delay(300)
  const sessionBookings = getSessionBookings()
    .filter((booking) => booking.userId === userId)
    .map(toBookingRecord)
  const mockBookings = bookings.filter((b) => b.userId === userId)
  const sessionIds = new Set(sessionBookings.map((booking) => booking.id))
  const merged = [
    ...sessionBookings,
    ...mockBookings.filter((booking) => !sessionIds.has(booking.id)),
  ]
  return merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function fetchReports(): Promise<Report[]> {
  await delay()
  return reports
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  await delay()
  return {
    totalSites: sites.length,
    totalBuildings: buildings.length,
    totalRooms: rooms.length,
    activeBookings: bookings.filter(
      (b) => b.status === "confirmed" || b.status === "checked_in" || b.status === "active"
    ).length,
    revenue: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
    occupancyPercent: Math.round(
      sites.reduce((sum, s) => sum + s.occupancy, 0) / sites.length
    ),
  }
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking | undefined> {
  await delay(500)
  const booking = bookings.find((b) => b.id === id)
  if (booking) booking.status = status
  return booking
}

export async function updateRoomPrice(
  id: string,
  price: number
): Promise<Room | undefined> {
  await delay(400)
  const room = rooms.find((r) => r.id === id)
  if (room) room.price = price
  return room
}
