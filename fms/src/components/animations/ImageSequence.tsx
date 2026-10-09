import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Scrubbed image sequence — flips through image frames as the user scrolls.
// Pins the stage so the user has time to see each frame.
export function ImageSequence({ frames, captions }: { frames: string[]; captions?: string[] }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stageRef.current) return;
    const stage = stageRef.current;
    const imgs = Array.from(stage.querySelectorAll<HTMLImageElement>('img'));
    if (imgs.length === 0) return;

    // Make first image visible, others hidden
    imgs.forEach((im, i) => {
      im.classList.toggle('is-active', i === 0);
    });

    const obj = { progress: 0 };

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: stage.parentElement!,
          start: 'top top',
          end: () => `+=${frames.length * 60}%`,
          pin: true,
          scrub: 0.4,
          anticipatePin: 1,
        },
        onUpdate: () => {
          const idx = Math.min(frames.length - 1, Math.floor(obj.progress * frames.length));
          imgs.forEach((im, i) => im.classList.toggle('is-active', i === idx));
          if (captionRef.current && captions) {
            captionRef.current.textContent = captions[idx] ?? '';
          }
        },
      });
    }, stage);
    return () => ctx.revert();
  }, [frames, captions]);

  return (
    <div className="relative">
      <div ref={stageRef} className="seq-stage rounded-3xl overflow-hidden border border-border bg-card aspect-video">
        {frames.map((src, i) => (
          <img key={src + i} src={src} alt="" className={i === 0 ? 'is-active' : ''} loading="eager" />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
        {captions && (
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="text-xs uppercase tracking-[0.25em] opacity-80">Scroll</div>
            <div ref={captionRef} className="text-2xl md:text-4xl font-semibold mt-2">
              {captions[0]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
