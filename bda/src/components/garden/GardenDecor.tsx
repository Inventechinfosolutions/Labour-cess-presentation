import { motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/utils";

// Background vectors for Design 9. Every piece is aria-hidden, ignores the pointer and sits
// at -z-10, so the page wrapper must be `isolate` for them to paint behind the content.

const LAYER = "pointer-events-none absolute -z-10";
const fade = (delay = 0, opacity = 1) => ({
  initial: { opacity: 0 },
  whileInView: { opacity },
  viewport: { once: true },
  transition: { delay, duration: 1.4, ease: "easeOut" as const },
});
const draw = (delay = 0) => ({
  initial: { pathLength: 0, opacity: 0 },
  whileInView: { pathLength: 1, opacity: 1 },
  viewport: { once: true },
  transition: { delay, duration: 2.2, ease: "easeInOut" as const },
});

type Stop = [offset: number, color: string, opacity?: number];

function Gradient({ id, stops, x2 = 1, y2 = 0 }: { id: string; stops: Stop[]; x2?: number; y2?: number }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
      {stops.map(([o, c, a = 1]) => (
        <stop key={o} offset={o} stopColor={c} stopOpacity={a} />
      ))}
    </linearGradient>
  );
}

/** Flowing pastel ribbons behind the hero. */
export function HeroRibbons() {
  const id = useId();
  return (
    <svg viewBox="0 0 1440 640" preserveAspectRatio="none" className={cn(LAYER, "inset-0 size-full")} aria-hidden>
      <defs>
        <Gradient id={`${id}a`} stops={[[0, "#ffffff", 0.95], [0.55, "#ede9fe", 0.6], [1, "#ede9fe", 0]]} />
        <Gradient id={`${id}b`} stops={[[0, "#fed7aa", 0.7], [0.35, "#fbcfe8", 0.6], [0.7, "#ddd6fe", 0.55], [1, "#bae6fd", 0.6]]} />
        <Gradient id={`${id}c`} x2={0} y2={1} stops={[[0, "#bfdbfe", 0.75], [1, "#bfdbfe", 0]]} />
        <Gradient id={`${id}d`} stops={[[0, "#bbf7d0", 0], [0.5, "#99f6e4", 0.45], [1, "#a5f3fc", 0.2]]} />
      </defs>
      <motion.path {...fade(0.1)} d="M0 110 C 220 40 440 14 660 0 L 820 0 C 560 60 300 150 0 290 Z" fill={`url(#${id}a)`} />
      <motion.path {...fade(0.3)} d="M1440 0 L1440 330 C 1330 250 1250 130 1230 0 Z" fill={`url(#${id}c)`} />
      <motion.path {...fade(0.5)} d="M0 520 C 260 450 560 470 820 560 C 1020 630 1240 590 1440 500 L1440 560 C 1240 660 1000 690 790 640 C 560 586 280 560 0 600 Z" fill={`url(#${id}b)`} />
      <motion.path {...fade(0.7)} d="M0 600 C 300 560 620 600 900 640 L 0 640 Z" fill={`url(#${id}d)`} />
      <motion.path {...draw(0.4)} d="M0 300 C 300 160 560 60 830 0" fill="none" stroke="#ffffff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <motion.path {...draw(0.8)} d="M0 512 C 270 440 570 462 830 552 C 1030 622 1250 584 1440 492" fill="none" stroke="#ffffff" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      <motion.path {...draw(1)} d="M1440 340 C 1320 256 1240 130 1218 0" fill="none" stroke="#ffffff" strokeOpacity="0.9" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

const LEAF_TONES = {
  teal: ["#99f6e4", "#0f766e"],
  mint: ["#d9f99d", "#16a34a"],
  sky: ["#bae6fd", "#0369a1"],
};

/** Large translucent leaf with a white midrib. */
export function SoftLeaf({ className, tone = "teal", opacity = 0.45, delay = 0 }: { className?: string; tone?: keyof typeof LEAF_TONES; opacity?: number; delay?: number }) {
  const id = useId();
  const reduce = useReducedMotion();
  const [from, to] = LEAF_TONES[tone];
  return (
    <motion.svg
      viewBox="0 0 80 160"
      className={cn("pointer-events-none absolute", className)}
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity, scale: 1, rotate: reduce ? 0 : [0, 3, -2, 0] }}
      viewport={{ once: true }}
      transition={{ opacity: { delay, duration: 1 }, scale: { delay, duration: 1 }, rotate: { duration: 9, repeat: Infinity, ease: "easeInOut", delay } }}
      aria-hidden
    >
      <defs>
        <Gradient id={id} x2={1} y2={1} stops={[[0, from], [1, to]]} />
      </defs>
      <path d="M40 2 C 78 44 78 116 40 158 C 2 116 2 44 40 2 Z" fill={`url(#${id})`} />
      <path d="M40 12 V152 M40 50 L22 34 M40 74 L58 58 M40 98 L22 82 M40 122 L58 106" stroke="white" strokeOpacity="0.7" strokeWidth="1.6" fill="none" />
    </motion.svg>
  );
}

/** Pale outlined leaves, drawn in, like the faint sketches behind the title. */
export function OutlineLeaves({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={cn(LAYER, className)} fill="none" stroke="#ffffff" strokeWidth="2" aria-hidden>
      <motion.path {...draw(0.3)} d="M30 190 C 20 120 60 50 150 20 C 150 100 110 160 30 190 Z" />
      <motion.path {...draw(0.6)} d="M30 190 C 70 140 100 90 150 20" />
      <motion.path {...draw(0.8)} d="M10 120 C 0 80 20 40 70 20 C 74 60 50 100 10 120 Z" strokeOpacity="0.8" />
    </svg>
  );
}

/** Ghost circles offset behind the hero photo. */
export function GhostRings({ className }: { className?: string }) {
  return (
    <span className={cn("pointer-events-none absolute", className)} aria-hidden>
      <motion.span {...fade(0.5)} className="absolute inset-0 rounded-full border-2 border-white bg-white/30 shadow-[0_20px_60px_-30px_rgba(11,44,107,0.35)]" />
      <motion.span {...fade(0.8)} className="absolute inset-[7%] rounded-full border border-brand/15" />
    </span>
  );
}

/** Golden fern branch for the page edge. */
export function Fern({ className }: { className?: string }) {
  const id = useId();
  const reduce = useReducedMotion();
  const leaves = Array.from({ length: 8 }, (_, i) => {
    const y = 236 - i * 28;
    const x = 58 + Math.sin(i / 2.2) * 6;
    const s = 1 - i * 0.07;
    return { y, x, s };
  });
  return (
    <motion.svg
      viewBox="0 0 120 260"
      className={cn("pointer-events-none absolute origin-bottom", className)}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 0.85, rotate: reduce ? 0 : [0, 2.5, -1.5, 0] }}
      viewport={{ once: true }}
      transition={{ opacity: { duration: 1 }, rotate: { duration: 8, repeat: Infinity, ease: "easeInOut" } }}
      aria-hidden
    >
      <defs>
        <Gradient id={id} x2={1} y2={1} stops={[[0, "#fde68a"], [0.5, "#fbbf24"], [1, "#f97316"]]} />
      </defs>
      <motion.path {...draw(0.2)} d="M58 258 C 52 180 70 90 64 8" stroke="#f59e0b" strokeWidth="2.5" fill="none" />
      {leaves.map(({ x, y, s }, i) => (
        <motion.g
          key={y}
          initial={{ opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 + i * 0.08, duration: 0.6 }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        >
          <path transform={`translate(${x} ${y}) rotate(-35) scale(${s})`} d="M0 0 C 12 -10 34 -10 46 0 C 34 10 12 10 0 0 Z" fill={`url(#${id})`} />
          <path transform={`translate(${x} ${y - 12}) rotate(-145) scale(${s})`} d="M0 0 C 12 -10 34 -10 46 0 C 34 10 12 10 0 0 Z" fill={`url(#${id})`} />
        </motion.g>
      ))}
    </motion.svg>
  );
}

/** Teal crescent that curls in from the page edge. */
export function EdgeCurl({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 120 300" className={cn(LAYER, className)} aria-hidden>
      <defs>
        <Gradient id={id} x2={0} y2={1} stops={[[0, "#99f6e4", 0.2], [0.6, "#2dd4bf", 0.75], [1, "#0f766e", 0.9]]} />
      </defs>
      <motion.path {...fade(0.2)} d="M120 0 C 30 70 20 220 120 300 C 70 220 76 80 120 0 Z" fill={`url(#${id})`} />
      <motion.path {...draw(0.5)} d="M110 10 C 46 80 40 210 112 290" stroke="#ffffff" strokeOpacity="0.8" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

/** Wide pastel wave band, used behind a row of cards. */
export function WaveBand({ className, tones = ["#ddd6fe", "#fbcfe8", "#fed7aa"] }: { className?: string; tones?: [string, string, string] }) {
  const id = useId();
  return (
    <svg viewBox="0 0 1440 300" preserveAspectRatio="none" className={cn(LAYER, "inset-x-0 w-full", className)} aria-hidden>
      <defs>
        <Gradient id={id} stops={[[0, tones[0], 0.55], [0.5, tones[1], 0.45], [1, tones[2], 0.55]]} />
      </defs>
      <motion.path {...fade(0.2)} d="M0 120 C 240 40 520 60 760 130 C 1000 200 1220 170 1440 90 L1440 230 C 1220 300 980 300 740 240 C 500 180 240 190 0 260 Z" fill={`url(#${id})`} />
      <motion.path {...draw(0.4)} d="M0 112 C 240 32 520 52 760 122 C 1000 192 1220 162 1440 82" stroke="#ffffff" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Soft rolling hills behind the last sections, leading into the footer landscape. */
export function SoftHills({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 1440 260" preserveAspectRatio="none" className={cn(LAYER, "inset-x-0 bottom-0 w-full", className)} aria-hidden>
      <defs>
        <Gradient id={`${id}a`} x2={0} y2={1} stops={[[0, "#a5f3fc", 0.55], [1, "#a5f3fc", 0]]} />
        <Gradient id={`${id}b`} x2={0} y2={1} stops={[[0, "#bfdbfe", 0.6], [1, "#bfdbfe", 0]]} />
        <Gradient id={`${id}c`} x2={0} y2={1} stops={[[0, "#bbf7d0", 0.5], [1, "#bbf7d0", 0]]} />
      </defs>
      <motion.path {...fade(0.1)} d="M0 120 C 160 60 320 70 460 140 C 560 190 640 200 760 190 L760 260 L0 260 Z" fill={`url(#${id}a)`} />
      <motion.path {...fade(0.3)} d="M0 180 C 200 120 380 150 540 200 C 640 230 720 236 820 230 L820 260 L0 260 Z" fill={`url(#${id}b)`} />
      <motion.path {...fade(0.5)} d="M840 260 C 1000 170 1200 150 1440 190 L1440 260 Z" fill={`url(#${id}c)`} />
    </svg>
  );
}

export function DotGrid({ className, cols = 3, rows = 3 }: { className?: string; cols?: number; rows?: number }) {
  return (
    <span className={cn("pointer-events-none absolute grid gap-1.5", className)} style={{ gridTemplateColumns: `repeat(${cols}, 4px)` }} aria-hidden>
      {Array.from({ length: cols * rows }, (_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.04 }}
          className="size-1 rounded-full bg-navy/25"
        />
      ))}
    </span>
  );
}
