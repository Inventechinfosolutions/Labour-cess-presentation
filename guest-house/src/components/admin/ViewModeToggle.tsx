import { LayoutGrid, Table2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ViewMode } from "@/hooks/useViewMode"

interface ViewModeToggleProps {
  value: ViewMode
  onChange: (mode: ViewMode) => void
  className?: string
}

export function ViewModeToggle({ value, onChange, className }: ViewModeToggleProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 gap-1 rounded-full bg-muted/70 p-1",
        className
      )}
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        onClick={() => onChange("cards")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
          value === "cards"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="size-3.5" />
        Cards
      </button>
      <button
        type="button"
        onClick={() => onChange("table")}
        className={cn(
          "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
          value === "table"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Table2 className="size-3.5" />
        Table
      </button>
    </div>
  )
}
