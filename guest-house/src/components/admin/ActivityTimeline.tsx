import { useEffect, useRef } from "react"
import {
  CalendarCheck,
  CreditCard,
  DoorOpen,
  KeyRound,
  UserPlus,
} from "lucide-react"
import { gsap } from "@/animations/gsap"
import type { ActivityItem } from "@/types/admin"
import { formatDistanceToNow, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

const ICONS = {
  booking: CalendarCheck,
  user: UserPlus,
  payment: CreditCard,
  checkin: KeyRound,
  release: DoorOpen,
}

interface ActivityTimelineProps {
  activities: ActivityItem[]
  className?: string
  compact?: boolean
}

export function ActivityTimeline({ activities, className, compact = false }: ActivityTimelineProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || compact) return
    const ctx = gsap.context(() => {
      gsap.from(".timeline-item", {
        x: -20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: "power2.out",
      })
    }, ref)
    return () => ctx.revert()
  }, [activities, compact])

  if (compact) {
    return (
      <div ref={ref} className={cn("divide-y divide-border/40", className)}>
        {activities.map((item) => {
          const Icon = ICONS[item.type]
          return (
            <div key={item.id} className="flex gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="size-3.5 text-foreground/70" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium">{item.title}</p>
                <p className="line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div ref={ref} className={cn("space-y-0", className)}>
      {activities.map((item, i) => {
        const Icon = ICONS[item.type]
        return (
          <div key={item.id} className="timeline-item relative flex gap-4 pb-6 last:pb-0">
            {i < activities.length - 1 && (
              <div className="absolute left-[19px] top-10 h-[calc(100%-1rem)] w-px bg-border" />
            )}
            <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
              <Icon className="size-4 text-foreground/70" />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDistanceToNow(parseISO(item.timestamp), { addSuffix: true })}
                {item.actor && ` · ${item.actor}`}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
