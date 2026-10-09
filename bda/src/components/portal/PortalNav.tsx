import { ArrowRight, CaretDown, CaretRight, House, List, TreeStructure, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { EASE } from "@/components/home/shared";
import { SearchBox } from "@/components/layout/TopBar";
import { HIGHLIGHTS, ORG } from "@/lib/content";
import { useDesign } from "@/lib/design";
import { AREAS, DEPARTMENT_GROUPS, ZONES, type AreaKey, type IaArea, type IaLink } from "@/lib/ia";
import { useLang, type Text } from "@/lib/i18n";
import { asset, cn, external } from "@/lib/utils";

const t2 = (en: string, kn: string): Text => ({ en, kn });

const TEXT = {
  menu: t2("Menu", "ಮೆನು"),
  home: t2("Home", "ಮುಖಪುಟ"),
  sitemap: t2("Sitemap", "ಸೈಟ್‌ಮ್ಯಾಪ್"),
  explore: t2("Go to", "ಇಲ್ಲಿಗೆ ಹೋಗಿ"),
  zones: t2("Zones & Project Offices", "ವಲಯಗಳು ಮತ್ತು ಯೋಜನಾ ಕಚೇರಿಗಳು"),
  close: t2("Close", "ಮುಚ್ಚಿ"),
};

function Leaf({ link, className }: { link: IaLink; className?: string }) {
  const { t } = useLang();
  return (
    <a
      href={link.href}
      {...external(link.href)}
      className={cn("group/leaf -mx-2 flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] text-ink/80 transition-colors hover:bg-brand hover:text-white", className)}
    >
      {t(link.label)}
      <CaretRight weight="bold" className="size-3 shrink-0 opacity-0 transition-[opacity,translate] group-hover/leaf:translate-x-0.5 group-hover/leaf:opacity-100" />
    </a>
  );
}

function Group({ link }: { link: IaLink }) {
  const { t } = useLang();
  return (
    <div className="mb-4 break-inside-avoid rounded-xl bg-[#f5f8ff] p-3">
      <a
        href={link.href}
        {...external(link.href)}
        className="-mx-1 block rounded-md px-1 py-0.5 text-[13.5px] font-semibold text-navy transition-colors hover:bg-brand hover:text-white"
      >
        {t(link.label)}
      </a>
      <ul className="mt-1.5">
        {link.children!.map((c) => (
          <li key={c.label.en}>
            <Leaf link={c} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function AreaLinks({ area }: { area: IaArea }) {
  const { t } = useLang();
  if (area.key === "departments") {
    return (
      <div>
        <div className="grid grid-cols-4 gap-4">
          {DEPARTMENT_GROUPS.map((g) => (
            <div key={g.key} className="rounded-xl bg-[#f5f8ff] p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand">{t(g.label)}</p>
              <ul className="mt-2">
                {g.departments.map((d) => (
                  <li key={d.label.en}>
                    <Leaf link={d} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[11px] font-bold uppercase tracking-wider text-muted">{t(TEXT.zones)}</span>
          {ZONES.map((z) => (
            <a
              key={z.label.en}
              href={z.href}
              {...external(z.href)}
              className="rounded-full border border-line px-3 py-1 text-[12px] font-medium text-navy transition-colors hover:border-brand hover:bg-brand hover:text-white"
            >
              {t(z.label)}
            </a>
          ))}
        </div>
      </div>
    );
  }
  const leaves = area.items.filter((i) => !i.children);
  const groups = area.items.filter((i) => i.children);
  return (
    <div className="columns-3 gap-5">
      {leaves.length > 0 && (
        <ul className="mb-4 break-inside-avoid px-1">
          {leaves.map((l) => (
            <li key={l.label.en}>
              <Leaf link={l} className="py-2 text-[13.5px] font-medium text-navy" />
            </li>
          ))}
        </ul>
      )}
      {groups.map((g) => (
        <Group key={g.label.en} link={g} />
      ))}
    </div>
  );
}

function MegaPanel({ area, onEnter, onLeave }: { area: IaArea; onEnter: () => void; onLeave: () => void }) {
  const { t } = useLang();
  const helpline = HIGHLIGHTS[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: EASE }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="absolute inset-x-0 top-full border-b border-line bg-white shadow-[0_30px_60px_-30px_rgba(11,44,107,0.45)]"
    >
      <div className="mx-auto grid max-w-site grid-cols-[260px_1fr] gap-8 px-5 py-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={area.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col rounded-2xl bg-gradient-to-br from-navy to-brand p-5 text-white"
          >
            <span className="grid size-11 place-items-center rounded-xl bg-white/15">
              <area.icon weight="duotone" className="size-6" />
            </span>
            <p className="mt-3 font-display text-xl font-bold">{t(area.label)}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-white/80">{t(area.blurb)}</p>
            <a
              href={area.href}
              {...external(area.href)}
              className="group mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-[12.5px] font-semibold text-navy transition-colors hover:bg-brand-bright hover:text-white"
            >
              {t(TEXT.explore)} {t(area.label)}
              <ArrowRight weight="bold" className="transition-transform group-hover:translate-x-0.5" />
            </a>
            <a href={helpline.href} className="mt-auto pt-6 text-[12px] text-white/75 transition-colors hover:text-white">
              {t(helpline.title)} · <span className="font-semibold text-white">{t(helpline.sub)}</span>
            </a>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div key={area.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, delay: 0.04 }}>
            <AreaLinks area={area} />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function DrawerLinks({ links, depth = 0 }: { links: IaLink[]; depth?: number }) {
  const { t } = useLang();
  return (
    <ul className={cn(depth > 0 && "border-l border-line pl-3")}>
      {links.map((l) =>
        l.children ? (
          <li key={l.label.en}>
            <details className="group/sub">
              <summary className="-mx-2 flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-1.5 text-[13px] font-medium text-navy hover:bg-brand hover:text-white">
                {t(l.label)}
                <CaretDown className="size-3.5 transition-transform group-open/sub:rotate-180" />
              </summary>
              <DrawerLinks links={l.children} depth={depth + 1} />
            </details>
          </li>
        ) : (
          <li key={l.label.en}>
            <a href={l.href} {...external(l.href)} className="-mx-2 block rounded-md px-2 py-1.5 text-[13px] text-ink/80 transition-colors hover:bg-brand hover:text-white">
              {t(l.label)}
            </a>
          </li>
        ),
      )}
    </ul>
  );
}

function Drawer({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" aria-label={t(TEXT.close)} className="absolute inset-0 bg-navy-deep/50" onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={t(TEXT.menu)}
        className="absolute right-0 top-0 flex h-full w-[min(400px,92vw)] flex-col bg-white shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.25 }}
      >
        <div className="flex items-center justify-between bg-navy px-4 py-3 text-white">
          <span className="font-display font-semibold">{t(TEXT.menu)}</span>
          <button type="button" onClick={onClose} aria-label={t(TEXT.close)} className="rounded p-1 hover:bg-white/15">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <SearchBox className="mb-4 md:hidden" />
          <ul className="divide-y divide-line">
            {AREAS.map((a) => (
              <li key={a.key}>
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-3 py-3 text-sm font-semibold text-navy">
                    <span className="grid size-8 place-items-center rounded-lg bg-brand-soft text-brand">
                      <a.icon weight="duotone" className="size-4.5" />
                    </span>
                    <span className="flex-1">{t(a.label)}</span>
                    <CaretDown className="transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pb-3 pl-11">
                    <DrawerLinks links={a.items} />
                  </div>
                </details>
              </li>
            ))}
          </ul>
          <Link
            to="/sitemap"
            onClick={onClose}
            className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand to-brand-bright px-4 py-3 text-sm font-bold text-white shadow-md ring-2 ring-amber-300/80 transition-colors hover:from-navy hover:to-navy"
          >
            <TreeStructure weight="bold" />
            {t(TEXT.sitemap)}
          </Link>
        </div>
      </motion.aside>
    </motion.div>
  );
}

export function PortalNav() {
  const { t, lang } = useLang();
  const { root, design } = useDesign();
  const { pathname } = useLocation();
  const [open, setOpen] = useState<AreaKey | null>(null);
  const [drawer, setDrawer] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const area = AREAS.find((a) => a.key === open);

  const show = (k: AreaKey) => {
    window.clearTimeout(timer.current);
    setOpen(k);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpen(null), 140);
  };
  const keep = () => window.clearTimeout(timer.current);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <nav
        className={cn(
          "sticky top-0 z-40 shadow-sm backdrop-blur",
          design === "garden" ? "border-b border-white bg-white/80" : "border-y border-line bg-white/95",
        )}
        onMouseLeave={hide}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(null);
        }}
      >
        <div className="relative mx-auto flex max-w-site items-stretch px-5 lg:px-8">
          {design === "garden" && (
            <Link to={root} className="mr-auto flex min-w-0 items-center gap-2.5 py-2 pr-4 xl:shrink-0">
              <img src={asset("images/bda-logo.jpg")} alt="BDA" className="size-10 shrink-0 rounded-full sm:size-12" />
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-display text-[12px] font-bold uppercase tracking-wide text-navy sm:text-[13px]">{t(ORG.name)}</span>
                <span className="block truncate text-[11px] font-semibold text-navy/75 sm:text-[11.5px]">{lang === "en" ? ORG.nameKn : ORG.name.en}</span>
              </span>
            </Link>
          )}
          {design === "civic" || design === "garden" ? (
            <Link
              to={root}
              className={cn(
                "relative mr-1 items-center px-3 py-3 text-[13px] font-semibold text-brand transition-colors hover:bg-brand hover:text-white",
                design === "garden" ? "hidden md:flex" : "flex",
              )}
            >
              {t(TEXT.home)}
              <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-t bg-brand" aria-hidden />
            </Link>
          ) : (
            <Link to={root} aria-label="Home" className="my-1.5 mr-2 grid size-9 shrink-0 place-items-center rounded-md bg-navy text-white transition-colors hover:bg-brand">
              <House weight="fill" size={18} />
            </Link>
          )}
          <ul className={cn("hidden items-stretch xl:flex", design === "garden" ? "" : "flex-1")}>
            {AREAS.map((a) => {
              const on = open === a.key;
              return (
                <li key={a.key} onMouseEnter={() => show(a.key)} className="flex">
                  <button
                    type="button"
                    aria-expanded={on}
                    onClick={() => (on ? setOpen(null) : show(a.key))}
                    onFocus={() => show(a.key)}
                    className={cn(
                      "relative flex items-center gap-1 text-[13px] font-semibold transition-colors",
                      design === "garden" ? "px-1.5 text-[12.5px] min-[1400px]:px-2" : "px-3",
                      on ? "text-white" : "text-navy hover:bg-brand hover:text-white",
                    )}
                  >
                    {on && <motion.span layoutId="portal-nav-active" className="absolute inset-0 bg-brand" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
                    <span className="relative whitespace-nowrap">{t(a.label)}</span>
                    <CaretDown weight="bold" className={cn("relative size-3 transition-transform duration-300", on && "rotate-180")} />
                  </button>
                </li>
              );
            })}
          </ul>
          <Link
            to="/sitemap"
            title={t(TEXT.sitemap)}
            aria-current={pathname === "/sitemap" ? "page" : undefined}
            className={cn(
              "relative my-auto ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-brand-bright px-2.5 py-2 text-[12.5px] font-bold text-white shadow-[0_6px_16px_-6px_rgba(29,78,216,0.7)] ring-2 ring-amber-300/80 transition-all hover:-translate-y-0.5 hover:from-navy hover:to-navy sm:px-3.5",
              design === "garden" && "xl:max-[1399px]:px-2.5",
            )}
          >
            <span className="absolute -right-1 -top-1 flex size-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-amber-400" />
              <span className="relative size-2.5 rounded-full bg-amber-400 ring-2 ring-white" />
            </span>
            <TreeStructure weight="bold" className="size-4" />
            <span className={cn("hidden sm:inline", design === "garden" && "xl:max-[1399px]:hidden")}>{t(TEXT.sitemap)}</span>
          </Link>
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-expanded={drawer}
            className="my-1.5 ml-2 flex shrink-0 items-center gap-2 self-center rounded-md border border-line bg-white px-3 py-1.5 text-[13px] font-semibold text-navy shadow-sm transition-colors hover:border-brand hover:bg-brand hover:text-white sm:px-4 xl:hidden"
          >
            <List size={18} weight="bold" />
            {t(TEXT.menu)}
          </button>
        </div>
        <AnimatePresence>{area && <MegaPanel area={area} onEnter={keep} onLeave={hide} />}</AnimatePresence>
      </nav>
      <AnimatePresence>{drawer && <Drawer onClose={() => setDrawer(false)} />}</AnimatePresence>
    </>
  );
}
