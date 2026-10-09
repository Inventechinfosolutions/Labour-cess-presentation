import { CalendarCheck, MapPin, ShieldCheck } from "lucide-react"

const ITEMS = [
  {
    icon: MapPin,
    title: "It's easy",
    description:
      "Browse official guest houses by city, pick your dates, and confirm your stay in minutes.",
  },
  {
    icon: CalendarCheck,
    title: "It's worth it",
    description:
      "Transparent government rates, instant booking confirmation, and digital access from check-in.",
  },
  {
    icon: ShieldCheck,
    title: "You're protected",
    description:
      "OTP-verified employee login, ID checks, and secure QR room access on every booking.",
  },
]

export function LandingJoinSection() {
  return (
    <section className="border-t border-border/50 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-12">
        <h2 className="join-header text-center text-[2rem] font-semibold leading-tight tracking-[-0.02em] text-[#222222] sm:text-[2.5rem]">
          Join thousands of employees on GovGuestHouse
        </h2>

        <div className="join-grid mt-14 grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-12">
          {ITEMS.map((item) => (
            <div key={item.title} className="join-item flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#f7f7f7]">
                <item.icon className="size-7 text-[#222222]" strokeWidth={1.5} />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-[#222222]">{item.title}</h3>
              <p className="mt-3 max-w-xs text-[15px] leading-relaxed text-[#717171]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
