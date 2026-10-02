import { Fragment } from "react";
import { motion } from "motion/react";
import { ArrowRight, BookOpenText, ChalkboardTeacher, ChartLineUp, Handshake, Lightbulb, type Icon } from "@phosphor-icons/react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { KARNATAKA_DISTRICTS, KARNATAKA_VIEWBOX } from "@/lib/karnatakaMap";
import { EASE } from "./shared";

const STAGES: { label: string; icon: Icon }[] = [
  { label: "Knowledge", icon: BookOpenText },
  { label: "Mentorship", icon: ChalkboardTeacher },
  { label: "Investment", icon: ChartLineUp },
  { label: "Innovation", icon: Lightbulb },
  { label: "Partnerships", icon: Handshake },
];
const STEP = 0.32;

export function LocalImpact({ reduce }: { reduce: boolean }) {
  return (
    <section id="impact" className="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-(color:--gc-surface) to-[#fbf7ef] px-5 py-20 lg:px-8">
      <SectionHeading eyebrow="Global to local" title="Bring the World Back to Karnataka" sub="Global connections can create local impact." reduce={reduce} />

      <motion.div
        className="mx-auto mt-14 grid max-w-[1220px] items-center gap-10 lg:grid-cols-[1fr_auto]"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.45 }}
      >
        <ol className="flex flex-col items-center gap-2 md:flex-row md:justify-between md:gap-0">
          {STAGES.map(({ label, icon: Icon }, i) => (
            <Fragment key={label}>
              <motion.li
                className="flex w-[120px] flex-col items-center text-center"
                variants={{
                  hidden: { opacity: 0.25, scale: 0.9, y: 10 },
                  show: { opacity: 1, scale: 1, y: 0, transition: { delay: i * STEP, duration: 0.45, ease: EASE } },
                }}
              >
                <motion.span
                  className="grid size-[68px] place-items-center rounded-full"
                  variants={{
                    hidden: { backgroundColor: "#eef2f8", color: "#8a97ad", boxShadow: "0 0 0 rgba(0,0,0,0)" },
                    show: {
                      backgroundColor: "#0b1f4a",
                      color: "#ffd77a",
                      boxShadow: "0 14px 30px rgba(11,31,74,0.25)",
                      transition: { delay: i * STEP, duration: 0.45 },
                    },
                  }}
                >
                  <Icon size={30} weight="duotone" />
                </motion.span>
                <span className="mt-3 font-display text-[15px] font-semibold text-(color:--gc-ink)">{label}</span>
              </motion.li>
              {i < STAGES.length - 1 ? (
                <li aria-hidden className="flex items-center md:h-[68px]">
                  <span className="relative hidden h-[3px] w-10 overflow-hidden rounded-full bg-(color:--gc-ink)/10 md:block lg:w-14">
                    <motion.span
                      className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-(color:--gc-primary) to-[#e0a91f]"
                      variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { delay: i * STEP + 0.2, duration: 0.3 } } }}
                    />
                  </span>
                  <span className="h-5 w-[3px] rounded-full bg-(color:--gc-primary)/30 md:hidden" />
                </li>
              ) : null}
            </Fragment>
          ))}
        </ol>

        <motion.div
          className="relative mx-auto flex items-center gap-5 overflow-hidden rounded-[24px] bg-(color:--gc-ink) py-6 pr-8 pl-6 text-white shadow-[0_24px_60px_rgba(11,31,74,0.3)]"
          variants={{
            hidden: { opacity: 0, x: 30, scale: 0.95 },
            show: { opacity: 1, x: 0, scale: 1, transition: { delay: STAGES.length * STEP, duration: 0.6, ease: EASE } },
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_0%_50%,rgba(240,193,74,0.35),transparent_65%)]" />
          <svg viewBox={KARNATAKA_VIEWBOX} className="relative h-[92px] w-auto" aria-hidden>
            {KARNATAKA_DISTRICTS.map((d) => (
              <path key={d.name} d={d.d} fill="#f0b429" stroke="#fff3c8" strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
          <div className="relative">
            <p className="font-display text-[15px] font-semibold text-white/80">Global Connections</p>
            <ArrowRight size={20} weight="bold" className="my-1 rotate-90 text-(color:--gc-gold)" />
            <p className="font-display text-[26px] leading-none font-bold text-(color:--gc-gold)">Local Impact</p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
