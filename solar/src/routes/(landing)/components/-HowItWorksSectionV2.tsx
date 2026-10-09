import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2, FileSearch, Flag, MapPin, Route, Send, UserPlus } from "lucide-react";
import SplitType from "split-type";
import { useLayoutEffect, useRef } from "react";
import heroSolar from "@/assets/hero-solar.jpg";
import heroWind from "@/assets/hero-wind.jpg";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { n: "01", title: "Register", desc: "IPP creates a verified profile", icon: UserPlus },
  { n: "02", title: "Apply", desc: "Submit project application", icon: Send },
  { n: "03", title: "Review", desc: "Officer validates documents", icon: FileSearch },
  { n: "04", title: "Approval", desc: "Senior authority approves", icon: CheckCircle2 },
  { n: "05", title: "Execution", desc: "Track milestones to closure", icon: Flag },
] as const;

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const cardsRef = useRef<HTMLOListElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const off = reduce === true;

  useLayoutEffect(() => {
    if (off || !sectionRef.current || !cardsRef.current) return;
    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      const split = headingRef.current ? new SplitType(headingRef.current, { types: "words" }) : null;
      if (split?.words?.length) {
        gsap.fromTo(
          split.words,
          { opacity: 0, yPercent: 85 },
          {
            opacity: 1,
            yPercent: 0,
            duration: 0.78,
            stagger: 0.045,
            ease: "power2.out",
            scrollTrigger: {
              trigger: headingRef.current,
              start: "top 80%",
            },
          },
        );
      }

      const cards = gsap.utils.toArray<HTMLElement>(".how-v2-card");
      cards.forEach((card, index) => {
        const dir = index % 2 === 0 ? -72 : 72;
        gsap.set(card, { opacity: 0.24, y: 56, x: dir, scale: 0.92, rotate: dir > 0 ? 1.8 : -1.8 });
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 74%",
          end: "bottom 24%",
          scrub: 1.25,
        },
      });

      cards.forEach((card, index) => {
        const dir = index % 2 === 0 ? -72 : 72;
        timeline.to(
          card,
          {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            rotate: 0,
            duration: 0.95,
            ease: "power2.out",
          },
          index * 0.96,
        );
        if (index !== cards.length - 1) {
          timeline.to(
            card,
            {
              opacity: 0.45,
              scale: 0.97,
              x: dir * 0.15,
              duration: 0.62,
              ease: "power1.out",
            },
            index * 0.96 + 0.54,
          );
        }
      });

      if (progressRef.current) {
        gsap.fromTo(
          progressRef.current,
          { scaleY: 0, transformOrigin: "top center" },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: cardsRef.current,
              start: "top 74%",
              end: "bottom 24%",
              scrub: 1.25,
            },
          },
        );
      }

      gsap.to(".how-v2-orb", {
        yPercent: (i) => (i % 2 === 0 ? -18 : 14),
        xPercent: (i) => (i % 2 === 0 ? 8 : -8),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.4,
        },
      });

      mm.add("(min-width: 1024px)", () => {
        ScrollTrigger.create({
          trigger: ".how-v2-stage",
          start: "top 120px",
          endTrigger: cardsRef.current,
          end: "bottom 72%",
          pin: true,
          pinSpacing: false,
        });
      });

      return () => split?.revert();
    }, sectionRef);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, [off]);

  return (
    <section
      ref={sectionRef}
      id="how"
      className="relative isolate overflow-hidden border-y border-primary/10 py-18 scroll-mt-[4.5rem] md:py-24"
      aria-labelledby="how-heading"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 [background:radial-gradient(ellipse_80%_55%_at_8%_18%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_58%),radial-gradient(ellipse_68%_48%_at_90%_26%,color-mix(in_oklch,var(--chart-2)_10%,transparent),transparent_56%)]" />
        <div className="how-v2-orb absolute -left-10 top-24 h-52 w-52 rounded-full bg-brand/20 blur-3xl" />
        <div className="how-v2-orb absolute -right-12 bottom-12 h-60 w-60 rounded-full bg-chart-3/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-gradient-to-r from-muted via-accent to-primary/5 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-foreground/95 shadow-md dark:border-primary/25 dark:from-primary/15 dark:via-primary/8 dark:to-primary/5 dark:text-foreground">
            <Route className="size-3.5 text-primary" aria-hidden />
            How it works
          </span>
          <h2
            ref={headingRef}
            id="how-heading"
            className="mt-4 text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-4xl"
          >
            A guided approval flow with
            {" "}
            <span className="bg-gradient-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">
              cinematic progress
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
            Scroll through each stage. The active card comes into focus while the timeline fills to show journey progress.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="how-v2-stage relative rounded-[1.8rem] border border-border/40 bg-card/50 p-3 shadow-lg ring-1 ring-border/20 backdrop-blur-2xl dark:border-border/15 dark:bg-card/40 dark:ring-border/10">
            <div className="relative overflow-hidden rounded-[1.3rem]">
              <img src={heroSolar} alt="Solar field" className="h-60 w-full object-cover md:h-72" loading="lazy" />
              <img src={heroWind} alt="Wind farm" className="absolute inset-0 h-full w-full object-cover opacity-45 mix-blend-screen" loading="lazy" />
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/55 via-background/20 to-transparent"
              />
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-border bg-background/50 px-4 py-3 text-xs font-semibold text-primary-foreground backdrop-blur-xl md:text-sm">
              Stage-by-stage governance route with policy-aligned checkpoints.
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute bottom-5 left-4 top-5 w-[3px] rounded-full bg-primary/15" aria-hidden />
            <div
              ref={progressRef}
              className="pointer-events-none absolute bottom-5 left-4 top-5 w-[3px] rounded-full bg-gradient-to-b from-primary via-primary to-chart-3"
              aria-hidden
            />
            <ol ref={cardsRef} className="m-0 flex list-none flex-col gap-6 p-0 pl-9">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                return (
                  <li key={step.n}>
                    <motion.article
                      whileHover={off ? undefined : { y: -6, scale: 1.015 }}
                      transition={{ type: "spring", stiffness: 210, damping: 22, mass: 0.82 }}
                      className="how-v2-card relative overflow-hidden rounded-2xl border border-border/35 bg-gradient-to-br from-card/90 via-card/70 to-primary/5 p-5 shadow-sm ring-1 ring-border/20 backdrop-blur-xl dark:border-border/15 dark:from-card/80 dark:via-card/70 dark:to-primary/10 dark:ring-primary/10"
                    >
                      <div className="absolute -left-[1.45rem] top-5 flex size-8 items-center justify-center rounded-full border border-primary/20 bg-background text-[11px] font-bold text-primary ring-1 ring-primary/15">
                        {index + 1}
                      </div>
                      <div className="pointer-events-none absolute -right-8 -top-12 size-36 rounded-full bg-gradient-to-br from-chart-3/20 to-primary/10 blur-2xl" />
                      <div className="relative flex items-start gap-3">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/[0.08] text-primary">
                          <Icon className="size-5" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary/80">{step.n}</p>
                          <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">{step.title}</h3>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary/85">
                            <MapPin className="size-3.5" aria-hidden />
                            Stage checkpoint
                          </p>
                        </div>
                      </div>
                    </motion.article>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
