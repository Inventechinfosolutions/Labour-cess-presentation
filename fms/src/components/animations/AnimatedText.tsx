import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'div';
  className?: string;
  delay?: number;
  splitBy?: 'word' | 'char';
  trigger?: 'mount' | 'scroll';
  stagger?: number;
};

export function AnimatedText({
  text,
  as: Tag = 'h2',
  className,
  delay = 0,
  splitBy = 'word',
  trigger = 'mount',
  stagger = 0.06,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const targets = el.querySelectorAll<HTMLElement>('.split-char');
    const ctx = gsap.context(() => {
      const animation = gsap.fromTo(
        targets,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          stagger,
          delay,
        },
      );
      if (trigger === 'scroll') {
        animation.pause();
        ScrollTrigger.create({
          trigger: el,
          start: 'top 85%',
          once: true,
          onEnter: () => animation.play(),
        });
      }
    }, el);
    return () => ctx.revert();
  }, [text, delay, stagger, trigger]);

  const tokens =
    splitBy === 'word'
      ? text.split(' ').map((w, i) => (
          <span key={i} className="split-word">
            <span className="split-char inline-block whitespace-pre">
              {w}
              {i < text.split(' ').length - 1 ? ' ' : ''}
            </span>
          </span>
        ))
      : text.split('').map((c, i) => (
          <span key={i} className="split-word">
            <span className="split-char inline-block whitespace-pre">{c === ' ' ? ' ' : c}</span>
          </span>
        ));

  return (
    <Tag ref={ref as never} className={cn('inline-block', className)}>
      {tokens}
    </Tag>
  );
}
