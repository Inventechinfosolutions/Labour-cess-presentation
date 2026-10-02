import { useRef } from "react";
import { Link } from "react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { CaretRight, type Icon } from "@phosphor-icons/react";
import { KARNATAKA_DISTRICTS } from "@/lib/karnatakaMap";
import type { PathwayId } from "@/lib/pathways";
import { cn } from "@/lib/utils";
import { EASE, useCycle } from "@/components/heritage/motion";
import { HZ_COLOR } from "../palette";
import { DottedWorld, SaffronButton } from "../parts";

export type HorizonHeroProps = {
  pathway: PathwayId;
  crumb: string;
  eyebrow: string;
  eyebrowIcon: Icon;
  title: [string, string];
  sub: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  chips: { icon: Icon; label: string }[];
  photo: string;
  photoAlt: string;
  facts: [Fact, Fact, Fact];
  reduce: boolean;
};

type Fact = { icon: Icon; value: string; label: string };

const FACT_SPOTS = ["top-[8%] -left-[2%]", "top-[42%] -right-[3%]", "bottom-[5%] left-[3%]"];

export function HorizonPageHero({
  pathway,
  crumb,
  eyebrow,
  eyebrowIcon: EyebrowIcon,
  title,
  sub,
  primary,
  secondary,
  chips,
  photo,
  photoAlt,
  facts,
  reduce,
}: HorizonHeroProps) {
  const { c, soft } = HZ_COLOR[pathway];
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const visualY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const active = useCycle(facts.length, 1800, !reduce);

  const enter = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 18 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: EASE },
  });

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-gradient-to-b from-[#f3f7ff] to-white pt-[76px]">
      <DottedWorld className="absolute top-14 right-[-6%] -z-10 w-[70%] opacity-80" />
      <div
        aria-hidden
        className="absolute top-[45%] left-[68%] -z-10 size-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: `radial-gradient(circle, ${c}22, transparent 64%)` }}
      />

      <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-5 pt-8 pb-16 lg:grid-cols-[minmax(0,500px)_1fr] lg:px-8 lg:pt-10">
        <motion.div className="relative z-10" style={reduce ? undefined : { y: textY }}>
          <motion.nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12.5px] text-(color:--gc-body)" {...enter(0)}>
            <Link to="/global-connect" className="transition hover:text-(color:--gc-primary)">
              Home
            </Link>
            <CaretRight size={11} />
            <span className="font-semibold text-(color:--gc-ink)">{crumb}</span>
          </motion.nav>
          <motion.p
            className="mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11.5px] font-extrabold tracking-[0.16em] uppercase"
            style={{ background: soft, color: c }}
            {...enter(0.08)}
          >
            <EyebrowIcon size={15} weight="fill" />
            {eyebrow}
          </motion.p>
          <h1 className="mt-5 font-display text-[38px] leading-[1.1] font-extrabold text-(color:--gc-ink) sm:text-[50px] xl:text-[56px]">
            <motion.span className="block" {...enter(0.16)}>
              {title[0]}
            </motion.span>
            <motion.span className="relative inline-block" style={{ color: c }} {...enter(0.28)}>
              {title[1]}
              <svg viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden className="absolute -bottom-2 left-0 h-3 w-full overflow-visible">
                <motion.path
                  d="M4 11 C 90 2, 210 2, 296 9"
                  fill="none"
                  stroke="#f5ae1b"
                  strokeWidth={4}
                  strokeLinecap="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
                />
              </svg>
            </motion.span>
          </h1>
          <motion.p className="mt-6 max-w-[450px] text-[16.5px] leading-relaxed text-(color:--gc-body)" {...enter(0.4)}>
            {sub}
          </motion.p>
          <motion.div className="mt-8 flex flex-wrap gap-3" {...enter(0.5)}>
            <SaffronButton href={primary.href} reduce={reduce}>
              {primary.label}
            </SaffronButton>
            <a
              href={secondary.href}
              className="inline-flex items-center rounded-full border border-(color:--gc-ink)/30 bg-white px-6 py-3 text-[14.5px] font-semibold text-(color:--gc-ink) transition hover:border-(color:--gc-primary) hover:text-(color:--gc-primary)"
            >
              {secondary.label}
            </a>
          </motion.div>
          <ul className="mt-9 flex flex-wrap gap-2.5">
            {chips.map(({ icon: ChipIcon, label }, i) => (
              <motion.li
                key={label}
                className="flex items-center gap-2 rounded-full bg-white py-1 pr-3.5 pl-1 text-[13px] font-semibold text-(color:--gc-ink-2) shadow-sm ring-1 ring-(color:--gc-line)"
                {...enter(0.62 + i * 0.07)}
              >
                <span className="grid size-7 place-items-center rounded-full" style={{ background: soft, color: c }}>
                  <ChipIcon size={15} weight="duotone" />
                </span>
                {label}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div className="relative mx-auto aspect-[600/540] w-full max-w-[600px]" style={reduce ? undefined : { y: visualY }}>
          <motion.svg
            viewBox="0 0 200 200"
            aria-hidden
            className="absolute -top-[4%] right-[2%] w-[42%]"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="100" cy="100" r="92" fill="none" stroke={c} strokeOpacity={0.45} strokeWidth={1.5} strokeDasharray="4 8" />
            <circle cx="100" cy="8" r="5" fill={c} />
          </motion.svg>

          <motion.div
            aria-hidden
            className="absolute top-[9%] right-[6%] bottom-[3%] left-[18%] rounded-[40px]"
            style={{ background: soft }}
            initial={reduce ? false : { opacity: 0, x: 24, y: 24 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
          />
          <motion.div
            className="absolute top-[3%] right-[12%] bottom-[9%] left-[12%] overflow-hidden rounded-[40px] rounded-tr-[120px] shadow-[0_30px_60px_rgba(13,34,83,0.22)] ring-4 ring-white"
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.15, ease: EASE }}
          >
            <motion.img
              src={photo}
              alt={photoAlt}
              className="size-full object-cover"
              animate={reduce ? undefined : { scale: [1.04, 1.14, 1.04], x: ["0%", "-2%", "0%"] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0c2459]/45 to-transparent" />
          </motion.div>

          <svg viewBox="0 0 600 540" aria-hidden className="absolute inset-0 size-full overflow-visible">
            <path
              d="M470 470 C 520 470, 560 440, 560 400"
              fill="none"
              stroke="#f5ae1b"
              strokeWidth={2}
              strokeDasharray="5 6"
              className={reduce ? undefined : "animate-[dash-flow_1.2s_linear_infinite]"}
            />
          </svg>
          <motion.div
            className="absolute right-[1%] bottom-[20%] grid size-[76px] place-items-center rounded-full bg-white shadow-[0_14px_30px_rgba(13,34,83,0.18)]"
            initial={reduce ? false : { opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 15, delay: 1 }}
          >
            {!reduce ? (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full border-2 border-(color:--gc-gold-3)"
                animate={{ scale: [1, 1.35], opacity: [0.7, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            ) : null}
            <svg viewBox="-8 -8 316 489" className="h-[46px] w-auto" aria-label="Karnataka">
              {KARNATAKA_DISTRICTS.map((d) => (
                <path key={d.name} d={d.d} fill="#f5ae1b" stroke="#f5ae1b" strokeWidth={6} />
              ))}
            </svg>
          </motion.div>

          {facts.map(({ icon: FactIcon, value, label }, i) => {
            const on = i === active;
            return (
              <motion.div
                key={label}
                className={cn("absolute", FACT_SPOTS[i])}
                initial={reduce ? false : { opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.8 + i * 0.15, ease: EASE }}
              >
                <motion.div
                  className={cn(
                    "flex items-center gap-2.5 rounded-2xl border bg-white px-3 py-2.5 transition-[box-shadow,border-color] duration-500",
                    on ? "shadow-[0_18px_36px_rgba(13,34,83,0.2)]" : "border-white shadow-[0_10px_24px_rgba(13,34,83,0.12)]",
                  )}
                  style={{ borderColor: on ? c : undefined }}
                  animate={reduce ? undefined : { y: on ? -8 : [0, -4, 0] }}
                  transition={on ? { duration: 0.4 } : { duration: 3.2 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-500"
                    style={on ? { background: c, color: "#fff" } : { background: soft, color: c }}
                  >
                    <FactIcon size={20} weight="fill" />
                  </span>
                  <span className="leading-tight">
                    <span className="block font-display text-[15px] font-extrabold whitespace-nowrap text-(color:--gc-ink)">{value}</span>
                    <span className="block text-[11.5px] whitespace-nowrap text-(color:--gc-body)">{label}</span>
                  </span>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
