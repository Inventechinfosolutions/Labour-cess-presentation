import { ArrowRight, CaretRight, Newspaper, type Icon } from "@phosphor-icons/react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EASE, SPRING, SectionHeader } from "@/components/home/shared";
import { NEWS, SERVICES, SITE, type LinkItem, type ServiceIcon } from "@/lib/content";
import { useLang, type Text } from "@/lib/i18n";
import { SERVICE_ICONS } from "@/lib/icons";
import { asset, cn, dateParts, external } from "@/lib/utils";

export const NEWS_TITLE: Text = { en: "News & Events", kn: "ಸುದ್ದಿ ಮತ್ತು ಕಾರ್ಯಕ್ರಮಗಳು" };
export const READ_MORE: Text = { en: "Read More", kn: "ಇನ್ನಷ್ಟು ಓದಿ" };

export const services = (...icons: ServiceIcon[]) => icons.map((i) => SERVICES.find((s) => s.icon === i)!);

export const pop = (i: number, base = 0.1) => ({
  initial: { opacity: 0, y: 18, scale: 0.96 },
  whileInView: { opacity: 1, y: 0, scale: 1 },
  viewport: { once: true, margin: "-40px" },
  transition: { delay: base + i * 0.05, duration: 0.5, ease: EASE },
});

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("h-full rounded-2xl border border-line bg-white p-4 shadow-[0_10px_30px_-18px_rgba(11,44,107,0.3)] md:p-5", className)}>{children}</div>;
}

export function IconRow({ items, className, stacked }: { items: (LinkItem & { icon: ServiceIcon })[]; className?: string; stacked?: boolean }) {
  const { t } = useLang();
  return (
    <div className={cn("grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:gap-3", className)}>
      {items.map((s, i) => {
        const IconCmp = SERVICE_ICONS[s.icon];
        return (
          <motion.div key={s.label.en} {...pop(i)}>
            <motion.a
              href={s.href}
              {...external(s.href)}
              whileHover={{ y: -5, scale: 1.04 }}
              whileTap={{ scale: 1, y: 0 }}
              transition={SPRING}
              className={cn(
                "group flex h-full flex-col items-center gap-2 rounded-xl border border-line bg-white px-2 py-4 text-center transition-colors duration-300 hover:border-brand hover:bg-brand hover:shadow-[0_16px_30px_-14px_rgba(11,44,107,0.45)]",
                !stacked && "lg:flex-row lg:px-3 lg:py-3.5 lg:text-left",
              )}
            >
              <IconCmp weight="duotone" className="size-7 shrink-0 text-brand transition-[color,rotate] duration-300 group-hover:-rotate-8 group-hover:text-white" />
              <span className="text-[12.5px] font-medium leading-snug text-ink transition-colors group-hover:text-white">{t(s.label)}</span>
            </motion.a>
          </motion.div>
        );
      })}
    </div>
  );
}

export function LinkList({ links, className }: { links: LinkItem[]; className?: string }) {
  const { t } = useLang();
  return (
    <ul className={cn("divide-y divide-line", className)}>
      {links.map((l, i) => (
        <motion.li key={l.label.en} {...pop(i, 0.15)}>
          <a
            href={l.href}
            {...external(l.href)}
            className="group -mx-2 flex items-center justify-between gap-2 rounded-md px-2 py-2 text-[13px] font-medium text-ink transition-colors hover:bg-brand hover:text-white"
          >
            {t(l.label)}
            <CaretRight weight="bold" className="size-3.5 shrink-0 text-brand transition-transform group-hover:translate-x-1 group-hover:text-white" />
          </a>
        </motion.li>
      ))}
    </ul>
  );
}

export function NewsList({ thumbs, icon = Newspaper }: { thumbs?: string[]; icon?: Icon }) {
  const { t, lang } = useLang();
  return (
    <Panel>
      <SectionHeader icon={icon} title={NEWS_TITLE} href={`${SITE}/news`} />
      <ul className="space-y-1.5">
        {NEWS.map((n, i) => {
          const d = dateParts(n.date, lang);
          return (
            <motion.li key={n.href + n.date} {...pop(i, 0.15)}>
              <a href={n.href} {...external(n.href)} className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors duration-300 hover:bg-brand">
                <span className="w-12 shrink-0 text-center">
                  <span className="block font-display text-xl font-bold leading-none text-navy transition-colors group-hover:text-white">{d.day}</span>
                  <span className="mt-0.5 block text-[9.5px] font-semibold uppercase text-muted transition-colors group-hover:text-white/75">{d.monthYear}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink transition-colors group-hover:text-white">{t(n.title)}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand transition-colors group-hover:text-white">
                    {t(READ_MORE)}
                    <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
                {thumbs?.[i] && (
                  <span className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-lg sm:block">
                    <img src={asset(thumbs[i])} alt="" loading="lazy" className="size-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  </span>
                )}
              </a>
            </motion.li>
          );
        })}
      </ul>
    </Panel>
  );
}

export function CtaButton({ href, children, className, light }: { href: string; children: ReactNode; className?: string; light?: boolean }) {
  return (
    <motion.a
      href={href}
      {...external(href)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-5 py-2.5 text-[13.5px] font-semibold shadow-md transition-colors",
        light ? "bg-white text-navy hover:bg-brand hover:text-white" : "bg-navy text-white hover:bg-brand",
        className,
      )}
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/4 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" aria-hidden />
      <span className="relative">{children}</span>
      <ArrowRight weight="bold" className="relative transition-transform group-hover:translate-x-1" />
    </motion.a>
  );
}
