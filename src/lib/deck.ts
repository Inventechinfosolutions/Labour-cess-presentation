export type SceneMeta = {
  id: string;
  title: string;
  kicker: string;
  nav: string;
  beats: number;
};

export const SCENES: SceneMeta[] = [
  { id: "title", title: "Labour CESS Tracking & Monitoring", kicker: "Government of Karnataka", nav: "Open", beats: 1 },
  {
    id: "problem",
    title: "From Many Files to One Project File",
    kicker: "Problem · First solution · Smart Middleware",
    nav: "Gap → File",
    beats: 3,
  },
  { id: "assess", title: "From Project File to CESS Assessment", kicker: "Register · Allot · Inspect · Value · Notify · Monitor", nav: "Assess", beats: 6 },
  { id: "gps", title: "Field Officer Mobile App", kicker: "Online or offline · Capture · Send · On-spot demand", nav: "GPS", beats: 6 },
  {
    id: "gis",
    title: "Territory Map",
    kicker: "Project location · Territory · Officers · Field evidence · Dashboard",
    nav: "GIS",
    beats: 5,
  },
  { id: "leak", title: "From Dashboard to Closure", kicker: "Detect · Notify · Assign · Resolve · Verify · Close", nav: "Closure", beats: 1 },
  { id: "core", title: "How the Department Works Day to Day", kicker: "Access · Appeals · KSK · Portal · Remittance at source", nav: "Core", beats: 9 },
];

export const CORE = {
  gov: {
    title: "Governance & Control",
    body: "Who can see and act — roles, area responsibility and permissions, including territory maps on the Central Platform.",
    items: [
      "Role-based access",
      "Organisation hierarchy",
      "Area responsibility",
      "Permissions",
      "Territory maps (MIS & GIS)",
      "Department · area · designation · user",
    ],
  },
  doc: {
    title: "Documents & Office Work",
    body: "Links CESS work with office processes, appeals and grievance handling on the same project file.",
    items: ["Document store (DMS)", "E-Office", "Inward / Outward", "Appeals", "Grievances", "Closing exceptions", "Meetings"],
  },
  fin: {
    title: "Finance & CESS Operations",
    body: "What is owed, collected and remitted — including 30-day remittance, interest on delay and matching accounts (DCB).",
    items: ["Demand", "Collection", "Remittance (30 days)", "Interest on delay", "Matching accounts", "Accounts / DCB"],
  },
  comm: {
    title: "Alerts & Compliance",
    body: "Alert → Assign → Follow up → Close, plus appeals, grievances and decision support.",
    items: ["Alerts & escalation", "Assignment", "Follow-up", "Resolution", "Appeals", "Grievances", "Decision support"],
  },
  ext: {
    title: "External Systems",
    body: "Labour CESS Portal and remittance-at-source (LCDRS), KSK links, and connections to other government systems.",
    items: ["Labour CESS Portal", "Cash counter / QR", "Remittance at source (LCDRS)", "KSK integration", "System links (APIs)"],
  },
} as const;
