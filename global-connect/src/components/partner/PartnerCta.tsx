import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import ctaBg from "@/assets/partner/cta.jpg";
import { GoldButton } from "@/components/connect/GoldButton";
import { EASE } from "@/components/connect/shared";
import { useT } from "@/theme/context";

export function PartnerCta({ reduce }: { reduce: boolean }) {
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
    <section ref={ref} className="relative isolate overflow-hidden bg-[color:var(--gc-hero-3,#07052a)] px-5 py-24 text-white lg:px-8 lg:py-32">
      <motion.img
        src={ctaBg}
        alt="Bengaluru skyline at dusk with business partners on a rooftop"
        className="absolute inset-x-0 -top-[50px] h-[calc(100%+100px)] w-full object-cover object-[70%_center]"
        style={reduce ? undefined : { y: bgY }}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(var(--gc-ov,7,5,42),0.92)_0%,rgba(var(--gc-ov,7,5,42),0.65)_42%,rgba(var(--gc-ov,7,5,42),0.05)_80%)] max-md:bg-[rgba(var(--gc-ov,7,5,42),0.7)]" />
      <motion.div
        aria-hidden
        className="absolute top-1/2 left-[18%] size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(138,63,214,0.35),transparent_65%)]"
        animate={reduce ? undefined : { opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative mx-auto max-w-[1220px]">
        <motion.h2 className="max-w-[640px] font-display text-[34px] leading-tight font-bold tracking-[-0.03em] sm:text-[48px]" {...enter(0)}>
          {t("Let's Build")}{" "}
          <span className="bg-gradient-to-r from-(color:--gc-gold) to-(color:--gc-gold-4) bg-clip-text font-serif font-normal text-transparent italic">
            {t("Something Together")}
          </span>
        </motion.h2>
        <motion.p className="mt-4 max-w-[520px] text-[17px] text-white/85" {...enter(0.12)}>
          {t("Karnataka is open to ideas, expertise, institutions and organisations from around the world.")}
        </motion.p>
        <motion.div className="mt-8 flex flex-wrap gap-3" {...enter(0.24)}>
          <GoldButton href="#build">Start a Partnership</GoldButton>
          <a
            href="#ecosystem"
            className="inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-[14.5px] font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            {t("Explore Karnataka's Ecosystem")}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
