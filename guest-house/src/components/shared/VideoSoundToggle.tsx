import { Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoSoundToggleProps {
  isSoundOn: boolean
  onToggle: () => void
  className?: string
}

export function VideoSoundToggle({ isSoundOn, onToggle, className }: VideoSoundToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isSoundOn ? "Mute background video" : "Unmute background video"}
      aria-pressed={isSoundOn}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground shadow-sm backdrop-blur-sm transition hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/40",
        className,
      )}
    >
      {isSoundOn ? <Volume2 className="size-4" aria-hidden /> : <VolumeX className="size-4" aria-hidden />}
    </button>
  )
}
