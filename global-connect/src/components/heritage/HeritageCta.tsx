import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import ctaBg from "@/assets/heritage/cta.jpg";
import { KARNATAKA_DISTRICTS } from "@/lib/karnatakaMap";
import { EASE, rise } from "./motion";

export function HeritageCta({ reduce }: { reduce: boolean }) {
  return (
    <section className="relative isolate overflow-hidden bg-(color:--gc-night) px-5 py-16 text-white lg:px-8 lg:py-20">
      <img
        src={ctaBg}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute inset-y-0 right-0 -z-10 h-full w-full object-cover object-right [mask-image:linear-gradient(90deg,transparent,black_30%)] md:w-[60%]"
      />
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_30%_40%,#0f4431_0%,#072519_70%)]" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(7,37,25,0.9)_0%,rgba(7,37,25,0.55)_40%,rgba(7,37,25,0)_70%)] max-md:bg-[rgba(7,37,25,0.7)]" />

      <div className="mx-auto flex max-w-[1320px] flex-col gap-10 md:flex-row md:items-center">
        <div className="md:w-[46%]">
          <motion.h2 className="font-display text-[32px] leading-[1.15] font-bold text-(color:--gc-gold) sm:text-[40px]" {...rise(reduce)}>
            Your Connection With Karnataka Starts Here.
          </motion.h2>
          <motion.p className="mt-4 text-[17px] text-white/85" {...rise(reduce, 0.12)}>
            Explore. Connect. Collaborate. Grow.
          </motion.p>
          <motion.div {...rise(reduce, 0.22)}>
            <a
              href="#goals"
              className="group relative mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-(color:--gc-button-a) to-(color:--gc-button-b) px-6 py-3 text-[14.5px] font-semibold text-(color:--gc-night) shadow-[0_10px_24px_rgba(0,0,0,0.3)] transition hover:brightness-105"
            >
              Start Your Journey
              <ArrowRight size={15} weight="bold" className="transition-transform group-hover:translate-x-1" />
              {!reduce ? (
                <motion.span
                  aria-hidden
                  className="absolute inset-0 rounded-full border-2 border-(color:--gc-gold-3)"
                  animate={{ scale: [1, 1.18], opacity: [0.8, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 0.8, ease: "easeOut" }}
                />
              ) : null}
            </a>
          </motion.div>
        </div>

        <div className="flex items-center gap-4">
          <motion.div
            className="shrink-0"
            animate={
              reduce
                ? undefined
                : { filter: ["drop-shadow(0 0 0px rgba(232,194,100,0))", "drop-shadow(0 0 14px rgba(232,194,100,0.75))", "drop-shadow(0 0 0px rgba(232,194,100,0))"] }
            }
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
          >
          <motion.svg
            viewBox="-8 -8 316 489"
            className="h-[150px] w-auto shrink-0 sm:h-[180px]"
            aria-hidden
            initial={reduce ? false : { opacity: 0, scale: 0.85, rotate: -4 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1.1, delay: 0.2, ease: EASE }}
          >
            <defs>
              <mask id="hc-outline" maskUnits="userSpaceOnUse" x="-8" y="-8" width="316" height="489">
                {KARNATAKA_DISTRICTS.map((d) => (
                  <path key={d.name} d={d.d} fill="#fff" stroke="#fff" strokeWidth={9} strokeLinejoin="round" />
                ))}
                {KARNATAKA_DISTRICTS.map((d) => (
                  <path key={d.name} d={d.d} fill="#000" stroke="#000" strokeWidth={1.2} strokeLinejoin="round" />
                ))}
              </mask>
            </defs>
            {KARNATAKA_DISTRICTS.map((d) => (
              <path key={d.name} d={d.d} fill="var(--gc-gold-3)" fillOpacity={0.08} />
            ))}
            <rect x="-8" y="-8" width="316" height="489" fill="var(--gc-gold-3)" mask="url(#hc-outline)" />
          </motion.svg>
          </motion.div>
          <motion.div className="leading-tight" {...rise(reduce, 0.5)}>
            <p className="font-display text-[20px] font-bold tracking-wide text-(color:--gc-gold)">KARNATAKA</p>
            <p className="font-display text-[20px] font-bold tracking-wide text-(color:--gc-gold)">GLOBAL CONNECT</p>
            <p className="mt-2 text-[10px] font-semibold tracking-[0.18em] text-white/70">PEOPLE • PARTNERSHIPS • OPPORTUNITIES</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
