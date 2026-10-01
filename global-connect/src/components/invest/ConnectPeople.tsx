import { motion } from "motion/react";
import {
  Briefcase,
  Factory,
  HandHeart,
  Lifebuoy,
  MapTrifold,
  Path,
  Scroll,
  Stamp,
  type Icon,
} from "@phosphor-icons/react";
import emblem from "@/assets/karnataka-emblem.png";
import { SectionHeading } from "@/components/home/SectionHeading";
import { EASE } from "./shared";

const DEPTS: { label: string; icon: Icon; color: string }[] = [
  { label: "Industry Support", icon: Factory, color: "#1f6fe5" },
  { label: "Land Support", icon: MapTrifold, color: "#16a05a" },
  { label: "Policy & Incentives", icon: Scroll, color: "#8a3fd6" },
  { label: "Approvals", icon: Stamp, color: "#e0335c" },
  { label: "Infrastructure", icon: Path, color: "#ea6c12" },
  { label: "Other Support", icon: Lifebuoy, color: "#0e9c97" },
];

const W = 1000;
const H = 440;
const INVESTOR_Y = 45;
const HUB_Y = 150;
const DEPT_Y = 275;
const FINAL_Y = 395;
const XS = DEPTS.map((_, i) => 100 + i * 160);

const T = { investor: 0, toHub: 0.35, hub: 0.8, dept: 1.15, deptStep: 0.16, toFinal: 2.3, final: 2.8 };

export function ConnectPeople({ reduce }: { reduce: boolean }) {
  return (
    <section id="connect" className="relative scroll-mt-16 overflow-hidden bg-gradient-to-b from-[#f4f8fd] to-[#fbf7ef] px-5 py-20 lg:px-8">
      <SectionHeading
        eyebrow="Coordinated support"
        title="We Connect You With the Right People"
        sub="You do not have to figure out which department to approach."
        reduce={reduce}
      />
      <Diagram reduce={reduce} />
      <MobileFlow reduce={reduce} />
    </section>
  );
}

function Diagram({ reduce }: { reduce: boolean }) {
  const draw = (delay: number, duration = 0.45) => ({
    variants: {
      hidden: { pathLength: 0, opacity: 0 },
      show: { pathLength: 1, opacity: 1, transition: { delay, duration, ease: "easeInOut" as const } },
    },
  });
  const pop = (delay: number) => ({
    variants: {
      hidden: { opacity: 0, scale: 0.85, y: 10 },
      show: { opacity: 1, scale: 1, y: 0, transition: { delay, duration: 0.45, ease: EASE } },
    },
  });
  const pos = (x: number, y: number) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` });

  return (
    <motion.div
      className="relative mx-auto mt-12 hidden aspect-[1000/440] max-w-[1180px] md:block"
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.45 }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" fill="none" aria-hidden>
        <motion.path d={`M500 ${INVESTOR_Y + 22} V${HUB_Y - 38}`} stroke="#1f6fe5" strokeWidth={2} {...draw(T.toHub)} />
        {XS.map((x, i) => (
          <motion.path
            key={`d${x}`}
            d={`M500 ${HUB_Y + 38} V212 H${x} V${DEPT_Y - 24}`}
            stroke={DEPTS[i].color}
            strokeOpacity={0.7}
            strokeWidth={1.8}
            {...draw(T.dept + i * T.deptStep, 0.5)}
          />
        ))}
        {XS.map((x, i) => (
          <motion.path
            key={`f${x}`}
            d={`M${x} ${DEPT_Y + 24} V338 H500 V${FINAL_Y - 24}`}
            stroke="#e0a91f"
            strokeOpacity={0.65}
            strokeWidth={1.6}
            {...draw(T.toFinal + i * 0.05, 0.45)}
          />
        ))}
      </svg>

      <motion.div className="absolute -translate-x-1/2 -translate-y-1/2" style={pos(500, INVESTOR_Y)} {...pop(T.investor)}>
        <span className="flex items-center gap-2 rounded-full bg-white py-2 pr-4 pl-2 text-[14px] font-semibold text-[#0b1f4a] shadow-[0_8px_22px_rgba(11,31,74,0.12)] ring-1 ring-[#0b1f4a]/8">
          <span className="grid size-8 place-items-center rounded-full bg-[#e7f0ff] text-[#1f6fe5]">
            <Briefcase size={18} weight="duotone" />
          </span>
          Investor
        </span>
      </motion.div>

      <motion.div className="absolute -translate-x-1/2 -translate-y-1/2" style={pos(500, HUB_Y)} {...pop(T.hub)}>
        <span className="relative flex items-center gap-3 rounded-full bg-[#0b1f4a] py-2 pr-6 pl-2 text-white shadow-[0_14px_34px_rgba(11,31,74,0.35)]">
          {!reduce ? (
            <motion.span
              className="absolute inset-0 rounded-full ring-2 ring-[#3fb4ff]"
              variants={{ hidden: { opacity: 0 }, show: { opacity: [0, 0.8, 0], scale: [1, 1.12, 1.2], transition: { delay: T.hub + 0.3, duration: 1.2 } } }}
            />
          ) : null}
          <span className="grid size-12 place-items-center rounded-full bg-white ring-2 ring-[#f0c14a]">
            <img src={emblem} alt="" className="h-8 w-auto" />
          </span>
          <span className="font-display text-[16px] font-semibold">Global Karnataka</span>
        </span>
      </motion.div>

      {DEPTS.map((d, i) => {
        const Icon = d.icon;
        return (
          <motion.div
            key={d.label}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={pos(XS[i], DEPT_Y)}
            {...pop(T.dept + i * T.deptStep + 0.3)}
          >
            <span className="flex w-[150px] items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-[12.5px] leading-tight font-semibold text-[#0b1f4a] shadow-[0_8px_20px_rgba(11,31,74,0.1)] lg:w-[160px]">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg text-white" style={{ background: d.color }}>
                <Icon size={18} weight="bold" />
              </span>
              {d.label}
            </span>
          </motion.div>
        );
      })}

      <motion.div className="absolute -translate-x-1/2 -translate-y-1/2" style={pos(500, FINAL_Y)} {...pop(T.final)}>
        <span className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e0a91f] to-[#f0c14a] py-2 pr-5 pl-2 text-[15px] font-semibold text-[#0b1f4a] shadow-[0_12px_28px_rgba(224,169,31,0.4)]">
          <span className="grid size-8 place-items-center rounded-full bg-white/70">
            <HandHeart size={18} weight="duotone" />
          </span>
          Coordinated Support
        </span>
      </motion.div>
    </motion.div>
  );
}

function MobileFlow({ reduce }: { reduce: boolean }) {
  const item = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 16 } as const),
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.6 },
    transition: { duration: 0.45, delay, ease: EASE },
  });
  const connector = <span aria-hidden className="mx-auto block h-6 w-0.5 bg-[#1f6fe5]/30" />;

  return (
    <div className="mx-auto mt-10 max-w-[420px] md:hidden">
      <motion.div className="mx-auto w-fit rounded-full bg-white px-5 py-2 text-[14px] font-semibold text-[#0b1f4a] shadow ring-1 ring-[#0b1f4a]/8" {...item(0)}>
        Investor
      </motion.div>
      {connector}
      <motion.div className="mx-auto flex w-fit items-center gap-2 rounded-full bg-[#0b1f4a] py-1.5 pr-5 pl-1.5 text-white" {...item(0.1)}>
        <span className="grid size-9 place-items-center rounded-full bg-white">
          <img src={emblem} alt="" className="h-6 w-auto" />
        </span>
        <span className="font-display font-semibold">Global Karnataka</span>
      </motion.div>
      {connector}
      <div className="grid grid-cols-2 gap-2.5">
        {DEPTS.map((d, i) => {
          const Icon = d.icon;
          return (
            <motion.div
              key={d.label}
              className="flex items-center gap-2 rounded-xl bg-white px-2.5 py-2 text-[12.5px] font-semibold text-[#0b1f4a] shadow-sm"
              {...item(0.1 + i * 0.08)}
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg text-white" style={{ background: d.color }}>
                <Icon size={15} weight="bold" />
              </span>
              {d.label}
            </motion.div>
          );
        })}
      </div>
      {connector}
      <motion.div className="mx-auto w-fit rounded-full bg-gradient-to-r from-[#e0a91f] to-[#f0c14a] px-5 py-2 text-[14px] font-semibold text-[#0b1f4a]" {...item(0.2)}>
        Coordinated Support
      </motion.div>
    </div>
  );
}
