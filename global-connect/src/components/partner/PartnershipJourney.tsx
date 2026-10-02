import { Fragment } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  ChartLineUp,
  ClipboardText,
  Crosshair,
  HandHeart,
  Handshake,
  MagnifyingGlass,
  UserPlus,
  type Icon,
} from "@phosphor-icons/react";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";

type Step = { title: string; text: string; tip: string; icon: Icon; color: string };

const STEPS: Step[] = [
  { title: "Discover", text: "Explore Karnataka's ecosystem", tip: "Browse sectors, clusters and institutions.", icon: MagnifyingGlass, color: "#1f6fe5" },
  { title: "Register", text: "Tell us about your organisation", tip: "Create a short organisation profile.", icon: UserPlus, color: "#16a05a" },
  { title: "Define Interest", text: "Tell us what you want to achieve", tip: "Choose sectors, goals and partner types.", icon: ClipboardText, color: "#ea6c12" },
  { title: "Find a Match", text: "Discover relevant partners", tip: "Receive a shortlist of suitable partners.", icon: Crosshair, color: "#8a3fd6" },
  { title: "Connect", text: "Meet the right organisation", tip: "We arrange a facilitated introduction.", icon: Handshake, color: "#e0335c" },
  { title: "Collaborate", text: "Build a joint initiative", tip: "Agree scope, roles and a shared plan.", icon: HandHeart, color: "#0e9c97" },
  { title: "Create Impact", text: "Turn partnerships into outcomes", tip: "Track outcomes for Karnataka and partners.", icon: ChartLineUp, color: "#3b4fd8" },
];

const LAST = STEPS.length - 1;
const TRACK = `linear-gradient(90deg, ${STEPS.map((s, i) => `${s.color} ${(i / LAST) * 100}%`).join(", ")})`;
const STAGGER = 0.16;

export function PartnershipJourney({ reduce }: { reduce: boolean }) {
  return (
    <section id="journey" className="relative scroll-mt-16 bg-white px-5 pt-14 pb-20 lg:px-8">
      <SectionHeading
        eyebrow="How it works"
        title="The Partnership Journey"
        sub="From interest to impact, a simple and guided journey."
        reduce={reduce}
      />

      <motion.div
        className="relative mx-auto mt-14 max-w-[1260px]"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
      >
        <div className="pointer-events-none absolute top-[22px] right-[6%] left-[6%] hidden h-[3px] overflow-hidden rounded-full bg-(color:--gc-ink)/8 lg:block">
          <motion.div
            className="absolute inset-0 origin-left rounded-full"
            style={{ background: TRACK }}
            variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: STAGGER * STEPS.length + 0.4, ease: "easeInOut" } } }}
          />
        </div>

        <ol className="relative grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-4 lg:flex lg:items-start lg:justify-between lg:gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <Fragment key={s.title}>
                <motion.li
                  className="group relative flex flex-col items-center text-center lg:w-[140px]"
                  variants={{
                    hidden: { opacity: 0, y: 26 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.5, delay: i * STAGGER, ease: EASE } },
                  }}
                >
                  <motion.span
                    className="relative z-10 grid size-11 place-items-center rounded-full font-display text-[14px] font-bold text-white ring-[5px] ring-white"
                    style={{ background: s.color, boxShadow: `0 10px 22px ${s.color}55` }}
                    variants={{
                      hidden: { scale: 0.4 },
                      show: { scale: [0.4, 1.15, 1], transition: { duration: 0.6, delay: i * STAGGER + 0.1 } },
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </motion.span>
                  <span
                    className="mt-3 grid size-12 place-items-center rounded-2xl transition-transform duration-300 group-hover:scale-[1.22] group-hover:-rotate-6"
                    style={{ background: `${s.color}14`, color: s.color }}
                  >
                    <Icon size={26} weight="duotone" />
                  </span>
                  <span className="mt-3 block font-display text-[15px] font-semibold text-(color:--gc-ink)">{s.title}</span>
                  <span className="mx-auto mt-1 block max-w-[150px] text-[12.5px] leading-snug text-(color:--gc-body)">{s.text}</span>
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute top-[calc(100%+8px)] left-1/2 z-20 w-[180px] -translate-x-1/2 translate-y-1 rounded-xl bg-(color:--gc-ink) px-3 py-2 text-[12px] leading-snug text-white opacity-0 shadow-[0_14px_30px_rgba(11,31,74,0.3)] transition duration-200 group-hover:translate-y-0 group-hover:opacity-100"
                  >
                    {s.tip}
                  </span>
                </motion.li>
                {i < LAST ? (
                  <motion.li
                    aria-hidden
                    className="hidden pt-[80px] lg:block"
                    style={{ color: s.color }}
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      show: { opacity: 1, x: 0, transition: { duration: 0.4, delay: i * STAGGER + 0.25 } },
                    }}
                  >
                    <ArrowRight size={18} weight="bold" />
                  </motion.li>
                ) : null}
              </Fragment>
            );
          })}
        </ol>
      </motion.div>
    </section>
  );
}
