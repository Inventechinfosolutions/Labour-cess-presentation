import { Link } from "react-router";
import { InstagramLogo, LinkedinLogo, XLogo, YoutubeLogo } from "@phosphor-icons/react";
import emblem from "@/assets/karnataka-emblem.png";
import { ABOUT, SERVICE_LINKS } from "@/lib/nav";
import { PATHWAYS, pathwayHref } from "@/lib/pathways";
import { useT } from "@/theme/context";

const LINKS = ["Sitemap", "Privacy Policy", "Terms of Use", "Accessibility", "Contact"];

const SOCIAL = [
  { label: "LinkedIn", icon: LinkedinLogo },
  { label: "X", icon: XLogo },
  { label: "YouTube", icon: YoutubeLogo },
  { label: "Instagram", icon: InstagramLogo },
];

export function HeritageFooter() {
  const t = useT();
  return (
    <footer id="contact" className="border-t border-(color:--gc-line) bg-[#fffdf8] px-5 py-8 text-(color:--gc-body) lg:px-8">
      <nav aria-label="Pathways" className="mx-auto flex max-w-[1320px] flex-wrap justify-center gap-x-6 gap-y-2 pb-6 text-[13px]">
        <Link to={ABOUT} className="font-medium text-(color:--gc-ink-2) transition hover:text-(color:--gc-primary)">
          About
        </Link>
        {PATHWAYS.map((p) => (
          <Link key={p.id} to={pathwayHref(p.id)} className="font-medium text-(color:--gc-ink-2) transition hover:text-(color:--gc-primary)">
            {t(p.nav)}
          </Link>
        ))}
      </nav>
      <nav aria-label="NRI Help Desk" className="mx-auto flex max-w-[1320px] flex-wrap justify-center gap-x-6 gap-y-2 pb-6 text-[13px]">
        {SERVICE_LINKS.map((l) => (
          <Link key={l.label} to={l.to} className="font-semibold text-(color:--gc-gold-4) transition hover:text-(color:--gc-primary)">
            {l.label}
          </Link>
        ))}
      </nav>

      <div className="mx-auto flex max-w-[1320px] flex-col items-center gap-6 border-t border-(color:--gc-line) pt-6 md:flex-row md:justify-between">
        <ul className="flex flex-wrap justify-center text-[12.5px]">
          {LINKS.map((l, i) => (
            <li key={l} className="flex items-center">
              {i > 0 ? <span aria-hidden className="mx-3 h-3 w-px bg-(color:--gc-line)" /> : null}
              <Link to={l === "Contact" ? `${ABOUT}#contact-us` : "#contact"} className="transition hover:text-(color:--gc-ink)">
                {l}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <span className="text-[12.5px] font-medium text-(color:--gc-ink-2)">Follow Us</span>
          {SOCIAL.map(({ label, icon: Icon }) => (
            <a
              key={label}
              href="#contact"
              aria-label={label}
              className="grid size-8 place-items-center rounded-full bg-(color:--gc-navy) text-white transition hover:bg-(color:--gc-gold-4)"
            >
              <Icon size={15} weight="fill" />
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <img src={emblem} alt="" className="h-10 w-auto" />
          <span className="text-[12px] leading-snug">
            <span className="block font-semibold text-(color:--gc-ink)">Government of Karnataka</span>
            All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
