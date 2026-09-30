import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { CessIcon, IconWeight } from "@/lib/icons";
import karnatakaEmblem from "@/assets/karnataka-emblem.png";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type { CessIcon, IconWeight };

const easeOut = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  beat,
  at,
  children,
  className,
}: {
  beat: number;
  at: number;
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const on = beat >= at;
  return (
    <motion.div
      className={cn(!on && "pointer-events-none", className)}
      initial={false}
      animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: reduce ? 0 : 8 }}
      transition={{ duration: reduce ? 0 : 0.35, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

const TITLE_HIGHLIGHT = "text-[#1476e8]";

/** Last word of a scene title, in the Problem Statement blue. */
export function HighlightedTitle({
  text,
  highlightClassName = TITLE_HIGHLIGHT,
}: {
  text: string;
  highlightClassName?: string;
}) {
  const trimmed = text.trim();
  const splitAt = trimmed.lastIndexOf(" ");
  if (splitAt < 0) return <span className={highlightClassName}>{trimmed}</span>;
  return (
    <>
      {trimmed.slice(0, splitAt)} <span className={highlightClassName}>{trimmed.slice(splitAt + 1)}</span>
    </>
  );
}

export function Kicker({ children }: { children: ReactNode }) {
  return (
    <div className="text-[9px] font-bold tracking-[0.18em] text-[#0087bd] uppercase">{children}</div>
  );
}

export function SlideTitle({
  children,
  className,
  highlightClassName,
}: {
  children: ReactNode;
  className?: string;
  highlightClassName?: string;
}) {
  return (
    <h1
      className={cn(
        "mt-0.5 text-center font-display text-[46px] leading-[1.02] font-extrabold tracking-[-0.02em] text-navy uppercase",
        className,
      )}
    >
      {typeof children === "string" ? (
        <HighlightedTitle text={children} highlightClassName={highlightClassName} />
      ) : (
        children
      )}
    </h1>
  );
}

export function SceneHead({
  kicker,
  title,
  className,
  titleClassName,
}: {
  kicker: ReactNode;
  title: string;
  className?: string;
  titleClassName?: string;
}) {
  return (
    <header className={cn("text-center", className)}>
      <Kicker>{kicker}</Kicker>
      <SlideTitle className={titleClassName}>{title}</SlideTitle>
    </header>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("text-[10px] font-extrabold tracking-[0.14em] text-navy/55 uppercase", className)}>
      {children}
    </div>
  );
}

export function LiveBadge({ children }: { children: ReactNode }) {
  return (
    <Badge className="shrink-0 gap-1 border-teal-bright/30 bg-teal-bright/15 text-teal-bright">{children}</Badge>
  );
}

export function SiteCaption({
  kicker,
  title,
  note,
}: {
  kicker?: string;
  title: ReactNode;
  note?: ReactNode;
}) {
  return (
    <div className="absolute inset-x-2 bottom-2 rounded-lg bg-navy-deep/90 p-2.5 text-white shadow-lg">
      {kicker ? (
        <div className="text-[10px] font-bold tracking-[0.14em] text-teal-bright uppercase">{kicker}</div>
      ) : null}
      <b className="mt-0.5 block text-[13px] leading-tight">{title}</b>
      {note ? <div className="text-[11px] text-white/70">{note}</div> : null}
    </div>
  );
}

export function NavyPanel({
  kicker,
  title,
  children,
  className,
  mark = true,
}: {
  kicker?: string;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  mark?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-2xl bg-linear-to-b from-navy to-navy-mid text-white shadow-[0_16px_40px_rgba(7,20,51,0.22)]",
        className,
      )}
    >
      {title || kicker ? (
        <div className="flex items-center gap-2 px-4 pt-4 pb-2">
          {mark ? <KaMark className="size-7 text-[9px]" /> : null}
          <div className="min-w-0">
            {kicker ? (
              <div className="text-[9px] font-bold tracking-[0.16em] text-teal-bright uppercase">{kicker}</div>
            ) : null}
            {title ? <div className="font-display text-[13px] font-bold leading-tight">{title}</div> : null}
          </div>
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-auto px-4 pb-4">{children}</div>
    </div>
  );
}

export function Tile({
  active,
  children,
  className,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const cls = cn(
    "rounded-xl border px-3 py-2 text-left text-xs transition",
    active ? "border-primary bg-accent ring-1 ring-primary/20" : "border-border bg-card",
    className,
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {children}
      </button>
    );
  }
  return <div className={cls}>{children}</div>;
}

export function FlowArrow() {
  return <span className="text-primary">→</span>;
}

export function Hold({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={className} style={style} onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
      {children}
    </div>
  );
}

export function Stagger({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn("min-h-0", className)}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : delay / 1000, duration: 0.4, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}

/** Icon chip with a light entrance — prefer icons over long sentences. */
export function IconChip({
  Icon,
  label,
  delay = 0,
  tone = "navy",
  className,
}: {
  Icon: CessIcon;
  label: string;
  delay?: number;
  tone?: "navy" | "risk" | "ok" | "teal";
  className?: string;
}) {
  const reduce = useReducedMotion();
  const tones = {
    navy: "border-border bg-card text-navy",
    risk: "border-risk/20 bg-risk-soft text-risk-ink",
    ok: "border-ok/25 bg-ok-soft text-ok-ink",
    teal: "border-primary/25 bg-accent/60 text-navy",
  } as const;
  return (
    <motion.span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-bold shadow-sm",
        tones[tone],
        className,
      )}
      initial={reduce ? false : { opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: reduce ? 0 : delay / 1000, duration: 0.35, ease: easeOut }}
    >
      <Icon weight="fill" className="size-3.5 shrink-0 text-primary" />
      {label}
    </motion.span>
  );
}

export function KaMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-[0_0_0_1px_rgba(240,193,74,0.45)]",
        className,
      )}
    >
      <img
        src={karnatakaEmblem}
        alt="Government of Karnataka"
        className="h-full w-full bg-white object-contain p-[6%]"
        draggable={false}
      />
    </span>
  );
}

export function AppFrame({
  kicker,
  badge,
  children,
  className,
}: {
  kicker: string;
  badge?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "stagger-in flex h-full flex-col overflow-hidden rounded-2xl border border-teal/30 bg-card shadow-[0_16px_40px_rgba(14,154,167,0.14)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 bg-navy-deep px-3 py-2 text-white">
        <KaMark className="size-7 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="font-display truncate text-[12px] font-bold leading-tight">
            Karnataka Building And Other Construction Workers Welfare Board
          </div>
          <div className="truncate text-[9px] font-bold tracking-[0.12em] text-teal-bright uppercase">
            Government of Karnataka{kicker ? ` · ${kicker}` : ""}
          </div>
        </div>
        {badge}
      </div>
      {children}
    </div>
  );
}

export function DeviceFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Hold className={cn("flex h-full w-full flex-col rounded-[28px] bg-navy-deep p-3 text-white shadow-xl", className)}>
      <div className="min-h-0 flex-1 rounded-2xl bg-navy p-3">{children}</div>
    </Hold>
  );
}

export function Workspace({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col bg-linear-to-b from-mist to-background", className)}>{children}</div>
  );
}

export function PipelineBar({
  label,
  note,
  tone = "ok",
  steps,
}: {
  label: string;
  note: string;
  tone?: "ok" | "risk";
  steps: { label: string; Icon: CessIcon }[];
}) {
  const risk = tone === "risk";

  return (
    <Hold className="grid grid-cols-[148px_1fr] items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2 shadow-sm">
      <Stagger delay={0}>
        <div
          className={cn(
            "flex h-full flex-col justify-center rounded-xl px-3 py-2",
            risk ? "bg-risk-soft text-risk-ink" : "bg-secondary text-navy",
          )}
        >
          <span className="text-[10px] font-extrabold tracking-[0.16em] uppercase">{label}</span>
          <span className="mt-0.5 text-[11px] leading-snug font-semibold">{note}</span>
        </div>
      </Stagger>

      <div className="relative flex min-w-0 items-start">
        <div
          className={cn(
            "pointer-events-none absolute top-[18px] right-[7%] left-[7%] h-0.5",
            risk ? "border-t-2 border-dashed border-risk/40 bg-transparent" : "bg-linear-to-r from-primary/20 via-primary to-primary/20",
          )}
        />

        {steps.map((step, i) => (
          <Stagger key={step.label} delay={120 + i * 110} className="relative z-10 flex min-w-0 flex-1 flex-col items-center gap-1">
            <span
              className={cn(
                "grid size-9 place-items-center rounded-full shadow-sm ring-2",
                risk ? "bg-card text-risk ring-risk/25" : "bg-navy text-teal-bright ring-primary/25",
              )}
            >
              <step.Icon weight={risk ? "bold" : "duotone"} className="size-4" />
            </span>
            <span className="flex max-w-[7.5rem] items-baseline justify-center gap-1 text-center text-[10px] leading-tight font-extrabold tracking-wide text-navy uppercase">
              <span className={cn("font-mono text-[9px]", risk ? "text-risk" : "text-primary")}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {step.label}
            </span>
          </Stagger>
        ))}
      </div>
    </Hold>
  );
}
