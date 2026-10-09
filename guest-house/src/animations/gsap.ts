import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

export function heroReveal(selector: string | Element) {
  return gsap.from(selector, {
    y: 50,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: "power3.out",
  })
}

export function staggerCards(
  selector: string | Element,
  scope?: Element | null,
  delay = 0
) {
  const elements =
    typeof selector === "string"
      ? gsap.utils.toArray<Element>(selector, scope ?? undefined)
      : [selector]

  if (!elements.length) return

  return gsap.fromTo(
    elements,
    { y: 30, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out", delay }
  )
}

export function animateCounter(
  element: HTMLElement,
  endValue: number,
  duration = 2,
  suffix = ""
) {
  const obj = { value: 0 }
  return gsap.to(obj, {
    value: endValue,
    duration,
    ease: "power2.out",
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toLocaleString("en-IN") + suffix
    },
  })
}

export function pageTransition(container: Element) {
  return gsap.fromTo(
    container,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
  )
}

export function scrollReveal(selector: string, scope?: Element | null) {
  const elements = gsap.utils.toArray<Element>(selector, scope ?? undefined)

  return elements.map((el) =>
    gsap.from(el, {
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true,
      },
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out",
    }),
  )
}

export function bookingSuccessAnimation(_container: Element) {
  const tl = gsap.timeline()
  tl.from(".success-icon", { scale: 0, rotation: -180, duration: 0.6, ease: "back.out(1.7)" })
    .from(".success-text", { y: 20, opacity: 0, duration: 0.4, stagger: 0.1 }, "-=0.2")
    .from(".success-card", { y: 30, opacity: 0, duration: 0.5, stagger: 0.08 }, "-=0.1")
  return tl
}

export function dashboardWidgetAnimation(selector: string, scope?: Element | null) {
  const elements = gsap.utils.toArray<Element>(selector, scope ?? undefined)
  if (!elements.length) return

  return gsap.fromTo(
    elements,
    { y: 20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.5, stagger: 0.06, ease: "power2.out" }
  )
}

export function tableRowAnimation(selector: string, scope?: Element | null) {
  const elements = gsap.utils.toArray<Element>(selector, scope ?? undefined)
  if (!elements.length) return

  return gsap.fromTo(
    elements,
    { opacity: 0, y: 8 },
    { opacity: 1, y: 0, duration: 0.35, stagger: 0.03, ease: "power2.out" }
  )
}

export function chartReveal(selector: string, scope?: Element | null) {
  const elements = gsap.utils.toArray<Element>(selector, scope ?? undefined)
  if (!elements.length) return

  return gsap.fromTo(
    elements,
    { opacity: 0, scale: 0.96 },
    {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      stagger: 0.08,
      ease: "power2.out",
      onComplete: () => window.dispatchEvent(new Event("resize")),
    }
  )
}

export function slideInCards(selector: string, scope?: Element | null) {
  const elements = gsap.utils.toArray<Element>(selector, scope ?? undefined)
  if (!elements.length) return

  return gsap.fromTo(
    elements,
    { x: -30, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
  )
}

export function resetAnimatedElements(selector: string, scope?: Element | null) {
  gsap.utils.toArray<Element>(selector, scope ?? undefined).forEach((el) => {
    gsap.set(el, { opacity: 1, scale: 1, y: 0, clearProps: "opacity,transform" })
  })
}

export function modalAnimation(element: Element) {
  return gsap.fromTo(
    element,
    { opacity: 0, scale: 0.95, y: 10 },
    { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "back.out(1.4)" }
  )
}

export function cardHover(element: HTMLElement) {
  const onEnter = () =>
    gsap.to(element, { y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.12)", duration: 0.3 })
  const onLeave = () =>
    gsap.to(element, { y: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", duration: 0.3 })
  element.addEventListener("mouseenter", onEnter)
  element.addEventListener("mouseleave", onLeave)
  return () => {
    element.removeEventListener("mouseenter", onEnter)
    element.removeEventListener("mouseleave", onLeave)
  }
}
