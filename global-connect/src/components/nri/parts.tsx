import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, Info } from "@phosphor-icons/react";
import { DottedWorld } from "@/components/horizon/parts";
import { EASE, rise } from "@/components/heritage/motion";
import { ScrollProgress } from "@/components/home/ScrollProgress";
import { SiteFooter } from "@/components/home/SiteFooter";
import { SiteHeader } from "@/components/home/SiteHeader";
import type { NriStamp } from "@/lib/nri";
import { cn } from "@/lib/utils";

export function NriShell({ reduce, children }: { reduce: boolean; children: ReactNode }) {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = window.setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "instant", block: "start" });
    }, 60);
    return () => window.clearTimeout(id);
  }, [hash]);

  return (
    <>
      {!reduce ? <ScrollProgress /> : null}
      <SiteHeader solid />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

export function Section({
  id,
  tone = "white",
  className,
  children,
}: {
  id?: string;
  tone?: "white" | "mist";
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 px-5 py-16 sm:py-20 lg:px-8",
        tone === "mist" ? "bg-(color:--gc-surface)" : "bg-white",
        className,
      )}
    >
      <div className="mx-auto max-w-[1240px]">{children}</div>
    </section>
  );
}

export type HeroChip = { label: string; to: string };

/** Light page hero: text on the left, a page illustration on the right. */
export function PageHero({
  eyebrow,
  title,
  sub,
  chips,
  art,
  reduce,
}: {
  eyebrow: string;
  title: ReactNode;
  sub: string;
  chips: HeroChip[];
  art: ReactNode;
  reduce: boolean;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-(color:--gc-surface) px-5 pt-28 pb-14 sm:pt-32 lg:px-8 lg:pb-20">
      <DottedWorld color="currentColor" className="pointer-events-none absolute top-16 right-[-6%] -z-10 w-[900px] max-w-none text-(color:--gc-primary) opacity-[0.14]" />
      <div aria-hidden className="pointer-events-none absolute -top-40 -left-40 -z-10 size-[520px] rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--gc-primary)_10%,transparent),transparent_70%)]" />
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <motion.p
            className="text-[12px] font-extrabold tracking-[0.24em] text-(color:--gc-primary-deep) uppercase"
            {...rise(reduce, 0)}
          >
            {eyebrow}
          </motion.p>
          <motion.h1
            className="mt-4 font-display text-[36px] leading-[1.08] font-bold tracking-[-0.03em] text-(color:--gc-ink) sm:text-[50px]"
            {...rise(reduce, 0.08)}
          >
            {title}
          </motion.h1>
          <motion.p className="mt-5 max-w-xl text-[16.5px] leading-relaxed text-(color:--gc-body)" {...rise(reduce, 0.16)}>
            {sub}
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-2.5" {...rise(reduce, 0.24)}>
            {chips.map((c, i) => (
              <Link
                key={c.to}
                to={c.to}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-semibold transition",
                  i === 0
                    ? "bg-(color:--gc-primary) text-white shadow-[0_10px_24px_-12px_var(--gc-primary)] hover:bg-(color:--gc-primary-deep)"
                    : "border border-(color:--gc-line) bg-white text-(color:--gc-ink) hover:border-(color:--gc-primary)",
                )}
              >
                {c.label}
                <ArrowRight weight="bold" className="size-3.5 transition group-hover:translate-x-0.5" />
              </Link>
            ))}
          </motion.div>
        </div>
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
        >
          {art}
        </motion.div>
      </div>
    </section>
  );
}

/** Soft banner that reminds the reader this is a concept preview. */
export function ConceptNote({ children, reduce }: { children: ReactNode; reduce: boolean }) {
  return (
    <div className="border-y border-(color:--gc-line) bg-white px-5 lg:px-8">
      <motion.div
        className="mx-auto flex max-w-[1240px] items-start gap-3 py-4 text-[14px] text-(color:--gc-body)"
        {...rise(reduce, 0, 0.8)}
      >
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-(color:--gc-primary-soft) text-(color:--gc-primary)">
          <Info weight="bold" className="size-4" />
        </span>
        <p className="leading-relaxed">{children}</p>
      </motion.div>
    </div>
  );
}

export function SampleTag({ label = "Sample", className }: { label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-dashed border-(color:--gc-gold-4) bg-[color-mix(in_srgb,var(--gc-gold)_18%,white)] px-2.5 py-0.5 text-[11px] font-bold tracking-[0.08em] text-(color:--gc-ink-2) uppercase",
        className,
      )}
    >
      {label}
    </span>
  );
}

/** Round icon stamp with a short label: the default building block of these pages. */
export function IconStamp({
  item,
  color,
  index,
  reduce,
  size = "md",
}: {
  item: NriStamp;
  color: string;
  index: number;
  reduce: boolean;
  size?: "md" | "lg";
}) {
  const Icon = item.icon;
  return (
    <motion.div className="flex flex-col items-center text-center" {...rise(reduce, 0.08 * index, 0.5)}>
      <span
        className={cn(
          "relative grid place-items-center rounded-full bg-white shadow-[0_14px_30px_-18px_rgba(10,30,70,0.45)]",
          size === "lg" ? "size-[84px]" : "size-[68px]",
        )}
        style={{ boxShadow: `inset 0 0 0 2px color-mix(in srgb, ${color} 30%, transparent), 0 14px 30px -18px rgba(10,30,70,.45)` }}
      >
        <span
          className={cn("grid place-items-center rounded-full text-white", size === "lg" ? "size-[60px]" : "size-[48px]")}
          style={{ background: color }}
        >
          <Icon weight="duotone" className={size === "lg" ? "size-7" : "size-6"} />
        </span>
      </span>
      <p className="mt-4 font-display text-[16px] leading-snug font-bold text-(color:--gc-ink)">{item.title}</p>
      <p className="mt-1.5 max-w-[220px] text-[13.5px] leading-relaxed text-(color:--gc-body)">{item.text}</p>
    </motion.div>
  );
}

/** Stamps joined by a line that draws in from left to right. */
export function StampFlow({
  items,
  palette,
  reduce,
  className,
}: {
  items: NriStamp[];
  palette: readonly string[];
  reduce: boolean;
  className?: string;
}) {
  const cols = { 3: "lg:grid-cols-3", 4: "lg:grid-cols-4", 5: "lg:grid-cols-5", 7: "lg:grid-cols-7" }[items.length] ?? "lg:grid-cols-4";
  return (
    <div className={cn("relative", className)}>
      <motion.div
        aria-hidden
        className="absolute top-[34px] right-[10%] left-[10%] hidden h-[2px] origin-left bg-[repeating-linear-gradient(90deg,var(--gc-line)_0_8px,transparent_8px_14px)] lg:block"
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.2, ease: EASE }}
      />
      <div className={cn("relative grid gap-10 sm:grid-cols-2", cols)}>
        {items.map((s, i) => (
          <IconStamp key={s.title} item={s} color={palette[i % palette.length]} index={i} reduce={reduce} />
        ))}
      </div>
    </div>
  );
}
