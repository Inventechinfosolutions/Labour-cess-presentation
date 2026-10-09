import { ArrowRight, TreeStructure } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Container, EASE } from "@/components/home/shared";
import { useDesign } from "@/lib/design";
import { AREAS, IA_STATS } from "@/lib/ia";
import { useLang, type Text } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });

const TEXT = {
  badge: t2("New", "ಹೊಸದು"),
  kicker: t2("Sitemap", "ಸೈಟ್‌ಮ್ಯಾಪ್"),
  title: t2("Find any page on the new BDA website", "ಹೊಸ ಬಿಡಿಎ ಜಾಲತಾಣದ ಯಾವುದೇ ಪುಟವನ್ನು ಹುಡುಕಿ"),
  sub: t2(
    "Every service, department and document, arranged in one clear structure.",
    "ಎಲ್ಲಾ ಸೇವೆಗಳು, ವಿಭಾಗಗಳು ಮತ್ತು ದಾಖಲೆಗಳು ಒಂದೇ ಸ್ಪಷ್ಟ ರಚನೆಯಲ್ಲಿ.",
  ),
  areas: t2("main areas", "ಮುಖ್ಯ ವಿಭಾಗಗಳು"),
  pages: t2("pages", "ಪುಟಗಳು"),
  fresh: t2("new pages", "ಹೊಸ ಪುಟಗಳು"),
  open: t2("Open Sitemap", "ಸೈಟ್‌ಮ್ಯಾಪ್ ತೆರೆಯಿರಿ"),
};

/** A pulsing "New" badge used wherever the sitemap is promoted. */
export function NewBadge({ className }: { className?: string }) {
  const { t } = useLang();
  return (
    <span className={cn("relative inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-navy", className)}>
      <span className="relative flex size-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-navy/60" />
        <span className="relative size-1.5 rounded-full bg-navy" />
      </span>
      {t(TEXT.badge)}
    </span>
  );
}

const SHELL = {
  portal: "rounded-2xl",
  civic: "rounded-[28px]",
  garden: "rounded-[28px] backdrop-blur-md",
} as const;

export function SitemapCallout({ className }: { className?: string }) {
  const { t } = useLang();
  const { design } = useDesign();
  const shell = SHELL[design as keyof typeof SHELL] ?? SHELL.portal;
  const stats = [
    { value: AREAS.length, label: TEXT.areas },
    { value: IA_STATS.total, label: TEXT.pages },
    { value: IA_STATS.fresh, label: TEXT.fresh },
  ];

  return (
    <Container className={cn("pt-8 md:pt-10", className)}>
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className={cn("relative overflow-hidden p-[2px] shadow-[0_22px_50px_-28px_rgba(11,44,107,0.55)]", shell)}
      >
        <motion.span
          aria-hidden
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 aspect-square w-[160%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,#1d4ed8,#38bdf8,#fbbf24,#1d4ed8,#38bdf8,#fbbf24,#1d4ed8)]"
        />
        <Link
          to="/sitemap"
          className={cn(
            "group relative grid items-center gap-5 bg-white/95 p-5 transition-colors duration-300 hover:bg-brand md:grid-cols-[auto_minmax(0,1fr)_auto] md:p-6",
            shell,
            "[border-radius:inherit]",
          )}
        >
          <span className="relative grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-bright text-white shadow-lg ring-4 ring-brand/15 transition-colors group-hover:from-white group-hover:to-white group-hover:text-brand group-hover:ring-white/25">
            <TreeStructure weight="duotone" className="size-8" />
            <NewBadge className="absolute -right-3 -top-2" />
          </span>

          <span className="min-w-0">
            <span className="block text-[11.5px] font-bold uppercase tracking-[0.18em] text-brand transition-colors group-hover:text-white/80">{t(TEXT.kicker)}</span>
            <span className="mt-0.5 block font-display text-lg font-bold leading-snug text-navy transition-colors group-hover:text-white md:text-[1.35rem]">{t(TEXT.title)}</span>
            <span className="mt-1 block text-[13px] text-muted transition-colors group-hover:text-white/85">{t(TEXT.sub)}</span>
            <span className="mt-3 flex flex-wrap gap-1.5">
              {AREAS.map((a, i) => (
                <motion.span
                  key={a.key}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.25 + i * 0.05 }}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 text-[11.5px] font-semibold text-navy transition-colors group-hover:bg-white/15 group-hover:text-white"
                >
                  <a.icon weight="duotone" className="size-3.5 text-brand transition-colors group-hover:text-white" />
                  {t(a.label)}
                </motion.span>
              ))}
            </span>
          </span>

          <span className="flex flex-wrap items-center gap-4 md:flex-col md:items-end">
            <span className="flex gap-4">
              {stats.map((s) => (
                <span key={s.label.en} className="text-center">
                  <span className="block font-display text-2xl font-bold leading-none text-navy transition-colors group-hover:text-white">{s.value}</span>
                  <span className="mt-1 block text-[11px] text-muted transition-colors group-hover:text-white/80">{t(s.label)}</span>
                </span>
              ))}
            </span>
            <span className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-navy px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-md transition-colors group-hover:bg-white group-hover:text-brand">
              {t(TEXT.open)}
              <ArrowRight weight="bold" className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </span>
        </Link>
      </motion.div>
    </Container>
  );
}
