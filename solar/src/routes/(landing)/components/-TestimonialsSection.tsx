import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Quote } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { fadeUp, staggerParent } from "./-LandingMotion";

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    quote:
      "We reduced approval ambiguity dramatically. Every comment and transition is now visible to all authorized teams.",
    name: "Program Director",
    org: "State Renewable Mission",
  },
  {
    quote: "The SLA visibility changed how we operate. Delays surface early and teams act before escalations happen.",
    name: "Nodal Officer",
    org: "Energy Department",
  },
  {
    quote:
      "The workflow feels premium yet practical. Our IPP operations team can track milestones without endless follow-up calls.",
    name: "Compliance Lead",
    org: "IPP Consortium",
  },
] as const;

export function TestimonialsSection() {
  const reduce = useReducedMotion();
  const off = reduce === true;
  const sectionRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (off || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".testimonial-card",
        { opacity: 0, y: 46, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.82,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 72%",
          },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [off]);

  return (
    <section ref={sectionRef} className="relative isolate overflow-hidden border-y border-primary/10 py-20 md:py-28" aria-labelledby="testimonials-heading">
      <div
        className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_72%_45%_at_85%_20%,color-mix(in_oklch,var(--chart-2)_10%,transparent),transparent_58%),radial-gradient(ellipse_65%_40%_at_8%_75%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_58%)]"
        aria-hidden
      />
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-10">
        <motion.div
          initial={off ? undefined : "hidden"}
          whileInView={off ? undefined : "show"}
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp(0, 28)}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 id="testimonials-heading" className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Trusted by teams delivering
            {" "}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              high-impact programs
            </span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Real feedback from decision-makers, reviewers, and project operators.
          </p>
        </motion.div>

        <motion.div
          variants={staggerParent(0.18, 0.08)}
          initial={off ? undefined : "hidden"}
          whileInView={off ? undefined : "show"}
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid gap-5 md:grid-cols-3"
        >
          {TESTIMONIALS.map((item) => (
            <motion.article
              key={item.name}
              variants={fadeUp(0, 24)}
              whileHover={off ? undefined : { y: -10, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 220, damping: 22, mass: 0.72 }}
              className="testimonial-card group relative overflow-hidden rounded-2xl border border-primary/12 bg-gradient-to-br from-card/95 via-card/80 to-primary/5 p-6 shadow-sm ring-1 ring-border/30 dark:from-card/85 dark:via-card/75 dark:to-primary/[0.09] dark:ring-primary/10"
            >
              <div
                className="pointer-events-none absolute -right-10 -top-16 size-36 rounded-full bg-gradient-to-br from-chart-3/20 to-transparent blur-2xl transition duration-500 group-hover:opacity-100"
                aria-hidden
              />
              <Quote className="size-5 text-primary/75" aria-hidden />
              <p className="mt-4 text-sm leading-relaxed text-foreground/90">{item.quote}</p>
              <div className="mt-6 border-t border-primary/10 pt-4">
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.org}</p>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
