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
    kicker: "Problem · 17 modules connected · Smart Middleware",
    nav: "Gap → File",
    beats: 4,
  },
  { id: "assess", title: "Project Assessment Flow", kicker: "Register · Allot · Inspect · Value · Notify · Monitor", nav: "Assess", beats: 6 },
  { id: "gps", title: "Field Officer Mobile App", kicker: "Online or offline · Capture · Send · On-spot demand", nav: "GPS", beats: 7 },
  {
    id: "gis",
    title: "Territory Map",
    kicker: "Project location · Territory · Officers · Field evidence · Dashboard",
    nav: "GIS",
    beats: 5,
  },
  { id: "leak", title: "Exception Management", kicker: "Detect · Notify · Assign · Resolve · Verify · Close · Old dues", nav: "Closure", beats: 2 },
  { id: "arch", title: "Architecture, Technology & Security", kicker: "Layers · Stack · Sign-in · Roles · Audit", nav: "Tech", beats: 3 },
  { id: "plan", title: "Project Delivery Milestones", kicker: "SRS · Build · Integrate · Train · AMC", nav: "Plan", beats: 5 },
  { id: "risks", title: "Risks and Their Mitigation", kicker: "Agencies · Rules and data · People and maps · Safety", nav: "Risks", beats: 4 },
  { id: "thanks", title: "Thank You", kicker: "Labour CESS Tracking & Monitoring System", nav: "Thanks", beats: 1 },
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
    items: ["Demand", "Collection", "Remittance (30 days)", "Interest on delay", "Old dues brought forward", "Matching accounts", "Accounts / DCB"],
  },
  comm: {
    title: "Alerts & Compliance",
    body: "Alert → Assign → Follow up → Close.",
    items: ["Alerts & escalation", "Assignment", "Follow-up", "Resolution"],
  },
  ext: {
    title: "External Systems",
    body: "Labour CESS Portal and remittance-at-source (LCDRS), KSK links, and connections to other government systems.",
    items: [
      "Labour CESS Portal",
      "Cash counter / QR",
      "Remittance at source (LCDRS)",
      "KSK integration",
      "Khajane 2.0 (Treasury)",
      "K-RERA",
      "BBMP · BDA plan approvals",
      "e-Swathu · Panchatantra",
    ],
  },
} as const;
