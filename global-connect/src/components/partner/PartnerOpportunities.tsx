import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import education from "@/assets/partner/opp-education.jpg";
import manufacturing from "@/assets/partner/opp-manufacturing.jpg";
import research from "@/assets/partner/opp-research.jpg";
import semiconductor from "@/assets/partner/opp-semiconductor.jpg";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";

const OPPS = [
  { title: "Semiconductor Ecosystem", text: "Explore collaboration opportunities across Karnataka.", image: semiconductor, color: "#e0a91f" },
  { title: "Advanced Manufacturing", text: "Connect with industries, technology providers and institutions.", image: manufacturing, color: "#ea6c12" },
  { title: "Research & Innovation", text: "Discover opportunities for joint research and innovation.", image: research, color: "#1f6fe5" },
  { title: "Global Education", text: "Build academic and knowledge partnerships.", image: education, color: "#16a05a" },
];

export function PartnerOpportunities({ reduce }: { reduce: boolean }) {
  return (
    <div id="opportunities" className="scroll-mt-24">
      <SectionHeading eyebrow="Focus areas" title="Partnership Opportunities" sub="Explore key areas for collaboration." reduce={reduce} align="left" />
      <div className="-mx-5 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 xl:gap-3">
        {OPPS.map((o, i) => (
          <motion.a
            key={o.title}
            href="#track"
            className="group flex w-[70vw] max-w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(11,31,74,0.08)] ring-1 ring-(color:--gc-ink)/6 transition-shadow duration-300 hover:shadow-[0_22px_44px_rgba(11,31,74,0.16)] sm:w-auto sm:max-w-none"
            initial={reduce ? false : { opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={reduce ? undefined : { y: -6 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.1, ease: EASE }}
          >
            <span className="relative block overflow-hidden">
              <img src={o.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]" />
              <span className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </span>
            <span className="flex flex-1 flex-col p-4 xl:p-3.5">
              <span className="font-display text-[15px] leading-snug font-semibold text-(color:--gc-ink) xl:text-[14px]">{o.title}</span>
              <span className="mt-1.5 flex-1 text-[12.5px] leading-snug text-(color:--gc-body)">{o.text}</span>
              <span
                className="mt-3 grid size-8 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-2"
                style={{ background: `${o.color}1c`, color: o.color }}
              >
                <ArrowRight size={15} weight="bold" />
              </span>
            </span>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
