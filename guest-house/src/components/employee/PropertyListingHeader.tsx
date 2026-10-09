import { useState } from "react"
import { Heart, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PropertyListingHeaderProps {
  title: string
  className?: string
}

export function PropertyListingHeader({ title, className }: PropertyListingHeaderProps) {
  const [saved, setSaved] = useState(false)

  return (
    <div className={cn("mb-4 flex items-start justify-between gap-4 sm:mb-5", className)}>
      <h1 className="min-w-0 text-[22px] font-semibold leading-tight tracking-tight text-foreground sm:text-[26px]">
        {title}
      </h1>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold underline-offset-4 transition-colors hover:bg-muted/50 hover:underline"
        >
          <Share2 className="size-4" />
          Share
        </button>
        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold underline-offset-4 transition-colors hover:bg-muted/50 hover:underline"
        >
          <Heart className={cn("size-4", saved && "fill-primary text-primary")} />
          Save
        </button>
      </div>
    </div>
  )
}
