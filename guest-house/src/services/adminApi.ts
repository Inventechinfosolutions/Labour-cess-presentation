import { getEnterpriseData } from "@/mock-data/enterprise"
import {
  ROOM_TYPE_DEFAULTS,
  ROOM_TYPES,
  type AdminBooking,
  type AdminBuilding,
  type AdminDashboardStats,
  type AdminFloor,
  type AdminRoom,
  type AdminSite,
  type AdminUser,
  type AuditLog,
  type CheckInRecord,
  type CheckOutRecord,
  type AccessLog,
  type NotificationItem,
  type PaginatedResult,
  type RefundRequest,
  type Transaction,
  type ActivityItem,
  type ExtendedRoomType,
} from "@/types/admin"

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: string
  siteId?: string
  buildingId?: string
  floorId?: string
}

function paginate<T>(
  items: T[],
  { page = 1, pageSize = 20 }: ListParams
): PaginatedResult<T> {
  const total = items.length
  const totalPages = Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  return {
    data: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  }
}

function searchFilter<T>(items: T[], search: string | undefined, fields: (keyof T)[]): T[] {
  if (!search?.trim()) return items
  const q = search.toLowerCase()
  return items.filter((item) =>
    fields.some((f) => String(item[f]).toLowerCase().includes(q))
  )
}

function parseRoomType(value: string): ExtendedRoomType {
  const match = ROOM_TYPES.find((t) => t.toLowerCase() === value.trim().toLowerCase())
  if (!match) {
    throw new Error(`Invalid room type. Use one of: ${ROOM_TYPES.join(", ")}`)
  }
  return match
}

function roomNumberForFloor(floorNumber: number, roomIndex: number): string {
  return `${floorNumber}${String(roomIndex).padStart(2, "0")}`
}

function parsePositiveInt(value: string, fallback: number): number {
  const parsed = Number.parseInt(value.trim(), 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function parseNonNegativeFloat(value: string, fallback: number): number {
  const parsed = Number.parseFloat(value.trim())
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback
}

export type BulkRoomTypeSlot = {
  type: string
  count: string
  capacity: string
  price: string
  sqFt: string
  amenities: string[]
  image: string
}

type ResolvedRoomSpec = {
  type: ExtendedRoomType
  capacity: number
  price: number
  sqFt: number
  amenities: string[]
  image: string
}

function resolveBulkRoomSlots(slots: BulkRoomTypeSlot[]): ResolvedRoomSpec[] {
  if (slots.length === 0) {
    throw new Error("Add at least one room type to the mix")
  }

  const expanded: ResolvedRoomSpec[] = []

  for (const slot of slots) {
    const type = parseRoomType(slot.type)
    const count = Number.parseInt(slot.count.trim(), 10)
    const defaults = ROOM_TYPE_DEFAULTS[type]

    if (!Number.isFinite(count) || count < 1) {
      throw new Error(`Enter a valid count for ${type}`)
    }

    const capacity = parsePositiveInt(slot.capacity, defaults.capacity)
    const price = parseNonNegativeFloat(slot.price, defaults.price)
    const sqFt = parsePositiveInt(slot.sqFt, defaults.sqFt)
    const amenities =
      slot.amenities.length > 0 ? slot.amenities : [...defaults.amenities]
    const image = slot.image.trim() || defaults.image

    for (let i = 0; i < count; i++) {
      expanded.push({ type, capacity, price, sqFt, amenities, image })
    }
  }

  if (expanded.length > 50) {
    throw new Error("Maximum 50 rooms per floor in a single batch")
  }

  return expanded
}

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  await delay()
  return getEnterpriseData().stats
}

export async function fetchAdminActivities(): Promise<ActivityItem[]> {
  await delay(200)
  return getEnterpriseData().activities
}

export async function fetchAdminChartData() {
  await delay(200)
  return getEnterpriseData().chartData
}

export async function fetchAdminSites(params: ListParams = {}): Promise<PaginatedResult<AdminSite>> {
  await delay()
  const { sites } = getEnterpriseData()
  let filtered = searchFilter(sites, params.search, ["name", "siteCode", "city", "state"])
  if (params.status) filtered = filtered.filter((s) => s.status === params.status)
  return paginate(filtered, params)
}

export async function fetchAdminSite(id: string): Promise<AdminSite | undefined> {
  await delay(200)
  return getEnterpriseData().sites.find((s) => s.id === id)
}

export type CreateSiteInput = {
  name: string
  siteCode: string
  address: string
  state: string
  district: string
  pinCode: string
  latitude: string
  longitude: string
  contactNumber: string
  email: string
  image?: string
}

const DEFAULT_SITE_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"

export async function createAdminSite(input: CreateSiteInput): Promise<AdminSite> {
  await delay(400)

  const name = input.name.trim()
  const siteCode = input.siteCode.trim()

  if (!name || !siteCode) {
    throw new Error("Guest house name and guest house code are required")
  }

  const data = getEnterpriseData()
  const normalizedCode = siteCode.toUpperCase()

  if (data.sites.some((s) => s.siteCode.toUpperCase() === normalizedCode)) {
    throw new Error(`Guest house code "${siteCode}" already exists`)
  }

  const latitude = Number.parseFloat(input.latitude)
  const longitude = Number.parseFloat(input.longitude)
  const city = input.district.trim().split(" ")[0] || input.district.trim() || name

  const newSite: AdminSite = {
    id: `site-${Date.now()}`,
    name,
    siteCode,
    address: input.address.trim(),
    state: input.state.trim(),
    district: input.district.trim(),
    city,
    pinCode: input.pinCode.trim(),
    latitude: Number.isFinite(latitude) ? latitude : 0,
    longitude: Number.isFinite(longitude) ? longitude : 0,
    contactNumber: input.contactNumber.trim(),
    email: input.email.trim(),
    status: "active",
    occupancy: 0,
    revenue: 0,
    buildingsCount: 0,
    roomsCount: 0,
    image: input.image?.trim() || DEFAULT_SITE_IMAGE,
    rating: 0,
  }

  data.sites.unshift(newSite)
  data.stats.totalSites = data.sites.length

  return newSite
}

export async function fetchAdminBuildings(params: ListParams = {}): Promise<PaginatedResult<AdminBuilding>> {
  await delay()
  const { buildings } = getEnterpriseData()
  let filtered = searchFilter(buildings, params.search, ["name", "buildingCode", "siteName"])
  if (params.siteId) filtered = filtered.filter((b) => b.siteId === params.siteId)
  if (params.status) filtered = filtered.filter((b) => b.status === params.status)
  return paginate(filtered, params)
}

export async function fetchAdminBuilding(id: string): Promise<AdminBuilding | undefined> {
  await delay(200)
  return getEnterpriseData().buildings.find((b) => b.id === id)
}

export type CreateBuildingInput = {
  name: string
  buildingCode: string
  siteId: string
  description: string
}

export async function createAdminBuilding(input: CreateBuildingInput): Promise<AdminBuilding> {
  await delay(400)

  const name = input.name.trim()
  const buildingCode = input.buildingCode.trim()
  const siteId = input.siteId.trim()

  if (!name || !buildingCode || !siteId) {
    throw new Error("Building name, code, and site are required")
  }

  const data = getEnterpriseData()
  const site = data.sites.find((s) => s.id === siteId)
  if (!site) {
    throw new Error("Site not found")
  }

  const normalizedCode = buildingCode.toUpperCase()
  if (
    data.buildings.some(
      (b) => b.siteId === site.id && b.buildingCode.toUpperCase() === normalizedCode,
    )
  ) {
    throw new Error(`Building code "${buildingCode}" already exists in "${site.name}"`)
  }

  const newBuilding: AdminBuilding = {
    id: `bld-${Date.now()}`,
    siteId: site.id,
    siteName: site.name,
    name,
    buildingCode,
    description: input.description.trim(),
    floors: 0,
    rooms: 0,
    occupancy: 0,
    revenue: 0,
    status: "active",
  }

  data.buildings.unshift(newBuilding)
  site.buildingsCount += 1
  data.stats.totalBuildings = data.buildings.length

  return newBuilding
}

export async function fetchAdminFloors(params: ListParams = {}): Promise<PaginatedResult<AdminFloor>> {
  await delay()
  const { floors } = getEnterpriseData()
  let filtered = searchFilter(floors, params.search, ["name", "siteName", "buildingName"])
  if (params.buildingId) filtered = filtered.filter((f) => f.buildingId === params.buildingId)
  if (params.siteId) filtered = filtered.filter((f) => f.siteId === params.siteId)
  return paginate(filtered, params)
}

export type CreateFloorInput = {
  name: string
  floorNumber: string
  buildingId: string
  description: string
}

export async function createAdminFloor(input: CreateFloorInput): Promise<AdminFloor> {
  await delay(400)

  const name = input.name.trim()
  const buildingId = input.buildingId.trim()
  const floorNumber = Number.parseInt(input.floorNumber.trim(), 10)

  if (!name || !buildingId || !Number.isFinite(floorNumber)) {
    throw new Error("Floor name, building, and a valid floor number are required")
  }

  const data = getEnterpriseData()
  const building = data.buildings.find((b) => b.id === buildingId)
  if (!building) {
    throw new Error("Building not found")
  }

  if (
    data.floors.some(
      (f) => f.buildingId === building.id && f.floorNumber === floorNumber,
    )
  ) {
    throw new Error(`Floor number ${floorNumber} already exists in "${building.name}"`)
  }

  const newFloor: AdminFloor = {
    id: `floor-${Date.now()}`,
    siteId: building.siteId,
    siteName: building.siteName,
    buildingId: building.id,
    buildingName: building.name,
    name,
    floorNumber,
    description: input.description.trim(),
    rooms: 0,
    occupancy: 0,
    status: "active",
  }

  data.floors.unshift(newFloor)
  building.floors += 1
  data.stats.totalFloors = data.floors.length

  return newFloor
}

export type BulkCreateFloorsInput = {
  buildingId: string
  count: string
  startFloorNumber: string
}

export async function bulkCreateAdminFloors(
  input: BulkCreateFloorsInput,
): Promise<{ created: AdminFloor[]; count: number }> {
  await delay(400)

  const buildingId = input.buildingId.trim()
  const count = Number.parseInt(input.count.trim(), 10)
  const startFloorNumber = Number.parseInt(input.startFloorNumber.trim(), 10)

  if (!buildingId || !Number.isFinite(count) || count < 1 || count > 50) {
    throw new Error("Building and a floor count between 1 and 50 are required")
  }
  if (!Number.isFinite(startFloorNumber) || startFloorNumber < 0) {
    throw new Error("A valid starting floor number is required")
  }

  const data = getEnterpriseData()
  const building = data.buildings.find((b) => b.id === buildingId)
  if (!building) {
    throw new Error("Building not found")
  }

  const floorNumbers = Array.from({ length: count }, (_, i) => startFloorNumber + i)
  const conflicts = floorNumbers.filter((n) =>
    data.floors.some((f) => f.buildingId === building.id && f.floorNumber === n),
  )
  if (conflicts.length > 0) {
    throw new Error(
      `Floor number${conflicts.length > 1 ? "s" : ""} ${conflicts.join(", ")} already exist in "${building.name}"`,
    )
  }

  const baseId = Date.now()
  const created: AdminFloor[] = floorNumbers.map((floorNumber, index) => {
    const newFloor: AdminFloor = {
      id: `floor-${baseId}-${index}`,
      siteId: building.siteId,
      siteName: building.siteName,
      buildingId: building.id,
      buildingName: building.name,
      name: `Floor ${floorNumber}`,
      floorNumber,
      description: `Level ${floorNumber} accommodation wing`,
      rooms: 0,
      occupancy: 0,
      status: "active",
    }
    data.floors.unshift(newFloor)
    return newFloor
  })

  building.floors += created.length
  data.stats.totalFloors = data.floors.length

  return { created, count: created.length }
}

export async function fetchAdminRooms(params: ListParams = {}): Promise<PaginatedResult<AdminRoom>> {
  await delay()
  const { rooms } = getEnterpriseData()
  let filtered = searchFilter(rooms, params.search, ["number", "name", "siteName", "buildingName", "type"])
  if (params.siteId) filtered = filtered.filter((r) => r.siteId === params.siteId)
  if (params.buildingId) filtered = filtered.filter((r) => r.buildingId === params.buildingId)
  if (params.floorId) filtered = filtered.filter((r) => r.floorId === params.floorId)
  if (params.status) filtered = filtered.filter((r) => r.status === params.status)
  return paginate(filtered, params)
}

export type CreateRoomInput = {
  number: string
  name: string
  type: string
  siteId: string
  buildingId: string
  floorId: string
  capacity: string
  price: string
  sqFt: string
  amenities: string[]
  image?: string
}

export async function createAdminRoom(input: CreateRoomInput): Promise<AdminRoom> {
  await delay(400)

  const number = input.number.trim()
  const name = input.name.trim()
  const siteId = input.siteId.trim()
  const buildingId = input.buildingId.trim()
  const floorId = input.floorId.trim()

  if (!number || !name || !siteId || !buildingId || !floorId) {
    throw new Error("Room number, name, site, building, and floor are required")
  }

  const data = getEnterpriseData()
  const site = data.sites.find((s) => s.id === siteId)
  if (!site) {
    throw new Error("Site not found")
  }

  const building = data.buildings.find((b) => b.id === buildingId && b.siteId === site.id)
  if (!building) {
    throw new Error(`Building not found in "${site.name}"`)
  }

  const floor = data.floors.find((f) => f.id === floorId && f.buildingId === building.id)
  if (!floor) {
    throw new Error(`Floor not found in "${building.name}"`)
  }

  if (data.rooms.some((r) => r.floorId === floor.id && r.number === number)) {
    throw new Error(`Room number "${number}" already exists on "${floor.name}"`)
  }

  const roomType = parseRoomType(input.type)
  const defaults = ROOM_TYPE_DEFAULTS[roomType]
  const capacity = parsePositiveInt(input.capacity, defaults.capacity)
  const price = parseNonNegativeFloat(input.price, defaults.price)
  const sqFt = parsePositiveInt(input.sqFt, defaults.sqFt)

  const newRoom: AdminRoom = {
    id: `room-${Date.now()}`,
    number,
    name,
    type: roomType,
    siteId: site.id,
    siteName: site.name,
    buildingId: building.id,
    buildingName: building.name,
    floorId: floor.id,
    floorName: floor.name,
    capacity,
    price,
    sqFt,
    image: input.image?.trim() || defaults.image,
    status: "available",
    occupancy: 0,
    amenities: input.amenities.length > 0 ? input.amenities : [...defaults.amenities],
  }

  data.rooms.unshift(newRoom)
  floor.rooms += 1
  building.rooms += 1
  site.roomsCount += 1
  data.stats.totalRooms = data.rooms.length
  data.stats.availableRooms += 1

  return newRoom
}

export type BulkCreateRoomsScope = "all_floors" | "single_floor"

export type BulkCreateRoomsInput = {
  siteId: string
  buildingId: string
  scope: BulkCreateRoomsScope
  floorId?: string
  slots: BulkRoomTypeSlot[]
}

export async function bulkCreateAdminRooms(
  input: BulkCreateRoomsInput,
): Promise<{ created: AdminRoom[]; count: number }> {
  await delay(400)

  const siteId = input.siteId.trim()
  const buildingId = input.buildingId.trim()

  if (!siteId || !buildingId) {
    throw new Error("Site and building are required")
  }

  const roomSpecs = resolveBulkRoomSlots(input.slots)
  const roomsPerFloor = roomSpecs.length

  const data = getEnterpriseData()
  const site = data.sites.find((s) => s.id === siteId)
  if (!site) {
    throw new Error("Site not found")
  }

  const building = data.buildings.find((b) => b.id === buildingId && b.siteId === site.id)
  if (!building) {
    throw new Error(`Building not found in "${site.name}"`)
  }

  let targetFloors = data.floors
    .filter((f) => f.buildingId === building.id)
    .sort((a, b) => a.floorNumber - b.floorNumber)

  if (input.scope === "single_floor") {
    const floorId = input.floorId?.trim()
    if (!floorId) {
      throw new Error("Select a floor for single-floor bulk creation")
    }
    const floor = targetFloors.find((f) => f.id === floorId)
    if (!floor) {
      throw new Error(`Floor not found in "${building.name}"`)
    }
    targetFloors = [floor]
  }

  if (targetFloors.length === 0) {
    throw new Error(`No floors found in "${building.name}". Add floors first.`)
  }

  const plannedNumbers: { floorId: string; number: string }[] = []
  for (const floor of targetFloors) {
    for (let r = 1; r <= roomsPerFloor; r++) {
      plannedNumbers.push({
        floorId: floor.id,
        number: roomNumberForFloor(floor.floorNumber, r),
      })
    }
  }

  const conflicts = plannedNumbers.filter(({ floorId, number }) =>
    data.rooms.some((r) => r.floorId === floorId && r.number === number),
  )
  if (conflicts.length > 0) {
    const sample = conflicts.slice(0, 3).map((c) => c.number).join(", ")
    const suffix = conflicts.length > 3 ? ` and ${conflicts.length - 3} more` : ""
    throw new Error(`Room number${conflicts.length > 1 ? "s" : ""} ${sample}${suffix} already exist`)
  }

  const baseId = Date.now()
  const created: AdminRoom[] = []
  let roomIndex = 0

  for (const floor of targetFloors) {
    for (let r = 1; r <= roomsPerFloor; r++) {
      const spec = roomSpecs[r - 1]
      const number = roomNumberForFloor(floor.floorNumber, r)
      const newRoom: AdminRoom = {
        id: `room-${baseId}-${roomIndex}`,
        number,
        name: `${spec.type} ${number}`,
        type: spec.type,
        siteId: site.id,
        siteName: site.name,
        buildingId: building.id,
        buildingName: building.name,
        floorId: floor.id,
        floorName: floor.name,
        capacity: spec.capacity,
        price: spec.price,
        sqFt: spec.sqFt,
        image: spec.image,
        status: "available",
        occupancy: 0,
        amenities: spec.amenities,
      }
      data.rooms.unshift(newRoom)
      floor.rooms += 1
      building.rooms += 1
      site.roomsCount += 1
      data.stats.availableRooms += 1
      created.push(newRoom)
      roomIndex += 1
    }
  }

  data.stats.totalRooms = data.rooms.length

  return { created, count: created.length }
}

export async function fetchAdminUsers(params: ListParams = {}): Promise<PaginatedResult<AdminUser>> {
  await delay()
  const { users } = getEnterpriseData()
  let filtered = searchFilter(users, params.search, ["name", "employeeId", "email", "department"])
  if (params.status) filtered = filtered.filter((u) => u.status === params.status)
  return paginate(filtered, params)
}

export async function fetchAdminUser(id: string): Promise<AdminUser | undefined> {
  await delay(200)
  return getEnterpriseData().users.find((u) => u.id === id)
}

export async function fetchAdminBookings(params: ListParams = {}): Promise<PaginatedResult<AdminBooking>> {
  await delay()
  const { bookings } = getEnterpriseData()
  let filtered = searchFilter(bookings, params.search, ["id", "guest", "site", "room"])
  if (params.status) filtered = filtered.filter((b) => b.status === params.status)
  return paginate(filtered, params)
}

export async function fetchAdminBooking(id: string): Promise<AdminBooking | undefined> {
  await delay(200)
  return getEnterpriseData().bookings.find((b) => b.id === id)
}

export async function fetchAdminTransactions(params: ListParams = {}): Promise<PaginatedResult<Transaction>> {
  await delay()
  const { transactions } = getEnterpriseData()
  let filtered = searchFilter(transactions, params.search, ["id", "guest", "bookingId", "site"])
  if (params.status) filtered = filtered.filter((t) => t.status === params.status)
  return paginate(filtered, params)
}

export async function fetchAdminRefunds(): Promise<RefundRequest[]> {
  await delay(200)
  return getEnterpriseData().refunds
}

export async function fetchAdminCheckIns(): Promise<CheckInRecord[]> {
  await delay(200)
  return getEnterpriseData().checkIns
}

export async function fetchAdminCheckOuts(): Promise<CheckOutRecord[]> {
  await delay(200)
  return getEnterpriseData().checkOuts
}

export async function fetchAdminAccessLogs(params: ListParams = {}): Promise<PaginatedResult<AccessLog>> {
  await delay()
  const { accessLogs } = getEnterpriseData()
  let filtered = searchFilter(accessLogs, params.search, ["userName", "site", "room", "building"])
  if (params.status) filtered = filtered.filter((l) => l.eventType === params.status)
  return paginate(filtered, params)
}

export async function fetchAdminAuditLogs(params: ListParams = {}): Promise<PaginatedResult<AuditLog>> {
  await delay()
  const { auditLogs } = getEnterpriseData()
  let filtered = searchFilter(auditLogs, params.search, ["actor", "action", "module"])
  if (params.status) filtered = filtered.filter((a) => a.module.toLowerCase() === params.status?.toLowerCase())
  return paginate(filtered, params)
}

export async function fetchAdminNotifications(): Promise<NotificationItem[]> {
  await delay(200)
  return getEnterpriseData().notifications
}

export async function fetchOccupancyBySite() {
  await delay(200)
  const { sites } = getEnterpriseData()
  return sites.slice(0, 20).map((s) => ({
    site: s.city,
    occupancy: s.occupancy,
    available: 100 - s.occupancy,
    rooms: s.roomsCount,
  }))
}

export async function fetchOccupancyByBuilding(siteId?: string) {
  await delay(200)
  const { buildings } = getEnterpriseData()
  const filtered = siteId ? buildings.filter((b) => b.siteId === siteId) : buildings
  return filtered.slice(0, 15).map((b) => ({
    building: b.name,
    occupancy: b.occupancy,
    rooms: b.rooms,
  }))
}

export async function simulateAction(action: string): Promise<{ success: boolean; message: string }> {
  await delay(500)
  return { success: true, message: `${action} completed successfully (demo)` }
}

export async function updateAdminBookingStatus(
  id: string,
  status: AdminBooking["status"]
): Promise<AdminBooking | undefined> {
  await delay(400)
  const booking = getEnterpriseData().bookings.find((b) => b.id === id)
  if (booking) booking.status = status
  return booking
}

export async function updateRoomInventoryStatus(
  id: string,
  status: AdminRoom["status"]
): Promise<AdminRoom | undefined> {
  await delay(400)
  const room = getEnterpriseData().rooms.find((r) => r.id === id)
  if (room) room.status = status
  return room
}
