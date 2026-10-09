import { motion, useReducedMotion, useTransform, type MotionValue } from "framer-motion";
import gsap from "gsap";
import { Building2, Clock, FileCheck, Layers, ShieldCheck, Sun } from "lucide-react";
import SplitType from "split-type";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import heroSolar from "@/assets/hero-solar.jpg";
import heroWind from "@/assets/hero-wind.jpg";
import { RenewableAmbientLayer } from "./-HeroBackdrop";
import { useAboutBlockParallax } from "./-useAboutBlockParallax";
import { useBandParallaxMotion } from "./-useBandParallax";

const easeInOut: [number, number, number, number] = [0.32, 0.72, 0, 1];
const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

const BLOCKS: readonly {
  id: string;
  kicker: string;
  title: string;
  body: string;
  cardTitle: string;
  cardLine: string;
  icon: typeof FileCheck;
  cardAccent: "solar" | "wind";
}[] = [
  {
    id: "audit",
    kicker: "Traceability",
    title: "Transparent, auditable workflows",
    body: "Every submission, review, and approval is time-stamped and visible to authorized stakeholders — reducing ambiguity and building trust across IPPs, departments, and authorities.",
    cardTitle: "Full audit chain",
    cardLine: "Immutable event log tied to each project ID.",
    icon: FileCheck,
    cardAccent: "solar",
  },
  {
    id: "live",
    kicker: "Operations",
    title: "Live visibility from intake to execution",
    body: "Milestone gates, officer queues, and status transitions surface in one place. Teams spend less time chasing status and more time on decisions that keep projects on schedule.",
    cardTitle: "Status in real time",
    cardLine: "Milestone cards update as the workflow advances.",
    icon: Clock,
    cardAccent: "wind",
  },
  {
    id: "sla",
    kicker: "Governance",
    title: "SLA policy that holds under pressure",
    body: "Timers and escalations are aligned to published policy so delays are visible early, documented clearly, and acted on with consistent rules — not ad hoc follow-up.",
    cardTitle: "SLA you can enforce",
    cardLine: "Breaches and escalations tracked against policy baselines.",
    icon: ShieldCheck,
    cardAccent: "wind",
  },
  {
    id: "docs",
    kicker: "Documents",
    title: "Structured, versioned submissions",
    body: "Uploads, clarifications, and re-submissions stay organized with structured checks. Officers review the right file, at the right version, in the right context — every time.",
    cardTitle: "Version-controlled files",
    cardLine: "Structured metadata for verification and audit.",
    icon: Sun,
    cardAccent: "solar",
  },
] as const;

function GlassCard({
  children,
  className,
  accent,
  style,
}: {
  children: ReactNode;
  className?: string;
  accent: "solar" | "wind";
  style?: React.CSSProperties;
}) {
  const sheen =
    accent === "solar"
      ? "from-chart-3/20 via-primary/5 to-chart-2/10"
      : "from-chart-2/12 via-primary/5 to-chart-3/10";
  const hot =
    accent === "solar"
      ? "bg-gradient-to-br from-chart-3/25 to-primary/0"
      : "bg-gradient-to-br from-chart-2/25 to-primary/0";
  return (
    <motion.div
      className={className}
      style={{ ...style, boxShadow: "var(--shadow-lg)" }}
    >
      <div
        className={`pointer-events-none absolute inset-0 rounded-[1.35rem] bg-gradient-to-br ${sheen} opacity-90`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -right-20 -top-24 size-64 rounded-full ${hot} blur-3xl`}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 rounded-[1.35rem] ring-1 ring-inset ring-border/40 dark:ring-border/20"
        aria-hidden
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

function AboutBlockRow({
  index,
  kicker,
  title,
  body,
  cardTitle,
  cardLine,
  icon: Icon,
  cardAccent,
}: (typeof BLOCKS)[number] & { index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduce = useReducedMotion();
  const r = reduce === true;

  const cardOnLeft = index % 2 === 0;
  const parallax = useAboutBlockParallax(ref, { invert: !cardOnLeft });

  const cardEnter = {
    x: r ? 0 : cardOnLeft ? -42 : 42,
    opacity: r ? 1 : 0,
    filter: r ? "none" : "blur(6px)",
  } as const;
  const textEnter = {
    x: r ? 0 : cardOnLeft ? 36 : -36,
    opacity: r ? 1 : 0,
  } as const;

  return (
    <div
      ref={ref}
      className="relative grid grid-cols-1 items-center gap-10 md:gap-14 lg:grid-cols-2 lg:gap-16"
    >
      <motion.div
        data-about-row={index}
        className={cardOnLeft ? "order-1" : "order-1 md:order-2"}
        style={
          parallax.off
            ? undefined
            : {
                y: parallax.cardY,
                scale: parallax.cardScale,
              }
        }
        initial={cardEnter}
        whileInView={r ? undefined : { x: 0, opacity: 1, filter: "blur(0px)" }}
        viewport={{ once: true, amount: 0.28, margin: "0px 0px -8% 0px" }}
        transition={{
          duration: 0.95,
          ease: easeOut,
          filter: { duration: 0.7 },
        }}
      >
        <GlassCard
          accent={cardAccent}
          className="about-card-slide relative overflow-hidden rounded-[1.35rem] border border-border/45 bg-gradient-to-br from-card/55 via-card/35 to-primary/5 p-7 shadow-2xl backdrop-blur-2xl dark:border-border/25 dark:from-card/20 dark:via-card/10 dark:to-primary/10 md:p-8"
        >
          <div className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl border border-border/50 bg-card/50 shadow-inner shadow-primary/5 backdrop-blur dark:border-border/20 dark:bg-card/25">
            <Icon
              className={cardAccent === "solar" ? "size-6 text-primary" : "size-6 text-primary"}
              aria-hidden
            />
          </div>
          <h3 className="text-lg font-semibold leading-snug tracking-tight text-foreground md:text-xl">{cardTitle}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]">{cardLine}</p>
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/50 to-transparent dark:via-primary/20"
            aria-hidden
          />
        </GlassCard>
      </motion.div>

      <motion.div
        className={cardOnLeft ? "order-2" : "order-2 md:order-1"}
        initial={textEnter}
        whileInView={r ? undefined : { x: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.28, margin: "0px 0px -8% 0px" }}
        transition={{ duration: 0.88, ease: easeInOut, delay: r ? 0 : 0.06 }}
      >
        <TextColumn y={parallax.textY} yMicro={parallax.textYMicro} off={parallax.off} kicker={kicker} title={title} body={body} />
      </motion.div>
    </div>
  );
}

function TextColumn({
  kicker,
  title,
  body,
  y,
  yMicro,
  off,
}: {
  kicker: string;
  title: string;
  body: string;
  y: MotionValue<number>;
  yMicro: MotionValue<number>;
  off: boolean;
}) {
  const yCombined = useTransform([y, yMicro], (input) => {
    const [a, b] = input as [number, number];
    return a + b;
  });
  return (
    <motion.div style={off ? undefined : { y: yCombined }}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">{kicker}</p>
      <h3 className="mt-2 text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl md:leading-[1.15]">
        {title}
      </h3>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-[1.05rem]">{body}</p>
    </motion.div>
  );
}

export function AboutSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const splitHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
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
          { opacity: 0, yPercent: 120, rotateZ: 2 },
          {
            opacity: 1,
            yPercent: 0,
            rotateZ: 0,
            duration: 0.72,
            stagger: 0.045,
            ease: "power3.out",
            scrollTrigger: {
              trigger: splitTarget,
              start: "top 76%",
            },
          },
        );
      }

      const cards = gsap.utils.toArray<HTMLElement>(".about-card-slide");
      cards.forEach((card, index) => {
        const rowDir = card.closest("[data-about-row]")?.getAttribute("data-about-row");
        const onLeft = Number(rowDir) % 2 === 0;
        gsap.fromTo(
          card,
          { opacity: 0, x: onLeft ? -72 : 72, y: 36, rotate: onLeft ? -1.2 : 1.2 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            rotate: 0,
            duration: 0.74,
            ease: "power3.out",
            delay: index * 0.03,
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
            },
          },
        );
      });

      if (stripRef.current) {
        const visuals = stripRef.current.querySelectorAll(".about-visual-card");
        gsap.to(visuals, {
          yPercent: (i) => (i % 2 === 0 ? -14 : 10),
          rotate: (i) => (i % 2 === 0 ? -1.8 : 1.8),
          ease: "none",
          scrollTrigger: {
            trigger: stripRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }

      return () => split?.revert();
    }, sectionRef);

    return () => ctx.revert();
  }, [r]);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative isolate overflow-hidden border-b border-primary/10 py-24 md:py-32"
      aria-labelledby="about-heading"
    >
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute inset-0"
          style={px.off ? undefined : { y: px.imgY, scale: px.imgScale }}
        >
          <RenewableAmbientLayer className="bg-[center_32%] opacity-[0.075] saturate-[0.8] max-md:opacity-[0.065]" />
        </motion.div>
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-muted/95 via-background to-muted/80 dark:from-background dark:via-muted/40 dark:to-background"
          style={px.off ? undefined : { y: px.washY }}
        />
        <motion.div
          className="pointer-events-none absolute -left-[20%] top-[-20%] z-[1] h-[60%] w-[70%] max-md:h-[50%]"
          style={px.off ? undefined : { y: px.orbsY }}
          aria-hidden
        >
          <div
            className="h-full w-full opacity-85 [background:radial-gradient(ellipse_95%_75%_at_12%_0%,color-mix(in_oklch,var(--chart-4)_10%,transparent),transparent_62%),radial-gradient(ellipse_70%_60%_at_88%_32%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_58%)]"
          />
        </motion.div>
      </div>
      <div
        className="pointer-events-none absolute -right-20 top-1/4 z-[1] size-80 rounded-full bg-gradient-to-br from-primary/9 to-transparent blur-3xl dark:from-primary/12 dark:to-primary/[0.02]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-10">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          style={px.off ? undefined : { y: px.leadY }}
        >
          <motion.div
            initial={r ? undefined : { opacity: 0, y: 20 }}
            whileInView={r ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.45 }}
            transition={{ duration: 0.7, ease: easeOut }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-gradient-to-r from-muted via-accent to-primary/5 px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-foreground/90 shadow-md dark:border-primary/30 dark:from-card/50 dark:via-card/30 dark:to-primary/5 dark:text-foreground/95">
              <Building2 className="size-3.5 text-primary" aria-hidden />
              About the system
            </span>
            <h2
              ref={splitHeadingRef}
              id="about-heading"
              className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight md:text-4xl lg:text-[2.5rem] lg:leading-[1.12]"
            >
              <span className="bg-gradient-to-r from-foreground via-primary to-chart-2 bg-clip-text text-transparent">
                Built for national-scale
              </span>{" "}
              renewable program delivery
            </h2>
            <p className="mt-4 text-pretty text-base text-muted-foreground md:text-lg">
              PMIS connects IPPs, departmental officers, and authorities in a single, policy-aligned workflow. Explore how
              each layer of the platform supports transparency, speed, and defensible decisions.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          ref={stripRef}
          className="mt-12 grid grid-cols-1 gap-4 md:mt-14 md:grid-cols-2"
          style={px.off ? undefined : { y: px.leadY }}
        >
          <div className="about-visual-card relative overflow-hidden rounded-[1.6rem] border border-border/45 bg-card/50 p-2 shadow-xl backdrop-blur-xl dark:border-border/20 dark:bg-card/35">
            <img src={heroSolar} alt="Solar fields" className="h-56 w-full rounded-[1.15rem] object-cover md:h-64" loading="lazy" />
            <div
              className="pointer-events-none absolute inset-2 rounded-[1.15rem] bg-gradient-to-t from-background/35 via-transparent to-transparent"
              aria-hidden
            />
          </div>
          <div className="about-visual-card relative overflow-hidden rounded-[1.6rem] border border-border/45 bg-card/50 p-2 shadow-xl backdrop-blur-xl dark:border-border/20 dark:bg-card/35">
            <img src={heroWind} alt="Wind turbines" className="h-56 w-full rounded-[1.15rem] object-cover md:h-64" loading="lazy" />
            <div
              className="pointer-events-none absolute inset-2 rounded-[1.15rem] bg-gradient-to-t from-background/40 via-transparent to-transparent"
              aria-hidden
            />
          </div>
        </motion.div>

        <div className="mt-20 flex flex-col gap-24 md:mt-24 md:gap-28">
          {BLOCKS.map((block, index) => (
            <AboutBlockRow key={block.id} index={index} {...block} />
          ))}
        </div>

        <motion.div
          className="mx-auto mt-20 max-w-3xl md:mt-24"
          style={px.off ? undefined : { y: px.trailY }}
          initial={r ? undefined : { opacity: 0, y: 16 }}
          whileInView={r ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, ease: easeInOut }}
        >
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
            {["End-to-end audit trail", "Policy-tied SLAs", "One national queue", "Milestone discipline"].map((p) => (
              <div
                key={p}
                className="inline-flex items-center gap-2 rounded-full border border-primary/12 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-foreground/90 shadow-sm shadow-primary/5 backdrop-blur-md dark:border-primary/10 dark:bg-card/45"
              >
                <Layers className="size-3.5 text-chart-2" aria-hidden />
                {p}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent dark:via-primary/25"
        aria-hidden
      />
    </section>
  );
}
