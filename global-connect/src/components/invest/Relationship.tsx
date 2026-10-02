import { Fragment } from "react";
import { motion } from "motion/react";
import { ArrowRight, ArrowsOutSimple, ChartLineUp, CurrencyInr, Gear, Plant } from "@phosphor-icons/react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { cn } from "@/lib/utils";
import { EASE } from "./shared";

const STEPS = [
  { label: "Invest", icon: CurrencyInr },
  { label: "Implement", icon: Gear },
  { label: "Monitor", icon: ChartLineUp },
  { label: "Expand", icon: ArrowsOutSimple },
  { label: "Grow in Karnataka", icon: Plant },
];
const LAST = STEPS.length - 1;

export function Relationship({ reduce }: { reduce: boolean }) {
  return (
    <section id="growth" className="relative scroll-mt-16 bg-gradient-to-b from-white to-(color:--gc-surface) px-5 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Beyond investment"
        title="Our Relationship Does Not End With Investment"
        sub="We continue to support your growth journey in Karnataka."
        reduce={reduce}
      />

      <motion.ol
        className="mx-auto mt-12 grid max-w-[1000px] grid-cols-2 justify-items-center gap-y-8 sm:flex sm:items-start sm:justify-between"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ staggerChildren: 0.16 }}
      >
        {STEPS.map(({ label, icon: Icon }, i) => {
          const last = i === LAST;
          return (
            <Fragment key={label}>
              <motion.li
                className={cn("flex w-[130px] flex-col items-center text-center", last && "col-span-2")}
                variants={{
                  hidden: { opacity: 0, y: 22, scale: 0.94 },
                  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
                }}
              >
                <span
                  className={cn(
                    "relative grid size-[70px] place-items-center rounded-full",
                    last
                      ? "bg-gradient-to-br from-(color:--gc-gold-3) to-[#e0a91f] text-(color:--gc-ink) shadow-[0_14px_32px_rgba(224,169,31,0.45)]"
                      : "bg-white text-(color:--gc-primary) shadow-[0_10px_24px_rgba(11,31,74,0.1)] ring-1 ring-(color:--gc-ink)/6",
                  )}
                >
                  <Icon size={30} weight="duotone" />
                  {last && !reduce ? (
                    <motion.span
                      className="absolute inset-[-6px] rounded-full border-2 border-(color:--gc-gold-3)"
                      variants={{ hidden: { opacity: 0 }, show: { opacity: [0, 0.9, 0], scale: [1, 1.35], transition: { delay: 0.9, duration: 1.4 } } }}
                    />
                  ) : null}
                </span>
                <span className={cn("mt-3 text-[15px] font-semibold", last ? "text-[#a87a0a]" : "text-(color:--gc-ink)")}>{label}</span>
              </motion.li>
              {i < LAST ? (
                <motion.li
                  aria-hidden
                  className="hidden pt-6 text-(color:--gc-primary)/50 sm:block"
                  variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.35 } } }}
                >
                  <ArrowRight size={22} weight="bold" />
                </motion.li>
              ) : null}
            </Fragment>
          );
        })}
      </motion.ol>
    </section>
  );
}
