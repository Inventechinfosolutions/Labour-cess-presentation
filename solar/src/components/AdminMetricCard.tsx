import { forwardRef, type ComponentType } from "react";
import type { LucideIcon } from "lucide-react";
import {
  dashboardKpiMetricTileIconClass,
  type DashboardKpiIconTone,
} from "@/lib/dashboard-kpi-icon";
import { cn } from "@/lib/utils";

/** Lucide icons or compatible SVG icon components */
export type AdminMetricIcon = LucideIcon | ComponentType<{ className?: string; "aria-hidden"?: boolean }>;

export type AdminMetricCardProps = {
  label: string;
  value: React.ReactNode;
  icon: AdminMetricIcon;
  /** Accent for the circular icon when not `active` — matches dashboard KPI colour language. */
  iconTone?: DashboardKpiIconTone;
  /** Secondary line under the value (inactive: primary tint; active: light on blue) */
  footer?: React.ReactNode;
  /** Small pill before footer text on the same row */
  footerBadge?: string;
  /** Highlighted / selected state — solid primary treatment */
  active?: boolean;
  className?: string;
  /** When provided, the card renders as a button (filter / toggle tiles) */
  onClick?: () => void;
  "aria-pressed"?: boolean;
};

export const AdminMetricCard = forwardRef<HTMLButtonElement | HTMLDivElement, AdminMetricCardProps>(
  function AdminMetricCard(
    {
      label,
      value,
      icon: Icon,
      footer,
      footerBadge,
      active = false,
      iconTone,
      className,
      onClick,
      "aria-pressed": ariaPressed,
    },
    ref,
  ) {
    const interactive = typeof onClick === "function";

    const shell = cn(
      "relative flex min-h-[7.25rem] w-full flex-col rounded-2xl border p-5 text-left shadow-sm transition-[transform,box-shadow,border-color,background] duration-200",
      active
        ? "border-transparent bg-gradient-to-br from-primary via-primary/92 to-chart-2 text-primary-foreground shadow-md ring-1 ring-primary/25"
        : "border-border/80 bg-card text-foreground shadow-black/[0.04]",
      interactive &&
        "cursor-pointer outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      !active && interactive && "hover:border-primary/25",
      className,
    );

    const footerRow =
      footer != null || footerBadge ? (
        <div
          className={cn(
            "mt-auto flex min-h-[2.25rem] flex-wrap items-center gap-2 pt-3 text-xs leading-snug",
            active ? "text-primary-foreground/95" : "text-primary",
          )}
        >
          {footerBadge ? (
            <span
              className={cn(
                "inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                active
                  ? "bg-primary-foreground/18 text-primary-foreground"
                  : "bg-primary/10 text-primary",
              )}
            >
              {footerBadge}
            </span>
          ) : null}
          {footer ? (
            <span className={cn(active ? "text-primary-foreground/90" : "text-primary/90")}>{footer}</span>
          ) : null}
        </div>
      ) : (
        <div className="mt-auto min-h-[2.25rem] pt-3" aria-hidden />
      );

    const body = (
      <>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "text-[0.625rem] font-semibold uppercase tracking-[0.12em]",
                active ? "text-primary-foreground/85" : "text-muted-foreground",
              )}
            >
              {label}
            </p>
            <p
              className={cn(
                "mt-1 text-[1.625rem] font-bold tabular-nums leading-tight tracking-tight sm:text-[1.75rem]",
                active ? "text-primary-foreground" : "text-foreground",
              )}
            >
              {value}
            </p>
          </div>
          <span
            className={
              active
                ? cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full",
                    "bg-primary-foreground/15 text-primary-foreground ring-1 ring-primary-foreground/25",
                  )
                : dashboardKpiMetricTileIconClass(iconTone ?? "indigo")
            }
          >
            <Icon aria-hidden />
          </span>
        </div>
        {footerRow}
      </>
    );

    if (interactive) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          onClick={onClick}
          aria-pressed={ariaPressed}
          className={shell}
        >
          {body}
        </button>
      );
    }

    return (
      <div ref={ref as React.Ref<HTMLDivElement>} className={shell}>
        {body}
      </div>
    );
  },
);
