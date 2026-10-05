import { motion, useReducedMotion } from "motion/react";
import { Paperclip } from "@phosphor-icons/react";
import { EASE, rise } from "@/components/heritage/motion";
import { SectionHeading } from "@/components/home/SectionHeading";
import { OfficerArt } from "@/components/nri/art";
import { ConceptNote, IconStamp, NriShell, PageHero, SampleTag, Section, StampFlow } from "@/components/nri/parts";
import { usePalette } from "@/components/nri/usePalette";
import {
  AGEING,
  ATTACHMENTS,
  AUDIT,
  DOCKET_DETAILS,
  DOCKETS,
  EOFFICE_FLOW,
  KPIS,
  PENDING_BY_DEPT,
  ROLES,
  type DocketStatus,
} from "@/lib/nri";

const STATUS: Record<DocketStatus, string> = {
  New: "#2f80ed",
  Forwarded: "#7b3fe4",
  "In action": "#e59a12",
  Replied: "#1ea765",
  Escalated: "#e23b4a",
};

const CALLOUTS = [
  "Open dockets and delays at a glance.",
  "Colour shows the status of each docket.",
  "Days are counted against the set timeline.",
  "Escalated dockets stand out for review.",
];

function Callout({ n }: { n: number }) {
  return (
    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-(color:--gc-ink) text-[11.5px] font-bold text-white ring-4 ring-white">
      {n}
    </span>
  );
}

export function OfficerPage() {
  const reduce = useReducedMotion() ?? false;
  const palette = usePalette();
  const maxDept = Math.max(...PENDING_BY_DEPT.map((d) => d.value));
  const maxAge = Math.max(...AGEING.map((d) => d.value));

  return (
    <NriShell reduce={reduce}>
      <PageHero
        eyebrow="Officer workspace (concept)"
        title={
          <>
            How the Department
            <br />
            Tracks Every Docket
          </>
        }
        sub="A concept view of the Department's internal workspace. It shows how officers will record, forward and close each concern."
        chips={[
          { label: "Inside a docket", to: "#docket" },
          { label: "e-Office forwarding", to: "#eoffice" },
          { label: "Reports", to: "#reports" },
        ]}
        art={<OfficerArt palette={palette} reduce={reduce} />}
        reduce={reduce}
      />
      <ConceptNote reduce={reduce}>
        <strong className="text-(color:--gc-ink)">Concept view of the Department's internal workspace.</strong> There is no login on
        this portal. Every screen here is an illustration with sample data.
      </ConceptNote>

      <Section id="dashboard">
        <SectionHeading eyebrow="Dashboard" title="One View of Every Docket" sub="What a desk officer sees at the start of the day." reduce={reduce} />
        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[1fr_280px]">
          <motion.div
            className="overflow-hidden rounded-[20px] border border-(color:--gc-line) bg-white shadow-[0_30px_60px_-40px_rgba(10,30,70,0.5)]"
            {...rise(reduce, 0, 0.2)}
          >
            <div className="relative grid grid-cols-2 gap-3 border-b border-(color:--gc-line) p-5 sm:grid-cols-4">
              <span className="absolute -top-0 -left-0 m-2">
                <Callout n={1} />
              </span>
              {KPIS.map((k, i) => {
                const Icon = k.icon;
                return (
                  <div key={k.label} className="rounded-xl px-4 py-3" style={{ background: `color-mix(in srgb, ${palette[i]} 9%, white)` }}>
                    <Icon weight="duotone" className="size-5" style={{ color: palette[i] }} />
                    <p className="mt-1 font-display text-[24px] font-bold text-(color:--gc-ink)">{k.value}</p>
                    <p className="text-[12px] font-semibold text-(color:--gc-body)">{k.label}</p>
                  </div>
                );
              })}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[13.5px]">
                <thead className="bg-(color:--gc-surface) text-[11.5px] tracking-[0.08em] text-(color:--gc-muted) uppercase">
                  <tr>
                    <th className="px-5 py-3 font-bold">Docket</th>
                    <th className="px-3 py-3 font-bold">Category</th>
                    <th className="px-3 py-3 font-bold">Department</th>
                    <th className="px-3 py-3 font-bold">
                      <span className="inline-flex items-center gap-2">
                        Days <Callout n={3} />
                      </span>
                    </th>
                    <th className="px-5 py-3 font-bold">
                      <span className="inline-flex items-center gap-2">
                        Status <Callout n={2} />
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(color:--gc-line)">
                  {DOCKETS.map((d, i) => (
                    <motion.tr
                      key={d.no}
                      className={d.status === "Escalated" ? "bg-[#fdf1f2]" : undefined}
                      initial={reduce ? false : { opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: 0.1 + i * 0.08, ease: EASE }}
                    >
                      <td className="px-5 py-3 font-semibold whitespace-nowrap text-(color:--gc-ink)">
                        <span className="inline-flex items-center gap-2">
                          {d.no}
                          {d.status === "Escalated" ? <Callout n={4} /> : null}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-(color:--gc-body)">{d.category}</td>
                      <td className="px-3 py-3 text-(color:--gc-body)">{d.dept}</td>
                      <td className="px-3 py-3 font-semibold text-(color:--gc-ink-2)">{d.days}</td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-bold whitespace-nowrap"
                          style={{ background: `color-mix(in srgb, ${STATUS[d.status]} 12%, white)`, color: STATUS[d.status] }}
                        >
                          <span className="size-1.5 rounded-full" style={{ background: STATUS[d.status] }} />
                          {d.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <ol className="space-y-6">
            {CALLOUTS.map((c, i) => (
              <motion.li key={c} className="flex items-start gap-3" {...rise(reduce, 0.1 * i, 0.6)}>
                <Callout n={i + 1} />
                <p className="text-[15px] leading-snug text-(color:--gc-ink-2)">{c}</p>
              </motion.li>
            ))}
            <li>
              <SampleTag label="Sample data" />
            </li>
          </ol>
        </div>
      </Section>

      <Section id="docket" tone="mist">
        <SectionHeading eyebrow="Docket" title="Inside a Docket" sub="Details, papers and a full record of every step." reduce={reduce} />
        <div className="mt-12 grid gap-10 lg:grid-cols-3">
          <motion.div {...rise(reduce)}>
            <h3 className="text-[12px] font-extrabold tracking-[0.18em] text-(color:--gc-primary-deep) uppercase">Details</h3>
            <dl className="mt-4 divide-y divide-(color:--gc-line) border-y border-(color:--gc-line)">
              {DOCKET_DETAILS.map((d) => (
                <div key={d.label} className="flex justify-between gap-4 py-2.5 text-[13.5px]">
                  <dt className="text-(color:--gc-muted)">{d.label}</dt>
                  <dd className="text-right font-semibold text-(color:--gc-ink)">{d.value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>

          <motion.div {...rise(reduce, 0.1)}>
            <h3 className="text-[12px] font-extrabold tracking-[0.18em] text-(color:--gc-primary-deep) uppercase">Attachments</h3>
            <ul className="mt-4 space-y-3">
              {ATTACHMENTS.map((a, i) => (
                <li key={a} className="flex items-center gap-3 text-[14px] text-(color:--gc-ink-2)">
                  <span
                    className="grid size-9 place-items-center rounded-lg"
                    style={{ background: `color-mix(in srgb, ${palette[i + 1]} 14%, white)`, color: palette[i + 1] }}
                  >
                    <Paperclip weight="bold" className="size-4" />
                  </span>
                  {a}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div {...rise(reduce, 0.2)}>
            <h3 className="text-[12px] font-extrabold tracking-[0.18em] text-(color:--gc-primary-deep) uppercase">Record of every step</h3>
            <ol className="relative mt-4 space-y-4 border-l-2 border-(color:--gc-line) pl-6">
              {AUDIT.map((a, i) => (
                <li key={a.at} className="relative">
                  <span className="absolute top-1 -left-[31px] size-3 rounded-full ring-4 ring-(color:--gc-surface)" style={{ background: palette[i] }} />
                  <p className="text-[12px] font-bold text-(color:--gc-muted)">
                    {a.at} · {a.who}
                  </p>
                  <p className="text-[14px] font-semibold text-(color:--gc-ink)">{a.text}</p>
                </li>
              ))}
            </ol>
          </motion.div>
        </div>
      </Section>

      <Section id="eoffice">
        <SectionHeading
          eyebrow="e-Office"
          title="Forwarding Through e-Office"
          sub="Each docket links to an e-Office receipt. Status flows back on its own."
          reduce={reduce}
        />
        <StampFlow items={EOFFICE_FLOW} palette={palette.slice(2)} reduce={reduce} className="mt-14" />
      </Section>

      <Section id="reports" tone="mist">
        <div className="flex flex-col items-center gap-3">
          <SectionHeading eyebrow="Reports" title="Delays and Pending Work" reduce={reduce} />
          <SampleTag label="Illustrative figures" />
        </div>
        <div className="mt-12 grid gap-14 lg:grid-cols-2">
          <div>
            <h3 className="font-display text-[19px] font-bold text-(color:--gc-ink)">Pending by department</h3>
            <ul className="mt-6 space-y-4">
              {PENDING_BY_DEPT.map((d, i) => (
                <li key={d.dept} className="grid grid-cols-[120px_1fr_36px] items-center gap-3 text-[13.5px]">
                  <span className="font-semibold text-(color:--gc-ink-2)">{d.dept}</span>
                  <span className="h-3 overflow-hidden rounded-full bg-white">
                    <motion.span
                      className="block h-full origin-left rounded-full"
                      style={{ width: `${(d.value / maxDept) * 100}%`, background: palette[i] }}
                      initial={reduce ? false : { scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.1 * i, ease: EASE }}
                    />
                  </span>
                  <span className="text-right font-bold text-(color:--gc-ink)">{d.value}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-[19px] font-bold text-(color:--gc-ink)">Ageing of open dockets</h3>
            <div className="mt-6 flex h-[200px] items-end gap-5">
              {AGEING.map((a, i) => (
                <div key={a.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[13px] font-bold text-(color:--gc-ink)">{a.value}</span>
                  <motion.span
                    className="w-full max-w-[70px] origin-bottom rounded-t-lg"
                    style={{ height: `${(a.value / maxAge) * 75}%`, background: i === AGEING.length - 1 ? STATUS.Escalated : palette[i * 2] }}
                    initial={reduce ? false : { scaleY: 0 }}
                    whileInView={{ scaleY: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.1 * i, ease: EASE }}
                  />
                  <span className="text-center text-[12px] font-semibold text-(color:--gc-body)">{a.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section id="roles">
        <SectionHeading eyebrow="Roles" title="Who Does What" sub="Each officer sees only the work for their role." reduce={reduce} />
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {ROLES.map((r, i) => (
            <IconStamp key={r.title} item={r} color={palette[(i * 2 + 1) % palette.length]} index={i} reduce={reduce} />
          ))}
        </div>
      </Section>
    </NriShell>
  );
}
