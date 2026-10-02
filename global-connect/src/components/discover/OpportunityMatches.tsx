import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { ArrowRight, BookmarkSimple, FileText, Heart, LinkSimple, type Icon } from "@phosphor-icons/react";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";
import { CATEGORY_BY_ID, OPPORTUNITY_BY_ID } from "./data";

const MATCHES = [
  { id: "biotech", score: 94, label: "AI Research Collaboration" },
  { id: "energy", score: 87, label: "Clean Energy Investment" },
  { id: "manufacturing", score: 81, label: "Advanced Manufacturing" },
];

function Ring({ score, run, reduce, color }: { score: number; run: boolean; reduce: boolean; color: string }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <span className="relative grid size-[52px] shrink-0 place-items-center">
      <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
        <circle cx={24} cy={24} r={r} fill="none" stroke="#eef0f7" strokeWidth={4} />
        <motion.circle
          cx={24}
          cy={24}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={reduce ? false : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: run || reduce ? c * (1 - score / 100) : c }}
          transition={{ duration: 1.2, ease: EASE }}
        />
      </svg>
      <span className="font-display text-[12px] leading-none font-bold text-(color:--gc-ink)">
        <Count to={score} run={run} reduce={reduce} />%
      </span>
    </span>
  );
}

function Count({ to, run, reduce }: { to: number; run: boolean; reduce: boolean }) {
  const [n, setN] = useState(reduce ? to : 0);
  const prev = useRef(reduce ? to : 0);
  useEffect(() => {
    if (reduce || !run) return;
    const ctrl = animate(prev.current, to, { duration: 1, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    prev.current = to;
    return () => ctrl.stop();
  }, [to, run, reduce]);
  return <>{reduce ? to : n}</>;
}

export function OpportunityMatches({ reduce, savedCount }: { reduce: boolean; savedCount: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  const space: { label: string; value: number; icon: Icon; color: string }[] = [
    { label: "Saved", value: savedCount, icon: BookmarkSimple, color: "#e0335c" },
    { label: "Interested", value: 5, icon: Heart, color: "#ea6c12" },
    { label: "Applications", value: 3, icon: FileText, color: "#1f6fe5" },
    { label: "Active Connections", value: 2, icon: LinkSimple, color: "#16a05a" },
  ];

  return (
    <div ref={ref} id="matches" className="scroll-mt-24">
      <SectionHeading eyebrow="For you" title="Your Opportunity Matches" sub="Based on your profile, we found relevant opportunities for you." reduce={reduce} align="left" />

      <ul className="mt-6 space-y-3">
        {MATCHES.map((m, i) => {
          const o = OPPORTUNITY_BY_ID[m.id];
          const cat = CATEGORY_BY_ID[o.category];
          return (
            <motion.li
              key={m.id}
              initial={reduce ? false : { opacity: 0, x: 30 }}
              animate={inView || reduce ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.12, ease: EASE }}
            >
              <a
                href="#results"
                className="group flex items-center gap-3 rounded-2xl bg-white p-2.5 pr-3 shadow-[0_10px_26px_rgba(11,31,74,0.07)] ring-1 ring-(color:--gc-ink)/6 transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(11,31,74,0.13)]"
              >
                <Ring score={m.score} run={inView} reduce={reduce} color={cat.color} />
                <img src={o.image} alt="" loading="lazy" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-display text-[14px] font-semibold text-(color:--gc-ink)">{m.label}</span>
                  <span className="block truncate text-[12px] text-(color:--gc-body)">
                    {o.location} · {cat.tag}
                  </span>
                </span>
                <span
                  className="grid size-8 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:translate-x-1"
                  style={{ background: `${cat.color}16`, color: cat.color }}
                >
                  <ArrowRight size={14} weight="bold" />
                </span>
              </a>
            </motion.li>
          );
        })}
      </ul>
      <a href="#results" className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-(color:--gc-primary-deep) hover:gap-2.5" style={{ transition: "gap 0.3s" }}>
        View All Matched Opportunities <ArrowRight size={13} weight="bold" />
      </a>

      <motion.div
        className="mt-6 rounded-2xl bg-gradient-to-br from-[#fff6f8] to-[#f5f3ff] p-5 ring-1 ring-[#e0335c]/10"
        initial={reduce ? false : { opacity: 0, y: 20 }}
        animate={inView || reduce ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, delay: 0.5, ease: EASE }}
      >
        <p className="font-display text-[16px] font-semibold text-(color:--gc-ink)">Your Opportunity Space</p>
        <p className="text-[12.5px] text-(color:--gc-body)">Track and manage your opportunities.</p>
        <ul className="mt-4 grid grid-cols-4 gap-2">
          {space.map(({ label, value, icon: Icon, color }) => (
            <li key={label} className="text-center">
              <span className="mx-auto grid size-10 place-items-center rounded-xl bg-white shadow-sm" style={{ color }}>
                <Icon size={20} weight="duotone" />
              </span>
              <span className="mt-1.5 block font-display text-[20px] leading-none font-bold text-(color:--gc-ink)">
                <Count to={value} run={inView} reduce={reduce} />
              </span>
              <span className="mt-1 block text-[11px] leading-tight text-(color:--gc-body)">{label}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
