import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { EASE, rise } from "./motion";

export function HeritageTitle({
  children,
  sub,
  reduce,
  align = "center",
  className,
}: {
  children: ReactNode;
  sub?: ReactNode;
  reduce: boolean;
  align?: "center" | "left";
  className?: string;
}) {
  const left = align === "left";
  return (
    <div className={cn(left ? "text-left" : "mx-auto max-w-3xl text-center", className)}>
      <motion.h2
        className="font-display text-[30px] leading-[1.12] font-bold text-(color:--gc-ink) sm:text-[40px]"
        {...rise(reduce)}
      >
        {children}
      </motion.h2>
      <motion.span
        aria-hidden
        className={cn("mt-3 block h-[2px] w-14 bg-(color:--gc-gold-3)", left ? "origin-left" : "mx-auto")}
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, delay: 0.25, ease: EASE }}
      />
      {sub ? (
        <motion.p className="mt-3 text-[15.5px] leading-relaxed text-(color:--gc-body)" {...rise(reduce, 0.15)}>
          {sub}
        </motion.p>
      ) : null}
    </div>
  );
}

export function GoldCircleArrow({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full bg-(color:--gc-gold-3) text-(color:--gc-night) shadow-[0_6px_16px_rgba(0,0,0,0.25)] transition-transform group-hover:translate-x-1",
        className,
      )}
    >
      {children}
    </span>
  );
}
