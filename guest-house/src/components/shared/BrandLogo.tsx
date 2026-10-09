import { cn } from "@/lib/utils"

type BrandLogoSize = "sm" | "md" | "lg" | "xl"

const MARK_SIZE: Record<BrandLogoSize, string> = {
  sm: "size-9",
  md: "size-10",
  lg: "size-12",
  xl: "size-14",
}

const ICON_SIZE: Record<BrandLogoSize, string> = {
  sm: "size-[54%]",
  md: "size-[56%]",
  lg: "size-[58%]",
  xl: "size-[60%]",
}

export function BrandMark({
  size = "md",
  className,
}: {
  size?: BrandLogoSize
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden bg-primary text-primary-foreground",
        "rounded-[22%] shadow-[var(--shadow-airbnb)] transition-transform duration-200 hover:scale-[1.02]",
        MARK_SIZE[size],
        className
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className={ICON_SIZE[size]} fill="currentColor">
        {/* Guest house — soft home, arched entry & bed (not a map pin) */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 4.1 5.9 9.35v8.55c0 .72.58 1.3 1.3 1.3h9.6c.72 0 1.3-.58 1.3-1.3V9.35L12 4.1zm0 7.05c-1.28 0-2.32 1.04-2.32 2.32V18h4.64v-4.63c0-1.28-1.04-2.32-2.32-2.32z"
        />
        <path
          d="M9.35 10.85h5.3a.65.65 0 0 1 .65.65v.55a.65.65 0 0 1-.65.65H9.35a.65.65 0 0 1-.65-.65v-.55a.65.65 0 0 1 .65-.65z"
          opacity="0.42"
        />
        <path
          d="M10.1 12.35h3.8a.5.5 0 0 1 .5.5v.4a.5.5 0 0 1-.5.5h-3.8a.5.5 0 0 1-.5-.5v-.4a.5.5 0 0 1 .5-.5z"
          opacity="0.42"
        />
      </svg>
    </div>
  )
}

interface BrandLogoProps {
  size?: BrandLogoSize
  title?: string
  subtitle?: string
  showText?: boolean
  className?: string
  markClassName?: string
  titleClassName?: string
  subtitleClassName?: string
}

export function BrandLogo({
  size = "md",
  title = "GovGuestHouse",
  subtitle = "Booking Platform",
  showText = true,
  className,
  markClassName,
  titleClassName,
  subtitleClassName,
}: BrandLogoProps) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <BrandMark size={size} className={markClassName} />
      {showText && (
        <div className="min-w-0 leading-none">
          <div
            className={cn(
              "truncate text-[15px] font-semibold tracking-tight text-foreground",
              titleClassName
            )}
          >
            {title}
          </div>
          {subtitle && (
            <div
              className={cn(
                "mt-1 truncate text-[11px] font-normal text-muted-foreground",
                subtitleClassName
              )}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
