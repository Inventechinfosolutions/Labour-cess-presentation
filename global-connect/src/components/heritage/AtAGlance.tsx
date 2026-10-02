import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView } from "motion/react";
import { Buildings, Coins, GlobeHemisphereEast, Lightbulb, UsersThree, type Icon } from "@phosphor-icons/react";
import { rise } from "./motion";

const STATS: {
  value: number;
  prefix?: string;
  unit?: string;
  suffix: string;
  decimals?: number;
  label: string;
  text: string;
  icon: Icon;
}[] = [
  { value: 25, prefix: "₹", unit: "lakh crore", suffix: "+", label: "GSDP", text: "Among India's leading economies", icon: Coins },
  { value: 1.6, suffix: "M+", decimals: 1, label: "Skilled workforce", text: "A strong and diverse talent base", icon: UsersThree },
  { value: 40, suffix: "+", label: "Global capability centres", text: "Driving innovation and growth", icon: Buildings },
  { value: 5000, suffix: "+", label: "Startups", text: "Building solutions for a better tomorrow", icon: Lightbulb },
  { value: 100, suffix: "+", label: "Countries", text: "Connected through people, business and ideas", icon: GlobeHemisphereEast },
];

function Count({ to, decimals = 0, reduce }: { to: number; decimals?: number; reduce: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.8 });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (reduce || !inView) return;
    const c = animate(0, to, { duration: 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: setN });
    return () => c.stop();
  }, [inView, reduce, to]);

  const shown = reduce ? to : n;
  return <span ref={ref}>{shown.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>;
}

export function AtAGlance({ reduce }: { reduce: boolean }) {
  return (
    <section className="bg-[#fffdf8] px-5 py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-[1320px] items-center gap-10 lg:grid-cols-[300px_1fr]">
        <div>
          <motion.h2 className="font-display text-[34px] leading-[1.1] font-bold text-(color:--gc-ink) sm:text-[40px]" {...rise(reduce)}>
            Karnataka at a Glance
          </motion.h2>
          <motion.span aria-hidden className="mt-3 block h-[2px] w-14 bg-(color:--gc-gold-3)" {...rise(reduce, 0.1)} />
          <motion.p className="mt-4 max-w-[280px] text-[15.5px] leading-relaxed text-(color:--gc-body)" {...rise(reduce, 0.15)}>
            A dynamic economy. A vibrant talent pool. A growing global presence.
          </motion.p>
        </div>

        <ul className="grid grid-cols-2 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-(color:--gc-line)">
          {STATS.map(({ value, prefix, unit, suffix, decimals, label, text, icon: StatIcon }, i) => (
            <motion.li key={label} className="px-4 text-center" {...rise(reduce, 0.08 * i, 0.6)}>
              <StatIcon size={30} weight="duotone" className="mx-auto text-(color:--gc-gold-4)" />
              <p className="mt-3 font-display text-[30px] leading-none font-bold whitespace-nowrap text-(color:--gc-ink) xl:text-[34px]">
                {prefix}
                <Count to={value} decimals={decimals} reduce={reduce} />
                {unit ? <span className="ml-1 text-[15px] xl:text-[16px]">{unit}</span> : null}
                {suffix}
              </p>
              <p className="mt-2 text-[13.5px] font-semibold text-(color:--gc-ink-2)">{label}</p>
              <p className="mx-auto mt-1 max-w-[170px] text-[12.5px] leading-snug text-(color:--gc-muted)">{text}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
