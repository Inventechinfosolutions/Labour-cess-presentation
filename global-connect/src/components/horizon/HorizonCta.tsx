import { motion } from "motion/react";
import { Handshake, Lightbulb, Target, UsersThree, type Icon } from "@phosphor-icons/react";
import ctaImg from "@/assets/horizon/cta.jpg";
import { cn } from "@/lib/utils";
import { EASE, rise, useCycle } from "@/components/heritage/motion";
import { SaffronButton } from "./parts";

const LIST: { label: string; icon: Icon }[] = [
  { label: "Global People", icon: UsersThree },
  { label: "Global Ideas", icon: Lightbulb },
  { label: "Global Partnerships", icon: Handshake },
  { label: "Global Opportunities", icon: Target },
];

const draw = (reduce: boolean, delay: number) => ({
  initial: reduce ? false : ({ pathLength: 0 } as const),
  whileInView: { pathLength: 1 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 1.3, delay, ease: EASE },
});

export function HorizonCta({ reduce }: { reduce: boolean }) {
  const active = useCycle(LIST.length, 1500, !reduce);

  return (
    <section className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_20%_30%,#14347f_0%,#0c2459_55%,#071841_100%)] text-white">
      <div className="relative mx-auto max-w-[1320px] px-5 py-14 lg:px-8 lg:py-16">
        <div className="grid items-center gap-10 md:grid-cols-[1.15fr_0.85fr] lg:w-[60%]">
          <div>
            <motion.p className="text-[11px] font-extrabold tracking-[0.2em] text-white/60 uppercase" {...rise(reduce)}>
              People. Partnerships. Opportunities.
            </motion.p>
            <motion.h2 className="mt-3 font-display text-[30px] leading-[1.15] font-extrabold sm:text-[38px]" {...rise(reduce, 0.08)}>
              Let&apos;s Build a Stronger Karnataka <span className="text-(color:--gc-gold)">Together.</span>
            </motion.h2>
            <motion.p className="mt-4 text-[15.5px] text-white/80" {...rise(reduce, 0.16)}>
              Explore opportunities. Connect with people. Create global impact.
            </motion.p>
            <motion.div className="mt-7" {...rise(reduce, 0.24)}>
              <SaffronButton href="#pathways" reduce={reduce}>
                Start Your Journey
              </SaffronButton>
            </motion.div>
          </div>

          <ul className="flex flex-col gap-4 md:border-l md:border-white/15 md:pl-8">
            {LIST.map(({ label, icon: ItemIcon }, i) => {
              const on = i === active;
              return (
                <motion.li
                  key={label}
                  className={cn("flex items-center gap-3 text-[14.5px] font-semibold transition-colors duration-500", on ? "text-white" : "text-white/70")}
                  {...rise(reduce, 0.2 + i * 0.08)}
                >
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-lg transition-all duration-500",
                      on ? "scale-110 bg-(color:--gc-gold) text-(color:--gc-night)" : "bg-white/10 text-(color:--gc-gold)",
                    )}
                  >
                    <ItemIcon size={19} weight="fill" />
                  </span>
                  {label}
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="relative h-[260px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[38%]">
        <motion.img
          src={ctaImg}
          alt="Vidhana Soudha, Bengaluru, at golden hour"
          loading="lazy"
          className="absolute inset-0 size-full object-cover [clip-path:ellipse(85%_100%_at_100%_50%)]"
          initial={reduce ? false : { scale: 1.12, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.4, ease: EASE }}
        />
        <svg viewBox="0 0 400 340" preserveAspectRatio="none" aria-hidden className="absolute inset-0 size-full">
          <motion.path d="M70 -10 C -10 120, -10 230, 70 350" fill="none" stroke="#f5ae1b" strokeWidth={10} strokeLinecap="round" {...draw(reduce, 0.3)} />
          <motion.path d="M100 -10 C 30 120, 30 230, 100 350" fill="none" stroke="#2f6fe0" strokeWidth={5} strokeLinecap="round" {...draw(reduce, 0.5)} />
        </svg>
      </div>
    </section>
  );
}
