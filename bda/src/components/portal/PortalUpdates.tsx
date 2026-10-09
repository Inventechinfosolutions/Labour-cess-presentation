import {
  ArrowRight,
  Bell,
  Buildings,
  CalendarBlank,
  FilePdf,
  FileText,
  Gavel,
  HouseLine,
  MapPin,
  MapTrifold,
  Star,
  TreeStructure,
  type Icon,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import { Container, CountUp, EASE } from "@/components/home/shared";
import { ABOUT, ANNOUNCEMENTS, EAUCTION_LINKS, HIGHLIGHTS, LAYOUT_LINKS, NEWS, ONLINE_SERVICES, OPEN_HOUSE, SERVICES, SITE, type ServiceIcon } from "@/lib/content";
import { useLang, type Text } from "@/lib/i18n";
import { PHOTOS } from "@/lib/photos";
import { asset, cn, dateParts, external } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });
const svc = (icon: ServiceIcon) => SERVICES.find((s) => s.icon === icon)!;

export type UpdateTab = "all" | "notice" | "eauction" | "report" | "news" | "openhouse";
export type Update = { tab: Exclude<UpdateTab, "all">; date?: string; title: Text; href: string; pdf?: boolean };

export const UPDATE_TABS: { key: UpdateTab; label: Text }[] = [
  { key: "all", label: t2("All", "ಎಲ್ಲಾ") },
  { key: "notice", label: t2("Notifications", "ಅಧಿಸೂಚನೆಗಳು") },
  { key: "eauction", label: t2("E-Auction", "ಇ-ಹರಾಜು") },
  { key: "report", label: t2("Reports", "ವರದಿಗಳು") },
  { key: "news", label: t2("News", "ಸುದ್ದಿ") },
  { key: "openhouse", label: t2("Open House", "ಓಪನ್ ಹೌಸ್") },
];

const TAB_TONE: Record<Update["tab"], string> = {
  notice: "bg-sky-100 text-sky-700",
  eauction: "bg-amber-100 text-amber-700",
  report: "bg-emerald-100 text-emerald-700",
  news: "bg-violet-100 text-violet-700",
  openhouse: "bg-rose-100 text-rose-700",
};

export const UPDATES = [
  ...ANNOUNCEMENTS.map((a): Update => ({ tab: a.tab, date: a.date, title: a.title, href: a.href, pdf: a.pdf })),
  ...NEWS.map((n): Update => ({ tab: "news", date: n.date, title: n.title, href: n.href })),
  { tab: "openhouse", title: OPEN_HOUSE.label, href: OPEN_HOUSE.href } satisfies Update,
].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

const TEXT = {
  updates: t2("Latest Updates", "ಇತ್ತೀಚಿನ ಅಪ್‌ಡೇಟ್‌ಗಳು"),
  assets: t2("Featured BDA Assets", "ಪ್ರಮುಖ ಬಿಡಿಎ ಆಸ್ತಿಗಳು"),
  viewAll: t2("View all", "ಎಲ್ಲಾ ನೋಡಿ"),
  ongoing: t2("Ongoing", "ಚಾಲ್ತಿಯಲ್ಲಿದೆ"),
  bannerEyebrow: t2("A better Bengaluru", "ಉತ್ತಮ ಬೆಂಗಳೂರು"),
  banner: t2("Creating Sustainable and Inclusive Communities for a Better Bengaluru", "ಉತ್ತಮ ಬೆಂಗಳೂರಿಗಾಗಿ ಸುಸ್ಥಿರ ಮತ್ತು ಒಳಗೊಳ್ಳುವ ಸಮುದಾಯಗಳ ನಿರ್ಮಾಣ"),
  bannerCta: t2("Explore all services", "ಎಲ್ಲಾ ಸೇವೆಗಳನ್ನು ನೋಡಿ"),
  sitemap: t2("See the new structure", "ಹೊಸ ರಚನೆಯನ್ನು ನೋಡಿ"),
  plants: t2("Planting initiative under Green Bengaluru", "ಹಸಿರು ಬೆಂಗಳೂರು ಅಡಿಯಲ್ಲಿ ಗಿಡ ನೆಡುವ ಉಪಕ್ರಮ"),
};

function TabRow<K extends string>({ tabs, value, onChange, id }: { tabs: { key: K; label: Text }[]; value: K; onChange: (k: K) => void; id: string }) {
  const { t } = useLang();
  return (
    <div role="tablist" className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [contain:inline-size]">
      {tabs.map((tab) => {
        const on = tab.key === value;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(tab.key)}
            className={cn(
              "relative shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors",
              on ? "text-white" : "text-navy hover:bg-brand hover:text-white",
            )}
          >
            {on && <motion.span layoutId={`${id}-tab`} className="absolute inset-0 rounded-full bg-brand" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <span className="relative">{t(tab.label)}</span>
          </button>
        );
      })}
    </div>
  );
}

function LatestUpdates() {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<UpdateTab>("all");
  const items = UPDATES.filter((u) => tab === "all" || u.tab === tab).slice(0, 5);
  const tabLabel = (k: Update["tab"]) => t(UPDATE_TABS.find((x) => x.key === k)!.label);
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
          <Bell weight="duotone" className="size-6 text-brand" />
          {t(TEXT.updates)}
        </h2>
        <a href={HIGHLIGHTS[5].href} {...external(HIGHLIGHTS[5].href)} className="group flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-semibold text-brand transition-colors hover:bg-brand hover:text-white">
          {t(TEXT.viewAll)}
          <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-1" />
        </a>
      </div>
      <TabRow id="portal-updates" tabs={UPDATE_TABS} value={tab} onChange={setTab} />
      <ul className="mt-3 min-h-[340px] divide-y divide-line">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((u, i) => {
            const d = u.date ? dateParts(u.date, lang) : null;
            return (
              <motion.li
                key={`${tab}-${u.href}-${u.title.en}`}
                layout
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05, duration: 0.35, ease: EASE } }}
                exit={{ opacity: 0, x: -18, transition: { duration: 0.15 } }}
              >
                <a href={u.href} {...external(u.href)} className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-brand">
                  <span className="grid w-14 shrink-0 place-items-center rounded-lg bg-page py-1.5 text-center transition-colors group-hover:bg-white/15">
                    {d ? (
                      <>
                        <span className="font-display text-lg font-bold leading-none text-navy group-hover:text-white">{d.day}</span>
                        <span className="mt-0.5 text-[9.5px] font-semibold uppercase text-muted group-hover:text-white/80">{d.monthYear}</span>
                      </>
                    ) : (
                      <>
                        <CalendarBlank weight="duotone" className="size-5 text-brand group-hover:text-white" />
                        <span className="mt-0.5 text-[9.5px] font-semibold uppercase text-muted group-hover:text-white/80">{t(TEXT.ongoing)}</span>
                      </>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("inline-block rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", TAB_TONE[u.tab], "group-hover:bg-white/20 group-hover:text-white")}>
                      {tabLabel(u.tab)}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-[13.5px] font-medium leading-snug text-ink group-hover:text-white">{t(u.title)}</span>
                  </span>
                  {u.pdf ? (
                    <FilePdf weight="duotone" className="size-5 shrink-0 text-red-500 group-hover:text-white" />
                  ) : (
                    <ArrowRight weight="bold" className="size-4 shrink-0 text-brand transition-transform group-hover:translate-x-1 group-hover:text-white" />
                  )}
                </a>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

type AssetTab = "layouts" | "eauction" | "flats" | "stray" | "ca";
type Asset = { title: Text; sub: Text; href: string; image?: string; icon: Icon; stat?: string };

const ASSET_TABS: { key: AssetTab; label: Text }[] = [
  { key: "layouts", label: t2("BDA Layouts", "ಬಿಡಿಎ ಬಡಾವಣೆಗಳು") },
  { key: "eauction", label: t2("E-Auction Sites", "ಇ-ಹರಾಜು ನಿವೇಶನಗಳು") },
  { key: "flats", label: t2("Flats / Villas", "ಫ್ಲ್ಯಾಟ್‌ / ವಿಲ್ಲಾ") },
  { key: "stray", label: t2("Stray Sites", "ಬಿಡಿ ನಿವೇಶನಗಳು") },
  { key: "ca", label: t2("CA Sites", "ಸಿಎ ನಿವೇಶನಗಳು") },
];

const ASSETS: Record<AssetTab, Asset[]> = {
  layouts: [
    { title: t2("Dr. K. Shivarama Karanth Layout", "ಡಾ. ಕೆ. ಶಿವರಾಮ ಕಾರಂತ ಬಡಾವಣೆ"), sub: LAYOUT_LINKS[2].label, href: LAYOUT_LINKS[2].href, image: PHOTOS.layoutSigns, icon: MapTrifold },
    { title: t2("Nadaprabhu Kempegowda Layout", "ನಾಡಪ್ರಭು ಕೆಂಪೇಗೌಡ ಬಡಾವಣೆ"), sub: LAYOUT_LINKS[3].label, href: LAYOUT_LINKS[3].href, icon: MapTrifold },
    { title: svc("formed").label, sub: t2("Layouts formed and handed over", "ರಚಿಸಿ ಹಸ್ತಾಂತರಿಸಿದ ಬಡಾವಣೆಗಳು"), href: svc("formed").href, image: PHOTOS.layoutBoard, icon: MapTrifold },
  ],
  eauction: [
    { title: EAUCTION_LINKS[0].label, sub: t2("Register and place bids online", "ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ನೋಂದಾಯಿಸಿ ಬಿಡ್ ಮಾಡಿ"), href: EAUCTION_LINKS[0].href, icon: Gavel },
    { title: EAUCTION_LINKS[1].label, sub: ANNOUNCEMENTS[0].title, href: EAUCTION_LINKS[1].href, icon: FileText },
    { title: EAUCTION_LINKS[2].label, sub: t2("Locate auction sites on the map", "ಹರಾಜು ನಿವೇಶನಗಳನ್ನು ನಕ್ಷೆಯಲ್ಲಿ ನೋಡಿ"), href: EAUCTION_LINKS[2].href, icon: MapPin },
  ],
  flats: [
    { title: svc("flats").label, sub: t2("Book a BDA flat or villa", "ಬಿಡಿಎ ಫ್ಲ್ಯಾಟ್ ಅಥವಾ ವಿಲ್ಲಾ ಬುಕ್ ಮಾಡಿ"), href: svc("flats").href, image: PHOTOS.towers, icon: Buildings },
    { title: ONLINE_SERVICES[2].label, sub: t2("Official housing sales portal", "ಅಧಿಕೃತ ವಸತಿ ಮಾರಾಟ ಪೋರ್ಟಲ್"), href: ONLINE_SERVICES[2].href, image: PHOTOS.villa, icon: HouseLine },
    { title: ABOUT.stats[2].label, sub: t2("Transparent online allotment", "ಪಾರದರ್ಶಕ ಆನ್‌ಲೈನ್ ಹಂಚಿಕೆ"), href: ONLINE_SERVICES[2].href, icon: Star, stat: ABOUT.stats[2].value },
  ],
  stray: [
    { title: svc("stray").label, sub: t2("Individual sites across BDA layouts", "ಬಿಡಿಎ ಬಡಾವಣೆಗಳ ಬಿಡಿ ನಿವೇಶನಗಳು"), href: svc("stray").href, icon: MapPin },
    { title: t2("Available Sites", "ಲಭ್ಯವಿರುವ ನಿವೇಶನಗಳು"), sub: t2("Planned page in the new structure", "ಹೊಸ ರಚನೆಯಲ್ಲಿ ಯೋಜಿತ ಪುಟ"), href: svc("stray").href, icon: MapTrifold },
    { title: t2("Search / View Sites", "ನಿವೇಶನಗಳ ಹುಡುಕಾಟ"), sub: t2("Find sites on the e-auction portal", "ಇ-ಹರಾಜು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ನಿವೇಶನ ಹುಡುಕಿ"), href: EAUCTION_LINKS[0].href, icon: Gavel },
  ],
  ca: [
    { title: svc("casite").label, sub: t2("Civic amenity site allotment", "ನಾಗರಿಕ ಸೌಲಭ್ಯ ನಿವೇಶನ ಹಂಚಿಕೆ"), href: svc("casite").href, icon: Buildings },
    { title: t2("CA & TDR Department", "CA ಮತ್ತು TDR ವಿಭಾಗ"), sub: t2("Part of Support & Public departments", "ಬೆಂಬಲ ಮತ್ತು ಸಾರ್ವಜನಿಕ ವಿಭಾಗಗಳ ಭಾಗ"), href: `${SITE}/section-layout`, icon: TreeStructure },
    { title: ABOUT.stats[1].label, sub: t2("Planned across BDA layouts", "ಬಿಡಿಎ ಬಡಾವಣೆಗಳಲ್ಲಿ ಯೋಜಿತ"), href: svc("casite").href, icon: Star, stat: ABOUT.stats[1].value },
  ],
};

function FeaturedAssets() {
  const { t } = useLang();
  const [tab, setTab] = useState<AssetTab>("layouts");
  return (
    <div className="flex min-w-0 flex-col rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold text-navy">
          <MapTrifold weight="duotone" className="size-6 text-brand" />
          {t(TEXT.assets)}
        </h2>
        <a href={svc("layouts").href} {...external(svc("layouts").href)} className="group flex items-center gap-1 rounded-md px-2 py-1 text-[13px] font-semibold text-brand transition-colors hover:bg-brand hover:text-white">
          {t(TEXT.viewAll)}
          <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-1" />
        </a>
      </div>
      <TabRow id="portal-assets" tabs={ASSET_TABS} value={tab} onChange={setTab} />
      <div className="mt-3 grid flex-1 gap-3 sm:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {ASSETS[tab].map((a, i) => (
            <motion.a
              key={`${tab}-${i}`}
              href={a.href}
              {...external(a.href)}
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.07, duration: 0.4, ease: EASE } }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
              whileHover={{ y: -4 }}
              className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white transition-colors duration-300 hover:border-brand hover:bg-brand"
            >
              <div className="relative min-h-28 flex-1 overflow-hidden bg-gradient-to-br from-brand-soft to-white sm:min-h-36">
                {a.image ? (
                  <img src={asset(a.image)} alt="" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : a.stat ? (
                  <span className="absolute inset-0 grid place-items-center">
                    <CountUp value={a.stat} className="font-display text-3xl font-bold text-brand" />
                  </span>
                ) : (
                  <>
                    <span className="absolute -right-5 -top-5 size-20 rounded-full bg-brand/10" aria-hidden />
                    <a.icon weight="duotone" className="absolute inset-0 m-auto size-12 text-brand transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-8deg]" />
                  </>
                )}
              </div>
              <div className="flex flex-col p-3">
                <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-navy transition-colors group-hover:text-white">{t(a.title)}</h3>
                <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-muted transition-colors group-hover:text-white/80">{t(a.sub)}</p>
              </div>
            </motion.a>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ClosingBanner() {
  const { t } = useLang();
  const stats = [
    { value: ABOUT.stats[0].value, label: ABOUT.stats[0].label },
    { value: ABOUT.stats[1].value, label: ABOUT.stats[1].label },
    { value: ABOUT.stats[2].value, label: ABOUT.stats[2].label },
    { value: "15 Lakh", label: TEXT.plants },
  ];
  return (
    <Container className="pb-16 md:pb-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative overflow-hidden rounded-3xl bg-navy text-white"
      >
        <motion.img
          src={asset(PHOTOS.flats)}
          alt=""
          initial={{ scale: 1.15 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.4, ease: EASE }}
          className="absolute inset-y-0 right-0 h-full w-full object-cover md:w-2/3"
        />
        <span className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/30" aria-hidden />
        <span className="absolute inset-0 bg-gradient-to-t from-navy/90 via-transparent to-transparent" aria-hidden />
        <div className="relative px-6 py-10 md:px-12 md:py-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-bright">{t(TEXT.bannerEyebrow)}</p>
          <h2 className="mt-2 max-w-2xl font-display text-2xl font-bold leading-tight md:text-[2.1rem]">{t(TEXT.banner)}</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#services" className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-navy transition-colors hover:bg-brand hover:text-white">
              {t(TEXT.bannerCta)}
              <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-1" />
            </a>
            <Link to="/sitemap" className="group inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-[13.5px] font-semibold transition-colors hover:border-brand hover:bg-brand">
              <TreeStructure weight="bold" />
              {t(TEXT.sitemap)}
            </Link>
          </div>
          <motion.dl
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
            className="mt-10 grid grid-cols-2 gap-3 lg:grid-cols-4"
          >
            {stats.map((s) => (
              <motion.div
                key={s.value}
                variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-colors hover:bg-brand"
              >
                <dt className="sr-only">{t(s.label)}</dt>
                <dd>
                  <CountUp value={s.value} className="font-display text-2xl font-bold md:text-3xl" />
                  <p className="mt-1 text-[12px] leading-snug text-white/80">{t(s.label)}</p>
                </dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </motion.div>
    </Container>
  );
}

export function PortalUpdates() {
  return (
    <>
      <Container>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <LatestUpdates />
          <FeaturedAssets />
        </div>
      </Container>
      <ClosingBanner />
    </>
  );
}
