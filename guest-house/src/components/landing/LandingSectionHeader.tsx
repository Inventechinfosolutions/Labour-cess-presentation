import { cn } from "@/lib/utils"

interface LandingSectionHeaderProps {
  kicker: string
  title: string
  description?: string
  align?: "left" | "center"
  className?: string
}

export function LandingSectionHeader({
  kicker,
  title,
  description,
  align = "left",
  className,
}: LandingSectionHeaderProps) {
  const centered = align === "center"

  return (
    <div
      className={cn(
        "max-w-3xl",
        centered && "mx-auto text-center",
        className,
      )}
    >
      <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium tracking-wide text-primary">
        {kicker}
      </span>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className={cn("mt-3 text-base leading-relaxed text-muted-foreground", centered && "mx-auto")}>
          {description}
        </p>
      ) : null}
    </div>
  )
}
