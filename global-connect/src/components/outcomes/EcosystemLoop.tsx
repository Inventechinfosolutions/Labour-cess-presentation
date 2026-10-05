import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ArrowsClockwise, CheckCircle } from "@phosphor-icons/react";
import { LOOP } from "@/lib/outcomes";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const N = LOOP.length;
const C = 300;
const R = 212;
const LABEL_R = 268;
const CIRC = 2 * Math.PI * R;

const PRINCIPLES = [
  "A continuous programme, not a one-time website.",
  "Every enquiry is followed up until it becomes an outcome.",
  "Each success attracts the next partner.",
];

const polar = (i: number, r: number) => {
  const a = ((-90 + (i * 360) / N) * Math.PI) / 180;
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a), cos: Math.cos(a) };
};

export function EcosystemLoop({
  heading,
  palette,
  reduce,
  className,
  id = "ecosystem",
}: {
  heading: ReactNode;
  palette: readonly string[];
  reduce: boolean;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused || !inView) return;
    const t = window.setInterval(() => setStep((s) => s + 1), 2200);
    return () => window.clearInterval(t);
  }, [reduce, paused, inView]);

  const active = step % N;
  const stage = LOOP[active];
  const color = palette[active % palette.length];
  const StageIcon = stage.icon;

  return (
    <section id={id} className={cn("relative overflow-hidden px-5 py-16 lg:px-8 lg:py-24", className)}>
      <div className="mx-auto grid max-w-[1320px] items-center gap-12 lg:grid-cols-[minmax(0,400px)_1fr]">
        <div>
          {heading}
          <ul className="mt-8 space-y-4">
            {PRINCIPLES.map((p, i) => (
              <motion.li
                key={p}
                className="flex items-start gap-3 text-[15px] leading-snug text-(color:--gc-ink-2)"
                initial={reduce ? false : { opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.12, ease: EASE }}
              >
                <CheckCircle size={22} weight="fill" className="mt-px shrink-0" style={{ color: palette[i * 3 % palette.length] }} />
                {p}
              </motion.li>
            ))}
          </ul>
        </div>

        <div ref={ref}>
          <div
            className="relative mx-auto hidden aspect-square w-full max-w-[560px] md:block"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
          >
            <svg viewBox="0 0 600 600" className="absolute inset-0 size-full overflow-visible" aria-hidden>
              <circle cx={C} cy={C} r={R} fill="none" stroke="var(--gc-ink)" strokeOpacity={0.08} strokeWidth={10} />
              <circle
                cx={C}
                cy={C}
                r={R}
                fill="none"
                stroke={color}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={reduce ? 0 : CIRC * (1 - (active + 1) / N)}
                transform={`rotate(-90 ${C} ${C})`}
                style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1), stroke 0.6s" }}
              />
              <circle
                cx={C}
                cy={C}
                r={R - 34}
                fill="none"
                stroke="var(--gc-ink)"
                strokeOpacity={0.12}
                strokeDasharray="3 7"
                className={reduce ? undefined : "animate-[dash-flow_1.6s_linear_infinite]"}
              />
            </svg>

            {(() => {
              const p = polar(N - 0.5, R);
              return (
                <span
                  className="absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-(color:--gc-ink) shadow-md ring-1 ring-(color:--gc-line)"
                  style={{ left: `${(p.x / 600) * 100}%`, top: `${(p.y / 600) * 100}%` }}
                  title="The cycle begins again"
                >
                  <ArrowsClockwise size={16} weight="bold" />
                </span>
              );
            })()}

            {LOOP.map(({ title, icon: NodeIcon }, i) => {
              const p = polar(i, R);
              const l = polar(i, LABEL_R);
              const on = i === active;
              const done = reduce || i < active;
              const c = palette[i % palette.length];
              const side = l.cos > 0.25 ? "right" : l.cos < -0.25 ? "left" : "mid";
              return (
                <div key={title}>
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - active + i)}
                    aria-label={`${i + 1}. ${title}`}
                    className={cn(
                      "absolute grid size-[52px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] bg-white transition-all duration-500",
                      on && "scale-[1.18] shadow-[0_12px_28px_rgba(0,0,0,0.18)]",
                    )}
                    style={{
                      left: `${(p.x / 600) * 100}%`,
                      top: `${(p.y / 600) * 100}%`,
                      borderColor: on || done ? c : "color-mix(in srgb, var(--gc-ink) 14%, transparent)",
                      background: on ? c : "#fff",
                      color: on ? "#fff" : done ? c : "var(--gc-muted)",
                    }}
                  >
                    <NodeIcon size={22} weight={on ? "fill" : "duotone"} />
                    {on && !reduce ? (
                      <motion.span
                        key={`pulse-${step}`}
                        aria-hidden
                        className="absolute inset-[-6px] rounded-full border-2"
                        style={{ borderColor: c }}
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                      />
                    ) : null}
                  </button>
                  <span
                    className={cn(
                      "absolute max-w-[120px] text-[12.5px] leading-tight font-bold transition-colors duration-500",
                      side === "right" && "-translate-y-1/2 pl-3 text-left",
                      side === "left" && "-translate-x-full -translate-y-1/2 pr-3 text-right",
                      side === "mid" && "-translate-x-1/2 -translate-y-1/2 text-center",
                    )}
                    style={{
                      left: `${(l.x / 600) * 100}%`,
                      top: `${(l.y / 600) * 100}%`,
                      color: on ? c : "var(--gc-ink-2)",
                    }}
                  >
                    {title}
                  </span>
                </div>
              );
            })}

            <div className="absolute top-1/2 left-1/2 grid w-[50%] -translate-x-1/2 -translate-y-1/2 items-center text-center">
              <AnimatePresence initial={false}>
                <motion.div
                  key={active}
                  style={{ gridArea: "1 / 1" }}
                  initial={reduce ? false : { opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.25 } }}
                  transition={{ duration: 0.45, delay: 0.1, ease: EASE }}
                >
                  <span className="mx-auto grid size-14 place-items-center rounded-2xl text-white shadow-lg" style={{ background: color }}>
                    <StageIcon size={28} weight="fill" />
                  </span>
                  <p className="mt-3 text-[12px] font-extrabold tracking-[0.18em]" style={{ color }}>
                    {String(active + 1).padStart(2, "0")} / {N}
                  </p>
                  <p className="mt-1 font-display text-[22px] leading-tight font-bold text-(color:--gc-ink) lg:text-[24px]">{stage.title}</p>
                  <p className="mt-2 text-[13.5px] leading-snug text-(color:--gc-body)">{stage.text}</p>
                  {active === N - 1 ? (
                    <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-(color:--gc-ink)/5 px-3 py-1 text-[12px] font-bold text-(color:--gc-ink)">
                      <ArrowsClockwise size={13} weight="bold" />
                      Back to Build network
                    </p>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <ol className="relative space-y-3 md:hidden">
            {LOOP.map(({ title, text, icon: RowIcon }, i) => {
              const c = palette[i % palette.length];
              return (
                <li key={title} className="flex items-start gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full text-white" style={{ background: c }}>
                    <RowIcon size={19} weight="fill" />
                  </span>
                  <span className="leading-snug">
                    <span className="block text-[14.5px] font-bold text-(color:--gc-ink)">
                      {i + 1}. {title}
                    </span>
                    <span className="block text-[13px] text-(color:--gc-body)">{text}</span>
                  </span>
                </li>
              );
            })}
            <li className="flex items-center gap-3 pl-1 text-[13.5px] font-bold text-(color:--gc-ink)">
              <ArrowsClockwise size={22} weight="bold" style={{ color: palette[0] }} />
              Back to Build network. The cycle continues.
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
