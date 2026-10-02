import { Fragment, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import {
  ArrowRight,
  ChartLineUp,
  Crosshair,
  HandHeart,
  MagnifyingGlass,
  ShareNetwork,
  UserCircle,
  type Icon,
} from "@phosphor-icons/react";
import { SectionHeading } from "@/components/home/SectionHeading";

type Step = { title: string; text: string; icon: Icon; color: string };

const STEPS: Step[] = [
  { title: "Create Profile", text: "Tell us about your skills", icon: UserCircle, color: "#1f6fe5" },
  { title: "Discover", text: "Explore global opportunities", icon: MagnifyingGlass, color: "#16a05a" },
  { title: "Match", text: "Find relevant opportunities", icon: Crosshair, color: "#ea6c12" },
  { title: "Connect", text: "Connect with employers, institutions or organisations", icon: ShareNetwork, color: "#8a3fd6" },
  { title: "Collaborate", text: "Work, research or learn together", icon: HandHeart, color: "#e0335c" },
  { title: "Grow", text: "Build global careers and strengthen Karnataka's ecosystem", icon: ChartLineUp, color: "#0e9c97" },
];

const LAST = STEPS.length - 1;
const TRACK = `linear-gradient(90deg, ${STEPS.map((s, i) => `${s.color} ${(i / LAST) * 100}%`).join(", ")})`;

export function SkillsJourney({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 50%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });
  const [active, setActive] = useState(-1);
  const lit = reduce ? LAST : active;

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(v <= 0.01 ? -1 : Math.min(LAST, Math.floor(v * STEPS.length)));
  });

  return (
    <section id="journey" className="relative scroll-mt-16 bg-white px-5 pt-14 pb-20 lg:px-8">
      <SectionHeading
        eyebrow="How it works"
        title="From Skills to Opportunities"
        sub="A simple journey to connect your talent with global opportunities."
        reduce={reduce}
      />

      <div ref={ref} className="relative mx-auto mt-14 max-w-[1220px]">
        <div className="pointer-events-none absolute top-[17px] right-[7%] left-[7%] hidden h-[3px] overflow-hidden rounded-full bg-(color:--gc-ink)/8 lg:block">
          <motion.div className="absolute inset-0 origin-left rounded-full" style={{ background: TRACK, scaleX: reduce ? 1 : fill }} />
        </div>

        <ol className="relative grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:flex lg:items-start lg:justify-between lg:gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const on = i <= lit;
            return (
              <Fragment key={s.title}>
                <li className="flex flex-col items-center text-center lg:w-[150px]">
                  <motion.span
                    className="relative z-10 grid size-9 place-items-center rounded-full font-display text-[13px] font-bold ring-4 ring-white"
                    initial={false}
                    animate={on ? { backgroundColor: s.color, color: "#fff", scale: 1 } : { backgroundColor: "#eef2f8", color: "#8a97ad", scale: 0.85 }}
                    transition={{ duration: 0.4 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </motion.span>
                  <motion.span
                    className="-mt-2 grid h-[74px] w-[96px] place-items-center rounded-2xl bg-white pt-2 ring-1"
                    initial={false}
                    animate={
                      on
                        ? { y: 0, opacity: 1, color: s.color, boxShadow: `0 16px 34px ${s.color}30`, "--tw-ring-color": `${s.color}40` }
                        : { y: 10, opacity: 0.55, color: "#9aa6ba", boxShadow: "0 0 0 rgba(0,0,0,0)", "--tw-ring-color": "rgba(11,31,74,0.08)" }
                    }
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <motion.span
                      initial={false}
                      animate={on && !reduce ? { scale: [1, 1.18, 1], rotate: [0, -6, 0] } : { scale: 1, rotate: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Icon size={30} weight="duotone" />
                    </motion.span>
                  </motion.span>
                  <motion.span className="mt-3" initial={false} animate={{ opacity: on ? 1 : 0.45, y: on ? 0 : 6 }} transition={{ duration: 0.4 }}>
                    <span className="block font-display text-[15.5px] font-semibold text-(color:--gc-ink)">{s.title}</span>
                    <span className="mx-auto mt-1 block max-w-[160px] text-[12.5px] leading-snug text-(color:--gc-body)">{s.text}</span>
                  </motion.span>
                </li>
                {i < LAST ? (
                  <li aria-hidden className="hidden pt-[44px] lg:block">
                    <motion.span
                      className="block"
                      initial={false}
                      animate={i < lit ? { x: 0, opacity: 1, color: s.color } : { x: -8, opacity: 0.3, color: "#8a97ad" }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    >
                      <ArrowRight size={20} weight="bold" />
                    </motion.span>
                  </li>
                ) : null}
              </Fragment>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
