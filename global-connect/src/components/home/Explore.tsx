import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import pathwaysBg from "@/assets/pathways-bg.jpg";
import { SectionHeading } from "@/components/home/SectionHeading";
import { useCardTransition } from "@/lib/pageTransition";
import { PATHWAYS, pathwayHref } from "@/lib/pathways";

export function Explore({ reduce }: { reduce: boolean }) {
  const go = useCardTransition();
  return (
    <section id="explore" className="relative isolate scroll-mt-16 overflow-hidden bg-[#f5f8fc] px-5 pt-16 pb-24 lg:px-8">
      <img
        src={pathwaysBg}
        alt=""
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full -scale-x-100 object-cover opacity-80"
      />
      <SectionHeading
        eyebrow="Explore"
        title="What would you like to explore?"
        sub="Choose a pathway to start your journey with Karnataka."
        reduce={reduce}
      />

      <div className="mx-auto mt-10 grid max-w-[1320px] grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {PATHWAYS.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.div
              key={p.id}
              initial={reduce ? false : { opacity: 0, y: 90, scale: 0.8, rotate: i % 2 ? 6 : -6 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ type: "spring", stiffness: 110, damping: 13, delay: i * 0.08 }}
            >
              <Link
                to={pathwayHref(p.id)}
                onClick={(e) => go(e, { image: p.image, title: p.page, color: p.color, to: pathwayHref(p.id) })}
                className="group relative flex h-full min-h-[172px] flex-col items-center justify-between overflow-hidden rounded-2xl px-4 pt-5 pb-4 text-center text-white shadow-[0_10px_26px_rgba(11,31,74,0.14)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_36px_rgba(11,31,74,0.22)]"
                style={{ background: `linear-gradient(150deg, ${p.color} 0%, ${p.deep} 100%)` }}
              >
                <span className="pointer-events-none absolute -top-10 -right-10 size-28 rounded-full bg-white/10 transition-transform duration-500 group-hover:scale-125" />
                <span className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-700 group-hover:left-[120%] group-hover:opacity-100" />
                <motion.span
                  className="relative"
                  initial={reduce ? false : { scale: 0, rotate: -120 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ type: "spring", stiffness: 240, damping: 12, delay: 0.3 + i * 0.08 }}
                >
                  <Icon size={30} weight="fill" className="transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-110" />
                </motion.span>
                <span className="relative mt-2 text-[15px] leading-snug">
                  {p.explore[0]}
                  <br />
                  <strong className="font-semibold">{p.explore[1]}</strong>
                </span>
                <span
                  className="relative mt-3 grid size-8 place-items-center rounded-full border border-white/60 transition group-hover:translate-x-1 group-hover:bg-white group-hover:text-[color:var(--c)]"
                  style={{ ["--c" as string]: p.color }}
                >
                  <ArrowRight size={14} weight="bold" />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
