import {
  Bank,
  Buildings,
  ChartBar,
  Flask,
  Gavel,
  Handshake,
  RocketLaunch,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import bengaluru from "@/assets/invest/loc-bengaluru.jpg";
import hubballi from "@/assets/invest/loc-hubballi.jpg";
import mangaluru from "@/assets/invest/loc-mangaluru.jpg";
import mysuru from "@/assets/invest/loc-mysuru.jpg";
import kalaburagi from "@/assets/discover/city-kalaburagi.jpg";
import resAerospace from "@/assets/discover/res-aerospace.jpg";
import resAgritech from "@/assets/discover/res-agritech.jpg";
import resBiotech from "@/assets/discover/res-biotech.jpg";
import resEnergy from "@/assets/discover/res-energy.jpg";
import resGcc from "@/assets/discover/res-gcc.jpg";
import resLogistics from "@/assets/discover/res-logistics.jpg";
import resManufacturing from "@/assets/discover/res-manufacturing.jpg";
import resMobility from "@/assets/discover/res-mobility.jpg";
import resSemiconductor from "@/assets/discover/res-semiconductor.jpg";
import resSkills from "@/assets/discover/res-skills.jpg";
import belagavi from "@/assets/partner/city-belagavi.jpg";
import tumakuru from "@/assets/partner/city-tumakuru.jpg";

export type CategoryId = "investment" | "projects" | "partnerships" | "research" | "talent" | "startup" | "government" | "tenders";

export type Category = { id: CategoryId; label: string; tag: string; icon: Icon; color: string };

export const CATEGORIES: Category[] = [
  { id: "investment", label: "Investment Opportunities", tag: "Investment Opportunity", icon: ChartBar, color: "#1f6fe5" },
  { id: "projects", label: "Projects & Infrastructure", tag: "Project Opportunity", icon: Buildings, color: "#ea6c12" },
  { id: "partnerships", label: "Partnerships", tag: "Partnership Opportunity", icon: Handshake, color: "#16a05a" },
  { id: "research", label: "Research & Innovation", tag: "Research Opportunity", icon: Flask, color: "#8a3fd6" },
  { id: "talent", label: "Talent & Jobs", tag: "Talent Opportunity", icon: UsersThree, color: "#e0335c" },
  { id: "startup", label: "Startup Opportunities", tag: "Startup Opportunity", icon: RocketLaunch, color: "#0e9c97" },
  { id: "government", label: "Government Programmes", tag: "Government Programme", icon: Bank, color: "#3b4fd8" },
  { id: "tenders", label: "Tenders & Procurement", tag: "Tender", icon: Gavel, color: "#c2410c" },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<CategoryId, Category>;

export type Status = "Open" | "Upcoming" | "Closing Soon";

export type Opportunity = {
  id: string;
  title: string;
  category: CategoryId;
  location: string;
  sector: string;
  organisation: string;
  status: Status;
  posted: string;
  image: string;
};

export const OPPORTUNITIES: Opportunity[] = [
  { id: "semiconductor", title: "Semiconductor Manufacturing Facility", category: "investment", location: "Bengaluru", sector: "Electronics & Semiconductors", organisation: "Government of Karnataka", status: "Open", posted: "2026-09-28", image: resSemiconductor },
  { id: "manufacturing", title: "Advanced Manufacturing Collaboration", category: "partnerships", location: "Tumakuru", sector: "Manufacturing", organisation: "Industry", status: "Open", posted: "2026-09-25", image: resManufacturing },
  { id: "biotech", title: "Biotechnology Research Collaboration", category: "research", location: "Bengaluru", sector: "Biotechnology", organisation: "Research Institutions", status: "Open", posted: "2026-09-22", image: resBiotech },
  { id: "energy", title: "Renewable Energy Project", category: "projects", location: "Tumakuru", sector: "Clean Energy", organisation: "Government of Karnataka", status: "Open", posted: "2026-09-20", image: resEnergy },
  { id: "gcc", title: "Global Capability Centre Expansion", category: "talent", location: "Mysuru", sector: "IT & Global Services", organisation: "Industry", status: "Open", posted: "2026-09-18", image: resGcc },
  { id: "aerospace", title: "Aerospace Components Park", category: "investment", location: "Belagavi", sector: "Aerospace & Defence", organisation: "Government of Karnataka", status: "Upcoming", posted: "2026-09-15", image: resAerospace },
  { id: "logistics", title: "Port-Led Logistics Hub", category: "projects", location: "Mangaluru", sector: "Logistics & Trade", organisation: "Government of Karnataka", status: "Upcoming", posted: "2026-09-12", image: resLogistics },
  { id: "agritech", title: "Agri-Tech Innovation Challenge", category: "startup", location: "Hubballi-Dharwad", sector: "Agritech", organisation: "Startup Ecosystem", status: "Open", posted: "2026-09-10", image: resAgritech },
  { id: "mobility", title: "Smart Mobility Pilot", category: "tenders", location: "Bengaluru", sector: "Urban Mobility", organisation: "Government of Karnataka", status: "Closing Soon", posted: "2026-09-06", image: resMobility },
  { id: "skills", title: "Skills for Industry Programme", category: "government", location: "Kalaburagi", sector: "Education & Skills", organisation: "Government of Karnataka", status: "Open", posted: "2026-09-02", image: resSkills },
];

export const OPPORTUNITY_BY_ID = Object.fromEntries(OPPORTUNITIES.map((o) => [o.id, o])) as Record<string, Opportunity>;

const unique = (xs: string[]) => [...new Set(xs)].sort();
export const SECTORS = unique(OPPORTUNITIES.map((o) => o.sector));
export const ORGANISATIONS = unique(OPPORTUNITIES.map((o) => o.organisation));
export const STATUSES: Status[] = ["Open", "Upcoming", "Closing Soon"];

export type Region = {
  name: string;
  tagline: string;
  /** Short strengths shown on the map label. */
  strengths: string;
  sectors: string[];
  image: string;
  /** Position inside the 300×473 Karnataka map. */
  at: [number, number];
  labelSide: "left" | "right";
};

export const REGIONS: Region[] = [
  { name: "Kalaburagi", tagline: "Education & Skills Centre", strengths: "Education · Skills", sectors: ["Education & Skills", "Renewable Energy", "Agri-processing", "Cement & Minerals"], image: kalaburagi, at: [183, 86], labelSide: "right" },
  { name: "Belagavi", tagline: "Precision Manufacturing Cluster", strengths: "Manufacturing · Industry", sectors: ["Precision Manufacturing", "Aerospace Components", "Foundry & Machining", "Food Processing"], image: belagavi, at: [40, 140], labelSide: "left" },
  { name: "Hubballi-Dharwad", tagline: "North Karnataka Growth Hub", strengths: "Aerospace · Innovation", sectors: ["Aerospace & Defence", "Startups & Innovation", "Agritech", "Education"], image: hubballi, at: [74, 212], labelSide: "left" },
  { name: "Tumakuru", tagline: "Industrial & Energy Corridor", strengths: "Industry · Clean Energy", sectors: ["Industrial Corridor", "Clean Energy", "Aerospace", "Food Processing"], image: tumakuru, at: [195, 338], labelSide: "right" },
  { name: "Mangaluru", tagline: "Coastal Trade Gateway", strengths: "Trade · Blue Economy", sectors: ["Logistics & Trade", "Blue Economy", "Petrochemicals", "Healthcare & Education"], image: mangaluru, at: [52, 385], labelSide: "left" },
  { name: "Bengaluru", tagline: "Technology & Innovation Hub", strengths: "Technology · Startups", sectors: ["Technology & IT", "Startups & Innovation", "Aerospace & Defence", "Research Institutions", "Global Companies"], image: bengaluru, at: [234, 378], labelSide: "right" },
  { name: "Mysuru", tagline: "Heritage & Knowledge City", strengths: "Research · Heritage", sectors: ["Research & Education", "IT & Global Services", "Heritage Tourism", "Electronics"], image: mysuru, at: [166, 426], labelSide: "right" },
];

export type Filters = {
  q: string;
  category: CategoryId | "all";
  sector: string;
  location: string;
  organisation: string;
  statuses: Status[];
};

export const EMPTY_FILTERS: Filters = { q: "", category: "all", sector: "all", location: "all", organisation: "all", statuses: [] };

export function applyFilters(list: Opportunity[], f: Filters) {
  const q = f.q.trim().toLowerCase();
  return list.filter(
    (o) =>
      (f.category === "all" || o.category === f.category) &&
      (f.sector === "all" || o.sector === f.sector) &&
      (f.location === "all" || o.location === f.location) &&
      (f.organisation === "all" || o.organisation === f.organisation) &&
      (!f.statuses.length || f.statuses.includes(o.status)) &&
      (!q || [o.title, o.sector, o.location, o.organisation, CATEGORY_BY_ID[o.category].label].some((s) => s.toLowerCase().includes(q))),
  );
}
