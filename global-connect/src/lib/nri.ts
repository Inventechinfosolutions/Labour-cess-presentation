import type { Icon } from "@phosphor-icons/react";
import {
  Bank,
  Briefcase,
  Buildings,
  CalendarStar,
  ChartBar,
  ChatCircleText,
  CheckCircle,
  ClipboardText,
  Envelope,
  FileText,
  Files,
  GraduationCap,
  Handshake,
  HouseLine,
  IdentificationCard,
  Lifebuoy,
  MagnifyingGlass,
  MapPin,
  PaperPlaneTilt,
  Phone,
  Scales,
  ShieldCheck,
  Stamp,
  Target,
  Tray,
  TreeStructure,
  UserCircleGear,
  UserGear,
  UserList,
  UsersFour,
  WhatsappLogo,
  Airplane,
  Eye,
  Compass,
  ArrowsSplit,
} from "@phosphor-icons/react";

export type NriStamp = { title: string; text: string; icon: Icon };

/* ---------- About the Department ---------- */

export const MANDATE: NriStamp[] = [
  { title: "Mandate", text: "Serve Kannadigas living abroad and their families in Karnataka.", icon: Target },
  { title: "Vision", text: "A trusted home link for every global Kannadiga.", icon: Eye },
  { title: "Mission", text: "Guide, resolve and connect through one clear front door.", icon: Compass },
];

export const ACTIVITIES: NriStamp[] = [
  { title: "NRI grievance support", text: "Receive concerns and follow them up with departments.", icon: Lifebuoy },
  { title: "Scheme guidance", text: "Explain state schemes and who can apply.", icon: ClipboardText },
  { title: "Global Kannadiga engagement", text: "Stay in touch with associations worldwide.", icon: UsersFour },
  { title: "Investment and partnership", text: "Help NRIs invest and partner in Karnataka.", icon: Handshake },
  { title: "Events and roadshows", text: "Meet the community at home and abroad.", icon: CalendarStar },
  { title: "Coordination with departments", text: "Work with state departments through e-Office.", icon: TreeStructure },
];

export const WORK_FLOW: NriStamp[] = [
  { title: "NRI or family", text: "Shares a concern or question.", icon: UserList },
  { title: "Help Desk", text: "Records it and opens a docket.", icon: Lifebuoy },
  { title: "e-Office", text: "Docket is forwarded on file.", icon: PaperPlaneTilt },
  { title: "Line department", text: "Takes action within set timelines.", icon: Buildings },
  { title: "Reply", text: "Outcome is shared back with the NRI.", icon: CheckCircle },
];

export const NEWS = [
  { date: "Jan 2026", title: "Global Kannadiga Meet, Bengaluru", tag: "Event" },
  { date: "Mar 2026", title: "NRI outreach roadshow, Dubai", tag: "Roadshow" },
  { date: "Jun 2026", title: "District NRI help camps launched", tag: "Update" },
  { date: "Sep 2026", title: "Partner forum with Kannada associations", tag: "Event" },
];

export const RESOURCES = [
  { title: "NRI services guide", meta: "PDF · Coming soon", icon: FileText },
  { title: "Grievance checklist", meta: "PDF · Coming soon", icon: ClipboardText },
  { title: "State schemes summary", meta: "PDF · Coming soon", icon: Files },
  { title: "Department contacts list", meta: "PDF · Coming soon", icon: UserList },
];

export const CONTACTS = [
  { title: "Help Desk phone", value: "To be confirmed", icon: Phone },
  { title: "Email", value: "To be confirmed", icon: Envelope },
  { title: "WhatsApp", value: "To be confirmed", icon: WhatsappLogo },
  { title: "Office address", value: "Bengaluru · To be confirmed", icon: MapPin },
];

/* ---------- NRI Help Desk ---------- */

export const GRIEVANCE_STEPS: NriStamp[] = [
  { title: "Choose a category", text: "Pick the area your concern belongs to.", icon: MagnifyingGlass },
  { title: "Keep papers ready", text: "Passport, address proof and related documents.", icon: IdentificationCard },
  { title: "Share your concern", text: "Through the Help Desk channels listed below.", icon: ChatCircleText },
  { title: "Receive a docket number", text: "Use it to follow every step.", icon: Stamp },
];

export const CATEGORIES = [
  { title: "Property and land", days: 30, icon: HouseLine },
  { title: "Police and legal", days: 21, icon: Scales },
  { title: "Certificates and documents", days: 15, icon: FileText },
  { title: "Family welfare", days: 21, icon: UsersFour },
  { title: "Education", days: 15, icon: GraduationCap },
  { title: "Overseas employment", days: 21, icon: Airplane },
];

export const CHECKLIST = [
  "Passport copy",
  "Overseas address and phone",
  "Contact person in Karnataka",
  "Short summary of the concern",
  "Related documents or letters",
  "Earlier reference numbers, if any",
];

export const SCHEMES = [
  { title: "NRI investment facilitation", dept: "Industries", icon: Briefcase },
  { title: "Overseas employment support", dept: "Labour", icon: Airplane },
  { title: "Higher education for NRI children", dept: "Higher Education", icon: GraduationCap },
  { title: "Property documentation help", dept: "Revenue", icon: HouseLine },
  { title: "Welfare of returning Kannadigas", dept: "Social Welfare", icon: UsersFour },
  { title: "Banking and remittance guidance", dept: "Finance", icon: Bank },
];

export const ASK_STEPS: NriStamp[] = [
  { title: "Find the scheme", text: "Check the sample list on this page.", icon: MagnifyingGlass },
  { title: "Write your question", text: "Keep it short and specific.", icon: ChatCircleText },
  { title: "Get guidance", text: "The Help Desk replies with next steps.", icon: CheckCircle },
];

export const FAQS = [
  { q: "Who can use the NRI Help Desk?", a: "Kannadigas living abroad and their families in Karnataka." },
  { q: "Is there a fee?", a: "No. The Help Desk service is free of charge." },
  { q: "How will I know the progress?", a: "Every concern gets a docket number. Each step is shared with you." },
  { q: "Can a family member raise it for me?", a: "Yes, with your written consent and a copy of your passport." },
  { q: "What if the timeline is crossed?", a: "The docket is escalated to the senior officer automatically." },
];

export const DOCKET_STATIONS: NriStamp[] = [
  { title: "Received", text: "Concern recorded at the Help Desk.", icon: Tray },
  { title: "Docket opened", text: "A docket number is issued.", icon: Stamp },
  { title: "Reviewed", text: "Desk officer checks the details.", icon: MagnifyingGlass },
  { title: "Forwarded", text: "Sent on e-Office to the department.", icon: PaperPlaneTilt },
  { title: "Action taken", text: "Department acts on the concern.", icon: Buildings },
  { title: "Reply shared", text: "Outcome sent back to the NRI.", icon: ChatCircleText },
  { title: "Closed", text: "Closed after confirmation.", icon: CheckCircle },
];

export const SAMPLE_DOCKET = "NRI/GRV/2026/000123";

export const SAMPLE_TIMELINE = [
  { date: "02 Mar", text: "Concern received at the Help Desk", done: true },
  { date: "02 Mar", text: `Docket ${SAMPLE_DOCKET} opened`, done: true },
  { date: "04 Mar", text: "Forwarded to Revenue Department on e-Office", done: true },
  { date: "18 Mar", text: "Field verification by Tahsildar office", done: false },
  { date: "—", text: "Reply to be shared with the NRI", done: false },
];

export const CHANNELS = [
  { title: "Phone", value: "To be confirmed", icon: Phone },
  { title: "Email", value: "To be confirmed", icon: Envelope },
  { title: "WhatsApp", value: "To be confirmed", icon: WhatsappLogo },
  { title: "Walk-in", value: "Bengaluru office", icon: MapPin },
];

/* ---------- Officer workspace (concept) ---------- */

export const KPIS = [
  { label: "Open dockets", value: "248", icon: Tray },
  { label: "Forwarded on e-Office", value: "176", icon: PaperPlaneTilt },
  { label: "Closed this month", value: "92", icon: CheckCircle },
  { label: "Past timeline", value: "14", icon: ShieldCheck },
];

export type DocketStatus = "New" | "Forwarded" | "In action" | "Replied" | "Escalated";

export const DOCKETS: { no: string; category: string; dept: string; days: number; status: DocketStatus }[] = [
  { no: "NRI/GRV/2026/000123", category: "Property and land", dept: "Revenue", days: 16, status: "In action" },
  { no: "NRI/GRV/2026/000124", category: "Certificates", dept: "e-Governance", days: 4, status: "Forwarded" },
  { no: "NRI/GRV/2026/000125", category: "Police and legal", dept: "Home", days: 25, status: "Escalated" },
  { no: "NRI/QRY/2026/000126", category: "Scheme query", dept: "Higher Education", days: 2, status: "Replied" },
  { no: "NRI/GRV/2026/000127", category: "Family welfare", dept: "Women and Child", days: 1, status: "New" },
];

export const DOCKET_DETAILS = [
  { label: "Docket number", value: SAMPLE_DOCKET },
  { label: "Category", value: "Property and land" },
  { label: "Applicant", value: "Sample NRI · Dubai" },
  { label: "Department", value: "Revenue" },
  { label: "e-Office receipt", value: "REV/E-RCPT/2026/45871" },
  { label: "Timeline", value: "30 days · Day 16" },
];

export const ATTACHMENTS = ["Passport copy.pdf", "Sale deed.pdf", "Concern summary.pdf"];

export const AUDIT = [
  { at: "02 Mar · 10:14", who: "Help Desk", text: "Docket opened" },
  { at: "02 Mar · 16:40", who: "Desk officer", text: "Details checked" },
  { at: "04 Mar · 11:05", who: "Section officer", text: "Forwarded on e-Office" },
  { at: "18 Mar · 09:30", who: "Revenue Dept.", text: "Field verification started" },
];

export const EOFFICE_FLOW: NriStamp[] = [
  { title: "Docket", text: "Created at the Help Desk.", icon: Stamp },
  { title: "e-Office receipt", text: "Receipt number generated.", icon: FileText },
  { title: "Department file", text: "Moves to the line department.", icon: ArrowsSplit },
  { title: "Action note", text: "Department records action.", icon: ClipboardText },
  { title: "Back to docket", text: "Status updates for the NRI.", icon: CheckCircle },
];

export const PENDING_BY_DEPT = [
  { dept: "Revenue", value: 62 },
  { dept: "Home", value: 41 },
  { dept: "e-Governance", value: 33 },
  { dept: "Labour", value: 27 },
  { dept: "Higher Education", value: 18 },
];

export const AGEING = [
  { label: "0–7 days", value: 96 },
  { label: "8–15 days", value: 74 },
  { label: "16–30 days", value: 52 },
  { label: "Over 30 days", value: 14 },
];

export const ROLES: NriStamp[] = [
  { title: "Desk officer", text: "Records concerns and checks details.", icon: UserCircleGear },
  { title: "Section officer", text: "Forwards dockets on e-Office.", icon: UserGear },
  { title: "Head of department", text: "Reviews delays and escalations.", icon: Buildings },
  { title: "Administrator", text: "Manages users, categories and timelines.", icon: ChartBar },
];
