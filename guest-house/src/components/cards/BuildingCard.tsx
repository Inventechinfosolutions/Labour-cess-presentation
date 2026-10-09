import { Link } from "react-router-dom"
import { Building2, Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Building } from "@/types"

interface BuildingCardProps {
  building: Building
  linkTo?: string
}

export function BuildingCard({ building, linkTo }: BuildingCardProps) {
  const content = (
    <Card className="group cursor-pointer border-border/60 transition-all hover:border-primary/30 hover:shadow-md hover-card">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="size-5 text-primary" />
          </div>
          <span className="text-sm text-muted-foreground">{building.totalRooms} rooms</span>
        </div>
        <h3 className="mt-4 text-lg font-semibold">{building.name}</h3>
        <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Layers className="size-3.5" />
          <span>{building.floors} floors</span>
        </div>
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-muted-foreground">Occupancy</span>
            <span className="font-medium">{building.occupancy}%</span>
          </div>
          <Progress value={building.occupancy} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  )

  if (linkTo) return <Link to={linkTo}>{content}</Link>
  return content
}
