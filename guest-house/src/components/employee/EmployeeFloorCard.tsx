import { Link } from "react-router-dom"
import { ArrowRight, DoorOpen } from "lucide-react"
import type { Floor } from "@/types"
import { getFloorImage } from "@/utils/entityImages"

interface EmployeeFloorCardProps {
  floor: Floor
  linkTo: string
}

export function EmployeeFloorCard({ floor, linkTo }: EmployeeFloorCardProps) {
  return (
    <Link
      to={linkTo}
      className="group flex overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm transition-all hover:border-border hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
    >
      <div className="relative w-28 shrink-0 overflow-hidden bg-muted sm:w-32">
        <img
          src={getFloorImage(floor.id)}
          alt={floor.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-foreground/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-white drop-shadow-md sm:text-4xl">
            {floor.number}
          </span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-foreground">{floor.name}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <DoorOpen className="size-3.5" />
          {floor.totalRooms} rooms on this floor
        </p>
        <p className="mt-3 text-sm font-medium text-foreground transition-colors group-hover:underline">
          View rooms
        </p>
      </div>

      <div className="flex items-center pr-4 sm:pr-5">
        <span className="flex size-9 items-center justify-center rounded-full border border-border/80 bg-muted/40 text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
          <ArrowRight className="size-4" />
        </span>
      </div>
    </Link>
  )
}
