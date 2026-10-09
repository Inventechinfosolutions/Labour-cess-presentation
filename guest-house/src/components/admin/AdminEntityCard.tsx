import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export interface AdminEntityCardMetric {
  label: string
  value: ReactNode
}

export interface AdminEntityCardMenuItem {
  label: string
  icon?: ReactNode
  onClick?: () => void
  href?: string
  destructive?: boolean
  separatorBefore?: boolean
}

interface AdminEntityCardProps {
  image: string
  imageAlt: string
  title: string
  subtitle?: string
  code?: string
  status?: string
  extraBadge?: ReactNode
  metrics?: AdminEntityCardMetric[]
  progress?: { label: string; value: number }
  href?: string
  footer?: ReactNode
  menuItems?: AdminEntityCardMenuItem[]
  className?: string
}

export function AdminEntityCard({
  image,
  imageAlt,
  title,
  subtitle,
  code,
  status,
  extraBadge,
  metrics = [],
  progress,
  href,
  footer,
  menuItems,
  className,
}: AdminEntityCardProps) {
  const body = (
    <>
      <div className="relative h-40 shrink-0 overflow-hidden sm:h-44">
        <img
          src={image}
          alt={imageAlt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/55 to-transparent" />

        <div className="absolute left-2.5 top-2.5 flex flex-wrap items-center gap-1.5">
          {status && (
            <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold capitalize text-foreground shadow-sm">
              {status.replace(/_/g, " ")}
            </span>
          )}
          {extraBadge}
        </div>

        {menuItems && menuItems.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-2 top-2 z-10 size-8 rounded-full bg-white/95 text-foreground shadow-sm hover:bg-white"
                aria-label="Actions"
              >
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl">
              {menuItems.map((item, i) => (
                <div key={i}>
                  {item.separatorBefore && <DropdownMenuSeparator />}
                  <DropdownMenuItem
                    className={cn("rounded-lg", item.destructive && "text-destructive")}
                    onClick={item.onClick}
                    asChild={!!item.href}
                  >
                    {item.href ? (
                      <Link to={item.href}>
                        {item.icon}
                        {item.label}
                      </Link>
                    ) : (
                      <>
                        {item.icon}
                        {item.label}
                      </>
                    )}
                  </DropdownMenuItem>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        {code && (
          <p className="font-mono text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {code}
          </p>
        )}
        <h3 className="mt-0.5 line-clamp-1 text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{subtitle}</p>
        )}

        {metrics.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-lg bg-muted/40 px-2.5 py-1.5">
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className="text-xs font-semibold tabular-nums text-foreground">{m.value}</p>
              </div>
            ))}
          </div>
        )}

        {progress && (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
              <span>{progress.label}</span>
              <span className="font-medium text-foreground">{progress.value}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.min(progress.value, 100)}%` }}
              />
            </div>
          </div>
        )}

        {footer && <div className="mt-3 border-t border-border/40 pt-3">{footer}</div>}
      </div>
    </>
  )

  const cardClass = cn(
    "group flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-airbnb)]",
    className
  )

  if (href) {
    return (
      <Link to={href} className={cardClass}>
        {body}
      </Link>
    )
  }

  return <article className={cardClass}>{body}</article>
}
