import type { Room, RoomType } from "@/types"
import { floors } from "./floors"
import { buildings } from "./buildings"

const roomTypes: RoomType[] = ["Standard", "Deluxe", "Executive Suite"]
const amenitiesMap: Record<RoomType, string[]> = {
  Standard: ["Wi-Fi", "AC", "TV", "Attached Bath"],
  Deluxe: ["Wi-Fi", "AC", "Smart TV", "Mini Fridge", "Work Desk"],
  "Executive Suite": ["Wi-Fi", "AC", "Smart TV", "Mini Bar", "Lounge", "Room Service"],
}
const priceMap: Record<RoomType, number> = {
  Standard: 1200,
  Deluxe: 2200,
  "Executive Suite": 4500,
}

function generateRooms(): Room[] {
  const rooms: Room[] = []
  let counter = 0

  for (const floor of floors) {
    const building = buildings.find((b) => b.id === floor.buildingId)!
    for (let i = 0; i < floor.totalRooms; i++) {
      const type = roomTypes[i % 3]
      counter++
      rooms.push({
        id: `room-${counter}`,
        floorId: floor.id,
        buildingId: floor.buildingId,
        siteId: building.siteId,
        number: `${floor.number}${String(i + 1).padStart(2, "0")}`,
        type,
        capacity: type === "Executive Suite" ? 3 : type === "Deluxe" ? 2 : 2,
        amenities: amenitiesMap[type],
        price: priceMap[type],
        available: Math.random() > 0.3,
      })
    }
  }
  return rooms
}

export const rooms: Room[] = generateRooms()
