import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

export function Parallax({
  children,
  speed = 0.4,
  className,
  scale,
}: {
  children: ReactNode;
  speed?: number; // -1..1 (positive = move down/slow, negative = move opposite)
  className?: string;
  scale?: { from: number; to: number };
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
      tl.fromTo(
        el,
        { yPercent: -speed * 50, scale: scale?.from ?? 1 },
        { yPercent: speed * 50, scale: scale?.to ?? 1, ease: 'none' },
      );
    }, el);
    return () => ctx.revert();
  }, [speed, scale]);

  return (
    <div ref={ref} className={cn('parallax-layer', className)}>
      {children}
    </div>
  );
}
