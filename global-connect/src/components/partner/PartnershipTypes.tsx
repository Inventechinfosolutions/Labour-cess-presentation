import { motion } from "motion/react";
import { ArrowRight, Buildings, Cpu, Factory, Flask, GraduationCap, RocketLaunch, type Icon } from "@phosphor-icons/react";
import academic from "@/assets/partner/type-academic.jpg";
import government from "@/assets/partner/type-government.jpg";
import industry from "@/assets/partner/type-industry.jpg";
import research from "@/assets/partner/type-research.jpg";
import startup from "@/assets/partner/type-startup.jpg";
import technology from "@/assets/partner/type-technology.jpg";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";

const TYPES: { title: string; text: string; icon: Icon; color: string; image: string }[] = [
  { title: "Industry Partnerships", text: "Build, manufacture and scale together.", icon: Factory, color: "#1f6fe5", image: industry },
  { title: "Research Partnerships", text: "Connect researchers, institutions and innovation ecosystems.", icon: Flask, color: "#0e9c97", image: research },
  { title: "Academic Partnerships", text: "Create education, exchange and knowledge programmes.", icon: GraduationCap, color: "#16a05a", image: academic },
  { title: "Technology Partnerships", text: "Bring global technology and expertise to Karnataka.", icon: Cpu, color: "#3b4fd8", image: technology },
  { title: "Government Partnerships", text: "Develop institutional and public-sector collaboration.", icon: Buildings, color: "#ea6c12", image: government },
  { title: "Startup Partnerships", text: "Connect startups with global organisations and markets.", icon: RocketLaunch, color: "#8a3fd6", image: startup },
];

export function PartnershipTypes({ reduce }: { reduce: boolean }) {
  return (
    <section id="types" className="relative scroll-mt-16 bg-gradient-to-b from-white to-[#f6f5ff] px-5 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Partnership types"
        title="What Kind of Partnership?"
        sub="Multiple partnership opportunities to collaborate with Karnataka."
        reduce={reduce}
      />

      <div className="mx-auto mt-12 grid max-w-[1320px] grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-6">
        {TYPES.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.a
              key={t.title}
              href="#build"
              className="group flex flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_10px_30px_rgba(11,31,74,0.08)] ring-1 ring-(color:--gc-ink)/6 transition-shadow duration-300 hover:shadow-[0_22px_46px_rgba(11,31,74,0.17)]"
              initial={reduce ? false : { opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={reduce ? undefined : { y: -8 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.09, ease: EASE }}
            >
              <span className="relative block overflow-hidden">
                <img
                  src={t.image}
                  alt=""
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                />
                <span
                  className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                  style={{ background: t.color }}
                />
              </span>
              <span className="relative flex flex-1 flex-col px-4 pt-8 pb-4">
                <span
                  className="absolute -top-6 left-4 grid size-12 place-items-center rounded-2xl bg-white shadow-[0_8px_20px_rgba(11,31,74,0.15)] transition-colors duration-300"
                  style={{ color: t.color }}
                >
                  <span className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: t.color }} />
                  <Icon size={24} weight="duotone" className="relative transition-colors duration-300 group-hover:text-white" />
                </span>
                <span className="font-display text-[15.5px] leading-snug font-semibold text-(color:--gc-ink)">{t.title}</span>
                <span className="mt-1.5 flex-1 text-[13px] leading-snug text-(color:--gc-body)">{t.text}</span>
                <span
                  className="mt-4 grid size-8 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-2"
                  style={{ background: `${t.color}18`, color: t.color }}
                >
                  <ArrowRight size={15} weight="bold" />
                </span>
              </span>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}
