import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import ctaBg from "@/assets/connect/cta.jpg";
import { useT } from "@/theme/context";
import { GoldButton } from "./GoldButton";
import { EASE } from "./shared";

const ARCS = ["M560 -10 Q 900 20 1150 190", "M720 430 Q 900 220 1150 190", "M1460 30 Q 1300 40 1150 190", "M1460 400 Q 1300 260 1150 190"];

export function ConnectCta({ reduce }: { reduce: boolean }) {
  const t = useT();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  const enter = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 20 } as const),
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.5 },
    transition: { duration: 0.6, delay, ease: EASE },
  });

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-[color:var(--gc-hero-3,#0b1430)] px-5 py-24 text-white lg:px-8 lg:py-32">
      <motion.img
        src={ctaBg}
        alt="Western Ghats and a waterfall in Karnataka at sunset"
        className="absolute inset-x-0 -top-[50px] h-[calc(100%+100px)] w-full object-cover object-[65%_center]"
        style={reduce ? undefined : { y: bgY }}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(var(--gc-ov,6,21,54),0.92)_0%,rgba(var(--gc-ov,6,21,54),0.65)_45%,rgba(var(--gc-ov,6,21,54),0.15)_85%)] max-md:bg-[rgba(var(--gc-ov,6,21,54),0.65)]" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1440 420" preserveAspectRatio="none" aria-hidden>
        {ARCS.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            fill="none"
            stroke="#ffd77a"
            strokeOpacity={0.3}
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.4, delay: 0.2 + i * 0.15, ease: "easeInOut" }}
          />
        ))}
      </svg>

      <div className="relative mx-auto max-w-[1220px]">
        <motion.h2 className="font-display text-[34px] leading-tight font-bold tracking-[-0.03em] sm:text-[48px]" {...enter(0)}>
          {t("Stay Connected With")}{" "}
          <span className="bg-gradient-to-r from-(color:--gc-gold) to-(color:--gc-gold-4) bg-clip-text font-serif font-normal text-transparent italic">
            {t("Karnataka")}
          </span>
        </motion.h2>
        <motion.p className="mt-4 max-w-[480px] text-[17px] text-white/85" {...enter(0.12)}>
          {t("Join a global network of people, ideas, expertise and opportunities.")}
        </motion.p>
        <motion.div className="mt-8 flex flex-wrap gap-3" {...enter(0.24)}>
          <GoldButton href="#join">Join the Global Kannadiga Network</GoldButton>
          <a
            href="#opportunities"
            className="inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-[14.5px] font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            {t("Explore Karnataka Opportunities")}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
