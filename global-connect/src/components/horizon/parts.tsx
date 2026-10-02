import { useId, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowRight, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { WORLD_LAND_D } from "@/lib/worldPath";
import { cn } from "@/lib/utils";
import { rise } from "@/components/heritage/motion";

/** Land masses drawn as a field of small dots, inside a 1000 × 470 viewBox. */
export function DottedWorld({ color = "#c9d6ee", className }: { color?: string; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 1000 470" aria-hidden className={className}>
      <defs>
        <pattern id={`hz-dots-${id}`} width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="3.5" cy="3.5" r="1.6" fill={color} />
        </pattern>
      </defs>
      <path d={WORLD_LAND_D} fill={`url(#hz-dots-${id})`} />
    </svg>
  );
}

export function HorizonTitle({
  children,
  sub,
  aside,
  reduce,
}: {
  children: ReactNode;
  sub?: string;
  aside?: ReactNode;
  reduce: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <motion.h2 className="font-display text-[30px] leading-[1.12] font-bold text-(color:--gc-ink) sm:text-[36px]" {...rise(reduce)}>
          {children}
        </motion.h2>
        {sub ? (
          <motion.p className="mt-2 text-[15px] text-(color:--gc-body)" {...rise(reduce, 0.1)}>
            {sub}
          </motion.p>
        ) : null}
      </div>
      {aside ? <motion.div {...rise(reduce, 0.15)}>{aside}</motion.div> : null}
    </div>
  );
}

export function AsideNote({ lines }: { lines: string[] }) {
  return (
    <div className="border-l-2 border-(color:--gc-gold-3) pl-4 text-[13.5px] leading-relaxed text-(color:--gc-body)">
      {lines.map((l) => (
        <p key={l}>{l}</p>
      ))}
    </div>
  );
}

export function PrevNext({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  const btn =
    "grid size-10 place-items-center rounded-full border border-(color:--gc-line) bg-white text-(color:--gc-ink) shadow-sm transition hover:border-(color:--gc-primary) hover:text-(color:--gc-primary)";
  return (
    <div className="flex gap-2">
      <button type="button" aria-label="Previous" onClick={onPrev} className={btn}>
        <CaretLeft size={16} weight="bold" />
      </button>
      <button type="button" aria-label="Next" onClick={onNext} className={btn}>
        <CaretRight size={16} weight="bold" />
      </button>
    </div>
  );
}

export function SaffronButton({
  href,
  children,
  className,
  reduce,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  reduce: boolean;
}) {
  return (
    <a
      href={href}
      className={cn(
        "group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-(color:--gc-button-a) to-(color:--gc-button-b) px-6 py-3 text-[14.5px] font-semibold text-(color:--gc-night) shadow-[0_10px_24px_rgba(245,174,27,0.35)] transition hover:brightness-105",
        className,
      )}
    >
      {children}
      <ArrowRight size={15} weight="bold" className="transition-transform group-hover:translate-x-1" />
      {!reduce ? (
        <motion.span
          aria-hidden
          className="absolute inset-y-0 w-10 -skew-x-12 bg-white/45 blur-[2px]"
          initial={{ left: "-20%" }}
          animate={{ left: ["-20%", "120%"] }}
          transition={{ duration: 1.2, delay: 2, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
        />
      ) : null}
    </a>
  );
}

export function ArrowDot({ color, className }: { color: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full border-[1.5px] transition-transform duration-300 group-hover:translate-x-1",
        className,
      )}
      style={{ borderColor: color, color }}
    >
      <ArrowRight size={14} weight="bold" />
    </span>
  );
}
