import type { Text } from "@/lib/i18n";

export const SITE = "https://bdakarnataka.in";
const MEDIA = "https://www.bdakarnataka.in/api/media";
const page = (key: string) => `${SITE}/generalPage?sectionKey=${key}`;
const t = (en: string, kn: string): Text => ({ en, kn });

export type LinkItem = { label: Text; href: string };

export const ORG = {
  name: t("Bangalore Development Authority", "ಬೆಂಗಳೂರು ಅಭಿವೃದ್ಧಿ ಪ್ರಾಧಿಕಾರ"),
  nameKn: "ಬೆಂಗಳೂರು ಅಭಿವೃದ್ಧಿ ಪ್ರಾಧಿಕಾರ",
  govt: t("Government of Karnataka", "ಕರ್ನಾಟಕ ಸರ್ಕಾರ"),
  helpline: "+91-9483166622",
  email: "bda.helpline2025@gmail.com",
  address: t(
    "BDA Head Office, T. Chowdaiah Road, Kumara Park West, Bengaluru 560020",
    "ಬಿಡಿಎ ಕೇಂದ್ರ ಕಚೇರಿ, ಟಿ. ಚೌಡಯ್ಯ ರಸ್ತೆ, ಕುಮಾರ ಪಾರ್ಕ್ ಪಶ್ಚಿಮ, ಬೆಂಗಳೂರು 560020",
  ),
};

export const LEADERS = {
  left: {
    name: t("Shri D. K. Shivakumar", "ಶ್ರೀ ಡಿ.ಕೆ. ಶಿವಕುಮಾರ್"),
    title: t("Hon'ble Chief Minister, Government of Karnataka", "ಮಾನ್ಯ ಮುಖ್ಯಮಂತ್ರಿಗಳು, ಕರ್ನಾಟಕ ಸರ್ಕಾರ"),
    photo: "images/cm.jpg",
  },
  right: {
    name: t("Shri N. A. Haris, MLA", "ಶ್ರೀ ಎನ್.ಎ.ಹ್ಯಾರಿಸ್, ಶಾಸಕರು"),
    title: t("Chairman, BDA", "ಅಧ್ಯಕ್ಷರು, ಬಿಡಿಎ"),
    photo: "images/chairman.jpg",
  },
};

export type NavItem = LinkItem & { children?: LinkItem[] };

export const NAV: NavItem[] = [
  {
    label: t("About Us", "ನಮ್ಮ ಬಗ್ಗೆ"),
    href: `${SITE}/about-us`,
    children: [
      { label: t("Vision and Mission", "ದೃಷ್ಟಿಕೋನ ಮತ್ತು ಗುರಿ"), href: `${SITE}/about-us` },
      { label: t("About BDA", "ನಮ್ಮ ಬಗ್ಗೆ (BDA)"), href: `${SITE}/about-us` },
      { label: t("Acts and Rules", "ಕಾಯ್ದೆಗಳು ಮತ್ತು ನಿಯಮಗಳು"), href: `${SITE}/about-us` },
      { label: t("Contact Us", "ಸಂಪರ್ಕಿಸಿ"), href: `${SITE}/contact` },
    ],
  },
  {
    label: t("Departments", "ವಿಭಾಗಗಳು"),
    href: `${SITE}/section-layout`,
    children: [
      { label: t("Administration", "ಆಡಳಿತ"), href: `${SITE}/section-layout` },
      { label: t("CA & TDR", "CA ಮತ್ತು TDR"), href: `${SITE}/section-layout` },
      { label: t("EDP Cell", "ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಡೇಟಾ ಸಂಸ್ಕರಣಾ ಕೋಶ"), href: `${SITE}/section-layout` },
      { label: t("Engineering", "ಎಂಜಿನಿಯರಿಂಗ್"), href: `${SITE}/section-layout` },
      { label: t("Finance", "ಹಣಕಾಸು"), href: `${SITE}/section-layout` },
      { label: t("Forest", "ಅರಣ್ಯ"), href: `${SITE}/section-layout` },
      { label: t("Horticulture", "ತೋಟಗಾರಿಕೆ"), href: `${SITE}/section-layout` },
      { label: t("Land Acquisition", "ಭೂಸ್ವಾಧೀನ"), href: `${SITE}/section-layout` },
    ],
  },
  {
    label: t("E-Auction", "ಇ-ಹರಾಜು"),
    href: `${SITE}/e-auction`,
    children: [
      { label: t("E-Auction Portal", "ಇ-ಹರಾಜು ಪೋರ್ಟಲ್"), href: "https://eauctions.bdakarnataka.in/" },
      { label: t("E-Auction Notifications", "ಇ-ಹರಾಜು ಅಧಿಸೂಚನೆಗಳು"), href: `${SITE}/e-auction` },
      {
        label: t("E-Auction FAQs", "ಇ-ಹರಾಜು ಪ್ರಶ್ನೋತ್ತರಗಳು"),
        href: `${MEDIA}/e-auction/pdf_press_release/E-Auction_FAQs_1784284502219_90d0f28f.pdf`,
      },
    ],
  },
  {
    label: t("BDA Layouts", "ಬಿಡಿಎ ಬಡಾವಣೆಗಳು"),
    href: `${SITE}/bda-layout`,
    children: [
      { label: t("BDA Approved Layouts", "ಬಿಡಿಎ ಅನುಮೋದಿತ ವಿನ್ಯಾಸಗಳು"), href: `${SITE}/bda-layout` },
      { label: t("Unauthorized Layouts", "ಅನಧಿಕೃತ ವಿನ್ಯಾಸಗಳು"), href: `${SITE}/bda-layout` },
      { label: t("Flats Layout Plan", "ಫ್ಲಾಟ್‌ಗಳ ಲೇಔಟ್ ಯೋಜನೆ"), href: `${SITE}/bda-layout` },
      { label: t("DSKL Layout Plan", "ಡಿ.ಎಸ್.ಕೆ.ಎಲ್ ಲೇಔಟ್ ಯೋಜನೆ"), href: `${SITE}/bda-layout` },
      { label: t("NPKL Layout Plan", "ಎನ್‌.ಪಿ.ಕೆ.ಎಲ್ ಲೇಔಟ್ ಯೋಜನೆ"), href: `${SITE}/bda-layout` },
      { label: t("BDA Zone Plan", "ಬಿಡಿಎ ವಲಯ ಯೋಜನೆ"), href: `${SITE}/bda-layout` },
    ],
  },
  { label: t("Gallery", "ಗ್ಯಾಲರಿ"), href: `${SITE}/photo-gallery` },
  {
    label: t("Online Services", "ಆನ್‌ಲೈನ್ ಸೇವೆಗಳು"),
    href: `${SITE}/online-services`,
    children: [
      { label: t("Sakala Services", "ಸಕಾಲ ಸೇವೆಗಳು"), href: "https://sakala.kar.nic.in/procedure.aspx" },
      { label: t("Housing (Flats & Villas)", "ವಸತಿ (ಫ್ಲಾಟ್‌ಗಳು ಮತ್ತು ವಿಲ್ಲಾಗಳು)"), href: "https://housing.bdabangalore.org/" },
      { label: t("BDA Property Tax Portal", "ಬಿಡಿಎ ಆಸ್ತಿ ತೆರಿಗೆ ಪೋರ್ಟಲ್"), href: "https://app.bda.karnataka.gov.in/bdaptax-citizen/login" },
      { label: t("Public Grievance", "ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆಗಳು"), href: "https://grievance.bdakarnataka.in/" },
      { label: t("Seva Sindhu", "ಸೇವಾ ಸಿಂಧು"), href: "https://sevaone.karnataka.gov.in/services" },
    ],
  },
  { label: t("RTI", "ಆರ್‌ಟಿಐ"), href: `${SITE}/rti` },
  { label: t("CA Site", "ಸಿಎ ನಿವೇಶನ"), href: `${SITE}/casite` },
  { label: t("CDRMS", "ಸಿಡಿಆರ್‌ಎಂಎಸ್"), href: `${SITE}/cdrms/admin/login` },
];

export const QUICK_STRIP: LinkItem[] = [
  { label: t("Stray Sites", "ಬಿಡಿ ನಿವೇಶನಗಳ ವಿವರ"), href: `${SITE}/stray-sites` },
  { label: t("Property Tax Calculator", "ಆಸ್ತಿ ತೆರಿಗೆ ಕ್ಯಾಲ್ಕುಲೇಟರ್"), href: `${SITE}/ptcalculator` },
  { label: t("Bengaluru Business Corridor", "ಬೆಂಗಳೂರು ಬಿಸಿನೆಸ್ ಕಾರಿಡಾರ್"), href: "https://bengalurubusinesscorridor.com/" },
  { label: t("Jurisdiction Map", "ವ್ಯಾಪ್ತಿ ನಕ್ಷೆ"), href: `${SITE}/jurisdiction-map` },
  { label: t("Contact Us", "ಸಂಪರ್ಕಿಸಿ"), href: `${SITE}/contact` },
  { label: t("DSKL JCC Information", "ಡಿ ಎಸ್ ಕೆ ಎಲ್ ಜೆಸಿಸಿ ಮಾಹಿತಿ"), href: page("dskl-jcc-information") },
  { label: t("Commissioner's Corner", "ಕಮಿಷನರ್ ಕಾರ್ನರ್"), href: page("commissioners-corner") },
  { label: t("Ease of Doing Business", "ವ್ಯವಹಾರ ಮಾಡಲು ಸುಲಭತೆ"), href: page("ease-of-doing-business") },
  { label: t("BDA Formed Layouts", "ಬಿಡಿಎ ರಚಿಸಿದ ಬಡಾವಣೆಗಳು"), href: page("formed-layouts") },
  { label: t("Property Tax Payment", "ಆಸ್ತಿ ತೆರಿಗೆ ಪಾವತಿ"), href: page("property-tax-payment") },
  { label: t("BDA Flats/Villas", "ಬಿಡಿಎ ಫ್ಲಾಟ್‌ಗಳು/ವಿಲ್ಲಾಗಳು"), href: page("bda-flatsvillas-booking") },
  { label: t("BDA Formed Layouts South Zone", "ಬಿಡಿಎ ರಚಿಸಿದ ವಿನ್ಯಾಸಗಳು ದಕ್ಷಿಣ ವಲಯ"), href: page("bda-formed-layouts-south-zone") },
];

export const OPEN_HOUSE: LinkItem = {
  label: t("Open House Invitee List", "ಓಪನ್ ಹೌಸ್‌ ಆಹ್ವಾನಿತರ ಪಟ್ಟಿ"),
  href: `${SITE}/invitee-list`,
};

export const HERO = {
  eyebrow: t("Bangalore Development Authority", "ಬೆಂಗಳೂರು ಅಭಿವೃದ್ಧಿ ಪ್ರಾಧಿಕಾರ"),
  title: t("Shaping Bengaluru for a Better Tomorrow", "ಉತ್ತಮ ನಾಳೆಗಾಗಿ ಬೆಂಗಳೂರನ್ನು ರೂಪಿಸುತ್ತಿದ್ದೇವೆ"),
  tagline: t("ಯೋಜಿತ ಅಭಿವೃದ್ಧಿ, ಉತ್ತಮ ಬೆಂಗಳೂರು", "Planned development for a better Bengaluru"),
};

export type HeroFeature = "planned" | "growth" | "amenities" | "future";

export const HERO_FEATURES: { icon: HeroFeature; label: Text }[] = [
  { icon: "planned", label: t("Planned Development", "ಯೋಜಿತ ಅಭಿವೃದ್ಧಿ") },
  { icon: "growth", label: t("Sustainable Growth", "ಸುಸ್ಥಿರ ಬೆಳವಣಿಗೆ") },
  { icon: "amenities", label: t("Better Civic Amenities", "ಉತ್ತಮ ನಾಗರಿಕ ಸೌಲಭ್ಯಗಳು") },
  { icon: "future", label: t("Future Ready Bengaluru", "ಭವಿಷ್ಯಕ್ಕೆ ಸಿದ್ಧ ಬೆಂಗಳೂರು") },
];


export const PILLARS: Text[] = [
  t("Land", "ಭೂಮಿ"),
  t("Infrastructure", "ಮೂಲಸೌಕರ್ಯ"),
  t("Housing", "ವಸತಿ"),
  t("Civic Amenities", "ನಾಗರಿಕ ಸೌಲಭ್ಯಗಳು"),
  t("Sustainable Growth", "ಸುಸ್ಥಿರ ಬೆಳವಣಿಗೆ"),
];

export type ValueKey = "citizen" | "sustainable" | "transparent" | "future";

export const VALUES: { key: ValueKey; label: Text }[] = [
  { key: "citizen", label: t("Citizen Centric", "ನಾಗರಿಕ ಕೇಂದ್ರಿತ") },
  { key: "sustainable", label: t("Sustainable", "ಸುಸ್ಥಿರ") },
  { key: "transparent", label: t("Transparent", "ಪಾರದರ್ಶಕ") },
  { key: "future", label: t("Future Ready", "ಭವಿಷ್ಯಕ್ಕೆ ಸಿದ್ಧ") },
];

export const BUILDING = t(
  "Building a Planned, Sustainable and Inclusive Bengaluru",
  "ಯೋಜಿತ, ಸುಸ್ಥಿರ ಮತ್ತು ಎಲ್ಲರನ್ನೂ ಒಳಗೊಂಡ ಬೆಂಗಳೂರಿನ ನಿರ್ಮಾಣ",
);

export const LAYOUT_PINS: { label: Text; area: Text; lat: number; lng: number }[] = [
  { label: t("BDA Head Office", "ಬಿಡಿಎ ಕೇಂದ್ರ ಕಚೇರಿ"), area: t("Kumara Park West", "ಕುಮಾರ ಪಾರ್ಕ್ ಪಶ್ಚಿಮ"), lat: 12.9957, lng: 77.5777 },
  { label: t("Dr. K. Shivarama Karanth Layout", "ಡಾ. ಕೆ. ಶಿವರಾಮ ಕಾರಂತ ಬಡಾವಣೆ"), area: t("North, off Doddaballapur Road", "ಉತ್ತರ, ದೊಡ್ಡಬಳ್ಳಾಪುರ ರಸ್ತೆ"), lat: 13.105, lng: 77.535 },
  { label: t("Arkavathy Layout", "ಅರ್ಕಾವತಿ ಬಡಾವಣೆ"), area: t("North-East, Thanisandra", "ಈಶಾನ್ಯ, ಥಣಿಸಂದ್ರ"), lat: 13.075, lng: 77.625 },
  { label: t("Nadaprabhu Kempegowda Layout", "ನಾಡಪ್ರಭು ಕೆಂಪೇಗೌಡ ಬಡಾವಣೆ"), area: t("West, between Magadi and Mysuru Roads", "ಪಶ್ಚಿಮ, ಮಾಗಡಿ ಮತ್ತು ಮೈಸೂರು ರಸ್ತೆಗಳ ನಡುವೆ"), lat: 12.955, lng: 77.445 },
  { label: t("HSR Layout", "ಎಚ್‌ಎಸ್‌ಆರ್ ಬಡಾವಣೆ"), area: t("South-East", "ಆಗ್ನೇಯ"), lat: 12.9116, lng: 77.6389 },
  { label: t("Banashankari 6th Stage", "ಬನಶಂಕರಿ 6ನೇ ಹಂತ"), area: t("South-West, Kanakapura Road side", "ನೈಋತ್ಯ, ಕನಕಪುರ ರಸ್ತೆ ಕಡೆ"), lat: 12.889, lng: 77.525 },
  { label: t("Anjanapura Layout", "ಅಂಜನಾಪುರ ಬಡಾವಣೆ"), area: t("South, off Kanakapura Road", "ದಕ್ಷಿಣ, ಕನಕಪುರ ರಸ್ತೆ"), lat: 12.858, lng: 77.56 },
];

export type HighlightKey = "helpline" | "grievance" | "green" | "allotment" | "press" | "news";

export const HIGHLIGHTS: { key: HighlightKey; title: Text; sub: Text; href: string; isNew?: boolean }[] = [
  { key: "helpline", title: t("24x7 Helpline", "24x7 ಸಹಾಯವಾಣಿ"), sub: t(ORG.helpline, ORG.helpline), href: "tel:+919483166622" },
  {
    key: "grievance",
    title: t("Raise Your Grievance Here", "ನಿಮ್ಮ ದೂರುಗಳನ್ನು ಇಲ್ಲಿ ಸಲ್ಲಿಸಿ"),
    sub: t("BDA Public Grievance Redressal System", "ಬಿಡಿಎ ಸಾರ್ವಜನಿಕ ದೂರು ಪರಿಹಾರ ವ್ಯವಸ್ಥೆ"),
    href: "https://grievance.bdakarnataka.in/",
  },
  {
    key: "green",
    title: t("Green Bengaluru by BDA", "ಹಸಿರು ಬೆಂಗಳೂರು - ಬಿಡಿಎ"),
    sub: t("15 Lakh Planting Initiative, Govt. of Karnataka", "೧೫ ಲಕ್ಷ ಗಿಡ ನೆಡುವ ಉಪಕ್ರಮ, ಕರ್ನಾಟಕ ಸರ್ಕಾರ"),
    href: "https://greenbengalurubybda.in/cr",
  },
  {
    key: "allotment",
    title: t("Application for Allotment of BDA Sites", "ಬಿಡಿಎ ನಿವೇಶನಗಳ ಹಂಚಿಕೆಗಾಗಿ ಅರ್ಜಿ"),
    sub: t("Dr. K. Shivarama Karanth Layout", "ಡಾ. ಕೆ. ಶಿವರಾಮ ಕಾರಂತ ಬಡಾವಣೆ"),
    href: `${SITE}/shivaramakarnatha-layout`,
    isNew: true,
  },
  { key: "press", title: t("Press Releases", "ಮಾಧ್ಯಮ ಪ್ರಕಟಣೆಗಳು"), sub: t("Official updates", "ಅಧಿಕೃತ ಮಾಹಿತಿ"), href: `${SITE}/pressrelease` },
  {
    key: "news",
    title: t("Latest News & Events", "ಇತ್ತೀಚಿನ ಸುದ್ದಿಗಳು ಮತ್ತು ಕಾರ್ಯಕ್ರಮಗಳು"),
    sub: t("Stay updated with the latest announcements", "ಇತ್ತೀಚಿನ ಪ್ರಕಟಣೆಗಳನ್ನು ತಿಳಿದುಕೊಳ್ಳಿ"),
    href: `${SITE}/news`,
  },
];

export type ServiceIcon =
  | "auction" | "layouts" | "online" | "rti" | "casite" | "cdrms" | "calculator" | "corridor" | "map" | "contact"
  | "stray" | "jcc" | "commissioner" | "business" | "tax" | "flats" | "formed" | "south" | "gallery" | "more";

export const SERVICES: (LinkItem & { icon: ServiceIcon })[] = [
  { icon: "auction", label: t("E-Auction", "ಇ-ಹರಾಜು"), href: `${SITE}/e-auction` },
  { icon: "layouts", label: t("BDA Layouts", "ಬಿಡಿಎ ಬಡಾವಣೆಗಳು"), href: `${SITE}/bda-layout` },
  { icon: "online", label: t("Online Services", "ಆನ್‌ಲೈನ್ ಸೇವೆಗಳು"), href: `${SITE}/online-services` },
  { icon: "rti", label: t("RTI", "ಆರ್‌ಟಿಐ"), href: `${SITE}/rti` },
  { icon: "casite", label: t("CA Site", "ಸಿಎ ನಿವೇಶನ"), href: `${SITE}/casite` },
  { icon: "cdrms", label: t("CDRMS", "ಸಿಡಿಆರ್‌ಎಂಎಸ್"), href: `${SITE}/cdrms/admin/login` },
  { icon: "calculator", label: t("Property Tax Calculator", "ಆಸ್ತಿ ತೆರಿಗೆ ಕ್ಯಾಲ್ಕುಲೇಟರ್"), href: `${SITE}/ptcalculator` },
  { icon: "corridor", label: t("Bengaluru Business Corridor", "ಬೆಂಗಳೂರು ಬಿಸಿನೆಸ್ ಕಾರಿಡಾರ್"), href: "https://bengalurubusinesscorridor.com/" },
  { icon: "map", label: t("Jurisdiction Map", "ವ್ಯಾಪ್ತಿ ನಕ್ಷೆ"), href: `${SITE}/jurisdiction-map` },
  { icon: "contact", label: t("Contact Us", "ಸಂಪರ್ಕಿಸಿ"), href: `${SITE}/contact` },
  { icon: "stray", label: t("Stray Sites", "ಬಿಡಿ ನಿವೇಶನಗಳ ವಿವರ"), href: `${SITE}/stray-sites` },
  { icon: "jcc", label: t("DSKL JCC Information", "ಡಿ ಎಸ್ ಕೆ ಎಲ್ ಜೆಸಿಸಿ ಮಾಹಿತಿ"), href: page("dskl-jcc-information") },
  { icon: "commissioner", label: t("Commissioner's Corner", "ಕಮಿಷನರ್ ಕಾರ್ನರ್"), href: page("commissioners-corner") },
  { icon: "business", label: t("Ease of Doing Business", "ವ್ಯವಹಾರ ಮಾಡಲು ಸುಲಭತೆ"), href: page("ease-of-doing-business") },
  { icon: "tax", label: t("Property Tax Payment", "ಆಸ್ತಿ ತೆರಿಗೆ ಪಾವತಿ"), href: page("property-tax-payment") },
  { icon: "flats", label: t("BDA Flats/Villas", "ಬಿಡಿಎ ಫ್ಲಾಟ್‌ಗಳು/ವಿಲ್ಲಾಗಳು"), href: page("bda-flatsvillas-booking") },
  { icon: "formed", label: t("BDA Formed Layouts", "ಬಿಡಿಎ ರಚಿಸಿದ ಬಡಾವಣೆಗಳು"), href: page("formed-layouts") },
  { icon: "south", label: t("BDA Formed Layouts South Zone", "ಬಿಡಿಎ ರಚಿಸಿದ ವಿನ್ಯಾಸಗಳು ದಕ್ಷಿಣ ವಲಯ"), href: page("bda-formed-layouts-south-zone") },
  { icon: "gallery", label: t("Gallery", "ಗ್ಯಾಲರಿ"), href: `${SITE}/photo-gallery` },
  { icon: "more", label: t("More Services", "ಇನ್ನಷ್ಟು ಸೇವೆಗಳು"), href: `${SITE}/online-services` },
];

export type AnnouncementTab = "all" | "notice" | "eauction" | "report";

export const ANNOUNCEMENT_TABS: { key: AnnouncementTab; label: Text }[] = [
  { key: "all", label: t("All", "ಎಲ್ಲಾ") },
  { key: "notice", label: t("Notifications", "ಅಧಿಸೂಚನೆಗಳು") },
  { key: "eauction", label: t("E-Auction", "ಇ-ಹರಾಜು") },
  { key: "report", label: t("Reports", "ವರದಿಗಳು") },
];

export const ANNOUNCEMENTS: { date: string; tab: Exclude<AnnouncementTab, "all">; title: Text; href: string; pdf?: boolean }[] = [
  {
    date: "2026-10-12",
    tab: "eauction",
    title: t("E-Auction Notification, bids open till 04/11/2026", "ಇ-ಹರಾಜು ಅಧಿಸೂಚನೆ, ಬಿಡ್ ಸಲ್ಲಿಕೆ 04/11/2026 ರವರೆಗೆ"),
    href: `${MEDIA}/e-auction/pdf_press_release/e_auction-12102026_1791186164533_0e517992.pdf`,
    pdf: true,
  },
  {
    date: "2026-10-07",
    tab: "report",
    title: t("Dr. K. Shivarama Karanth Layout Report", "ಡಾ. ಕೆ. ಶಿವರಾಮ ಕಾರಂತ ಬಡಾವಣೆ ವರದಿ"),
    href: `${MEDIA}/dskl_reports/pdf/07-10-2026_1791359825042_1fee092a.pdf`,
    pdf: true,
  },
  {
    date: "2026-09-28",
    tab: "eauction",
    title: t("E-Auction Notification and geo-tag of sites, till 15/10/2026", "ಇ-ಹರಾಜು ಅಧಿಸೂಚನೆ ಮತ್ತು ತಾಣಗಳ ಜಿಯೋ-ಟ್ಯಾಗ್, 15/10/2026 ರವರೆಗೆ"),
    href: `${MEDIA}/e-auction/pdf_press_release/BDA_eAuction_Handbook_1791097686360_b4bdc278.pdf`,
    pdf: true,
  },
  {
    date: "2026-09-21",
    tab: "eauction",
    title: t("E-Auction Notification: Bulk Land", "ಇ-ಹರಾಜು ಅಧಿಸೂಚನೆ: ಬೃಹತ್ ಭೂಮಿ"),
    href: `${MEDIA}/e-auction/pdf_press_release/1297_Bulk_Land_11.09.2026_Color_Eng_1789540577886_2ac8a957.pdf`,
    pdf: true,
  },
  {
    date: "2026-09-15",
    tab: "notice",
    title: t(
      "Application for allotment of BDA sites in Dr. K. Shivarama Karanth Layout",
      "ಡಾ. ಕೆ. ಶಿವರಾಮ ಕಾರಂತ ಬಡಾವಣೆಯಲ್ಲಿ ಬಿಡಿಎ ನಿವೇಶನಗಳ ಹಂಚಿಕೆಗಾಗಿ ಅರ್ಜಿ",
    ),
    href: "https://sevasindhuservices.karnataka.gov.in/directApply.do?serviceId=2098",
  },
  {
    date: "2026-08-17",
    tab: "report",
    title: t(
      "IISc Technical Inspection Report of Nadaprabhu Kempegowda Layout",
      "ನಾಡಪ್ರಭು ಕೆಂಪೇಗೌಡ ಬಡಾವಣೆಯ IISc ತಾಂತ್ರಿಕ ಪರಿಶೀಲನಾ ವರದಿ",
    ),
    href: `${MEDIA}/bda-layouts/pdf_press_release/BDA_Report_July_2026_final_SK_1786968096162_85b29f84.pdf`,
    pdf: true,
  },
  {
    date: "2026-08-15",
    tab: "notice",
    title: t("DSKL land losers allotment information (40:60 scheme)", "ಡಿ.ಎಸ್.ಕೆ.ಎಲ್ ಭೂಮಾಲೀಕರ ಹಂಚಿಕೆ ಮಾಹಿತಿ (40:60 ಯೋಜನೆ)"),
    href: `${MEDIA}/bda-layouts/pdf_press_release/DSKL_Land_Loosers_Allotment_Information_1787561383008_096a15fe.pdf`,
    pdf: true,
  },
];

export const EAUCTION_LINKS: LinkItem[] = [
  { label: t("Bid on the E-Auction Portal", "ಇ-ಹರಾಜು ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಬಿಡ್ ಮಾಡಿ"), href: "https://eauctions.bdakarnataka.in/" },
  { label: t("Latest Notification (12/10/2026)", "ಇತ್ತೀಚಿನ ಅಧಿಸೂಚನೆ (12/10/2026)"), href: ANNOUNCEMENTS[0].href },
  { label: t("Geo-tag of E-Auction Sites", "ಇ-ಹರಾಜು ತಾಣಗಳ ಜಿಯೋ-ಟ್ಯಾಗ್"), href: ANNOUNCEMENTS[2].href },
  { label: t("All E-Auction Notifications", "ಎಲ್ಲಾ ಇ-ಹರಾಜು ಅಧಿಸೂಚನೆಗಳು"), href: `${SITE}/e-auction` },
  { label: t("E-Auction FAQs", "ಇ-ಹರಾಜು ಪ್ರಶ್ನೋತ್ತರಗಳು"), href: `${MEDIA}/e-auction/pdf_press_release/E-Auction_FAQs_1784284502219_90d0f28f.pdf` },
];

export const LAYOUT_LINKS: LinkItem[] = [
  {
    label: t("Layouts Approved by BDA (2025)", "ಬಿಡಿಎ 2025 ರಲ್ಲಿ ಅನುಮೋದಿಸಿದ ವಿನ್ಯಾಸಗಳು"),
    href: `${MEDIA}/bda-layouts/pdf_press_release/List_of_layouts_approved_by_BDA_2025_English_1766387176971_61a55eba.pdf`,
  },
  {
    label: t("Unauthorized Layouts List", "ಅನಧಿಕೃತ ವಿನ್ಯಾಸಗಳ ಪಟ್ಟಿ"),
    href: `${MEDIA}/bda-layouts/pdf_press_release/BDA-Unauthorized_layout_List_1766387420417_e352f364.pdf`,
  },
  {
    label: t("DSKL Comprehensive Layout Plan", "ಡಿ.ಎಸ್.ಕೆ.ಎಲ್ ಸಮಗ್ರ ಲೇಔಟ್ ಯೋಜನೆ"),
    href: `${MEDIA}/bda-layouts/pdf_press_release/DSKL_Comprehensive_layout_plan_compressed_(1)_1770965896004_d547bafa.pdf`,
  },
  {
    label: t("NPKL Scheme Plan", "ಎನ್‌ಪಿಕೆಎಲ್ ಯೋಜನಾ ವಿವರ"),
    href: `${MEDIA}/bda-layouts/pdf_press_release/npkl_scheme_plan_1771407552244_03b97738.pdf`,
  },
  {
    label: t("BDA Zones Map", "ಬಿಡಿಎ ವಲಯಗಳ ನಕ್ಷೆ"),
    href: `${MEDIA}/bda-layouts/pdf_press_release/BDA_ZONE_MAP_1772690718245_827cc2bb.pdf`,
  },
];

export type OnlineIcon = "gis" | "sakala" | "housing" | "ptax" | "betterment" | "rti" | "seva" | "more";

export const ONLINE_SERVICES: (LinkItem & { icon: OnlineIcon })[] = [
  { icon: "gis", label: t("GIS Information", "GIS ಮಾಹಿತಿ"), href: "https://gisbda.karnataka.gov.in/BDALandManagement/gisapplication/login.jsp" },
  { icon: "sakala", label: t("Sakala Services", "ಸಕಾಲ ಸೇವೆಗಳು"), href: "https://sakala.kar.nic.in/procedure.aspx" },
  { icon: "housing", label: t("Housing (Flats & Villas)", "ವಸತಿ (ಫ್ಲಾಟ್‌ಗಳು ಮತ್ತು ವಿಲ್ಲಾಗಳು)"), href: "https://housing.bdabangalore.org/" },
  { icon: "ptax", label: t("BDA Property Tax Portal", "ಬಿಡಿಎ ಆಸ್ತಿ ತೆರಿಗೆ ಪೋರ್ಟಲ್"), href: "https://app.bda.karnataka.gov.in/bdaptax-citizen/login" },
  { icon: "betterment", label: t("DSKL Betterment Tax Payment", "DSKL ಉತ್ತಮೀಕರಣ ತೆರಿಗೆ ಪಾವತಿ"), href: "https://app.bda.karnataka.gov.in/bdabt-citizen/login" },
  { icon: "rti", label: t("Online RTI Application", "ಆನ್‌ಲೈನ್ ಆರ್‌ಟಿಐ ಅರ್ಜಿ"), href: "https://rtionline.karnataka.gov.in/" },
  { icon: "seva", label: t("Seva Sindhu", "ಸೇವಾ ಸಿಂಧು"), href: "https://sevaone.karnataka.gov.in/services" },
  { icon: "more", label: t("More Services", "ಇನ್ನಷ್ಟು ಸೇವೆಗಳು"), href: `${SITE}/online-services` },
];

export type QuickIcon = "acts" | "zone" | "tender" | "faq" | "rti" | "grievance" | "map" | "gallery";

export const QUICK_LINKS: (LinkItem & { icon: QuickIcon })[] = [
  { icon: "acts", label: t("Acts & Rules", "ಕಾಯ್ದೆಗಳು ಮತ್ತು ನಿಯಮಗಳು"), href: `${SITE}/about-us` },
  { icon: "zone", label: t("BDA Zones Map", "ಬಿಡಿಎ ವಲಯಗಳ ನಕ್ಷೆ"), href: LAYOUT_LINKS[4].href },
  { icon: "tender", label: t("Tenders", "ಟೆಂಡರ್‌ಗಳು"), href: `${SITE}/tender` },
  { icon: "faq", label: t("E-Auction FAQs", "ಇ-ಹರಾಜು ಪ್ರಶ್ನೋತ್ತರಗಳು"), href: EAUCTION_LINKS[4].href },
  { icon: "rti", label: t("RTI Information", "ಆರ್‌ಟಿಐ ಮಾಹಿತಿ"), href: `${SITE}/rti` },
  { icon: "grievance", label: t("Grievance Redressal", "ಕುಂದುಕೊರತೆ ಪರಿಹಾರ"), href: "https://grievance.bdakarnataka.in/" },
  { icon: "map", label: t("Jurisdiction Map", "ವ್ಯಾಪ್ತಿ ನಕ್ಷೆ"), href: `${SITE}/jurisdiction-map` },
  { icon: "gallery", label: t("Photo Gallery", "ಫೋಟೋ ಗ್ಯಾಲರಿ"), href: `${SITE}/photo-gallery` },
];

export const NEWS: { date: string; kind: Text; title: Text; href: string }[] = [
  {
    date: "2026-02-21",
    kind: t("News", "ಸುದ್ದಿ"),
    title: t(
      "Provisional selection list for First Division Assistant posts withdrawn for re-issue",
      "ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರ ತಾತ್ಕಾಲಿಕ ಆಯ್ಕೆ ಪಟ್ಟಿ ಮರು ಪ್ರಕಟಣೆಗಾಗಿ ಹಿಂಪಡೆಯಲಾಗಿದೆ",
    ),
    href: `${SITE}/news`,
  },
  {
    date: "2026-01-29",
    kind: t("Press Release", "ಪತ್ರಿಕಾ ಪ್ರಕಟಣೆ"),
    title: t("Thanisandra: removal of encroached structures", "ಥಣಿಸಂದ್ರ ಕಟ್ಟಡಗಳು ತೆರವು ಪ್ರಕರಣ"),
    href: `${MEDIA}/press-releases/pdf_press_release/Thanisandra_Removal_of_Encroached_Structure_Case_1770032138999_8b2d04ac.pdf`,
  },
  {
    date: "2026-01-06",
    kind: t("Press Release", "ಪತ್ರಿಕಾ ಪ್ರಕಟಣೆ"),
    title: t(
      "Training on administrative reforms and public grievance redressal for BDA staff concludes",
      "ಬಿಡಿಎ ಸಿಬ್ಬಂದಿಗಳಿಗೆ ಆಡಳಿತ ಸುಧಾರಣೆ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಅಹವಾಲು ನಿರ್ವಹಣೆ ತರಬೇತಿ ಮುಕ್ತಾಯ",
    ),
    href: `${MEDIA}/press-releases/pdf_press_release/Training_on_Administrative_Reforms_and_Public_Grievance_Redressal_for_BDA_Staff_Concludes_1770031889341_60dcf30a.pdf`,
  },
  {
    date: "2025-11-21",
    kind: t("News", "ಸುದ್ದಿ"),
    title: t("Official portal for BDA housing property sales is live", "ಬಿಡಿಎ ವಸತಿ ಆಸ್ತಿ ಮಾರಾಟದ ಅಧಿಕೃತ ಪೋರ್ಟಲ್ ಆರಂಭ"),
    href: "https://housing.bdabangalore.org/",
  },
];

export const ABOUT = {
  title: ORG.name,
  body: t(
    "BDA is the statutory planning and development authority for Bengaluru. It prepares the Master Plan, approves layouts, forms residential, commercial and civic sites, and builds roads, flyovers, housing and lake restoration projects for sustainable, orderly growth.",
    "ಬಿಡಿಎ ಬೆಂಗಳೂರಿನ ಕಾನೂನುಬದ್ಧ ಯೋಜನಾ ಮತ್ತು ಅಭಿವೃದ್ಧಿ ಪ್ರಾಧಿಕಾರವಾಗಿದೆ. ಮಾಸ್ಟರ್ ಪ್ಲಾನ್ ತಯಾರಿಕೆ, ವಿನ್ಯಾಸಗಳ ಅನುಮೋದನೆ, ವಸತಿ, ವಾಣಿಜ್ಯ ಮತ್ತು ನಾಗರಿಕ ನಿವೇಶನಗಳ ರಚನೆ ಹಾಗೂ ರಸ್ತೆ, ಫ್ಲೈಓವರ್, ವಸತಿ ಮತ್ತು ಕೆರೆ ಪುನರುಜ್ಜೀವನ ಯೋಜನೆಗಳ ಮೂಲಕ ವ್ಯವಸ್ಥಿತ ಬೆಳವಣಿಗೆಯನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ.",
  ),
  cta: t("Know More About BDA", "ಬಿಡಿಎ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ"),
  href: `${SITE}/about-us`,
  stats: [
    { value: "76,000+", label: t("Residential sites allotted", "ವಸತಿ ನಿವೇಶನಗಳ ಹಂಚಿಕೆ") },
    { value: "800+", label: t("Civic amenity sites", "ನಾಗರಿಕ ಸೌಲಭ್ಯ ನಿವೇಶನಗಳು") },
    { value: "10,153", label: t("Flats allotted online", "ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಹಂಚಿಕೆಯಾದ ಫ್ಲಾಟ್‌ಗಳು") },
    { value: "33,367", label: t("Sites planned in Dr. K. Shivarama Karanth Layout", "ಡಾ. ಕೆ. ಶಿವರಾಮ ಕಾರಂತ ಬಡಾವಣೆಯಲ್ಲಿ ಯೋಜಿತ ನಿವೇಶನಗಳು") },
  ],
};

export const POLICIES: Text[] = [
  t("Copyright Policy", "ಹಕ್ಕುಸ್ವಾಮ್ಯ ನೀತಿ"),
  t("Privacy Policy", "ಗೌಪ್ಯತಾ ನೀತಿ"),
  t("Hyperlinking Policy", "ಹೈಪರ್‌ಲಿಂಕ್ ನೀತಿ"),
  t("Terms & Conditions", "ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು"),
  t("Disclaimer", "ಹಕ್ಕು ನಿರಾಕರಣೆ"),
  t("Screen Reader Access", "ಸ್ಕ್ರೀನ್ ರೀಡರ್ ಪ್ರವೇಶ"),
];

export const SOCIAL = {
  youtube: "https://youtube.com/@bangloredevelopmentauthority",
  instagram: "https://www.instagram.com/bangaloredevelopmentauthority",
  x: "https://x.com/BDAOfficialGok",
  facebook: "https://www.facebook.com/share/17GYcFFjKm/",
};
