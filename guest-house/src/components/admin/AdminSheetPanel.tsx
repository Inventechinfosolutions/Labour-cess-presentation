import type { ComponentType, ReactNode, SVGProps } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

export const ADMIN_SHEET_SM = "sm:max-w-md"
export const ADMIN_SHEET_MD = "sm:max-w-lg"
export const ADMIN_SHEET_LG = "sm:max-w-xl lg:max-w-2xl"

export const adminFieldInputClass =
  "h-11 rounded-xl border-border/60 bg-background shadow-sm transition-shadow focus-visible:border-foreground/30 focus-visible:shadow-md focus-visible:ring-0"

export const adminFieldSelectClass =
  "h-11 w-full rounded-xl border-border/60 bg-background shadow-sm transition-shadow focus:border-foreground/30 focus:shadow-md focus:ring-0"

type AdminSheetContentProps = React.ComponentProps<typeof SheetContent> & {
  size?: "sm" | "md" | "lg"
}

export function AdminSheetContent({
  className,
  size = "md",
  side = "right",
  variant = "admin",
  ...props
}: AdminSheetContentProps) {
  const sizeClass =
    size === "sm" ? ADMIN_SHEET_SM : size === "lg" ? ADMIN_SHEET_LG : ADMIN_SHEET_MD

  return (
    <SheetContent
      side={side}
      variant={variant}
      className={cn(
        "flex h-full w-full max-w-full flex-col gap-0 overflow-hidden rounded-l-[1.25rem] border-0 p-0",
        sizeClass,
        className
      )}
      {...props}
    />
  )
}

interface AdminSheetShellProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
  headerAction?: ReactNode
}

export function AdminSheetShell({
  icon: Icon,
  title,
  description,
  children,
  footer,
  headerAction,
}: AdminSheetShellProps) {
  return (
    <div className="admin-sheet flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-border/60 px-6 pb-5 pt-7 pr-16">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
              <Icon className="size-5 text-foreground" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 pt-0.5">
              <SheetTitle className="text-[1.35rem] font-semibold tracking-tight">{title}</SheetTitle>
              <SheetDescription className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {description}
              </SheetDescription>
            </div>
          </div>
          {headerAction}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">{children}</div>

      {footer && (
        <div className="shrink-0 border-t border-border/60 bg-background px-6 py-4">
          {footer}
        </div>
      )}
    </div>
  )
}

export function AdminFormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/50 bg-muted/30 p-4">
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export function AdminSheetPreview({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/40 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
      {children}
    </div>
  )
}

export function AdminSheetSubmitButton({
  children,
  disabled,
  loading,
  onClick,
}: {
  children: ReactNode
  disabled?: boolean
  loading?: boolean
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className="h-12 w-full rounded-xl text-sm font-semibold"
    >
      {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
      {children}
    </Button>
  )
}
