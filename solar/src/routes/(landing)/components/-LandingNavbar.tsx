import { Link } from "@tanstack/react-router";
import { Menu, Search, Sun, UserRound, X } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";

const NAV = [
  { href: "#about", label: "About" },
  { href: "#opportunities", label: "Opportunities" },
  { href: "#how", label: "How it works" },
  { href: "#announcements", label: "Notices" },
] as const;

const linkClass =
  "landing-navbar__link whitespace-nowrap text-[0.7rem] font-normal tracking-[-0.01em] transition-[opacity,color] duration-200 sm:text-xs";

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 18);
  });

  return (
    <header
      className={`landing-navbar fixed left-0 right-0 top-0 z-50 h-11 transition-all duration-500 [transform:translateZ(0)] ${
        scrolled
          ? "landing-navbar--scrolled border-b border-border/50 bg-background/80 shadow-[0_1px_0_0_var(--border),inset_0_1px_0_0_color-mix(in_oklch,var(--muted)_85%,transparent)] backdrop-blur-2xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent backdrop-blur-0"
      }`}
      style={{ WebkitBackdropFilter: "saturate(1.1) blur(20px)" }}
    >
      <div className="mx-auto flex h-full w-full max-w-5xl items-stretch px-3 sm:px-5 md:px-6 lg:max-w-6xl">
        <div className="flex min-w-0 flex-1 items-center justify-start">
          <Link
            to="/"
            className="group flex min-w-0 items-center gap-1.5 opacity-90 transition-opacity hover:opacity-100"
            onClick={() => setOpen(false)}
            aria-label="PMIS home"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-b from-chart-3 to-primary text-primary-foreground shadow-sm shadow-primary/25 ring-1 ring-primary-foreground/20">
              <Sun className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="landing-navbar__brand-text hidden truncate text-xs font-medium tracking-[-0.02em] sm:inline sm:text-[0.8rem]">
              PMIS
            </span>
          </Link>
        </div>

        <nav
          className="hidden items-center justify-center gap-6 text-center md:static md:flex md:gap-7 md:px-1 lg:gap-9"
          aria-label="Primary"
        >
          {NAV.map((item) => (
            <motion.a
              key={item.href}
              href={item.href}
              className={`${linkClass} group relative inline-flex items-center`}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 190, damping: 22, mass: 0.85 }}
            >
              {item.label}
              <span className="landing-navbar__link-underline absolute -bottom-[0.34rem] left-0 h-px w-0 transition-all duration-300 group-hover:w-full" />
            </motion.a>
          ))}
        </nav>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 pr-0.5 sm:gap-3 sm:pr-0">
          <a
            href="#opportunities"
            className="landing-navbar__icon-link hidden p-1.5 transition-[opacity,transform] sm:inline-flex"
            aria-label="Search opportunities"
          >
            <Search className="h-4 w-4" strokeWidth={1.5} />
          </a>
          <Link
            to="/login"
            className="landing-navbar__icon-link hidden p-1.5 transition sm:inline-flex"
            aria-label="Sign in"
          >
            <UserRound className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <Link
            to="/register"
            className="landing-navbar__register hidden text-[0.7rem] font-medium transition sm:inline-flex"
          >
            Register
          </Link>
          <button
            type="button"
            className="landing-navbar__menu-btn inline-flex h-8 w-8 items-center justify-center rounded-md transition md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav-apple"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" strokeWidth={1.5} /> : <Menu className="h-4 w-4" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav-apple"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="landing-navbar__sheet overflow-hidden border-t border-border/50 bg-background/75 backdrop-blur-2xl md:hidden"
          >
            <nav className="flex flex-col px-4 py-2 pb-4" aria-label="Mobile">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="landing-navbar__mobile-link border-b border-border/50/40 py-2.5 text-sm font-normal transition first:pt-1 last:border-b-0"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-border/50/60 pt-3">
                <a
                  href="#opportunities"
                  className="landing-navbar__mobile-link flex items-center gap-2 text-sm"
                  onClick={() => setOpen(false)}
                >
                  <Search className="h-4 w-4" />
                  Find schemes
                </a>
                <div className="flex gap-3 text-sm">
                  <Link to="/login" className="landing-navbar__mobile-link text-sm" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                  <Link to="/register" className="landing-navbar__mobile-register text-sm" onClick={() => setOpen(false)}>
                    Register
                  </Link>
                </div>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
