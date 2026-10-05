import { Link } from "react-router";
import { InstagramLogo, LinkedinLogo, XLogo, YoutubeLogo } from "@phosphor-icons/react";
import emblem from "@/assets/karnataka-emblem.png";
import skyline from "@/assets/horizon/footer-skyline.jpg";
import { ABOUT, SERVICE_LINKS } from "@/lib/nav";
import { PATHWAYS, pathwayHref } from "@/lib/pathways";
import { useT } from "@/theme/context";

const ABOUT_LINKS = [
  { label: "About the Department", to: ABOUT },
  { label: "Vision", to: `${ABOUT}#vision` },
  { label: "Government", to: `${ABOUT}#government` },
  { label: "News & Events", to: `${ABOUT}#news` },
  { label: "Resources", to: `${ABOUT}#resources` },
  { label: "Contact", to: `${ABOUT}#contact-us` },
];
const LEGAL = ["Privacy", "Terms", "Accessibility", "Site Map"];

const SOCIAL = [
  { label: "LinkedIn", icon: LinkedinLogo },
  { label: "X", icon: XLogo },
  { label: "YouTube", icon: YoutubeLogo },
  { label: "Instagram", icon: InstagramLogo },
];

export function HorizonFooter() {
  const t = useT();
  return (
    <footer id="contact" className="relative isolate overflow-hidden bg-[#0a1f4f] px-5 pt-12 pb-6 text-white/70 lg:px-8">
      <img
        src={skyline}
        alt=""
        aria-hidden
        loading="lazy"
        className="absolute right-0 bottom-0 -z-10 h-[78%] w-auto max-w-none opacity-40 mix-blend-screen [mask-image:linear-gradient(90deg,transparent,black_35%)] max-md:opacity-20"
      />

      <div className="mx-auto grid max-w-[1320px] gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr_1fr]">
        <div className="flex items-start gap-3">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white">
            <img src={emblem} alt="" className="h-10 w-auto" />
          </span>
          <span className="leading-tight">
            <span className="block text-[9px] font-bold tracking-[0.16em] text-white/60">GOVERNMENT OF KARNATAKA</span>
            <span className="mt-1 block font-display text-[15px] font-extrabold text-white">{t("KARNATAKA")} {t("GLOBAL CONNECT")}</span>
            <span className="mt-1 block text-[9px] font-semibold tracking-[0.16em] text-(color:--gc-gold)">
              {t("PEOPLE • PARTNERSHIPS • OPPORTUNITIES")}
            </span>
          </span>
        </div>

        <nav aria-label="Quick links">
          <p className="text-[13px] font-bold text-white">Quick Links</p>
          <ul className="mt-3 space-y-2 text-[13px]">
            <li>
              <Link to="/global-connect" className="transition hover:text-white">
                Home
              </Link>
            </li>
            {PATHWAYS.map((p) => (
              <li key={p.id}>
                <Link to={pathwayHref(p.id)} className="transition hover:text-white">
                  {t(p.nav)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="About">
          <p className="text-[13px] font-bold text-white">About</p>
          <ul className="mt-3 space-y-2 text-[13px]">
            {ABOUT_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="transition hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="NRI Help Desk">
          <p className="text-[13px] font-bold text-white">NRI Help Desk</p>
          <ul className="mt-3 space-y-2 text-[13px]">
            {SERVICE_LINKS.map((l) => (
              <li key={l.label}>
                <Link to={l.to} className="transition hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-[13px] font-bold text-white">Follow Us</p>
          <div className="mt-3 flex gap-2">
            {SOCIAL.map(({ label, icon: Icon }) => (
              <a
                key={label}
                href="#contact"
                aria-label={label}
                className="grid size-9 place-items-center rounded-full border border-white/25 text-white/85 transition hover:border-(color:--gc-gold) hover:text-(color:--gc-gold)"
              >
                <Icon size={16} weight="fill" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1320px] flex-col gap-3 border-t border-white/10 pt-5 text-[12px] text-white/55 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 Government of Karnataka. All rights reserved.</span>
        <ul className="flex flex-wrap">
          {LEGAL.map((l, i) => (
            <li key={l} className="flex items-center">
              {i > 0 ? <span aria-hidden className="mx-3 h-3 w-px bg-white/20" /> : null}
              <a href="#contact" className="transition hover:text-white">
                {l}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
