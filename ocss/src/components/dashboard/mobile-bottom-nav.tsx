import {
  ClipboardList,
  CreditCard,
  Home,
  MapPin,
} from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "overview", label: "Dashboard", icon: Home, target: "section-overview" },
  { id: "claims", label: "Claims", icon: ClipboardList, target: "section-claims" },
  { id: "map", label: "Map", icon: MapPin, target: "section-map" },
  { id: "payments", label: "Payments", icon: CreditCard, target: "section-payments" },
] as const

export function MobileBottomNav() {
  const [active, setActive] = useState<string>("overview")

  useEffect(() => {
    const targets = tabs
      .map((tab) => document.getElementById(tab.target))
      .filter((el): el is HTMLElement => Boolean(el))

    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible?.target.id) return
        const match = tabs.find((t) => t.target === visible.target.id)
        if (match) setActive(match.id)
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.15, 0.35, 0.55] },
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  function goTo(target: string, id: string) {
    setActive(id)
    const el = document.getElementById(target)
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <nav
      aria-label="Mobile primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-white/95 backdrop-blur-xl lg:hidden dark:bg-[color-mix(in_srgb,var(--card)_92%,transparent)]"
      style={{ paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))" }}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-1 pt-1.5 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = active === tab.id
          return (
            <li key={tab.id} className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => goTo(tab.target, tab.id)}
                className={cn(
                  "flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className="size-[22px]"
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
                <span
                  className={cn(
                    "truncate text-[10px] leading-tight",
                    isActive ? "font-semibold" : "font-medium",
                  )}
                >
                  {tab.label}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
