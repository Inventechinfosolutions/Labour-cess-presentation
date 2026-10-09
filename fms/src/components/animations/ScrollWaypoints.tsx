import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

export interface Waypoint {
  id: string;
  label: string;
}

/**
 * Fixed-position vertical waypoint nav. Highlights the active section as the
 * user scrolls and lets you click any dot to jump to that section.
 */
export function ScrollWaypoints({ waypoints }: { waypoints: Waypoint[] }) {
  const [active, setActive] = useState<string>(waypoints[0]?.id ?? '');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const triggers: ScrollTrigger[] = [];
    waypoints.forEach((w) => {
      const el = document.getElementById(w.id);
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => {
            if (self.isActive) setActive(w.id);
          },
        }),
      );
    });
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { x: 16, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out', delay: 0.6 },
      );
    }
    return () => triggers.forEach((t) => t.kill());
  }, [waypoints]);

  const jump = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      ref={ref}
      className="hidden xl:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col gap-3 items-end"
    >
      {waypoints.map((w) => {
        const isActive = active === w.id;
        return (
          <button
            key={w.id}
            onClick={() => jump(w.id)}
            className={cn('group flex items-center gap-2 transition-opacity', isActive ? 'opacity-100' : 'opacity-50 hover:opacity-90')}
          >
            <span
              className={cn(
                'text-[11px] uppercase tracking-[0.2em] font-medium transition-all',
                isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground',
              )}
            >
              {w.label}
            </span>
            <span
              className={cn(
                'h-[2px] transition-all duration-500 rounded-full',
                isActive ? 'w-10 bg-primary' : 'w-4 bg-muted-foreground/40 group-hover:w-6',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
