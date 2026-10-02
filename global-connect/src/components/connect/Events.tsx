import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import cultural from "@/assets/connect/ev-cultural.jpg";
import investor from "@/assets/connect/ev-investor.jpg";
import knowledge from "@/assets/connect/ev-knowledge.jpg";
import summit from "@/assets/connect/ev-summit.jpg";
import { SectionHeading } from "@/components/home/SectionHeading";
import { EASE } from "./shared";

const EVENTS = [
  { title: "Global Karnataka Summit", tag: "Summit", image: summit, color: "#1f6fe5" },
  { title: "Investor Meets", tag: "Investment", image: investor, color: "#16a05a" },
  { title: "Kannada Cultural Events", tag: "Culture", image: cultural, color: "#e0335c" },
  { title: "Knowledge Sessions", tag: "Knowledge", image: knowledge, color: "#8a3fd6" },
];

export function Events({ reduce }: { reduce: boolean }) {
  return (
    <section id="events" className="relative scroll-mt-16 bg-white px-5 py-20 lg:px-8">
      <SectionHeading eyebrow="Events & engagement" title="Be Part of the Conversation" sub="Join gatherings that bring the global Kannadiga community together." reduce={reduce} />

      <div className="-mx-5 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:mx-auto sm:grid sm:max-w-[1220px] sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {EVENTS.map((e, i) => (
          <motion.a
            key={e.title}
            href="#join"
            className="group relative block aspect-[3/4] w-[72%] shrink-0 snap-center overflow-hidden rounded-[20px] sm:w-auto"
            initial={reduce ? false : { opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={reduce ? undefined : { y: -6 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.12, ease: EASE, y: { duration: 0.3 } }}
          >
            <img src={e.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]" />
            <span className="absolute inset-0 bg-gradient-to-t from-(color:--gc-navy) via-(color:--gc-navy)/30 to-transparent" />
            <span className="absolute top-4 left-4 rounded-full px-3 py-1 text-[11.5px] font-semibold text-white" style={{ background: e.color }}>
              {e.tag}
            </span>
            <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
              <span className="font-display text-[18px] leading-tight font-semibold">{e.title}</span>
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur transition-transform duration-300 group-hover:translate-x-1.5">
                <ArrowRight size={16} weight="bold" />
              </span>
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
