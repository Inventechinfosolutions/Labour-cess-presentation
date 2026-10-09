import { motion } from "motion/react";
import { HIGHLIGHTS } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import { HIGHLIGHT_ICONS } from "@/lib/icons";
import { external } from "@/lib/utils";

const NEW = { en: "NEW", kn: "ಹೊಸದು" };
const EASE = [0.22, 1, 0.36, 1] as const;
const SPRING = { type: "spring", stiffness: 320, damping: 20 } as const;

export function Highlights() {
  const { t } = useLang();
  return (
    <div className="relative z-10 mx-auto -mt-10 max-w-site px-5 md:-mt-20 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.7, ease: EASE }}
        className="grid grid-cols-2 gap-1.5 rounded-2xl border border-line bg-white p-1.5 shadow-[0_12px_40px_-12px_rgba(11,44,107,0.25)] md:grid-cols-3 lg:grid-cols-6"
      >
        {HIGHLIGHTS.map((h, i) => {
          const Icon = HIGHLIGHT_ICONS[h.key];
          return (
            <motion.a
              key={h.key}
              href={h.href}
              {...external(h.href)}
              whileHover={{ scale: 1.08, y: -6 }}
              whileTap={{ scale: 1, y: 0 }}
              transition={SPRING}
              className="group relative flex flex-col items-center rounded-xl bg-white px-4 py-5 text-center ring-1 ring-transparent transition-[box-shadow,background-color] duration-300 hover:z-10 hover:bg-brand hover:shadow-[0_22px_40px_-14px_rgba(11,44,107,0.4)] hover:ring-brand/15 lg:py-6 lg:after:absolute lg:after:right-[-4px] lg:after:top-1/4 lg:after:h-1/2 lg:after:w-px lg:after:bg-line lg:last:after:hidden lg:hover:after:hidden"
            >
              <span className="absolute inset-x-3 top-0 h-1 origin-center scale-x-0 rounded-b-full bg-white/70 transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
              {h.isNew && (
                <span className="absolute right-2 top-2 animate-pulse rounded bg-new px-1.5 py-0.5 text-[9px] font-bold text-white">
                  {t(NEW)}
                </span>
              )}
              <motion.span
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + i * 0.07, duration: 0.5, ease: EASE }}
                className="flex flex-col items-center gap-1.5"
              >
                <span className="grid size-11 place-items-center rounded-full transition-colors duration-300 group-hover:bg-white/15">
                  <Icon weight="duotone" className="size-8 text-brand transition-[color,scale] duration-300 group-hover:scale-110 group-hover:text-white" />
                </span>
                <span className="mt-0.5 text-[13.5px] font-semibold leading-snug text-navy transition-colors group-hover:text-white">{t(h.title)}</span>
                <span className="text-[11.5px] leading-snug text-muted transition-colors group-hover:text-white/80">{t(h.sub)}</span>
              </motion.span>
            </motion.a>
          );
        })}
      </motion.div>
    </div>
  );
}
