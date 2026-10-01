import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { HeroMap } from "@/components/home/HeroMap";

export function Hero({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const mapY = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const mapScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section ref={ref} className="relative isolate h-[100svh] min-h-[680px] max-h-[920px] overflow-hidden text-white">
      <motion.div className="absolute inset-0" style={reduce ? undefined : { y: mapY, scale: mapScale }}>
        <HeroMap reduce={reduce} />
      </motion.div>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(3,11,34,0.92)_0%,rgba(3,11,34,0.72)_30%,rgba(3,11,34,0.12)_58%,transparent_75%)] max-lg:bg-[linear-gradient(180deg,rgba(3,11,34,0.9)_0%,rgba(3,11,34,0.6)_42%,transparent_62%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#030b22]/80 to-transparent" />

      <motion.div
        className="relative mx-auto flex h-full max-w-[1320px] flex-col px-5 pt-[120px] lg:justify-center lg:px-8 lg:pt-0 lg:pb-16"
        style={reduce ? undefined : { y: textY, opacity: textOpacity }}
      >
        <motion.h1
          className="font-display text-[40px] leading-[1.05] font-bold tracking-[-0.035em] sm:text-[56px] lg:text-[68px]"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          Karnataka
          <br />
          <span className="inline-block bg-gradient-to-r from-[#3fb4ff] via-[#7fd3ff] to-[#ffd77a] bg-clip-text pr-2 font-serif text-[1.22em] leading-[0.95] font-normal tracking-[-0.01em] text-transparent italic">
            Connected
          </span>
          <br />
          to the World
        </motion.h1>
        <motion.p
          className="mt-5 max-w-[440px] text-[17px] leading-relaxed text-white/85 sm:text-[19px]"
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        >
          One gateway for global investment, talent, partnerships and opportunities.
        </motion.p>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <a
            href="#pathways"
            className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white py-3 pr-4 pl-6 text-[14.5px] font-semibold text-[#0b1f4a] shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition hover:bg-[#eaf5ff]"
          >
            Explore the Global Karnataka Ecosystem
            <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>
      </motion.div>

      {!reduce ? (
        <motion.a
          href="#pathways"
          aria-label="Scroll to pathways"
          className="absolute bottom-[96px] left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[11px] tracking-[0.2em] text-white/60 uppercase lg:flex"
          style={{ opacity: textOpacity }}
        >
          Scroll
          <span className="relative h-9 w-[22px] rounded-full border border-white/40">
            <motion.span
              className="absolute top-1.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-white"
              animate={{ y: [0, 14, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </motion.a>
      ) : null}

      <svg
        className="pointer-events-none absolute inset-x-0 -bottom-px h-[70px] w-full sm:h-[90px]"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path d="M0 40 C 360 95, 1080 95, 1440 40 L1440 90 L0 90 Z" fill="#ffffff" />
        <path d="M0 40 C 360 95, 1080 95, 1440 40" fill="none" stroke="#3fb4ff" strokeOpacity="0.45" strokeWidth="1.5" />
      </svg>
    </section>
  );
}
