import { ArrowRight, Newspaper } from "@phosphor-icons/react";
import { NEWS, SITE } from "@/lib/content";
import { useLang } from "@/lib/i18n";
import { dateParts, external } from "@/lib/utils";
import { Container, Reveal, SectionHeader } from "./shared";

const TEXT = {
  title: { en: "News & Events", kn: "ಸುದ್ದಿ ಮತ್ತು ಕಾರ್ಯಕ್ರಮಗಳು" },
  more: { en: "Read More", kn: "ಇನ್ನಷ್ಟು ಓದಿ" },
};

export function News() {
  const { t, lang } = useLang();
  return (
    <Container>
      <SectionHeader icon={Newspaper} title={TEXT.title} href={`${SITE}/news`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
        {NEWS.map((n, i) => {
          const d = dateParts(n.date, lang);
          return (
            <Reveal key={n.href + n.date} delay={i * 0.05}>
              <a
                href={n.href}
                {...external(n.href)}
                className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-brand hover:bg-brand hover:shadow-[0_18px_36px_-16px_rgba(11,44,107,0.35)]"
              >
                <span className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-white/60 transition-transform duration-500 group-hover:scale-x-100" aria-hidden />
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <div className="origin-left font-display text-3xl font-bold leading-none text-brand transition-[color,scale] duration-300 group-hover:scale-110 group-hover:text-white">{d.day}</div>
                    <div className="mt-1 text-[11px] font-semibold uppercase text-muted transition-colors group-hover:text-white/75">{d.monthYear}</div>
                  </div>
                  <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10.5px] font-semibold text-brand transition-colors group-hover:bg-white/20 group-hover:text-white">{t(n.kind)}</span>
                </div>
                <p className="mt-4 line-clamp-3 flex-1 text-[14px] font-semibold leading-snug text-navy transition-colors group-hover:text-white">{t(n.title)}</p>
                <span className="mt-4 flex items-center gap-1 text-[13px] font-semibold text-brand transition-colors group-hover:text-white">
                  {t(TEXT.more)}
                  <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-1" />
                </span>
              </a>
            </Reveal>
          );
        })}
      </div>
    </Container>
  );
}
