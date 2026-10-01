import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { ArrowRight, CheckCircle, IdentificationCard, ListChecks, SealCheck, Target, UserCirclePlus } from "@phosphor-icons/react";
import emblem from "@/assets/karnataka-emblem.png";
import portalBg from "@/assets/invest/portal-bg.jpg";
import { SectionHeading } from "@/components/home/SectionHeading";
import { BLUE, EASE } from "./shared";

const STEPS = [
  { label: "Create your investor account", icon: UserCirclePlus },
  { label: "Verify your organisation", icon: SealCheck },
  { label: "Complete your investor profile", icon: IdentificationCard },
  { label: "Tell us what you want to invest in", icon: Target },
];

const FIELDS = [
  ["Organisation", "Aurora Industries Ltd."],
  ["Country", "Germany"],
  ["Industry / Sector", "Advanced Manufacturing"],
  ["Investment Interest", "New Investment"],
  ["Preferred Location", "Bengaluru"],
  ["Approximate Investment", "₹200–500 Crore"],
  ["Expected Requirements", "Land, Power, Approvals"],
  ["Contact Person", "M. Weber"],
];

export function PortalSection({ reduce }: { reduce: boolean }) {
  return (
    <section id="portal" className="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-[#f4f8fd] to-white px-5 py-20 lg:px-8">
      <div className="mx-auto grid max-w-[1220px] items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionHeading
            eyebrow="Getting started"
            title="Start with the Global Karnataka Portal"
            sub="One gateway to begin your investment journey."
            reduce={reduce}
            align="left"
          />
          <ol className="mt-8 space-y-3">
            {STEPS.map(({ label, icon: Icon }, i) => (
              <motion.li
                key={label}
                className="flex items-center gap-4 rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-[#0b1f4a]/6"
                initial={reduce ? false : { opacity: 0, x: -28 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.15, ease: EASE }}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e7f0ff] text-[#1f6fe5]">
                  <Icon size={22} weight="duotone" />
                </span>
                <span className="flex-1 text-[15px] font-medium text-[#0b1f4a]">{label}</span>
                <span className="font-display text-[12px] font-semibold text-[#8a97ad]">0{i + 1}</span>
              </motion.li>
            ))}
          </ol>
          <motion.a
            href="#interest"
            className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#0b1f4a] py-3 pr-4 pl-6 text-[14.5px] font-semibold text-white shadow-[0_10px_26px_rgba(11,31,74,0.25)] transition hover:bg-[#13306d]"
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: [0.94, 1.06, 1] }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.7, delay: 0.8, ease: EASE }}
          >
            Create Investor Account
            <ArrowRight size={18} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </motion.a>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-[28px] p-5 shadow-[0_30px_70px_rgba(11,31,74,0.18)] sm:p-10"
          initial={reduce ? false : { opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <img src={portalBg} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-[#eaf2ff]/30" />
          <Laptop reduce={reduce} />
        </motion.div>
      </div>
    </section>
  );
}

function Laptop({ reduce }: { reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [filled, setFilled] = useState(reduce ? FIELDS.length : 0);

  useEffect(() => {
    if (reduce || !inView || filled >= FIELDS.length) return;
    const id = window.setTimeout(() => setFilled(filled + 1), filled === 0 ? 600 : 260);
    return () => window.clearTimeout(id);
  }, [inView, reduce, filled]);

  return (
    <div ref={ref} className="relative mx-auto max-w-[620px]">
      <div className="rounded-t-[14px] border-[7px] border-b-0 border-[#1b2333] bg-white">
        <div className="flex items-center gap-1.5 border-b border-[#e6ebf3] bg-[#f5f7fb] px-3 py-2">
          <span className="size-2 rounded-full bg-[#ff6159]" />
          <span className="size-2 rounded-full bg-[#ffbd2e]" />
          <span className="size-2 rounded-full bg-[#28c941]" />
          <span className="ml-3 flex-1 truncate rounded-full bg-white px-3 py-0.5 text-[10px] text-[#8a97ad] ring-1 ring-[#e6ebf3]">
            globalkarnataka.gov.in/invest/profile
          </span>
        </div>
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <img src={emblem} alt="" className="h-7 w-auto" />
            <div className="leading-tight">
              <p className="font-display text-[13.5px] font-semibold text-[#0b1f4a] sm:text-[15px]">Create Your Investor Profile</p>
              <p className="text-[10.5px] text-[#8a97ad]">Step 3 of 4 · Investor profile</p>
            </div>
            <ListChecks size={18} className="ml-auto text-[#1f6fe5]" />
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e7f0ff]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#1f6fe5] to-[#3fb4ff]"
              animate={{ width: `${30 + (filled / FIELDS.length) * 70}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-2.5">
            {FIELDS.map(([label, value], i) => {
              const on = i < filled;
              return (
                <motion.div
                  key={label}
                  className="rounded-lg border bg-white px-2.5 py-1.5"
                  animate={{ borderColor: on ? `${BLUE}55` : "#e6ebf3", backgroundColor: on ? "#f7faff" : "#ffffff" }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-[9.5px] font-medium tracking-wide text-[#8a97ad] uppercase">{label}</p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] font-medium text-[#0b1f4a]">
                    <motion.span animate={{ opacity: on ? 1 : 0.15 }} className="truncate">
                      {value}
                    </motion.span>
                    {on ? <CheckCircle size={12} weight="fill" className="ml-auto shrink-0 text-[#16a05a]" /> : null}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="mx-[-6%] h-3 rounded-b-[14px] bg-gradient-to-b from-[#c9d0dc] to-[#9aa3b3]" />
      <div className="mx-auto h-1 w-24 rounded-b-md bg-[#8a93a3]" />
    </div>
  );
}
