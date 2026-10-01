import { Fragment, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import journeyBg from "@/assets/journey-bg.jpg";
import { SectionHeading } from "@/components/home/SectionHeading";
import { JOURNEY } from "@/lib/pathways";

const LAST = JOURNEY.length - 1;
const TRACK = `linear-gradient(90deg, ${JOURNEY.map((s, i) => `${s.color} ${(i / LAST) * 100}%`).join(", ")})`;

export function Journey({ reduce }: { reduce: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stepsRef, offset: ["start 85%", "end 45%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const [active, setActive] = useState(-1);
  const lit = reduce ? LAST : active;

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(v <= 0.01 ? -1 : Math.min(LAST, Math.floor(v * JOURNEY.length)));
  });

  const { scrollYProgress: bgProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(bgProgress, [0, 1], [-60, 60]);

  return (
    <section
      ref={sectionRef}
      id="journey"
      className="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-[#f4f8fd] via-[#fbf7ef] to-[#eef4fb] px-5 pt-16 pb-20 lg:px-8"
    >
      <motion.img
        src={journeyBg}
        alt=""
        className="pointer-events-none absolute inset-x-0 -top-[60px] h-[calc(100%+120px)] w-full object-cover object-[center_70%]"
        style={reduce ? undefined : { y: bgY }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,rgba(255,255,255,0.15)_35%,rgba(255,255,255,0.35)_70%,rgba(255,255,255,0.85)_100%)]" />

      <div className="relative">
        <SectionHeading eyebrow="One global journey" title="From Possibilities to Progress" reduce={reduce} />

        <div ref={stepsRef} className="relative mx-auto mt-12 max-w-[1180px]">
          <div className="pointer-events-none absolute top-[33px] right-[6%] left-[6%] hidden h-1 overflow-hidden rounded-full bg-[#0b1f4a]/8 lg:block">
            <motion.div
              className="absolute inset-0 origin-left rounded-full"
              style={{ background: TRACK, scaleX: reduce ? 1 : fill }}
            />
          </div>

          <ol className="relative grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:flex lg:items-start lg:justify-between lg:gap-0">
            {JOURNEY.map((s, i) => {
              const Icon = s.icon;
              const on = i <= lit;
              return (
                <Fragment key={s.title}>
                  <li className="flex flex-col items-center text-center lg:w-[140px]">
                    <motion.span
                      className="relative grid size-[68px] place-items-center rounded-full text-white ring-[6px] ring-white"
                      style={{ background: `linear-gradient(145deg, ${s.color}, ${s.deep})` }}
                      initial={false}
                      animate={
                        on
                          ? { scale: 1, opacity: 1, filter: "grayscale(0)", boxShadow: `0 12px 28px ${s.color}66` }
                          : { scale: 0.84, opacity: 0.55, filter: "grayscale(1)", boxShadow: "0 4px 10px rgba(11,31,74,0.08)" }
                      }
                      transition={{ type: "spring", stiffness: 380, damping: 14 }}
                    >
                      <motion.span
                        initial={false}
                        animate={on ? { rotate: 0, scale: 1 } : { rotate: -30, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 300, damping: 12 }}
                      >
                        <Icon size={30} weight="bold" />
                      </motion.span>
                      {on && !reduce ? (
                        <motion.span
                          key="ring"
                          className="absolute inset-[-6px] rounded-full border-2"
                          style={{ borderColor: s.color }}
                          initial={{ scale: 1, opacity: 0.8 }}
                          animate={{ scale: 1.6, opacity: 0 }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                        />
                      ) : null}
                    </motion.span>
                    <motion.span
                      className="mt-4 font-display text-[16px] font-semibold"
                      initial={false}
                      animate={{ color: on ? "#0b1f4a" : "#8a97ad", y: on ? 0 : 6 }}
                      transition={{ duration: 0.4 }}
                    >
                      {s.title}
                    </motion.span>
                    <motion.span
                      className="mt-1 max-w-[140px] text-[13px] leading-snug text-[#4a5a78]"
                      initial={false}
                      animate={{ opacity: on ? 1 : 0.35, y: on ? 0 : 6 }}
                      transition={{ duration: 0.4, delay: on ? 0.08 : 0 }}
                    >
                      {s.text}
                    </motion.span>
                  </li>
                  {i < LAST ? (
                    <li aria-hidden className="hidden pt-6 lg:block">
                      <motion.span
                        className="block"
                        initial={false}
                        animate={i < lit ? { x: 0, opacity: 1, color: s.color } : { x: -10, opacity: 0.3, color: "#8a97ad" }}
                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                      >
                        <ArrowRight size={24} weight="bold" />
                      </motion.span>
                    </li>
                  ) : null}
                </Fragment>
              );
            })}
          </ol>

          <motion.p
            className="mx-auto mt-12 flex w-fit items-center gap-3 rounded-full bg-white/85 px-6 py-2.5 text-center text-[15px] font-medium text-[#0b1f4a] shadow-[0_6px_20px_rgba(11,31,74,0.08)] ring-1 ring-[#0b1f4a]/8 backdrop-blur"
            initial={false}
            animate={lit >= LAST ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <span className="size-2 rounded-full bg-[#3fb4ff]" />
            From the first conversation to measurable outcomes.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
