import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BookingFlowHeaderProps {
  breadcrumbs: BreadcrumbItem[]
  title: string
  description?: string
  backHref: string
  className?: string
}

export function BookingFlowHeader({
  breadcrumbs,
  title,
  description,
  backHref,
  className,
}: BookingFlowHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <Link
        to={backHref}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors hover:underline"
      >
        <ChevronLeft className="size-4" />
        Back
      </Link>

      <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {breadcrumbs.map((item, index) => (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
            {index > 0 && <ChevronRight className="size-3.5 shrink-0 opacity-60" />}
            {item.href ? (
              <Link to={item.href} className="transition-colors hover:text-foreground hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </span>
        ))}
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{description}</p>
      )}
    </div>
  )
}
