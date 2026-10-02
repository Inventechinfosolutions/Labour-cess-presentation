import {
  ChartBar,
  FileText,
  Gear,
  GraduationCap,
  Handshake,
  MagnifyingGlass,
  MapPin,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";
import cardConnect from "@/assets/card-connect.jpg";
import cardDiscover from "@/assets/card-discover.jpg";
import cardInvest from "@/assets/card-invest.jpg";
import cardPartner from "@/assets/card-partner.jpg";
import cardTalent from "@/assets/card-talent.jpg";

export type PathwayId = "invest" | "connect" | "talent" | "partner" | "discover";

export type Pathway = {
  id: PathwayId;
  title: string;
  text: string;
  nav: string;
  page: string;
  /** Explore tile label: lead words + emphasised words. */
  explore: [lead: string, emphasis: string];
  color: string;
  deep: string;
  soft: string;
  icon: Icon;
  image: string;
};

export const PATHWAYS: Pathway[] = [
  {
    id: "invest",
    title: "Invest",
    text: "Discover opportunities and build businesses in Karnataka.",
    nav: "Invest",
    page: "Invest in Karnataka",
    explore: ["I want to", "invest"],
    color: "#1f6fe5",
    deep: "#1554b8",
    soft: "#e7f0ff",
    icon: ChartBar,
    image: cardInvest,
  },
  {
    id: "connect",
    title: "Connect",
    text: "Engage with the global Kannada community.",
    nav: "Connect",
    page: "Connect with Kannadigas",
    explore: ["I want to", "connect with Karnataka"],
    color: "#16a05a",
    deep: "#0f7a43",
    soft: "#e6f7ee",
    icon: UsersThree,
    image: cardConnect,
  },
  {
    id: "talent",
    title: "Talent",
    text: "Connect Karnataka's people with global opportunities.",
    nav: "Talent",
    page: "Global Talent",
    explore: ["I want", "global talent"],
    color: "#ea6c12",
    deep: "#c2560b",
    soft: "#fff0e4",
    icon: GraduationCap,
    image: cardTalent,
  },
  {
    id: "partner",
    title: "Partner",
    text: "Build relationships with cities, institutions and organisations worldwide.",
    nav: "Partnerships",
    page: "Build a Partnership",
    explore: ["I want to", "build a partnership"],
    color: "#8a3fd6",
    deep: "#6d2cb3",
    soft: "#f3eafd",
    icon: Handshake,
    image: cardPartner,
  },
  {
    id: "discover",
    title: "Discover",
    text: "Explore Karnataka's sectors, projects and capabilities.",
    nav: "Opportunities",
    page: "Explore Opportunities",
    explore: ["I want to", "explore opportunities"],
    color: "#e0335c",
    deep: "#b82146",
    soft: "#fdeaef",
    icon: MapPin,
    image: cardDiscover,
  },
];

export const PATHWAY_BY_ID = Object.fromEntries(PATHWAYS.map((p) => [p.id, p])) as Record<PathwayId, Pathway>;

export const pathwayHref = (id: PathwayId) => `/global-connect/${id}`;

export type JourneyStep = { title: string; text: string; icon: Icon; color: string; deep: string };

export const JOURNEY: JourneyStep[] = [
  { title: "Discover", text: "Explore opportunities", icon: MagnifyingGlass, color: "#2f80ed", deep: "#1a5fc4" },
  { title: "Connect", text: "Engage with people and partners", icon: UsersThree, color: "#1ea765", deep: "#127f4b" },
  { title: "Facilitate", text: "Coordinate with government", icon: Gear, color: "#f07a1a", deep: "#c75e0c" },
  { title: "Collaborate", text: "Build and execute together", icon: Handshake, color: "#9147dd", deep: "#6e2fb6" },
  { title: "Invest", text: "Turn plans into projects", icon: FileText, color: "#e43d63", deep: "#ba2448" },
  { title: "Grow", text: "Create sustainable impact", icon: ChartBar, color: "#13a39d", deep: "#0b7d78" },
];
