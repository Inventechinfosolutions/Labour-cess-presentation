import { Link } from "react-router-dom"
import {
  Building2,
  ChevronRight,
  Edit,
  Hotel,
  MapPin,
  MoreHorizontal,
  Power,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SiteHierarchyActions } from "@/components/admin/SiteHierarchyActions"
import { formatCurrency } from "@/utils/format"
import { cn } from "@/lib/utils"
import type { AdminSite } from "@/types/admin"

interface AdminSiteCardProps {
  site: AdminSite
  onEdit: () => void
  onToggleStatus: () => void
}

export function AdminSiteCard({ site, onEdit, onToggleStatus }: AdminSiteCardProps) {
  const isActive = site.status === "active"

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-airbnb)]">
      <div className="relative h-44 shrink-0 overflow-hidden sm:h-48">
        <img
          src={site.image}
          alt={site.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="absolute left-2.5 top-2.5 flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm",
              isActive ? "bg-white text-foreground" : "bg-black/55 text-white backdrop-blur-sm"
            )}
          >
            {isActive ? "Live" : site.status}
          </span>
          <span className="flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-foreground shadow-sm">
            <Star className="size-2.5 fill-foreground" />
            {site.rating}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-2 z-10 size-8 rounded-full bg-white/95 text-foreground shadow-sm hover:bg-white"
              aria-label="Site actions"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 rounded-xl">
            <DropdownMenuItem className="rounded-lg" asChild>
              <Link to={`/admin/sites/${site.id}`}>
                <ChevronRight className="mr-2 size-4" />
                Manage
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-lg" onClick={onEdit}>
              <Edit className="mr-2 size-4" />
              Edit listing
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg" onClick={onToggleStatus}>
              <Power className="mr-2 size-4" />
              {isActive ? "Unpublish" : "Publish"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="min-w-0 pr-1">
          <p className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {site.siteCode}
          </p>
          <h3 className="mt-0.5 line-clamp-1 text-sm font-semibold leading-snug text-foreground">
            {site.name}
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">
              {site.city}, {site.state}
            </span>
          </p>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Building2 className="size-3 text-primary/80" />
            {site.buildingsCount}
          </span>
          <span className="text-border">·</span>
          <span className="inline-flex items-center gap-1">
            <Hotel className="size-3 text-primary/80" />
            {site.roomsCount} rooms
          </span>
          <span className="text-border">·</span>
          <span>{site.occupancy}% full</span>
          <span className="text-border">·</span>
          <span className="font-medium text-foreground">{formatCurrency(site.revenue)}</span>
        </div>

        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${site.occupancy}%` }}
          />
        </div>

        <div className="mt-2.5">
          <SiteHierarchyActions site={site} compact />
        </div>
      </div>
    </article>
  )
}
