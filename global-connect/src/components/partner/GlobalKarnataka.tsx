import { motion } from "motion/react";
import {
  ArrowsLeftRight,
  Coins,
  Cpu,
  Factory,
  Flask,
  GlobeHemisphereWest,
  Lightbulb,
  Storefront,
  UsersThree,
  Wrench,
  ChartLineUp,
  type Icon,
} from "@phosphor-icons/react";
import handshake from "@/assets/partner/handshake.jpg";
import { EASE } from "@/components/connect/shared";
import { SectionHeading } from "@/components/home/SectionHeading";

type Item = { label: string; icon: Icon };

const GLOBAL: Item[] = [
  { label: "Expertise", icon: Wrench },
  { label: "Technology", icon: Cpu },
  { label: "Capital", icon: Coins },
  { label: "Markets", icon: Storefront },
  { label: "Global Networks", icon: GlobeHemisphereWest },
];

const KARNATAKA: Item[] = [
  { label: "Talent", icon: UsersThree },
  { label: "Industry", icon: Factory },
  { label: "Research", icon: Flask },
  { label: "Innovation", icon: Lightbulb },
  { label: "Market Opportunities", icon: ChartLineUp },
];

function Panel({ title, items, color, from, reduce }: { title: string; items: Item[]; color: string; from: number; reduce: boolean }) {
  return (
    <motion.div
      className="overflow-hidden rounded-2xl bg-white shadow-[0_14px_36px_rgba(11,31,74,0.09)] ring-1 ring-(color:--gc-ink)/6"
      initial={reduce ? false : { opacity: 0, x: from }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <p className="px-4 py-2.5 font-display text-[13.5px] font-semibold text-white" style={{ background: color }}>
        {title}
      </p>
      <ul className="space-y-1 p-3">
        {items.map(({ label, icon: Icon }, i) => (
          <motion.li
            key={label}
            className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-[13px] font-medium text-(color:--gc-ink-2)"
            initial={reduce ? false : { opacity: 0, x: from / 2 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.25 + i * 0.09, ease: EASE }}
          >
            <span className="grid size-7 place-items-center rounded-lg" style={{ background: `${color}14`, color }}>
              <Icon size={15} weight="duotone" />
            </span>
            {label}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

export function GlobalKarnataka({ reduce }: { reduce: boolean }) {
  return (
    <div>
      <SectionHeading
        eyebrow="Shared strengths"
        title={
          <>
            Global <ArrowsLeftRight className="inline-block align-[-0.1em] text-[#8a3fd6]" size="0.9em" weight="bold" /> Karnataka Partnership
          </>
        }
        sub="Complementary strengths for greater impact."
        reduce={reduce}
        align="left"
      />
      <div className="mt-8 grid items-center gap-4 sm:grid-cols-[1fr_minmax(150px,0.9fr)_1fr]">
        <Panel title="Global Partners Bring" items={GLOBAL} color="#1f6fe5" from={-30} reduce={reduce} />
        <motion.div
          className="relative flex flex-col items-center text-center"
          initial={reduce ? false : { opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
        >
          <motion.span
            className="absolute top-[30%] left-1/2 size-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(63,180,255,0.35),transparent_70%)]"
            animate={reduce ? undefined : { scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <img src={handshake} alt="A handshake between global and Karnataka partners" loading="lazy" className="relative w-full max-w-[200px] mix-blend-multiply" />
          <p className="relative mt-1 font-display text-[16px] font-bold tracking-[0.08em] text-(color:--gc-ink)">PARTNERSHIP</p>
          <p className="relative text-[12.5px] text-(color:--gc-body)">For a Stronger Karnataka</p>
        </motion.div>
        <Panel title="Karnataka Offers" items={KARNATAKA} color="#16a05a" from={30} reduce={reduce} />
      </div>
    </div>
  );
}
