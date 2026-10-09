import { claimRecords, victimRecords } from "@/data/kpi-drilldown-data"
import { feCompanies } from "@/data/kpi-drilldown-data"

export type VictimReportRow = {
  id: string
  victimId: string
  name: string
  customerId: string
  pan: string
  district: string
  companies: number
  schemes: number
  invested: number
  returnsTaken: number
  outstanding: number
  primaryCompany: string
  accent: string
}

export function getVictimReportRows(): VictimReportRow[] {
  return victimRecords.map((v) => {
    const invested = v.investments.reduce((s, i) => s + i.invested, 0)
    const returnsTaken = v.investments.reduce((s, i) => s + i.returnsTaken, 0)
    const companies = new Set(v.investments.map((i) => i.companyId))
    const primary = v.investments[0]
    const accent =
      feCompanies.find((c) => c.id === primary?.companyId)?.accent ?? "#6366f1"
    return {
      id: v.id,
      victimId: v.id,
      name: v.name,
      customerId: v.customerId,
      pan: v.pan,
      district: v.district,
      companies: companies.size,
      schemes: v.investments.length,
      invested,
      returnsTaken,
      outstanding: Math.max(0, invested - returnsTaken),
      primaryCompany: primary?.companyName ?? "—",
      accent,
    }
  })
}

export type EligibilityStatus =
  | "Eligible"
  | "Not eligible"
  | "Under assessment"
  | "Documents pending"

export type EligibilityReportRow = {
  id: string
  claimId: string
  claimRecordId: string
  name: string
  customerId: string
  district: string
  status: EligibilityStatus
  claimAmount: number
  company: string
  accent: string
}

function mapClaimToEligibility(status: string): EligibilityStatus {
  const s = status.toLowerCase()
  if (s.includes("settlement") || s.includes("approved") || s.includes("payment"))
    return "Eligible"
  if (s.includes("document")) return "Documents pending"
  if (s.includes("verification")) return "Under assessment"
  return "Not eligible"
}

export function getEligibilityReportRows(): EligibilityReportRow[] {
  return claimRecords.map((c) => {
    const primary = c.investments[0]
    const accent =
      feCompanies.find((x) => x.id === primary?.companyId)?.accent ?? "#22c55e"
    return {
      id: c.id,
      claimId: c.claimId,
      claimRecordId: c.id,
      name: c.name,
      customerId: c.customerId,
      district: c.district,
      status: mapClaimToEligibility(c.status),
      claimAmount: c.claimAmount,
      company: primary?.companyName ?? "—",
      accent,
    }
  })
}

export type BankPaymentRow = {
  id: string
  claimId: string
  claimRecordId: string
  name: string
  customerId: string
  district: string
  amount: number
  bank: string
  accountMasked: string
  utr: string
  paidOn: string
  status: "Paid" | "Queued" | "Failed" | "Processing"
  accent: string
}

const banks = [
  "SBI",
  "Canara Bank",
  "HDFC Bank",
  "Axis Bank",
  "Bank of Baroda",
  "Karnataka Bank",
]

export function getBankPaymentRows(): BankPaymentRow[] {
  return claimRecords.map((c, i) => {
    const primary = c.investments[0]
    const accent =
      feCompanies.find((x) => x.id === primary?.companyId)?.accent ?? "#0ea5e9"
    const statusLower = c.status.toLowerCase()
    let status: BankPaymentRow["status"] = "Processing"
    if (statusLower.includes("payment") || statusLower.includes("approved"))
      status = i % 5 === 0 ? "Queued" : "Paid"
    else if (statusLower.includes("settlement")) status = "Paid"
    else if (statusLower.includes("document")) status = "Queued"
    else if (i % 7 === 0) status = "Failed"

    const day = 10 + (i % 18)
    return {
      id: `pay-${c.id}`,
      claimId: c.claimId,
      claimRecordId: c.id,
      name: c.name,
      customerId: c.customerId,
      district: c.district,
      amount: Math.round(c.claimAmount * (status === "Paid" ? 0.34 : 0.34)),
      bank: banks[i % banks.length],
      accountMasked: `XXXX${String(1000 + i * 37).slice(-4)}`,
      utr:
        status === "Paid"
          ? `UTR${2026000000 + i * 117 + day}`
          : status === "Failed"
            ? "—"
            : "Pending",
      paidOn: status === "Paid" ? `${day} Jun 2026` : "—",
      status,
      accent,
    }
  })
}

export type AuditEventRow = {
  id: string
  ref: string
  title: string
  detail: string
  actor: string
  when: string
  category: "Court" | "Audit" | "Authority" | "System"
  accent: string
}

export const auditEventRows: AuditEventRow[] = [
  {
    id: "au-1",
    ref: "WP 18421/2024",
    title: "High Court status update filed",
    detail: "Interim directions on equitable distribution for IMA Jewels depositors",
    actor: "Standing Counsel",
    when: "12 Jul 2026 · 16:20",
    category: "Court",
    accent: "#f43f5e",
  },
  {
    id: "au-2",
    ref: "AUD-CSMS-0626",
    title: "Internal audit review closed",
    detail: "128 dual-filing cases reviewed; 37 duplicate payouts blocked",
    actor: "Audit Cell",
    when: "11 Jul 2026 · 11:05",
    category: "Audit",
    accent: "#8b5cf6",
  },
  {
    id: "au-3",
    ref: "CA-ORD-4412",
    title: "Competent Authority order published",
    detail: "Settlement ratio revised to 34.5% for current recovery pool",
    actor: "Competent Authority",
    when: "10 Jul 2026 · 18:40",
    category: "Authority",
    accent: "#3b82f6",
  },
  {
    id: "au-4",
    ref: "SYS-PAY-99201",
    title: "Bulk NEFT batch acknowledged",
    detail: "2,840 depositor credits accepted by sponsor bank gateway",
    actor: "Payment gateway",
    when: "10 Jul 2026 · 09:12",
    category: "System",
    accent: "#0ea5e9",
  },
  {
    id: "au-5",
    ref: "WP 9021/2025",
    title: "Lancer Finance impleadment noted",
    detail: "Additional respondents impleaded; next listing 28 Jul 2026",
    actor: "Registry",
    when: "09 Jul 2026 · 14:55",
    category: "Court",
    accent: "#f43f5e",
  },
  {
    id: "au-6",
    ref: "AUD-FE-IMA",
    title: "Asset recovery trail verified",
    detail: "Auction proceeds ₹186 Cr traced to escrow for IMA Jewels",
    actor: "Recovery Audit",
    when: "08 Jul 2026 · 17:30",
    category: "Audit",
    accent: "#8b5cf6",
  },
  {
    id: "au-7",
    ref: "CA-NOT-1180",
    title: "Claim window reminder issued",
    detail: "IBC claim window closes 20 Jul 2026 — public notice published",
    actor: "Competent Authority",
    when: "07 Jul 2026 · 10:00",
    category: "Authority",
    accent: "#3b82f6",
  },
  {
    id: "au-8",
    ref: "SYS-KYC-441",
    title: "KYC mismatch queue escalated",
    detail: "346 bond vs bank mismatches flagged for officer review",
    actor: "Verification engine",
    when: "06 Jul 2026 · 13:22",
    category: "System",
    accent: "#0ea5e9",
  },
]
