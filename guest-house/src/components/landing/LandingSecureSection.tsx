import { Link } from "react-router-dom"
import { Fingerprint, QrCode, ScrollText, ShieldCheck } from "lucide-react"

const PROTECTIONS = [
  {
    icon: Fingerprint,
    title: "Verified employees only",
    description:
      "Sign in with mobile OTP and a valid government employee ID before you can book any guest house.",
    accent: "bg-rose-50 text-primary",
  },
  {
    icon: QrCode,
    title: "Digital room access",
    description:
      "Check in with a secure QR code on arrival — no manual registers or paper slips at the desk.",
    accent: "bg-sky-50 text-sky-700",
  },
  {
    icon: ScrollText,
    title: "Full audit trail",
    description:
      "Every booking, payment, and check-in is logged for transparency and policy compliance.",
    accent: "bg-emerald-50 text-emerald-700",
  },
]

const TRUST_POINTS = [
  "OTP login",
  "ID verification",
  "QR check-in",
  "Secure payments",
  "Admin controls",
  "Policy compliant",
]

export function LandingSecureSection() {
  return (
    <section id="about" className="border-t border-border/50 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-12">
        <div className="secure-header mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-[#fafafa] px-4 py-2">
            <ShieldCheck className="size-4 text-primary" strokeWidth={2.25} />
            <span className="text-sm font-medium text-[#222222]">Built-in protection</span>
          </div>
          <h2 className="text-[2rem] font-semibold leading-[1.12] tracking-[-0.02em] text-[#222222] sm:text-[2.75rem]">
            When you book, you&apos;re protected
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#717171] sm:text-[17px]">
            Official guest house stays come with employee verification, digital access,
            and secure payments — included on every booking.
          </p>
        </div>

        <div className="secure-grid mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {PROTECTIONS.map((item) => (
            <article
              key={item.title}
              className="secure-card group flex flex-col rounded-2xl border border-border/50 bg-[#fafafa] p-6 transition duration-300 hover:border-border hover:bg-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] sm:p-7"
            >
              <div
                className={`flex size-12 items-center justify-center rounded-2xl ${item.accent}`}
              >
                <item.icon className="size-6" strokeWidth={1.75} />
              </div>
              <h3 className="mt-5 text-lg font-semibold leading-snug text-[#222222]">
                {item.title}
              </h3>
              <p className="mt-2 flex-1 text-[15px] leading-relaxed text-[#717171]">
                {item.description}
              </p>
            </article>
          ))}
        </div>

        <div className="secure-features mx-auto mt-10 max-w-3xl rounded-2xl border border-border/50 bg-[#fafafa] px-5 py-5 sm:px-8 sm:py-6">
          <p className="text-center text-sm font-medium text-[#222222]">
            Included with every booking
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            {TRUST_POINTS.map((point) => (
              <span
                key={point}
                className="inline-flex items-center rounded-full border border-border/60 bg-white px-3.5 py-1.5 text-sm text-[#484848]"
              >
                {point}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to="/login"
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#222222] px-8 text-sm font-semibold text-white transition hover:bg-black hover:shadow-md"
          >
            See how security works
          </Link>
        </div>
      </div>
    </section>
  )
}
