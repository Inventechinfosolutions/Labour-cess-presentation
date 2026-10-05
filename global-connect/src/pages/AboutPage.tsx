import { motion, useReducedMotion } from "motion/react";
import { DownloadSimple } from "@phosphor-icons/react";
import { EASE, rise } from "@/components/heritage/motion";
import { SectionHeading } from "@/components/home/SectionHeading";
import { AboutArt } from "@/components/nri/art";
import { HelpBand } from "@/components/nri/HelpBand";
import { ConceptNote, IconStamp, NriShell, PageHero, SampleTag, Section, StampFlow } from "@/components/nri/parts";
import { usePalette } from "@/components/nri/usePalette";
import { HELP_DESK } from "@/lib/nav";
import { ACTIVITIES, CONTACTS, MANDATE, NEWS, RESOURCES, WORK_FLOW } from "@/lib/nri";

export function AboutPage() {
  const reduce = useReducedMotion() ?? false;
  const palette = usePalette();

  return (
    <NriShell reduce={reduce}>
      <PageHero
        eyebrow="About the Department"
        title={
          <>
            Serving Kannadigas
            <br />
            Across the World
          </>
        }
        sub="The Department is the home link for Kannadigas living abroad. We guide, resolve concerns and connect them with Karnataka."
        chips={[
          { label: "Our activities", to: "#activities" },
          { label: "NRI Help Desk", to: HELP_DESK },
        ]}
        art={<AboutArt palette={palette} reduce={reduce} />}
        reduce={reduce}
      />
      <ConceptNote reduce={reduce}>
        <strong className="text-(color:--gc-ink)">Concept preview.</strong> The content on this page is sample text. Final details will
        be confirmed by the Department.
      </ConceptNote>

      <Section id="vision">
        <SectionHeading eyebrow="Who we are" title="Mandate, Vision and Mission" reduce={reduce} />
        <div className="mx-auto mt-14 grid max-w-4xl gap-12 sm:grid-cols-3">
          {MANDATE.map((m, i) => (
            <IconStamp key={m.title} item={m} color={palette[i * 2]} index={i} reduce={reduce} size="lg" />
          ))}
        </div>
      </Section>

      <Section id="activities" tone="mist">
        <SectionHeading eyebrow="What we do" title="Department Activities" sub="Six areas of work for Kannadigas abroad and their families." reduce={reduce} />
        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIVITIES.map((a, i) => (
            <IconStamp key={a.title} item={a} color={palette[i]} index={i} reduce={reduce} />
          ))}
        </div>
      </Section>

      <Section id="government">
        <SectionHeading
          eyebrow="Working with Government"
          title="How We Work With Departments"
          sub="Every concern moves on e-Office. Each step is recorded."
          reduce={reduce}
        />
        <StampFlow items={WORK_FLOW} palette={palette} reduce={reduce} className="mt-14" />
      </Section>

      <Section id="news" tone="mist">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading eyebrow="News and Events" title="Recent Activity" reduce={reduce} align="left" />
          <SampleTag label="Sample events" />
        </div>
        <div className="relative mt-14">
          <motion.div
            aria-hidden
            className="absolute top-[7px] right-0 left-0 hidden h-[2px] origin-left bg-(color:--gc-line) sm:block"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.1, ease: EASE }}
          />
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {NEWS.map((n, i) => (
              <motion.div key={n.title} className="relative" {...rise(reduce, 0.1 * i, 0.5)}>
                <span className="block size-4 rounded-full ring-4 ring-(color:--gc-surface)" style={{ background: palette[i * 2] }} />
                <p className="mt-5 text-[12px] font-bold tracking-[0.16em] text-(color:--gc-muted) uppercase">
                  {n.date} · {n.tag}
                </p>
                <p className="mt-2 font-display text-[18px] leading-snug font-bold text-(color:--gc-ink)">{n.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      <Section id="resources">
        <SectionHeading eyebrow="Resources" title="Guides and Documents" sub="Downloads will be added once content is approved." reduce={reduce} />
        <ul className="mx-auto mt-12 max-w-3xl divide-y divide-(color:--gc-line) border-y border-(color:--gc-line)">
          {RESOURCES.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.li key={r.title} className="flex items-center gap-4 py-4" {...rise(reduce, 0.06 * i, 0.6)}>
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-full"
                  style={{ background: `color-mix(in srgb, ${palette[i]} 14%, white)`, color: palette[i] }}
                >
                  <Icon weight="duotone" className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="font-semibold text-(color:--gc-ink)">{r.title}</p>
                  <p className="text-[13px] text-(color:--gc-muted)">{r.meta}</p>
                </div>
                <DownloadSimple className="size-5 text-(color:--gc-muted)" aria-hidden />
              </motion.li>
            );
          })}
        </ul>
      </Section>

      <Section id="contact-us" tone="mist">
        <div className="flex flex-col items-center gap-3">
          <SectionHeading eyebrow="Contact" title="Reach the Department" reduce={reduce} />
          <SampleTag label="To be confirmed" />
        </div>
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACTS.map((c, i) => (
            <IconStamp key={c.title} item={{ title: c.title, text: c.value, icon: c.icon }} color={palette[(i * 3) % palette.length]} index={i} reduce={reduce} />
          ))}
        </div>
      </Section>

      <HelpBand reduce={reduce} id="about-help" title="Need help from the Department?" className="bg-white" />
    </NriShell>
  );
}
