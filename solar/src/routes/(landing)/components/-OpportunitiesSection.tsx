import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Briefcase, MapPin, Route, Search, Zap } from "lucide-react";
import { Fragment, useLayoutEffect, useRef } from "react";
import type { Opportunity } from "@/lib/types";
import { cn } from "@/lib/utils";
import { RenewableAmbientLayer } from "./-HeroBackdrop";
import { ScrollReveal, ScrollRevealItem, ScrollRevealStagger } from "./-ScrollReveal";
import { useBandParallaxMotion } from "./-useBandParallax";

gsap.registerPlugin(ScrollTrigger);

const ROUTE_WAYPOINTS = [
  { label: "Published", icon: Search },
  { label: "Compare", icon: Route },
  { label: "Login", icon: Briefcase },
  { label: "Apply", icon: Zap },
] as const;

function typeStripe(type: Opportunity["type"]) {
  if (type === "Solar") return "from-chart-3 via-chart-3/90 to-chart-3";
  if (type === "Wind") return "from-chart-2 via-primary/80 to-chart-2";
  return "from-chart-3 via-primary to-chart-2";
}

function ApplicationRouteStrip() {
  return (
    <div
      className="relative rounded-2xl border border-primary/10 bg-card/50 p-4 shadow-inner shadow-primary/[0.04] backdrop-blur-md dark:border-primary/15 dark:bg-card/40 md:p-5"
      aria-label="Typical application route"
    >
      <p className="text-center text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        Your route to an application
      </p>
      <ol className="mt-4 flex flex-col items-center gap-0 md:flex-row md:flex-wrap md:items-center md:justify-center">
        {ROUTE_WAYPOINTS.map((wp, i) => {
          const Icon = wp.icon;
          const isLast = i === ROUTE_WAYPOINTS.length - 1;
          return (
            <Fragment key={wp.label}>
              <li className="flex w-full max-w-sm items-center gap-3 md:w-auto md:max-w-none md:flex-col md:gap-2 md:px-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 text-primary shadow-sm ring-1 ring-primary/10 dark:border-primary/25 dark:from-card dark:to-primary/10">
                  <Icon className="size-4" aria-hidden />
                </div>
                <span className="text-sm font-semibold text-foreground md:text-center md:text-xs">{wp.label}</span>
              </li>
              {!isLast ? (
                <li
                  className="flex h-7 w-full max-w-sm items-center justify-center py-1 md:h-auto md:w-12 md:max-w-none md:shrink-0 md:py-0"
                  aria-hidden
                >
                  <div className="h-full w-0.5 rounded-full bg-gradient-to-b from-primary/55 via-primary/35 to-primary/15 md:h-0.5 md:w-full md:bg-gradient-to-r" />
                </li>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}

export function OpportunitiesSection({ opportunities }: { opportunities: Opportunity[] }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const px = useBandParallaxMotion(sectionRef);
  const reduce = useReducedMotion();
  const off = reduce === true;

  useLayoutEffect(() => {
    if (off || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".opportunity-card");
      cards.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 54, scale: 0.95, rotateX: 6 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.84,
            ease: "power2.out",
            delay: index * 0.06,
            scrollTrigger: {
              trigger: card,
              start: "top 84%",
            },
          },
        );
      });
      gsap.to(".opportunities-trail", {
        yPercent: -16,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.4,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [off]);

  return (
    <section
      ref={sectionRef}
      id="opportunities"
      className="relative isolate overflow-hidden border-y border-primary/10 py-20 md:py-28"
      aria-labelledby="opps-heading"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute inset-0"
          style={px.off ? undefined : { y: px.imgY, scale: px.imgScale }}
        >
          <RenewableAmbientLayer className="opacity-[0.13] max-md:opacity-[0.1] bg-[center_45%]" />
        </motion.div>
        <motion.div className="absolute inset-0" style={px.off ? undefined : { y: px.washY }}>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/[0.07] to-chart-3/5 dark:from-background/92 dark:via-primary/[0.12] dark:to-background/90" />
          <div
            className="absolute inset-0 bg-[size:40px_40px] opacity-40 [background-image:linear-gradient(color-mix(in_oklch,var(--border)_65%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklch,var(--border)_65%,transparent)_1px,transparent_1px)] dark:opacity-25"
          />
        </motion.div>
      </div>
      <motion.div
        className="opportunities-trail pointer-events-none absolute inset-0 z-[1] [background:radial-gradient(ellipse_80%_50%_at_10%_20%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_55%),radial-gradient(ellipse_70%_45%_at_92%_30%,color-mix(in_oklch,var(--chart-2)_10%,transparent),transparent_52%),radial-gradient(ellipse_55%_35%_at_50%_90%,color-mix(in_oklch,var(--chart-3)_8%,transparent),transparent_50%)] dark:[background:radial-gradient(ellipse_80%_50%_at_10%_20%,color-mix(in_oklch,var(--primary)_6%,transparent),transparent_55%),radial-gradient(ellipse_70%_45%_at_92%_30%,color-mix(in_oklch,var(--chart-2)_6%,transparent),transparent_52%)]"
        style={px.off ? undefined : { y: px.orbsY }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-0 top-1/4 size-96 translate-x-1/4 rounded-full bg-gradient-to-bl from-chart-2/12 to-transparent blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-10">
        <ScrollReveal>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <motion.div style={px.off ? undefined : { y: px.leadY }}>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-muted px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-foreground shadow-sm backdrop-blur-md dark:border-primary/30 dark:bg-primary/15 dark:text-foreground/95">
                  <Route className="size-3.5" aria-hidden />
                  Open opportunities
                </span>
                <h2
                  id="opps-heading"
                  className="mt-4 text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-foreground md:text-4xl"
                >
                  <span className="bg-gradient-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">
                    Active schemes
                  </span>{" "}
                  on the national map
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  Each listing is a waypoint — pick a cluster, attach documents, and track reviewer milestones in one
                  workspace.
                </p>
              </motion.div>
            </div>
            <motion.div className="shrink-0" style={px.off ? undefined : { y: px.trailY }}>
              <Link
                to="/login"
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-primary/20 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Zap className="size-4 text-primary-foreground/90" aria-hidden />
                Login to apply
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </motion.div>
          </div>
        </ScrollReveal>

        <motion.div className="mt-6" style={px.off ? undefined : { y: px.leadY }}>
          <ApplicationRouteStrip />
        </motion.div>

        <motion.div className="relative mt-12" style={px.off ? undefined : { y: px.trailY }}>
          <div
            className="pointer-events-none absolute left-[8%] right-[8%] top-1/2 hidden h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-chart-3/25 via-primary/15 to-chart-2/25 lg:block"
            aria-hidden
          />
          <ScrollRevealStagger className="relative z-[1] grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {opportunities.map((o, idx) => (
              <ScrollRevealItem key={o.id}>
                <motion.article
                  whileHover={reduce ? undefined : { y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 280, damping: 24, mass: 0.62 }}
                  className="opportunity-card group relative flex h-full flex-col overflow-hidden rounded-2xl border border-primary/12 bg-gradient-to-b from-card/95 via-card/80 to-primary/5 p-5 shadow-lg ring-1 ring-border/30 backdrop-blur-xl transition duration-500 hover:border-primary/22 hover:shadow-xl dark:from-card/85 dark:via-card/70 dark:to-primary/[0.08] dark:ring-primary/10"
                >
                  <div
                    className={cn(
                      "pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-95",
                      typeStripe(o.type),
                    )}
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-x-[-35%] bottom-[-55%] h-40 opacity-50 [background:radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_72%)] transition duration-500 group-hover:opacity-100"
                    aria-hidden
                  />
                  <div className="relative z-[1] flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary/[0.06] px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-primary">
                      <MapPin className="size-3 opacity-80 transition-transform duration-300 group-hover:rotate-12" aria-hidden />
                      Waypoint {idx + 1}
                    </span>
                    <span className="shrink-0 rounded-full bg-chart-4/15 px-2.5 py-0.5 text-[11px] font-bold text-chart-4 ring-1 ring-chart-4/20">
                      {o.status}
                    </span>
                  </div>
                  <div className="relative z-[1] mt-2 space-y-0.5">
                    <span className="block font-mono text-[11px] font-bold uppercase tracking-wider text-primary/80">
                      {o.code}
                    </span>
                    {o.referenceCode ? (
                      <span className="block font-mono text-[10px] font-semibold tracking-wide text-foreground/90">
                        {o.referenceCode}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="relative z-[1] mt-2 text-lg font-semibold leading-snug tracking-tight text-foreground">
                    {o.name}
                  </h3>
                  <p className="relative z-[1] mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0 text-chart-2" aria-hidden />
                    {o.state} · {o.district}
                  </p>
                  <div className="relative z-[1] mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-primary/10 pt-4">
                    <div>
                      <div className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                        Capacity
                      </div>
                      <div className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-foreground">
                        {o.capacityMW}
                        <span className="ml-1 text-sm font-semibold text-muted-foreground">MW</span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-bold",
                        o.type === "Solar" && "bg-chart-3/20 text-foreground dark:bg-chart-3/15 dark:text-foreground",
                        o.type === "Wind" && "bg-chart-2/20 text-foreground dark:bg-chart-2/15 dark:text-foreground",
                        o.type === "Hybrid" &&
                          "bg-primary/12 text-primary dark:bg-primary/25 dark:text-primary-foreground",
                      )}
                    >
                      {o.type}
                    </span>
                  </div>
                  <p className="relative z-[1] mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {o.description}
                  </p>
                  <Link
                    to="/login"
                    className="relative z-[1] mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:gap-2.5"
                  >
                    View details
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </motion.article>
              </ScrollRevealItem>
            ))}
          </ScrollRevealStagger>
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        aria-hidden
      />
    </section>
  );
}
