import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function KPICard({
  title,
  value,
  hint,
  icon,
  tone = 'brand',
  onClick,
  delay = 0,
  featured = false,
}: {
  title: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  tone?: 'brand' | 'green' | 'orange' | 'red' | 'purple' | 'teal';
  onClick?: () => void;
  delay?: number;
  /** Same navy hero card as Budgets / list primary KPI — use for the first dashboard metric */
  featured?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const n = numRef.current;

    gsap.fromTo(
      el,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', delay },
    );

    if (n && typeof value === 'number') {
      const obj = { v: 0 };
      gsap.to(obj, {
        v: value,
        duration: 1,
        ease: 'power2.out',
        delay: delay + 0.1,
        onUpdate: () => {
          n.textContent = Math.round(obj.v).toLocaleString('en-IN');
        },
      });
    }
  }, [value, delay]);

  // Tones derived from design tokens — no hardcoded shades.
  const tones: Record<string, string> = {
    brand:  'status-info-bg status-info-border',
    green:  'status-success-bg status-success-border',
    orange: 'status-warn-bg status-warn-border',
    red:    'status-danger-bg status-danger-border',
    purple: 'status-purple-bg status-purple-border',
    teal:   'status-paid-bg status-paid-border',
  };

  if (featured) {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'creator-stat-card relative cursor-pointer overflow-hidden rounded-xl border-0 bg-primary p-6 text-primary-foreground shadow-lg shadow-primary/30 ring-1 ring-primary-foreground/10 transition-transform hover:-translate-y-0.5 hover:brightness-[1.02] hover:shadow-xl',
          !onClick && 'cursor-default',
        )}
      >
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary-foreground/10" aria-hidden />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/75">{title}</div>
            <div className="kpi-stat-value mt-3 text-[2rem] leading-none text-primary-foreground sm:text-[2.35rem]">
              {typeof value === 'number' ? <span ref={numRef}>0</span> : value}
            </div>
            {hint && <div className="mt-2 text-xs text-primary-foreground/70">{hint}</div>}
          </div>
          {icon && (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-foreground/18 ring-1 ring-primary-foreground/25 [&_svg]:text-primary-foreground">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        'relative rounded-2xl border p-5 cursor-pointer overflow-hidden transition-transform hover:-translate-y-0.5 hover:shadow-md',
        tones[tone],
        !onClick && 'cursor-default',
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{title}</div>
          <div className="mt-2 text-3xl font-semibold text-foreground">
            {typeof value === 'number' ? <span ref={numRef}>0</span> : value}
          </div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        {icon && (
          <div className="h-10 w-10 rounded-xl bg-card/80 backdrop-blur flex items-center justify-center shadow-sm">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
