import { motion } from "motion/react";
import { ArrowRight, Briefcase, CalendarStar, ChalkboardTeacher, ChartLineUp, Flask, Handshake, type Icon } from "@phosphor-icons/react";
import events from "@/assets/connect/opp-events.jpg";
import invest from "@/assets/connect/opp-invest.jpg";
import mentor from "@/assets/connect/opp-mentor.jpg";
import partner from "@/assets/connect/opp-partner.jpg";
import research from "@/assets/connect/opp-research.jpg";
import talent from "@/assets/connect/opp-talent.jpg";
import { SectionHeading } from "@/components/home/SectionHeading";
import { EASE } from "./shared";

const ITEMS: { title: string; text: string; icon: Icon; color: string; image: string }[] = [
  { title: "Invest", text: "Business and investment opportunities.", icon: ChartLineUp, color: "#1f6fe5", image: invest },
  { title: "Mentor", text: "Support startups and emerging professionals.", icon: ChalkboardTeacher, color: "#8a3fd6", image: mentor },
  { title: "Research", text: "Connect with universities and institutions.", icon: Flask, color: "#0e9c97", image: research },
  { title: "Jobs & Talent", text: "Connect global and Karnataka talent.", icon: Briefcase, color: "#ea6c12", image: talent },
  { title: "Partnerships", text: "Collaborate with institutions.", icon: Handshake, color: "#16a05a", image: partner },
  { title: "Events", text: "Participate in global and Karnataka initiatives.", icon: CalendarStar, color: "#e0335c", image: events },
];

export function ConnectOpportunities({ reduce }: { reduce: boolean }) {
  return (
    <section id="opportunities" className="relative scroll-mt-16 bg-white px-5 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Opportunities"
        title="Stay Connected With Opportunities in Karnataka"
        sub="Explore ways to engage and contribute to Karnataka's growth."
        reduce={reduce}
      />

      <div className="mx-auto mt-12 grid max-w-[1220px] gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((it, i) => {
          const Icon = it.icon;
          return (
            <motion.a
              key={it.title}
              href="#join"
              className="group flex overflow-hidden rounded-[18px] bg-white ring-1 ring-(color:--gc-ink)/8 transition-shadow hover:shadow-[0_18px_40px_rgba(11,31,74,0.14)] hover:ring-(color:--gc-primary)/30"
              initial={reduce ? false : { opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={reduce ? undefined : { y: -5 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: reduce ? 0 : (i % 3) * 0.12, ease: EASE, y: { duration: 0.3 } }}
            >
              <span className="relative min-h-[150px] w-[40%] shrink-0 overflow-hidden">
                <img src={it.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" />
              </span>
              <span className="flex flex-1 flex-col p-4">
                <span className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg text-white" style={{ background: it.color }}>
                    <Icon size={17} weight="bold" />
                  </span>
                  <span className="font-display text-[15px] font-bold tracking-wide text-(color:--gc-ink) uppercase">{it.title}</span>
                </span>
                <span className="mt-2.5 flex-1 text-[13.5px] leading-snug text-(color:--gc-body)">{it.text}</span>
                <span className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: it.color }}>
                  Explore
                  <ArrowRight size={15} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </span>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}
