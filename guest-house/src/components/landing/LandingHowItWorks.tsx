import {
  CalendarCheck,
  KeyRound,
  LogIn,
  MapPin,
  QrCode,
} from "lucide-react"
import { LandingSectionHeader } from "@/components/landing/LandingSectionHeader"

const steps = [
  {
    step: "01",
    icon: LogIn,
    title: "Sign in securely",
    description:
      "Government employees authenticate with mobile OTP. Admins use verified credentials.",
  },
  {
    step: "02",
    icon: MapPin,
    title: "Choose a location",
    description:
      "Browse guest houses by city, view buildings, floors, and available room types.",
  },
  {
    step: "03",
    icon: CalendarCheck,
    title: "Book your stay",
    description:
      "Select dates, confirm guest details, and complete payment through the secure portal.",
  },
  {
    step: "04",
    icon: QrCode,
    title: "Digital check-in",
    description:
      "Receive a QR code for room access. Check in on arrival with instant verification.",
  },
  {
    step: "05",
    icon: KeyRound,
    title: "Manage your booking",
    description:
      "Track active stays, view booking history, and access digital room keys anytime.",
  },
]

export function LandingHowItWorks() {
  return (
    <section id="how" className="landing-section-alt">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <LandingSectionHeader
          className="step-header mx-auto"
          align="center"
          kicker="How it works"
          title="Book a guest house in five simple steps"
          description="A streamlined journey from login to check-in — built for government employees on official duty travel."
        />

        <div className="relative mt-16">
          <div
            className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block"
            aria-hidden
          />

          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {steps.map((item) => (
              <li
                key={item.step}
                className="step-item group relative flex flex-col items-center text-center lg:px-2"
              >
                <div className="relative z-[1] flex size-16 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-sm transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-md">
                  <item.icon className="size-6 text-primary" />
                  <span className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-[0.65rem] font-bold text-primary-foreground">
                    {Number(item.step)}
                  </span>
                </div>

                <h3 className="mt-5 text-base font-semibold leading-snug">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
