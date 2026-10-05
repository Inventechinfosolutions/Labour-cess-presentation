import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useInView } from "motion/react";
import { ArrowDown, ArrowRight, Info, Lightbulb } from "@phosphor-icons/react";
import { OUTCOMES, type OutcomeArea } from "@/lib/outcomes";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");

function Count({ to, reduce }: { to: number; reduce: boolean }) {
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (reduce) return;
    const c = animate(0, to, { duration: 1.1, ease: EASE, onUpdate: setN });
    return () => c.stop();
  }, [to, reduce]);
  return <>{fmt(reduce ? to : n)}</>;
}

function Funnel({ area, color, reduce }: { area: OutcomeArea; color: string; reduce: boolean }) {
  const max = Math.max(...area.stages.map((s) => s.value));
  const width = (v: number) => 22 + 78 * (Math.log10(v) / Math.log10(max));
  return (
    <ol className="space-y-1">
      {area.stages.map((s, i) => {
        const prev = area.stages[i - 1];
        const rate = prev && s.value <= prev.value ? Math.round((s.value / prev.value) * 100) : null;
        return (
          <li key={s.label}>
            {i > 0 ? (
              <div className="flex h-6 items-center pl-[calc(38%+8px)] text-[11.5px] font-semibold text-(color:--gc-muted) max-sm:pl-2">
                {rate !== null ? (
                  <motion.span
                    className="inline-flex items-center gap-1"
                    initial={reduce ? false : { opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.12 }}
                  >
                    <ArrowDown size={11} weight="bold" style={{ color }} />
                    {rate}% carried forward
                  </motion.span>
                ) : null}
              </div>
            ) : null}
            <div className="grid items-center gap-x-3 gap-y-1 sm:grid-cols-[38%_1fr]">
              <span className="text-[13.5px] leading-tight font-semibold text-(color:--gc-ink-2)">{s.label}</span>
              <div className="relative h-10">
                <motion.div
                  className="absolute inset-y-0 left-0 flex items-center justify-end rounded-lg pr-3 text-[14px] font-extrabold text-white"
                  style={{ background: color, opacity: 1 - i * 0.13 }}
                  initial={reduce ? false : { width: "0%" }}
                  animate={{ width: `${width(s.value)}%` }}
                  transition={{ duration: 0.9, delay: 0.1 + i * 0.12, ease: EASE }}
                >
                  <Count to={s.value} reduce={reduce} />
                </motion.div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Tiles({ area, color, reduce }: { area: OutcomeArea; color: string; reduce: boolean }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
      {area.stages.map((s, i) => (
        <motion.li
          key={s.label}
          className="rounded-2xl bg-white p-4 ring-1 ring-(color:--gc-line)"
          initial={reduce ? false : { opacity: 0, y: 16, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.08 * i, ease: EASE }}
        >
          <span aria-hidden className="block h-1 w-8 rounded-full" style={{ background: color }} />
          <p className="mt-3 font-display text-[26px] leading-none font-bold text-(color:--gc-ink)">
            <Count to={s.value} reduce={reduce} />
          </p>
          <p className="mt-2 text-[12.5px] leading-snug font-semibold text-(color:--gc-body)">{s.label}</p>
        </motion.li>
      ))}
    </ul>
  );
}

export function OutcomeFunnel({
  heading,
  palette,
  reduce,
  className,
  id = "outcomes",
}: {
  heading: ReactNode;
  palette: readonly string[];
  reduce: boolean;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const [tab, setTab] = useState(0);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (reduce || touched || !inView) return;
    const t = window.setInterval(() => setTab((v) => (v + 1) % OUTCOMES.length), 5000);
    return () => window.clearInterval(t);
  }, [reduce, touched, inView]);

  const area = OUTCOMES[tab];
  const color = palette[tab % palette.length];

  return (
    <section id={id} className={cn("relative overflow-hidden px-5 py-16 lg:px-8 lg:py-20", className)}>
      <div className="mx-auto max-w-[1320px]">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>{heading}</div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <p className="inline-flex flex-wrap items-center gap-2 text-[13.5px] font-semibold text-(color:--gc-ink-2)">
              <span className="rounded-full bg-(color:--gc-ink)/5 px-3 py-1 text-(color:--gc-muted) line-through decoration-2">Website visits</span>
              <ArrowRight size={14} weight="bold" />
              <span className="rounded-full px-3 py-1 text-white" style={{ background: color, transition: "background 0.5s" }}>
                Partnerships, investments and collaborations
              </span>
            </p>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-(color:--gc-muted)">
              <Info size={14} weight="fill" />
              Illustrative figures for the concept preview
            </span>
          </div>
        </div>

        <div ref={ref} className="mt-10 grid gap-6 lg:grid-cols-[290px_1fr]">
          <div role="tablist" aria-label="Outcome areas" className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:px-0">
            {OUTCOMES.map((o, i) => {
              const on = i === tab;
              const c = palette[i % palette.length];
              const TabIcon = o.icon;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => {
                    setTouched(true);
                    setTab(i);
                  }}
                  className={cn(
                    "relative flex shrink-0 items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-left transition-all duration-300",
                    on ? "bg-white shadow-[0_14px_30px_rgba(0,0,0,0.08)] ring-1 ring-(color:--gc-line)" : "hover:bg-white/60",
                  )}
                >
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-xl transition-colors duration-300"
                    style={on ? { background: c, color: "#fff" } : { background: `${c}1a`, color: c }}
                  >
                    <TabIcon size={20} weight={on ? "fill" : "duotone"} />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-[15px] font-bold text-(color:--gc-ink)">{o.title}</span>
                    <span className="hidden text-[12.5px] text-(color:--gc-body) lg:block">{o.line}</span>
                  </span>
                  {on && !reduce && !touched ? (
                    <motion.span
                      key={`timer-${tab}`}
                      aria-hidden
                      className="absolute bottom-0 left-0 h-[3px] origin-left"
                      style={{ background: c, width: "100%" }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 5, ease: "linear" }}
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div role="tabpanel" className="rounded-3xl bg-(color:--gc-surface) p-5 ring-1 ring-(color:--gc-line) sm:p-7">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={area.id}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <div className="mb-5 flex items-baseline justify-between gap-4">
                  <p className="font-display text-[20px] font-bold text-(color:--gc-ink)">{area.title}</p>
                  <p className="text-[13px] text-(color:--gc-body)">{area.line}</p>
                </div>
                {area.kind === "funnel" ? <Funnel area={area} color={color} reduce={reduce} /> : <Tiles area={area} color={color} reduce={reduce} />}
                <motion.p
                  className="mt-6 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 text-[14px] font-semibold text-(color:--gc-ink) ring-1 ring-(color:--gc-line)"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7, ease: EASE }}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full text-white" style={{ background: color }}>
                    <Lightbulb size={15} weight="fill" />
                  </span>
                  {area.note}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
