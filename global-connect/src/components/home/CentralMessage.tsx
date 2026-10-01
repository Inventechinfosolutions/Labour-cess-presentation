import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import messageBg from "@/assets/message-bg.jpg";

const LINE_1 = "The world should not have to navigate Karnataka.".split(" ");
const LINE_2 = "Karnataka should make it easy for the world to connect with Karnataka.".split(" ");
const TOTAL = LINE_1.length + LINE_2.length;

function Word({ word, index, progress }: { word: string; index: number; progress: MotionValue<number> }) {
  const start = index / TOTAL;
  const end = Math.min(1, start + 1.6 / TOTAL);
  const opacity = useTransform(progress, [start, end], [0.12, 1]);
  const y = useTransform(progress, [start, end], [10, 0]);
  const blur = useTransform(progress, [start, end], ["blur(4px)", "blur(0px)"]);
  return (
    <motion.span className="mr-[0.25em] inline-block" style={{ opacity, y, filter: blur }}>
      {word}
    </motion.span>
  );
}

export function CentralMessage({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress: reveal } = useScroll({ target: ref, offset: ["start 80%", "center 45%"] });
  const { scrollYProgress: pass } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const dotsY = useTransform(pass, [0, 1], [-20, 30]);
  const glowScale = useTransform(pass, [0, 0.5, 1], [0.7, 1.15, 0.8]);
  const lineScale = useTransform(reveal, [0.75, 1], [0, 1]);
  const subOpacity = useTransform(reveal, [0.8, 1], [0, 1]);

  return (
    <section ref={ref} id="message" className="relative overflow-hidden bg-[#071a44] px-5 pt-20 pb-[150px] text-center text-white sm:pb-[190px] lg:px-8 lg:pt-24 lg:pb-[240px]">
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(63,180,255,0.24),transparent_60%),radial-gradient(ellipse_at_50%_120%,rgba(255,200,90,0.14),transparent_55%)]"
        style={reduce ? undefined : { scale: glowScale }}
      />
      <motion.img
        src={messageBg}
        alt=""
        className="pointer-events-none absolute inset-x-0 -top-[40px] h-[calc(100%+40px)] w-full object-cover object-[center_88%]"
        style={reduce ? undefined : { y: dotsY }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(7,26,68,0.8),transparent_65%)]" />

      <div className="relative mx-auto max-w-6xl">
        <p className="font-display text-[26px] leading-tight font-bold tracking-tight text-balance sm:text-[36px] lg:text-[42px]">
          {reduce ? LINE_1.join(" ") : LINE_1.map((w, i) => <Word key={i} word={w} index={i} progress={reveal} />)}
        </p>
        <p className="mt-3 font-display text-[22px] leading-tight font-semibold tracking-tight text-balance text-[#4fbfff] sm:text-[28px] lg:text-[32px]">
          {reduce
            ? LINE_2.join(" ")
            : LINE_2.map((w, i) => <Word key={i} word={w} index={LINE_1.length + i} progress={reveal} />)}
        </p>
        <div className="mx-auto mt-8 flex max-w-xl items-center gap-4">
          <motion.span
            className="h-px flex-1 origin-right bg-gradient-to-r from-transparent to-white/40"
            style={reduce ? undefined : { scaleX: lineScale }}
          />
          <motion.span className="text-[14.5px] text-white/80" style={reduce ? undefined : { opacity: subOpacity }}>
            One connected ecosystem. Multiple possibilities. One coordinated experience.
          </motion.span>
          <motion.span
            className="h-px flex-1 origin-left bg-gradient-to-l from-transparent to-white/40"
            style={reduce ? undefined : { scaleX: lineScale }}
          />
        </div>
      </div>
    </section>
  );
}
