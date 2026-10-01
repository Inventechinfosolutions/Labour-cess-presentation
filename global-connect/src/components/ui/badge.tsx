import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-primary",
        navy: "border-transparent bg-navy text-white",
        ok: "border-transparent bg-ok-soft text-ok-ink",
        wait: "border-transparent bg-gold-soft text-gold-ink",
        warn: "border-transparent bg-gold-soft text-gold-ink",
        bad: "border-transparent bg-risk-soft text-risk-ink",
        idle: "border-transparent bg-muted text-muted-foreground",
        hot: "border-transparent bg-risk-soft text-risk-ink",
        cool: "border-transparent bg-accent text-accent-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
