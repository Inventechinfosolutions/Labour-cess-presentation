import type {
  AccessLog,
  ActivityItem,
  AdminBooking,
  AdminBuilding,
  AdminDashboardStats,
  AdminFloor,
  AdminRoom,
  AdminSite,
  AdminUser,
  AuditLog,
  CheckInRecord,
  CheckOutRecord,
  ExtendedRoomType,
  NotificationItem,
  RefundRequest,
  RoomInventoryStatus,
  Transaction,
} from "@/types/admin"
import { AMENITIES, ROOM_TYPE_DEFAULTS } from "@/types/admin"

const KARNATAKA_DISTRICTS = [
  "Bagalkot",
  "Ballari",
  "Belagavi",
  "Bengaluru Rural",
  "Bengaluru Urban",
  "Bidar",
  "Chamarajanagar",
  "Chikkaballapura",
  "Chikkamagaluru",
  "Chitradurga",
  "Dakshina Kannada",
  "Davanagere",
  "Dharwad",
  "Gadag",
  "Hassan",
  "Haveri",
  "Kalaburagi",
  "Kodagu",
  "Kolar",
  "Koppal",
  "Mandya",
  "Mysuru",
  "Raichur",
] as const

const STATES = [{ state: "Karnataka", districts: [...KARNATAKA_DISTRICTS] }]

const DISTRICT_CITIES: Record<string, string> = {
  "Bengaluru Rural": "Devanahalli",
  "Bengaluru Urban": "Bengaluru",
  "Dakshina Kannada": "Mangaluru",
  Kodagu: "Madikeri",
}

function districtCity(district: string) {
  return DISTRICT_CITIES[district] ?? district.split(" ")[0]
}

const DEPARTMENTS = [
  "Finance Ministry",
  "Home Affairs",
  "Defence",
  "Railways",
  "External Affairs",
  "Health & Family Welfare",
  "Education",
  "IT & Electronics",
  "Urban Development",
  "Tourism",
]

const DESIGNATIONS = [
  "Under Secretary",
  "Deputy Secretary",
  "Section Officer",
  "Assistant Director",
  "Administrative Officer",
  "Executive Engineer",
  "Scientist-B",
  "Deputy Manager",
]

const ROOM_TYPES: ExtendedRoomType[] = [
  "Standard",
  "Deluxe",
  "Executive",
  "VIP Suite",
  "Conference Room",
]

const ROOM_STATUSES: RoomInventoryStatus[] = [
  "available",
  "occupied",
  "blocked",
  "reserved",
  "maintenance",
  "cleaning",
]

const FIRST_NAMES = [
  "Rajesh", "Priya", "Amit", "Sneha", "Vikram", "Anita", "Suresh", "Kavita",
  "Rahul", "Meera", "Arun", "Deepa", "Sanjay", "Lakshmi", "Manoj", "Pooja",
]

const LAST_NAMES = [
  "Kumar", "Sharma", "Patel", "Reddy", "Singh", "Gupta", "Nair", "Iyer",
  "Das", "Verma", "Joshi", "Menon", "Rao", "Pillai", "Chopra", "Bose",
]

const SITE_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
]

const LEGACY_SITES: AdminSite[] = [
  {
    id: "bengaluru",
    name: "Bengaluru Guest House",
    siteCode: "GH-BLR-001",
    address: "MG Road, Bengaluru, Karnataka 560001",
    state: "Karnataka",
    district: "Bengaluru Urban",
    city: "Bengaluru",
    pinCode: "560001",
    latitude: 12.9716,
    longitude: 77.5946,
    contactNumber: "+91 80 2222 1001",
    email: "blr@guesthouse.gov.in",
    status: "active",
    occupancy: 75,
    revenue: 8450000,
    buildingsCount: 3,
    roomsCount: 48,
    image: SITE_IMAGES[0],
    rating: 4.7,
  },
  {
    id: "mysuru",
    name: "Mysuru Guest House",
    siteCode: "GH-MYS-001",
    address: "Sayyaji Rao Road, Mysuru, Karnataka 570001",
    state: "Karnataka",
    district: "Mysuru",
    city: "Mysuru",
    pinCode: "570001",
    latitude: 12.2958,
    longitude: 76.6394,
    contactNumber: "+91 821 242 2002",
    email: "mys@guesthouse.gov.in",
    status: "active",
    occupancy: 78,
    revenue: 6200000,
    buildingsCount: 2,
    roomsCount: 36,
    image: SITE_IMAGES[1],
    rating: 4.5,
  },
  {
    id: "belagavi",
    name: "Belagavi Guest House",
    siteCode: "GH-BLG-001",
    address: "Camp Area, Belagavi, Karnataka 590001",
    state: "Karnataka",
    district: "Belagavi",
    city: "Belagavi",
    pinCode: "590001",
    latitude: 15.8497,
    longitude: 74.4977,
    contactNumber: "+91 831 242 3003",
    email: "blg@guesthouse.gov.in",
    status: "active",
    occupancy: 72,
    revenue: 9100000,
    buildingsCount: 3,
    roomsCount: 54,
    image: SITE_IMAGES[2],
    rating: 4.6,
  },
  {
    id: "mangaluru",
    name: "Mangaluru Guest House",
    siteCode: "GH-MNG-001",
    address: "Hampankatta, Mangaluru, Karnataka 575001",
    state: "Karnataka",
    district: "Dakshina Kannada",
    city: "Mangaluru",
    pinCode: "575001",
    latitude: 12.9141,
    longitude: 74.856,
    contactNumber: "+91 824 242 4004",
    email: "mng@guesthouse.gov.in",
    status: "active",
    occupancy: 76,
    revenue: 5400000,
    buildingsCount: 2,
    roomsCount: 42,
    image: SITE_IMAGES[3],
    rating: 4.4,
  },
]

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function pad(n: number, len = 3) {
  return String(n).padStart(len, "0")
}

export interface EnterpriseData {
  sites: AdminSite[]
  buildings: AdminBuilding[]
  floors: AdminFloor[]
  rooms: AdminRoom[]
  users: AdminUser[]
  bookings: AdminBooking[]
  transactions: Transaction[]
  auditLogs: AuditLog[]
  notifications: NotificationItem[]
  accessLogs: AccessLog[]
  activities: ActivityItem[]
  checkIns: CheckInRecord[]
  checkOuts: CheckOutRecord[]
  refunds: RefundRequest[]
  stats: AdminDashboardStats
  chartData: {
    occupancyTrend: { month: string; occupancy: number }[]
    revenueTrend: { month: string; revenue: number }[]
    bookingTrend: { week: string; bookings: number }[]
    checkInTrend: { day: string; checkIns: number }[]
    checkOutTrend: { day: string; checkOuts: number }[]
    revenueBySite: { site: string; revenue: number }[]
    occupancyBySite: { site: string; occupancy: number }[]
  }
}

export function generateEnterpriseData(): EnterpriseData {
  const rng = mulberry32(42)
  const sites: AdminSite[] = [...LEGACY_SITES]
  const buildings: AdminBuilding[] = []
  const floors: AdminFloor[] = []
  const rooms: AdminRoom[] = []
  const users: AdminUser[] = []
  const bookings: AdminBooking[] = []

  for (let i = 5; i <= 100; i++) {
    const loc = pick(rng, STATES)
    const district = pick(rng, loc.districts)
    const city = districtCity(district)
    sites.push({
      id: `site-${pad(i)}`,
      name: `${city} Government Guest House`,
      siteCode: `GH-${city.slice(0, 3).toUpperCase()}-${pad(i)}`,
      address: `Sector ${Math.floor(rng() * 50) + 1}, ${district}, ${loc.state}`,
      state: loc.state,
      district,
      city,
      pinCode: String(100000 + Math.floor(rng() * 899999)),
      latitude: 8 + rng() * 28,
      longitude: 68 + rng() * 25,
      contactNumber: `+91 ${Math.floor(70 + rng() * 19)}${Math.floor(10000000 + rng() * 89999999)}`,
      email: `${city.toLowerCase().replace(/\s/g, "")}@guesthouse.gov.in`,
      status: rng() > 0.08 ? "active" : "inactive",
      occupancy: Math.floor(55 + rng() * 40),
      revenue: Math.floor(200000 + rng() * 12000000),
      buildingsCount: 5,
      roomsCount: 100,
      image: pick(rng, SITE_IMAGES),
      rating: Math.round((3.8 + rng() * 1.2) * 10) / 10,
    })
  }

  let buildingIdx = 0
  for (const site of sites) {
    const bCount = site.id.startsWith("site-") ? 5 : site.buildingsCount
    for (let b = 1; b <= bCount; b++) {
      buildingIdx++
      const bid = site.id === "bengaluru" ? ["blr-a", "blr-b", "blr-c"][b - 1]
        : site.id === "mysuru" ? ["mys-a", "mys-b"][b - 1]
        : site.id === "belagavi" ? ["blg-a", "blg-b", "blg-c"][b - 1]
        : site.id === "mangaluru" ? ["mng-a", "mng-b"][b - 1]
        : `bld-${pad(buildingIdx, 4)}`
      const floorCount = site.id.startsWith("site-") ? 4 : Math.floor(2 + rng() * 3)
      const roomCount = site.id.startsWith("site-") ? Math.floor(site.roomsCount / bCount) : 20
      buildings.push({
        id: bid!,
        siteId: site.id,
        siteName: site.name,
        name: `Building ${String.fromCharCode(64 + b)}`,
        buildingCode: `${site.siteCode}-B${b}`,
        description: `Administrative block ${b} at ${site.city}`,
        floors: floorCount,
        rooms: roomCount,
        occupancy: Math.floor(50 + rng() * 45),
        revenue: Math.floor(site.revenue / bCount),
        status: rng() > 0.05 ? "active" : "inactive",
      })

      for (let f = 1; f <= floorCount; f++) {
        const fid = `${bid}-f${f}`
        const roomsOnFloor = site.id.startsWith("site-") ? Math.ceil(roomCount / floorCount) : 5
        floors.push({
          id: fid,
          siteId: site.id,
          siteName: site.name,
          buildingId: bid!,
          buildingName: `Building ${String.fromCharCode(64 + b)}`,
          name: `Floor ${f}`,
          floorNumber: f,
          description: `Level ${f} accommodation wing`,
          rooms: roomsOnFloor,
          occupancy: Math.floor(50 + rng() * 45),
          status: "active",
        })

        for (let r = 1; r <= roomsOnFloor; r++) {
          const type = pick(rng, ROOM_TYPES)
          const status = pick(rng, ROOM_STATUSES)
          const amenityCount = Math.floor(3 + rng() * 5)
          const shuffled = [...AMENITIES].sort(() => rng() - 0.5)
          rooms.push({
            id: `room-${rooms.length + 1}`,
            number: `${f}${pad(r, 2)}`,
            name: `${type} ${f}${pad(r, 2)}`,
            type,
            siteId: site.id,
            siteName: site.name,
            buildingId: bid!,
            buildingName: `Building ${String.fromCharCode(64 + b)}`,
            floorId: fid,
            floorName: `Floor ${f}`,
            capacity: ROOM_TYPE_DEFAULTS[type].capacity,
            price: ROOM_TYPE_DEFAULTS[type].price,
            sqFt: ROOM_TYPE_DEFAULTS[type].sqFt,
            image: ROOM_TYPE_DEFAULTS[type].image,
            status,
            occupancy: status === "occupied" ? 100 : status === "available" ? 0 : Math.floor(rng() * 80),
            amenities: shuffled.slice(0, amenityCount),
          })
        }
      }
    }
  }

  while (rooms.length < 10000) {
    const site = pick(rng, sites)
    const building = pick(rng, buildings.filter((b) => b.siteId === site.id))
    const floor = pick(rng, floors.filter((f) => f.buildingId === building.id))
    const type = pick(rng, ROOM_TYPES)
    const n = rooms.length + 1
    rooms.push({
      id: `room-${n}`,
      number: `${floor.floorNumber}${pad(n % 99, 2)}`,
      name: `Room ${n}`,
      type,
      siteId: site.id,
      siteName: site.name,
      buildingId: building.id,
      buildingName: building.name,
      floorId: floor.id,
      floorName: floor.name,
      capacity: ROOM_TYPE_DEFAULTS[type].capacity,
      price: ROOM_TYPE_DEFAULTS[type].price,
      sqFt: ROOM_TYPE_DEFAULTS[type].sqFt,
      image: ROOM_TYPE_DEFAULTS[type].image,
      status: pick(rng, ROOM_STATUSES),
      occupancy: Math.floor(rng() * 100),
      amenities: AMENITIES.slice(0, Math.floor(3 + rng() * 5)),
    })
  }

  for (let i = 1; i <= 5000; i++) {
    const fn = pick(rng, FIRST_NAMES)
    const ln = pick(rng, LAST_NAMES)
    users.push({
      id: `user-${pad(i, 4)}`,
      employeeId: `EMP-2024-${pad(i, 4)}`,
      name: `${fn} ${ln}`,
      department: pick(rng, DEPARTMENTS),
      designation: pick(rng, DESIGNATIONS),
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@gov.in`,
      mobile: `98${Math.floor(10000000 + rng() * 89999999)}`,
      verificationStatus: rng() > 0.15 ? "verified" : rng() > 0.5 ? "pending" : "rejected",
      status: rng() > 0.1 ? "active" : rng() > 0.5 ? "suspended" : "pending",
      governmentId: rng() > 0.5 ? "Aadhaar" : "PAN",
      bookingsCount: Math.floor(rng() * 12),
    })
  }

  const bookingStatuses: AdminBooking["status"][] = [
    "pending", "confirmed", "checked_in", "checked_out", "cancelled", "expired", "no_show",
  ]
  const paymentStatuses: AdminBooking["paymentStatus"][] = [
    "success", "pending", "failed", "refunded", "partial_refund",
  ]

  for (let i = 1; i <= 20000; i++) {
    const user = pick(rng, users)
    const room = pick(rng, rooms)
    const daysAhead = Math.floor(rng() * 60) - 15
    const checkIn = new Date()
    checkIn.setDate(checkIn.getDate() + daysAhead)
    const nights = Math.floor(1 + rng() * 7)
    const checkOut = new Date(checkIn)
    checkOut.setDate(checkOut.getDate() + nights)
    bookings.push({
      id: `GHB-2026-${pad(i, 5)}`,
      userId: user.id,
      guest: user.name,
      siteId: room.siteId,
      site: room.siteName,
      building: room.buildingName,
      roomId: room.id,
      room: room.number,
      roomType: room.type,
      checkIn: checkIn.toISOString().slice(0, 10),
      checkOut: checkOut.toISOString().slice(0, 10),
      amount: room.price * nights + Math.floor(rng() * 2000),
      status: pick(rng, bookingStatuses),
      paymentStatus: pick(rng, paymentStatuses),
      createdAt: new Date(Date.now() - Math.floor(rng() * 90) * 86400000).toISOString(),
    })
  }

  const transactions: Transaction[] = []
  for (let i = 1; i <= 50000; i++) {
    const booking = pick(rng, bookings)
    const methods: Transaction["method"][] = ["upi", "card", "netbanking", "wallet"]
    transactions.push({
      id: `TXN-${pad(i, 6)}`,
      bookingId: booking.id,
      guest: booking.guest,
      site: booking.site,
      method: pick(rng, methods),
      amount: Math.floor(booking.amount * (0.3 + rng() * 0.7)),
      status: pick(rng, ["success", "pending", "failed", "refunded", "partial_refund"] as const),
      timestamp: new Date(Date.now() - Math.floor(rng() * 180) * 86400000).toISOString(),
    })
  }

  const auditLogs: AuditLog[] = []
  const modules = ["Sites", "Bookings", "Users", "Payments", "Access", "Rooms", "Settings"]
  const actions = ["CREATE", "UPDATE", "DELETE", "APPROVE", "OVERRIDE", "EXPORT"]
  for (let i = 1; i <= 500; i++) {
    auditLogs.push({
      id: `AUD-${pad(i, 4)}`,
      actor: pick(rng, users).name,
      action: pick(rng, actions),
      module: pick(rng, modules),
      timestamp: new Date(Date.now() - Math.floor(rng() * 30) * 86400000).toISOString(),
      oldValue: "Previous state",
      newValue: "Updated state",
      ipAddress: `192.168.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}`,
    })
  }

  const notifications: NotificationItem[] = []
  const templates = [
    "Booking Confirmation", "Payment Success", "Payment Failure",
    "Check-in Reminder", "Checkout Reminder", "Refund Processed",
  ]
  const channels: NotificationItem["channel"][] = ["sms", "email", "push", "whatsapp"]
  for (let i = 1; i <= 100; i++) {
    notifications.push({
      id: `NTF-${pad(i, 4)}`,
      title: pick(rng, templates),
      message: `Notification message for record ${i}`,
      channel: pick(rng, channels),
      template: pick(rng, templates),
      status: pick(rng, ["sent", "scheduled", "failed"] as const),
      recipient: pick(rng, users).email,
      timestamp: new Date(Date.now() - Math.floor(rng() * 14) * 86400000).toISOString(),
    })
  }

  const accessLogs: AccessLog[] = []
  const eventTypes: AccessLog["eventType"][] = ["entry", "exit", "denied", "expired"]
  for (let i = 1; i <= 200; i++) {
    const user = pick(rng, users)
    const room = pick(rng, rooms)
    accessLogs.push({
      id: `ACC-${pad(i, 4)}`,
      userId: user.id,
      userName: user.name,
      site: room.siteName,
      building: room.buildingName,
      room: room.number,
      eventType: pick(rng, eventTypes),
      credentialType: pick(rng, ["qr", "token", "pin"] as const),
      timestamp: new Date(Date.now() - Math.floor(rng() * 7) * 86400000).toISOString(),
      ipAddress: `10.0.${Math.floor(rng() * 255)}.${Math.floor(rng() * 255)}`,
    })
  }

  const activities: ActivityItem[] = [
    { id: "1", type: "booking", title: "Room booked", description: "Executive suite reserved at Belagavi Guest House", timestamp: new Date(Date.now() - 3600000).toISOString(), actor: "Rajesh Kumar" },
    { id: "2", type: "user", title: "User registered", description: "New employee verification submitted", timestamp: new Date(Date.now() - 7200000).toISOString(), actor: "System" },
    { id: "3", type: "payment", title: "Payment success", description: "₹4,248 received via UPI", timestamp: new Date(Date.now() - 10800000).toISOString() },
    { id: "4", type: "checkin", title: "Check-in completed", description: "Room 203 — Bengaluru Guest House", timestamp: new Date(Date.now() - 14400000).toISOString() },
    { id: "5", type: "release", title: "Room released", description: "Room 105 available after checkout", timestamp: new Date(Date.now() - 18000000).toISOString() },
  ]

  const today = new Date().toISOString().slice(0, 10)
  const checkIns: CheckInRecord[] = bookings
    .filter((b) => b.checkIn === today && ["confirmed", "pending"].includes(b.status))
    .slice(0, 50)
    .map((b, i) => ({
      id: `ci-${i}`,
      bookingId: b.id,
      guest: b.guest,
      site: b.site,
      room: b.room,
      expectedTime: `${10 + (i % 8)}:00`,
      status: (["expected", "late", "pending", "completed"] as const)[i % 4],
    }))

  const checkOuts: CheckOutRecord[] = bookings
    .filter((b) => b.checkOut === today && ["checked_in", "confirmed"].includes(b.status))
    .slice(0, 50)
    .map((b, i) => ({
      id: `co-${i}`,
      bookingId: b.id,
      guest: b.guest,
      site: b.site,
      room: b.room,
      expectedTime: `${9 + (i % 6)}:00`,
      status: (["expected", "completed", "overstay"] as const)[i % 3],
    }))

  const refunds: RefundRequest[] = bookings
    .filter((b) => b.paymentStatus === "refunded" || b.paymentStatus === "partial_refund")
    .slice(0, 30)
    .map((b, i) => ({
      id: `REF-${pad(i + 1, 4)}`,
      bookingId: b.id,
      guest: b.guest,
      amount: b.amount,
      requestedAmount: Math.floor(b.amount * (0.5 + rng() * 0.5)),
      reason: pick(rng, ["Cancellation", "Early checkout", "Service issue", "Duplicate payment"]),
      status: pick(rng, ["pending", "approved", "rejected"] as const),
      createdAt: b.createdAt,
    }))

  const occupiedRooms = rooms.filter((r) => r.status === "occupied").length
  const availableRooms = rooms.filter((r) => r.status === "available").length
  const activeBookings = bookings.filter((b) =>
    ["confirmed", "checked_in", "pending"].includes(b.status)
  ).length

  const stats: AdminDashboardStats = {
    totalSites: sites.length,
    totalBuildings: buildings.length,
    totalFloors: floors.length,
    totalRooms: rooms.length,
    activeBookings,
    todayCheckIns: checkIns.length || 24,
    todayCheckOuts: checkOuts.length || 18,
    occupiedRooms,
    availableRooms,
    revenueToday: Math.floor(transactions.filter((t) => t.status === "success").slice(0, 200).reduce((s, t) => s + t.amount, 0) / 200 * 45),
    revenueMonth: transactions.filter((t) => t.status === "success").reduce((s, t) => s + t.amount, 0) / 6,
    pendingRefunds: refunds.filter((r) => r.status === "pending").length,
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const chartData = {
    occupancyTrend: months.map((month, i) => ({ month, occupancy: 62 + Math.floor(rng() * 25) + i })),
    revenueTrend: months.map((month, i) => ({ month, revenue: Math.floor(180 + rng() * 120 + i * 15) })),
    bookingTrend: ["W1", "W2", "W3", "W4", "W5", "W6"].map((week) => ({ week, bookings: Math.floor(40 + rng() * 35) })),
    checkInTrend: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({ day, checkIns: Math.floor(15 + rng() * 30) })),
    checkOutTrend: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({ day, checkOuts: Math.floor(12 + rng() * 25) })),
    revenueBySite: sites.slice(0, 10).map((s) => ({ site: s.city, revenue: Math.round(s.revenue / 100000) })),
    occupancyBySite: sites.slice(0, 10).map((s) => ({ site: s.city, occupancy: s.occupancy })),
  }

  return {
    sites,
    buildings,
    floors,
    rooms,
    users,
    bookings,
    transactions,
    auditLogs,
    notifications,
    accessLogs,
    activities,
    checkIns,
    checkOuts,
    refunds,
    stats,
    chartData,
  }
}

let cached: EnterpriseData | null = null

export function getEnterpriseData(): EnterpriseData {
  if (!cached) cached = generateEnterpriseData()
  return cached
}

export function resetEnterpriseData() {
  cached = null
}
