import { EnvelopeSimple, FacebookLogo, InstagramLogo, MapPin, Phone, XLogo, YoutubeLogo } from "@phosphor-icons/react";
import { Link } from "react-router";
import { ORG, POLICIES, SITE, SOCIAL } from "@/lib/content";
import { useDesign } from "@/lib/design";
import { useLang } from "@/lib/i18n";
import { asset } from "@/lib/utils";

const TEXT = {
  policies: { en: "Policies & Guidelines", kn: "ನೀತಿಗಳು ಮತ್ತು ಮಾರ್ಗಸೂಚಿಗಳು" },
  contact: { en: "Contact Us", kn: "ಸಂಪರ್ಕಿಸಿ" },
  follow: { en: "Follow Us", kn: "ನಮ್ಮನ್ನು ಅನುಸರಿಸಿ" },
  important: { en: "Important Links", kn: "ಪ್ರಮುಖ ಕೊಂಡಿಗಳು" },
  sitemap: { en: "Sitemap", kn: "ಸೈಟ್‌ಮ್ಯಾಪ್" },
  building: { en: "Building", kn: "" },
  sustainable: { en: "Sustainable", kn: "ಸುಸ್ಥಿರ" },
  bengaluru: { en: "Bengaluru", kn: "ಬೆಂಗಳೂರಿನ ನಿರ್ಮಾಣ" },
  disclaimer: {
    en: "This page also links to websites of other Government departments and organisations. Their content is owned by the respective organisations, who may be contacted for further information.",
    kn: "ಈ ಪುಟವು ಇತರ ಸರ್ಕಾರಿ ಇಲಾಖೆಗಳು ಮತ್ತು ಸಂಸ್ಥೆಗಳ ಜಾಲತಾಣಗಳಿಗೆ ಕೊಂಡಿಗಳನ್ನು ಹೊಂದಿದೆ. ಅವುಗಳ ವಿಷಯವು ಆಯಾ ಸಂಸ್ಥೆಗಳ ಒಡೆತನದಲ್ಲಿದೆ.",
  },
  owned: {
    en: "Content owned by Bangalore Development Authority, Government of Karnataka.",
    kn: "ವಿಷಯದ ಒಡೆತನ: ಬೆಂಗಳೂರು ಅಭಿವೃದ್ಧಿ ಪ್ರಾಧಿಕಾರ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ.",
  },
};

const SOCIALS = [
  { href: SOCIAL.youtube, label: "YouTube", Icon: YoutubeLogo },
  { href: SOCIAL.instagram, label: "Instagram", Icon: InstagramLogo },
  { href: SOCIAL.x, label: "X", Icon: XLogo },
  { href: SOCIAL.facebook, label: "Facebook", Icon: FacebookLogo },
];

function Skyline() {
  const cols = Array.from({ length: 15 }, (_, i) => 232 + i * 10);
  return (
    <svg viewBox="0 0 600 130" className="pointer-events-none absolute bottom-0 right-0 hidden h-36 w-[46rem] text-white/[0.09] lg:block" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M0 128 H600" />
      <path d="M20 128 V70 H60 V128 M30 80 H50 M30 92 H50 M30 104 H50" />
      <path d="M70 128 V48 H100 V128 M78 58 H92 M78 70 H92 M78 82 H92 M78 94 H92" />
      <path d="M110 128 V84 H160 V128 M120 96 H150 M120 108 H150" />
      <path d="M170 128 V60 L190 46 L210 60 V128" />
      <path d="M220 128 V82 H380 V128" />
      {cols.map((x) => (
        <path key={x} d={`M${x} 88 V128`} />
      ))}
      <path d="M216 82 H384 M228 82 V74 H372 V82" />
      <path d="M250 74 V58 H350 V74" />
      <path d="M268 58 Q300 12 332 58" />
      <path d="M300 22 V8 M296 14 H304" />
      <path d="M226 74 Q238 56 250 74 M350 74 Q362 56 374 74" />
      <path d="M390 128 V66 H430 V128 M398 76 H422 M398 88 H422 M398 100 H422" />
      <path d="M440 128 V40 H468 V128 M448 52 H460 M448 64 H460 M448 76 H460 M448 88 H460" />
      <path d="M478 128 V78 H530 V128 M488 90 H520 M488 102 H520" />
      <path d="M540 128 V58 H580 V128 M548 68 H572 M548 80 H572 M548 92 H572" />
    </svg>
  );
}

function Landscape() {
  const towers = [
    [0, 52, 26], [30, 70, 20], [54, 40, 30], [90, 84, 18], [112, 58, 26], [144, 46, 22],
    [380, 64, 22], [406, 90, 18], [428, 50, 28], [462, 76, 20], [486, 42, 30], [522, 60, 24],
  ];
  return (
    <div className="relative -mb-px h-36 overflow-hidden md:h-44" aria-hidden>
      <svg viewBox="0 0 1440 180" preserveAspectRatio="none" className="absolute inset-0 size-full">
        <path d="M0 120 C 240 60 420 100 660 86 C 920 70 1120 40 1440 78 V180 H0Z" fill="#bbf7d0" fillOpacity="0.75" />
        <path d="M0 140 C 300 104 520 130 780 116 C 1020 102 1220 96 1440 112 V180 H0Z" fill="#86efac" fillOpacity="0.6" />
        <path d="M0 162 C 360 146 720 158 1080 148 C 1260 143 1360 150 1440 148 V180 H0Z" fill="#081f50" />
      </svg>
      <svg viewBox="0 0 560 130" className="absolute bottom-3 right-[3%] h-28 w-[480px] md:h-36 md:w-[620px]">
        <g fill="#1e3a8a" fillOpacity="0.28">
          {towers.map(([x, h, w]) => (
            <rect key={x} x={x} y={130 - h} width={w} height={h} rx="1.5" />
          ))}
        </g>
        <g fill="#1e3a8a" fillOpacity="0.45">
          <rect x="196" y="86" width="168" height="44" />
          <rect x="222" y="70" width="116" height="18" />
          <path d="M248 70 Q280 22 312 70Z" />
          <rect x="278" y="16" width="4" height="14" />
          <path d="M202 86 Q214 68 226 86Z M334 86 Q346 68 358 86Z" />
        </g>
        <g fill="#16a34a" fillOpacity="0.55">
          <circle cx="176" cy="116" r="12" /><circle cx="188" cy="120" r="9" /><circle cx="372" cy="116" r="12" /><circle cx="360" cy="121" r="8" />
        </g>
      </svg>
    </div>
  );
}

export function SiteFooter() {
  const { t, lang } = useLang();
  const { design } = useDesign();
  const garden = design === "garden";
  const civic = design === "civic" || garden;
  return (
    <>
    {garden && <Landscape />}
    <footer className="relative overflow-hidden bg-navy-deep text-white/80">
      {design === "civic" && <Skyline />}
      <div className="relative mx-auto grid max-w-site gap-10 px-5 py-12 md:grid-cols-2 lg:px-8 lg:py-14 lg:grid-cols-[1.4fr_1fr_1.3fr_0.9fr]">
        <div className="flex items-start gap-3">
          <img src={asset("images/bda-logo.jpg")} alt="BDA" className="size-16 shrink-0 rounded-full" />
          <div className="leading-snug">
            <div className="font-display text-sm font-semibold uppercase text-white">{t(ORG.name)}</div>
            <div className="text-xs">{t(ORG.govt)}</div>
            <div className="mt-1 text-sm font-semibold text-white/90">{lang === "en" ? ORG.nameKn : ORG.name.en}</div>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{t(civic ? TEXT.important : TEXT.policies)}</h3>
          <ul className="mt-3 space-y-1 text-[13px]">
            {civic && (
              <li>
                <Link to="/sitemap" className="-mx-2 inline-block rounded-md px-2 py-0.5 transition-colors hover:bg-brand hover:text-white">
                  {t(TEXT.sitemap)}
                </Link>
              </li>
            )}
            {POLICIES.map((p) => (
              <li key={p.en}>
                <a href={SITE} target="_blank" rel="noopener noreferrer" className="-mx-2 inline-block rounded-md px-2 py-0.5 transition-colors hover:bg-brand hover:text-white">
                  {t(p)}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{t(TEXT.contact)}</h3>
          <ul className="mt-3 space-y-1.5 text-[13px]">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 shrink-0" size={16} />
              {t(ORG.address)}
            </li>
            <li>
              <a href="tel:+919483166622" className="-mx-2 inline-flex gap-2 rounded-md px-2 py-1 transition-colors hover:bg-brand hover:text-white">
                <Phone className="mt-0.5 shrink-0" size={16} />
                {ORG.helpline}
              </a>
            </li>
            <li>
              <a href={`mailto:${ORG.email}`} className="-mx-2 inline-flex gap-2 break-all rounded-md px-2 py-1 transition-colors hover:bg-brand hover:text-white">
                <EnvelopeSimple className="mt-0.5 shrink-0" size={16} />
                {ORG.email}
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{t(TEXT.follow)}</h3>
          <div className="mt-3 flex gap-2">
            {SOCIALS.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="grid size-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand"
              >
                <Icon size={18} weight="fill" />
              </a>
            ))}
          </div>
          {garden && (
            <p className="mt-5 font-display text-lg font-bold leading-tight text-white">
              {t(TEXT.building)} <span className="text-emerald-400">{t(TEXT.sustainable)}</span> {t(TEXT.bengaluru)}
            </p>
          )}
        </div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto max-w-site space-y-1 px-5 pb-20 pt-5 lg:px-8 text-center text-[11.5px] text-white/60">
          <p>{t(TEXT.disclaimer)}</p>
          <p>{t(TEXT.owned)}</p>
        </div>
      </div>
    </footer>
    </>
  );
}
