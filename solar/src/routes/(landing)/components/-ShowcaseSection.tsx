import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Sparkles } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import heroSolar from "@/assets/hero-solar.jpg";
import { fadeUp, slideLeft, slideRight, staggerParent } from "./-LandingMotion";

gsap.registerPlugin(ScrollTrigger);

const SHOWCASE_POINTS = [
  "Unified project timeline with role-aware milestones",
  "Submission intelligence with policy-aware checks",
  "Portfolio-level visibility across all active districts",
] as const;

export function ShowcaseSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();
  const off = reduce === true;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageScale = useTransform(scrollYProgress, [0, 1], [off ? 1 : 0.94, 1.08]);
  const imageRotate = useTransform(scrollYProgress, [0, 1], [off ? 0 : -1.8, off ? 0 : 1.4]);
  const textY = useTransform(scrollYProgress, [0, 1], [off ? 0 : 24, off ? 0 : -24]);

  useLayoutEffect(() => {
    if (off || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".showcase-point",
        { opacity: 0, x: -28 },
        {
          opacity: 1,
          x: 0,
          duration: 0.76,
          stagger: 0.09,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          },
        },
      );
      gsap.to(".showcase-float", {
        yPercent: -20,
        rotate: 1.4,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.5,
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [off]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate overflow-hidden border-y border-primary/10 py-20 md:py-28"
      aria-labelledby="showcase-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_65%_42%_at_18%_20%,color-mix(in_oklch,var(--chart-2)_10%,transparent),transparent_55%),radial-gradient(ellipse_70%_45%_at_88%_75%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_56%)]"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 md:items-center md:gap-14 md:px-8 lg:grid-cols-2 lg:px-10">
        <motion.div
          variants={staggerParent(0.16, 0.05)}
          initial={off ? undefined : "hidden"}
          whileInView={off ? undefined : "show"}
          viewport={{ once: true, amount: 0.35 }}
          style={off ? undefined : { y: textY }}
        >
          <motion.span
            variants={fadeUp(0, 24)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-muted px-3.5 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-foreground/95 dark:border-primary/25 dark:bg-primary/10 dark:text-foreground"
          >
            <Sparkles className="size-3.5" aria-hidden />
            Product showcase
          </motion.span>
          <motion.h2
            id="showcase-heading"
            variants={slideRight(0.08)}
            className="mt-4 max-w-xl text-balance text-3xl font-semibold leading-[1.08] tracking-tight md:text-4xl"
          >
            A command center that feels
            {" "}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              premium at every step
            </span>
          </motion.h2>
          <motion.p variants={fadeUp(0.14, 28)} className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Purpose-built workflows for solar and wind approvals with smooth transitions from intake through execution.
          </motion.p>
          <motion.ul variants={staggerParent(0.15, 0.12)} className="mt-7 space-y-3">
            {SHOWCASE_POINTS.map((point) => (
              <motion.li
                key={point}
                variants={fadeUp(0, 18)}
                className="showcase-point rounded-xl border border-primary/10 bg-card/65 px-4 py-3 text-sm text-foreground/90 shadow-sm backdrop-blur-md dark:bg-card/40"
                whileHover={off ? undefined : { y: -4, scale: 1.01 }}
                transition={{ type: "spring", stiffness: 240, damping: 25, mass: 0.7 }}
              >
                {point}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          variants={slideLeft(0.12)}
          initial={off ? undefined : "hidden"}
          whileInView={off ? undefined : "show"}
          viewport={{ once: true, amount: 0.35 }}
          className="relative"
        >
          <motion.div
            className="showcase-float relative overflow-hidden rounded-[2rem] border border-border/40 bg-card/40 p-2 shadow-2xl ring-1 ring-border/25 backdrop-blur-2xl dark:border-border/15 dark:bg-card/30 dark:ring-border/10"
            style={off ? undefined : { scale: imageScale, rotate: imageRotate }}
          >
            <img
              src={heroSolar}
              alt="Solar project overview"
              className="h-[320px] w-full rounded-[1.45rem] object-cover object-center md:h-[420px]"
              loading="lazy"
            />
            <div
              className="pointer-events-none absolute inset-0 rounded-[1.45rem] bg-gradient-to-t from-background/50 via-transparent to-transparent"
              aria-hidden
            />
            <motion.div
              className="absolute bottom-4 left-4 right-4 rounded-xl border border-border bg-background/55 px-4 py-3 text-sm font-medium text-primary-foreground backdrop-blur-xl"
              initial={off ? undefined : { opacity: 0, scale: 0.92 }}
              whileInView={off ? undefined : { opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.7 }}
              transition={{ duration: 0.55, ease: "easeOut", delay: 0.2 }}
            >
              National program insights, rendered in real time.
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
