import type { RefObject } from "react"
import loginVideo from "@/assets/login-background.mp4"
import loginPoster from "@/assets/login-background.png"
import { cn } from "@/lib/utils"

interface LoginBackdropProps {
  className?: string
  videoRef?: RefObject<HTMLVideoElement | null>
  isSoundOn?: boolean
}

export function LoginBackdrop({
  className,
  videoRef,
  isSoundOn = false,
}: LoginBackdropProps) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <video
        ref={videoRef}
        aria-hidden
        className="size-full object-cover object-center"
        src={loginVideo}
        poster={loginPoster}
        autoPlay
        muted={!isSoundOn}
        loop
        playsInline
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/35 to-foreground/20"
      />
    </div>
  )
}
