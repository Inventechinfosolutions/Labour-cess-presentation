import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import ctaBg from "@/assets/talent/cta.jpg";
import { GoldButton } from "@/components/connect/GoldButton";
import { EASE } from "@/components/connect/shared";
import { useT } from "@/theme/context";

export function TalentCta({ reduce }: { reduce: boolean }) {
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
        alt="Hampi's boulders and temple ruins at sunset"
        className="absolute inset-x-0 -top-[50px] h-[calc(100%+100px)] w-full object-cover object-[70%_center]"
        style={reduce ? undefined : { y: bgY }}
        loading="lazy"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(var(--gc-ov,6,21,54),0.94)_0%,rgba(var(--gc-ov,6,21,54),0.7)_42%,rgba(var(--gc-ov,6,21,54),0.1)_80%)] max-md:bg-[rgba(var(--gc-ov,6,21,54),0.68)]" />

      <div className="relative mx-auto flex max-w-[1220px] flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div>
          <motion.h2 className="font-display text-[34px] leading-tight font-bold tracking-[-0.03em] sm:text-[48px]" {...enter(0)}>
            {t("Your Skills Can")}{" "}
            <span className="bg-gradient-to-r from-(color:--gc-gold) to-(color:--gc-gold-4) bg-clip-text font-serif font-normal text-transparent italic">
              {t("Travel the World")}
            </span>
          </motion.h2>
          <motion.p className="mt-4 max-w-[500px] text-[17px] text-white/85" {...enter(0.12)}>
            {t("Discover opportunities, connect with global organisations and build your next chapter from Karnataka.")}
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" {...enter(0.24)}>
            <GoldButton href="#profile">Create Your Talent Profile</GoldButton>
            <a
              href="#where"
              className="inline-flex items-center rounded-full border border-white/50 px-6 py-3 text-[14.5px] font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              {t("Explore Global Opportunities")}
            </a>
          </motion.div>
        </div>

        <motion.div
          className="relative hidden self-center pr-6 md:block"
          initial={reduce ? false : { opacity: 0, rotate: -10, scale: 0.85 }}
          whileInView={{ opacity: 1, rotate: -6, scale: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
        >
          <p className="font-script text-[44px] leading-[0.95] font-bold text-(color:--gc-gold) drop-shadow-[0_4px_14px_rgba(0,0,0,0.5)]">
            {t("Global Talent")}
            <br />
            <span className="pl-6">{t("Local Impact")}</span>
          </p>
          <svg viewBox="0 0 80 70" className="absolute -bottom-14 left-0 h-16 w-20 text-(color:--gc-gold)" aria-hidden>
            <motion.path
              d="M60 4 C 30 10, 14 30, 18 60"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 1 }}
            />
            <motion.path
              d="M8 50 L18 62 L28 52"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? false : { opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 1.7 }}
            />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
