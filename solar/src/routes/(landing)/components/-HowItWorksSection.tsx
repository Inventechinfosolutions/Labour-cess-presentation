import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2, FileSearch, Flag, MapPin, Route, Send, UserPlus } from "lucide-react";
import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import SplitType from "split-type";
import { RenewableAmbientLayer } from "./-HeroBackdrop";
import { ScrollReveal } from "./-ScrollReveal";
import { useBandParallaxMotion } from "./-useBandParallax";

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { n: "01", title: "Register", desc: "IPP creates a verified profile", icon: UserPlus, mapLabel: "Start" },
  { n: "02", title: "Apply", desc: "Submit project application", icon: Send, mapLabel: "Intake" },
  { n: "03", title: "Review", desc: "Officer validates documents", icon: FileSearch, mapLabel: "Review" },
  { n: "04", title: "Approval", desc: "Senior authority approves", icon: CheckCircle2, mapLabel: "Decision" },
  { n: "05", title: "Execution", desc: "Track milestones to closure", icon: Flag, mapLabel: "Delivery" },
] as const;

/** Single vertical snake path (shared by glow, stroke-dash draw via pathLength, and moving dot) */
const JOURNEY_PATH_D =
  "M 50 16 C 78 120 18 200 50 220 C 82 260 20 360 50 400 C 78 460 16 520 50 580 C 82 640 18 700 50 780 C 78 840 22 900 50 960 C 58 1000 50 1020 50 1024";

const springConfig = { stiffness: 32, damping: 34, mass: 0.55 } as const;

function usePathLengthAndDot(
  pathRef: RefObject<SVGPathElement | null>,
  pathProgress: ReturnType<typeof useSpring>,
  reduce: boolean,
) {
  const [pathLen, setPathLen] = useState(0);
  const [dot, setDot] = useState({ x: 50, y: 16 });

  useLayoutEffect(() => {
    const el = pathRef.current;
    if (el) setPathLen(el.getTotalLength() || 0);
  }, [pathRef]);

  useMotionValueEvent(pathProgress, "change", (p) => {
    const el = pathRef.current;
    if (!el || pathLen <= 0) return;
    const t = reduce ? 1 : p;
    const pt = el.getPointAtLength(t * pathLen);
    setDot({ x: pt.x, y: pt.y });
  });

  return { dot };
}

type JourneyBlockProps = {
  leadY: ReturnType<typeof useBandParallaxMotion>["leadY"];
  bandOff: boolean;
};

function HowItWorksJourneyBlock({ leadY, bandOff }: JourneyBlockProps) {
  const journeyRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const reduce = useReducedMotion();
  const r = reduce === true;

  const { scrollYProgress } = useScroll({
    target: journeyRef,
    offset: ["start 0.78", "end 0.1"],
  });

  const progressTuned = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const progressIn = useTransform(progressTuned, (v) => (r ? 1 : v));
  const pathDraw = useSpring(progressIn, springConfig);

  const { dot } = usePathLengthAndDot(pathRef, pathDraw, r);

  return (
    <div
      className="relative w-full min-h-[min(280vh,3600px)]"
      ref={journeyRef}
    >
      <JourneyOrbsInTrack journeyRef={journeyRef} bandOff={bandOff} />

      <motion.svg
        className="absolute inset-0 z-0 w-full h-full [overflow:visible]"
        viewBox="0 0 100 1040"
        fill="none"
        preserveAspectRatio="xMidYMin meet"
        aria-hidden
        style={bandOff ? undefined : { y: leadY }}
      >
        <defs>
          <filter id="howJourneyGlow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="howJourneyLine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "var(--primary)", stopOpacity: 0.4 }} />
            <stop offset="50%" style={{ stopColor: "var(--primary)", stopOpacity: 0.5 }} />
            <stop offset="100%" style={{ stopColor: "var(--accent)", stopOpacity: 0.4 }} />
          </linearGradient>
        </defs>

        {/* Track (full) — like unfilled map route */}
        <path
          d={JOURNEY_PATH_D}
          className="stroke-primary/10 dark:stroke-primary/25"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Wider trail glow, drawn in sync (same pathLength) */}
        <motion.path
          d={JOURNEY_PATH_D}
          className="stroke-accent/35 dark:stroke-accent/30"
          strokeWidth="5.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            pathLength: r ? 1 : pathDraw,
            pathOffset: 0,
            opacity: 0.4,
            filter: "url(#howJourneyGlow)",
          }}
        />

        {/* Primary line — pathLength 0..1 = stroke draw (see stroke-dash equivalent) */}
        <motion.path
          ref={pathRef}
          d={JOURNEY_PATH_D}
          stroke="url(#howJourneyLine)"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="[filter:drop-shadow(0_0_5px_var(--primary))]"
          style={{
            pathLength: r ? 1 : pathDraw,
            pathOffset: 0,
            vectorEffect: "non-scaling-stroke",
          }}
        />

        <circle
          r={r ? 0 : 2.6}
          className="fill-accent stroke-2 stroke-background dark:fill-accent"
          style={{ filter: "drop-shadow(0 0 5px color-mix(in oklch, var(--accent) 50%, transparent))" }}
          cx={dot.x}
          cy={dot.y}
        />
        {!r ? <circle r={1.2} className="fill-primary-foreground" cx={dot.x} cy={dot.y} /> : null}
      </motion.svg>

      <ol className="relative z-[2] m-0 flex list-none flex-col gap-0 p-0">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isLeft = i % 2 === 0;
          return <JourneyStepRow key={step.n} step={step} Icon={Icon} isLeft={isLeft} index={i} />;
        })}
      </ol>
    </div>
  );
}

function JourneyOrbsInTrack({
  journeyRef,
  bandOff,
}: {
  journeyRef: RefObject<HTMLDivElement | null>;
  bandOff: boolean;
}) {
  const { scrollYProgress } = useScroll({ target: journeyRef, offset: ["start 0.85", "end 0.12"] });
  const p = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y1 = useSpring(useTransform(p, [0, 1], [0, bandOff ? 0 : -36]), { ...springConfig, stiffness: 26, damping: 32 });
  const y2 = useSpring(useTransform(p, [0, 1], [0, bandOff ? 0 : 28]), { ...springConfig, stiffness: 22, damping: 30 });

  if (bandOff) return null;
  return (
    <>
      <motion.div
        className="pointer-events-none absolute left-1/4 top-[12%] z-0 h-40 w-40 rounded-full bg-brand/15 blur-3xl dark:bg-brand/12"
        style={{ y: y1 }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute right-1/5 top-[45%] z-0 h-48 w-48 rounded-full bg-chart-3/8 blur-3xl dark:bg-chart-3/10"
        style={{ y: y2 }}
        aria-hidden
      />
    </>
  );
}

function JourneyStepRow({
  step,
  Icon,
  isLeft,
  index,
}: {
  step: (typeof STEPS)[number];
  Icon: (typeof STEPS)[number]["icon"];
  isLeft: boolean;
  index: number;
}) {
  const rowRef = useRef<HTMLLIElement | null>(null);
  return (
    <li
      ref={rowRef}
      className="relative grid min-h-[12.5rem] grid-cols-1 items-center py-3 md:min-h-[15rem] md:grid-cols-[1fr_4.5rem_1fr] md:py-0 lg:min-h-[16rem]"
    >
      {index > 0 ? (
        <div className="mx-auto my-2 flex w-full max-w-sm items-center gap-2 md:col-span-3 md:my-0 md:hidden" aria-hidden>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30" />
          <span className="shrink-0 text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground">
            Step {index + 1}
          </span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30" />
        </div>
      ) : null}

      <div
        className={
          isLeft
            ? "z-[1] w-full min-w-0 md:col-start-1 md:row-start-1 md:max-w-md md:justify-self-end md:pr-1"
            : "z-[1] w-full min-w-0 md:col-start-3 md:row-start-1 md:max-w-md md:justify-self-start md:pl-1"
        }
      >
        <motion.article
          className="how-step-card group relative overflow-hidden rounded-2xl border border-border/20 bg-gradient-to-br from-card/50 via-card/30 to-primary/[0.04] p-5 shadow-xl ring-1 ring-border/15 backdrop-blur-2xl dark:border-border/20 dark:from-card/8 dark:via-card/20 dark:to-primary/12 dark:ring-border/10 md:p-6"
          data-step-side={isLeft ? "left" : "right"}
        >
          <div
            className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-chart-3/20 via-transparent to-primary/10 opacity-80"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 [background:radial-gradient(85%_55%_at_0%_0%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_58%)]"
            aria-hidden
          />
          <div className="relative flex items-start gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border/30 bg-card/50 text-primary shadow-[inset_0_1px_0_0_var(--border)] backdrop-blur dark:border-border/20 dark:bg-card/15">
              <Icon className="size-5" aria-hidden />
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-primary/85 dark:text-primary/75">
                <MapPin className="size-3 shrink-0" aria-hidden />
                {step.mapLabel}
              </span>
              <div className="mt-0.5 bg-gradient-to-r from-foreground to-primary bg-clip-text text-2xl font-bold tracking-tight text-transparent md:text-3xl">
                {step.n}
              </div>
              <h3 className="mt-1 text-lg font-semibold tracking-tight text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </div>
          </div>
        </motion.article>
      </div>
    </li>
  );
}

export function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const splitHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const px = useBandParallaxMotion(sectionRef);
  const reduce = useReducedMotion();
  const r = reduce === true;

  useLayoutEffect(() => {
    if (r || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      const splitTarget = splitHeadingRef.current;
      const split = splitTarget ? new SplitType(splitTarget, { types: "lines,words" }) : null;
      if (split?.words?.length) {
        gsap.fromTo(
          split.words,
          { opacity: 0, yPercent: 110 },
          {
            opacity: 1,
            yPercent: 0,
            duration: 0.75,
            stagger: 0.045,
            ease: "power3.out",
            scrollTrigger: {
              trigger: splitTarget,
              start: "top 78%",
            },
          },
        );
      }

      const stepCards = gsap.utils.toArray<HTMLElement>(".how-step-card");
      stepCards.forEach((card) => {
        const side = card.dataset.stepSide === "left" ? -38 : 38;
        gsap.set(card, { opacity: 0.28, scale: 0.93, filter: "blur(1.5px)", x: side, y: 18 });
      });
      const sequence = gsap.timeline({
        scrollTrigger: {
          trigger: ".how-journey-sequence",
          start: "top 74%",
          end: "bottom 26%",
          scrub: 1.25,
        },
      });
      stepCards.forEach((card, index) => {
        const side = card.dataset.stepSide === "left" ? -38 : 38;
        sequence.to(
          card,
          {
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power2.out",
          },
          index * 0.95,
        );
        if (index !== stepCards.length - 1) {
          sequence.to(
            card,
            {
              opacity: 0.45,
              scale: 0.96,
              x: side * 0.2,
              filter: "blur(0.6px)",
              duration: 0.6,
              ease: "power1.out",
            },
            index * 0.95 + 0.5,
          );
        }
      });

      gsap.to(".how-trail-orb", {
        yPercent: (i) => (i % 2 === 0 ? -24 : 18),
        xPercent: (i) => (i % 2 === 0 ? 8 : -8),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.3,
        },
      });

      return () => split?.revert();
    }, sectionRef);
    return () => ctx.revert();
  }, [r]);

  return (
    <section
      ref={sectionRef}
      id="how"
      className="relative isolate overflow-hidden border-y border-primary/10 scroll-mt-[4.5rem] py-16 md:py-24"
      aria-labelledby="how-heading"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute inset-0"
          style={px.off ? undefined : { y: px.imgY, scale: px.imgScale }}
        >
          <RenewableAmbientLayer variant="solar" className="opacity-90" />
        </motion.div>
        <motion.div className="absolute inset-0" style={px.off ? undefined : { y: px.washY }}>
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-muted/20 to-primary/5 dark:from-background/98 dark:via-card/20 dark:to-background/95" />
          <div className="absolute inset-0 bg-[size:40px_40px] opacity-50 [background-image:linear-gradient(color-mix(in_oklch,var(--border)_65%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklch,var(--border)_65%,transparent)_1px,transparent_1px)] dark:opacity-35" />
        </motion.div>
        <motion.div
          className="how-trail-orb pointer-events-none absolute inset-0 z-[1] [background:radial-gradient(ellipse_80%_55%_at_8%_22%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_60%),radial-gradient(ellipse_70%_50%_at_90%_28%,color-mix(in_oklch,var(--chart-2)_10%,transparent),transparent_55%)] dark:opacity-90"
          style={px.off ? undefined : { y: px.orbsY }}
          aria-hidden
        />
        <div className="how-trail-orb pointer-events-none absolute -left-8 top-28 z-[1] h-44 w-44 rounded-full bg-brand/12 blur-3xl" />
        <div className="how-trail-orb pointer-events-none absolute -right-4 bottom-20 z-[1] h-52 w-52 rounded-full bg-chart-3/12 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-10">
        <motion.div style={px.off ? undefined : { y: px.leadY }}>
          <ScrollReveal className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-gradient-to-r from-muted via-accent to-primary/5 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-foreground/95 shadow-md dark:border-primary/30 dark:from-primary/20 dark:via-primary/8 dark:to-primary/5 dark:text-foreground">
              <Route className="size-3.5 text-primary" aria-hidden />
              How it works
            </span>
            <h2
              ref={splitHeadingRef}
              id="how-heading"
              className="mt-4 text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-foreground md:text-4xl"
            >
              <span className="bg-gradient-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">
                Journey map
              </span>{" "}
              from registration to commissioning
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-base">
              Follow the route through PMIS — each stop emits SLA events and dashboard signals so teams see delays
              early and keep approvals defensible. Scroll the path to see it draw.
            </p>
          </ScrollReveal>
        </motion.div>

        <motion.div className="how-journey-sequence mt-10 md:mt-14" style={px.off ? undefined : { y: px.trailY }}>
          <HowItWorksJourneyBlock leadY={px.leadY} bandOff={px.off || r} />
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent dark:via-primary/30"
        aria-hidden
      />
    </section>
  );
}
