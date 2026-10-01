import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CaretDown, Check } from "@phosphor-icons/react";
import track from "@/assets/invest/track.jpg";
import { SectionHeading } from "@/components/home/SectionHeading";
import { cn } from "@/lib/utils";
import { EASE } from "./shared";

type Status = "done" | "current" | "upcoming";

const STAGES: { title: string; status: Status; info: string }[] = [
  { title: "Profile Completed", status: "done", info: "Your organisation and contact details are verified and saved." },
  { title: "Investment Interest Submitted", status: "done", info: "Your sector, location and investment range are shared with the team." },
  { title: "Government Team Connected", status: "current", info: "A relationship officer is assigned and the right departments are informed." },
  { title: "Proposal Under Discussion", status: "upcoming", info: "Your proposal is reviewed together with the departments concerned." },
  { title: "Facilitation", status: "upcoming", info: "Land, approvals and incentives are coordinated through one team." },
  { title: "Project Implementation", status: "upcoming", info: "Progress on the ground is tracked with clear milestones." },
  { title: "Expansion", status: "upcoming", info: "Support continues as you grow and expand in Karnataka." },
];

const LABEL: Record<Status, string> = { done: "Completed", current: "In Progress", upcoming: "Upcoming" };
const CURRENT = STAGES.findIndex((s) => s.status === "current");
export function TrackJourney({ reduce }: { reduce: boolean }) {
  const [open, setOpen] = useState(CURRENT);

  return (
    <section id="track" className="relative scroll-mt-16 bg-white px-5 py-20 lg:px-8">
      <div className="mx-auto grid max-w-[1220px] items-center gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <SectionHeading
            eyebrow="Transparent progress"
            title="Track Your Journey"
            sub="Know what happens next with a clear and transparent process."
            reduce={reduce}
            align="left"
          />

          <div className="mt-8">
            <ol>
              {STAGES.map((s, i) => (
                <Stage key={s.title} s={s} i={i} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} reduce={reduce} />
              ))}
            </ol>
          </div>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-[28px] shadow-[0_30px_70px_rgba(11,31,74,0.2)]"
          initial={reduce ? false : { opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <img src={track} alt="An investor reviewing a project journey on a digital display" className="aspect-[4/3] w-full object-cover" loading="lazy" />
          <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-[#061536]/70 p-4 text-white backdrop-blur-md sm:inset-x-6 sm:bottom-6">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-display font-semibold">My Investment Journey</span>
              <span className="text-white/70">
                Stage {CURRENT + 1} of {STAGES.length}
              </span>
            </div>
            <div className="mt-3 flex gap-1.5">
              {STAGES.map((s, i) => (
                <motion.span
                  key={s.title}
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    s.status === "done" ? "bg-[#5fe0a0]" : s.status === "current" ? "bg-[#3fb4ff]" : "bg-white/20",
                  )}
                  initial={reduce ? false : { scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                />
              ))}
            </div>
            <p className="mt-2.5 text-[12.5px] text-white/80">Now: {STAGES[CURRENT].title}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stage({
  s,
  i,
  open,
  onToggle,
  reduce,
}: {
  s: (typeof STAGES)[number];
  i: number;
  open: boolean;
  onToggle: () => void;
  reduce: boolean;
}) {
  const done = s.status === "done";
  const current = s.status === "current";

  return (
    <motion.li
      className="relative"
      initial={reduce ? false : { opacity: 0, x: -18 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.8 }}
      transition={{ duration: 0.45, delay: i * 0.1, ease: EASE }}
    >
      {i < STAGES.length - 1 ? (
        <span aria-hidden className="absolute top-[42px] -bottom-[6px] left-[17px] w-0.5 bg-[#e6ebf3]">
          {i < CURRENT ? (
            <motion.span
              className="absolute inset-0 origin-top bg-gradient-to-b from-[#16a05a] to-[#1f9a7a]"
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.25, ease: "easeInOut" }}
            />
          ) : null}
        </span>
      ) : null}
      <button type="button" onClick={onToggle} aria-expanded={open} className="group flex min-h-[64px] w-full items-start gap-4 text-left">
        <span
          className={cn(
            "relative mt-1.5 grid size-9 shrink-0 place-items-center rounded-full ring-4 ring-white",
            done && "bg-[#16a05a] text-white",
            current && "bg-[#1f6fe5]",
            s.status === "upcoming" && "border-2 border-[#cfd7e4] bg-white",
          )}
        >
          {done ? <Check size={16} weight="bold" /> : null}
          {current ? <span className="size-2.5 rounded-full bg-white" /> : null}
          {current && !reduce ? (
            <motion.span
              className="absolute inset-0 rounded-full bg-[#1f6fe5]"
              animate={{ scale: [1, 1.7], opacity: [0.45, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          ) : null}
        </span>
        <span className="flex-1 pt-2">
          <span className="flex items-center gap-3">
            <span className={cn("text-[15.5px] font-semibold", s.status === "upcoming" ? "text-[#8a97ad]" : "text-[#0b1f4a]")}>{s.title}</span>
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap",
                done && "bg-[#e6f6ee] text-[#16a05a]",
                current && "bg-[#e7f0ff] text-[#1f6fe5]",
                s.status === "upcoming" && "bg-[#f1f4f8] text-[#8a97ad]",
              )}
            >
              {LABEL[s.status]}
            </span>
            <CaretDown size={14} className={cn("ml-auto text-[#8a97ad] transition-transform", open && "rotate-180")} />
          </span>
          <AnimatePresence initial={false}>
            {open ? (
              <motion.span
                className="block overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <span className="mt-2 mb-3 block rounded-xl bg-[#f4f8fd] px-4 py-3 text-[13.5px] leading-relaxed text-[#4a5a78]">{s.info}</span>
              </motion.span>
            ) : null}
          </AnimatePresence>
        </span>
      </button>
    </motion.li>
  );
}
