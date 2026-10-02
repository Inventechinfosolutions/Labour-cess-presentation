import { Fragment } from "react";
import { motion } from "motion/react";
import { ArrowRight, Eye, HandPointing, Notepad, SealCheck } from "@phosphor-icons/react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { EASE } from "./shared";

const STEPS = [
  { label: "View Opportunity", icon: Eye },
  { label: "Express Interest", icon: HandPointing },
  { label: "Submit Basic Details", icon: Notepad },
  { label: "Receive Acknowledgement", icon: SealCheck },
];

export function ExpressInterest({ reduce }: { reduce: boolean }) {
  return (
    <section id="conversation" className="relative scroll-mt-16 bg-white px-5 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Next step"
        title={
          <>
            Interested in an Opportunity?
            <br />
            <span className="text-(color:--gc-primary)">Start a Conversation.</span>
          </>
        }
        reduce={reduce}
      />

      <motion.ol
        className="mx-auto mt-12 flex max-w-[1000px] flex-col items-center gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-0"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ staggerChildren: 0.18 }}
      >
        {STEPS.map(({ label, icon: Icon }, i) => (
          <Fragment key={label}>
            <motion.li
              className="flex w-[180px] flex-col items-center text-center"
              variants={{
                hidden: { opacity: 0, y: 22, scale: 0.96 },
                show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
              }}
            >
              <span className="grid size-16 place-items-center rounded-2xl bg-(color:--gc-primary-soft) text-(color:--gc-primary)">
                <Icon size={30} weight="duotone" />
              </span>
              <span className="mt-3 text-[15px] font-semibold text-(color:--gc-ink)">{label}</span>
            </motion.li>
            {i < STEPS.length - 1 ? (
              <motion.li
                aria-hidden
                className="text-(color:--gc-primary)/60 sm:pt-5"
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.4 } },
                }}
              >
                <ArrowRight size={22} weight="bold" className="rotate-90 sm:rotate-0" />
              </motion.li>
            ) : null}
          </Fragment>
        ))}
      </motion.ol>
    </section>
  );
}
