import gsap from "gsap";
import {
  BatteryCharging,
  CloudSun,
  Fan,
  Leaf,
  PlugZap,
  SolarPanel,
  Sparkles,
  Sun,
  Sunrise,
  ThermometerSun,
  Wind,
  Zap,
  type LucideProps,
} from "lucide-react";
import { useLayoutEffect, useRef, type ComponentType } from "react";
import { cn } from "@/lib/utils";

type IconType = ComponentType<LucideProps>;

type Doodle = {
  Icon: IconType;
  top: number;
  left: number;
  size: string;
  rotate: number;
  drift: number;
  duration: number;
  delay: number;
  stroke?: number;
};

/** Primary-tinted strokes to match the sign-in CTA. */
const TINTS = [
  "text-primary/50",
  "text-primary/45",
  "text-primary/55",
  "text-primary/40",
  "text-primary/50",
  "text-primary/48",
  "text-primary/52",
  "text-primary/46",
  "text-primary/50",
  "text-primary/44",
] as const;

/**
 * Solar + wind themed doodles — biased toward the hero (left) so the form column stays calmer.
 */
const DOODLES: Doodle[] = [
  /* Sun kept away from top-left brand (logo also uses Sun) — mid band toward form column. */
  { Icon: Sun, top: 48, left: 58, size: "size-11", rotate: -5, drift: 9, duration: 5.6, delay: 0.2, stroke: 2.1 },
  { Icon: SolarPanel, top: 12, left: 32, size: "size-10", rotate: 4, drift: 7, duration: 5.2, delay: 0.5, stroke: 2.0 },
  { Icon: Wind, top: 18, left: 18, size: "size-9", rotate: -8, drift: 8, duration: 4.8, delay: 0.3, stroke: 2.2 },
  { Icon: Fan, top: 22, left: 48, size: "size-9", rotate: 10, drift: 6, duration: 5.0, delay: 0.6, stroke: 2.0 },
  { Icon: Sparkles, top: 30, left: 6, size: "size-7", rotate: 12, drift: 5, duration: 4.2, delay: 0.15, stroke: 2.3 },
  { Icon: CloudSun, top: 36, left: 28, size: "size-10", rotate: -4, drift: 9, duration: 6.0, delay: 0.4, stroke: 2.0 },
  { Icon: Zap, top: 42, left: 40, size: "size-8", rotate: 16, drift: 6, duration: 4.0, delay: 0.7, stroke: 2.4 },
  { Icon: ThermometerSun, top: 50, left: 14, size: "size-9", rotate: -7, drift: 7, duration: 5.4, delay: 0.25, stroke: 2.0 },
  { Icon: Wind, top: 58, left: 55, size: "size-11", rotate: 6, drift: 10, duration: 5.8, delay: 0.45, stroke: 2.0 },
  { Icon: Sunrise, top: 62, left: 34, size: "size-8", rotate: -14, drift: 8, duration: 5.2, delay: 0.55, stroke: 2.1 },
  { Icon: PlugZap, top: 68, left: 8, size: "size-9", rotate: -3, drift: 7, duration: 4.6, delay: 0.35, stroke: 2.1 },
  { Icon: BatteryCharging, top: 74, left: 46, size: "size-10", rotate: 5, drift: 8, duration: 5.4, delay: 0.5, stroke: 2.0 },
  { Icon: Leaf, top: 80, left: 22, size: "size-8", rotate: -12, drift: 7, duration: 5.0, delay: 0.6, stroke: 2.2 },
  { Icon: SolarPanel, top: 84, left: 62, size: "size-9", rotate: 8, drift: 6, duration: 4.8, delay: 0.2, stroke: 2.0 },
];

/**
 * Decorative floating solar / wind icons — matches harvest canvas mood; pointer-events none.
 */
export function FloatingSolarWindIcons({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-doodle]"));
    if (!nodes.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(nodes, { autoAlpha: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      nodes.forEach((node) => {
        const baseRot = Number(node.dataset.rotate ?? 0);
        gsap.set(node, { rotation: baseRot, autoAlpha: 1, scale: 1, y: 0 });
      });

      nodes.forEach((node) => {
        const drift = Number(node.dataset.drift ?? 8);
        const duration = Number(node.dataset.duration ?? 5);
        const delay = Number(node.dataset.delay ?? 0);
        const baseRot = Number(node.dataset.rotate ?? 0);
        gsap.to(node, {
          y: `-=${drift}`,
          rotation: baseRot + 4,
          duration,
          delay,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 z-[2] overflow-hidden", className)}
    >
      {DOODLES.map((d, i) => {
        const { Icon, top, left, size, drift, duration, delay, rotate, stroke } = d;
        const color = TINTS[i % TINTS.length];
        return (
          <span
            key={`doodle-${i}`}
            data-doodle
            data-drift={drift}
            data-duration={duration}
            data-delay={delay}
            data-rotate={rotate}
            className="absolute will-change-transform"
            style={{ top: `${top}%`, left: `${left}%` }}
          >
            <Icon className={cn(size, color)} strokeWidth={stroke ?? 2.1} />
          </span>
        );
      })}
    </div>
  );
}
