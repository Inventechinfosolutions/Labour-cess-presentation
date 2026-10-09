import { Link } from "react-router-dom"
import { MapPin, Star, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Site } from "@/types"

interface LocationCardProps {
  site: Site
  linkTo?: string
}

export function LocationCard({ site, linkTo }: LocationCardProps) {
  const content = (
    <Card className="group overflow-hidden border-border/60 transition-shadow hover:shadow-lg hover-card">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={site.image}
          alt={site.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <Badge className="absolute right-3 top-3 bg-white/90 text-foreground">
          {site.availableRooms} rooms available
        </Badge>
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-lg font-semibold text-white">{site.name}</h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-white/80">
            <MapPin className="size-3.5" />
            <span className="line-clamp-1">{site.city}</span>
          </div>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            <span className="font-medium">{site.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="size-3.5" />
            <span>{site.occupancy}% occupied</span>
          </div>
        </div>
        <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">{site.address}</p>
      </CardContent>
    </Card>
  )

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>
  }
  return content
}
