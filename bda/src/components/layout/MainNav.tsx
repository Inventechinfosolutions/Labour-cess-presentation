import { CaretDown, House, List, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { SearchBox } from "@/components/layout/TopBar";
import { NAV, OPEN_HOUSE, QUICK_STRIP, type NavItem } from "@/lib/content";
import { useDesign } from "@/lib/design";
import { useLang } from "@/lib/i18n";
import { cn, external } from "@/lib/utils";

const MORE = { en: "More", kn: "ಇನ್ನಷ್ಟು" };
const MENU = { en: "Menu", kn: "ಮೆನು" };
const QUICK = { en: "Quick links", kn: "ತ್ವರಿತ ಕೊಂಡಿಗಳು" };

function NavEntry({ item }: { item: NavItem }) {
  const { t } = useLang();
  const { pick } = useDesign();
  return (
    <li className="group relative">
      <a
        href={item.href}
        {...external(item.href)}
        className={cn(
          "flex items-center gap-1 px-3 py-3 text-[13px] font-medium transition-colors",
          pick(
            "text-white/95 hover:bg-brand group-focus-within:bg-brand",
            "text-navy hover:bg-brand hover:text-white group-focus-within:bg-brand group-focus-within:text-white",
          ),
        )}
      >
        {t(item.label)}
        {item.children && <CaretDown weight="bold" className="size-3 opacity-80" />}
      </a>
      {item.children && (
        <ul className="invisible absolute left-0 top-full z-50 min-w-60 translate-y-1 rounded-b-lg border border-line bg-white py-2 text-ink opacity-0 shadow-xl transition-all group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
          {item.children.map((c) => (
            <li key={c.label.en}>
              <a
                href={c.href}
                {...external(c.href)}
                className="block px-4 py-2 text-[13px] transition-colors hover:bg-brand hover:text-white"
              >
                {t(c.label)}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
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
      <button type="button" aria-label="Close" className="absolute inset-0 bg-navy-deep/50" onClick={onClose} />
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={t(MENU)}
        className="absolute right-0 top-0 flex h-full w-[min(380px,92vw)] flex-col bg-white shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.25 }}
      >
        <div className="flex items-center justify-between bg-brand px-4 py-3 text-white">
          <span className="font-display font-semibold">{t(MENU)}</span>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-white/15">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <SearchBox className="mb-4 md:hidden" />
          <ul className="divide-y divide-line">
            {NAV.map((item) =>
              item.children ? (
                <li key={item.label.en}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-2.5 text-sm font-semibold text-navy">
                      {t(item.label)}
                      <CaretDown className="transition-transform group-open:rotate-180" />
                    </summary>
                    <ul className="pb-2 pl-3">
                      {item.children.map((c) => (
                        <li key={c.label.en}>
                          <a href={c.href} {...external(c.href)} className="-mx-2 block rounded-md px-2 py-1.5 text-[13px] text-muted transition-colors hover:bg-brand hover:text-white">
                            {t(c.label)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ) : (
                <li key={item.label.en}>
                  <a href={item.href} {...external(item.href)} className="-mx-2 block rounded-md px-2 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-brand hover:text-white">
                    {t(item.label)}
                  </a>
                </li>
              ),
            )}
          </ul>
          <div className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-muted">{t(QUICK)}</div>
          <ul className="mt-2 grid grid-cols-1 gap-1">
            {QUICK_STRIP.map((l) => (
              <li key={l.label.en}>
                <a href={l.href} {...external(l.href)} className="block rounded-md px-2 py-1.5 text-[13px] transition-colors hover:bg-brand hover:text-white">
                  {t(l.label)}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={OPEN_HOUSE.href}
            {...external(OPEN_HOUSE.href)}
            className="mt-4 block rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-bright"
          >
            {t(OPEN_HOUSE.label)}
          </a>
        </div>
      </motion.aside>
    </motion.div>
  );
}

export function MainNav() {
  const { t } = useLang();
  const { pick, root } = useDesign();
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className={cn("sticky top-0 z-40", pick("bg-[#12398f] shadow-md", "border-y border-line bg-white/95 shadow-sm backdrop-blur"))}>
        <div className="mx-auto flex max-w-site items-stretch px-5 lg:px-8">
          <Link
            to={root}
            aria-label="Home"
            className={cn(
              "mr-1 grid shrink-0 place-items-center text-white transition-colors",
              pick("w-12 bg-brand-bright hover:bg-[#3b7bff]", "my-1.5 size-9 rounded-md bg-navy hover:bg-brand"),
            )}
          >
            <House weight="fill" size={18} />
          </Link>
          <ul className="hidden flex-1 items-center xl:flex">
            {NAV.map((item) => (
              <NavEntry key={item.label.en} item={item} />
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            className={cn(
              "ml-auto flex items-center gap-2 px-4 text-[13px] font-semibold transition-colors",
              pick(
                "bg-navy py-3 text-white hover:bg-navy-deep",
                "my-1.5 rounded-md border border-line bg-white py-1.5 text-navy shadow-sm hover:border-brand hover:bg-brand hover:text-white",
              ),
            )}
          >
            <List size={18} weight="bold" />
            <span className="hidden xl:inline">{t(MORE)}</span>
            <span className="xl:hidden">{t(MENU)}</span>
          </button>
        </div>
      </nav>
      <AnimatePresence>{open && <Drawer onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}
