import { CaretDown, MagnifyingGlass, NotePencil, Phone, UserCircle } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { HIGHLIGHTS, LEADERS, ONLINE_SERVICES, ORG, SERVICES } from "@/lib/content";
import { useDesign } from "@/lib/design";
import { useLang, type Lang } from "@/lib/i18n";
import { usePrefs } from "@/lib/prefs";
import { asset, cn, external } from "@/lib/utils";

const LANGS: { value: Lang; label: string }[] = [
  { value: "en", label: "English" },
  { value: "kn", label: "ಕನ್ನಡ" },
];

const SIZES = [
  { label: "A-", title: { en: "Decrease text size", kn: "ಅಕ್ಷರ ಗಾತ್ರ ಕಡಿಮೆ ಮಾಡಿ" } },
  { label: "A", title: { en: "Normal text size", kn: "ಸಾಮಾನ್ಯ ಅಕ್ಷರ ಗಾತ್ರ" } },
  { label: "A+", title: { en: "Increase text size", kn: "ಅಕ್ಷರ ಗಾತ್ರ ಹೆಚ್ಚಿಸಿ" } },
];

const SEARCH = { en: "Search services", kn: "ಸೇವೆಗಳನ್ನು ಹುಡುಕಿ" };
const GRIEVANCE = { en: "Raise a Grievance", kn: "ದೂರು ಸಲ್ಲಿಸಿ" };
const LOGIN = { en: "Login", kn: "ಲಾಗಿನ್" };
const CIVIC_SEARCH = { en: "Search services, layouts...", kn: "ಸೇವೆಗಳು, ಬಡಾವಣೆಗಳನ್ನು ಹುಡುಕಿ..." };

const LOGINS = [
  ONLINE_SERVICES.find((s) => s.icon === "ptax")!,
  ONLINE_SERVICES.find((s) => s.icon === "betterment")!,
  ONLINE_SERVICES.find((s) => s.icon === "housing")!,
  SERVICES.find((s) => s.icon === "cdrms")!,
];

function LoginMenu({ light = false }: { light?: boolean }) {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-3 py-1 font-semibold transition-colors hover:border-brand hover:bg-brand",
          light ? "border-navy/30 text-navy hover:text-white" : "border-white/40",
        )}
      >
        <UserCircle weight="fill" className="size-4" />
        {t(LOGIN)}
        <CaretDown weight="bold" className={cn("size-3 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-50 mt-2 w-60 origin-top-right rounded-xl border border-line bg-white p-1.5 text-ink shadow-xl"
          >
            {LOGINS.map((l) => (
              <li key={l.href}>
                <a href={l.href} {...external(l.href)} className="block rounded-lg px-3 py-2 text-[13px] font-medium transition-colors hover:bg-brand hover:text-white">
                  {t(l.label)}
                </a>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SearchBox({ className, placeholder = SEARCH }: { className?: string; placeholder?: { en: string; kn: string } }) {
  const { t } = useLang();
  const { query, setQuery } = usePrefs();
  return (
    <form
      role="search"
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t(placeholder)}
        aria-label={t(placeholder)}
        className="w-full rounded-full border border-line bg-white py-1.5 pl-9 pr-3 text-[13px] text-ink outline-none placeholder:text-muted focus:border-brand-bright focus:ring-2 focus:ring-brand-bright/25"
      />
    </form>
  );
}

function LightTopBar() {
  const { t, lang, setLang } = useLang();
  const { scaleIndex, setScaleIndex } = usePrefs();
  const [searching, setSearching] = useState(false);
  return (
    <div className="relative z-50 border-b border-line/70 bg-white/90 text-navy backdrop-blur">
      <div className="mx-auto flex max-w-site items-center justify-between gap-3 px-5 py-1.5 text-xs lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <img src={asset("images/karnataka-emblem.png")} alt="" className="h-8 w-auto" />
          <span className="font-semibold">{t(ORG.govt)}</span>
          <span className="ml-3 hidden items-center gap-2 border-l border-line pl-3 xl:flex">
            {[LEADERS.left, LEADERS.right].map((l) => (
              <span key={l.photo} className="flex items-center gap-2 rounded-full bg-page py-0.5 pl-0.5 pr-3">
                <img src={asset(l.photo)} alt={t(l.name)} className="size-8 rounded-full object-cover object-top ring-2 ring-white" />
                <span className="leading-tight">
                  <span className="block text-[11.5px] font-semibold">{t(l.name)}</span>
                  <span className="block whitespace-nowrap text-[10px] text-muted">{t(l.title)}</span>
                </span>
              </span>
            ))}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {LANGS.map((l, i) => (
              <span key={l.value} className="flex items-center gap-1">
                {i > 0 && <span className="text-navy/30">|</span>}
                <button
                  type="button"
                  onClick={() => setLang(l.value)}
                  aria-pressed={lang === l.value}
                  className={cn("rounded px-1.5 py-0.5 transition-colors", lang === l.value ? "font-semibold text-brand" : "text-navy/70 hover:bg-brand hover:text-white")}
                >
                  {l.label}
                </button>
              </span>
            ))}
          </div>
          <div className="hidden items-center gap-0.5 sm:flex">
            {SIZES.map((s, i) => (
              <button
                key={s.label}
                type="button"
                title={t(s.title)}
                aria-label={t(s.title)}
                aria-pressed={scaleIndex === i}
                onClick={() => setScaleIndex(i)}
                className={cn("grid h-6 min-w-6 place-items-center rounded px-1 font-semibold transition-colors", scaleIndex === i ? "bg-navy text-white" : "hover:bg-brand hover:text-white")}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="hidden items-center md:flex">
            <AnimatePresence initial={false}>
              {searching && (
                <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 224, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="mr-1.5 overflow-hidden">
                  <SearchBox className="w-56" placeholder={CIVIC_SEARCH} />
                </motion.div>
              )}
            </AnimatePresence>
            <button
              type="button"
              onClick={() => setSearching((v) => !v)}
              aria-label={t(SEARCH)}
              aria-expanded={searching}
              className="grid size-8 place-items-center rounded-full bg-navy text-white transition-colors hover:bg-brand"
            >
              <MagnifyingGlass weight="bold" className="size-4" />
            </button>
          </div>
          <LoginMenu light />
        </div>
      </div>
    </div>
  );
}

export function TopBar() {
  const { t, lang, setLang } = useLang();
  const { scaleIndex, setScaleIndex } = usePrefs();
  const { design } = useDesign();
  if (design === "garden") return <LightTopBar />;
  const [helpline, grievance] = HIGHLIGHTS;
  return (
    <div className="bg-navy text-white">
      <div className="mx-auto flex max-w-site items-center justify-between gap-3 px-5 py-2 text-xs lg:px-8">
        <div className="flex items-center gap-2">
          <img src={asset("images/karnataka-emblem.png")} alt="" className="h-7 w-auto" />
          <span className="font-semibold">{t(ORG.govt)}</span>
          {design === "portal" && (
            <span className="ml-3 hidden items-center gap-1 border-l border-white/20 pl-3 lg:flex">
              <a href={helpline.href} className="flex items-center gap-1.5 rounded px-2 py-0.5 transition-colors hover:bg-brand">
                <Phone weight="fill" className="size-3.5" />
                {t(helpline.title)} <span className="font-semibold">{t(helpline.sub)}</span>
              </a>
              <a href={grievance.href} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded px-2 py-0.5 transition-colors hover:bg-brand">
                <NotePencil weight="fill" className="size-3.5" />
                {t(GRIEVANCE)}
              </a>
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {LANGS.map((l, i) => (
              <span key={l.value} className="flex items-center gap-1">
                {i > 0 && <span className="text-white/40">|</span>}
                <button
                  type="button"
                  onClick={() => setLang(l.value)}
                  aria-pressed={lang === l.value}
                  className={cn(
                    "rounded px-1.5 py-0.5 transition-colors",
                    lang === l.value ? "bg-white/15 font-semibold" : "text-white/75 hover:text-white",
                  )}
                >
                  {l.label}
                </button>
              </span>
            ))}
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            {SIZES.map((s, i) => (
              <button
                key={s.label}
                type="button"
                title={t(s.title)}
                aria-label={t(s.title)}
                aria-pressed={scaleIndex === i}
                onClick={() => setScaleIndex(i)}
                className={cn(
                  "grid h-6 min-w-6 place-items-center rounded px-1 font-semibold transition-colors",
                  scaleIndex === i ? "bg-white text-navy" : "bg-white/10 hover:bg-white/20",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          {design === "civic" ? (
            <>
              <SearchBox className="hidden w-64 md:block" placeholder={CIVIC_SEARCH} />
              <LoginMenu />
            </>
          ) : (
            <SearchBox className="hidden w-52 md:block" />
          )}
        </div>
      </div>
    </div>
  );
}
