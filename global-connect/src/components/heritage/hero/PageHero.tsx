import type { ReactNode } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, CaretRight, type Icon } from "@phosphor-icons/react";
import { WORLD_LAND_D } from "@/lib/worldPath";
import { EASE } from "../motion";

export type HeroAction = { label: string; href: string };

export function PageHero({
  crumb,
  eyebrow,
  title,
  sub,
  primary,
  secondary,
  chips,
  visual,
  reduce,
}: {
  crumb: string;
  eyebrow: string;
  title: [string, string];
  sub: string;
  primary: HeroAction;
  secondary: HeroAction;
  chips?: { icon: Icon; label: string }[];
  visual: ReactNode;
  reduce: boolean;
}) {
  const enter = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 18 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section className="relative isolate overflow-hidden bg-(color:--gc-surface) pt-[76px]">
      <svg viewBox="0 0 1000 470" aria-hidden className="absolute top-10 right-[-8%] -z-10 w-[78%] opacity-45">
        <path d={WORLD_LAND_D} fill="#e6dec9" />
      </svg>
      <div className="absolute top-1/3 left-[58%] -z-10 size-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,194,100,0.22),transparent_65%)]" />

      <div className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 pt-8 pb-14 lg:grid-cols-[minmax(0,500px)_1fr] lg:px-8 lg:pt-10 lg:pb-16">
        <div className="relative z-10">
          <motion.nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12.5px] text-(color:--gc-body)" {...enter(0)}>
            <Link to="/global-connect" className="transition hover:text-(color:--gc-ink)">
              Home
            </Link>
            <CaretRight size={11} />
            <span className="font-semibold text-(color:--gc-ink)">{crumb}</span>
          </motion.nav>
          <motion.p className="mt-6 flex items-center gap-3 text-[12px] font-extrabold tracking-[0.22em] text-(color:--gc-gold-4) uppercase" {...enter(0.08)}>
            <span aria-hidden className="h-px w-8 bg-(color:--gc-gold-3)" />
            {eyebrow}
          </motion.p>
          <h1 className="mt-4 font-display text-[40px] leading-[1.08] font-bold text-(color:--gc-ink) sm:text-[52px] xl:text-[58px]">
            <motion.span className="block" {...enter(0.16)}>
              {title[0]}
            </motion.span>
            <motion.span className="block text-(color:--gc-gold-4)" {...enter(0.28)}>
              {title[1]}
            </motion.span>
          </h1>
          <motion.p className="mt-5 max-w-[440px] text-[16.5px] leading-relaxed text-(color:--gc-body)" {...enter(0.4)}>
            {sub}
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" {...enter(0.5)}>
            <a
              href={primary.href}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-(color:--gc-button-a) to-(color:--gc-button-b) px-6 py-3 text-[14.5px] font-semibold text-(color:--gc-night) shadow-[0_10px_24px_rgba(201,154,46,0.35)] transition hover:brightness-105"
            >
              {primary.label}
              <ArrowRight size={15} weight="bold" className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href={secondary.href}
              className="inline-flex items-center rounded-full border border-(color:--gc-ink)/40 bg-white/60 px-6 py-3 text-[14.5px] font-semibold text-(color:--gc-ink) transition hover:border-(color:--gc-ink) hover:bg-white"
            >
              {secondary.label}
            </a>
          </motion.div>
          {chips ? (
            <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-3">
              {chips.map(({ icon: ChipIcon, label }, i) => (
                <motion.li key={label} className="flex items-center gap-2 text-[13px] font-medium text-(color:--gc-ink-2)" {...enter(0.62 + i * 0.07)}>
                  <span className="grid size-8 place-items-center rounded-full bg-white text-(color:--gc-gold-4) ring-1 ring-(color:--gc-gold-3)/50">
                    <ChipIcon size={16} weight="duotone" />
                  </span>
                  {label}
                </motion.li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="relative">{visual}</div>
      </div>
      <div aria-hidden className="h-px bg-gradient-to-r from-transparent via-(color:--gc-gold-3)/60 to-transparent" />
    </section>
  );
}
