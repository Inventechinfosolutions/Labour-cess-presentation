import { useEffect, useRef, type RefObject } from "react"
import { gsap, resetAnimatedElements } from "@/animations/gsap"

export function useGsapEffect(
  callback: () => void | (() => void),
  deps: unknown[] = []
) {
  const scopeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scopeRef.current) return
    const ctx = gsap.context(() => {
      callback()
    }, scopeRef)
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return scopeRef
}

export function usePageTransition() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "power2.out",
        onComplete: () => gsap.set(el, { clearProps: "opacity,transform" }),
      }
    )

    return () => {
      tween.kill()
      gsap.set(el, { opacity: 1, y: 0, clearProps: "opacity,transform" })
    }
  }, [])

  return ref
}

type ScopedAnimationFn = (selector: string, scope?: Element | null) => unknown

export function useRevealEffect(
  scopeRef: RefObject<HTMLElement | null>,
  selector: string,
  animationFn: ScopedAnimationFn,
  enabled: boolean
) {
  useEffect(() => {
    const scope = scopeRef.current
    if (!enabled || !scope) return

    const ctx = gsap.context(() => {
      animationFn(selector, scope)
    }, scope)

    return () => {
      ctx.revert()
      resetAnimatedElements(selector, scope)
    }
  }, [scopeRef, selector, animationFn, enabled])
}
