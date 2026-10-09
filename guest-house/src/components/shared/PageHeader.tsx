import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  className?: string
  variant?: "default" | "admin"
  meta?: ReactNode
}

export function PageHeader({
  title,
  description,
  action,
  className,
  variant = "default",
  meta,
}: PageHeaderProps) {
  const isAdmin = variant === "admin"

  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        isAdmin ? "mb-6" : "mb-8 sm:mb-10 sm:items-start",
        className
      )}
    >
      <div className={cn("min-w-0", !isAdmin && "max-w-2xl")}>
        {meta && isAdmin && (
          <div className="mb-2">{meta}</div>
        )}
        <h1
          className={cn(
            "font-semibold tracking-tight text-foreground",
            isAdmin
              ? "text-[1.625rem] leading-tight sm:text-[1.75rem]"
              : "text-[1.75rem] sm:text-[2rem]"
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "text-muted-foreground",
              isAdmin ? "mt-1 text-sm leading-normal" : "mt-2 text-base leading-relaxed"
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <div
          className={cn(
            "flex shrink-0 flex-wrap items-center gap-2",
            isAdmin && "sm:ml-4"
          )}
        >
          {action}
        </div>
      )}
    </div>
  )
}
