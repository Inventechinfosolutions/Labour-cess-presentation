import { ArrowRight, Megaphone, SquaresFour, X } from "@phosphor-icons/react";
import { SITE, SERVICES } from "@/lib/content";
import { useDesign } from "@/lib/design";
import { useLang } from "@/lib/i18n";
import { SERVICE_ICONS } from "@/lib/icons";
import { usePrefs } from "@/lib/prefs";
import { cn, external } from "@/lib/utils";
import { Container, Reveal, SectionHeader } from "./shared";

const TEXT = {
  title: { en: "Quick Access to Key Services", kn: "ಪ್ರಮುಖ ಸೇವೆಗಳಿಗೆ ತ್ವರಿತ ಪ್ರವೇಶ" },
  all: { en: "View All Services", kn: "ಎಲ್ಲಾ ಸೇವೆಗಳು" },
  results: { en: "Results for", kn: "ಹುಡುಕಾಟ ಫಲಿತಾಂಶ" },
  clear: { en: "Clear", kn: "ತೆರವುಗೊಳಿಸಿ" },
  none: { en: "No services match your search.", kn: "ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ ಹೊಂದುವ ಸೇವೆಗಳಿಲ್ಲ." },
};

export function QuickAccess() {
  const { t } = useLang();
  const { query, setQuery } = usePrefs();
  const { pick } = useDesign();
  const q = query.trim().toLowerCase();
  const items = q
    ? SERVICES.filter((s) => s.label.en.toLowerCase().includes(q) || s.label.kn.includes(query.trim()))
    : SERVICES;

  return (
    <Container>
      <div id="services" className="scroll-mt-20">
        <SectionHeader icon={pick(SquaresFour, Megaphone)} title={TEXT.title} href={`${SITE}/online-services`} linkLabel={TEXT.all} />
        {q && (
          <div className="mb-3 flex items-center gap-2 text-[13px] text-muted">
            {t(TEXT.results)} <span className="font-semibold text-navy">"{query.trim()}"</span>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="flex items-center gap-1 rounded-full bg-brand-soft px-2 py-0.5 font-medium text-brand hover:bg-brand hover:text-white"
            >
              <X weight="bold" className="size-3" /> {t(TEXT.clear)}
            </button>
          </div>
        )}
        {items.length === 0 ? (
          <p className="rounded-lg border border-dashed border-line bg-white px-4 py-6 text-center text-sm text-muted">{t(TEXT.none)}</p>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4 lg:gap-4 2xl:grid-cols-5">
            {items.map((s, i) => {
              const Icon = SERVICE_ICONS[s.icon];
              return (
                <Reveal key={s.label.en} delay={(i % 4) * 0.07}>
                  <a
                    href={s.href}
                    {...external(s.href)}
                    className={cn(
                      "group flex h-full items-center gap-2.5 rounded-lg border px-2.5 py-3 transition-all duration-300 hover:-translate-y-1 sm:gap-3 sm:px-4 sm:py-3.5",
                      pick(
                        "border-white bg-white shadow-[0_4px_14px_-6px_rgba(11,44,107,0.18)] hover:border-brand hover:bg-brand hover:shadow-[0_10px_24px_-8px_rgba(11,44,107,0.45)]",
                        "border-transparent bg-[#eef3fb] hover:border-brand hover:bg-brand hover:shadow-md",
                      ),
                    )}
                  >
                    <Icon weight={pick("duotone", "regular")} className="size-6 shrink-0 text-brand transition-[color,rotate,scale] duration-300 group-hover:-rotate-6 group-hover:scale-115 group-hover:text-white sm:size-7" />
                    <span className="flex-1 text-[12.5px] font-medium leading-snug text-ink transition-colors group-hover:text-white sm:text-[13.5px]">{t(s.label)}</span>
                    {pick(
                      <span className="hidden size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-brand transition-colors group-hover:bg-white/20 group-hover:text-white sm:grid">
                        <ArrowRight weight="bold" className="size-3.5" />
                      </span>,
                      <ArrowRight weight="bold" className="hidden size-4 shrink-0 text-brand transition-[color,translate] group-hover:translate-x-1 group-hover:text-white sm:block" />,
                    )}
                  </a>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
