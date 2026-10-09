import { useRef } from "react"
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Landmark,
  MapPin,
  SlidersHorizontal,
  Train,
  TreePine,
  Waves,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Category {
  id: string
  label: string
  icon: LucideIcon
}

const CATEGORIES: Category[] = [
  { id: "all", label: "All guest houses", icon: Building2 },
  { id: "popular", label: "Popular", icon: Heart },
  { id: "capital", label: "Capital cities", icon: Landmark },
  { id: "south", label: "South India", icon: TreePine },
  { id: "metro", label: "Near metro", icon: Train },
  { id: "coastal", label: "Coastal", icon: Waves },
  { id: "central", label: "Central India", icon: MapPin },
]

interface ExploreCategoryBarProps {
  activeId: string
  onChange: (id: string) => void
}

export function ExploreCategoryBar({ activeId, onChange }: ExploreCategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" })
  }

  return (
    <div className="sticky top-[var(--explore-header-offset)] z-40 border-b border-border/60 bg-background">
      <div className="relative mx-auto flex items-center gap-2 px-4 sm:px-6 lg:px-10">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute left-1 z-10 hidden size-8 rounded-full bg-background shadow-sm lg:flex"
          onClick={() => scroll("left")}
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div
          ref={scrollRef}
          className="explore-category-scroll flex flex-1 items-center gap-1 overflow-x-auto py-3 scrollbar-none"
        >
          {CATEGORIES.map((cat) => {
            const active = activeId === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange(cat.id)}
                className={cn(
                  "explore-category-item flex shrink-0 flex-col items-center gap-1.5 border-b-2 px-4 pb-2 pt-1 transition-colors",
                  active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                <cat.icon className={cn("size-6", active && "stroke-[1.75]")} strokeWidth={1.5} />
                <span className="whitespace-nowrap text-xs font-medium">{cat.label}</span>
              </button>
            )
          })}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-[5.5rem] z-10 hidden size-8 rounded-full bg-background shadow-sm lg:flex"
          onClick={() => scroll("right")}
          aria-label="Scroll categories right"
        >
          <ChevronRight className="size-4" />
        </Button>

        <Button
          type="button"
          variant="outline"
          className="ml-2 hidden shrink-0 gap-2 rounded-xl border-border/80 px-4 lg:flex"
        >
          <SlidersHorizontal className="size-4" />
          Filters
        </Button>
      </div>
    </div>
  )
}
