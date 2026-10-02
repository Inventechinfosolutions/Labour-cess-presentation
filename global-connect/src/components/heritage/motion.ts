import { useEffect, useState } from "react";

export const EASE = [0.22, 1, 0.36, 1] as const;

export function rise(reduce: boolean, delay = 0, amount = 0.4) {
  return {
    initial: reduce ? false : ({ opacity: 0, y: 22 } as const),
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount },
    transition: { duration: 0.7, delay, ease: EASE },
  };
}

/** Photo that settles from a gentle zoom as it scrolls into view. */
export function settle(reduce: boolean, delay = 0) {
  return {
    initial: reduce ? false : ({ scale: 1.18 } as const),
    whileInView: { scale: 1 },
    viewport: { once: true, amount: 0.3 },
    transition: { duration: 1.6, delay, ease: EASE },
  };
}

/** Index that steps through 0…count-1 on a timer; -1 when disabled. */
export function useCycle(count: number, ms: number, enabled: boolean) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => setI((v) => (v + 1) % count), ms);
    return () => window.clearInterval(id);
  }, [count, ms, enabled]);
  return enabled ? i : -1;
}
