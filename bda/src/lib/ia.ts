import {
  Buildings,
  Compass,
  Desktop,
  Info,
  MapTrifold,
  Newspaper,
  TreeStructure,
  type Icon,
} from "@phosphor-icons/react";
import { ANNOUNCEMENTS, EAUCTION_LINKS, HIGHLIGHTS, LAYOUT_LINKS, ONLINE_SERVICES, OPEN_HOUSE, SERVICES, SITE, type ServiceIcon } from "@/lib/content";
import type { Text } from "@/lib/i18n";

const t = (en: string, kn: string): Text => ({ en, kn });
const svc = (icon: ServiceIcon) => SERVICES.find((s) => s.icon === icon)!.href;
const online = (icon: (typeof ONLINE_SERVICES)[number]["icon"]) => ONLINE_SERVICES.find((s) => s.icon === icon)!.href;
const highlight = (key: (typeof HIGHLIGHTS)[number]["key"]) => HIGHLIGHTS.find((h) => h.key === key)!.href;

/** `isNew` marks a page proposed by the new structure that does not exist on the live site yet; its href points to the closest live page. */
export type IaLink = { label: Text; href: string; isNew?: boolean; children?: IaLink[] };

export type AreaKey = "about" | "departments" | "services" | "property" | "planning" | "information" | "news";

export type IaArea = { key: AreaKey; label: Text; blurb: Text; icon: Icon; href: string; items: IaLink[] };

export type DeptGroup = { key: string; label: Text; departments: IaLink[] };

const DEPT = `${SITE}/section-layout`;

export const DEPARTMENT_GROUPS: DeptGroup[] = [
  {
    key: "planning",
    label: t("Planning", "ಯೋಜನೆ"),
    departments: [
      { label: t("Town Planning", "ನಗರ ಯೋಜನೆ"), href: DEPT, isNew: true },
      { label: t("Land Acquisition", "ಭೂಸ್ವಾಧೀನ"), href: DEPT },
    ],
  },
  {
    key: "development",
    label: t("Development", "ಅಭಿವೃದ್ಧಿ"),
    departments: [
      { label: t("Engineering", "ಎಂಜಿನಿಯರಿಂಗ್"), href: DEPT },
      { label: t("Forest & Horticulture", "ಅರಣ್ಯ ಮತ್ತು ತೋಟಗಾರಿಕೆ"), href: DEPT },
    ],
  },
  {
    key: "governance",
    label: t("Governance", "ಆಡಳಿತ ನಿರ್ವಹಣೆ"),
    departments: [
      { label: t("Administration", "ಆಡಳಿತ"), href: DEPT },
      { label: t("Finance", "ಹಣಕಾಸು"), href: DEPT },
      { label: t("Law", "ಕಾನೂನು"), href: DEPT, isNew: true },
    ],
  },
  {
    key: "support",
    label: t("Support & Public", "ಬೆಂಬಲ ಮತ್ತು ಸಾರ್ವಜನಿಕ"),
    departments: [
      { label: t("Public Relations", "ಸಾರ್ವಜನಿಕ ಸಂಪರ್ಕ"), href: DEPT, isNew: true },
      { label: t("EDP / IT", "ಇಡಿಪಿ / ಐಟಿ"), href: DEPT },
      { label: t("Vigilance / Special Task Force", "ಜಾಗೃತ / ವಿಶೇಷ ಕಾರ್ಯಪಡೆ"), href: DEPT, isNew: true },
      { label: t("Estate", "ಎಸ್ಟೇಟ್"), href: DEPT, isNew: true },
      { label: t("CA & TDR", "CA ಮತ್ತು TDR"), href: DEPT },
    ],
  },
];

export const ZONES: IaLink[] = [
  { label: t("North Zone", "ಉತ್ತರ ವಲಯ"), href: DEPT, isNew: true },
  { label: t("South Zone", "ದಕ್ಷಿಣ ವಲಯ"), href: DEPT, isNew: true },
  { label: t("East Zone", "ಪೂರ್ವ ವಲಯ"), href: DEPT, isNew: true },
  { label: t("West Zone", "ಪಶ್ಚಿಮ ವಲಯ"), href: DEPT, isNew: true },
  { label: t("Project Offices", "ಯೋಜನಾ ಕಚೇರಿಗಳು"), href: DEPT, isNew: true },
];

export const AREAS: IaArea[] = [
  {
    key: "about",
    label: t("About BDA", "ಬಿಡಿಎ ಬಗ್ಗೆ"),
    blurb: t("Who we are, our leadership and how BDA is organised.", "ನಾವು ಯಾರು, ನಮ್ಮ ನಾಯಕತ್ವ ಮತ್ತು ಬಿಡಿಎ ಸಂಘಟನೆ."),
    icon: Buildings,
    href: `${SITE}/about-us`,
    items: [
      { label: t("About Us", "ನಮ್ಮ ಬಗ್ಗೆ"), href: `${SITE}/about-us` },
      { label: t("Vision and Mission", "ದೃಷ್ಟಿಕೋನ ಮತ್ತು ಗುರಿ"), href: `${SITE}/about-us` },
      { label: t("Leadership", "ನಾಯಕತ್ವ"), href: `${SITE}/about-us`, isNew: true },
      { label: t("Commissioner's Corner", "ಕಮಿಷನರ್ ಕಾರ್ನರ್"), href: svc("commissioner") },
      { label: t("Organisation", "ಸಂಘಟನೆ"), href: `${SITE}/about-us`, isNew: true },
      { label: t("Acts and Rules", "ಕಾಯ್ದೆಗಳು ಮತ್ತು ನಿಯಮಗಳು"), href: `${SITE}/about-us` },
      { label: t("Contact Us", "ಸಂಪರ್ಕಿಸಿ"), href: svc("contact") },
    ],
  },
  {
    key: "departments",
    label: t("Departments", "ವಿಭಾಗಗಳು"),
    blurb: t("Functional departments, zonal offices and project teams.", "ಕಾರ್ಯ ವಿಭಾಗಗಳು, ವಲಯ ಕಚೇರಿಗಳು ಮತ್ತು ಯೋಜನಾ ತಂಡಗಳು."),
    icon: TreeStructure,
    href: DEPT,
    items: [...DEPARTMENT_GROUPS.flatMap((g) => g.departments), { label: t("Zones & Project Offices", "ವಲಯಗಳು ಮತ್ತು ಯೋಜನಾ ಕಚೇರಿಗಳು"), href: DEPT, isNew: true, children: ZONES }],
  },
  {
    key: "services",
    label: t("Services", "ಸೇವೆಗಳು"),
    blurb: t("Apply, pay, track and get help online.", "ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಅರ್ಜಿ, ಪಾವತಿ, ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ ಮತ್ತು ಸಹಾಯ."),
    icon: Desktop,
    href: svc("online"),
    items: [
      { label: t("Online Services", "ಆನ್‌ಲೈನ್ ಸೇವೆಗಳು"), href: svc("online") },
      {
        label: t("Applications", "ಅರ್ಜಿಗಳು"),
        href: online("seva"),
        children: [
          { label: t("Seva Sindhu", "ಸೇವಾ ಸಿಂಧು"), href: online("seva") },
          { label: t("DSKL Site Allotment Application", "ಡಿ.ಎಸ್.ಕೆ.ಎಲ್ ನಿವೇಶನ ಹಂಚಿಕೆ ಅರ್ಜಿ"), href: highlight("allotment") },
          { label: t("Sakala Services", "ಸಕಾಲ ಸೇವೆಗಳು"), href: online("sakala") },
        ],
      },
      {
        label: t("Payments", "ಪಾವತಿಗಳು"),
        href: online("ptax"),
        children: [
          { label: t("BDA Property Tax Portal", "ಬಿಡಿಎ ಆಸ್ತಿ ತೆರಿಗೆ ಪೋರ್ಟಲ್"), href: online("ptax") },
          { label: t("DSKL Betterment Tax Payment", "DSKL ಉತ್ತಮೀಕರಣ ತೆರಿಗೆ ಪಾವತಿ"), href: online("betterment") },
        ],
      },
      {
        label: t("Property Tax", "ಆಸ್ತಿ ತೆರಿಗೆ"),
        href: svc("calculator"),
        children: [
          { label: t("Calculate Tax", "ತೆರಿಗೆ ಲೆಕ್ಕ ಹಾಕಿ"), href: svc("calculator") },
          { label: t("Pay Property Tax", "ಆಸ್ತಿ ತೆರಿಗೆ ಪಾವತಿಸಿ"), href: svc("tax") },
        ],
      },
      { label: t("Grievances", "ಕುಂದುಕೊರತೆಗಳು"), href: highlight("grievance") },
      { label: t("Track Application", "ಅರ್ಜಿ ಸ್ಥಿತಿ ಪರಿಶೀಲನೆ"), href: online("sakala"), isNew: true },
      {
        label: t("Citizen Services", "ನಾಗರಿಕ ಸೇವೆಗಳು"),
        href: svc("online"),
        children: [
          { label: t("GIS Information", "GIS ಮಾಹಿತಿ"), href: online("gis") },
          { label: t("CDRMS", "ಸಿಡಿಆರ್‌ಎಂಎಸ್"), href: svc("cdrms") },
          { label: t("Ease of Doing Business", "ವ್ಯವಹಾರ ಮಾಡಲು ಸುಲಭತೆ"), href: svc("business") },
        ],
      },
      { label: t("Other Online Services", "ಇತರ ಆನ್‌ಲೈನ್ ಸೇವೆಗಳು"), href: online("more") },
    ],
  },
  {
    key: "property",
    label: t("Property & Land", "ಆಸ್ತಿ ಮತ್ತು ಭೂಮಿ"),
    blurb: t("Layouts, sites, e-auctions, flats and villas.", "ಬಡಾವಣೆಗಳು, ನಿವೇಶನಗಳು, ಇ-ಹರಾಜು, ಫ್ಲ್ಯಾಟ್‌ಗಳು ಮತ್ತು ವಿಲ್ಲಾಗಳು."),
    icon: MapTrifold,
    href: svc("layouts"),
    items: [
      { label: t("BDA Layouts", "ಬಿಡಿಎ ಬಡಾವಣೆಗಳು"), href: svc("layouts") },
      { label: t("Formed Layouts", "ರಚಿಸಿದ ಬಡಾವಣೆಗಳು"), href: svc("formed") },
      { label: t("South Zone Layouts", "ದಕ್ಷಿಣ ವಲಯ ಬಡಾವಣೆಗಳು"), href: svc("south") },
      {
        label: t("E-Auction", "ಇ-ಹರಾಜು"),
        href: svc("auction"),
        children: [
          { label: t("Current Auctions", "ಪ್ರಸ್ತುತ ಹರಾಜುಗಳು"), href: EAUCTION_LINKS[0].href },
          { label: t("Upcoming Auctions", "ಮುಂಬರುವ ಹರಾಜುಗಳು"), href: svc("auction"), isNew: true },
          { label: t("Auction Notifications", "ಹರಾಜು ಅಧಿಸೂಚನೆಗಳು"), href: svc("auction") },
          { label: t("Search / View Sites", "ನಿವೇಶನಗಳ ಹುಡುಕಾಟ"), href: EAUCTION_LINKS[0].href, isNew: true },
          { label: t("Site Details", "ನಿವೇಶನದ ವಿವರಗಳು"), href: EAUCTION_LINKS[0].href, isNew: true },
          { label: t("Geo-tag / Location", "ಜಿಯೋ-ಟ್ಯಾಗ್ / ಸ್ಥಳ"), href: EAUCTION_LINKS[2].href },
          { label: t("Terms & Conditions", "ನಿಯಮಗಳು ಮತ್ತು ಷರತ್ತುಗಳು"), href: svc("auction"), isNew: true },
          { label: t("Forms / Documents", "ನಮೂನೆಗಳು / ದಾಖಲೆಗಳು"), href: svc("auction"), isNew: true },
          { label: t("Auction Results", "ಹರಾಜು ಫಲಿತಾಂಶಗಳು"), href: svc("auction"), isNew: true },
          { label: t("E-Auction FAQs", "ಇ-ಹರಾಜು ಪ್ರಶ್ನೋತ್ತರಗಳು"), href: EAUCTION_LINKS[4].href },
        ],
      },
      { label: t("Stray Sites", "ಬಿಡಿ ನಿವೇಶನಗಳು"), href: svc("stray") },
      { label: t("CA Sites", "ಸಿಎ ನಿವೇಶನಗಳು"), href: svc("casite") },
      { label: t("Available Sites", "ಲಭ್ಯವಿರುವ ನಿವೇಶನಗಳು"), href: svc("stray"), isNew: true },
      {
        label: t("Flats / Villas", "ಫ್ಲ್ಯಾಟ್‌ಗಳು / ವಿಲ್ಲಾಗಳು"),
        href: svc("flats"),
        children: [
          { label: t("BDA Flats/Villas Booking", "ಬಿಡಿಎ ಫ್ಲ್ಯಾಟ್/ವಿಲ್ಲಾ ಬುಕಿಂಗ್"), href: svc("flats") },
          { label: t("Housing Portal", "ವಸತಿ ಪೋರ್ಟಲ್"), href: online("housing") },
        ],
      },
      {
        label: t("DSKL / Special Layouts", "ಡಿ.ಎಸ್.ಕೆ.ಎಲ್ / ವಿಶೇಷ ಬಡಾವಣೆಗಳು"),
        href: highlight("allotment"),
        children: [
          { label: t("DSKL Site Allotment", "ಡಿ.ಎಸ್.ಕೆ.ಎಲ್ ನಿವೇಶನ ಹಂಚಿಕೆ"), href: highlight("allotment") },
          { label: t("DSKL JCC Information", "ಡಿ ಎಸ್ ಕೆ ಎಲ್ ಜೆಸಿಸಿ ಮಾಹಿತಿ"), href: svc("jcc") },
          { label: t("DSKL Land Losers Allotment (40:60)", "ಡಿ.ಎಸ್.ಕೆ.ಎಲ್ ಭೂಮಾಲೀಕರ ಹಂಚಿಕೆ (40:60)"), href: ANNOUNCEMENTS[6].href },
        ],
      },
      { label: t("Land & Property Information", "ಭೂಮಿ ಮತ್ತು ಆಸ್ತಿ ಮಾಹಿತಿ"), href: svc("layouts"), isNew: true },
    ],
  },
  {
    key: "planning",
    label: t("Planning & Development", "ಯೋಜನೆ ಮತ್ತು ಅಭಿವೃದ್ಧಿ"),
    blurb: t("Maps, master planning and major development projects.", "ನಕ್ಷೆಗಳು, ಮಾಸ್ಟರ್ ಯೋಜನೆ ಮತ್ತು ಪ್ರಮುಖ ಅಭಿವೃದ್ಧಿ ಯೋಜನೆಗಳು."),
    icon: Compass,
    href: svc("map"),
    items: [
      { label: t("Jurisdiction Map", "ವ್ಯಾಪ್ತಿ ನಕ್ಷೆ"), href: svc("map") },
      { label: t("Bengaluru Business Corridor", "ಬೆಂಗಳೂರು ಬಿಸಿನೆಸ್ ಕಾರಿಡಾರ್"), href: svc("corridor") },
      { label: t("Development Projects", "ಅಭಿವೃದ್ಧಿ ಯೋಜನೆಗಳು"), href: `${SITE}/about-us`, isNew: true },
      {
        label: t("Planning Information", "ಯೋಜನಾ ಮಾಹಿತಿ"),
        href: LAYOUT_LINKS[4].href,
        children: [
          { label: t("BDA Zones Map", "ಬಿಡಿಎ ವಲಯಗಳ ನಕ್ಷೆ"), href: LAYOUT_LINKS[4].href },
          { label: t("Master Plan", "ಮಾಸ್ಟರ್ ಪ್ಲಾನ್"), href: `${SITE}/about-us`, isNew: true },
          { label: t("GIS Information", "GIS ಮಾಹಿತಿ"), href: online("gis") },
        ],
      },
      {
        label: t("Layout / Master Planning", "ಬಡಾವಣೆ / ಮಾಸ್ಟರ್ ಯೋಜನೆ"),
        href: svc("layouts"),
        children: [
          { label: LAYOUT_LINKS[0].label, href: LAYOUT_LINKS[0].href },
          { label: LAYOUT_LINKS[1].label, href: LAYOUT_LINKS[1].href },
          { label: LAYOUT_LINKS[2].label, href: LAYOUT_LINKS[2].href },
          { label: LAYOUT_LINKS[3].label, href: LAYOUT_LINKS[3].href },
        ],
      },
      { label: t("Major Projects", "ಪ್ರಮುಖ ಯೋಜನೆಗಳು"), href: `${SITE}/about-us`, isNew: true },
    ],
  },
  {
    key: "information",
    label: t("Information", "ಮಾಹಿತಿ"),
    blurb: t("RTI, forms, notifications, documents and maps.", "ಆರ್‌ಟಿಐ, ನಮೂನೆಗಳು, ಅಧಿಸೂಚನೆಗಳು, ದಾಖಲೆಗಳು ಮತ್ತು ನಕ್ಷೆಗಳು."),
    icon: Info,
    href: svc("rti"),
    items: [
      {
        label: t("RTI", "ಆರ್‌ಟಿಐ"),
        href: svc("rti"),
        children: [
          { label: t("RTI Information", "ಆರ್‌ಟಿಐ ಮಾಹಿತಿ"), href: svc("rti") },
          { label: t("Online RTI Application", "ಆನ್‌ಲೈನ್ ಆರ್‌ಟಿಐ ಅರ್ಜಿ"), href: online("rti") },
        ],
      },
      { label: t("Forms", "ನಮೂನೆಗಳು"), href: svc("online"), isNew: true },
      { label: t("Notifications", "ಅಧಿಸೂಚನೆಗಳು"), href: svc("auction"), isNew: true },
      {
        label: t("Documents", "ದಾಖಲೆಗಳು"),
        href: `${SITE}/about-us`,
        children: [
          { label: t("Acts and Rules", "ಕಾಯ್ದೆಗಳು ಮತ್ತು ನಿಯಮಗಳು"), href: `${SITE}/about-us` },
          { label: t("Reports", "ವರದಿಗಳು"), href: ANNOUNCEMENTS[1].href },
        ],
      },
      { label: t("Circulars / Orders", "ಸುತ್ತೋಲೆಗಳು / ಆದೇಶಗಳು"), href: `${SITE}/about-us`, isNew: true },
      { label: t("Tenders", "ಟೆಂಡರ್‌ಗಳು"), href: `${SITE}/tender` },
      { label: t("Gallery", "ಗ್ಯಾಲರಿ"), href: svc("gallery") },
      { label: t("Public Information", "ಸಾರ್ವಜನಿಕ ಮಾಹಿತಿ"), href: svc("rti"), isNew: true },
      {
        label: t("Maps", "ನಕ್ಷೆಗಳು"),
        href: svc("map"),
        children: [
          { label: t("BDA Zones Map", "ಬಿಡಿಎ ವಲಯಗಳ ನಕ್ಷೆ"), href: LAYOUT_LINKS[4].href },
          { label: t("Jurisdiction Map", "ವ್ಯಾಪ್ತಿ ನಕ್ಷೆ"), href: svc("map") },
        ],
      },
    ],
  },
  {
    key: "news",
    label: t("News & Updates", "ಸುದ್ದಿ ಮತ್ತು ಅಪ್‌ಡೇಟ್‌ಗಳು"),
    blurb: t("News, events, press releases, notices and Open House.", "ಸುದ್ದಿ, ಕಾರ್ಯಕ್ರಮಗಳು, ಮಾಧ್ಯಮ ಪ್ರಕಟಣೆಗಳು, ಸೂಚನೆಗಳು ಮತ್ತು ಓಪನ್ ಹೌಸ್."),
    icon: Newspaper,
    href: highlight("news"),
    items: [
      { label: t("Latest News", "ಇತ್ತೀಚಿನ ಸುದ್ದಿ"), href: highlight("news") },
      { label: t("Events", "ಕಾರ್ಯಕ್ರಮಗಳು"), href: highlight("news"), isNew: true },
      { label: t("Press Releases", "ಮಾಧ್ಯಮ ಪ್ರಕಟಣೆಗಳು"), href: highlight("press") },
      { label: t("Public Notices", "ಸಾರ್ವಜನಿಕ ಸೂಚನೆಗಳು"), href: highlight("news"), isNew: true },
      {
        label: t("Open House", "ಓಪನ್ ಹೌಸ್"),
        href: OPEN_HOUSE.href,
        children: [{ label: OPEN_HOUSE.label, href: OPEN_HOUSE.href }],
      },
      { label: t("Announcements", "ಪ್ರಕಟಣೆಗಳು"), href: highlight("news"), isNew: true },
    ],
  },
];

export const UTILITY: IaLink[] = [
  { label: t("24x7 Helpline", "24x7 ಸಹಾಯವಾಣಿ"), href: highlight("helpline") },
  { label: t("Grievance", "ಕುಂದುಕೊರತೆ"), href: highlight("grievance") },
  { label: t("Search", "ಹುಡುಕಾಟ"), href: "#services" },
  { label: t("English / ಕನ್ನಡ", "English / ಕನ್ನಡ"), href: "#" },
  { label: t("Contact", "ಸಂಪರ್ಕ"), href: svc("contact") },
];

export const INITIATIVES: IaLink[] = [
  { label: t("Green Bengaluru by BDA", "ಹಸಿರು ಬೆಂಗಳೂರು - ಬಿಡಿಎ"), href: highlight("green") },
  { label: t("Dr. K. Shivarama Karanth Layout", "ಡಾ. ಕೆ. ಶಿವರಾಮ ಕಾರಂತ ಬಡಾವಣೆ"), href: highlight("allotment") },
  { label: t("Bengaluru Business Corridor", "ಬೆಂಗಳೂರು ಬಿಸಿನೆಸ್ ಕಾರಿಡಾರ್"), href: svc("corridor") },
  { label: t("Open House", "ಓಪನ್ ಹೌಸ್"), href: OPEN_HOUSE.href },
];

const count = (links: IaLink[]): { total: number; fresh: number } =>
  links.reduce(
    (acc, l) => {
      const sub = l.children ? count(l.children) : { total: 0, fresh: 0 };
      return { total: acc.total + 1 + sub.total, fresh: acc.fresh + (l.isNew ? 1 : 0) + sub.fresh };
    },
    { total: 0, fresh: 0 },
  );

export const IA_STATS = count(AREAS.flatMap((a) => a.items));
