export const EASE = [0.22, 1, 0.36, 1] as const;

export function rise(reduce: boolean, delay = 0, amount = 0.4) {
  return {
    initial: reduce ? false : ({ opacity: 0, y: 22 } as const),
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount },
    transition: { duration: 0.7, delay, ease: EASE },
  };
}
