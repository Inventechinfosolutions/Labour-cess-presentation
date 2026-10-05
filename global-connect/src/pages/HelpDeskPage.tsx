import { motion, useReducedMotion } from "motion/react";
import { CaretDown, CheckCircle, Circle, Clock } from "@phosphor-icons/react";
import { EASE, rise } from "@/components/heritage/motion";
import { SectionHeading } from "@/components/home/SectionHeading";
import { HelpArt } from "@/components/nri/art";
import { DocketJourney } from "@/components/nri/DocketJourney";
import { ConceptNote, IconStamp, NriShell, PageHero, SampleTag, Section, StampFlow } from "@/components/nri/parts";
import { usePalette } from "@/components/nri/usePalette";
import { ASK_STEPS, CATEGORIES, CHANNELS, CHECKLIST, FAQS, GRIEVANCE_STEPS, SAMPLE_DOCKET, SAMPLE_TIMELINE, SCHEMES } from "@/lib/nri";

const MAX_DAYS = 30;

const ACK_FIELDS = [
  { label: "Docket number", value: SAMPLE_DOCKET },
  { label: "Received on", value: "02 March 2026" },
  { label: "Category", value: "Property and land" },
  { label: "Forwarded to", value: "Revenue Department" },
  { label: "Reply expected by", value: "01 April 2026" },
];

export function HelpDeskPage() {
  const reduce = useReducedMotion() ?? false;
  const palette = usePalette();

  return (
    <NriShell reduce={reduce}>
      <PageHero
        eyebrow="NRI Help Desk"
        title={
          <>
            Help for Kannadigas,
            <br />
            Wherever You Live
          </>
        }
        sub="Raise a concern, ask about a state scheme and follow every step. This page explains how the Help Desk works."
        chips={[
          { label: "Raise a grievance", to: "#grievance" },
          { label: "Ask about a scheme", to: "#schemes" },
          { label: "Track a request", to: "#after" },
        ]}
        art={<HelpArt palette={palette} reduce={reduce} />}
        reduce={reduce}
      />
      <ConceptNote reduce={reduce}>
        <strong className="text-(color:--gc-ink)">Concept portal.</strong> This page explains how the Help Desk will work. Online forms
        and tracking are not live yet. All numbers and names shown are samples.
      </ConceptNote>

      <Section id="grievance">
        <SectionHeading eyebrow="Grievances" title="How to Raise a Grievance" sub="Four simple steps. Every concern gets a docket number." reduce={reduce} />
        <StampFlow items={GRIEVANCE_STEPS} palette={palette} reduce={reduce} className="mt-14" />

        <div className="mt-20 grid gap-14 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <motion.h3 className="font-display text-[22px] font-bold text-(color:--gc-ink)" {...rise(reduce)}>
              Categories and indicative timelines
            </motion.h3>
            <p className="mt-1 text-[14px] text-(color:--gc-muted)">Days for a first reply. Final timelines to be notified.</p>
            <ul className="mt-6 space-y-4">
              {CATEGORIES.map((c, i) => {
                const Icon = c.icon;
                const color = palette[i % palette.length];
                return (
                  <motion.li key={c.title} className="grid grid-cols-[40px_1fr_auto] items-center gap-4" {...rise(reduce, 0.06 * i, 0.6)}>
                    <span className="grid size-10 place-items-center rounded-full text-white" style={{ background: color }}>
                      <Icon weight="duotone" className="size-5" />
                    </span>
                    <div>
                      <p className="text-[14.5px] font-semibold text-(color:--gc-ink)">{c.title}</p>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-(color:--gc-line-2)">
                        <motion.div
                          className="h-full origin-left rounded-full"
                          style={{ width: `${(c.days / MAX_DAYS) * 100}%`, background: color }}
                          initial={reduce ? false : { scaleX: 0 }}
                          whileInView={{ scaleX: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, delay: 0.2 + i * 0.06, ease: EASE }}
                        />
                      </div>
                    </div>
                    <p className="inline-flex items-center gap-1 text-[13.5px] font-bold text-(color:--gc-ink-2)">
                      <Clock className="size-4 text-(color:--gc-muted)" />
                      {c.days} days
                    </p>
                  </motion.li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-[22px] bg-(color:--gc-surface) p-7">
            <motion.h3 className="font-display text-[22px] font-bold text-(color:--gc-ink)" {...rise(reduce)}>
              Keep these ready
            </motion.h3>
            <p className="mt-1 text-[14px] text-(color:--gc-muted)">It helps us act faster.</p>
            <ul className="mt-6 space-y-3.5">
              {CHECKLIST.map((c, i) => (
                <motion.li key={c} className="flex items-center gap-3 text-[14.5px] text-(color:--gc-ink-2)" {...rise(reduce, 0.07 * i, 0.6)}>
                  <CheckCircle weight="fill" className="size-5 shrink-0" style={{ color: palette[0] }} />
                  {c}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section id="schemes" tone="mist">
        <div className="flex flex-col items-center gap-3">
          <SectionHeading eyebrow="State schemes" title="Ask About a State Scheme" sub="A sample of schemes NRIs often ask about." reduce={reduce} />
          <SampleTag label="Sample list" />
        </div>
        <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {SCHEMES.map((s, i) => {
            const Icon = s.icon;
            const color = palette[i % palette.length];
            return (
              <motion.div key={s.title} className="flex items-center gap-4" {...rise(reduce, 0.06 * i, 0.6)}>
                <span
                  className="grid size-14 shrink-0 place-items-center rounded-2xl"
                  style={{ background: `color-mix(in srgb, ${color} 14%, white)`, color }}
                >
                  <Icon weight="duotone" className="size-7" />
                </span>
                <div>
                  <p className="font-display text-[16px] leading-snug font-bold text-(color:--gc-ink)">{s.title}</p>
                  <p className="text-[13px] text-(color:--gc-muted)">{s.dept} Department</p>
                </div>
              </motion.div>
            );
          })}
        </div>
        <motion.h3 className="mt-20 text-center font-display text-[22px] font-bold text-(color:--gc-ink)" {...rise(reduce)}>
          How to ask
        </motion.h3>
        <StampFlow items={ASK_STEPS} palette={palette.slice(4)} reduce={reduce} className="mx-auto mt-10 max-w-4xl" />
      </Section>

      <Section id="after">
        <SectionHeading
          eyebrow="Tracking"
          title="What Happens After You Reach Out"
          sub="Your docket moves through seven stations. You are told at each step."
          reduce={reduce}
        />
        <div className="mt-12">
          <DocketJourney palette={palette} reduce={reduce} />
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-2">
          <motion.div
            className="relative rounded-[22px] border border-(color:--gc-line) bg-white p-7 shadow-[0_24px_50px_-34px_rgba(10,30,70,0.45)]"
            {...rise(reduce)}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[20px] font-bold text-(color:--gc-ink)">Sample acknowledgement</h3>
              <SampleTag />
            </div>
            <dl className="mt-5 divide-y divide-dashed divide-(color:--gc-line)">
              {ACK_FIELDS.map((f) => (
                <div key={f.label} className="flex justify-between gap-4 py-3 text-[14px]">
                  <dt className="text-(color:--gc-muted)">{f.label}</dt>
                  <dd className="text-right font-semibold text-(color:--gc-ink)">{f.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[12.5px] text-(color:--gc-muted)">Quote the docket number in every message to the Help Desk.</p>
          </motion.div>

          <motion.div className="rounded-[22px] bg-(color:--gc-surface) p-7" {...rise(reduce, 0.1)}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[20px] font-bold text-(color:--gc-ink)">Sample status updates</h3>
              <SampleTag />
            </div>
            <ol className="mt-6 space-y-5">
              {SAMPLE_TIMELINE.map((s, i) => (
                <motion.li key={s.text} className="grid grid-cols-[56px_20px_1fr] items-start gap-3" {...rise(reduce, 0.08 * i, 0.6)}>
                  <span className="pt-0.5 text-[12.5px] font-bold text-(color:--gc-muted)">{s.date}</span>
                  {s.done ? (
                    <CheckCircle weight="fill" className="size-5" style={{ color: palette[0] }} />
                  ) : (
                    <Circle weight="bold" className="size-5 text-(color:--gc-muted)" />
                  )}
                  <span className={s.done ? "text-[14.5px] font-semibold text-(color:--gc-ink)" : "text-[14.5px] text-(color:--gc-body)"}>{s.text}</span>
                </motion.li>
              ))}
            </ol>
          </motion.div>
        </div>
      </Section>

      <Section id="faqs" tone="mist">
        <SectionHeading eyebrow="FAQs" title="Common Questions" reduce={reduce} />
        <div className="mx-auto mt-10 max-w-3xl divide-y divide-(color:--gc-line) border-y border-(color:--gc-line)">
          {FAQS.map((f, i) => (
            <motion.details key={f.q} className="group py-1" {...rise(reduce, 0.05 * i, 0.6)}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-semibold text-(color:--gc-ink) [&::-webkit-details-marker]:hidden">
                {f.q}
                <CaretDown weight="bold" className="size-4 shrink-0 text-(color:--gc-muted) transition group-open:rotate-180" />
              </summary>
              <p className="pb-4 text-[14.5px] leading-relaxed text-(color:--gc-body)">{f.a}</p>
            </motion.details>
          ))}
        </div>
      </Section>

      <Section id="channels">
        <div className="flex flex-col items-center gap-3">
          <SectionHeading eyebrow="Reach us" title="Help Desk Channels" reduce={reduce} />
          <SampleTag label="To be confirmed" />
        </div>
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((c, i) => (
            <IconStamp key={c.title} item={{ title: c.title, text: c.value, icon: c.icon }} color={palette[(i * 3) % palette.length]} index={i} reduce={reduce} />
          ))}
        </div>
      </Section>
    </NriShell>
  );
}
