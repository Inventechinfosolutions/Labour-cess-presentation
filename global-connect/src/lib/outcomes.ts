import {
  Article,
  Briefcase,
  CalendarStar,
  ChartLineUp,
  Gear,
  GlobeHemisphereEast,
  Handshake,
  Intersect,
  ListChecks,
  Magnet,
  Megaphone,
  Trophy,
  UsersThree,
  type Icon,
} from "@phosphor-icons/react";

export type LoopStage = { title: string; text: string; icon: Icon };

/** The ecosystem-building cycle: the last stage feeds back into the first. */
export const LOOP: LoopStage[] = [
  { title: "Build network", text: "Bring institutions, companies, universities and Kannadigas together.", icon: UsersThree },
  { title: "Create content", text: "Share sector insights, stories and opportunities.", icon: Article },
  { title: "Create events", text: "Host roadshows, forums and community meets.", icon: CalendarStar },
  { title: "Generate interest", text: "Turn attention into expressions of interest.", icon: Megaphone },
  { title: "Make matches", text: "Connect each interest with the right partner.", icon: Intersect },
  { title: "Facilitate", text: "Coordinate departments, approvals and support.", icon: Gear },
  { title: "Follow up", text: "Every enquiry has an owner until it closes.", icon: ListChecks },
  { title: "Create outcome", text: "Agreements signed. Projects started.", icon: Handshake },
  { title: "Capture success", text: "Record results and share success stories.", icon: Trophy },
  { title: "Attract more", text: "Each success draws new members to the network.", icon: Magnet },
];

export type OutcomeStage = { label: string; value: number };

export type OutcomeArea = {
  id: string;
  title: string;
  line: string;
  icon: Icon;
  /** `funnel` areas narrow stage by stage and show the share carried forward. */
  kind: "count" | "funnel";
  stages: OutcomeStage[];
  /** One-line takeaway shown under the figures. */
  note: string;
};

/** Illustrative figures for the concept prototype; replace with live platform data. */
export const OUTCOMES: OutcomeArea[] = [
  {
    id: "network",
    title: "Network",
    line: "Who has joined the ecosystem.",
    note: "Members from 64 countries across four member groups.",
    icon: GlobeHemisphereEast,
    kind: "count",
    stages: [
      { label: "Institutions registered", value: 420 },
      { label: "Companies registered", value: 1850 },
      { label: "Universities registered", value: 96 },
      { label: "Kannadigas registered", value: 12400 },
      { label: "Countries represented", value: 64 },
    ],
  },
  {
    id: "engagement",
    title: "Engagement",
    line: "How members take part.",
    note: "72% of event registrants attended.",
    icon: CalendarStar,
    kind: "count",
    stages: [
      { label: "Events conducted", value: 48 },
      { label: "Event registrations", value: 9600 },
      { label: "Event attendance", value: 6900 },
      { label: "Meetings conducted", value: 1240 },
      { label: "Connections created", value: 3100 },
    ],
  },
  {
    id: "opportunities",
    title: "Opportunities",
    line: "From publication to conversion.",
    note: "About 1 in 5 matched opportunities converted.",
    icon: ChartLineUp,
    kind: "funnel",
    stages: [
      { label: "Opportunities published", value: 640 },
      { label: "Opportunity views", value: 48200 },
      { label: "Expressions of interest", value: 2150 },
      { label: "Opportunities matched", value: 610 },
      { label: "Opportunities converted", value: 118 },
    ],
  },
  {
    id: "partnerships",
    title: "Partnerships",
    line: "From first talk to completed work.",
    note: "74 agreements signed. 19 collaborations completed.",
    icon: Handshake,
    kind: "funnel",
    stages: [
      { label: "Partnerships initiated", value: 320 },
      { label: "Discussions underway", value: 210 },
      { label: "MoUs and agreements", value: 74 },
      { label: "Active collaborations", value: 52 },
      { label: "Completed collaborations", value: 19 },
    ],
  },
  {
    id: "investment",
    title: "Investment",
    line: "From enquiry to projects on the ground.",
    note: "41 projects initiated from 1,480 enquiries.",
    icon: Briefcase,
    kind: "funnel",
    stages: [
      { label: "Investor enquiries", value: 1480 },
      { label: "Investor meetings", value: 620 },
      { label: "Investment proposals", value: 210 },
      { label: "Facilitated investments", value: 64 },
      { label: "Projects initiated", value: 41 },
    ],
  },
];

export const LOOP_PALETTES = {
  global: ["#2f80ed", "#1ea765", "#f07a1a", "#9147dd", "#e43d63", "#13a39d", "#0e9aa7", "#f0b429", "#5a67d8", "#d6409f"],
  heritage: ["#146c4a", "#c8902a", "#1f7a55", "#b9831f", "#0f5c3f", "#d4a537", "#2a8460", "#a8741a", "#185f43", "#c99a2e"],
  horizon: ["#1ea765", "#2f6fe0", "#7b3fe4", "#f0562e", "#f5a915", "#12a3a0", "#e23b4a", "#1f5fd6", "#9b51e0", "#ef9a0e"],
} as const;
