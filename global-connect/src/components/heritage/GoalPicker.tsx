import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, ChartLineUp, GraduationCap, Handshake, Lightbulb, UsersThree, type Icon } from "@phosphor-icons/react";
import whyConnect from "@/assets/heritage/why-connect.jpg";
import whyDiscover from "@/assets/heritage/why-discover.jpg";
import whyInvest from "@/assets/heritage/why-invest.jpg";
import whyPartner from "@/assets/heritage/why-partner.jpg";
import whyTalent from "@/assets/heritage/why-talent.jpg";
import { pathwayHref, type PathwayId } from "@/lib/pathways";
import { HeritageTitle } from "./parts";
import { EASE } from "./motion";

const GOALS: { id: PathwayId; lead: string; goal: string; icon: Icon; img: string }[] = [
  { id: "invest", lead: "I want to", goal: "invest", icon: ChartLineUp, img: whyInvest },
  { id: "connect", lead: "I want to connect", goal: "with Kannadigas", icon: UsersThree, img: whyConnect },
  { id: "talent", lead: "I am looking", goal: "for talent", icon: GraduationCap, img: whyTalent },
  { id: "partner", lead: "I want to build", goal: "a partnership", icon: Handshake, img: whyPartner },
  { id: "discover", lead: "I want to explore", goal: "opportunities", icon: Lightbulb, img: whyDiscover },
];

export function GoalPicker({ reduce }: { reduce: boolean }) {
  return (
    <section id="goals" className="scroll-mt-[76px] bg-[#fffdf8] px-5 py-16 lg:px-8 lg:py-20">
      <HeritageTitle reduce={reduce} sub="Choose your goal and start your journey.">
        What Brings You to Karnataka?
      </HeritageTitle>

      <ul className="mx-auto mt-10 grid max-w-[1320px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {GOALS.map(({ id, lead, goal, icon: GoalIcon, img }, i) => (
          <motion.li
            key={id}
            initial={reduce ? false : { opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
          >
            <Link
              to={pathwayHref(id)}
              className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(12,58,42,0.08)] ring-1 ring-(color:--gc-line) transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(12,58,42,0.16)] hover:ring-(color:--gc-gold-3)/60"
            >
              <div className="flex flex-1 flex-col items-center px-5 pt-6 pb-5 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-(color:--gc-primary-soft) text-(color:--gc-primary) transition-colors group-hover:bg-(color:--gc-navy) group-hover:text-(color:--gc-gold)">
                  <GoalIcon size={24} weight="duotone" />
                </span>
                <p className="mt-3 text-[15px] leading-snug text-(color:--gc-ink-2)">
                  {lead}
                  <br />
                  <span className="font-bold text-(color:--gc-ink)">{goal}</span>
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-(color:--gc-gold-4) opacity-0 transition group-hover:opacity-100">
                  Start here <ArrowRight size={12} weight="bold" />
                </span>
              </div>
              <div className="h-[120px] overflow-hidden">
                <img src={img} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.07]" />
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
