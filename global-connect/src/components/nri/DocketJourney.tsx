import { useState } from "react";
import { motion } from "motion/react";
import { FileText } from "@phosphor-icons/react";
import { EASE, useCycle } from "@/components/heritage/motion";
import { DOCKET_STATIONS } from "@/lib/nri";
import { cn } from "@/lib/utils";

/** Seven stations a docket passes through, with a file that travels between them. */
export function DocketJourney({ palette, reduce }: { palette: readonly string[]; reduce: boolean }) {
  const [paused, setPaused] = useState(false);
  const step = useCycle(DOCKET_STATIONS.length, 1800, !reduce && !paused);
  const at = step < 0 ? DOCKET_STATIONS.length - 1 : step;
  const n = DOCKET_STATIONS.length;
  const pct = (i: number) => (i / (n - 1)) * 100;

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative hidden px-[7%] pt-12 lg:block">
        <div className="relative h-[2px] bg-(color:--gc-line)">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-(color:--gc-primary) to-(color:--gc-accent)"
            animate={{ width: `${pct(at)}%` }}
            transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
          />
          <motion.span
            aria-hidden
            className="absolute -top-11 grid size-9 -translate-x-1/2 place-items-center rounded-lg bg-(color:--gc-ink) text-white shadow-lg"
            animate={{ left: `${pct(at)}%` }}
            transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
          >
            <FileText weight="fill" className="size-5" />
            <span className="absolute -bottom-1 size-2 rotate-45 bg-(color:--gc-ink)" />
          </motion.span>
        </div>
        <div className="relative mt-[-17px] h-[130px]">
          {DOCKET_STATIONS.map((s, i) => {
            const Icon = s.icon;
            const done = i <= at;
            return (
              <div
                key={s.title}
                className="absolute flex w-[150px] -translate-x-1/2 flex-col items-center text-center"
                style={{ left: `${pct(i)}%` }}
              >
                <motion.span
                  className="grid size-8 place-items-center rounded-full text-white ring-4 ring-white"
                  animate={{ scale: i === at ? 1.25 : 1, background: done ? palette[i % palette.length] : "#cfd7e4" }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon weight="bold" className="size-4" />
                </motion.span>
                <p className={cn("mt-3 font-display text-[15px] font-bold transition-colors", done ? "text-(color:--gc-ink)" : "text-(color:--gc-muted)")}>
                  {s.title}
                </p>
                <p className={cn("mt-1 text-[12.5px] leading-snug text-(color:--gc-body) transition-opacity duration-500", i === at ? "opacity-100" : "opacity-60")}>
                  {s.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <ol className="relative space-y-5 border-l-2 border-(color:--gc-line) pl-7 lg:hidden">
        {DOCKET_STATIONS.map((s, i) => {
          const Icon = s.icon;
          return (
            <li key={s.title} className="relative">
              <span
                className="absolute top-0 -left-[45px] grid size-8 place-items-center rounded-full text-white ring-4 ring-white"
                style={{ background: palette[i % palette.length] }}
              >
                <Icon weight="bold" className="size-4" />
              </span>
              <p className="font-display text-[15.5px] font-bold text-(color:--gc-ink)">{s.title}</p>
              <p className="text-[13.5px] text-(color:--gc-body)">{s.text}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
