import type { Variants } from "framer-motion";

export const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const fadeUp = (delay = 0, distance = 40): Variants => ({
  hidden: { opacity: 0, y: distance },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOut, delay },
  },
});

export const slideLeft = (delay = 0): Variants => ({
  hidden: { opacity: 0, x: 48 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: easeOut, delay },
  },
});

export const slideRight = (delay = 0): Variants => ({
  hidden: { opacity: 0, x: -48 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.65, ease: easeOut, delay },
  },
});

export const staggerParent = (staggerChildren = 0.16, delayChildren = 0.04): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren, delayChildren },
  },
});
