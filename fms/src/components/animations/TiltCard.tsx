import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

export function TiltCard({
  children,
  className,
  intensity = 12,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const set = gsap.quickTo(el, '--rx' as never, { duration: 0.5, ease: 'power3.out' });
    const setY = gsap.quickTo(el, '--ry' as never, { duration: 0.5, ease: 'power3.out' });

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(el, {
        rotateY: x * intensity,
        rotateX: -y * intensity,
        transformPerspective: 900,
        duration: 0.4,
        ease: 'power3.out',
      });
      // shine
      const inner = el.querySelector<HTMLElement>('.tilt-shine');
      if (inner) {
        inner.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, color-mix(in oklch, var(--primary-foreground) 40%, transparent), transparent 50%)`;
      }
      void set; void setY;
    };

    const onLeave = () => {
      gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'power3.out' });
      const inner = el.querySelector<HTMLElement>('.tilt-shine');
      if (inner) inner.style.background = '';
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [intensity]);

  return (
    <div ref={ref} className={cn('tilt-card relative', className)}>
      <div className="tilt-inner relative h-full w-full">{children}</div>
      <div className="tilt-shine pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay" />
    </div>
  );
}
