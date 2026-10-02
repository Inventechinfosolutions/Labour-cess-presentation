import { motion } from "motion/react";
import {
  Bank,
  Cpu,
  Factory,
  GraduationCap,
  Handshake,
  Heart,
  ListChecks,
  MapPin,
  ShieldCheck,
  RocketLaunch,
  Sparkle,
  Star,
  Target,
  Wrench,
  type Icon,
} from "@phosphor-icons/react";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";
import { INTEREST_PARTNERS, type Selection } from "./selection";

const ORG: { label: string; icon: Icon; key?: keyof Selection }[] = [
  { label: "Expertise", icon: Wrench, key: "represent" },
  { label: "Technology", icon: Cpu },
  { label: "Interests", icon: Heart, key: "interests" },
  { label: "Region", icon: MapPin },
  { label: "Objectives", icon: Target, key: "want" },
];

const PARTNERS: { label: string; icon: Icon; color: string }[] = [
  { label: "Karnataka Government", icon: Bank, color: "#ea6c12" },
  { label: "Industry Clusters", icon: Factory, color: "#1f6fe5" },
  { label: "Universities & Research", icon: GraduationCap, color: "#16a05a" },
  { label: "Startups & Innovation", icon: RocketLaunch, color: "#8a3fd6" },
];

const ASSURANCES: { title: string; text: string; icon: Icon; color: string }[] = [
  { title: "Verified partners", text: "Every organisation is reviewed first.", icon: ShieldCheck, color: "#16a05a" },
  { title: "Guided introductions", text: "A partnership desk joins the first meeting.", icon: Handshake, color: "#8a3fd6" },
  { title: "Clear next steps", text: "Track progress from interest to impact.", icon: ListChecks, color: "#1f6fe5" },
];

function orgValue(sel: Selection, key?: keyof Selection) {
  if (!key) return null;
  const v = sel[key];
  if (Array.isArray(v)) return v.length ? v.join(", ") : null;
  return v;
}

export function FindMatch({ reduce, selection }: { reduce: boolean; selection: Selection }) {
  const matched = new Set(selection.interests.flatMap((i) => INTEREST_PARTNERS[i] ?? []));
  const flowKey = `${selection.represent}-${selection.interests.join()}-${selection.want}`;

  return (
    <div id="match" className="scroll-mt-24">
      <SectionHeading
        eyebrow="Smart matching"
        title="Find the Right Match"
        sub="Our platform connects your organisation with the right partners in Karnataka."
        reduce={reduce}
        align="left"
      />

      <div className="relative mt-8 grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <motion.div
          className="rounded-2xl bg-gradient-to-br from-[#16135a] to-[color:var(--gc-hero-3,#0b0a3a)] p-4 text-white shadow-[0_16px_40px_rgba(var(--gc-ov,11,10,58),0.3)]"
          initial={reduce ? false : { opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <p className="font-display text-[14px] font-semibold">Your Organisation</p>
          <ul className="mt-3 space-y-2">
            {ORG.map(({ label, icon: Icon, key }, i) => {
              const v = orgValue(selection, key);
              return (
                <motion.li
                  key={label}
                  className="flex items-start gap-2 text-[12.5px]"
                  initial={reduce ? false : { opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-md bg-white/10 text-(color:--gc-gold)">
                    <Icon size={13} weight="duotone" />
                  </span>
                  <span className="pt-0.5 leading-tight">
                    {label}
                    {v ? <span className="block text-[11px] text-(color:--gc-gold)">{v}</span> : null}
                  </span>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        <div className="relative flex flex-col items-center px-2 py-4 text-center">
          <svg className="pointer-events-none absolute top-[58px] -left-6 hidden h-4 w-[calc(100%+48px)] sm:block" aria-hidden>
            {[0, 1].map((side) => (
              <line
                key={side}
                x1={side ? "62%" : "0%"}
                x2={side ? "100%" : "38%"}
                y1="8"
                y2="8"
                stroke="#8a3fd6"
                strokeOpacity={0.5}
                strokeWidth={2}
                strokeDasharray="4 6"
                className={reduce ? undefined : "animate-[dash-flow_1.2s_linear_infinite]"}
              />
            ))}
          </svg>
          <motion.div
            key={flowKey}
            className="relative grid size-[118px] place-items-center"
            initial={reduce ? false : { scale: 0.85 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
          >
            <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(138,63,214,0.35),transparent_70%)]" />
            <motion.span
              className="absolute inset-1 rounded-full border-2 border-dashed border-[#8a3fd6]/50"
              animate={reduce ? undefined : { rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            />
            <motion.span
              className="absolute inset-4 rounded-full border border-(color:--gc-accent)/60"
              animate={reduce ? undefined : { rotate: -360 }}
              transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            >
              <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-(color:--gc-accent) shadow-[0_0_8px_#3fb4ff]" />
            </motion.span>
            <motion.span
              className="relative grid size-[64px] place-items-center rounded-full bg-gradient-to-br from-[#5b6cff] to-[#8a3fd6] font-display text-[20px] font-bold text-white shadow-[0_0_36px_rgba(138,63,214,0.6)]"
              animate={reduce ? undefined : { scale: [1, 1.07, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              AI
            </motion.span>
          </motion.div>
          <p className="mt-2 font-display text-[14px] font-semibold text-(color:--gc-ink)">Match Engine</p>
          <p className="max-w-[120px] text-[11.5px] leading-snug text-(color:--gc-body)">Recommends relevant partners</p>
        </div>

        <motion.div
          className="rounded-2xl bg-white p-4 shadow-[0_16px_40px_rgba(11,31,74,0.1)] ring-1 ring-(color:--gc-ink)/6"
          initial={reduce ? false : { opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
        >
          <p className="font-display text-[14px] font-semibold text-(color:--gc-ink)">Potential Partners</p>
          <ul className="mt-3 space-y-2">
            {PARTNERS.map(({ label, icon: Icon, color }, i) => {
              const strong = matched.has(label);
              return (
                <motion.li
                  key={`${label}-${flowKey}`}
                  className="relative flex items-center gap-2 rounded-lg border px-2 py-1.5 text-[12.5px] font-medium text-(color:--gc-ink-2)"
                  style={{ borderColor: strong ? color : "rgba(11,31,74,0.08)", background: strong ? `${color}0f` : undefined }}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.12 }}
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-md" style={{ background: `${color}18`, color }}>
                    <Icon size={13} weight="duotone" />
                  </span>
                  <span className="leading-tight">{label}</span>
                  {strong ? (
                    <span className="ml-auto inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9.5px] font-bold text-white" style={{ background: color }}>
                      <Star size={8} weight="fill" /> Match
                    </span>
                  ) : null}
                </motion.li>
              );
            })}
          </ul>
          {matched.size ? (
            <p className="mt-2 flex items-center gap-1 text-[11px] text-[#8a3fd6]">
              <Sparkle size={12} weight="fill" /> Ranked on your interests.
            </p>
          ) : null}
        </motion.div>
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-3">
        {ASSURANCES.map(({ title, text, icon: Icon, color }, i) => (
          <motion.li
            key={title}
            className="flex items-start gap-3 rounded-2xl bg-[#f6f5ff] p-4"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.45, delay: 0.3 + i * 0.1, ease: EASE }}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white shadow-sm" style={{ color }}>
              <Icon size={19} weight="duotone" />
            </span>
            <span className="leading-snug">
              <span className="block font-display text-[13.5px] font-semibold text-(color:--gc-ink)">{title}</span>
              <span className="text-[12px] text-(color:--gc-body)">{text}</span>
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
