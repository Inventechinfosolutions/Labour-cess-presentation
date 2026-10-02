import { Fragment } from "react";
import { motion } from "motion/react";
import { ArrowRight, Bank, Buildings, Flask, GraduationCap, type Icon } from "@phosphor-icons/react";
import ecosystem from "@/assets/talent/ecosystem.jpg";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";
import { KARNATAKA_DISTRICTS, KARNATAKA_VIEWBOX } from "@/lib/karnatakaMap";
import { cn } from "@/lib/utils";

type Node = { label: string; text: string; icon?: Icon; color: string };
const NODES: Node[] = [
  { label: "Education", text: "Universities and institutions", icon: GraduationCap, color: "#8a3fd6" },
  { label: "Industry", text: "Global employers and partners", icon: Buildings, color: "#0e9c97" },
  { label: "Talent", text: "Skilled professionals and students", color: "#f0a020" },
  { label: "Research", text: "Innovation and research collaboration", icon: Flask, color: "#1f6fe5" },
  { label: "Government", text: "Policies and facilitation", icon: Bank, color: "#ea6c12" },
];
const STEP = 0.22;
const WORDS = ["Global", "Talent", "Stronger", "Karnataka"];

export function Ecosystem({ reduce }: { reduce: boolean }) {
  return (
    <section id="ecosystem" className="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-white to-(color:--gc-surface) px-5 py-20 lg:px-8">
      <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-[1.35fr_1fr]">
        <div>
          <SectionHeading eyebrow="Ecosystem" title="Talent Does Not Move Alone" sub="A strong ecosystem to support your global journey." reduce={reduce} align="left" />

          <motion.ol
            className="mt-10 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-0"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
          >
            {NODES.map((n, i) => {
              const center = !n.icon;
              const Icon = n.icon;
              return (
                <Fragment key={n.label}>
                  <motion.li
                    className={cn(
                      "relative grid flex-1 grid-cols-[auto_1fr] items-center gap-x-3 rounded-2xl px-3 py-3 text-left sm:flex sm:flex-col sm:px-2 sm:py-4 sm:text-center",
                      center
                        ? "bg-gradient-to-b from-[#fff7e6] to-white shadow-[0_18px_40px_rgba(240,160,32,0.25)] ring-1 ring-[#f0a020]/40"
                        : "bg-white shadow-[0_10px_28px_rgba(11,31,74,0.07)] ring-1 ring-(color:--gc-ink)/6",
                    )}
                    variants={{
                      hidden: { opacity: 0, y: 20, scale: 0.92 },
                      show: { opacity: 1, y: 0, scale: center ? 1.06 : 1, transition: { delay: i * STEP, duration: 0.5, ease: EASE } },
                    }}
                  >
                    {center ? (
                      <span className="relative row-span-2 grid size-14 place-items-center">
                        {!reduce ? (
                          <motion.span
                            className="absolute inset-0 rounded-full bg-[#f0a020]/25"
                            animate={{ scale: [0.8, 1.5], opacity: [0.7, 0] }}
                            transition={{ duration: 2, delay: 1.2, repeat: Infinity, ease: "easeOut" }}
                          />
                        ) : null}
                        <svg viewBox={KARNATAKA_VIEWBOX} className="relative h-14 w-auto drop-shadow-[0_6px_10px_rgba(240,160,32,0.4)]" aria-hidden>
                          {KARNATAKA_DISTRICTS.map((d) => (
                            <path key={d.name} d={d.d} fill="#f0a020" stroke="#fff3c8" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
                          ))}
                        </svg>
                      </span>
                    ) : (
                      <span className="row-span-2 grid size-12 place-items-center rounded-xl" style={{ background: `${n.color}14`, color: n.color }}>
                        {Icon ? <Icon size={26} weight="duotone" /> : null}
                      </span>
                    )}
                    <span className="col-start-2 row-start-1 font-display text-[14px] font-semibold text-(color:--gc-ink) sm:mt-2.5">{n.label}</span>
                    <span className="col-start-2 row-start-2 text-[11.5px] leading-snug text-(color:--gc-body) sm:mt-0.5 sm:max-w-[130px]">{n.text}</span>
                  </motion.li>
                  {i < NODES.length - 1 ? (
                    <motion.li
                      aria-hidden
                      className="flex justify-center sm:px-1"
                      variants={{ hidden: { opacity: 0, x: -6 }, show: { opacity: 1, x: 0, transition: { delay: i * STEP + 0.15, duration: 0.3 } } }}
                    >
                      <ArrowRight size={16} weight="bold" className="rotate-90 sm:rotate-0" color={NODES[i + 1].color} />
                    </motion.li>
                  ) : null}
                </Fragment>
              );
            })}
          </motion.ol>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-[28px] shadow-[0_30px_70px_rgba(11,31,74,0.22)] [clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)] max-lg:[clip-path:none]"
          initial={reduce ? false : { opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <img src={ecosystem} alt="Young professionals in front of Bengaluru's heritage and modern skyline" className="aspect-[16/10] w-full -scale-x-100 object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-[linear-gradient(270deg,rgba(var(--gc-ov,6,21,54),0.88)_0%,rgba(var(--gc-ov,6,21,54),0.45)_32%,transparent_55%)]" />
          <ul className="absolute top-1/2 right-6 -translate-y-1/2 text-right">
            {WORDS.map((w, i) => (
              <motion.li
                key={w}
                className={i % 2 ? "font-display text-[22px] leading-tight font-bold text-(color:--gc-gold)" : "font-display text-[22px] leading-tight font-bold text-white"}
                initial={reduce ? false : { opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.12, ease: EASE }}
              >
                {w}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
