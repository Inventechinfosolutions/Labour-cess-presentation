import { SquaresFour } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { useDesign } from "@/lib/design";
import { useLang } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { useVisibility } from "@/lib/visibility";

const ALL = { en: "All designs", kn: "ಎಲ್ಲಾ ವಿನ್ಯಾಸಗಳು" };
const HIDDEN = { en: "hidden from clients", kn: "ಗ್ರಾಹಕರಿಗೆ ಮರೆಮಾಡಲಾಗಿದೆ" };

export function DesignSwitcher() {
  const { t } = useLang();
  const { design } = useDesign();
  const { ready, designs, isHidden } = useVisibility();
  if (!ready) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 24 }}
      className="fixed bottom-4 left-1/2 z-40 flex items-center gap-1 rounded-full border border-line bg-white/95 p-1 shadow-[0_10px_30px_-10px_rgba(11,44,107,0.45)] backdrop-blur"
    >
      <Link
        to="/"
        title={t(ALL)}
        aria-label={t(ALL)}
        className="group flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold text-navy transition-colors hover:bg-brand hover:text-white"
      >
        <SquaresFour size={15} weight="bold" className="transition-transform duration-300 group-hover:rotate-90" />
        <span className="hidden sm:inline">{t(ALL)}</span>
      </Link>
      <span className="h-5 w-px bg-line" aria-hidden />
      {designs.map((d) => {
        const active = design === d.id;
        const name = `${t(d.label)} · ${t(d.style)}${isHidden(d.id) ? ` (${t(HIDDEN)})` : ""}`;
        return (
          <Link
            key={d.id}
            to={d.path}
            title={name}
            aria-label={name}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors lg:px-3.5",
              active ? "text-white" : "group text-navy hover:bg-brand hover:text-white",
              isHidden(d.id) && !active && "line-through decoration-red-500/70 opacity-60 hover:opacity-100",
            )}
          >
            {active && (
              <motion.span
                layoutId="design-pill"
                className="absolute inset-0 rounded-full bg-navy"
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
              />
            )}
            <span className="relative">
              <span className="md:hidden">{d.number}</span>
              <span className="hidden md:inline">{t(d.label)}</span>
              <span className={cn("ml-1 hidden font-normal 2xl:inline", active ? "text-white/70" : "text-muted group-hover:text-white/80")}>· {t(d.style)}</span>
            </span>
          </Link>
        );
      })}
    </motion.div>
  );
}
