import { PATHWAYS, pathwayHref } from "./pathways";

export type NavItem = { label: string; to: string; end: boolean };

export const NAV: NavItem[] = [
  { label: "Home", to: "/global-connect", end: true },
  { label: "About", to: "/global-connect/about", end: false },
  ...PATHWAYS.map((p) => ({ label: p.nav, to: pathwayHref(p.id), end: false })),
];

export const HELP_DESK = "/global-connect/help";
export const OFFICER_WORKSPACE = "/global-connect/officer";
export const ABOUT = "/global-connect/about";

/** Links to the NRI services, shared by every footer. */
export const SERVICE_LINKS = [
  { label: "NRI Help Desk", to: HELP_DESK },
  { label: "Raise a grievance", to: `${HELP_DESK}#grievance` },
  { label: "Ask about a scheme", to: `${HELP_DESK}#schemes` },
  { label: "Track a request", to: `${HELP_DESK}#after` },
  { label: "Officer workspace (concept)", to: OFFICER_WORKSPACE },
];
