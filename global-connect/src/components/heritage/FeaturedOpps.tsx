import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import featInvest from "@/assets/heritage/feat-invest.jpg";
import featPartner from "@/assets/heritage/feat-partner.jpg";
import featTalent from "@/assets/heritage/feat-talent.jpg";
import { pathwayHref, type PathwayId } from "@/lib/pathways";
import { GoldCircleArrow, HeritageTitle } from "./parts";
import { EASE, rise } from "./motion";

const FEATURED: { id: PathwayId; title: string; text: string; img: string }[] = [
  { id: "invest", title: "Investment Opportunities", text: "Explore high-potential sectors and projects in Karnataka.", img: featInvest },
  { id: "partner", title: "Partnership Opportunities", text: "Collaborate with institutions, industries and research organisations.", img: featPartner },
  { id: "talent", title: "Talent Opportunities", text: "Connect with skills, researchers and global talent.", img: featTalent },
];

export function FeaturedOpps({ reduce }: { reduce: boolean }) {
  return (
    <section className="bg-[#fffdf8] px-5 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1320px]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <HeritageTitle reduce={reduce} align="left" sub="Explore some of the latest opportunities across investment, partnership and talent.">
            Featured Opportunities
          </HeritageTitle>
          <motion.div {...rise(reduce, 0.2)}>
            <Link
              to={pathwayHref("discover")}
              className="group inline-flex items-center gap-2 text-[14px] font-semibold text-(color:--gc-primary) transition hover:text-(color:--gc-ink)"
            >
              View All Opportunities
              <ArrowRight size={15} weight="bold" className="transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {FEATURED.map((f, i) => (
            <motion.li
              key={f.id}
              initial={reduce ? false : { opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
            >
              <Link
                to={pathwayHref(f.id)}
                className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(12,58,42,0.08)] ring-1 ring-(color:--gc-line) transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(12,58,42,0.16)]"
              >
                <div className="h-[190px] overflow-hidden">
                  <img src={f.img} alt="" loading="lazy" className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
                </div>
                <div className="flex flex-1 items-end gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[18px] font-bold text-(color:--gc-ink)">{f.title}</p>
                    <p className="mt-1.5 min-h-[3.25em] text-[14px] leading-relaxed text-(color:--gc-body)">{f.text}</p>
                  </div>
                  <GoldCircleArrow>
                    <ArrowRight size={16} weight="bold" />
                  </GoldCircleArrow>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
