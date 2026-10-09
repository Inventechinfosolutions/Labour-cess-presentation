import type { RefObject } from "react";
import {
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/** Softer, slower springs — calmer, “scrolling a premium marketing page” feel */
const spring = { stiffness: 48, damping: 28, mass: 0.5 } as const;
const springSoft = { stiffness: 40, damping: 28, mass: 0.52 } as const;

export type BandParallaxMotion = {
  /** Disable all motion-driven transforms */
  off: boolean;
  /** Renewable photo layer */
  imgY: MotionValue<number>;
  imgScale: MotionValue<number>;
  /** Colour wash stack (moves opposite to photo) */
  washY: MotionValue<number>;
  /** Radial / mesh decorative layer */
  orbsY: MotionValue<number>;
  /** Primary copy / heading column (subtle) */
  leadY: MotionValue<number>;
  /** Cards, lists, or secondary column (counter motion) */
  trailY: MotionValue<number>;
};

/**
 * Scroll-linked parallax for a band: pass the same ref you attach to `<section>`.
 * Progress runs while the section crosses the viewport (`start end` → `end start`).
 */
export function useBandParallaxMotion(sectionRef: RefObject<HTMLElement | null>): BandParallaxMotion {
  const reduce = useReducedMotion();
  const off = reduce === true;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const imgYRaw = useTransform(scrollYProgress, [0, 1], off ? [0, 0] : [64, -64]);
  const imgScaleRaw = useTransform(scrollYProgress, [0, 1], off ? [1, 1] : [1.09, 1]);
  const washRaw = useTransform(scrollYProgress, [0, 1], off ? [0, 0] : [-48, 48]);
  const orbsRaw = useTransform(scrollYProgress, [0, 1], off ? [0, 0] : [36, -36]);
  const leadRaw = useTransform(scrollYProgress, [0, 1], off ? [0, 0] : [-22, 22]);
  const trailRaw = useTransform(scrollYProgress, [0, 1], off ? [0, 0] : [34, -34]);

  const imgY = useSpring(imgYRaw, spring);
  const imgScale = useSpring(imgScaleRaw, springSoft);
  const washY = useSpring(washRaw, spring);
  const orbsY = useSpring(orbsRaw, { ...spring, stiffness: 70 });
  const leadY = useSpring(leadRaw, { ...spring, stiffness: 58, damping: 26 });
  const trailY = useSpring(trailRaw, { ...spring, stiffness: 54, damping: 24 });

  return { off, imgY, imgScale, washY, orbsY, leadY, trailY };
}
