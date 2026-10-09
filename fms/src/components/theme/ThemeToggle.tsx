import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const sunRef = useRef<HTMLSpanElement>(null);
  const moonRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!sunRef.current || !moonRef.current) return;
    const isDark = theme === 'dark';
    gsap.to(sunRef.current, {
      opacity: isDark ? 0 : 1,
      rotate: isDark ? -90 : 0,
      scale: isDark ? 0.5 : 1,
      duration: 0.4,
      ease: 'power3.out',
    });
    gsap.to(moonRef.current, {
      opacity: isDark ? 1 : 0,
      rotate: isDark ? 0 : 90,
      scale: isDark ? 1 : 0.5,
      duration: 0.4,
      ease: 'power3.out',
    });
  }, [theme]);

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent transition-colors',
        className,
      )}
    >
      <span ref={sunRef} className="absolute inset-0 flex items-center justify-center">
        <Sun className="h-4 w-4" />
      </span>
      <span ref={moonRef} className="absolute inset-0 flex items-center justify-center opacity-0">
        <Moon className="h-4 w-4" />
      </span>
    </button>
  );
}
