import { AnimatePresence, motion } from "motion/react";
import { Buildings, CheckCircle, Stamp, Tray } from "@phosphor-icons/react";
import { EASE, useCycle } from "@/components/heritage/motion";
import { ACTIVITIES, DOCKET_STATIONS, KPIS, SAMPLE_DOCKET } from "@/lib/nri";
import { cn } from "@/lib/utils";

const C = 210;
const R = 158;

/** Department hub with its six activities orbiting around it. */
export function AboutArt({ palette, reduce }: { palette: readonly string[]; reduce: boolean }) {
  const active = useCycle(ACTIVITIES.length, 2000, !reduce);
  const shown = active < 0 ? 0 : active;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[440px]">
      <svg viewBox={`0 0 ${C * 2} ${C * 2}`} className="absolute inset-0 size-full" aria-hidden>
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--gc-line)" strokeWidth="2" />
        <motion.circle
          cx={C}
          cy={C}
          r={R - 34}
          fill="none"
          stroke="var(--gc-primary)"
          strokeOpacity="0.25"
          strokeWidth="1.5"
          strokeDasharray="4 8"
          style={{ transformOrigin: "center" }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        {ACTIVITIES.map((a, i) => {
          const ang = (i / ACTIVITIES.length) * Math.PI * 2 - Math.PI / 2;
          const x = C + Math.cos(ang) * R;
          const y = C + Math.sin(ang) * R;
          return (
            <motion.line
              key={a.title}
              x1={C}
              y1={C}
              x2={x}
              y2={y}
              stroke={palette[i]}
              strokeWidth={i === shown ? 2.5 : 1.2}
              strokeOpacity={i === shown ? 0.9 : 0.25}
              strokeDasharray={i === shown ? "0" : "3 5"}
              initial={reduce ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: EASE }}
            />
          );
        })}
      </svg>

      {ACTIVITIES.map((a, i) => {
        const ang = (i / ACTIVITIES.length) * Math.PI * 2 - Math.PI / 2;
        const left = ((C + Math.cos(ang) * R) / (C * 2)) * 100;
        const top = ((C + Math.sin(ang) * R) / (C * 2)) * 100;
        const Icon = a.icon;
        const on = i === shown;
        return (
          <motion.span
            key={a.title}
            className="absolute grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-white shadow-[0_12px_26px_-14px_rgba(10,30,70,0.6)] sm:size-16"
            style={{ left: `${left}%`, top: `${top}%`, background: palette[i] }}
            initial={reduce ? false : { opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: on ? 1.14 : 1 }}
            transition={{ duration: 0.5, delay: reduce ? 0 : 0.4 + i * 0.08, ease: EASE }}
          >
            <Icon weight="duotone" className="size-6 sm:size-7" />
          </motion.span>
        );
      })}

      <div className="absolute inset-[30%] grid place-items-center rounded-full bg-white text-center shadow-[0_24px_50px_-26px_rgba(10,30,70,0.55)] ring-1 ring-(color:--gc-line)">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full ring-2 ring-(color:--gc-primary)"
          animate={reduce ? undefined : { scale: [1, 1.12], opacity: [0.35, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
        <div className="grid justify-items-center px-3">
          <Buildings weight="duotone" className="size-8 text-(color:--gc-primary)" />
          <p className="mt-1 font-display text-[13px] leading-tight font-bold text-(color:--gc-ink) sm:text-[14px]">The Department</p>
          <div className="mt-1 grid h-8 w-full place-items-center">
            <AnimatePresence initial={false}>
              <motion.p
                key={shown}
                className="text-[11px] leading-tight font-semibold sm:text-[11.5px]"
                style={{ gridArea: "1 / 1", color: palette[shown] }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
              >
                {ACTIVITIES[shown].title}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/** A sample acknowledgement slip that gets stamped with a docket number. */
export function HelpArt({ palette, reduce }: { palette: readonly string[]; reduce: boolean }) {
  const step = useCycle(DOCKET_STATIONS.length, 1500, !reduce);
  const at = step < 0 ? 3 : step;
  return (
    <div className="relative mx-auto w-full max-w-[460px] py-6">
      <motion.div
        aria-hidden
        className="absolute inset-x-10 top-0 bottom-10 rotate-[-5deg] rounded-[22px] bg-[color-mix(in_srgb,var(--gc-primary)_12%,white)]"
        initial={reduce ? false : { rotate: 0, opacity: 0 }}
        animate={{ rotate: -5, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
      />
      <div className="relative rounded-[22px] bg-white p-6 shadow-[0_30px_60px_-30px_rgba(10,30,70,0.5)] ring-1 ring-(color:--gc-line) sm:p-7">
        <div className="flex items-center gap-2.5">
          <p className="text-[11px] font-bold tracking-[0.18em] text-(color:--gc-muted) uppercase">Acknowledgement</p>
          <span className="rounded-full border border-dashed border-(color:--gc-gold-4) px-2 py-0.5 text-[10px] font-bold tracking-[0.1em] text-(color:--gc-ink-2) uppercase">
            Sample
          </span>
        </div>
        <p className="mt-3 text-[13px] text-(color:--gc-body)">Docket number</p>
        <p className="font-display text-[22px] font-bold tracking-[-0.01em] text-(color:--gc-ink) sm:text-[24px]">{SAMPLE_DOCKET}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 text-[12.5px]">
          <p className="text-(color:--gc-muted)">
            Category
            <span className="block font-semibold text-(color:--gc-ink-2)">Property and land</span>
          </p>
          <p className="text-(color:--gc-muted)">
            Reply within
            <span className="block font-semibold text-(color:--gc-ink-2)">30 days</span>
          </p>
        </div>

        <div className="mt-6">
          <div className="relative flex items-center justify-between">
            <div aria-hidden className="absolute inset-x-2 top-1/2 h-[2px] -translate-y-1/2 bg-(color:--gc-line)" />
            <motion.div
              aria-hidden
              className="absolute top-1/2 left-2 h-[2px] -translate-y-1/2 bg-(color:--gc-primary)"
              animate={{ width: `calc(${(at / (DOCKET_STATIONS.length - 1)) * 100}% - 16px)` }}
              transition={{ duration: 0.6, ease: EASE }}
            />
            {DOCKET_STATIONS.map((s, i) => (
              <span
                key={s.title}
                className={cn("relative size-3.5 rounded-full ring-4 ring-white transition-colors duration-500")}
                style={{ background: i <= at ? palette[i % palette.length] : "var(--gc-line)" }}
              />
            ))}
          </div>
          <div className="mt-3 grid h-5 place-items-start">
            <AnimatePresence initial={false}>
              <motion.p
                key={at}
                className="text-[13px] font-semibold text-(color:--gc-ink-2)"
                style={{ gridArea: "1 / 1" }}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.3 }}
              >
                {DOCKET_STATIONS[at].title} · {DOCKET_STATIONS[at].text}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <motion.span
        aria-hidden
        className="absolute -top-1 right-2 grid size-[92px] rotate-[-14deg] place-items-center rounded-full border-[3px] border-(color:--gc-primary) bg-white/85 text-center text-(color:--gc-primary) sm:right-[-10px]"
        initial={reduce ? false : { scale: 2.2, opacity: 0, rotate: -30 }}
        animate={{ scale: 1, opacity: 1, rotate: -14 }}
        transition={{ duration: 0.45, delay: 0.9, ease: [0.5, 0, 0.2, 1.4] }}
      >
        <span className="grid justify-items-center">
          <Stamp weight="fill" className="size-6" />
          <span className="text-[9.5px] leading-tight font-extrabold tracking-[0.12em] uppercase">
            Docket
            <br />
            opened
          </span>
        </span>
      </motion.span>
    </div>
  );
}

const BARS = [62, 41, 33, 27, 18];

/** A stylised preview of the officer workspace. */
export function OfficerArt({ palette, reduce }: { palette: readonly string[]; reduce: boolean }) {
  const row = useCycle(4, 1600, !reduce);
  return (
    <div className="relative mx-auto w-full max-w-[500px]">
      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_34px_70px_-34px_rgba(10,30,70,0.55)] ring-1 ring-(color:--gc-line)">
        <div className="flex items-center gap-2 border-b border-(color:--gc-line) bg-(color:--gc-surface) px-4 py-2.5">
          {["#f26b5b", "#f5b83d", "#3ec27a"].map((c) => (
            <span key={c} className="size-2.5 rounded-full" style={{ background: c }} />
          ))}
          <p className="ml-2 text-[11.5px] font-semibold text-(color:--gc-muted)">Officer workspace · Concept view</p>
        </div>
        <div className="grid grid-cols-[64px_1fr]">
          <div className="grid content-start justify-items-center gap-4 border-r border-(color:--gc-line) py-4">
            {[Tray, Stamp, CheckCircle, Buildings].map((I, i) => (
              <span
                key={i}
                className={cn("grid size-9 place-items-center rounded-xl", i === 0 ? "bg-(color:--gc-primary) text-white" : "text-(color:--gc-muted)")}
              >
                <I weight="duotone" className="size-5" />
              </span>
            ))}
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {KPIS.map((k, i) => (
                <motion.div
                  key={k.label}
                  className="rounded-xl px-2.5 py-2"
                  style={{ background: `color-mix(in srgb, ${palette[i]} 10%, white)` }}
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.08, ease: EASE }}
                >
                  <p className="font-display text-[18px] font-bold" style={{ color: palette[i] }}>
                    {k.value}
                  </p>
                  <p className="text-[9.5px] leading-tight font-semibold text-(color:--gc-body)">{k.label}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-[1.3fr_1fr] gap-3">
              <div className="space-y-1.5">
                {[0, 1, 2, 3].map((r) => (
                  <div
                    key={r}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors duration-500",
                      r === row ? "bg-(color:--gc-primary-soft)" : "bg-(color:--gc-surface)",
                    )}
                  >
                    <span className="size-2 rounded-full" style={{ background: palette[r + 1] }} />
                    <span className="h-1.5 flex-1 rounded-full bg-(color:--gc-line)" />
                    <span className="h-1.5 w-8 rounded-full" style={{ background: `color-mix(in srgb, ${palette[r + 1]} 45%, white)` }} />
                  </div>
                ))}
              </div>
              <div className="flex items-end gap-1.5 rounded-lg bg-(color:--gc-surface) px-2.5 pt-3 pb-2">
                {BARS.map((b, i) => (
                  <motion.span
                    key={i}
                    className="flex-1 origin-bottom rounded-t-md"
                    style={{ height: `${b + 20}%`, background: palette[i] }}
                    initial={reduce ? false : { scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.7, delay: 0.6 + i * 0.08, ease: EASE }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="absolute -bottom-3 left-6 rounded-full bg-(color:--gc-ink) px-3 py-1 text-[11px] font-bold tracking-[0.1em] text-white uppercase">
        Illustration only
      </span>
    </div>
  );
}
