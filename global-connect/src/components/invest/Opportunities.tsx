import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, MapPin } from "@phosphor-icons/react";
import aerospace from "@/assets/invest/opp-aerospace.jpg";
import energy from "@/assets/invest/opp-energy.jpg";
import manufacturing from "@/assets/invest/opp-manufacturing.jpg";
import { SectionHeading } from "@/components/home/SectionHeading";
import { pathwayHref } from "@/lib/pathways";
import { EASE } from "./shared";

const OPPORTUNITIES = [
  {
    sector: "Advanced Manufacturing",
    location: "Bengaluru",
    text: "Precision engineering, electronics and smart factory clusters with ready supply chains.",
    image: manufacturing,
    color: "#3fb4ff",
  },
  {
    sector: "Aerospace & Defence",
    location: "Bengaluru / Mysuru",
    text: "A mature aerospace ecosystem with research, suppliers and skilled engineers.",
    image: aerospace,
    color: "#ffcf6b",
  },
  {
    sector: "Clean Energy",
    location: "Across Karnataka",
    text: "Solar, wind and green hydrogen opportunities supported by strong renewable capacity.",
    image: energy,
    color: "#5fe0a0",
  },
];

export function Opportunities({ reduce }: { reduce: boolean }) {
  return (
    <section id="opportunities" className="relative scroll-mt-16 overflow-hidden bg-(color:--gc-navy) px-5 py-20 text-white lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_85%_0%,rgba(31,111,229,0.35),transparent_60%),radial-gradient(50%_60%_at_0%_100%,rgba(240,193,74,0.12),transparent_60%)]" />
      <div className="relative mx-auto max-w-[1220px]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            eyebrow="Opportunities"
            title="Discover Relevant Opportunities"
            sub="The platform helps you find opportunities that match your interest."
            reduce={reduce}
            dark
            align="left"
          />
          <Link
            to={pathwayHref("discover")}
            className="group inline-flex w-fit items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-[14px] font-semibold transition hover:border-white hover:bg-white/10"
          >
            View All Opportunities
            <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="-mx-5 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 md:pb-0">
          {OPPORTUNITIES.map((o, i) => (
            <motion.a
              key={o.sector}
              href="#conversation"
              className="group flex w-[82%] shrink-0 snap-center flex-col overflow-hidden rounded-[20px] border border-white/10 bg-white/[0.06] backdrop-blur transition-colors hover:border-white/35 md:w-auto"
              initial={reduce ? false : { opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              whileHover={reduce ? undefined : { y: -6 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.55, delay: reduce ? 0 : i * 0.15, ease: EASE, y: { duration: 0.3 } }}
            >
              <span className="relative block overflow-hidden">
                <img
                  src={o.image}
                  alt=""
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: o.color }} />
              </span>
              <span className="flex flex-1 flex-col p-5">
                <span className="font-display text-[19px] font-semibold">{o.sector}</span>
                <span className="mt-1 flex items-center gap-1.5 text-[13px] text-white/65">
                  <MapPin size={14} weight="fill" style={{ color: o.color }} />
                  {o.location}
                </span>
                <span className="mt-3 flex-1 text-[14px] leading-relaxed text-white/80">{o.text}</span>
                <span className="mt-5 flex items-center gap-2 text-[13.5px] font-semibold" style={{ color: o.color }}>
                  Learn more
                  <ArrowRight size={16} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </span>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
