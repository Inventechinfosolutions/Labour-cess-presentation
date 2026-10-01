import { Link } from "react-router";
import { LinkedinLogo, XLogo, YoutubeLogo } from "@phosphor-icons/react";
import emblem from "@/assets/karnataka-emblem.png";
import { PATHWAYS, pathwayHref } from "@/lib/pathways";

const COLUMNS = [
  { title: "About", links: ["About the Platform", "Government of Karnataka", "Policies", "Resources"] },
  { title: "Support", links: ["Support", "Contact", "FAQs", "Events"] },
];

const SOCIAL = [
  { label: "LinkedIn", icon: LinkedinLogo },
  { label: "X", icon: XLogo },
  { label: "YouTube", icon: YoutubeLogo },
];

export function SiteFooter() {
  return (
    <footer id="contact" className="bg-[#061536] px-5 pt-14 pb-8 text-white/70 lg:px-8">
      <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 sm:col-span-3 md:col-span-1">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-white ring-2 ring-[#f0c14a]/70">
              <img src={emblem} alt="" className="h-9 w-auto" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-semibold text-white">Karnataka Global Connect</span>
              <span className="block text-[12px]">People • Partnerships • Opportunities</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/55">
            One gateway for global investment, talent, partnerships and opportunities in Karnataka.
          </p>
          <div className="mt-5 flex gap-2">
            {SOCIAL.map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="#contact"
                aria-label={label}
                className="grid size-9 place-items-center rounded-full border border-white/15 text-white/75 transition hover:border-white/50 hover:text-white"
              >
                <Icon size={16} weight="fill" />
              </a>
            ))}
          </div>
        </div>

        <nav aria-label="Pathways">
          <p className="font-display text-[13px] font-semibold tracking-wide text-white">Explore</p>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            {PATHWAYS.map((p) => (
              <li key={p.id}>
                <Link to={pathwayHref(p.id)} className="transition hover:text-white">
                  {p.nav}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {COLUMNS.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="font-display text-[13px] font-semibold tracking-wide text-white">{c.title}</p>
            <ul className="mt-4 space-y-2.5 text-[13px]">
              {c.links.map((l) => (
                <li key={l}>
                  <a href="#contact" className="transition hover:text-white">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto mt-12 flex max-w-[1320px] flex-col gap-3 border-t border-white/10 pt-6 text-[12px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 Karnataka Global Connect · Concept prototype</span>
        <div className="flex gap-5">
          {["Privacy", "Terms", "Accessibility", "Contact"].map((l) => (
            <a key={l} href="#contact" className="transition hover:text-white">
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
