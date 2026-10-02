import type { ReactNode } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useT } from "@/theme/context";

/** Gold "join" call to action used across the pathway pages. */
export function GoldButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const t = useT();
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-(color:--gc-button-a) to-(color:--gc-button-b) py-3 pr-4 pl-6 text-[14.5px] font-semibold text-(color:--gc-ink) shadow-[0_10px_26px_rgba(240,180,41,0.35)] transition duration-300 hover:-translate-y-[3px] hover:shadow-[0_16px_38px_rgba(240,180,41,0.55)]",
        className,
      )}
    >
      {typeof children === "string" ? t(children) : children}
      <ArrowRight size={18} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
    </a>
  );
}
