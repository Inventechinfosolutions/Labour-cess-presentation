import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChartLineUp,
  ChatsCircle,
  Check,
  ClipboardText,
  Handshake,
  PaperPlaneTilt,
  UserCheck,
  UserPlus,
  type Icon,
} from "@phosphor-icons/react";
import person from "@/assets/partner/track.jpg";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";
import { cn } from "@/lib/utils";

type Stage = { title: string; text: string; detail: string; icon: Icon; when: string };

const STAGES: Stage[] = [
  { title: "Registered", text: "Your organisation profile created", detail: "Your profile is visible to the partnership desk.", icon: UserPlus, when: "12 Aug" },
  { title: "Interest Submitted", text: "Your partnership interest received", detail: "Sectors and goals have been recorded.", icon: ClipboardText, when: "14 Aug" },
  { title: "Partner Identified", text: "Relevant match found", detail: "Three suitable partners have been shortlisted.", icon: UserCheck, when: "21 Aug" },
  { title: "Introduction Made", text: "Connect with the right organisation", detail: "A facilitated meeting is being arranged.", icon: PaperPlaneTilt, when: "Now" },
  { title: "Discussion", text: "Explore details and proposal", detail: "Both sides agree scope, roles and timelines.", icon: ChatsCircle, when: "Next" },
  { title: "Partnership", text: "Joint initiative established", detail: "An agreement is signed and announced.", icon: Handshake, when: "Planned" },
  { title: "Impact", text: "Measurable outcomes", detail: "Outcomes are tracked and shared every quarter.", icon: ChartLineUp, when: "Planned" },
];

const CURRENT = 3;

export function TrackPartnership({ reduce }: { reduce: boolean }) {
  const [open, setOpen] = useState(CURRENT);

  return (
    <section id="track" className="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-white to-[#f6f5ff] px-5 py-20 lg:px-8">
      <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,1fr)_460px]">
        <div>
          <SectionHeading
            eyebrow="Stay informed"
            title="Track Your Partnership"
            sub="A transparent and simple process from interest to impact."
            reduce={reduce}
            align="left"
          />

          <motion.ol
            className="relative mt-10 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 lg:grid-cols-7"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
          >
            <li aria-hidden className="pointer-events-none absolute top-[21px] right-[7%] left-[7%] hidden h-[3px] rounded-full bg-(color:--gc-ink)/8 lg:block">
              <motion.div
                className="absolute inset-y-0 left-0 origin-left rounded-full bg-gradient-to-r from-[#16a05a] to-[#8a3fd6]"
                style={{ width: `${(CURRENT / (STAGES.length - 1)) * 100}%` }}
                variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1.2, ease: "easeInOut" } } }}
              />
            </li>
            {STAGES.map((s, i) => {
              const Icon = s.icon;
              const done = i < CURRENT;
              const now = i === CURRENT;
              const selected = open === i;
              return (
                <motion.li
                  key={s.title}
                  variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { duration: 0.45, delay: i * 0.12, ease: EASE } } }}
                >
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    aria-expanded={selected}
                    className="group flex w-full flex-col items-center text-center"
                  >
                    <span
                      className={cn(
                        "relative grid size-11 place-items-center rounded-full ring-4 ring-white transition-transform duration-300 group-hover:scale-110",
                        done && "bg-[#16a05a] text-white",
                        now && "bg-[#8a3fd6] text-white",
                        !done && !now && "bg-[#eef0f7] text-(color:--gc-muted)",
                        selected && "outline-2 outline-offset-2 outline-[#8a3fd6]",
                      )}
                    >
                      {now && !reduce ? <span className="absolute inset-0 animate-ping rounded-full bg-[#8a3fd6]/40" /> : null}
                      {done ? <Check size={18} weight="bold" /> : <Icon size={20} weight="duotone" />}
                    </span>
                    <span className={cn("mt-2.5 font-display text-[13px] leading-tight font-semibold", now ? "text-[#8a3fd6]" : "text-(color:--gc-ink)")}>
                      {s.title}
                    </span>
                    <span className="mt-1 text-[11.5px] leading-snug text-(color:--gc-body)">{s.text}</span>
                  </button>
                </motion.li>
              );
            })}
          </motion.ol>

          <AnimatePresence mode="wait">
            <motion.div
              key={open}
              className="mt-8 flex items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_12px_30px_rgba(11,31,74,0.08)] ring-1 ring-(color:--gc-ink)/6"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#8a3fd6]/10 text-[#8a3fd6]">
                {(() => {
                  const Icon = STAGES[open].icon;
                  return <Icon size={22} weight="duotone" />;
                })()}
              </span>
              <span>
                <span className="block font-display text-[15px] font-semibold text-(color:--gc-ink)">
                  Stage {open + 1}: {STAGES[open].title}
                </span>
                <span className="mt-0.5 block text-[13.5px] text-(color:--gc-body)">{STAGES[open].detail}</span>
              </span>
              <span
                className={cn(
                  "ml-auto shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold",
                  open < CURRENT && "bg-[#16a05a]/12 text-[#16a05a]",
                  open === CURRENT && "bg-[#8a3fd6]/12 text-[#8a3fd6]",
                  open > CURRENT && "bg-(color:--gc-ink)/6 text-(color:--gc-body)",
                )}
              >
                {open < CURRENT ? "Completed" : open === CURRENT ? "In progress" : "Upcoming"}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <motion.div
          className="relative h-[460px] overflow-hidden rounded-[26px] bg-[color:var(--gc-hero-3,#0b0a3a)] shadow-[0_26px_60px_rgba(var(--gc-ov,11,10,58),0.35)]"
          initial={reduce ? false : { opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <img src={person} alt="A partner reviewing progress on the partnership dashboard" loading="lazy" className="absolute inset-y-0 right-0 h-full w-[70%] object-cover object-[60%_center]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--gc-hero-3,#0b0a3a)] via-[color:var(--gc-hero-3,#0b0a3a)]/80 to-transparent" />
          <motion.div
            className="absolute top-6 bottom-6 left-6 w-[220px] rounded-2xl border border-white/15 bg-white/10 p-4 text-white backdrop-blur-md"
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
          >
            <p className="font-display text-[13.5px] font-semibold">View My Partnership Journey</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#16a05a] to-(color:--gc-gold)"
                initial={reduce ? false : { width: 0 }}
                whileInView={{ width: `${((CURRENT + 0.5) / STAGES.length) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.7, ease: EASE }}
              />
            </div>
            <ul className="mt-3 space-y-1">
              {STAGES.map((s, i) => (
                <li key={s.title}>
                  <button
                    type="button"
                    onClick={() => setOpen(i)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[12px] transition-colors",
                      open === i ? "bg-white/20" : "hover:bg-white/10",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-4 shrink-0 place-items-center rounded-full",
                        i < CURRENT ? "bg-[#16a05a]" : i === CURRENT ? "bg-(color:--gc-gold) text-[color:var(--gc-hero-3,#0b0a3a)]" : "border border-white/40",
                      )}
                    >
                      {i < CURRENT ? <Check size={9} weight="bold" /> : null}
                    </span>
                    <span className={cn("flex-1", i > CURRENT && "text-white/60")}>{s.title}</span>
                    <span className="text-[10px] text-white/55">{s.when}</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
