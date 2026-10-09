import { ArrowRight, type Icon } from "@phosphor-icons/react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLang, type Text } from "@/lib/i18n";
import { cn, external } from "@/lib/utils";

export const VIEW_ALL: Text = { en: "View All", kn: "ಎಲ್ಲಾ ನೋಡಿ" };
export const EASE = [0.22, 1, 0.36, 1] as const;
export const SPRING = { type: "spring", stiffness: 320, damping: 20 } as const;

const NUMBER = new Intl.NumberFormat("en-IN");

export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const target = Number(value.replace(/[^\d]/g, ""));
  const suffix = value.replace(/[\d,]/g, "");
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setN(target);
      return;
    }
    const controls = animate(0, target, { duration: 1.8, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, target]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {NUMBER.format(n)}
      {suffix}
    </span>
  );
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  icon: IconCmp,
  title,
  href,
  linkLabel = VIEW_ALL,
  className,
}: {
  icon: Icon;
  title: Text;
  href?: string;
  linkLabel?: Text;
  className?: string;
}) {
  const { t } = useLang();
  return (
    <div className={cn("mb-5 flex items-center justify-between gap-3", className)}>
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-navy md:text-xl">
        <motion.span
          initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.1 }}
          className="inline-flex"
        >
          <IconCmp weight="duotone" className="size-6 text-brand" />
        </motion.span>
        <span className="relative">
          {t(title)}
          <motion.span
            aria-hidden
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.6, ease: EASE }}
            className="absolute -bottom-1 left-0 h-0.5 w-8 origin-left rounded-full bg-brand-bright/70"
          />
        </span>
      </h2>
      {href && (
        <a
          href={href}
          {...external(href)}
          className="group -mr-2 flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[13px] font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
        >
          {t(linkLabel)}
          <ArrowRight weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
        </a>
      )}
    </div>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("mx-auto max-w-site px-5 pt-12 md:pt-16 lg:px-8", className)}>{children}</section>;
}
