import { Fragment } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Binoculars,
  CheckCircle,
  ClipboardText,
  Crosshair,
  Gear,
  Handshake,
  Lightning,
  MagnifyingGlass,
  PaperPlaneTilt,
  RocketLaunch,
  ShieldCheck,
  UploadSimple,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";

const STEPS: { title: string; text: string; icon: Icon; color: string }[] = [
  { title: "Explore", text: "Find relevant opportunities", icon: Binoculars, color: "#1f6fe5" },
  { title: "Understand", text: "Review the details", icon: MagnifyingGlass, color: "#0e9c97" },
  { title: "Express Interest", text: "Share your interest", icon: PaperPlaneTilt, color: "#16a05a" },
  { title: "Get Matched", text: "Reach the right team", icon: Crosshair, color: "#e0a91f" },
  { title: "Connect", text: "Meet the organisation", icon: UsersThree, color: "#ea6c12" },
  { title: "Facilitate", text: "Talks and due diligence", icon: Gear, color: "#e0335c" },
  { title: "Act", text: "Turn it into a project", icon: Lightning, color: "#8a3fd6" },
];

const SHARE_STEPS: { label: string; icon: Icon }[] = [
  { label: "Submit", icon: UploadSimple },
  { label: "Review", icon: ClipboardText },
  { label: "Validate", icon: ShieldCheck },
  { label: "Publish", icon: RocketLaunch },
  { label: "Connect", icon: Handshake },
];

export function ImpactJourney({ reduce }: { reduce: boolean }) {
  return (
    <section className="relative overflow-x-clip bg-white px-5 py-20 lg:px-8">
      <div className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-12 xl:grid-cols-[minmax(0,1.8fr)_minmax(0,1fr)]">
        <div>
          <SectionHeading eyebrow="How it works" title="From Opportunity to Impact" sub="A simple journey to turn opportunities into real outcomes." reduce={reduce} align="left" />
          <motion.ol
            className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-4 lg:flex lg:items-start lg:justify-between"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
          >
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <Fragment key={s.title}>
                  <motion.li
                    className="group flex flex-col items-center text-center lg:w-[100px]"
                    variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.12, ease: EASE } } }}
                  >
                    <motion.span
                      className="grid size-12 place-items-center rounded-2xl text-white transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-6"
                      style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}cc)`, boxShadow: `0 10px 22px ${s.color}45` }}
                      variants={{ hidden: { scale: 0.5 }, show: { scale: [0.5, 1.15, 1], transition: { duration: 0.55, delay: i * 0.12 + 0.1 } } }}
                    >
                      <Icon size={24} weight="duotone" />
                    </motion.span>
                    <span className="mt-3 font-display text-[13.5px] leading-tight font-semibold text-(color:--gc-ink)">{s.title}</span>
                    <span className="mt-1 text-[11.5px] leading-snug text-(color:--gc-body)">{s.text}</span>
                  </motion.li>
                  {i < STEPS.length - 1 ? (
                    <motion.li
                      aria-hidden
                      className="hidden pt-[15px] lg:block"
                      style={{ color: s.color }}
                      variants={{ hidden: { opacity: 0, x: -8 }, show: { opacity: 1, x: 0, transition: { delay: i * 0.12 + 0.3 } } }}
                    >
                      <ArrowRight size={16} weight="bold" />
                    </motion.li>
                  ) : null}
                </Fragment>
              );
            })}
          </motion.ol>
        </div>

        <motion.div
          id="share"
          className="relative scroll-mt-24 overflow-hidden rounded-[24px] bg-gradient-to-br from-[color:var(--gc-hero-2,#131840)] via-[#24164f] to-[#3a1450] p-6 text-white shadow-[0_24px_60px_rgba(19,24,64,0.35)]"
          initial={reduce ? false : { opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <motion.span
            aria-hidden
            className="absolute -top-16 -right-16 size-56 rounded-full bg-[radial-gradient(circle,rgba(255,127,159,0.45),transparent_70%)]"
            animate={reduce ? undefined : { scale: [1, 1.15, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative flex items-start gap-4">
            <div className="flex-1">
              <p className="font-display text-[22px] leading-tight font-bold">Have an Opportunity to Share?</p>
              <p className="mt-2 text-[14px] leading-relaxed text-white/80">
                Businesses, institutions, startups and organisations can submit opportunities for review and publication.
              </p>
            </div>
            <motion.span
              className="relative hidden size-20 shrink-0 place-items-center rounded-3xl bg-white/10 ring-1 ring-white/20 sm:grid"
              animate={reduce ? undefined : { y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <UploadSimple size={36} weight="duotone" className="text-(color:--gc-gold)" />
              <CheckCircle size={22} weight="fill" className="absolute -right-1.5 -bottom-1.5 text-[#16a05a]" />
            </motion.span>
          </div>
          <a
            href="#share"
            className="group relative mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-(color:--gc-button-a) to-(color:--gc-button-b) py-2.5 pr-4 pl-5 text-[14px] font-semibold text-(color:--gc-ink) shadow-[0_10px_26px_rgba(240,180,41,0.35)] transition hover:-translate-y-0.5"
          >
            Submit an Opportunity
            <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </a>
          <motion.ol
            className="relative mt-6 flex items-start justify-between"
            initial={reduce ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true }}
          >
            <li aria-hidden className="absolute top-[17px] right-[8%] left-[8%] h-px bg-white/20" />
            {SHARE_STEPS.map(({ label, icon: Icon }, i) => (
              <motion.li
                key={label}
                className="relative flex flex-col items-center gap-1.5"
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { delay: 0.4 + i * 0.1 } } }}
              >
                <span className="grid size-9 place-items-center rounded-full border border-white/25 bg-[#1b1a4c] text-(color:--gc-gold)">
                  <Icon size={16} weight="duotone" />
                </span>
                <span className="text-[11px] text-white/80">
                  {i + 1}. {label}
                </span>
              </motion.li>
            ))}
          </motion.ol>
        </motion.div>
      </div>
    </section>
  );
}
