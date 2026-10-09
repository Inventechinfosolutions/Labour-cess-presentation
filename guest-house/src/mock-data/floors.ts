import type { Floor } from "@/types"

function generateFloors(
  buildingId: string,
  count: number,
  roomsPerFloor: number
): Floor[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${buildingId}-f${i + 1}`,
    buildingId,
    name: `Floor ${i + 1}`,
    number: i + 1,
    totalRooms: roomsPerFloor,
  }))
}

export const floors: Floor[] = [
  ...generateFloors("blr-a", 3, 6),
  ...generateFloors("blr-b", 3, 5),
  ...generateFloors("blr-c", 2, 7),
  ...generateFloors("mys-a", 3, 7),
  ...generateFloors("mys-b", 2, 8),
  ...generateFloors("blg-a", 3, 7),
  ...generateFloors("blg-b", 3, 6),
  ...generateFloors("blg-c", 2, 8),
  ...generateFloors("mng-a", 3, 8),
  ...generateFloors("mng-b", 2, 10),
]
