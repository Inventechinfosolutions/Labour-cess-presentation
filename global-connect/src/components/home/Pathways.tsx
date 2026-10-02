import { useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import pathwaysBg from "@/assets/pathways-bg.jpg";
import { SectionHeading } from "@/components/home/SectionHeading";
import { useCardTransition } from "@/lib/pageTransition";
import { PATHWAYS, pathwayHref, type Pathway } from "@/lib/pathways";
import { useT } from "@/theme/context";

/** Parallax drift per card, alternating so the row moves like a wave. */
const DRIFT = [36, -18, 28, -26, 20, -32];

function CardPhoto({ p, reduce }: { p: Pathway; reduce: boolean }) {
  return (
    <div className="relative h-40 overflow-hidden bg-[#dde6f2]">
      <motion.img
        src={p.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        initial={reduce ? false : { scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      />
      <span
        className="absolute inset-x-0 bottom-0 h-1/2 opacity-70 transition-opacity duration-500 group-hover:opacity-90"
        style={{ background: `linear-gradient(to top, ${p.deep}cc, transparent)` }}
      />
      <span className="absolute inset-x-0 bottom-0 h-1" style={{ background: p.color }} />
    </div>
  );
}

function PathwayCard({ p, i, progress, reduce }: { p: Pathway; i: number; progress: MotionValue<number>; reduce: boolean }) {
  const y = useTransform(progress, [0, 1], [DRIFT[i], -DRIFT[i]]);
  const go = useCardTransition();
  const t = useT();
  const Icon = p.icon;

  return (
    <motion.div style={reduce ? undefined : { y }} className="[perspective:900px]">
      <motion.div
        className="h-full"
        initial={reduce ? false : { opacity: 0, y: 70, rotateX: 22, scale: 0.92 }}
        whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ type: "spring", stiffness: 90, damping: 16, delay: i * 0.09 }}
      >
        <Link
          to={pathwayHref(p.id)}
          onClick={(e) => go(e, { image: p.image, title: t(p.page), color: p.color, to: pathwayHref(p.id) })}
          className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_6px_24px_rgba(11,31,74,0.08)] ring-1 ring-(color:--gc-ink)/8 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(11,31,74,0.16)] focus-visible:ring-2 focus-visible:ring-(color:--gc-accent) focus-visible:outline-none"
        >
          <CardPhoto p={p} reduce={reduce} />
          <div className="relative flex flex-1 flex-col px-5 pt-8 pb-5">
            <motion.span
              className="absolute -top-6 left-5 grid size-12 place-items-center rounded-full bg-white shadow-md ring-4 ring-white"
              style={{ color: p.color }}
              initial={reduce ? false : { scale: 0, rotate: -90 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.35 + i * 0.09 }}
            >
              <Icon size={24} weight="fill" />
            </motion.span>
            <h3 className="font-display text-[19px] font-semibold" style={{ color: p.color }}>
              {t(p.title)}
            </h3>
            <p className="mt-1.5 flex-1 text-[14px] leading-relaxed text-(color:--gc-body)">{t(p.text)}</p>
            <span
              className="mt-4 grid size-9 place-items-center rounded-full transition-all duration-300 group-hover:translate-x-1"
              style={{ background: p.soft, color: p.color }}
            >
              <ArrowRight size={16} weight="bold" />
            </span>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  );
}

export function Pathways({ reduce }: { reduce: boolean }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: gridRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], [-40, 40]);

  return (
    <section id="pathways" className="relative isolate scroll-mt-16 overflow-hidden bg-white px-5 pt-14 pb-24 lg:px-8">
      <motion.img
        src={pathwaysBg}
        alt=""
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-[calc(100%+80px)] w-full object-cover"
        style={reduce ? undefined : { y: bgY }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-white to-transparent" />

      <SectionHeading eyebrow="What brings the world to Karnataka?" title="Multiple Pathways. A Stronger Karnataka." reduce={reduce} />

      <div ref={gridRef} className="mx-auto mt-12 grid max-w-[1320px] grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        {PATHWAYS.map((p, i) => (
          <PathwayCard key={p.id} p={p} i={i} progress={scrollYProgress} reduce={reduce} />
        ))}
      </div>
    </section>
  );
}
