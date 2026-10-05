import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, ClipboardText, Lifebuoy, Stamp } from "@phosphor-icons/react";
import { EASE, rise } from "@/components/heritage/motion";
import { SectionHeading } from "@/components/home/SectionHeading";
import { HELP_DESK } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { usePalette } from "./usePalette";

const ACTIONS = [
  { title: "Raise a grievance", text: "See the steps and papers to keep ready.", to: `${HELP_DESK}#grievance`, icon: Lifebuoy },
  { title: "Ask about a scheme", text: "Find state schemes open to NRIs.", to: `${HELP_DESK}#schemes`, icon: ClipboardText },
  { title: "Track a request", text: "Follow your docket from start to reply.", to: `${HELP_DESK}#after`, icon: Stamp },
];

/** Three ways into the NRI Help Desk, shown on the home and Connect pages. */
export function HelpBand({
  reduce,
  id = "help",
  eyebrow = "NRI Help Desk",
  title = "How can we help?",
  sub = "Kannadigas abroad and their families can reach us in three simple ways.",
  className,
}: {
  reduce: boolean;
  id?: string;
  eyebrow?: string;
  title?: string;
  sub?: string;
  className?: string;
}) {
  const palette = usePalette();
  return (
    <section id={id} className={cn("relative isolate scroll-mt-20 overflow-hidden bg-(color:--gc-surface) px-5 py-16 sm:py-20 lg:px-8", className)}>
      <div aria-hidden className="pointer-events-none absolute -right-32 -bottom-40 -z-10 size-[480px] rounded-full border-[40px] border-white/70" />
      <div className="mx-auto grid max-w-[1240px] items-center gap-12 lg:grid-cols-[0.9fr_1.6fr]">
        <div>
          <SectionHeading eyebrow={eyebrow} title={title} sub={sub} reduce={reduce} align="left" />
          <motion.div {...rise(reduce, 0.2)}>
            <Link
              to={HELP_DESK}
              className="group mt-7 inline-flex items-center gap-2 rounded-full bg-(color:--gc-primary) px-5 py-2.5 text-[14px] font-semibold text-white transition hover:bg-(color:--gc-primary-deep)"
            >
              Visit the NRI Help Desk
              <ArrowRight weight="bold" className="size-3.5 transition group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        </div>

        <div className="relative">
          <motion.div
            aria-hidden
            className="absolute top-[46px] right-[16%] left-[16%] hidden h-[2px] origin-left bg-[repeating-linear-gradient(90deg,color-mix(in_srgb,var(--gc-primary)_35%,transparent)_0_8px,transparent_8px_14px)] sm:block"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.1, ease: EASE }}
          />
          <div className="relative grid gap-10 sm:grid-cols-3">
            {ACTIONS.map((a, i) => {
              const Icon = a.icon;
              const color = palette[(i * 3) % palette.length];
              return (
                <motion.div key={a.title} {...rise(reduce, 0.1 + i * 0.1, 0.5)}>
                  <Link to={a.to} className="group flex flex-col items-center text-center">
                    <span
                      className="relative grid size-[92px] place-items-center rounded-full bg-white transition duration-300 group-hover:-translate-y-1"
                      style={{ boxShadow: `inset 0 0 0 2px color-mix(in srgb, ${color} 28%, transparent), 0 18px 34px -20px rgba(10,30,70,.5)` }}
                    >
                      <span className="grid size-[66px] place-items-center rounded-full text-white" style={{ background: color }}>
                        <Icon weight="duotone" className="size-8" />
                      </span>
                    </span>
                    <span className="mt-5 inline-flex items-center gap-1.5 font-display text-[17px] font-bold text-(color:--gc-ink) group-hover:text-(color:--gc-primary)">
                      {a.title}
                      <ArrowRight weight="bold" className="size-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                    <span className="mt-1.5 max-w-[220px] text-[13.5px] leading-relaxed text-(color:--gc-body)">{a.text}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
