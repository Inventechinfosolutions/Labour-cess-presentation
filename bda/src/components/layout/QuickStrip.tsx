import { ArrowRight } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { OPEN_HOUSE, QUICK_STRIP } from "@/lib/content";
import { useDesign } from "@/lib/design";
import { useLang } from "@/lib/i18n";
import { cn, external } from "@/lib/utils";

export function QuickStrip() {
  const { t } = useLang();
  const { design, pick } = useDesign();
  if (design === "showcase" || design === "portal" || design === "civic" || design === "garden") return null;

  const withButton = design === "modern" || design === "geometric" || design === "orbit";
  const links = design === "geometric" || design === "orbit" ? QUICK_STRIP.slice(0, 8) : QUICK_STRIP;

  return (
    <div className={cn("border-b border-line", pick("bg-white", "bg-[#f8faff]"))}>
      <div className="mx-auto flex max-w-site items-center gap-4 px-5 lg:px-8">
        <ul
          className={cn(
            "no-scrollbar flex min-w-0 flex-1 items-center gap-x-6 overflow-x-auto py-2.5",
            withButton ? "xl:flex-wrap xl:gap-y-2 xl:overflow-visible" : "xl:grid xl:grid-cols-[repeat(6,auto)] xl:justify-between xl:gap-y-2 xl:py-3",
          )}
        >
          {links.map((l) => (
            <li key={l.label.en} className="shrink-0">
              <a href={l.href} {...external(l.href)} className="-mx-1.5 whitespace-nowrap rounded px-1.5 py-0.5 text-[13px] text-ink/75 transition-colors hover:bg-brand hover:text-white">
                {t(l.label)}
              </a>
            </li>
          ))}
        </ul>
        {withButton && (
          <motion.a
            href={OPEN_HOUSE.href}
            {...external(OPEN_HOUSE.href)}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="group relative my-1.5 hidden shrink-0 items-center gap-1.5 overflow-hidden rounded-md bg-brand px-3.5 py-1.5 text-[12.5px] font-semibold text-white shadow-sm transition-colors hover:bg-navy sm:flex"
          >
            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent" aria-hidden />
            <span className="relative whitespace-nowrap">{t(OPEN_HOUSE.label)}</span>
            <ArrowRight weight="bold" className="relative transition-transform group-hover:translate-x-0.5" />
          </motion.a>
        )}
      </div>
    </div>
  );
}
