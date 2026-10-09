import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

/**
 * Responsive line split + text mask reveal on scroll.
 * - Splits text into lines based on natural wrapping (using span-per-word and detecting yOffset)
 * - Each line is wrapped in a masking container
 * - Words slide up from below as the section enters the viewport
 * - Re-splits on resize (responsive)
 */
export function LineSplit({
  text,
  as: Tag = 'h2',
  className,
  trigger = 'scroll',
}: {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  className?: string;
  trigger?: 'scroll' | 'mount';
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const split = () => {
      // Reset
      el.innerHTML = '';
      const words = text.split(' ');

      // Pass 1: write words as spans, find their offsetTop to group into lines
      const wordSpans: HTMLSpanElement[] = words.map((w, i) => {
        const s = document.createElement('span');
        s.textContent = w + (i < words.length - 1 ? ' ' : '');
        s.style.display = 'inline-block';
        s.style.whiteSpace = 'pre';
        el.appendChild(s);
        return s;
      });

      const lines: HTMLSpanElement[][] = [];
      let curTop = -Infinity;
      wordSpans.forEach((s) => {
        const top = s.offsetTop;
        if (Math.abs(top - curTop) > 4) {
          lines.push([s]);
          curTop = top;
        } else {
          lines[lines.length - 1].push(s);
        }
      });

      // Pass 2: rebuild with line wrappers and inner movers
      el.innerHTML = '';
      const moverEls: HTMLSpanElement[] = [];
      lines.forEach((lineWords) => {
        const lineWrap = document.createElement('span');
        lineWrap.style.display = 'block';
        lineWrap.style.overflow = 'hidden';
        lineWrap.style.lineHeight = 'inherit';

        const mover = document.createElement('span');
        mover.style.display = 'inline-block';
        mover.style.willChange = 'transform';
        lineWords.forEach((w) => mover.appendChild(w.cloneNode(true)));
        lineWrap.appendChild(mover);
        el.appendChild(lineWrap);
        moverEls.push(mover);
      });

      gsap.set(moverEls, { yPercent: 110, opacity: 0 });

      const tween = gsap.to(moverEls, {
        yPercent: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        paused: true,
      });

      if (trigger === 'mount') {
        tween.play();
      } else {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => tween.play(),
        });
      }
    };

    split();

    const ro = new ResizeObserver(() => {
      // Recompute lines on resize for responsiveness
      split();
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
    };
  }, [text, trigger]);

  return <Tag ref={ref as never} className={cn(className)} />;
}
