import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { CaretDown, GlobeSimple, List, MagnifyingGlass, X } from "@phosphor-icons/react";
import emblem from "@/assets/karnataka-emblem.png";
import { ThemeSwitcher } from "@/components/home/ThemeSwitcher";
import { HELP_DESK, NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { useT } from "@/theme/context";

export function HeritageHeader() {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b bg-[#fffdf8]/95 backdrop-blur-md transition-shadow duration-300",
        scrolled || open ? "border-(color:--gc-line) shadow-[0_8px_28px_rgba(12,58,42,0.10)]" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-[76px] max-w-[1320px] items-center gap-3 px-4 sm:gap-5 sm:px-5 lg:px-8">
        <Link to="/global-connect" className="flex min-w-0 shrink items-center xl:shrink-0 gap-2.5 sm:gap-3" onClick={() => setOpen(false)}>
          <img src={emblem} alt="Government of Karnataka emblem" className="h-10 w-auto drop-shadow-sm sm:h-12" />
          <span className="leading-none">
            <span className="block text-[7.5px] font-bold tracking-[0.14em] sm:text-[8.5px] sm:tracking-[0.16em] text-(color:--gc-ink-2)">GOVERNMENT OF KARNATAKA</span>
            <span className="mt-1 block font-display text-[13px] font-bold whitespace-nowrap sm:text-[15px] sm:tracking-wide text-(color:--gc-ink)">
              {t("KARNATAKA")} {t("GLOBAL CONNECT")}
            </span>
            <span className="mt-1 hidden text-[8px] font-semibold tracking-[0.16em] text-(color:--gc-gold-4) sm:block">
              {t("PEOPLE • PARTNERSHIPS • OPPORTUNITIES")}
            </span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-0.5 xl:flex" aria-label="Main">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  "relative px-3 py-2 text-[13.5px] xl:px-2 2xl:px-3 font-medium text-(color:--gc-ink-2)/80 transition-colors hover:text-(color:--gc-ink)",
                  isActive && "font-semibold text-(color:--gc-ink)",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {t(n.label)}
                  {isActive ? (
                    <motion.span
                      layoutId="heritage-nav-active"
                      className="absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-(color:--gc-gold-3)"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 xl:ml-3">
          <button
            type="button"
            aria-label="Search"
            className="hidden size-10 place-items-center rounded-full text-(color:--gc-ink) transition hover:bg-(color:--gc-ink)/5 sm:grid"
          >
            <MagnifyingGlass size={19} />
          </button>
          <button
            type="button"
            aria-label="Language: English"
            className="hidden h-10 items-center gap-1 rounded-full px-2.5 text-[13px] font-semibold text-(color:--gc-ink) transition hover:bg-(color:--gc-ink)/5 sm:flex"
          >
            <GlobeSimple size={18} />
            EN
            <CaretDown size={11} weight="bold" />
          </button>
          <ThemeSwitcher light />
          <Link
            to={HELP_DESK}
            className="ml-1 hidden rounded-full bg-(color:--gc-navy) px-5 py-2.5 text-[13px] font-semibold whitespace-nowrap text-white shadow-[0_6px_18px_rgba(12,58,42,0.25)] transition hover:bg-(color:--gc-navy-2) sm:inline-block"
          >
            NRI Help Desk
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full text-(color:--gc-ink) transition hover:bg-(color:--gc-ink)/5 xl:hidden"
          >
            {open ? <X size={22} /> : <List size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            key="menu"
            aria-label="Mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-(color:--gc-line) xl:hidden"
          >
            <div className="flex flex-col px-5 py-3">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "rounded-lg px-3 py-2.5 text-[15px] text-(color:--gc-ink-2) hover:bg-(color:--gc-ink)/5",
                      isActive && "font-semibold text-(color:--gc-ink)",
                    )
                  }
                >
                  {t(n.label)}
                </NavLink>
              ))}
              <Link
                to={HELP_DESK}
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-(color:--gc-navy) px-5 py-2.5 text-center text-[14px] font-semibold text-white"
              >
                NRI Help Desk
              </Link>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
