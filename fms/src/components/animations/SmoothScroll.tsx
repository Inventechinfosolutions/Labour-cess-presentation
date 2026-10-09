import { useEffect, type ReactNode } from 'react';

// Lightweight CSS-based smooth scroll wrapper — avoids overriding native wheel
// which would fight ScrollTrigger. Adds smooth behavior and resets on unmount.
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = prev;
    };
  }, []);
  return <>{children}</>;
}
