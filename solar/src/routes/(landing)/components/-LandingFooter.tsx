import { Link } from "@tanstack/react-router";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, ChevronRight, Shield } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { FloatingSolarWindIcons } from "./-FloatingSolarWindIcons";
import { LoginHarvestCanvas } from "./-LoginHarvestCanvas";
import { ScrollReveal } from "./-ScrollReveal";

gsap.registerPlugin(ScrollTrigger);

const FOOTER_LINKS = [
  { href: "#", label: "Privacy" },
  { href: "#", label: "Terms" },
  { href: "#", label: "Help" },
] as const;

export function LandingFooter() {
  const footerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!footerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".footer-reveal",
        { opacity: 0, y: 34 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 84%",
          },
        },
      );
    }, footerRef);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="relative overflow-hidden border-t border-primary/10 bg-background py-14 md:py-20 dark:bg-gradient-to-br dark:from-background dark:via-primary/[0.06] dark:to-primary/[0.12]"
    >
      {/* Login page background stack: harvest canvas + vignette + floating icons */}
      <div className="pointer-events-none absolute inset-0 z-0 min-h-full" aria-hidden>
        <LoginHarvestCanvas fit="container" variant="green" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] [background:radial-gradient(ellipse_70%_50%_at_85%_100%,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_60%),radial-gradient(ellipse_80%_60%_at_0%_0%,color-mix(in_srgb,var(--primary)_6%,transparent),transparent_55%)]"
      />
      <FloatingSolarWindIcons className="z-[2] opacity-[0.5] dark:opacity-[0.3]" />

      {/* Soft white veil over the animated bg — improves contrast for glass content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-b from-white/25 via-white/18 to-white/12 dark:from-white/[0.07] dark:via-white/[0.05] dark:to-white/[0.04]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[100vw] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <ScrollReveal>
          {/* Frosted panel — matches harvest canvas: airy glass, no heavy “card slab”. */}
          <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/[0.09] bg-gradient-to-b from-background/[0.52] via-background/[0.28] to-primary/[0.04] shadow-[0_24px_80px_-32px_color-mix(in_oklch,var(--foreground)_18%,transparent)] backdrop-blur-xl dark:border-white/[0.07] dark:from-background/[0.38] dark:via-background/[0.14] dark:to-primary/[0.06] dark:shadow-[0_28px_90px_-36px_rgba(0,0,0,0.45)]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_6%,transparent)_0%,transparent_42%,color-mix(in_srgb,var(--primary)_4%,transparent)_100%)] opacity-90 dark:opacity-100"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"
            />
            <div className="relative grid gap-10 p-8 md:grid-cols-12 md:gap-0 md:divide-x md:divide-border/20 md:p-10 dark:md:divide-white/[0.08] lg:p-12">
              <div className="footer-reveal md:col-span-5 md:pr-10 lg:pr-12">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/45 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-foreground/90 backdrop-blur-sm dark:border-primary/15 dark:bg-background/25 dark:text-foreground/90">
                  <Shield className="size-3.5 text-primary/80" aria-hidden />
                  Renewable energy portal
                </span>
                <p className="mt-5 text-pretty text-base font-medium leading-relaxed text-foreground/92 md:text-[1.05rem]">
                  PMIS — transparent digital workflow for solar and wind project approvals, SLA tracking, and milestone
                  governance.
                </p>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground/95">
                  Built for public-sector rigor: every transition is traceable, and dashboards keep leadership aligned
                  with ground truth.
                </p>
              </div>

              <div className="footer-reveal flex flex-col justify-between gap-8 md:col-span-4 md:px-10 lg:px-12">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground/90">Resources</h3>
                  <ul className="mt-4 space-y-1">
                    {FOOTER_LINKS.map((item) => (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground/85 transition hover:bg-primary/[0.08] hover:text-primary dark:hover:bg-primary/[0.12]"
                        >
                          <span className="relative flex items-center gap-2">
                            <ChevronRight
                              className="size-4 text-primary/45 transition group-hover:translate-x-0.5 group-hover:text-primary"
                              aria-hidden
                            />
                            {item.label}
                            <span className="absolute -bottom-0.5 left-6 h-px w-0 bg-primary/60 transition-all duration-300 group-hover:w-[calc(100%-1.5rem)]" />
                          </span>
                          <ArrowUpRight className="size-4 shrink-0 opacity-0 transition group-hover:opacity-100" aria-hidden />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="footer-reveal flex flex-col justify-end md:col-span-3 md:pl-0">
                <div className="rounded-2xl border border-primary/12 bg-background/35 p-5 backdrop-blur-md dark:border-white/[0.08] dark:bg-background/20">
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground/90">Staff access</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground/95">
                    Officers, approvers, and admins sign in with institutional credentials.
                  </p>
                  <Link
                    to="/login"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:shadow-primary/30"
                  >
                    Staff login
                    <ArrowUpRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-primary/[0.08] pt-8 text-sm md:flex-row md:items-center md:justify-between dark:border-white/[0.06]">
            <p className="font-medium text-muted-foreground">© 2026 PMIS · Renewable Project Management System</p>
            <Link
              to="/"
              className="text-sm font-semibold text-primary underline-offset-4 transition hover:underline md:order-first"
            >
              Back to home
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </footer>
  );
}
