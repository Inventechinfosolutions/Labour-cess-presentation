import { Link } from "react-router-dom"
import { BrandMark } from "@/components/shared/BrandLogo"

const FOOTER_GROUPS = [
  {
    title: "Support",
    links: [
      { label: "Help Centre", href: "#help" },
      { label: "Safety", href: "#about" },
      { label: "Contact us", href: "/login" },
    ],
  },
  {
    title: "Booking",
    links: [
      { label: "Browse locations", href: "#locations" },
      { label: "My bookings", href: "/login" },
      { label: "Digital access", href: "/login" },
    ],
  },
  {
    title: "GovGuestHouse",
    links: [
      { label: "About", href: "#about" },
      { label: "Admin portal", href: "/login" },
      { label: "Notices", href: "#notices" },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-[#f7f7f7]">
      <div className="mx-auto max-w-[1280px] px-6 py-14 sm:px-10 lg:px-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <BrandMark size="sm" />
              <span className="text-sm font-bold text-[#222222]">GovGuestHouse</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#717171]">
              Official government platform for guest house booking and digital access.
            </p>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-[#222222]">{group.title}</h3>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") ? (
                      <a
                        href={link.href}
                        className="text-sm text-[#717171] transition hover:text-[#222222] hover:underline"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-sm text-[#717171] transition hover:text-[#222222] hover:underline"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border/60 pt-8 text-xs text-[#717171] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Government of India · Demo prototype</p>
          <div className="flex flex-wrap gap-4">
            <a href="#about" className="hover:underline">
              Privacy
            </a>
            <a href="#about" className="hover:underline">
              Terms
            </a>
            <a href="#locations" className="hover:underline">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
