import { useCallback, useEffect, useRef, useState } from "react"

export function useVideoSound() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isSoundOn, setIsSoundOn] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.play().catch(() => {})
  }, [])

  const toggleSound = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    setIsSoundOn((prev) => {
      const next = !prev
      video.muted = !next
      if (next) {
        video.volume = 1
        void video.play()
      }
      return next
    })
  }, [])

  return { videoRef, isSoundOn, toggleSound }
}
