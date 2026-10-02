import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import ctaBg from "@/assets/invest/cta-bg.jpg";
import { useT } from "@/theme/context";
import { EASE } from "./shared";

export function FinalCta({ reduce }: { reduce: boolean }) {
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
    <section ref={ref} className="relative isolate overflow-hidden bg-[color:var(--gc-hero-3,#140c22)] px-5 py-24 text-white lg:px-8 lg:py-32">
      <motion.img
        src={ctaBg}
        alt="Hampi temple ruins at sunset"
        className="absolute inset-x-0 -top-[50px] h-[calc(100%+100px)] w-full object-cover object-[70%_center]"
        style={reduce ? undefined : { y: bgY }}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(var(--gc-ov,10,8,30),0.88)_0%,rgba(var(--gc-ov,10,8,30),0.6)_45%,rgba(var(--gc-ov,10,8,30),0.1)_80%)] max-md:bg-[rgba(var(--gc-ov,10,8,30),0.6)]" />

      <div className="relative mx-auto max-w-[1220px]">
        <motion.h2 className="font-display text-[34px] leading-tight font-bold tracking-[-0.03em] sm:text-[48px]" {...enter(0)}>
          {t("Ready to Explore")}{" "}
          <span className="bg-gradient-to-r from-(color:--gc-gold) to-(color:--gc-gold-4) bg-clip-text font-serif font-normal text-transparent italic">
            {t("Karnataka?")}
          </span>
        </motion.h2>
        <motion.p className="mt-4 max-w-[460px] text-[17px] text-white/85" {...enter(0.12)}>
          {t("Create your profile and begin your investment journey.")}
        </motion.p>
        <motion.div className="mt-8 flex flex-wrap gap-3" {...enter(0.24)}>
          <a
            href="#portal"
            className="group inline-flex items-center gap-3 rounded-full bg-white py-3 pr-4 pl-6 text-[14.5px] font-semibold text-(color:--gc-ink) shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition hover:bg-[#fff6e0]"
          >
            {t("Start Investment Journey")}
            <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </a>
          <a
            href="#opportunities"
            className="inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-[14.5px] font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            {t("Explore Opportunities")}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
