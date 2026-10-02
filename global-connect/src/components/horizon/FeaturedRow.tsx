import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, ChartBar, GraduationCap, Handshake, type Icon } from "@phosphor-icons/react";
import { pathwayHref, type PathwayId } from "@/lib/pathways";
import { rise } from "@/components/heritage/motion";
import { HZ_COLOR } from "./palette";
import { ArrowDot, HorizonTitle } from "./parts";

const FEATURED: { id: PathwayId; title: string; text: string; icon: Icon; color: string }[] = [
  { id: "invest", title: "Investment Opportunities", text: "High-potential sectors and projects across Karnataka.", icon: ChartBar, color: HZ_COLOR.invest.c },
  { id: "partner", title: "Partnership Opportunities", text: "Collaborate with institutions, industries and research organisations.", icon: Handshake, color: HZ_COLOR.connect.c },
  { id: "talent", title: "Talent Opportunities", text: "Connect with skills, researchers and global talent.", icon: GraduationCap, color: HZ_COLOR.partner.c },
];

export function FeaturedRow({ reduce }: { reduce: boolean }) {
  return (
    <section className="bg-white px-5 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1320px]">
        <HorizonTitle
          reduce={reduce}
          sub="Latest investment, partnership and talent opportunities from across Karnataka."
          aside={
            <Link
              to="/global-connect/discover"
              className="group inline-flex items-center gap-2 text-[14px] font-bold text-(color:--gc-primary) transition hover:text-(color:--gc-ink)"
            >
              View All Opportunities
              <ArrowRight size={15} weight="bold" className="transition-transform group-hover:translate-x-1" />
            </Link>
          }
        >
          Featured Opportunities
        </HorizonTitle>

        <ul className="mt-8 grid gap-4 md:grid-cols-3">
          {FEATURED.map(({ id, title, text, icon: FeatIcon, color }, i) => (
            <motion.li key={title} {...rise(reduce, i * 0.1, 0.4)}>
              <Link
                to={pathwayHref(id)}
                className="group flex h-full items-center gap-4 rounded-2xl border border-(color:--gc-line) bg-white p-5 shadow-[0_8px_22px_rgba(13,34,83,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(13,34,83,0.12)]"
              >
                <span className="relative grid size-14 shrink-0 place-items-center rounded-full text-white" style={{ background: color }}>
                  {!reduce ? (
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      style={{ boxShadow: `0 0 0 2px ${color}` }}
                      animate={{ scale: [1, 1.45], opacity: [0.6, 0] }}
                      transition={{ duration: 2, delay: i * 0.6, repeat: Infinity, repeatDelay: 1.2, ease: "easeOut" }}
                    />
                  ) : null}
                  <FeatIcon size={26} weight="fill" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold text-(color:--gc-ink)">{title}</span>
                  <span className="mt-1 block text-[13px] leading-snug text-(color:--gc-body)">{text}</span>
                </span>
                <ArrowDot color={color} />
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
