import {
  ArrowRight,
  Briefcase,
  Buildings,
  CalendarBlank,
  CalendarDots,
  Calculator,
  ChartLineUp,
  CircleNotch,
  CreditCard,
  Database,
  Desktop,
  EnvelopeSimple,
  FilePdf,
  Files,
  FileText,
  Gavel,
  HouseLine,
  Images,
  Info,
  Leaf,
  LinkSimple,
  MagnifyingGlass,
  MapPin,
  MapPinArea,
  MapTrifold,
  Megaphone,
  NotePencil,
  Phone,
  SquaresFour,
  Star,
  TreeStructure,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import { Container, CountUp, EASE } from "@/components/home/shared";
import { UPDATES, UPDATE_TABS, type UpdateTab } from "@/components/portal/PortalUpdates";
import { ABOUT, ANNOUNCEMENTS, EAUCTION_LINKS, HIGHLIGHTS, LAYOUT_LINKS, ONLINE_SERVICES, ORG, SERVICES, SITE, type ServiceIcon } from "@/lib/content";
import { AREAS, INITIATIVES, type AreaKey } from "@/lib/ia";
import { useLang, type Text } from "@/lib/i18n";
import { cn, dateParts, external } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });
const svc = (icon: ServiceIcon) => SERVICES.find((s) => s.icon === icon)!;
const area = (key: AreaKey) => AREAS.find((a) => a.key === key)!;
const highlight = (key: (typeof HIGHLIGHTS)[number]["key"]) => HIGHLIGHTS.find((h) => h.key === key)!;
const online = (icon: (typeof ONLINE_SERVICES)[number]["icon"]) => ONLINE_SERVICES.find((s) => s.icon === icon)!;

const TEXT = {
  explore: t2("Explore BDA", "ಬಿಡಿಎ ಅನ್ವೇಷಿಸಿ"),
  exploreSub: t2("Find information and access services across BDA's key areas", "ಬಿಡಿಎಯ ಪ್ರಮುಖ ವಿಭಾಗಗಳಲ್ಲಿ ಮಾಹಿತಿ ಮತ್ತು ಸೇವೆಗಳನ್ನು ಪಡೆಯಿರಿ"),
  allServices: t2("View All Services", "ಎಲ್ಲಾ ಸೇವೆಗಳನ್ನು ನೋಡಿ"),
  quick: t2("Quick Citizen Services", "ತ್ವರಿತ ನಾಗರಿಕ ಸೇವೆಗಳು"),
  quickSub: t2("Most accessed services at your fingertips", "ಹೆಚ್ಚು ಬಳಸುವ ಸೇವೆಗಳು ನಿಮ್ಮ ಬೆರಳ ತುದಿಯಲ್ಲಿ"),
  initiatives: t2("Current Initiatives", "ಪ್ರಸ್ತುತ ಉಪಕ್ರಮಗಳು"),
  initiativesSub: t2("Key initiatives for a sustainable and inclusive Bengaluru", "ಸುಸ್ಥಿರ ಮತ್ತು ಒಳಗೊಳ್ಳುವ ಬೆಂಗಳೂರಿಗಾಗಿ ಪ್ರಮುಖ ಉಪಕ್ರಮಗಳು"),
  allInitiatives: t2("View All Initiatives", "ಎಲ್ಲಾ ಉಪಕ್ರಮಗಳನ್ನು ನೋಡಿ"),
  updates: t2("Latest Updates", "ಇತ್ತೀಚಿನ ಅಪ್‌ಡೇಟ್‌ಗಳು"),
  viewAll: t2("View All", "ಎಲ್ಲಾ ನೋಡಿ"),
  assets: t2("Featured BDA Assets", "ಪ್ರಮುಖ ಬಿಡಿಎ ಆಸ್ತಿಗಳು"),
  exploreMore: t2("Explore More", "ಇನ್ನಷ್ಟು ನೋಡಿ"),
  ongoing: t2("Ongoing", "ಚಾಲ್ತಿಯಲ್ಲಿದೆ"),
  links: t2("Important Links", "ಪ್ರಮುಖ ಕೊಂಡಿಗಳು"),
  allLinks: t2("View All Links", "ಎಲ್ಲಾ ಕೊಂಡಿಗಳನ್ನು ನೋಡಿ"),
};

function MoreLink({ label, href, to, dark }: { label: Text; href?: string; to?: string; dark?: boolean }) {
  const { t } = useLang();
  const cls = cn(
    "group inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors",
    dark ? "text-white hover:bg-white hover:text-brand" : "text-brand hover:bg-brand hover:text-white",
  );
  const body = (
    <>
      {t(label)}
      <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-1" />
    </>
  );
  return to ? (
    <Link to={to} className={cls}>
      {body}
    </Link>
  ) : (
    <a href={href} {...external(href ?? "")} className={cls}>
      {body}
    </a>
  );
}

function Heading({ icon: IconCmp, tone, title, sub, action, dark }: { icon: Icon; tone: string; title: Text; sub?: Text; action?: ReactNode; dark?: boolean }) {
  const { t } = useLang();
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-start gap-3">
        <motion.span
          initial={{ scale: 0, rotate: -40 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className={cn("mt-0.5 grid size-10 shrink-0 place-items-center rounded-full", tone)}
        >
          <IconCmp weight="duotone" className="size-5" />
        </motion.span>
        <div>
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: EASE }}
            className={cn("font-display text-xl font-bold md:text-2xl", dark ? "text-white" : "text-navy")}
          >
            {t(title)}
          </motion.h2>
          {sub && <p className={cn("text-[13px]", dark ? "text-white/75" : "text-muted")}>{t(sub)}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const stagger = (gap = 0.08) => ({
  initial: "hidden",
  whileInView: "show",
  viewport: { once: true, margin: "-50px" },
  variants: { show: { transition: { staggerChildren: gap } } },
});

const EXPLORE: { key: AreaKey; icon: Icon; title: Text; desc: Text; card: string; dot: string }[] = [
  {
    key: "services",
    icon: SquaresFour,
    title: t2("Services", "ಸೇವೆಗಳು"),
    desc: t2("Apply, Pay, Track and Access Citizen Services", "ಅರ್ಜಿ, ಪಾವತಿ, ಸ್ಥಿತಿ ಮತ್ತು ನಾಗರಿಕ ಸೇವೆಗಳು"),
    card: "bg-blue-50/80 border-blue-100",
    dot: "bg-blue-600",
  },
  {
    key: "property",
    icon: HouseLine,
    title: t2("Property & Land", "ಆಸ್ತಿ ಮತ್ತು ಭೂಮಿ"),
    desc: t2("Layouts, Sites, E-Auction, Flats/Villas and BDA Properties", "ಬಡಾವಣೆಗಳು, ನಿವೇಶನಗಳು, ಇ-ಹರಾಜು, ಫ್ಲ್ಯಾಟ್/ವಿಲ್ಲಾ ಮತ್ತು ಬಿಡಿಎ ಆಸ್ತಿಗಳು"),
    card: "bg-emerald-50/80 border-emerald-100",
    dot: "bg-emerald-500",
  },
  {
    key: "departments",
    icon: TreeStructure,
    title: t2("Departments", "ವಿಭಾಗಗಳು"),
    desc: t2("BDA Departments, Functions, Offices and Contacts", "ಬಿಡಿಎ ವಿಭಾಗಗಳು, ಕಾರ್ಯಗಳು, ಕಚೇರಿಗಳು ಮತ್ತು ಸಂಪರ್ಕ"),
    card: "bg-violet-50/80 border-violet-100",
    dot: "bg-violet-500",
  },
  {
    key: "planning",
    icon: MapTrifold,
    title: t2("Planning & Development", "ಯೋಜನೆ ಮತ್ತು ಅಭಿವೃದ್ಧಿ"),
    desc: t2("Jurisdiction Map, Bengaluru Business Corridor, Projects", "ವ್ಯಾಪ್ತಿ ನಕ್ಷೆ, ಬೆಂಗಳೂರು ಬಿಸಿನೆಸ್ ಕಾರಿಡಾರ್, ಯೋಜನೆಗಳು"),
    card: "bg-amber-50/80 border-amber-100",
    dot: "bg-amber-500",
  },
  {
    key: "information",
    icon: FileText,
    title: t2("Information & Resources", "ಮಾಹಿತಿ ಮತ್ತು ಸಂಪನ್ಮೂಲಗಳು"),
    desc: t2("RTI, Forms, Notifications, Documents, Maps and Gallery", "ಆರ್‌ಟಿಐ, ನಮೂನೆಗಳು, ಅಧಿಸೂಚನೆಗಳು, ದಾಖಲೆಗಳು, ನಕ್ಷೆಗಳು ಮತ್ತು ಗ್ಯಾಲರಿ"),
    card: "bg-rose-50/80 border-rose-100",
    dot: "bg-rose-500",
  },
  {
    key: "news",
    icon: Megaphone,
    title: t2("News & Updates", "ಸುದ್ದಿ ಮತ್ತು ಅಪ್‌ಡೇಟ್‌ಗಳು"),
    desc: t2("Latest News, Press Releases, Events and Announcements", "ಇತ್ತೀಚಿನ ಸುದ್ದಿ, ಮಾಧ್ಯಮ ಪ್ರಕಟಣೆಗಳು, ಕಾರ್ಯಕ್ರಮಗಳು ಮತ್ತು ಪ್ರಕಟಣೆಗಳು"),
    card: "bg-sky-50/80 border-sky-100",
    dot: "bg-sky-500",
  },
];

function ExploreBda() {
  const { t } = useLang();
  return (
    <Container className="pt-10 md:pt-12">
      <Heading
        icon={CircleNotch}
        tone="bg-brand-soft text-brand"
        title={TEXT.explore}
        sub={TEXT.exploreSub}
        action={<MoreLink label={TEXT.allServices} href={svc("online").href} />}
      />
      <motion.div {...stagger()} className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {EXPLORE.map((e) => {
          const href = area(e.key).href;
          return (
            <motion.a
              key={e.key}
              href={href}
              {...external(href)}
              variants={reveal}
              whileHover={{ y: -6 }}
              className={cn(
                "group relative flex min-h-[210px] flex-col rounded-2xl border p-4 shadow-sm transition-colors duration-300 hover:border-brand hover:bg-brand hover:shadow-[0_22px_40px_-20px_rgba(11,44,107,0.55)]",
                e.card,
              )}
            >
              <span className={cn("grid size-12 place-items-center rounded-full text-white shadow-md transition-all duration-500 group-hover:rotate-[-10deg] group-hover:bg-white/20", e.dot)}>
                <e.icon weight="duotone" className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-[15px] font-bold leading-snug text-navy transition-colors group-hover:text-white">{t(e.title)}</h3>
              <p className="mt-1.5 text-[12px] leading-snug text-muted transition-colors group-hover:text-white/80">{t(e.desc)}</p>
              <span className="mt-auto grid size-8 place-self-end place-items-center rounded-full bg-white text-brand shadow-sm transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight weight="bold" className="size-4" />
              </span>
            </motion.a>
          );
        })}
      </motion.div>
    </Container>
  );
}

const QUICK: { icon: Icon; label: Text; href: string }[] = [
  { icon: Desktop, label: svc("online").label, href: svc("online").href },
  { icon: Calculator, label: svc("calculator").label, href: svc("calculator").href },
  { icon: CreditCard, label: svc("tax").label, href: svc("tax").href },
  { icon: NotePencil, label: t2("Raise Grievance", "ದೂರು ಸಲ್ಲಿಸಿ"), href: highlight("grievance").href },
  { icon: MagnifyingGlass, label: t2("Application Tracking", "ಅರ್ಜಿ ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ"), href: online("sakala").href },
  { icon: MapPinArea, label: svc("map").label, href: svc("map").href },
  { icon: Database, label: svc("cdrms").label, href: svc("cdrms").href },
];

function QuickServices() {
  const { t } = useLang();
  const helpline = highlight("helpline");
  return (
    <section className="mx-auto max-w-[1600px] pt-10 md:pt-12">
      <div className="relative overflow-hidden bg-gradient-to-r from-navy via-brand to-brand-bright px-5 py-8 md:rounded-bl-[90px] md:rounded-tr-[90px] lg:px-8">
        <span className="pointer-events-none absolute -left-16 -top-24 size-72 rounded-full border-[30px] border-white/5" aria-hidden />
        <span className="pointer-events-none absolute -bottom-28 right-10 size-80 rounded-full bg-white/5" aria-hidden />
        <div className="relative mx-auto max-w-site">
          <Heading
            dark
            icon={Leaf}
            tone="bg-emerald-400 text-white"
            title={TEXT.quick}
            sub={TEXT.quickSub}
            action={<MoreLink dark label={TEXT.allServices} href={svc("online").href} />}
          />
          <motion.ul {...stagger(0.05)} className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {QUICK.map((q) => (
              <motion.li key={q.label.en} variants={reveal}>
                <a
                  href={q.href}
                  {...external(q.href)}
                  className="group flex h-full min-h-[104px] flex-col items-center justify-center gap-2 rounded-xl bg-white p-3 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-brand hover:shadow-lg hover:ring-2 hover:ring-white"
                >
                  <q.icon weight="duotone" className="size-8 text-brand transition-transform duration-300 group-hover:scale-110 group-hover:text-white" />
                  <span className="text-[12.5px] font-semibold leading-tight text-navy transition-colors group-hover:text-white">{t(q.label)}</span>
                </a>
              </motion.li>
            ))}
            <motion.li variants={reveal} className="col-span-2 sm:col-span-1">
              <a
                href={helpline.href}
                className="group flex h-full min-h-[104px] flex-col items-center justify-center gap-1.5 rounded-xl bg-rose-50 p-3 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:bg-brand hover:shadow-lg hover:ring-2 hover:ring-white"
              >
                <motion.span
                  animate={{ rotate: [0, -14, 12, -8, 0] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2.5 }}
                  className="inline-flex"
                >
                  <Phone weight="fill" className="size-7 text-rose-500 group-hover:text-white" />
                </motion.span>
                <span className="text-[12.5px] font-bold leading-tight text-navy group-hover:text-white">{t(helpline.title)}</span>
                <span className="text-[12px] font-bold text-rose-600 group-hover:text-white">{ORG.helpline}</span>
              </a>
            </motion.li>
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

const INITIATIVE_STYLE: { icon: Icon; sub: Text; card: string; iconTone: string }[] = [
  { icon: Leaf, sub: t2("15 Lakh Planting Initiative for a Greener Bengaluru", "ಹಸಿರು ಬೆಂಗಳೂರಿಗಾಗಿ 15 ಲಕ್ಷ ಗಿಡ ನೆಡುವ ಉಪಕ್ರಮ"), card: "bg-emerald-50/80 border-emerald-100", iconTone: "bg-emerald-100 text-emerald-600" },
  { icon: HouseLine, sub: t2("Site Allotment and Project Information", "ನಿವೇಶನ ಹಂಚಿಕೆ ಮತ್ತು ಯೋಜನಾ ಮಾಹಿತಿ"), card: "bg-violet-50/80 border-violet-100", iconTone: "bg-violet-100 text-violet-600" },
  { icon: ChartLineUp, sub: t2("Driving the Next Phase of Growth", "ಮುಂದಿನ ಹಂತದ ಬೆಳವಣಿಗೆಗೆ ಚಾಲನೆ"), card: "bg-orange-50/80 border-orange-100", iconTone: "bg-orange-100 text-orange-600" },
  { icon: UsersThree, sub: t2("Public Interaction and Citizen Engagement", "ಸಾರ್ವಜನಿಕ ಸಂವಾದ ಮತ್ತು ನಾಗರಿಕ ಭಾಗವಹಿಸುವಿಕೆ"), card: "bg-sky-50/80 border-sky-100", iconTone: "bg-sky-100 text-sky-600" },
];

const INITIATIVE_ORDER = [0, 2, 1, 3];

function Initiatives() {
  const { t } = useLang();
  return (
    <Container className="pt-10 md:pt-12">
      <Heading
        icon={Leaf}
        tone="bg-emerald-100 text-emerald-600"
        title={TEXT.initiatives}
        sub={TEXT.initiativesSub}
        action={<MoreLink label={TEXT.allInitiatives} to="/sitemap" />}
      />
      <motion.div {...stagger()} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {INITIATIVE_ORDER.map((i) => {
          const it = INITIATIVES[i];
          const s = INITIATIVE_STYLE[i];
          return (
            <motion.a
              key={it.label.en}
              href={it.href}
              {...external(it.href)}
              variants={reveal}
              whileHover={{ y: -5 }}
              className={cn("group flex items-start gap-3 rounded-2xl border p-4 shadow-sm transition-colors duration-300 hover:border-brand hover:bg-brand", s.card)}
            >
              <span className={cn("grid size-12 shrink-0 place-items-center rounded-full transition-all duration-500 group-hover:rotate-[-10deg] group-hover:bg-white/20 group-hover:text-white", s.iconTone)}>
                <s.icon weight="duotone" className="size-6" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col self-stretch">
                <span className="font-display text-[15px] font-bold leading-snug text-navy transition-colors group-hover:text-white">{t(it.label)}</span>
                <span className="mt-1 text-[12px] leading-snug text-muted transition-colors group-hover:text-white/80">{t(s.sub)}</span>
                <span className="mt-2 grid size-7 place-self-end place-items-center rounded-full bg-white text-brand shadow-sm transition-transform group-hover:translate-x-1">
                  <ArrowRight weight="bold" className="size-3.5" />
                </span>
              </span>
            </motion.a>
          );
        })}
      </motion.div>
    </Container>
  );
}

function Tabs<K extends string>({ tabs, value, onChange, id }: { tabs: { key: K; label: Text }[]; value: K; onChange: (k: K) => void; id: string }) {
  const { t } = useLang();
  return (
    <div role="tablist" className="no-scrollbar flex overflow-x-auto rounded-xl border border-line bg-page p-1 [contain:inline-size]">
      {tabs.map((tab) => {
        const on = tab.key === value;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tab.key)}
            className={cn("relative flex-1 shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-[12px] font-semibold transition-colors", on ? "text-white" : "text-navy hover:bg-brand hover:text-white")}
          >
            {on && <motion.span layoutId={`${id}-tab`} className="absolute inset-0 rounded-lg bg-navy" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <span className="relative">{t(tab.label)}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Updates({ tagged = false }: { tagged?: boolean }) {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<UpdateTab>("all");
  const items = UPDATES.filter((u) => tab === "all" || u.tab === tab).slice(0, 4);
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-line bg-white p-5 shadow-sm">
      <Heading icon={CalendarDots} tone="bg-brand-soft text-brand" title={TEXT.updates} action={<MoreLink label={TEXT.viewAll} href={highlight("news").href} />} />
      <Tabs id="civic-updates" tabs={UPDATE_TABS} value={tab} onChange={setTab} />
      <ul className="mt-3 space-y-2">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((u, i) => {
            const d = u.date ? dateParts(u.date, lang) : null;
            return (
              <motion.li
                key={`${tab}-${u.href}-${u.title.en}`}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: EASE } }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
              >
                <a href={u.href} {...external(u.href)} className="group flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 transition-colors hover:border-brand hover:bg-brand">
                  <span className="w-12 shrink-0 text-center">
                    {d ? (
                      <>
                        <span className="block font-display text-xl font-bold leading-none text-navy group-hover:text-white">{d.day}</span>
                        <span className="mt-0.5 block text-[9.5px] font-semibold uppercase text-muted group-hover:text-white/80">{d.monthYear}</span>
                      </>
                    ) : (
                      <>
                        <CalendarBlank weight="duotone" className="mx-auto size-5 text-brand group-hover:text-white" />
                        <span className="mt-0.5 block text-[9.5px] font-semibold uppercase text-muted group-hover:text-white/80">{t(TEXT.ongoing)}</span>
                      </>
                    )}
                  </span>
                  <span className="h-9 w-px bg-line group-hover:bg-white/30" aria-hidden />
                  {u.pdf ? <FilePdf weight="duotone" className="size-5 shrink-0 text-red-500 group-hover:text-white" /> : <FileText weight="duotone" className="size-5 shrink-0 text-brand group-hover:text-white" />}
                  {tagged && (
                    <span className={cn("hidden shrink-0 rounded-md px-2 py-0.5 text-[10.5px] font-semibold sm:inline", TAG_TONE[u.tab], "group-hover:bg-white/20 group-hover:text-white")}>
                      {t(UPDATE_TABS.find((x) => x.key === u.tab)!.label)}
                    </span>
                  )}
                  <span className="line-clamp-2 min-w-0 flex-1 text-[13px] font-medium leading-snug text-ink group-hover:text-white">{t(u.title)}</span>
                  <ArrowRight weight="bold" className="size-4 shrink-0 text-brand transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </a>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

const TAG_TONE: Record<Exclude<UpdateTab, "all">, string> = {
  notice: "bg-rose-50 text-rose-600",
  eauction: "bg-amber-50 text-amber-700",
  report: "bg-emerald-50 text-emerald-700",
  news: "bg-violet-50 text-violet-700",
  openhouse: "bg-sky-50 text-sky-700",
};

type AssetTab = "layouts" | "eauction" | "flats" | "stray" | "ca";
type Asset = { icon: Icon; title: Text; sub: Text; href: string; cta: Text; stat?: string };

const ASSET_TABS: { key: AssetTab; label: Text }[] = [
  { key: "layouts", label: t2("BDA Layouts", "ಬಿಡಿಎ ಬಡಾವಣೆಗಳು") },
  { key: "eauction", label: t2("E-Auction Sites", "ಇ-ಹರಾಜು ನಿವೇಶನಗಳು") },
  { key: "flats", label: t2("Flats / Villas", "ಫ್ಲ್ಯಾಟ್ / ವಿಲ್ಲಾ") },
  { key: "stray", label: t2("Stray Sites", "ಬಿಡಿ ನಿವೇಶನಗಳು") },
  { key: "ca", label: t2("CA Sites", "ಸಿಎ ನಿವೇಶನಗಳು") },
];

const VIEW_LAYOUTS = t2("View Layouts", "ಬಡಾವಣೆಗಳನ್ನು ನೋಡಿ");
const VIEW_SITES = t2("View Sites", "ನಿವೇಶನಗಳನ್ನು ನೋಡಿ");
const VIEW_DETAILS = t2("View Details", "ವಿವರ ನೋಡಿ");

const ASSETS: Record<AssetTab, Asset[]> = {
  layouts: [
    { icon: HouseLine, title: t2("Dr. K. Shivarama Karanth Layout", "ಡಾ. ಕೆ. ಶಿವರಾಮ ಕಾರಂತ ಬಡಾವಣೆ"), sub: t2("Comprehensive layout plan", "ಸಮಗ್ರ ಬಡಾವಣೆ ಯೋಜನೆ"), href: LAYOUT_LINKS[2].href, cta: VIEW_LAYOUTS },
    { icon: MapTrifold, title: t2("Nadaprabhu Kempegowda Layout", "ನಾಡಪ್ರಭು ಕೆಂಪೇಗೌಡ ಬಡಾವಣೆ"), sub: t2("NPKL scheme plan", "ಎನ್‌ಪಿಕೆಎಲ್ ಯೋಜನಾ ವಿವರ"), href: LAYOUT_LINKS[3].href, cta: VIEW_LAYOUTS },
    { icon: Buildings, title: svc("formed").label, sub: t2("Layouts formed and handed over", "ರಚಿಸಿ ಹಸ್ತಾಂತರಿಸಿದ ಬಡಾವಣೆಗಳು"), href: svc("formed").href, cta: VIEW_LAYOUTS },
    { icon: MapPin, title: t2("South Zone Layouts", "ದಕ್ಷಿಣ ವಲಯ ಬಡಾವಣೆಗಳು"), sub: t2("Formed layouts in the South Zone", "ದಕ್ಷಿಣ ವಲಯದ ರಚಿತ ಬಡಾವಣೆಗಳು"), href: svc("south").href, cta: VIEW_LAYOUTS },
  ],
  eauction: [
    { icon: Gavel, title: t2("E-Auction Portal", "ಇ-ಹರಾಜು ಪೋರ್ಟಲ್"), sub: t2("Register and bid online", "ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ನೋಂದಾಯಿಸಿ ಬಿಡ್ ಮಾಡಿ"), href: EAUCTION_LINKS[0].href, cta: VIEW_SITES },
    { icon: FileText, title: t2("Latest Notification", "ಇತ್ತೀಚಿನ ಅಧಿಸೂಚನೆ"), sub: ANNOUNCEMENTS[0].title, href: EAUCTION_LINKS[1].href, cta: VIEW_DETAILS },
    { icon: MapPin, title: t2("Geo-tag of Sites", "ನಿವೇಶನಗಳ ಜಿಯೋ-ಟ್ಯಾಗ್"), sub: t2("Locate auction sites on the map", "ಹರಾಜು ನಿವೇಶನಗಳನ್ನು ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಿ"), href: EAUCTION_LINKS[2].href, cta: VIEW_SITES },
    { icon: Buildings, title: t2("Bulk Land", "ಬೃಹತ್ ಭೂಮಿ"), sub: ANNOUNCEMENTS[3].title, href: ANNOUNCEMENTS[3].href, cta: VIEW_DETAILS },
  ],
  flats: [
    { icon: Buildings, title: svc("flats").label, sub: t2("Book a BDA flat or villa", "ಬಿಡಿಎ ಫ್ಲ್ಯಾಟ್ ಅಥವಾ ವಿಲ್ಲಾ ಬುಕ್ ಮಾಡಿ"), href: svc("flats").href, cta: VIEW_DETAILS },
    { icon: HouseLine, title: online("housing").label, sub: t2("Official housing sales portal", "ಅಧಿಕೃತ ವಸತಿ ಮಾರಾಟ ಪೋರ್ಟಲ್"), href: online("housing").href, cta: VIEW_DETAILS },
    { icon: Star, title: ABOUT.stats[2].label, sub: t2("Transparent online allotment", "ಪಾರದರ್ಶಕ ಆನ್‌ಲೈನ್ ಹಂಚಿಕೆ"), href: online("housing").href, cta: VIEW_DETAILS, stat: ABOUT.stats[2].value },
    { icon: CreditCard, title: online("ptax").label, sub: t2("Pay tax for your BDA property", "ನಿಮ್ಮ ಬಿಡಿಎ ಆಸ್ತಿಯ ತೆರಿಗೆ ಪಾವತಿಸಿ"), href: online("ptax").href, cta: VIEW_DETAILS },
  ],
  stray: [
    { icon: MapPin, title: svc("stray").label, sub: t2("Individual sites across layouts", "ಬಡಾವಣೆಗಳ ಬಿಡಿ ನಿವೇಶನಗಳು"), href: svc("stray").href, cta: VIEW_SITES },
    { icon: MapTrifold, title: t2("Available Sites", "ಲಭ್ಯವಿರುವ ನಿವೇಶನಗಳು"), sub: t2("Planned page in the new structure", "ಹೊಸ ರಚನೆಯಲ್ಲಿ ಯೋಜಿತ ಪುಟ"), href: svc("stray").href, cta: VIEW_SITES },
    { icon: MagnifyingGlass, title: t2("Search / View Sites", "ನಿವೇಶನಗಳ ಹುಡುಕಾಟ"), sub: t2("Find sites on the e-auction portal", "ಇ-ಹರಾಜು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಹುಡುಕಿ"), href: EAUCTION_LINKS[0].href, cta: VIEW_SITES },
    { icon: MapPinArea, title: svc("map").label, sub: t2("Check BDA jurisdiction", "ಬಿಡಿಎ ವ್ಯಾಪ್ತಿ ಪರಿಶೀಲಿಸಿ"), href: svc("map").href, cta: VIEW_DETAILS },
  ],
  ca: [
    { icon: Buildings, title: svc("casite").label, sub: t2("Civic amenity site allotment", "ನಾಗರಿಕ ಸೌಲಭ್ಯ ನಿವೇಶನ ಹಂಚಿಕೆ"), href: svc("casite").href, cta: VIEW_SITES },
    { icon: Star, title: ABOUT.stats[1].label, sub: t2("Planned across BDA layouts", "ಬಿಡಿಎ ಬಡಾವಣೆಗಳಲ್ಲಿ ಯೋಜಿತ"), href: svc("casite").href, cta: VIEW_SITES, stat: ABOUT.stats[1].value },
    { icon: TreeStructure, title: t2("CA & TDR Department", "CA ಮತ್ತು TDR ವಿಭಾಗ"), sub: t2("Support & Public departments", "ಬೆಂಬಲ ಮತ್ತು ಸಾರ್ವಜನಿಕ ವಿಭಾಗಗಳು"), href: `${SITE}/section-layout`, cta: VIEW_DETAILS },
    { icon: MapTrifold, title: LAYOUT_LINKS[4].label, sub: t2("Zone-wise planning map", "ವಲಯವಾರು ಯೋಜನಾ ನಕ್ಷೆ"), href: LAYOUT_LINKS[4].href, cta: VIEW_DETAILS },
  ],
};

const ASSET_TONES = [
  { card: "bg-emerald-50/80 border-emerald-100", icon: "text-emerald-600" },
  { card: "bg-blue-50/80 border-blue-100", icon: "text-blue-600" },
  { card: "bg-violet-50/80 border-violet-100", icon: "text-violet-600" },
  { card: "bg-orange-50/80 border-orange-100", icon: "text-rose-500" },
];

export function Assets() {
  const { t } = useLang();
  const [tab, setTab] = useState<AssetTab>("layouts");
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-line bg-white p-5 shadow-sm">
      <Heading icon={Buildings} tone="bg-brand-soft text-brand" title={TEXT.assets} action={<MoreLink label={TEXT.exploreMore} href={svc("layouts").href} />} />
      <Tabs id="civic-assets" tabs={ASSET_TABS} value={tab} onChange={setTab} />
      <div className="mt-3 grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {ASSETS[tab].map((a, i) => {
            const tone = ASSET_TONES[i];
            return (
              <motion.a
                key={`${tab}-${i}`}
                href={a.href}
                {...external(a.href)}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.06, duration: 0.4, ease: EASE } }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
                whileHover={{ y: -4 }}
                className={cn("group flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-colors duration-300 hover:border-brand hover:bg-brand", tone.card)}
              >
                <span className="mb-2 mt-1 grid size-16 place-items-center rounded-full bg-white shadow-sm transition-colors group-hover:bg-white/15">
                  {a.stat ? (
                    <CountUp value={a.stat} className="font-display text-lg font-bold text-brand group-hover:text-white" />
                  ) : (
                    <a.icon weight="duotone" className={cn("size-10 transition-transform duration-500 group-hover:scale-110 group-hover:text-white", tone.icon)} />
                  )}
                </span>
                <span className="line-clamp-2 text-[12.5px] font-bold leading-snug text-navy transition-colors group-hover:text-white">{t(a.title)}</span>
                <span className="mt-1 line-clamp-2 text-[11px] leading-snug text-muted transition-colors group-hover:text-white/80">{t(a.sub)}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand transition-colors group-hover:text-white">
                  {t(a.cta)}
                  <ArrowRight weight="bold" className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </motion.a>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

const LINKS: { icon: Icon; label: Text; href: string }[] = [
  { icon: Briefcase, label: svc("business").label, href: svc("business").href },
  { icon: Buildings, label: svc("formed").label, href: svc("formed").href },
  { icon: Info, label: svc("jcc").label, href: svc("jcc").href },
  { icon: Images, label: svc("gallery").label, href: svc("gallery").href },
  { icon: Files, label: t2("Forms & Downloads", "ನಮೂನೆಗಳು ಮತ್ತು ಡೌನ್‌ಲೋಡ್‌ಗಳು"), href: svc("online").href },
  { icon: FileText, label: t2("RTI Information", "ಆರ್‌ಟಿಐ ಮಾಹಿತಿ"), href: svc("rti").href },
  { icon: EnvelopeSimple, label: svc("contact").label, href: svc("contact").href },
];

export function ImportantLinks() {
  const { t } = useLang();
  return (
    <Container className="pb-14 pt-10 md:pb-16 md:pt-12">
      <Heading icon={LinkSimple} tone="bg-brand-soft text-brand" title={TEXT.links} action={<MoreLink label={TEXT.allLinks} to="/sitemap" />} />
      <motion.ul {...stagger(0.05)} className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {LINKS.map((l) => (
          <motion.li key={l.label.en} variants={reveal}>
            <a
              href={l.href}
              {...external(l.href)}
              className="group flex h-full items-center gap-3 rounded-xl border border-line bg-white px-3 py-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand hover:bg-brand"
            >
              <l.icon weight="duotone" className="size-7 shrink-0 text-brand transition-transform duration-300 group-hover:scale-110 group-hover:text-white" />
              <span className="text-[12.5px] font-semibold leading-tight text-navy transition-colors group-hover:text-white">{t(l.label)}</span>
            </a>
          </motion.li>
        ))}
      </motion.ul>
    </Container>
  );
}

export function CivicSections() {
  return (
    <>
      <ExploreBda />
      <QuickServices />
      <Initiatives />
      <Container className="pt-10 md:pt-12">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <Updates />
          <Assets />
        </div>
      </Container>
      <ImportantLinks />
    </>
  );
}
