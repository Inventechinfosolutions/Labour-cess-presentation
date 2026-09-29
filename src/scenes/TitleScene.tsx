import { motion, useReducedMotion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { KaMark } from "@/components/SlideKit";
import { Buildings, ChartLineUp, ShieldCheck, UsersThree } from "@/lib/icons";

const PILLARS = [
  { label: "Registered workers", Icon: UsersThree },
  { label: "Construction projects", Icon: Buildings },
  { label: "CESS compliance", Icon: ShieldCheck },
  { label: "Worker welfare", Icon: ChartLineUp },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

export function TitleScene() {
  const reduce = useReducedMotion();

  return (
    <section className="relative grid h-full place-items-center overflow-hidden bg-[radial-gradient(1200px_700px_at_70%_20%,var(--color-navy-mid)_0%,var(--color-navy-deep)_55%,var(--color-navy-ink)_100%)] px-4 text-center text-white sm:px-8">
      <div className="relative z-10 w-full max-w-4xl py-6">
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: easeOut }}
        >
          <KaMark className="mx-auto mb-4 size-16 shadow-[0_0_0_6px_rgba(240,193,74,0.15)] sm:mb-5 sm:size-24 sm:shadow-[0_0_0_8px_rgba(240,193,74,0.15)]" />
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45, ease: easeOut }}
        >
          <div className="mb-1 text-[10px] font-bold tracking-[0.18em] text-teal-bright uppercase sm:text-[11px]">
            Government of Karnataka
          </div>
          <div className="mx-auto mb-3 max-w-3xl text-[12px] font-semibold tracking-wide text-white/85 sm:mb-5 sm:text-sm">
            Karnataka Building and Other Construction Workers Welfare Board
          </div>
          <div className="mb-2 text-[10px] font-bold tracking-[0.2em] text-gold uppercase sm:mb-3 sm:text-xs">
            Labour Department · CESS
          </div>
        </motion.div>

        <motion.h1
          className="font-display text-[1.85rem] leading-[1.1] font-extrabold tracking-tight sm:text-5xl md:text-6xl"
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.5, ease: easeOut }}
        >
          Labour CESS Tracking &amp; Monitoring
        </motion.h1>

        <motion.p
          className="mx-auto mt-3 max-w-xl text-[13px] text-white/75 sm:mt-4 sm:text-base"
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.45, ease: easeOut }}
        >
          One Central Platform for projects, CESS demand, payment and remittance — in support of worker welfare in Karnataka.
        </motion.p>

        <div className="mt-5 flex flex-wrap justify-center gap-2 sm:mt-8 sm:gap-3">
          {PILLARS.map((item, i) => (
            <motion.div
              key={item.label}
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 + i * 0.08, duration: 0.4, ease: easeOut }}
            >
              <Badge className="gap-1.5 border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-normal text-white normal-case sm:px-4 sm:py-1.5 sm:text-sm">
                <item.Icon weight="duotone" className="size-3.5 text-gold sm:size-4" />
                {item.label}
              </Badge>
            </motion.div>
          ))}
        </div>
      </div>
      <p className="absolute inset-x-3 bottom-16 text-[11px] text-white/70 sm:bottom-24 sm:text-sm">
        <span className="sm:hidden">Tap to proceed</span>
        <span className="hidden sm:inline">
          Press <kbd className="mx-1 rounded border border-white/25 px-1.5 py-0.5">Space</kbd> or click to proceed ·{" "}
          <kbd className="mx-1 rounded border border-white/25 px-1.5 py-0.5">F</kbd> fullscreen
        </span>
      </p>
    </section>
  );
}
