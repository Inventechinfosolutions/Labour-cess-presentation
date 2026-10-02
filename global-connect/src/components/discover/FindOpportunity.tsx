import { motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import people from "@/assets/discover/find.jpg";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";
import { cn } from "@/lib/utils";
import { CATEGORIES, OPPORTUNITIES, type CategoryId } from "./data";

export function FindOpportunity({
  reduce,
  active,
  onPick,
}: {
  reduce: boolean;
  active: CategoryId | "all";
  onPick: (id: CategoryId) => void;
}) {
  return (
    <section id="find" className="relative scroll-mt-16 bg-white px-5 pt-14 pb-16 lg:px-8">
      <div className="mx-auto grid max-w-[1320px] items-center gap-8 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_460px]">
        <div>
          <SectionHeading
            eyebrow="Start here"
            title="Find Your Opportunity"
            sub="Explore opportunities that match your interests, capabilities and goals."
            reduce={reduce}
            align="left"
          />
          <motion.ul
            className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
          >
            {CATEGORIES.map((c, i) => {
              const Icon = c.icon;
              const count = OPPORTUNITIES.filter((o) => o.category === c.id).length;
              const on = active === c.id;
              return (
                <motion.li
                  key={c.id}
                  variants={{
                    hidden: { opacity: 0, y: 24, scale: 0.94 },
                    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, delay: i * 0.06, ease: EASE } },
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onPick(c.id)}
                    aria-pressed={on}
                    className={cn(
                      "group relative flex h-full w-full items-center gap-3 overflow-hidden rounded-2xl border bg-white p-3.5 text-left transition duration-300 hover:-translate-y-1",
                      on ? "shadow-[0_14px_30px_rgba(11,31,74,0.14)]" : "border-(color:--gc-ink)/8 shadow-[0_8px_22px_rgba(11,31,74,0.06)] hover:shadow-[0_16px_32px_rgba(11,31,74,0.12)]",
                    )}
                    style={on ? { borderColor: c.color } : undefined}
                  >
                    <span
                      className="absolute inset-0 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                      style={{ background: `linear-gradient(90deg, ${c.color}12, transparent)` }}
                    />
                    <span
                      className="relative grid size-11 shrink-0 place-items-center rounded-xl transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                      style={{ background: `${c.color}16`, color: c.color }}
                    >
                      <Icon size={24} weight="duotone" />
                    </span>
                    <span className="relative min-w-0 flex-1">
                      <span className="block font-display text-[13.5px] leading-tight font-semibold text-(color:--gc-ink)">{c.label}</span>
                      <span className="mt-0.5 block text-[11.5px] text-(color:--gc-body)">
                        {count} {count === 1 ? "opportunity" : "opportunities"}
                      </span>
                    </span>
                    <ArrowRight
                      size={15}
                      weight="bold"
                      className="relative shrink-0 -translate-x-1 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                      style={{ color: c.color }}
                    />
                  </button>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>

        <motion.figure
          className="relative hidden h-full min-h-[340px] overflow-hidden rounded-[24px] shadow-[0_24px_60px_rgba(11,31,74,0.18)] lg:block"
          initial={reduce ? false : { opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <img src={people} alt="Professionals exploring opportunities on their devices" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1236]/85 via-[#0b1236]/10 to-transparent" />
          <figcaption className="absolute right-5 bottom-5 left-5 font-display text-[16px] leading-snug font-semibold text-white">
            Diverse opportunities across sectors and regions in Karnataka
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
