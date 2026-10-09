import { useEffect, useRef, useState } from "react"

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

export function useCountUp(
  target: number,
  duration = 1100,
  enabled = true,
): number {
  const [value, setValue] = useState(0)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      setValue(target)
      return
    }

    const start = performance.now()
    const from = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const next = from + (target - from) * easeOutCubic(progress)
      setValue(next)
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick)
      }
    }

    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [target, duration, enabled])

  return value
}
