import type { RefObject } from "react"
import heroVideo from "@/assets/hero-rooms.mp4"
import heroPoster from "@/assets/hero-rooms-poster.jpg"
import { VideoSoundToggle } from "@/components/shared/VideoSoundToggle"
import { cn } from "@/lib/utils"

interface LandingHeroVideoPanelProps {
  videoRef: RefObject<HTMLVideoElement | null>
  isSoundOn: boolean
  onToggleSound: () => void
  className?: string
}

export function LandingHeroVideoPanel({
  videoRef,
  isSoundOn,
  onToggleSound,
  className,
}: LandingHeroVideoPanelProps) {
  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-[1.75rem] border border-border/30 bg-muted shadow-[0_6px_32px_rgba(0,0,0,0.1)] sm:rounded-[2rem]",
        className,
      )}
    >
      <video
        ref={videoRef}
        aria-hidden
        className="size-full object-cover object-center"
        src={heroVideo}
        poster={heroPoster}
        autoPlay
        muted={!isSoundOn}
        loop
        playsInline
      />

      <div className="absolute left-5 top-5 z-10 sm:left-6 sm:top-6">
        <span className="inline-flex rounded-xl border border-border/40 bg-card px-3.5 py-2 text-[13px] font-semibold text-foreground shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          Explore guest houses near you
        </span>
      </div>

      <VideoSoundToggle
        isSoundOn={isSoundOn}
        onToggle={onToggleSound}
        className="absolute bottom-4 right-4 z-10 border-border/50 bg-card text-foreground shadow-sm sm:bottom-5 sm:right-5"
      />
    </div>
  )
}
