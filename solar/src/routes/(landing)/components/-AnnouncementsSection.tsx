import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Megaphone, Route } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { RenewableAmbientLayer } from "./-HeroBackdrop";
import { ScrollReveal, ScrollRevealItem, ScrollRevealStagger } from "./-ScrollReveal";
import { useBandParallaxMotion } from "./-useBandParallax";

gsap.registerPlugin(ScrollTrigger);

const NOTICES = [
  {
    d: "21 Apr 2026",
    dateTime: "2026-04-21",
    t: "New scheme: Karnataka Rooftop Solar Cluster — applications open",
    accent: "solar" as const,
    featured: true,
    detail:
      "Cluster applications are routed with the same SLA engine as standard rooftop projects — expect milestone checkpoints at intake, technical review, and sanction.",
  },
  {
    d: "18 Apr 2026",
    dateTime: "2026-04-18",
    t: "SLA policy updated: 5-day response window for officer queries",
    accent: "solar" as const,
    featured: false,
    detail: null as string | null,
  },
  {
    d: "10 Apr 2026",
    dateTime: "2026-04-10",
    t: "Annual report on renewable approvals published",
    accent: "wind" as const,
    featured: false,
    detail: null as string | null,
  },
] as const;

export function AnnouncementsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const px = useBandParallaxMotion(sectionRef);
  const reduce = useReducedMotion();
  const off = reduce === true;

  useLayoutEffect(() => {
    if (off || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      const notices = gsap.utils.toArray<HTMLElement>(".notice-card");
      notices.forEach((card, index) => {
        gsap.fromTo(
          card,
          { opacity: 0, x: 36, y: 34, scale: 0.97 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            duration: 0.82,
            ease: "power2.out",
            delay: index * 0.05,
            scrollTrigger: {
              trigger: card,
              start: "top 86%",
            },
          },
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [off]);

  return (
    <section
      ref={sectionRef}
      id="announcements"
      className="relative isolate overflow-hidden border-y border-primary/10 py-20 md:py-28"
      aria-labelledby="news-heading"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute inset-0"
          style={px.off ? undefined : { y: px.imgY, scale: px.imgScale }}
        >
          <RenewableAmbientLayer className="opacity-[0.09] max-md:opacity-[0.07] bg-[center_55%]" />
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-muted/80 via-primary/[0.06] to-chart-2/5 dark:from-background/92 dark:via-primary/[0.08] dark:to-background/95"
          style={px.off ? undefined : { y: px.washY }}
        />
        <div className="absolute inset-0 bg-[size:44px_44px] opacity-35 [background-image:linear-gradient(color-mix(in_oklch,var(--chart-3)_12%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklch,var(--chart-3)_12%,transparent)_1px,transparent_1px)] dark:opacity-20" />
      </div>
      <motion.div
        className="pointer-events-none absolute inset-0 z-[1] [background:radial-gradient(ellipse_75%_50%_at_20%_25%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_55%),radial-gradient(ellipse_65%_45%_at_85%_60%,color-mix(in_oklch,var(--chart-2)_10%,transparent),transparent_52%)] dark:[background:radial-gradient(ellipse_75%_50%_at_20%_25%,color-mix(in_oklch,var(--primary)_6%,transparent),transparent_55%),radial-gradient(ellipse_65%_45%_at_85%_60%,color-mix(in_oklch,var(--chart-2)_6%,transparent),transparent_52%)]"
        style={px.off ? undefined : { y: px.orbsY }}
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-10">
        <motion.div style={px.off ? undefined : { y: px.leadY }}>
          <ScrollReveal>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-gradient-to-r from-muted via-accent to-primary/5 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-foreground/95 shadow-md backdrop-blur-md dark:border-primary/25 dark:from-primary/20 dark:via-primary/8 dark:to-primary/10 dark:text-foreground">
                  <Route className="size-3.5 text-chart-2" aria-hidden />
                  Latest notices
                </span>
                <h2
                  id="news-heading"
                  className="mt-4 max-w-xl text-balance text-3xl font-semibold leading-[1.12] tracking-tight text-foreground md:text-4xl"
                >
                  <span className="bg-gradient-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">
                    Policy route
                  </span>{" "}
                  — updates along the timeline
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-right md:text-base">
                Follow notices like stops on a map: newest first, each tied to a date so teams can align before work
                hits the queue.
              </p>
            </div>
          </ScrollReveal>
        </motion.div>

        <motion.div className="relative mt-12 md:mt-14" style={px.off ? undefined : { y: px.trailY }}>
          <ScrollRevealStagger className="relative">
            <div
              className="pointer-events-none absolute bottom-4 left-[21px] top-4 w-0.5 rounded-full bg-gradient-to-b from-chart-3/70 via-primary/45 to-chart-2/55 md:left-[25px]"
              aria-hidden
            />

            <ul className="relative flex flex-col gap-6 md:gap-8">
              {NOTICES.map((n, i) => (
                <ScrollRevealItem key={n.dateTime}>
                  <li className="grid grid-cols-[auto_1fr] gap-4 md:gap-6">
                    <div className="flex flex-col items-center pt-1 md:pt-2">
                      <div
                        className={`relative z-[1] flex size-11 shrink-0 items-center justify-center rounded-full border-2 border-background shadow-lg ring-2 md:size-12 ${
                          n.featured
                            ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-primary/30"
                            : n.accent === "solar"
                              ? "bg-gradient-to-br from-muted to-card text-foreground ring-primary/30 dark:from-muted dark:to-card dark:text-foreground dark:ring-primary/25"
                              : "bg-gradient-to-br from-accent to-card text-foreground ring-primary/30/30 dark:from-accent dark:to-card dark:text-foreground dark:ring-primary/30/25"
                        }`}
                      >
                        {n.featured ? (
                          <Megaphone className="size-5" aria-hidden />
                        ) : (
                          <span className="text-xs font-bold tabular-nums">{i + 1}</span>
                        )}
                      </div>
                      {n.featured ? (
                        <span className="mt-2 hidden text-[0.6rem] font-bold uppercase tracking-wider text-primary md:block">
                          Latest
                        </span>
                      ) : null}
                    </div>

                    <motion.article
                      whileHover={reduce ? undefined : { y: -2 }}
                      transition={{ type: "spring", stiffness: 240, damping: 24, mass: 0.7 }}
                      className={`notice-card group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 shadow-lg ring-1 backdrop-blur-xl transition duration-300 md:p-6 ${
                        n.featured
                          ? "border-primary/20 from-white/95 via-white/85 to-primary/6 shadow-primary/10 ring-white/70 dark:border-primary/25 dark:from-card/90 dark:via-card/75 dark:to-primary/10 dark:ring-primary/10"
                          : "border-primary/12 from-white/88 to-white/70 shadow-primary/[0.06] ring-white/60 dark:border-primary/18 dark:from-card/70 dark:to-card/55 dark:ring-primary/10"
                      }`}
                    >
                      <div
                        className={`pointer-events-none absolute bottom-0 left-0 top-0 w-1 rounded-l-2xl bg-gradient-to-b opacity-80 ${
                          n.accent === "solar"
                            ? "from-chart-3 to-chart-3/70"
                            : "from-chart-2 to-primary/70"
                        }`}
                        aria-hidden
                      />
                      <div className="relative pl-1 md:pl-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <time
                            dateTime={n.dateTime}
                            className={`inline-flex rounded-lg border px-2.5 py-1 text-xs font-bold tracking-wide ${
                              n.featured
                                ? "border-primary/15 bg-primary/[0.08] text-primary"
                                : "border-primary/10 bg-primary/[0.05] text-muted-foreground"
                            }`}
                          >
                            {n.d}
                          </time>
                          {n.featured ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-primary-foreground shadow-md shadow-primary/20 md:hidden">
                              <span className="relative flex size-1.5">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary-foreground/45 opacity-75" />
                                <span className="relative inline-flex size-1.5 rounded-full bg-primary-foreground" />
                              </span>
                              New
                            </span>
                          ) : (
                            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-muted-foreground">
                              Earlier
                            </span>
                          )}
                        </div>
                        <p
                          className={`mt-3 font-semibold leading-snug tracking-tight text-foreground ${
                            n.featured ? "text-lg md:text-xl" : "text-sm md:text-[0.95rem]"
                          }`}
                        >
                          {n.t}
                        </p>
                        {n.detail ? (
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{n.detail}</p>
                        ) : null}
                      </div>
                      <div
                        className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-gradient-to-br from-chart-3/25 to-chart-2/15 blur-2xl transition duration-500 group-hover:opacity-100 md:size-56"
                        aria-hidden
                      />
                    </motion.article>
                  </li>
                </ScrollRevealItem>
              ))}
            </ul>
          </ScrollRevealStagger>
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] h-px bg-gradient-to-r from-transparent via-chart-3/60 to-transparent"
        aria-hidden
      />
    </section>
  );
}
