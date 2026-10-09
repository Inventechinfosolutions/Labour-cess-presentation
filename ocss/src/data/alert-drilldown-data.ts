import { alerts, type AlertItem } from "@/data/dashboard-data"
import { claimRecords, victimRecords } from "@/data/kpi-drilldown-data"
import { feCompanies } from "@/data/kpi-drilldown-data"

export type AlertCaseRow = {
  id: string
  title: string
  subtitle: string
  meta: string
  accent: string
  to?: "/victims/$victimId" | "/claims/$claimId" | "/companies/$companyId"
  params?:
    | { victimId: string }
    | { claimId: string }
    | { companyId: string }
}

export type AlertDetail = {
  alert: AlertItem
  accent: string
  soft: string
  actionHint: string
  cases: AlertCaseRow[]
}

const severityAccent = {
  critical: { accent: "#f43f5e", soft: "#ffe4e6" },
  warning: { accent: "#f59e0b", soft: "#fef3c7" },
  info: { accent: "#3b82f6", soft: "#dbeafe" },
} as const

function victimCases(limit = 6): AlertCaseRow[] {
  return victimRecords.slice(0, limit).map((v) => {
    const company = v.investments[0]?.companyName ?? "—"
    const accent =
      feCompanies.find((c) => c.id === v.investments[0]?.companyId)?.accent ??
      "#f43f5e"
    return {
      id: v.id,
      title: v.name,
      subtitle: `${v.customerId} · ${v.pan}`,
      meta: `${v.district} · ${company}`,
      accent,
      to: "/victims/$victimId",
      params: { victimId: v.id },
    }
  })
}

function claimCases(limit = 6): AlertCaseRow[] {
  return claimRecords.slice(0, limit).map((c) => {
    const company = c.investments[0]?.companyName ?? "—"
    const accent =
      feCompanies.find((x) => x.id === c.investments[0]?.companyId)?.accent ??
      "#f59e0b"
    return {
      id: c.id,
      title: c.name,
      subtitle: c.claimId,
      meta: `${c.status} · ${company}`,
      accent,
      to: "/claims/$claimId",
      params: { claimId: c.id },
    }
  })
}

export function getAlertDetail(alertId: string): AlertDetail | null {
  const alert = alerts.find((a) => a.id === alertId)
  if (!alert) return null

  const { accent, soft } = severityAccent[alert.severity]

  switch (alert.id) {
    case "a1":
      return {
        alert,
        accent,
        soft,
        actionHint:
          "Review linked Aadhaar / PAN pairs and merge or reject duplicate filings across fraudulent entities.",
        cases: victimCases(8).map((row, i) => ({
          ...row,
          meta: `${row.meta} · flagged pair #${i + 1}`,
        })),
      }
    case "a2":
      return {
        alert,
        accent,
        soft,
        actionHint:
          "Compare bond / MOU amounts with bank credits and request corrected uploads.",
        cases: claimCases(8).map((row) => ({
          ...row,
          meta: `${row.meta} · amount mismatch`,
        })),
      }
    case "a3":
      return {
        alert,
        accent,
        soft,
        actionHint:
          "Claims waiting for Competent Authority / officer decision — prioritise oldest first.",
        cases: claimRecords
          .filter((c) =>
            /verification|document|pending/i.test(c.status),
          )
          .concat(claimRecords)
          .slice(0, 8)
          .map((c) => {
            const accentC =
              feCompanies.find((x) => x.id === c.investments[0]?.companyId)
                ?.accent ?? accent
            return {
              id: c.id,
              title: c.name,
              subtitle: c.claimId,
              meta: `${c.status} · awaiting reply`,
              accent: accentC,
              to: "/claims/$claimId" as const,
              params: { claimId: c.id },
            }
          }),
      }
    case "a4":
      return {
        alert,
        accent,
        soft,
        actionHint:
          "Notify depositors to re-upload KYC / bond documents before the additional-documents window closes.",
        cases: claimCases(8).map((row) => ({
          ...row,
          meta: `${row.meta} · re-upload required`,
        })),
      }
    case "a5": {
      const ibc = feCompanies.find((c) => c.id === "fe-ibc")
      return {
        alert,
        accent,
        soft,
        actionHint:
          "Accelerate outreach for Innovative Business Centre — claim window closes 20 Jul 2026.",
        cases: [
          {
            id: "fe-ibc",
            title: "Innovative Business Centre",
            subtitle: "Claim window closing soon",
            meta: `${ibc ? ibc.claims.toLocaleString("en-IN") : "14,210"} claims · closes 20 Jul 2026`,
            accent: ibc?.accent ?? accent,
            to: "/companies/$companyId",
            params: { companyId: "fe-ibc" },
          },
          ...claimRecords
            .filter((c) => c.investments.some((i) => i.companyId === "fe-ibc"))
            .slice(0, 6)
            .map((c) => ({
              id: c.id,
              title: c.name,
              subtitle: c.claimId,
              meta: `${c.status} · IBC filing`,
              accent: ibc?.accent ?? accent,
              to: "/claims/$claimId" as const,
              params: { claimId: c.id },
            })),
        ],
      }
    }
    default:
      return {
        alert,
        accent,
        soft,
        actionHint: "Open related records and take the recommended officer action.",
        cases: claimCases(6),
      }
  }
}
