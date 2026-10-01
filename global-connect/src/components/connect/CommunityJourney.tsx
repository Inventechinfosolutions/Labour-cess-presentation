import { Fragment, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import {
  ArrowRight,
  CalendarCheck,
  HandHeart,
  MagnifyingGlass,
  MapPinArea,
  ShareNetwork,
  UserPlus,
  type Icon,
} from "@phosphor-icons/react";
import { SectionHeading } from "@/components/home/SectionHeading";

type Step = { title: string; text: string; icon: Icon; color: string };

const STEPS: Step[] = [
  { title: "Discover", text: "Find your global Kannada community", icon: MagnifyingGlass, color: "#1f6fe5" },
  { title: "Register", text: "Create your profile", icon: UserPlus, color: "#0e9c97" },
  { title: "Connect", text: "Connect with people and organisations", icon: ShareNetwork, color: "#16a05a" },
  { title: "Participate", text: "Join events and initiatives", icon: CalendarCheck, color: "#8a3fd6" },
  { title: "Contribute", text: "Share knowledge, skills and opportunities", icon: HandHeart, color: "#e0335c" },
  { title: "Connect with Karnataka", text: "Engage with opportunities in Karnataka", icon: MapPinArea, color: "#e0a91f" },
];

const LAST = STEPS.length - 1;
const TRACK = `linear-gradient(90deg, ${STEPS.map((s, i) => `${s.color} ${(i / LAST) * 100}%`).join(", ")})`;

export function CommunityJourney({ reduce }: { reduce: boolean }) {
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
        eyebrow="Your journey"
        title="One Global Community. Many Ways to Connect."
        sub="Create your profile and become part of the Global Kannadiga Network."
        reduce={reduce}
      />

      <div ref={ref} className="relative mx-auto mt-14 max-w-[1220px]">
        <div className="pointer-events-none absolute top-[35px] right-[7%] left-[7%] hidden h-[3px] overflow-hidden rounded-full bg-[#0b1f4a]/8 lg:block">
          <motion.div className="absolute inset-0 origin-left rounded-full" style={{ background: TRACK, scaleX: reduce ? 1 : fill }} />
        </div>
        <div className="pointer-events-none absolute top-[35px] bottom-[35px] left-[34px] w-[3px] overflow-hidden rounded-full bg-[#0b1f4a]/8 lg:hidden">
          <motion.div
            className="absolute inset-0 origin-top rounded-full"
            style={{ background: TRACK.replace("90deg", "180deg"), scaleY: reduce ? 1 : fill }}
          />
        </div>

        <ol className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between lg:gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const on = i <= lit;
            return (
              <Fragment key={s.title}>
                <li className="flex items-center gap-5 lg:w-[150px] lg:flex-col lg:gap-0 lg:text-center">
                  <motion.span
                    className="relative grid size-[70px] shrink-0 place-items-center rounded-full ring-[6px] ring-white"
                    initial={false}
                    animate={
                      on
                        ? { opacity: 1, scale: 1, y: 0, backgroundColor: s.color, color: "#ffffff", boxShadow: `0 12px 28px ${s.color}55` }
                        : { opacity: 0.6, scale: 0.9, y: 8, backgroundColor: "#eef2f8", color: "#8a97ad", boxShadow: "0 0 0 rgba(0,0,0,0)" }
                    }
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Icon size={30} weight="duotone" />
                    <span
                      className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-white font-display text-[10.5px] font-bold ring-1 ring-[#0b1f4a]/10"
                      style={{ color: s.color }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </motion.span>
                  <motion.span
                    className="lg:mt-4"
                    initial={false}
                    animate={{ opacity: on ? 1 : 0.45, y: on ? 0 : 6 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span className="block font-display text-[16px] font-semibold text-[#0b1f4a]">{s.title}</span>
                    <span className="mt-1 block max-w-[220px] text-[13px] leading-snug text-[#4a5a78] lg:mx-auto lg:max-w-[150px]">{s.text}</span>
                  </motion.span>
                </li>
                {i < LAST ? (
                  <li aria-hidden className="hidden pt-[24px] lg:block">
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
