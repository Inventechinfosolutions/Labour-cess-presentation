import { type ReactNode } from "react"
import { cn } from "@/lib/utils"

export function LoginAuthCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative rounded-3xl border border-border/70 bg-card/95 p-7 shadow-2xl shadow-primary/10 ring-1 ring-foreground/[0.03] backdrop-blur-2xl dark:bg-card/85 sm:p-8",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-70 [background:radial-gradient(420px_circle_at_var(--spot-x,50%)_var(--spot-y,0%),color-mix(in_oklch,var(--primary)_10%,transparent),transparent_60%)]"
      />
      <div className="relative">{children}</div>
    </div>
  )
}
