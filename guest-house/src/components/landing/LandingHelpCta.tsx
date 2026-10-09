import { Link } from "react-router-dom"

export function LandingHelpCta() {
  return (
    <section id="help" className="border-t border-border/50 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-[640px] px-6 text-center sm:px-10">
        <h2 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-[#222222] sm:text-[2rem]">
          Still have questions?
        </h2>
        <p className="mt-3 text-[15px] text-[#717171]">
          Get answers from our support team about booking, check-in, and employee eligibility.
        </p>
        <Link
          to="/login"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-lg bg-[#222222] px-8 text-sm font-semibold text-white transition hover:bg-[#000000]"
        >
          Contact support
        </Link>
      </div>
    </section>
  )
}
