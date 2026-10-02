import { motion } from "motion/react";
import { Coins, GraduationCap, Handshake, Lightbulb, UsersThree, type Icon } from "@phosphor-icons/react";
import waysBg from "@/assets/heritage/ways-bg.jpg";
import { HeritageTitle } from "./parts";
import { EASE } from "./motion";

const WAYS: { label: string; text: string; icon: Icon }[] = [
  { label: "People", text: "A global community of Kannadigas", icon: UsersThree },
  { label: "Capital", text: "Investment and growth opportunities", icon: Coins },
  { label: "Talent", text: "Skills, innovation and global expertise", icon: GraduationCap },
  { label: "Partnerships", text: "Collaboration for shared progress", icon: Handshake },
  { label: "Opportunities", text: "Projects, programmes and emerging possibilities", icon: Lightbulb },
];

const XS = [100, 300, 500, 700, 900];

export function WaysToConnect({ reduce }: { reduce: boolean }) {
  const draw = (delay: number) => ({
    initial: reduce ? false : { pathLength: 0 },
    whileInView: { pathLength: 1 },
    viewport: { once: true, amount: 0.6 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section className="relative isolate overflow-hidden bg-(color:--gc-surface) px-5 pt-16 pb-24 lg:px-8 lg:pt-20 lg:pb-32">
      <img src={waysBg} alt="" aria-hidden loading="lazy" className="absolute inset-0 -z-10 size-full object-cover object-bottom opacity-90" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_40%,rgba(250,247,240,0.95)_0%,rgba(250,247,240,0.7)_45%,rgba(250,247,240,0)_75%)]" />

      <HeritageTitle reduce={reduce}>One Karnataka. Many Ways to Connect.</HeritageTitle>

      <div className="mx-auto mt-12 max-w-[920px]">
        <ul className="grid grid-cols-2 gap-y-8 sm:grid-cols-3 md:grid-cols-5">
          {WAYS.map(({ label, text, icon: WayIcon }, i) => (
            <motion.li
              key={label}
              className="px-2 text-center"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
            >
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-white/90 text-(color:--gc-gold-4) shadow-[0_8px_22px_rgba(201,154,46,0.22)] ring-1 ring-(color:--gc-gold-3)/50">
                <WayIcon size={30} weight="duotone" />
              </span>
              <p className="mt-3 text-[12.5px] font-extrabold tracking-[0.14em] text-(color:--gc-ink) uppercase">{label}</p>
              <p className="mx-auto mt-1 max-w-[150px] text-[12.5px] leading-snug text-(color:--gc-body)">{text}</p>
            </motion.li>
          ))}
        </ul>

        <svg viewBox="0 0 1000 90" preserveAspectRatio="none" className="hidden h-[70px] w-full md:block" aria-hidden>
          {XS.map((x, i) => (
            <motion.path
              key={x}
              d={`M${x},0 V40`}
              stroke="var(--gc-gold-3)"
              strokeWidth={1.5}
              vectorEffect="non-scaling-stroke"
              fill="none"
              {...draw(0.5 + i * 0.06)}
            />
          ))}
          <motion.path d="M100,40 H900" stroke="var(--gc-gold-3)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" fill="none" {...draw(0.85)} />
          <motion.path d="M500,40 V90" stroke="var(--gc-gold-3)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" fill="none" {...draw(1.2)} />
          {!reduce ? (
            <path
              d="M100,40 H900"
              stroke="var(--gc-gold-4)"
              strokeWidth={2.5}
              strokeDasharray="2 18"
              vectorEffect="non-scaling-stroke"
              fill="none"
              className="animate-[dash-flow_1.2s_linear_infinite]"
            />
          ) : null}
        </svg>

        <motion.div
          className="mt-8 flex flex-col items-center md:mt-0"
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.6, delay: reduce ? 0 : 1.4, ease: EASE }}
        >
          <span className="relative rounded-full bg-(color:--gc-navy) px-8 py-3 text-[13px] font-bold tracking-[0.2em] text-white shadow-[0_12px_30px_rgba(12,58,42,0.35)] ring-2 ring-(color:--gc-gold-3)/70">
            A STRONGER KARNATAKA
          </span>
          <p className="mt-5 text-center text-[11.5px] font-bold tracking-[0.2em] text-(color:--gc-ink-2)">
            GREATER OPPORTUNITIES <span className="text-(color:--gc-gold-4)">•</span> SHARED GROWTH{" "}
            <span className="text-(color:--gc-gold-4)">•</span> A BRIGHTER TOMORROW
          </p>
        </motion.div>
      </div>
    </section>
  );
}
