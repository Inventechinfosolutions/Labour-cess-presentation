import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import aerospace from "@/assets/discover/feat-aerospace.jpg";
import education from "@/assets/discover/feat-education.jpg";
import energy from "@/assets/discover/feat-energy.jpg";
import gcc from "@/assets/discover/feat-gcc.jpg";
import semiconductor from "@/assets/discover/feat-semiconductor.jpg";
import urban from "@/assets/discover/feat-urban.jpg";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";

const AREAS = [
  { title: "Semiconductor Ecosystem", text: "Investment and collaboration opportunities.", image: semiconductor, color: "#3b4fd8", q: "Semiconductor" },
  { title: "Aerospace & Defence", text: "Industry, research and manufacturing opportunities.", image: aerospace, color: "#ea6c12", q: "Aerospace" },
  { title: "Clean Energy", text: "Renewable energy and sustainable solutions.", image: energy, color: "#16a05a", q: "Energy" },
  { title: "Global Capability Centres", text: "Technology and business operations.", image: gcc, color: "#1f6fe5", q: "Global" },
  { title: "Education & Research", text: "Academic and research collaboration.", image: education, color: "#8a3fd6", q: "Research" },
  { title: "Urban & Infrastructure", text: "Smart cities and infrastructure projects.", image: urban, color: "#e0335c", q: "Mobility" },
];

export function FeaturedAreas({ reduce, onPick }: { reduce: boolean; onPick: (q: string) => void }) {
  return (
    <section id="featured" className="relative scroll-mt-16 bg-gradient-to-b from-white to-[#fbf7fb] px-5 pt-4 pb-20 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <SectionHeading eyebrow="Featured" title="Featured Opportunity Areas" sub="Explore key sectors and thematic opportunities in Karnataka." reduce={reduce} align="left" />
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          {AREAS.map((a, i) => (
            <motion.button
              key={a.title}
              type="button"
              onClick={() => onPick(a.q)}
              className="group relative flex flex-col overflow-hidden rounded-[18px] bg-white text-left shadow-[0_10px_28px_rgba(11,31,74,0.08)] ring-1 ring-(color:--gc-ink)/6 transition-shadow duration-300 hover:shadow-[0_20px_44px_rgba(11,31,74,0.16)]"
              initial={reduce ? false : { opacity: 0, y: 30, rotateX: 12 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              whileHover={reduce ? undefined : { y: -6 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.08, ease: EASE }}
              style={{ transformPerspective: 800 }}
            >
              <span className="relative block overflow-hidden">
                <img src={a.image} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]" />
                <span className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" style={{ background: a.color }} />
              </span>
              <span className="flex flex-1 flex-col p-4">
                <span className="font-display text-[14.5px] leading-snug font-semibold text-(color:--gc-ink)">{a.title}</span>
                <span className="mt-1 flex-1 text-[12.5px] leading-snug text-(color:--gc-body)">{a.text}</span>
                <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold opacity-80 transition group-hover:gap-2 group-hover:opacity-100" style={{ color: a.color }}>
                  Explore <ArrowRight size={13} weight="bold" />
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
