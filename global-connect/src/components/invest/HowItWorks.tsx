import { Fragment } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ChartLineUp,
  ChatCircleText,
  Handshake,
  MagnifyingGlass,
  UserPlus,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { EASE } from "./shared";

type Stage = { title: string; text: string; icon: Icon; color: string };

const STAGES: Stage[] = [
  { title: "Register", text: "Create your investor profile", icon: UserPlus, color: "#1f6fe5" },
  { title: "Explore", text: "Discover relevant opportunities", icon: MagnifyingGlass, color: "#0e9c97" },
  { title: "Express Interest", text: "Tell us about your investment", icon: ChatCircleText, color: "#8a3fd6" },
  { title: "Connect", text: "Get connected with the right government teams", icon: UsersThree, color: "#ea6c12" },
  { title: "Facilitate", text: "Receive coordinated support", icon: Handshake, color: "#e0335c" },
  { title: "Invest", text: "Track your project through implementation", icon: ChartLineUp, color: "#16a05a" },
];

const STEP = 0.22;
const TRACK = `linear-gradient(90deg, ${STAGES.map((s, i) => `${s.color} ${(i / (STAGES.length - 1)) * 100}%`).join(", ")})`;
const TRACK_V = TRACK.replace("90deg", "180deg");

export function HowItWorks({ reduce }: { reduce: boolean }) {
  const line = (vertical: boolean) => ({
    initial: reduce ? false : vertical ? { scaleY: 0 } : { scaleX: 0 },
    whileInView: vertical ? { scaleY: 1 } : { scaleX: 1 },
    viewport: { once: true, amount: 0.4 },
    transition: { duration: STEP * STAGES.length, delay: 0.15, ease: "linear" as const },
  });

  return (
    <section id="how" className="relative scroll-mt-16 bg-white px-5 pt-14 pb-20 lg:px-8">
      <SectionHeading eyebrow="How it works" title="How Does It Work?" sub="A simple, guided journey to invest in Karnataka." reduce={reduce} />

      <div className="relative mx-auto mt-14 max-w-[1220px]">
        <div className="pointer-events-none absolute top-[38px] right-[7%] left-[7%] hidden h-1 rounded-full bg-(color:--gc-ink)/8 lg:block">
          <motion.div className="absolute inset-0 origin-left rounded-full" style={{ background: TRACK }} {...line(false)} />
        </div>
        <div className="pointer-events-none absolute top-[38px] bottom-[38px] left-[37px] w-1 rounded-full bg-(color:--gc-ink)/8 lg:hidden">
          <motion.div className="absolute inset-0 origin-top rounded-full" style={{ background: TRACK_V }} {...line(true)} />
        </div>

        <motion.ol
          className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between lg:gap-0"
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          transition={{ staggerChildren: STEP, delayChildren: 0.1 }}
        >
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            return (
              <Fragment key={s.title}>
                <motion.li
                  className="flex items-center gap-5 lg:w-[150px] lg:flex-col lg:gap-0 lg:text-center"
                  variants={{
                    hidden: { opacity: 0, y: 26, scale: 0.96 },
                    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
                  }}
                >
                  <span
                    className="relative grid size-[78px] shrink-0 place-items-center rounded-full bg-white ring-[6px] ring-white"
                    style={{ boxShadow: `0 12px 30px ${s.color}40, inset 0 0 0 2px ${s.color}` }}
                  >
                    <Icon size={32} weight="duotone" color={s.color} />
                    <span
                      className="absolute -top-1 -right-1 grid size-7 place-items-center rounded-full font-display text-[11px] font-bold text-white ring-2 ring-white"
                      style={{ background: s.color }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <span className="lg:mt-4">
                    <span className="block font-display text-[16.5px] font-semibold text-(color:--gc-ink)">{s.title}</span>
                    <span className="mt-1 block max-w-[220px] text-[13.5px] leading-snug text-(color:--gc-body) lg:mx-auto lg:max-w-[150px]">
                      {s.text}
                    </span>
                  </span>
                </motion.li>
                {i < STAGES.length - 1 ? (
                  <motion.li
                    aria-hidden
                    className="hidden pt-[26px] lg:block"
                    variants={{
                      hidden: { opacity: 0, x: -12 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
                    }}
                  >
                    <ArrowRight size={22} weight="bold" color={s.color} />
                  </motion.li>
                ) : null}
              </Fragment>
            );
          })}
        </motion.ol>
      </div>
    </section>
  );
}
