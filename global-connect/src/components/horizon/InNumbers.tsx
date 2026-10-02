import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { ChartLineUp, Gear, GlobeHemisphereEast, RocketLaunch, UsersThree, type Icon } from "@phosphor-icons/react";
import { rise } from "@/components/heritage/motion";
import { HZ_COLOR } from "./palette";
import { AsideNote, HorizonTitle } from "./parts";

const STATS: {
  value: number;
  prefix?: string;
  unit?: string;
  suffix: string;
  decimals?: number;
  label: string;
  text: string;
  icon: Icon;
  color: string;
}[] = [
  { value: 25, prefix: "₹", unit: "lakh crore", suffix: "+", label: "Gross State Domestic Product (GSDP)", text: "Among India's leading economies", icon: ChartLineUp, color: HZ_COLOR.talent.c },
  { value: 1.6, suffix: "M+", decimals: 1, label: "Skilled Workforce", text: "A diverse and talented base", icon: UsersThree, color: HZ_COLOR.connect.c },
  { value: 40, suffix: "+", label: "Global Capability Centres", text: "Driving innovation and technology", icon: Gear, color: HZ_COLOR.invest.c },
  { value: 5000, suffix: "+", label: "Startups", text: "A vibrant startup ecosystem", icon: RocketLaunch, color: HZ_COLOR.partner.c },
  { value: 100, suffix: "+", label: "Countries", text: "Connected through people, business and ideas", icon: GlobeHemisphereEast, color: HZ_COLOR.discover.c },
];

function Count({ to, decimals = 0, reduce }: { to: number; decimals?: number; reduce: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const c = animate(0, to, { duration: 1.5, ease: [0.22, 1, 0.36, 1], onUpdate: setN });
    return () => c.stop();
  }, [inView, reduce, to]);

  const shown = reduce ? to : n;
  return <span ref={ref}>{shown.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
}

export function InNumbers({ reduce }: { reduce: boolean }) {
  return (
    <section id="numbers" className="bg-(color:--gc-surface) px-5 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1320px]">
        <HorizonTitle
          reduce={reduce}
          aside={<AsideNote lines={["A dynamic economy. A skilled workforce. A thriving innovation ecosystem.", "A state with global aspirations."]} />}
        >
          Karnataka in Numbers
        </HorizonTitle>

        <ul className="mt-10 grid grid-cols-2 gap-y-10 rounded-3xl bg-white py-8 shadow-[0_14px_40px_rgba(13,34,83,0.06)] sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-(color:--gc-line)">
          {STATS.map(({ value, prefix, unit, suffix, decimals, label, text, icon: StatIcon, color }, i) => (
            <motion.li key={label} className="px-4 text-center" {...rise(reduce, 0.08 * i, 0.6)}>
              <motion.span
                className="relative mx-auto grid size-14 place-items-center rounded-2xl"
                style={{ background: `${color}14`, color }}
                initial={reduce ? false : { scale: 0.3, rotate: -40, opacity: 0 }}
                whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                viewport={{ once: true, amount: 0.8 }}
                transition={{ type: "spring", stiffness: 240, damping: 14, delay: 0.15 + i * 0.1 }}
              >
                <motion.span
                  className="grid place-items-center"
                  animate={reduce ? undefined : StatIcon === Gear ? { rotate: 360 } : { y: [0, -3, 0] }}
                  transition={StatIcon === Gear ? { duration: 8, repeat: Infinity, ease: "linear" } : { duration: 2.6 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <StatIcon size={30} weight="duotone" />
                </motion.span>
              </motion.span>
              <p className="mt-4 font-display text-[28px] leading-none font-extrabold whitespace-nowrap text-(color:--gc-ink) xl:text-[32px]">
                {prefix}
                <Count to={value} decimals={decimals} reduce={reduce} />
                {unit ? <span className="ml-1 text-[14px] xl:text-[15px]">{unit}</span> : null}
                {suffix}
              </p>
              <p className="mx-auto mt-2 max-w-[180px] text-[13px] leading-snug font-bold text-(color:--gc-ink-2)">{label}</p>
              <p className="mx-auto mt-1 max-w-[170px] text-[12.5px] leading-snug text-(color:--gc-muted)">{text}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
