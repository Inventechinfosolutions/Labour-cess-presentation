import { Link } from "react-router";
import { LinkedinLogo, XLogo, YoutubeLogo } from "@phosphor-icons/react";
import emblem from "@/assets/karnataka-emblem.png";
import { ABOUT, SERVICE_LINKS } from "@/lib/nav";
import { PATHWAYS, pathwayHref } from "@/lib/pathways";
import { HeritageFooter } from "@/components/heritage/HeritageFooter";
import { HorizonFooter } from "@/components/horizon/HorizonFooter";
import { useT, useTheme } from "@/theme/context";

const COLUMNS = [
  {
    title: "About",
    links: [
      { label: "About the Department", to: ABOUT },
      { label: "Our Mandate", to: `${ABOUT}#vision` },
      { label: "Events and News", to: `${ABOUT}#news` },
      { label: "Resources", to: `${ABOUT}#resources` },
      { label: "Contact", to: `${ABOUT}#contact-us` },
    ],
  },
  { title: "NRI Help Desk", links: SERVICE_LINKS },
];

const SOCIAL = [
  { label: "LinkedIn", icon: LinkedinLogo },
  { label: "X", icon: XLogo },
  { label: "YouTube", icon: YoutubeLogo },
];

export function SiteFooter() {
  const { theme } = useTheme();
  if (theme === "heritage") return <HeritageFooter />;
  if (theme === "horizon") return <HorizonFooter />;
  return <GlobalFooter />;
}

function GlobalFooter() {
  const t = useT();
  return (
    <footer id="contact" className="bg-(color:--gc-navy) px-5 pt-14 pb-8 text-white/70 lg:px-8">
      <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-10 sm:grid-cols-3 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 sm:col-span-3 md:col-span-1">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-white ring-2 ring-(color:--gc-gold-3)/70">
              <img src={emblem} alt="" className="h-9 w-auto" />
            </span>
            <span className="leading-tight">
              <span className="block font-display text-[15px] font-semibold text-white">{t("Karnataka Global Connect")}</span>
              <span className="block text-[12px]">{t("People • Partnerships • Opportunities")}</span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-white/55">
            {t("One gateway for global investment, talent, partnerships and opportunities in Karnataka.")}
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
          <p className="font-display text-[13px] font-semibold tracking-wide text-white">{t("Explore")}</p>
          <ul className="mt-4 space-y-2.5 text-[13px]">
            {PATHWAYS.map((p) => (
              <li key={p.id}>
                <Link to={pathwayHref(p.id)} className="transition hover:text-white">
                  {t(p.nav)}
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
                <li key={l.label}>
                  <Link to={l.to} className="transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mx-auto mt-12 flex max-w-[1320px] flex-col gap-3 border-t border-white/10 pt-6 text-[12px] text-white/50 sm:flex-row sm:items-center sm:justify-between">
        <span>{t("© 2026 Karnataka Global Connect · Concept prototype")}</span>
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
