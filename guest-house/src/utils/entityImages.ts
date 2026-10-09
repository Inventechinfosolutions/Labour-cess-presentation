import heroBackground from "@/assets/hero-background.png"

function galleryUrl(photoId: string) {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80`
}

const LISTING_IMAGES = [
  galleryUrl("photo-1566073771259-6a8506099945"),
  galleryUrl("photo-1582719478250-c89cae4dc85b"),
  galleryUrl("photo-1631049307264-da0ec9d70304"),
  galleryUrl("photo-1564013799919-ab600027ffc6"),
  galleryUrl("photo-1571896349842-33c89424de2d"),
  galleryUrl("photo-1486406146926-c627a92ad1ab"),
  galleryUrl("photo-1545324418-cc1a3fa10c00"),
  galleryUrl("photo-1524758631624-e2822e304c36"),
  galleryUrl("photo-1497366811353-6870744d04b2"),
  galleryUrl("photo-1502672260266-1c1ef2cd9362"),
  galleryUrl("photo-1560518883-ce09059eeffa"),
  galleryUrl("photo-1577495508326-19a1b3cf65b5"),
]

const SITE_GALLERY_IMAGES: Record<string, string[]> = {
  bengaluru: [
    LISTING_IMAGES[0],
    LISTING_IMAGES[1],
    LISTING_IMAGES[5],
    LISTING_IMAGES[7],
    LISTING_IMAGES[9],
  ],
  mysuru: [
    LISTING_IMAGES[1],
    LISTING_IMAGES[2],
    LISTING_IMAGES[6],
    LISTING_IMAGES[8],
    LISTING_IMAGES[10],
  ],
  belagavi: [
    LISTING_IMAGES[0],
    LISTING_IMAGES[3],
    LISTING_IMAGES[4],
    LISTING_IMAGES[5],
    LISTING_IMAGES[7],
  ],
  mangaluru: [
    LISTING_IMAGES[2],
    LISTING_IMAGES[4],
    LISTING_IMAGES[6],
    LISTING_IMAGES[9],
    LISTING_IMAGES[11],
  ],
}

const SITE_LISTING_IMAGES: Record<string, string> = {
  bengaluru: LISTING_IMAGES[0],
  mysuru: LISTING_IMAGES[1],
  belagavi: LISTING_IMAGES[3],
  mangaluru: LISTING_IMAGES[2],
}

export const GALLERY_FALLBACK_IMAGES = [...LISTING_IMAGES, heroBackground]

export function getListingImage(id: string) {
  return pickFromPool(id, LISTING_IMAGES)
}

export function getSiteListingImage(siteId: string) {
  return SITE_LISTING_IMAGES[siteId] ?? getListingImage(siteId)
}

export function getSiteGalleryImages(siteId: string, count = 5) {
  const gallery = SITE_GALLERY_IMAGES[siteId]
  if (gallery) return gallery.slice(0, count)
  const start = hashIndex(siteId, LISTING_IMAGES.length)
  return Array.from({ length: count }, (_, i) => LISTING_IMAGES[(start + i) % LISTING_IMAGES.length])
}

export function getGalleryFallback(index: number) {
  return GALLERY_FALLBACK_IMAGES[index % GALLERY_FALLBACK_IMAGES.length]
}

const BUILDING_IMAGES = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
  "https://images.unsplash.com/photo-1577495508326-19a1b3cf65b5?w=600&q=80",
  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80",
]

const FLOOR_IMAGES = [
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80",
  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=600&q=80",
]

const BOOKING_IMAGES = [
  "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80",
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
]

const REPORT_IMAGES = [
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80",
  "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&q=80",
]

function hashIndex(id: string, length: number) {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i) * (i + 1)) % length
  }
  return hash
}

function pickFromPool(id: string, pool: string[]) {
  return pool[hashIndex(id, pool.length)]
}

export function getBuildingImage(id: string) {
  return pickFromPool(id, BUILDING_IMAGES)
}

export function getFloorImage(id: string) {
  return pickFromPool(id, FLOOR_IMAGES)
}

export function getBookingImage(id: string) {
  return pickFromPool(id, BOOKING_IMAGES)
}

export function getReportImage(title: string) {
  return pickFromPool(title, REPORT_IMAGES)
}

const AVATAR_PARAMS = "?w=128&h=128&fit=crop&crop=face&q=80"

const USER_AVATAR_IMAGES = [
  `https://images.unsplash.com/photo-1712425718137-491250cfde88${AVATAR_PARAMS}`,
  `https://images.unsplash.com/photo-1697517529954-b6845f3245a0${AVATAR_PARAMS}`,
  `https://images.unsplash.com/photo-1670110531916-41045e83cb0a${AVATAR_PARAMS}`,
  `https://images.unsplash.com/photo-1705513054794-d18a8eb0af6c${AVATAR_PARAMS}`,
  `https://images.unsplash.com/photo-1712425718085-cdd2b2298669${AVATAR_PARAMS}`,
  `https://images.unsplash.com/photo-1647689662423-7948c8523256${AVATAR_PARAMS}`,
  `https://images.unsplash.com/photo-1618926749434-0578ceecdfab${AVATAR_PARAMS}`,
  `https://images.unsplash.com/photo-1729157661483-ed21901ed892${AVATAR_PARAMS}`,
]

export function getUserAvatar(name: string, id?: string) {
  return pickFromPool(id ?? name, USER_AVATAR_IMAGES)
}

const DEMO_EMPLOYEE_AVATAR =
  `https://images.unsplash.com/photo-1712425718137-491250cfde88${AVATAR_PARAMS}`

const DEMO_ADMIN_AVATAR =
  `https://images.unsplash.com/photo-1712425718085-cdd2b2298669${AVATAR_PARAMS}`

export function getEmployeeProfileImage(name: string, id?: string) {
  const key = name.trim().toLowerCase()
  if (key.includes("demo employee") || id === "emp-demo") {
    return DEMO_EMPLOYEE_AVATAR
  }
  return getUserAvatar(name, id)
}

export function getAdminProfileImage(name: string) {
  const key = name.trim().toLowerCase()
  if (key.includes("super admin") || key === "admin") {
    return DEMO_ADMIN_AVATAR
  }
  return getUserAvatar(name)
}

export function getAccessImage(_id: string) {
  return "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80"
}

const OVERRIDE_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80",
  "https://images.unsplash.com/photo-1611892440504-42a784e24d32?w=600&q=80",
]

export function getOverrideImage(id: string) {
  return pickFromPool(id, OVERRIDE_IMAGES)
}

const PAYMENT_METHOD_IMAGES: Record<string, string> = {
  upi: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&q=80",
  card: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
  cards: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80",
  netbanking: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
  "net banking": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80",
  wallet: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80",
}

export function getPaymentMethodImage(method: string) {
  return PAYMENT_METHOD_IMAGES[method.toLowerCase()] ?? pickFromPool(method, BOOKING_IMAGES)
}

export function getRefundImage(id: string) {
  return pickFromPool(id, BOOKING_IMAGES)
}

export function getQrCredentialImage(type: string) {
  const map: Record<string, string> = {
    "qr code": "https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=600&q=80",
    "booking token": "https://images.unsplash.com/photo-1633265486064-086b219458ec?w=600&q=80",
    pin: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=600&q=80",
  }
  return map[type.toLowerCase()] ?? getAccessImage(type)
}
