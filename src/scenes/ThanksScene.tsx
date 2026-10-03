import { motion, useReducedMotion } from "motion/react";
import { KaMark } from "@/components/SlideKit";
import stageBg from "@/assets/core-stage-bg.jpg";

const ease = [0.22, 1, 0.36, 1] as const;
const INK = "#0b2462";

/** Closing slide shown after the delivery milestones. */
export function ThanksScene() {
  const reduce = !!useReducedMotion();
  const from = <T extends object>(v: T) => (reduce ? false : v);

  return (
    <div className="h-full min-h-0 text-[#23395f]">
      <div className="relative h-full min-h-0 overflow-hidden rounded-[22px] shadow-[inset_0_1px_0_#fff,0_3px_0_#d6e3f2,0_22px_44px_-16px_rgba(0,70,140,0.35)] ring-1 ring-white">
        <img src={stageBg} alt="" aria-hidden draggable={false} className="pointer-events-none absolute inset-0 size-full object-cover object-[center_55%] select-none" />
        <span aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(240,249,255,0.6)_0%,rgba(240,249,255,0.1)_24%,rgba(240,249,255,0)_60%,rgba(240,249,255,0.18)_100%)]" />

        <motion.section
          className="relative z-10 grid h-full min-h-0 place-items-center overflow-hidden px-6 text-center"
          initial={from({ opacity: 0 })}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_45%,rgba(255,255,255,0.92),rgba(240,249,255,0.75)_60%,rgba(232,244,253,0.55)_100%)]" />
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#2f7df0]/15"
              style={{ width: `min(${44 + i * 22}vh, ${40 + i * 20}vw)` }}
              initial={from({ scale: 0.6, opacity: 0 })}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.9, ease }}
            />
          ))}

          <div className="relative flex flex-col items-center">
            <motion.div
              className="relative grid size-[clamp(72px,13vh,120px)] place-items-center"
              initial={from({ scale: 0.5, opacity: 0 })}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 220, damping: 16 }}
            >
              {!reduce &&
                [0, 1].map((i) => (
                  <motion.span
                    key={i}
                    aria-hidden
                    className="absolute inset-[8%] rounded-full border border-[#f0c14a]/70"
                    animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                    transition={{ delay: 1 + i * 0.9, duration: 2.2, repeat: Infinity, repeatDelay: 1.6, ease: "easeOut" }}
                  />
                ))}
              <KaMark className="relative size-full shadow-[0_0_0_4px_rgba(240,193,74,0.25),0_14px_28px_-10px_rgba(11,36,98,0.45)]" />
            </motion.div>

            <motion.h2
              className="font-display mt-[2.2vh] text-[length:clamp(40px,min(7vw,11vh),104px)] leading-none font-black tracking-[-0.02em] uppercase"
              style={{ color: INK }}
              initial={from({ opacity: 0, y: 24, filter: "blur(8px)" })}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.45, duration: 0.7, ease }}
            >
              Thank{" "}
              <span className="rounded-xl bg-[#f5b21b] px-[0.2em] text-navy-deep">You</span>
            </motion.h2>

            <motion.div
              aria-hidden
              className="mt-[2vh] h-[3px] w-[min(320px,50vw)] origin-center rounded-full bg-[linear-gradient(90deg,transparent,#f0c14a,#2f7df0,transparent)]"
              initial={from({ scaleX: 0 })}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.8, duration: 0.7, ease }}
            />
          </div>
        </motion.section>
      </div>
    </div>
  );
}
