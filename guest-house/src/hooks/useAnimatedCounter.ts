import { useEffect, useRef } from "react"
import { animateCounter } from "@/animations/gsap"

export function useAnimatedCounter(
  value: number,
  suffix = "",
  duration = 2
) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const tween = animateCounter(ref.current, value, duration, suffix)
    return () => {
      tween.kill()
    }
  }, [value, suffix, duration])

  return ref
}
