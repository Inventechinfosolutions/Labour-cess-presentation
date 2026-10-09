import type { RefObject } from "react";
import {
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

/** Tuned for slow, “premium” depth — not snappy UI springs */
const parallaxSpring = { stiffness: 38, damping: 32, mass: 0.55 } as const;
const parallaxSpringSoft = { stiffness: 32, damping: 30, mass: 0.58 } as const;

export type AboutBlockParallax = {
  off: boolean;
  cardY: MotionValue<number>;
  textY: MotionValue<number>;
  cardScale: MotionValue<number>;
  textYMicro: MotionValue<number>;
  depth: MotionValue<number>;
};

/**
 * Per-row scroll-linked parallax: card and text drift at different rates;
 * a subtle scale breathes on the card as the block crosses the viewport.
 */
export function useAboutBlockParallax(
  blockRef: RefObject<HTMLElement | null>,
  options: { invert?: boolean } = {},
): AboutBlockParallax {
  const reduce = useReducedMotion();
  const off = reduce === true;
  const invert = options.invert === true;

  const { scrollYProgress } = useScroll({
    target: blockRef,
    offset: ["start 0.92", "end 0.08"],
  });

  // Vertical parallax: opposite directions for separation (invert swaps feel per side)
  const sign = invert ? -1 : 1;
  const cardYRaw = useTransform(scrollYProgress, [0, 0.5, 1], off ? [0, 0, 0] : [18 * sign, 0, -20 * sign]);
  const textYRaw = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    off ? [0, 0, 0] : [-12 * sign, 0, 16 * sign],
  );
  // Extra micro offset so typography feels “nearer” than the card
  const textYMicroRaw = useTransform(scrollYProgress, [0, 1], off ? [0, 0] : [6 * sign, -4 * sign]);

  const cardScaleRaw = useTransform(
    scrollYProgress,
    [0, 0.45, 0.55, 1],
    off ? [1, 1, 1, 1] : [0.985, 1, 1, 0.992],
  );
  // Normalized 0–1 for optional shadow/opacity on children
  const depthRaw = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0]);

  const cardY = useSpring(cardYRaw, parallaxSpring);
  const textY = useSpring(textYRaw, parallaxSpringSoft);
  const textYMicro = useSpring(textYMicroRaw, { ...parallaxSpring, stiffness: 44 });
  const cardScale = useSpring(cardScaleRaw, { ...parallaxSpring, stiffness: 36, damping: 34 });
  const depth = useSpring(depthRaw, { stiffness: 48, damping: 30, mass: 0.5 });

  return { off, cardY, textY, cardScale, textYMicro, depth };
}
