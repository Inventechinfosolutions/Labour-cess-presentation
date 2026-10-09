import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { fadeUp, staggerParent } from "./-LandingMotion";

const PLANS = [
  {
    name: "Standard",
    subtitle: "Core portal operations",
    price: "Free",
    points: ["Application intake", "Officer review queue", "SLA timeline"],
    featured: false,
  },
  {
    name: "Enterprise",
    subtitle: "For state-wide governance teams",
    price: "Custom",
    points: ["Portfolio analytics", "Multi-department controls", "Escalation dashboards"],
    featured: true,
  },
  {
    name: "Public Program",
    subtitle: "National-level visibility",
    price: "Custom",
    points: ["Role-segmented access", "Policy-linked workflows", "Audit-grade reporting"],
    featured: false,
  },
] as const;

export function PricingSection() {
  const reduce = useReducedMotion();
  const off = reduce === true;

  return (
    <section className="relative isolate overflow-hidden border-y border-primary/10 py-20 md:py-28" aria-labelledby="pricing-heading">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-primary/[0.04] to-background" aria-hidden />
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-4 sm:px-6 md:px-8 lg:px-10">
        <motion.div
          initial={off ? undefined : "hidden"}
          whileInView={off ? undefined : "show"}
          viewport={{ once: true, amount: 0.4 }}
          variants={fadeUp(0, 26)}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 id="pricing-heading" className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Pricing built for
            {" "}
            <span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
              scalable public delivery
            </span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            Flexible plans for pilot programs to national multi-agency deployments.
          </p>
        </motion.div>

        <motion.div
          variants={staggerParent(0.18, 0.1)}
          initial={off ? undefined : "hidden"}
          whileInView={off ? undefined : "show"}
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 grid gap-5 md:grid-cols-3"
        >
          {PLANS.map((plan) => (
            <motion.article
              key={plan.name}
              variants={fadeUp(0, 24)}
              whileHover={off ? undefined : { y: -10, scale: plan.featured ? 1.02 : 1.015 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className={`relative overflow-hidden rounded-2xl border p-6 backdrop-blur-2xl ${
                plan.featured
                  ? "scale-[1.02] border-primary/25 bg-gradient-to-br from-primary/[0.15] via-card/90 to-primary/5 shadow-xl ring-1 ring-primary/35 dark:from-primary/22 dark:via-card/85 dark:to-primary/12"
                  : "border-primary/12 bg-gradient-to-br from-card/95 via-card/82 to-card/72 shadow-sm ring-1 ring-border/30 dark:from-card/85 dark:via-card/75 dark:to-card/65 dark:ring-primary/10"
              }`}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-chart-3 via-primary to-chart-2 opacity-80" aria-hidden />
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary/85">{plan.name}</p>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{plan.price}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{plan.subtitle}</p>
              <ul className="mt-6 space-y-3 text-sm">
                {plan.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-foreground/90">
                    <Check className="mt-0.5 size-4 text-primary" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
              >
                Get started
              </Link>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
