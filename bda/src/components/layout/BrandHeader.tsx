import { Link } from "react-router";
import { LEADERS, ORG } from "@/lib/content";
import { useDesign } from "@/lib/design";
import { useLang } from "@/lib/i18n";
import { asset } from "@/lib/utils";

function Leader({ leader }: { leader: (typeof LEADERS)["left"] }) {
  const { t } = useLang();
  return (
    <div className="hidden w-72 flex-col items-center text-center md:flex">
      <img
        src={asset(leader.photo)}
        alt={t(leader.name)}
        className="size-16 rounded-full object-cover object-top shadow-md ring-2 ring-brand-soft"
      />
      <div className="mt-2 text-[13.5px] font-semibold text-navy">{t(leader.name)}</div>
      <div className="mt-0.5 text-[11.5px] leading-snug text-muted">{t(leader.title)}</div>
    </div>
  );
}

export function BrandHeader() {
  const { t, lang } = useLang();
  const { root, design } = useDesign();
  if (design === "civic") {
    return (
      <header className="relative overflow-hidden bg-white">
        <span className="absolute inset-y-0 left-0 w-4 bg-gradient-to-b from-amber-300 to-amber-400 [clip-path:polygon(0_0,100%_50%,0_100%)]" aria-hidden />
        <svg viewBox="0 0 420 100" preserveAspectRatio="none" className="pointer-events-none absolute right-0 top-0 hidden h-1/2 w-[30%] md:block" aria-hidden>
          <path d="M120 0 C 220 30, 300 10, 420 70 V0 Z" fill="#dbe7ff" />
          <path d="M210 0 C 290 25, 350 15, 420 45 V0 Z" fill="#2563eb" opacity="0.85" />
          <path d="M300 0 C 350 18, 390 14, 420 24 V0 Z" fill="#0b2c6b" />
        </svg>
        <div className="relative mx-auto flex max-w-site items-center justify-between gap-6 px-5 py-3 lg:px-8">
          <Link to={root} className="flex items-center gap-3">
            <img src={asset("images/bda-logo.jpg")} alt="BDA" className="size-14 rounded-full md:size-16" />
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-bold uppercase tracking-wide text-navy md:text-[17px]">{t(ORG.name)}</span>
              <span className="block text-xs font-semibold text-navy/80 md:text-sm">{lang === "en" ? ORG.nameKn : ORG.name.en}</span>
            </span>
          </Link>
          <div className="hidden items-center gap-3 md:flex">
            {[LEADERS.left, LEADERS.right].map((l) => (
              <div key={l.photo} className="flex items-center gap-3 rounded-full border border-line bg-white/90 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur">
                <img src={asset(l.photo)} alt={t(l.name)} className="size-12 rounded-full object-cover object-top ring-2 ring-brand-soft" />
                <span className="max-w-52 leading-tight">
                  <span className="block text-[13px] font-semibold text-navy">{t(l.name)}</span>
                  <span className="block text-[11px] text-muted">{t(l.title)}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </header>
    );
  }
  return (
    <header className="bg-white">
      <div className="mx-auto flex max-w-site items-center justify-between gap-6 px-5 py-4 lg:px-8">
        <Leader leader={LEADERS.left} />
        <Link to={root} className="flex items-center gap-3">
          <img src={asset("images/bda-logo.jpg")} alt="BDA" className="size-14 rounded-full md:size-[72px]" />
          <span className="leading-tight">
            <span className="block font-display text-[15px] font-bold uppercase tracking-wide text-navy md:text-lg">
              {t(ORG.name)}
            </span>
            <span className="block text-xs text-muted md:text-[13px]">{t(ORG.govt)}</span>
            <span className="block text-xs font-semibold text-navy/80 md:text-sm">
              {lang === "en" ? ORG.nameKn : ORG.name.en}
            </span>
          </span>
        </Link>
        <Leader leader={LEADERS.right} />
      </div>
    </header>
  );
}
