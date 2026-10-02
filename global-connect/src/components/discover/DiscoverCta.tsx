import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import ctaBg from "@/assets/discover/cta.jpg";
import { GoldButton } from "@/components/connect/GoldButton";
import { EASE } from "@/components/connect/shared";
import { useT } from "@/theme/context";

export function DiscoverCta({ reduce }: { reduce: boolean }) {
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
    <section ref={ref} className="relative isolate overflow-hidden bg-[color:var(--gc-hero-3,#1a0f2e)] px-5 py-24 text-white lg:px-8 lg:py-32">
      <motion.img
        src={ctaBg}
        alt="Badami cave temples above Agastya lake at sunset"
        className="absolute inset-x-0 -top-[50px] h-[calc(100%+100px)] w-full object-cover object-[65%_center]"
        style={reduce ? undefined : { y: bgY }}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(var(--gc-ov,26,15,46),0.92)_0%,rgba(var(--gc-ov,26,15,46),0.66)_44%,rgba(var(--gc-ov,26,15,46),0.05)_82%)] max-md:bg-[rgba(var(--gc-ov,26,15,46),0.7)]" />

      <div className="relative mx-auto flex max-w-[1220px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <motion.h2 className="max-w-[640px] font-display text-[32px] leading-tight font-bold tracking-[-0.03em] sm:text-[44px]" {...enter(0)}>
            {t("The Right Opportunity Can Start")}{" "}
            <span className="bg-gradient-to-r from-(color:--gc-gold) to-[color:var(--gc-pink,var(--gc-pink,#ff9fb4))] bg-clip-text font-serif font-normal text-transparent italic">
              {t("the Right Connection")}
            </span>
          </motion.h2>
          <motion.p className="mt-4 max-w-[520px] text-[17px] text-white/85" {...enter(0.12)}>
            {t("Explore opportunities across Karnataka and take the next step toward investment, partnership, innovation and growth.")}
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" {...enter(0.24)}>
            <GoldButton href="#search">Explore Opportunities</GoldButton>
            <a
              href="#share"
              className="inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-[14.5px] font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              {t("Submit an Opportunity")}
            </a>
          </motion.div>
        </div>

        <motion.p
          className="hidden self-center pr-6 text-right font-script text-[42px] leading-[0.95] font-bold text-(color:--gc-gold) drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)] md:block"
          initial={reduce ? false : { opacity: 0, y: 16, rotate: -2 }}
          whileInView={{ opacity: 1, y: 0, rotate: -4 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
        >
          {t("Global Opportunities")}
          <br />
          {t("Local Impact")}
        </motion.p>
      </div>
    </section>
  );
}
