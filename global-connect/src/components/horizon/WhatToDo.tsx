import { useRef } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ChartBar, GraduationCap, Handshake, Lightbulb, UsersThree, type Icon } from "@phosphor-icons/react";
import { pathwayHref, type PathwayId } from "@/lib/pathways";
import { rise } from "@/components/heritage/motion";
import { HZ_COLOR } from "./palette";
import { ArrowDot, HorizonTitle, PrevNext } from "./parts";

const GOALS: { id: PathwayId; label: [string, string]; icon: Icon }[] = [
  { id: "invest", label: ["Invest", "in Karnataka"], icon: ChartBar },
  { id: "connect", label: ["Connect with", "Kannadigas"], icon: UsersThree },
  { id: "talent", label: ["Find", "Global Talent"], icon: GraduationCap },
  { id: "partner", label: ["Build a", "Partnership"], icon: Handshake },
  { id: "discover", label: ["Explore", "Opportunities"], icon: Lightbulb },
];

export function WhatToDo({ reduce }: { reduce: boolean }) {
  const rowRef = useRef<HTMLUListElement>(null);
  const scroll = (dir: number) => rowRef.current?.scrollBy({ left: dir * 240, behavior: reduce ? "auto" : "smooth" });

  return (
    <section id="goals" className="bg-(color:--gc-surface) px-5 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1320px]">
        <HorizonTitle reduce={reduce} sub="Choose your goal and start your journey." aside={<PrevNext onPrev={() => scroll(-1)} onNext={() => scroll(1)} />}>
          What Would You Like to Do?
        </HorizonTitle>

        <ul ref={rowRef} className="-mx-5 mt-8 flex snap-x gap-4 overflow-x-auto px-5 pt-2 pb-4 [scrollbar-width:none] xl:mx-0 xl:grid xl:grid-cols-5 xl:overflow-visible xl:px-0">
          {GOALS.map(({ id, label, icon: GoalIcon }, i) => {
            const { c, soft } = HZ_COLOR[id];
            return (
              <motion.li key={id} className="w-[230px] shrink-0 snap-start xl:w-auto" {...rise(reduce, i * 0.07, 0.4)}>
                <Link
                  to={pathwayHref(id)}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border border-(color:--gc-line) bg-white p-4 shadow-[0_8px_20px_rgba(13,34,83,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(13,34,83,0.12)]"
                >
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1 origin-bottom scale-y-0 transition-transform duration-300 group-hover:scale-y-100"
                    style={{ background: c }}
                  />
                  <motion.span
                    className="grid size-12 shrink-0 place-items-center rounded-xl"
                    style={{ background: soft, color: c }}
                    animate={reduce ? undefined : { rotate: [0, -8, 8, 0] }}
                    transition={{ duration: 1.2, delay: 1 + i * 0.6, repeat: Infinity, repeatDelay: 5 }}
                  >
                    <GoalIcon size={26} weight="duotone" />
                  </motion.span>
                  <span className="min-w-0 flex-1 text-[14px] leading-tight font-bold text-(color:--gc-ink)">
                    {label[0]}
                    <br />
                    {label[1]}
                  </span>
                  <ArrowDot color={c} />
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
