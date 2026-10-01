import { motion } from "motion/react";
import { IdentificationBadge } from "@phosphor-icons/react";
import { GoldButton } from "./GoldButton";
import { EASE } from "./shared";

export function RegisterCta({ reduce }: { reduce: boolean }) {
  return (
    <section id="register" className="scroll-mt-16 bg-white px-5 pb-20 lg:px-8">
      <motion.div
        className="relative mx-auto flex max-w-[1220px] flex-col items-start gap-6 overflow-hidden rounded-[28px] bg-[#0b1f4a] px-7 py-9 text-white sm:px-10 md:flex-row md:items-center"
        initial={reduce ? false : { opacity: 0, y: 26, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_120%_at_100%_50%,rgba(240,193,74,0.28),transparent_60%),radial-gradient(40%_90%_at_0%_0%,rgba(63,180,255,0.25),transparent_60%)]" />
        <span className="relative grid size-16 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#ffd77a] ring-1 ring-white/15">
          <IdentificationBadge size={34} weight="duotone" />
        </span>
        <div className="relative flex-1">
          <h3 className="font-display text-[24px] leading-tight font-bold tracking-[-0.02em] sm:text-[30px]">Create Your Global Kannadiga Profile</h3>
          <p className="mt-2 max-w-[560px] text-[15.5px] text-white/80">
            Tell us about yourself and how you would like to connect with Karnataka.
          </p>
        </div>
        <GoldButton href="#join" className="relative shrink-0">
          Create Profile
        </GoldButton>
      </motion.div>
    </section>
  );
}
