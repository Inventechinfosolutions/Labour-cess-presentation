import { ArrowRight, EyeSlash, TreeStructure } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { AREAS, IA_STATS } from "@/lib/ia";
import { useLang, type Lang } from "@/lib/i18n";
import { asset, cn } from "@/lib/utils";
import { useVisibility } from "@/lib/visibility";

const TEXT = {
  kicker: { en: "Bangalore Development Authority", kn: "ಬೆಂಗಳೂರು ಅಭಿವೃದ್ಧಿ ಪ್ರಾಧಿಕಾರ" },
  title: { en: "BDA · Design Gallery", kn: "ಬಿಡಿಎ · ವಿನ್ಯಾಸ ಗ್ಯಾಲರಿ" },
  intro: {
    en: "Home page designs for the BDA main web app. Each card opens one design.",
    kn: "ಬಿಡಿಎ ಮುಖ್ಯ ಜಾಲತಾಣದ ಮುಖಪುಟ ವಿನ್ಯಾಸಗಳು. ಪ್ರತಿ ಕಾರ್ಡ್ ಒಂದು ವಿನ್ಯಾಸವನ್ನು ತೆರೆಯುತ್ತದೆ.",
  },
  open: { en: "View design", kn: "ವಿನ್ಯಾಸ ನೋಡಿ" },
  hidden: { en: "Hidden from clients", kn: "ಗ್ರಾಹಕರಿಗೆ ಮರೆಮಾಡಲಾಗಿದೆ" },
  none: { en: "No designs are shared yet.", kn: "ಇನ್ನೂ ಯಾವುದೇ ವಿನ್ಯಾಸ ಹಂಚಿಕೊಂಡಿಲ್ಲ." },
  sitemap: { en: "New website structure · Sitemap", kn: "ಹೊಸ ಜಾಲತಾಣ ರಚನೆ · ಸೈಟ್‌ಮ್ಯಾಪ್" },
  sitemapSub: {
    en: "The complete proposed structure behind Design 7, with live and new pages marked.",
    kn: "ವಿನ್ಯಾಸ 7 ರ ಹಿಂದಿನ ಸಂಪೂರ್ಣ ಪ್ರಸ್ತಾವಿತ ರಚನೆ, ಲೈವ್ ಮತ್ತು ಹೊಸ ಪುಟಗಳ ಗುರುತಿನೊಂದಿಗೆ.",
  },
  sitemapStats: { en: "primary areas · pages · new", kn: "ಪ್ರಮುಖ ವಿಭಾಗಗಳು · ಪುಟಗಳು · ಹೊಸ" },
  sitemapOpen: { en: "Open sitemap", kn: "ಸೈಟ್‌ಮ್ಯಾಪ್ ತೆರೆಯಿರಿ" },
  footer: {
    en: "All designs share the same live content from bdakarnataka.in, in English and Kannada.",
    kn: "ಎಲ್ಲಾ ವಿನ್ಯಾಸಗಳು bdakarnataka.in ನ ಒಂದೇ ಮಾಹಿತಿಯನ್ನು ಇಂಗ್ಲಿಷ್ ಮತ್ತು ಕನ್ನಡದಲ್ಲಿ ಬಳಸುತ್ತವೆ.",
  },
};

const LANGS: { id: Lang; label: string }[] = [
  { id: "en", label: "English" },
  { id: "kn", label: "ಕನ್ನಡ" },
];

export function GalleryPage() {
  const { lang, setLang, t } = useLang();
  const { ready, designs, isHidden } = useVisibility();
  return (
    <div className="flex min-h-svh flex-col bg-page">
      <header className="border-b-4 border-brand-bright bg-gradient-to-br from-navy-deep to-[#12398f] text-white">
        <div className="mx-auto flex max-w-site flex-col gap-5 px-5 py-9 sm:flex-row sm:items-center sm:gap-7 sm:py-11">
          <span className="w-fit shrink-0 rounded-2xl bg-white p-2.5 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.5)]">
            <img src={asset("images/bda-logo.jpg")} alt="BDA" className="size-14 sm:size-16" />
          </span>
          <div className="flex-1">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-white/70">{t(TEXT.kicker)}</p>
            <h1 className="mt-1.5 font-display text-[28px] font-bold sm:text-[34px]">{t(TEXT.title)}</h1>
            <p className="mt-1 text-white/80">{t(TEXT.intro)}</p>
          </div>
          <div className="flex w-fit gap-1 rounded-full bg-white/10 p-1">
            {LANGS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLang(l.id)}
                aria-pressed={lang === l.id}
                className={cn(
                  "rounded-full px-3.5 py-1 text-[13px] font-semibold transition-colors",
                  lang === l.id ? "bg-white text-navy" : "text-white/80 hover:text-white",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-site flex-1 px-5 py-9">
        {ready && (
          <>
            {designs.length === 0 && <p className="mb-6 text-muted">{t(TEXT.none)}</p>}
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {designs.map((d, i) => (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={d.path}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_10px_24px_-14px_rgba(11,44,107,0.35)] transition duration-300 hover:-translate-y-1.5 hover:border-brand hover:bg-brand hover:shadow-[0_16px_30px_-14px_rgba(11,44,107,0.45)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-brand-soft">
                      <img
                        src={asset(d.image)}
                        alt={`${t(d.label)} preview`}
                        className="absolute inset-0 size-full object-cover object-top transition duration-700 ease-out group-hover:scale-[1.04]"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-navy px-2.5 py-1 text-[12px] font-bold text-white">
                        {String(d.number).padStart(2, "0")}
                      </span>
                      {isHidden(d.id) && (
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-1 text-[12px] font-semibold text-white shadow">
                          <EyeSlash size={14} weight="bold" />
                          {t(TEXT.hidden)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h2 className="font-display text-lg font-semibold text-navy transition-colors group-hover:text-white">
                        {t(d.label)} <span className="font-normal text-muted transition-colors group-hover:text-white/75">· {t(d.style)}</span>
                      </h2>
                      <p className="mt-1 flex-1 text-[14px] text-muted transition-colors group-hover:text-white/85">{t(d.summary)}</p>
                      <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand transition-colors group-hover:text-white">
                        {t(TEXT.open)}
                        <ArrowRight size={15} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + designs.length * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6"
            >
              <Link
                to="/sitemap"
                className="group flex flex-col gap-4 rounded-2xl border border-dashed border-brand/40 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-brand hover:bg-brand sm:flex-row sm:items-center"
              >
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-soft text-brand transition-colors group-hover:bg-white/15 group-hover:text-white">
                  <TreeStructure size={30} weight="duotone" />
                </span>
                <span className="flex-1">
                  <span className="block font-display text-lg font-semibold text-navy transition-colors group-hover:text-white">{t(TEXT.sitemap)}</span>
                  <span className="mt-0.5 block text-[14px] text-muted transition-colors group-hover:text-white/85">{t(TEXT.sitemapSub)}</span>
                  <span className="mt-1 block text-[12.5px] font-semibold text-brand transition-colors group-hover:text-white">
                    {AREAS.length} · {IA_STATS.total} · {IA_STATS.fresh} <span className="font-normal">({t(TEXT.sitemapStats)})</span>
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand transition-colors group-hover:text-white">
                  {t(TEXT.sitemapOpen)}
                  <ArrowRight size={15} weight="bold" className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          </>
        )}
      </main>

      <footer className="mx-auto w-full max-w-site px-5 pb-8 text-[13px] text-muted">{t(TEXT.footer)}</footer>
    </div>
  );
}
