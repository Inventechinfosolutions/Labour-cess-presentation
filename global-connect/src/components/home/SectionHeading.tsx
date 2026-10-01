import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export function SectionHeading({
  eyebrow,
  title,
  sub,
  reduce,
  dark = false,
  align = "center",
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  reduce: boolean;
  dark?: boolean;
  align?: "center" | "left";
}) {
  const view = { once: true, amount: 0.6 } as const;
  const left = align === "left";

  return (
    <div className={cn(left ? "max-w-2xl text-left" : "mx-auto max-w-3xl text-center")}>
      <motion.p
        className={cn("text-[12px] font-extrabold uppercase", dark ? "text-[#7cc8ff]" : "text-[#1f5fbf]")}
        initial={reduce ? false : { opacity: 0, letterSpacing: "0.6em" }}
        whileInView={{ opacity: 1, letterSpacing: "0.24em" }}
        viewport={view}
        transition={{ duration: 0.9, ease: EASE }}
        style={reduce ? { letterSpacing: "0.24em" } : undefined}
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        className={cn(
          "mt-3 overflow-hidden pb-1 font-display text-[28px] leading-tight font-bold tracking-[-0.03em] sm:text-[38px]",
          dark ? "text-white" : "text-[#0b1f4a]",
        )}
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.span
          className="block"
          variants={{ hidden: { y: "110%" }, show: { y: "0%" } }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        >
          {title}
        </motion.span>
      </motion.h2>
      <motion.span
        aria-hidden
        className={cn(
          "mt-4 block h-[3px] w-16 rounded-full bg-gradient-to-r from-[#3fb4ff] to-[#ffcf6b]",
          left ? "origin-left" : "mx-auto origin-center",
        )}
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={view}
        transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
      />
      {sub ? (
        <motion.p
          className={cn("mt-3 text-[15.5px]", dark ? "text-white/75" : "text-[#4a5a78]")}
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={view}
          transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
        >
          {sub}
        </motion.p>
      ) : null}
    </div>
  );
}
