import { Fragment } from "react";
import { motion } from "motion/react";
import { ArrowRight, Buildings, Handshake, Lightbulb, Plant, UserFocus, type Icon } from "@phosphor-icons/react";
import { SectionHeading } from "@/components/home/SectionHeading";
import { cn } from "@/lib/utils";
import { EASE } from "./shared";

const FLOW: { stage: string; example: string; icon: Icon; color: string }[] = [
  { stage: "Your Expertise", example: "Technology expert", icon: UserFocus, color: "#3fb4ff" },
  { stage: "Karnataka Need", example: "Innovation need", icon: Lightbulb, color: "#7fd3ff" },
  { stage: "Match", example: "Relevant organisation", icon: Buildings, color: "#9fb8ff" },
  { stage: "Collaboration", example: "Mentorship / advisory", icon: Handshake, color: "#ffd77a" },
  { stage: "Impact", example: "Change in Karnataka", icon: Plant, color: "#f0c14a" },
];
const STEP = 0.35;

export function ExperienceImpact({ reduce }: { reduce: boolean }) {
  return (
    <section id="experience" className="relative scroll-mt-16 overflow-hidden bg-[#061536] px-5 py-20 text-white lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_70%_at_15%_20%,rgba(31,111,229,0.35),transparent_60%),radial-gradient(45%_70%_at_90%_90%,rgba(240,193,74,0.2),transparent_60%)]" />
      <div className="relative">
        <SectionHeading
          eyebrow="Your experience matters"
          title="Your Experience Can Help Build Karnataka"
          sub="Connect your global expertise with Karnataka's opportunities and needs."
          reduce={reduce}
          dark
        />

        <motion.ol
          className="mx-auto mt-14 flex max-w-[1120px] flex-col items-center gap-2 md:flex-row md:items-start md:justify-between md:gap-0"
          initial={reduce ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.5 }}
          transition={{ staggerChildren: STEP / 2 }}
        >
          {FLOW.map((f, i) => {
            const Icon = f.icon;
            const last = i === FLOW.length - 1;
            return (
              <Fragment key={f.stage}>
                <motion.li
                  className="flex w-[170px] flex-col items-center text-center"
                  variants={{
                    hidden: { opacity: 0, y: 24, scale: 0.9 },
                    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
                  }}
                >
                  <span
                    className={cn("relative grid place-items-center rounded-full", last ? "size-[96px]" : "size-[78px]")}
                    style={{
                      background: last ? "linear-gradient(145deg,#ffd77a,#e0a91f)" : "rgba(255,255,255,0.06)",
                      boxShadow: last ? "0 18px 44px rgba(240,193,74,0.45)" : `inset 0 0 0 1.5px ${f.color}`,
                      color: last ? "#0b1f4a" : f.color,
                    }}
                  >
                    <Icon size={last ? 42 : 34} weight="duotone" />
                    {last && !reduce ? (
                      <motion.span
                        className="absolute inset-[-8px] rounded-full border-2 border-[#ffd77a]"
                        variants={{ hidden: { opacity: 0 }, show: { opacity: [0, 0.9, 0], scale: [1, 1.3], transition: { delay: 1.4, duration: 1.4 } } }}
                      />
                    ) : null}
                  </span>
                  <span className={cn("mt-4 font-display font-semibold", last ? "text-[19px] text-[#ffd77a]" : "text-[16px]")}>{f.stage}</span>
                  <span className="mt-1 rounded-full bg-white/8 px-3 py-1 text-[12px] text-white/75">{f.example}</span>
                </motion.li>
                {!last ? (
                  <motion.li
                    aria-hidden
                    className="flex items-center md:h-[78px]"
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.3 } } }}
                  >
                    <span className="relative hidden h-[2px] w-14 overflow-hidden rounded-full bg-white/10 md:block lg:w-20">
                      <motion.span
                        className="absolute inset-0 origin-left rounded-full"
                        style={{ background: `linear-gradient(90deg, ${f.color}, ${FLOW[i + 1].color})` }}
                        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.45, ease: "easeOut" } } }}
                      />
                    </span>
                    <ArrowRight size={18} weight="bold" className="rotate-90 text-white/40 md:-ml-1 md:rotate-0" color={FLOW[i + 1].color} />
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
