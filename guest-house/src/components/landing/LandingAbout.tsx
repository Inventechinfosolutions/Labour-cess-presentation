import { Link } from "react-router-dom"
import { ArrowRight, Building2, FileCheck, Globe, ShieldCheck } from "lucide-react"
import { LandingSectionHeader } from "@/components/landing/LandingSectionHeader"
import { Button } from "@/components/ui/button"

const highlights = [
  {
    icon: ShieldCheck,
    title: "Government-grade security",
    description:
      "OTP-verified employee access, role-based permissions, and audit trails for every booking action.",
  },
  {
    icon: Building2,
    title: "Nationwide guest houses",
    description:
      "Centralized management of accommodation facilities across major government hubs in India.",
  },
  {
    icon: FileCheck,
    title: "Policy-compliant bookings",
    description:
      "Automated eligibility checks, approval workflows, and transparent fee collection aligned with GFR norms.",
  },
  {
    icon: Globe,
    title: "Digital-first experience",
    description:
      "Browse locations, book rooms, check in with QR codes, and manage stays from any device.",
  },
]

const metrics = [
  { value: "4", label: "Cities covered" },
  { value: "180+", label: "Rooms managed" },
  { value: "24/7", label: "Digital access" },
]

export function LandingAbout() {
  return (
    <section id="about" className="landing-section-alt relative overflow-hidden">
      <div
        className="pointer-events-none absolute -right-24 top-0 size-72 rounded-full bg-primary/8 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 size-56 rounded-full bg-chart-3/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-16">
          <div className="about-header space-y-8">
            <LandingSectionHeader
              kicker="About GovGuestHouse"
              title="One platform for government accommodation"
              description="GovGuestHouse replaces manual registers and fragmented processes with a secure, transparent system for employees, administrators, and facility managers."
            />

            <p className="text-muted-foreground leading-relaxed">
              From room discovery to digital check-in and occupancy reporting, every
              step is designed for accountability, ease of use, and operational efficiency
              at scale across the country.
            </p>

            <div className="flex flex-wrap gap-6 border-y border-border/60 py-6">
              {metrics.map((m) => (
                <div key={m.label}>
                  <p className="text-2xl font-semibold tracking-tight text-primary">{m.value}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>

            <Button asChild className="rounded-full px-6">
              <Link to="/login">
                Explore the platform
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item, index) => (
              <div
                key={item.title}
                className="about-item group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-md"
              >
                <div
                  className="absolute -right-4 -top-4 size-20 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-110"
                  aria-hidden
                />
                <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
                  0{index + 1}
                </span>
                <div className="relative mt-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/15">
                  <item.icon className="size-5 text-primary" />
                </div>
                <h3 className="relative mt-4 font-semibold leading-snug">{item.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
