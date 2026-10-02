import type { Dispatch, SetStateAction } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bank,
  Briefcase,
  Buildings,
  Check,
  Cpu,
  Factory,
  Flask,
  GraduationCap,
  HandCoins,
  Handshake,
  Lightbulb,
  MagnifyingGlass,
  Rocket,
  RocketLaunch,
  Storefront,
  UsersFour,
  type Icon,
} from "@phosphor-icons/react";
import team from "@/assets/partner/build.jpg";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";
import { cn } from "@/lib/utils";
import type { Selection } from "./selection";

type Option = { label: string; icon: Icon };

const REPRESENT: Option[] = [
  { label: "Company", icon: Briefcase },
  { label: "Research Institution", icon: Flask },
  { label: "University", icon: GraduationCap },
  { label: "Startup", icon: RocketLaunch },
  { label: "Government", icon: Bank },
  { label: "Industry Body", icon: UsersFour },
];

const INTERESTS: Option[] = [
  { label: "Technology", icon: Cpu },
  { label: "Research", icon: Flask },
  { label: "Manufacturing", icon: Factory },
  { label: "Education", icon: GraduationCap },
  { label: "Innovation", icon: Lightbulb },
  { label: "Market Access", icon: Storefront },
];

const WANTS: Option[] = [
  { label: "Find a Partner", icon: MagnifyingGlass },
  { label: "Offer Expertise", icon: HandCoins },
  { label: "Start a Joint Initiative", icon: Handshake },
  { label: "Enter a New Market", icon: Rocket },
];

const GROUP_COLORS = ["#1f6fe5", "#16a05a", "#8a3fd6"];

export function BuildSelector({
  reduce,
  value,
  onChange,
}: {
  reduce: boolean;
  value: Selection;
  onChange: Dispatch<SetStateAction<Selection>>;
}) {
  const ready = Boolean(value.represent || value.interests.length || value.want);

  const toggleInterest = (label: string) =>
    onChange((v) => ({
      ...v,
      interests: v.interests.includes(label) ? v.interests.filter((x) => x !== label) : [...v.interests, label],
    }));

  const groups: { title: string; options: Option[]; isOn: (l: string) => boolean; pick: (l: string) => void; cols: string }[] = [
    {
      title: "I represent",
      options: REPRESENT,
      isOn: (l) => value.represent === l,
      pick: (l) => onChange((v) => ({ ...v, represent: v.represent === l ? null : l })),
      cols: "grid-cols-2",
    },
    { title: "I am interested in", options: INTERESTS, isOn: (l) => value.interests.includes(l), pick: toggleInterest, cols: "grid-cols-2" },
    {
      title: "I want to",
      options: WANTS,
      isOn: (l) => value.want === l,
      pick: (l) => onChange((v) => ({ ...v, want: v.want === l ? null : l })),
      cols: "grid-cols-1",
    },
  ];

  return (
    <section id="build" className="relative scroll-mt-16 overflow-hidden bg-[#f6f5ff] px-5 py-20 lg:px-8">
      <div className="relative mx-auto grid max-w-[1320px] items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_440px]">
        <div>
          <SectionHeading
            eyebrow="Your organisation"
            title="Tell Us What You Want to Build"
            sub="Let us understand your organisation and explore relevant partnership opportunities."
            reduce={reduce}
            align="left"
          />

          <div className="mt-8 grid gap-4 md:grid-cols-[1fr_1fr_0.85fr]">
            {groups.map((g, gi) => {
              const color = GROUP_COLORS[gi];
              return (
                <motion.fieldset
                  key={g.title}
                  className="rounded-2xl bg-white p-4 shadow-[0_12px_32px_rgba(11,31,74,0.07)] ring-1 ring-(color:--gc-ink)/6"
                  initial={reduce ? false : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: gi * 0.12, ease: EASE }}
                >
                  <legend className="sr-only">{g.title}</legend>
                  <p className="mb-3 flex items-center gap-2 font-display text-[14.5px] font-semibold text-(color:--gc-ink)">
                    <span className="h-4 w-1 rounded-full" style={{ background: color }} />
                    {g.title}
                  </p>
                  <div className={cn("grid gap-2", g.cols)}>
                    {g.options.map(({ label, icon: Icon }) => {
                      const on = g.isOn(label);
                      return (
                        <motion.button
                          key={label}
                          type="button"
                          aria-pressed={on}
                          onClick={() => g.pick(label)}
                          whileHover={reduce ? undefined : { y: -3 }}
                          whileTap={reduce ? undefined : { scale: 0.96 }}
                          className={cn(
                            "group relative flex min-h-[46px] items-center gap-2 rounded-xl border px-2.5 py-2 text-left text-[12.5px] leading-tight font-medium transition-colors duration-200",
                            on ? "text-white" : "border-(color:--gc-ink)/10 bg-[#f8f9fc] text-(color:--gc-ink-2) hover:border-(color:--gc-ink)/25 hover:bg-white",
                          )}
                          style={on ? { background: color, borderColor: color, boxShadow: `0 10px 22px ${color}40` } : undefined}
                        >
                          <motion.span
                            className="grid size-7 shrink-0 place-items-center rounded-lg"
                            style={on ? { background: "rgba(255,255,255,0.2)" } : { background: `${color}14`, color }}
                            animate={on && !reduce ? { rotate: [0, -10, 0], scale: [1, 1.15, 1] } : { rotate: 0, scale: 1 }}
                            transition={{ duration: 0.4 }}
                          >
                            <Icon size={16} weight="duotone" />
                          </motion.span>
                          {label}
                          {on ? (
                            <motion.span
                              className="absolute -top-1.5 -right-1.5 grid size-4.5 place-items-center rounded-full bg-white shadow"
                              style={{ color }}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <Check size={10} weight="bold" />
                            </motion.span>
                          ) : null}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.fieldset>
              );
            })}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <motion.a
              href="#match"
              className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-(color:--gc-button-a) to-(color:--gc-button-b) py-3 pr-4 pl-6 text-[14.5px] font-semibold text-(color:--gc-ink) shadow-[0_10px_26px_rgba(240,180,41,0.35)] transition hover:-translate-y-[3px]"
              animate={reduce ? undefined : { boxShadow: ["0 10px 26px rgba(240,180,41,0.35)", "0 10px 36px rgba(240,180,41,0.7)", "0 10px 26px rgba(240,180,41,0.35)"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              Find Partnership Opportunities
              <ArrowRight size={18} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
            </motion.a>
            <p className="text-[13px] text-(color:--gc-body)">
              {ready ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-[#16a05a]">
                  <Check size={14} weight="bold" /> Your choices will shape the match below.
                </span>
              ) : (
                "Choose one or more options to personalise your match."
              )}
            </p>
          </div>
        </div>

        <motion.figure
          className="relative hidden overflow-hidden rounded-[24px] shadow-[0_24px_60px_rgba(11,31,74,0.18)] lg:block"
          initial={reduce ? false : { opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <img src={team} alt="International partners discussing a joint initiative" loading="lazy" className="absolute inset-0 h-full w-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--gc-hero-3,#0b0a3a)]/75 via-transparent to-transparent" />
          <figcaption className="absolute inset-x-5 bottom-5 flex items-center gap-3 rounded-2xl bg-white/90 px-4 py-3 backdrop-blur">
            <span className="grid size-9 place-items-center rounded-xl bg-[#8a3fd6]/12 text-[#8a3fd6]">
              <Buildings size={20} weight="duotone" />
            </span>
            <span className="text-[13px] leading-snug text-(color:--gc-ink-2)">
              <b className="block font-display text-[14px] text-(color:--gc-ink)">Facilitated by Government of Karnataka</b>
              Every request is reviewed by a dedicated partnership desk.
            </span>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
