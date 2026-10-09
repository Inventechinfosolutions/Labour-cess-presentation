import { Link } from "react-router-dom"
import { Bed, Users, Wifi } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/utils/format"
import type { Room } from "@/types"

interface RoomCardProps {
  room: Room
  linkTo?: string
}

export function RoomCard({ room, linkTo }: RoomCardProps) {
  return (
    <Card className="hover-card border-border/60 transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bed className="size-4 text-primary" />
              <span className="text-lg font-semibold">Room {room.number}</span>
            </div>
            <Badge variant="secondary" className="mt-2">
              {room.type}
            </Badge>
          </div>
          <Badge
            variant="outline"
            className={
              room.available
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }
          >
            {room.available ? "Available" : "Booked"}
          </Badge>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {room.capacity} guests
          </span>
          <span className="flex items-center gap-1">
            <Wifi className="size-3.5" />
            {room.amenities.length} amenities
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {room.amenities.slice(0, 3).map((a) => (
            <Badge key={a} variant="outline" className="text-xs font-normal">
              {a}
            </Badge>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t pt-4">
          <div>
            <span className="text-lg font-bold text-primary">
              {formatCurrency(room.price)}
            </span>
            <span className="text-xs text-muted-foreground"> / night</span>
          </div>
          {room.available && linkTo && (
            <Button size="sm" asChild>
              <Link to={linkTo}>Book Now</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
