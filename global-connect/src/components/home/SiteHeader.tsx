import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { List, MagnifyingGlass, X } from "@phosphor-icons/react";
import emblem from "@/assets/karnataka-emblem.png";
import { HELP_DESK, NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { HeritageHeader } from "@/components/heritage/HeritageHeader";
import { HorizonHeader } from "@/components/horizon/HorizonHeader";
import { useT, useTheme } from "@/theme/context";
import { ThemeSwitcher } from "./ThemeSwitcher";

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const { theme } = useTheme();
  if (theme === "heritage") return <HeritageHeader />;
  if (theme === "horizon") return <HorizonHeader />;
  return <GlobalHeader solid={solid} />;
}

function GlobalHeader({ solid }: { solid: boolean }) {
  const t = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filled = solid || scrolled || open;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        filled ? "bg-(color:--gc-navy)/92 shadow-[0_8px_30px_rgba(3,10,30,0.35)] backdrop-blur-md" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center gap-6 px-5 lg:px-8">
        <Link to="/global-connect" className="flex shrink-0 items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid size-12 place-items-center rounded-full bg-white shadow-md ring-2 ring-(color:--gc-gold-3)/70">
            <img src={emblem} alt="Government of Karnataka emblem" className="h-9 w-auto" />
          </span>
          <span className="leading-none text-white">
            <span className="block font-display text-[15px] font-semibold tracking-wide">{t("KARNATAKA")}</span>
            <span className="block font-display text-[15px] font-semibold tracking-wide">{t("GLOBAL CONNECT")}</span>
            <span className="mt-1 hidden text-[8.5px] font-medium tracking-[0.18em] text-white/65 sm:block">
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
                  "relative px-3 py-2 text-[13.5px] xl:px-2 2xl:px-3 font-medium text-white/80 transition-colors hover:text-white",
                  isActive && "text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  {t(n.label)}
                  {isActive ? (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-(color:--gc-accent) shadow-[0_0_10px_rgba(63,180,255,0.8)]"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 xl:ml-2">
          <button
            type="button"
            aria-label="Search"
            className="hidden size-10 place-items-center sm:grid rounded-full text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            <MagnifyingGlass size={20} />
          </button>
          <ThemeSwitcher />
          <Link
            to={HELP_DESK}
            className="hidden rounded-full border border-white/45 px-5 py-2 text-[13.5px] font-medium whitespace-nowrap text-white transition hover:border-white hover:bg-white/10 sm:inline-block"
          >
            NRI Help Desk
          </Link>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid size-10 place-items-center rounded-full text-white transition hover:bg-white/10 xl:hidden"
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
            className="overflow-hidden border-t border-white/10 xl:hidden"
          >
            <div className="flex flex-col px-5 py-3">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn("rounded-lg px-3 py-2.5 text-[15px] text-white/80 hover:bg-white/5", isActive && "text-white")
                  }
                >
                  {t(n.label)}
                </NavLink>
              ))}
              <Link
                to={HELP_DESK}
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full border border-white/45 px-5 py-2.5 text-center text-[14px] font-medium text-white"
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
