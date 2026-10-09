export type TrendDirection = "up" | "down" | "flat"

import { feCompanies, kpiLabels, programmeTotals } from "@/data/kpi-drilldown-data"

export type KpiItem = {
  id: string
  label: string
  value: number
  prefix?: string
  suffix?: string
  format: "number" | "currency" | "percent"
  trend: number
  trendDirection: TrendDirection
  hint: string
  spark: number[]
  accent: "cyan" | "success" | "gold" | "violet" | "rose"
}

export type FunnelStage = {
  id: string
  label: string
  count: number
  percent: number
  color: string
  detail?: string
}

export type FinancialMetric = {
  id: string
  label: string
  value: number
  format: "currency" | "percent"
  barPercent: number
  tone: "navy" | "success" | "gold" | "info" | "warning"
}

export type AlertItem = {
  id: string
  severity: "critical" | "warning" | "info"
  title: string
  detail: string
  count: number
  time: string
}

export type ReportItem = {
  id: string
  title: string
  description: string
  href: string
  to:
    | "/reports/scam-companies"
    | "/reports/victims"
    | "/reports/eligibility"
    | "/reports/settlement"
    | "/reports/payments"
    | "/reports/audit"
  icon: "building" | "user" | "clipboard" | "wallet" | "bank" | "scale"
}

export const dashboardMeta = {
  title: "Claim Settlement Management System",
  shortTitle: "CSMS",
  authority: "Competent Authority — Karnataka KPID Act",
  lastUpdated: "13 Jul 2026 · 12:42 IST",
  environment: "Production",
}

export const kpiData: KpiItem[] = [
  {
    id: "fes",
    label: kpiLabels.fes,
    value: programmeTotals.entities,
    format: "number",
    trend: 2,
    trendDirection: "up",
    hint: "Under KPID proceedings",
    spark: [8, 9.4, 8.6, 10.2, 9.5, 11.3, programmeTotals.entities],
    accent: "cyan",
  },
  {
    id: "depositors",
    label: kpiLabels.depositors,
    value: programmeTotals.depositors,
    format: "number",
    trend: 1.4,
    trendDirection: "up",
    hint: "Registered in the system",
    spark: [171000, 176800, 174400, 180200, 178600, 183400, programmeTotals.depositors],
    accent: "cyan",
  },
  {
    id: "investments",
    label: kpiLabels.investments,
    value: programmeTotals.totalDeposits,
    format: "currency",
    trend: 0.3,
    trendDirection: "flat",
    hint: "Deposited by depositors",
    spark: [418, 424, 420, 426, 422, 427, 428],
    accent: "violet",
  },
  {
    id: "claims",
    label: kpiLabels.claims,
    value: programmeTotals.claims,
    format: "number",
    trend: 3.2,
    trendDirection: "up",
    hint: "Applications received",
    spark: [131000, 142000, 138500, 149200, 146800, 154600, programmeTotals.claims],
    accent: "cyan",
  },
  {
    id: "liability",
    label: kpiLabels.liability,
    value: programmeTotals.grossLiability,
    format: "currency",
    trend: 1.1,
    trendDirection: "down",
    hint: "Pending settlement",
    spark: [402, 396, 399, 394, 397, 392, 391],
    accent: "rose",
  },
  {
    id: "recovered",
    label: kpiLabels.recovered,
    value: programmeTotals.recovered,
    format: "currency",
    trend: 4.8,
    trendDirection: "up",
    hint: "From attachment & auction",
    spark: [98, 118, 108, 128, 120, 140, 148],
    accent: "success",
  },
  {
    id: "settled",
    label: kpiLabels.settled,
    value: programmeTotals.settled,
    format: "currency",
    trend: 5.6,
    trendDirection: "up",
    hint: "Released to depositors",
    spark: [72, 86, 80, 92, 88, 96, 98],
    accent: "success",
  },
]

export const funnelStages: FunnelStage[] = [
  {
    id: "submitted",
    label: "Claim submitted",
    count: 156_842,
    percent: 100,
    color: "#3b82f6",
  },
  {
    id: "verification",
    label: "Under Evaluation",
    count: 42_318,
    percent: 27.0,
    color: "#93c5fd",
  },
  {
    id: "docs",
    label: "Pending additional documents",
    count: 18_654,
    percent: 11.9,
    color: "#f59e0b",
    detail: "Depositor must re-upload",
  },
  {
    id: "assessed",
    label: "Assessment completed",
    count: 98_420,
    percent: 62.8,
    color: "#0ea5e9",
    detail: "Eligible 86,214 · Not eligible 12,206",
  },
  {
    id: "approved",
    label: "Claim approved",
    count: 79_856,
    percent: 50.9,
    color: "#22c55e",
  },
  {
    id: "clarification",
    label: "Pending clarification",
    count: 6_412,
    percent: 4.1,
    color: "#fbbf24",
  },
  {
    id: "settlement",
    label: "Settlement amount calculated",
    count: 71_280,
    percent: 45.4,
    color: "#22c55e",
  },
  {
    id: "paid",
    label: "Payment disbursed",
    count: 58_940,
    percent: 37.6,
    color: "#16a34a",
  },
  {
    id: "closed",
    label: "Claim settled",
    count: 52_118,
    percent: 33.2,
    color: "#15803d",
  },
]

/** Unique money breakdown — not repeated in the top cards */
export const financialMetrics: FinancialMetric[] = [
  {
    id: "approved-liability",
    label: "Total Approved Settlement Amount",
    value: 2_864_20_00_000,
    format: "currency",
    barPercent: 72,
    tone: "info",
  },
  {
    id: "previous-returns",
    label: "Amount Already Received by Depositors",
    value: 184_30_00_000,
    format: "currency",
    barPercent: 15,
    tone: "success",
  },
  {
    id: "net-payable",
    label: "Outstanding Settlement Liability",
    value: 1_877_75_00_000,
    format: "currency",
    barPercent: 65,
    tone: "gold",
  },
  {
    id: "available-fund",
    label: "Funds Available for Immediate Settlement",
    value: 262_15_00_000,
    format: "currency",
    barPercent: 21,
    tone: "success",
  },
  {
    id: "equitable-ratio",
    label: "Settlement Distribution Percentage",
    value: 34.5,
    format: "percent",
    barPercent: 34.5,
    tone: "navy",
  },
]

export const financialFooterStats = [
  {
    id: "total-cash",
    label: "Total funds available",
    value: "₹5,188 Cr",
    icon: "pie" as const,
    accent: "#3b82f6",
  },
  {
    id: "eligible",
    label: "Eligible depositors",
    value: "2,48,652",
    icon: "users" as const,
    accent: "#60a5fa",
  },
  {
    id: "disbursement",
    label: "Disbursement progress",
    value: "65.2%",
    icon: "shield" as const,
    accent: "#0ea5e9",
  },
]

export const claimsOverTime = [
  { month: "Jan", processed: 8_420, submitted: 12_100 },
  { month: "Feb", processed: 9_180, submitted: 11_450 },
  { month: "Mar", processed: 11_240, submitted: 14_820 },
  { month: "Apr", processed: 10_560, submitted: 13_210 },
  { month: "May", processed: 13_890, submitted: 16_400 },
  { month: "Jun", processed: 15_220, submitted: 15_980 },
  { month: "Jul", processed: 12_640, submitted: 14_220 },
]

export const fundComparison = [
  { entity: "IMA Jewels", recovered: 682, liability: 2140, paid: 498 },
  { entity: "Lancer Finance", recovered: 312, liability: 980, paid: 265 },
  { entity: "Innovative BC", recovered: 148, liability: 420, paid: 126 },
  { entity: "Surya Chits", recovered: 65, liability: 149, paid: 48 },
  { entity: "Other entities", recovered: 106, liability: 245, paid: 97 },
]

export const claimsByEntity = [
  { name: "IMA Jewels", claims: 96_420, color: "#0ea5e9", icon: "gem" as const },
  { name: "Lancer Finance", claims: 34_860, color: "#3b82f6", icon: "landmark" as const },
  { name: "Innovative Business Centre", claims: 14_210, color: "#60a5fa", icon: "building" as const },
  { name: "Surya Chits", claims: 5_842, color: "#f97316", icon: "sun" as const },
  { name: "Riddhi Finance", claims: 1_100, color: "#0ea5e9", icon: "users" as const },
  { name: "Other entities", claims: 4_410, color: "#38bdf8", icon: "users" as const },
]

export const assetRecovery = [
  {
    stage: "Properties taken over",
    count: 428,
    amount: 2_014_00_00_000,
    percent: 100,
    detail: "Properties attached and taken into custody",
  },
  {
    stage: "Value assessed",
    count: 386,
    amount: 1_812_60_00_000,
    percent: 90,
    detail: "Official valuation completed; ready for auction",
  },
  {
    stage: "Sold in auction",
    count: 298,
    amount: 1_409_80_00_000,
    percent: 70,
    detail: "Properties disposed through court auction",
  },
  {
    stage: "Money received",
    count: 264,
    amount: programmeTotals.recovered,
    percent: 62,
    detail: "Auction sale amount deposited for depositor settlement",
  },
]

export const alerts: AlertItem[] = [
  {
    id: "a1",
    severity: "critical",
    title: "Same person filed twice",
    detail: "Same Aadhaar / PAN used for IMA Jewels and Lancer Finance",
    count: 128,
    time: "12 min ago",
  },
  {
    id: "a2",
    severity: "warning",
    title: "Document amounts do not match",
    detail: "Bond amount is different from bank statement",
    count: 346,
    time: "28 min ago",
  },
  {
    id: "a3",
    severity: "warning",
    title: "Waiting for officer reply",
    detail: "Claims need a decision from the authority",
    count: 6_412,
    time: "1 hr ago",
  },
  {
    id: "a4",
    severity: "info",
    title: "Depositors must upload documents again",
    detail: "Extra documents window is still open",
    count: 18_654,
    time: "2 hr ago",
  },
  {
    id: "a5",
    severity: "critical",
    title: "Last date to file claims soon",
    detail: "Innovative Business Centre — closes 20 Jul 2026",
    count: 1,
    time: "Today",
  },
]

export const reports: ReportItem[] = [
  {
    id: "fe",
    title: "Report by fraudulent entities",
    description: "Claims, recovered amounts, and disbursements for each fraudulent entity",
    href: "/reports/scam-companies",
    to: "/reports/scam-companies",
    icon: "building",
  },
  {
    id: "investor",
    title: "Report by depositor",
    description: "Depositor-wise claim and payment details",
    href: "/reports/victims",
    to: "/reports/victims",
    icon: "user",
  },
  {
    id: "assessment",
    title: "Eligibility report",
    description: "Who is eligible, who is not, and what is still pending",
    href: "/reports/eligibility",
    to: "/reports/eligibility",
    icon: "clipboard",
  },
  {
    id: "settlement",
    title: "Settlement report",
    description: "Fund allocation and outstanding settlement liability",
    href: "/reports/settlement",
    to: "/reports/settlement",
    icon: "wallet",
  },
  {
    id: "payment",
    title: "Bank payment report",
    description: "Amounts disbursed to depositors with bank / UTR references",
    href: "/reports/payments",
    to: "/reports/payments",
    icon: "bank",
  },
  {
    id: "audit",
    title: "Court & audit report",
    description: "Case references and full activity history",
    href: "/reports/audit",
    to: "/reports/audit",
    icon: "scale",
  },
]

export const searchPlaceholders = [
  "Aadhaar",
  "PAN",
  "Mobile Number",
  "Customer ID",
  "Bond / MOU Number",
  "Claim Number",
]

export const sampleSearchHits = [
  {
    id: "CLM-2024-IMA-88421",
    name: "Rajesh Kumar Sharma",
    type: "Claim",
    fe: "IMA Jewels",
    status: "Settlement Calculated",
  },
  {
    id: "DEP-LC-109284",
    name: "Priya Natarajan",
    type: "Depositor",
    fe: "Lancer Finance",
    status: "Approved",
  },
  {
    id: "BOND-IBC-55201",
    name: "Mohammed Irfan",
    type: "Bond / MOU",
    fe: "Innovative Business Centre",
    status: "Under Verification",
  },
]

export const userMeta = {
  name: "Super Admin",
  role: "Special Officer and Competent Authority",
  initials: "SA",
  greeting: "Live programme indicators from claims intake, verification, asset recovery, and settlement.",
}

export type NavItem = {
  id: string
  label: string
  icon: NavIcon
  badge?: string
}

export type NavIcon =
  | "overview"
  | "analytics"
  | "registration"
  | "entities"
  | "depositors"
  | "claims"
  | "delayed"
  | "verification"
  | "assessment"
  | "settlement"
  | "payments"
  | "recovery"
  | "alerts"
  | "reports"
  | "audit"
  | "master"

export type NavGroup = {
  heading?: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    items: [
      { id: "overview", label: "Home overview", icon: "overview" },
      { id: "analytics", label: "Charts & trends", icon: "analytics" },
    ],
  },
  {
    heading: "Claim settlement",
    items: [
      { id: "claim-registration", label: "Claim Registration", icon: "registration" },
      { id: "delayed-claims", label: "Delayed Claims", icon: "delayed" },
      { id: "entities", label: "Fraudulent entities", icon: "entities", badge: String(feCompanies.length) },
      { id: "depositors", label: "Depositors", icon: "depositors" },
      { id: "claims", label: "Claims", icon: "claims" },
      { id: "verification", label: "Document verification", icon: "verification", badge: "42K" },
      { id: "assessment", label: "Assessment", icon: "assessment" },
      { id: "settlement", label: "Settlement calculation", icon: "settlement" },
      { id: "payments", label: "Bank payments", icon: "payments" },
      { id: "recovery", label: "Asset recovery", icon: "recovery" },
    ],
  },
  {
    heading: "Checks & records",
    items: [
      { id: "alerts", label: "Alerts", icon: "alerts", badge: "5" },
      { id: "reports", label: "Detailed reports", icon: "reports" },
      { id: "audit", label: "Court & audit", icon: "audit" },
      { id: "master", label: "Master lists", icon: "master" },
    ],
  },
]


export type Territory = {
  id: string
  name: string
  claims: number
  percent: number
  color: string
  // position within the decorative hero map viewBox (0-100 space)
  x: number
  y: number
  size: number
}

export const territories: Territory[] = [
  { id: "blr", name: "Bengaluru", claims: 98_420, percent: 62, color: "#3b82f6", x: 63, y: 70, size: 5 },
  { id: "mys", name: "Mysuru", claims: 24_860, percent: 16, color: "#0ea5e9", x: 50, y: 80, size: 4 },
  { id: "blg", name: "Belagavi", claims: 14_210, percent: 9, color: "#22c55e", x: 26, y: 30, size: 3.4 },
  { id: "klb", name: "Kalaburagi", claims: 9_842, percent: 6, color: "#f59e0b", x: 55, y: 20, size: 3 },
  { id: "mng", name: "Mangaluru", claims: 6_510, percent: 4, color: "#f43f5e", x: 30, y: 66, size: 2.8 },
  { id: "hbl", name: "Hubballi", claims: 3_000, percent: 3, color: "#93c5fd", x: 34, y: 44, size: 2.6 },
]

/** Keys match GeoJSON `properties.district` (Census naming). */
export type DistrictStat = {
  geoName: string
  displayName: string
  claims: number
  percent: number
}

export const districtStats: DistrictStat[] = [
  { geoName: "Bangalore", displayName: "Bengaluru Urban", claims: 78_420, percent: 50.0 },
  { geoName: "Bangalore Rural", displayName: "Bengaluru Rural", claims: 12_840, percent: 8.2 },
  { geoName: "Mysore", displayName: "Mysuru", claims: 14_210, percent: 9.1 },
  { geoName: "Belgaum", displayName: "Belagavi", claims: 8_640, percent: 5.5 },
  { geoName: "Dakshina Kannada", displayName: "Dakshina Kannada", claims: 5_820, percent: 3.7 },
  { geoName: "Dharwad", displayName: "Dharwad", claims: 4_680, percent: 3.0 },
  { geoName: "Gulbarga", displayName: "Kalaburagi", claims: 4_120, percent: 2.6 },
  { geoName: "Tumkur", displayName: "Tumakuru", claims: 3_540, percent: 2.3 },
  { geoName: "Bellary", displayName: "Ballari", claims: 2_980, percent: 1.9 },
  { geoName: "Shimoga", displayName: "Shivamogga", claims: 2_640, percent: 1.7 },
  { geoName: "Hassan", displayName: "Hassan", claims: 2_410, percent: 1.5 },
  { geoName: "Mandya", displayName: "Mandya", claims: 2_180, percent: 1.4 },
  { geoName: "Udupi", displayName: "Udupi", claims: 1_960, percent: 1.3 },
  { geoName: "Davanagere", displayName: "Davanagere", claims: 1_840, percent: 1.2 },
  { geoName: "Kolar", displayName: "Kolar", claims: 1_720, percent: 1.1 },
  { geoName: "Chikkaballapura", displayName: "Chikkaballapura", claims: 1_540, percent: 1.0 },
  { geoName: "Ramanagara", displayName: "Ramanagara", claims: 1_420, percent: 0.9 },
  { geoName: "Bijapur", displayName: "Vijayapura", claims: 1_310, percent: 0.8 },
  { geoName: "Raichur", displayName: "Raichur", claims: 1_180, percent: 0.8 },
  { geoName: "Bidar", displayName: "Bidar", claims: 1_060, percent: 0.7 },
  { geoName: "Bagalkot", displayName: "Bagalkot", claims: 980, percent: 0.6 },
  { geoName: "Chitradurga", displayName: "Chitradurga", claims: 920, percent: 0.6 },
  { geoName: "Uttara Kannada", displayName: "Uttara Kannada", claims: 860, percent: 0.5 },
  { geoName: "Haveri", displayName: "Haveri", claims: 780, percent: 0.5 },
  { geoName: "Gadag", displayName: "Gadag", claims: 720, percent: 0.5 },
  { geoName: "Koppal", displayName: "Koppal", claims: 640, percent: 0.4 },
  { geoName: "Chikmagalur", displayName: "Chikkamagaluru", claims: 580, percent: 0.4 },
  { geoName: "Kodagu", displayName: "Kodagu", claims: 420, percent: 0.3 },
  { geoName: "Chamrajnagar", displayName: "Chamarajanagara", claims: 380, percent: 0.2 },
  { geoName: "Yadgir", displayName: "Yadgir", claims: 340, percent: 0.2 },
]

export const districtStatsByGeoName = Object.fromEntries(
  districtStats.map((d) => [d.geoName, d]),
) as Record<string, DistrictStat>

/** Average days — unique vs top totals */
export const processingSpeed = [
  { id: "verify", label: "Document verification", value: 12, unit: "days", color: "#3b82f6" },
  { id: "assess", label: "Eligibility assessment", value: 18, unit: "days", color: "#0ea5e9" },
  { id: "settle", label: "Settlement calculation", value: 9, unit: "days", color: "#f59e0b" },
  { id: "pay", label: "Payment disbursement", value: 6, unit: "days", color: "#22c55e" },
  { id: "full", label: "Full processing cycle", value: 45, unit: "days", color: "#f43f5e" },
]

/** Module 5 — Claim Notification windows */
export type ClaimWindow = {
  id: string
  company: string
  companyId: string
  from: string
  to: string
  status: "open" | "closing-soon" | "closed"
  claimsReceived: number
}

export const claimWindows: ClaimWindow[] = [
  {
    id: "cw1",
    company: "IMA Jewels",
    companyId: "fe-ima",
    from: "01 Jan 2025",
    to: "31 Dec 2026",
    status: "open",
    claimsReceived: 98_420,
  },
  {
    id: "cw2",
    company: "Lancer Finance",
    companyId: "fe-lancer",
    from: "15 Mar 2025",
    to: "30 Sep 2026",
    status: "open",
    claimsReceived: 34_860,
  },
  {
    id: "cw3",
    company: "Innovative Business Centre",
    companyId: "fe-ibc",
    from: "01 Apr 2025",
    to: "20 Jul 2026",
    status: "closing-soon",
    claimsReceived: 14_210,
  },
]

/** Module 7 — Assessment outcome (eligible / not eligible) */
export const eligibilityOutcomes = [
  {
    id: "eligible",
    label: "Eligible for settlement",
    count: 86_214,
    hint: "Eligible for settlement share from recovered assets",
    tone: "success" as const,
  },
  {
    id: "not-eligible",
    label: "Not eligible",
    count: 12_206,
    hint: "Failed verification / incomplete documents / ineligible under rules",
    tone: "rose" as const,
  },
  {
    id: "waiting",
    label: "Still under assessment",
    count: 42_318,
    hint: "Under officer assessment",
    tone: "gold" as const,
  },
]

/** Module 7 — Assessment outcome (eligible / not eligible) */
export const safetyChecks = [
  // { id: "dup-fe", label: "Duplicate Fraudulent Entities Prevented", count: 4, hint: "Duplicate Fraudulent Entity records prevented during registration." },
  { id: "dup-person", label: "Duplicate Depositor Profiles Merged", count: 1_842, hint: "Aadhaar, PAN, Mobile Number" },
  { id: "dup-claim", label: "Duplicate Claims Prevented", count: 128, hint: "Duplicate claim applications detected before processing." },
  { id: "dup-pay", label: "Duplicate Settlement Payments Prevented", count: 37, hint: "Duplicate payment attempts identified and blocked." },
  { id: "mismatch", label: "Deposit Data Mismatches Identified", count: 346, hint: "Differences detected between deposit records and supporting documents." },
]
