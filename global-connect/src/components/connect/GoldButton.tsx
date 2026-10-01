import type { ReactNode } from "react";
import { ArrowRight } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/** Gold "join" call to action used across the Kannadigas page. */
export function GoldButton({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#f7d064] to-[#f0b429] py-3 pr-4 pl-6 text-[14.5px] font-semibold text-[#0b1f4a] shadow-[0_10px_26px_rgba(240,180,41,0.35)] transition duration-300 hover:-translate-y-[3px] hover:shadow-[0_16px_38px_rgba(240,180,41,0.55)]",
        className,
      )}
    >
      {children}
      <ArrowRight size={18} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
    </a>
  );
}
