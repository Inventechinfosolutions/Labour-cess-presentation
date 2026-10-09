import { forwardRef, type RefObject } from "react"
import heroVideo from "@/assets/hero-animation.mp4"
import heroPoster from "@/assets/hero-background.png"
import { cn } from "@/lib/utils"

interface HeroParallaxImageProps {
  className?: string
  videoRef: RefObject<HTMLVideoElement | null>
  isSoundOn: boolean
}

export const HeroParallaxImage = forwardRef<HTMLDivElement, HeroParallaxImageProps>(
  function HeroParallaxImage({ className, videoRef, isSoundOn }, ref) {
    return (
      <div
        ref={ref}
        className={cn("absolute inset-0 overflow-hidden", className)}
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
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/35 to-foreground/20" />
      </div>
    )
  },
)
