import { useAnimatedCounter } from "@/hooks/useAnimatedCounter"

interface AnimatedCounterProps {
  value: number
  suffix?: string
  className?: string
  duration?: number
}

export function AnimatedCounter({
  value,
  suffix = "",
  className,
  duration = 2,
}: AnimatedCounterProps) {
  const ref = useAnimatedCounter(value, suffix, duration)
  return <span ref={ref} className={className}>0{suffix}</span>
}
