import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, ChartLineUp, GraduationCap, Handshake, Lightbulb, UsersThree, type Icon } from "@phosphor-icons/react";
import { PATHWAY_BY_ID, pathwayHref, type PathwayId } from "@/lib/pathways";
import { GoldCircleArrow } from "./parts";
import { EASE } from "./motion";

const TILES: { id: PathwayId; title: string; text: string; icon: Icon }[] = [
  { id: "invest", title: "Invest", text: "Connect capital with Karnataka", icon: ChartLineUp },
  { id: "connect", title: "Kannadigas", text: "Connect the global Kannadiga community", icon: UsersThree },
  { id: "talent", title: "Talent", text: "Connect skills with opportunity", icon: GraduationCap },
  { id: "partner", title: "Partnerships", text: "Build meaningful global relationships", icon: Handshake },
  { id: "discover", title: "Opportunities", text: "Discover what Karnataka has to offer", icon: Lightbulb },
];

export function PathwayTiles({ reduce }: { reduce: boolean }) {
  return (
    <section id="pathways" aria-label="Pathways" className="scroll-mt-[76px] bg-(color:--gc-night)">
      <ul className="grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-5">
        {TILES.map(({ id, title, text, icon: TileIcon }, i) => (
          <motion.li
            key={id}
            className="sm:last:col-span-2 lg:last:col-span-1"
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: i * 0.09, ease: EASE }}
          >
            <Link to={pathwayHref(id)} className="group relative block h-[300px] overflow-hidden lg:h-[330px]">
              <img
                src={PATHWAY_BY_ID[id].image}
                alt=""
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,36,25,0.05)_25%,rgba(6,36,25,0.72)_62%,rgba(6,36,25,0.95)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-5">
                <div className="min-w-0 flex-1 text-white">
                  <TileIcon size={30} weight="duotone" className="text-(color:--gc-gold)" />
                  <p className="mt-2 font-display text-[19px] font-bold tracking-[0.04em] uppercase">{title}</p>
                  <p className="mt-1 text-[14px] leading-snug text-white/85">{text}</p>
                </div>
                <GoldCircleArrow>
                  <ArrowRight size={16} weight="bold" />
                </GoldCircleArrow>
              </div>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-(color:--gc-gold-3) transition-transform duration-500 group-hover:scale-x-100"
              />
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
