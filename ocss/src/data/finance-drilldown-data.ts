import {
  financialFooterStats,
  financialMetrics,
  type FinancialMetric,
} from "@/data/dashboard-data"
import { feCompanies, kpiLabels } from "@/data/kpi-drilldown-data"
import { formatINR, formatNumber, formatPercent } from "@/lib/format"

export const financeMetricIds = [
  "available-fund",
  "approved-liability",
  "previous-returns",
  "net-payable",
  "equitable-ratio",
] as const

export type FinanceMetricId = (typeof financeMetricIds)[number]

export type FinanceBreakdownRow = {
  id: string
  companyId?: string
  title: string
  subtitle: string
  accent: string
  primary: string
  primaryLabel: string
  secondary: string
  secondaryLabel: string
  tertiary?: string
  tertiaryLabel?: string
  barPercent: number
}

export type FinanceMetricDetail = {
  metric: FinancialMetric
  eyebrow: string
  description: string
  accent: string
  soft: string
  highlights: { label: string; value: string; hint: string; color: string; soft: string }[]
  sectionTitle: string
  sectionHint: string
  rows: FinanceBreakdownRow[]
}

const toneAccent = {
  navy: "#0ea5e9",
  info: "#3b82f6",
  success: "#16a34a",
  gold: "#f59e0b",
  warning: "#f43f5e",
} as const

const toneSoft = {
  navy: "#e0f2fe",
  info: "#dbeafe",
  success: "#dcfce7",
  gold: "#fef3c7",
  warning: "#ffe4e6",
} as const

function companyShare(total: number, weight: number, weightsSum: number) {
  if (weightsSum <= 0) return 0
  return Math.round(total * (weight / weightsSum))
}

export function getFinanceMetricDetail(
  metricId: string,
): FinanceMetricDetail | null {
  const metric = financialMetrics.find((m) => m.id === metricId)
  if (!metric || !financeMetricIds.includes(metricId as FinanceMetricId)) {
    return null
  }

  const accent = toneAccent[metric.tone]
  const soft = toneSoft[metric.tone]
  const weightSum = feCompanies.reduce((s, c) => s + c.totalAmount, 0)
  const recoveredSum = feCompanies.reduce((s, c) => s + c.recovered, 0)
  const settledSum = feCompanies.reduce((s, c) => s + c.settled, 0)
  const liabilitySum = feCompanies.reduce((s, c) => s + c.liability, 0)

  const totalCash = financialFooterStats.find((s) => s.id === "total-cash")?.value ?? "—"
  const eligible = financialFooterStats.find((s) => s.id === "eligible")?.value ?? "—"
  const disbursement =
    financialFooterStats.find((s) => s.id === "disbursement")?.value ?? "—"

  switch (metricId as FinanceMetricId) {
    case "available-fund": {
      const rows = [...feCompanies]
        .sort((a, b) => b.recovered - a.recovered)
        .map((c) => {
          const cash = companyShare(metric.value, c.recovered, recoveredSum)
          const share =
            metric.value > 0 ? (cash / metric.value) * 100 : 0
          return {
            id: c.id,
            companyId: c.id,
            title: c.name,
            subtitle: `${formatINR(c.recovered)} recovered into pool`,
            accent: c.accent,
            primary: formatINR(cash),
            primaryLabel: "cash ready",
            secondary: formatPercent(share),
            secondaryLabel: "of ready cash",
            tertiary: formatNumber(c.victims),
            tertiaryLabel: "depositors",
            barPercent: share,
          }
        })

      return {
        metric,
        eyebrow: "Settlement funds · Available balance",
        description:
          "Funds that can be disbursed to eligible depositors, allocated from recovered assets by fraudulent entities.",
        accent,
        soft,
        highlights: [
          {
            label: metric.label,
            value: formatINR(metric.value),
            hint: `${metric.barPercent}% of total cash pool`,
            color: accent,
            soft,
          },
          {
            label: "Total funds available",
            value: totalCash,
            hint: "All accounts under CSMS custody",
            color: "#3b82f6",
            soft: "#dbeafe",
          },
          {
            label: "Eligible depositors",
            value: eligible,
            hint: "Can receive a share today",
            color: "#0ea5e9",
            soft: "#e0f2fe",
          },
          {
            label: "Disbursement progress",
            value: disbursement,
            hint: "Overall payout completion",
            color: "#16a34a",
            soft: "#dcfce7",
          },
        ],
        sectionTitle: "Fraudulent entity-wise available funds",
        sectionHint:
          "Share of liquid cash attributed from each entity’s recovered assets.",
        rows,
      }
    }

    case "approved-liability": {
      const rows = [...feCompanies]
        .sort((a, b) => b.liability - a.liability)
        .map((c) => {
          const approved = companyShare(metric.value, c.liability, liabilitySum)
          const share =
            metric.value > 0 ? (approved / metric.value) * 100 : 0
          return {
            id: c.id,
            companyId: c.id,
            title: c.name,
            subtitle: `${formatNumber(c.claims)} claims · ${formatINR(c.liability)} liability`,
            accent: c.accent,
            primary: formatINR(approved),
            primaryLabel: "approved",
            secondary: formatPercent(share),
            secondaryLabel: "of approved total",
            tertiary: formatINR(c.settled),
            tertiaryLabel: "already paid",
            barPercent: share,
          }
        })

      return {
        metric,
        eyebrow: "Settlement funds · Approved liability",
        description:
          "Amounts approved for payment to depositors after verification — before final bank credit.",
        accent,
        soft,
        highlights: [
          {
            label: metric.label,
            value: formatINR(metric.value),
            hint: "Across all fraudulent entities",
            color: accent,
            soft,
          },
          {
            label: kpiLabels.settled,
            value: formatINR(settledSum),
            hint: "Credits completed to date",
            color: "#16a34a",
            soft: "#dcfce7",
          },
          {
            label: kpiLabels.liability,
            value: formatINR(liabilitySum),
            hint: "Gross exposure still on books",
            color: "#f43f5e",
            soft: "#ffe4e6",
          },
          {
            label: "Eligible depositors",
            value: eligible,
            hint: "In the approval universe",
            color: "#0ea5e9",
            soft: "#e0f2fe",
          },
        ],
        sectionTitle: "Approved amount by fraudulent entity",
        sectionHint:
          "How the approved payment pool maps to each fraudulent entity.",
        rows,
      }
    }

    case "previous-returns": {
      const rows = [...feCompanies]
        .sort((a, b) => b.settled - a.settled)
        .map((c) => {
          // Approximate earlier company-paid returns as a share of the metric
          const earlier = companyShare(metric.value, c.settled || c.recovered, settledSum || recoveredSum)
          const share =
            metric.value > 0 ? (earlier / metric.value) * 100 : 0
          return {
            id: c.id,
            companyId: c.id,
            title: c.name,
            subtitle: "Returns depositors already received from the entity",
            accent: c.accent,
            primary: formatINR(earlier),
            primaryLabel: "earlier returns",
            secondary: formatINR(c.settled),
            secondaryLabel: "CSMS paid later",
            tertiary: formatPercent(share),
            tertiaryLabel: "of earlier total",
            barPercent: share,
          }
        })

      return {
        metric,
        eyebrow: "Settlement funds · Earlier returns",
        description:
          "Amounts fraudulent entities paid to depositors before CSMS settlement — deducted when calculating equitable share.",
        accent,
        soft,
        highlights: [
          {
            label: metric.label,
            value: formatINR(metric.value),
            hint: "Pre-settlement payouts by fraudulent entities",
            color: accent,
            soft,
          },
          {
            label: kpiLabels.settled,
            value: formatINR(settledSum),
            hint: "Paid through the settlement programme",
            color: "#3b82f6",
            soft: "#dbeafe",
          },
          {
            label: kpiLabels.recovered,
            value: formatINR(recoveredSum),
            hint: "Feeds current cash pool",
            color: "#16a34a",
            soft: "#dcfce7",
          },
          {
            label:
              financialMetrics.find((m) => m.id === "equitable-ratio")?.label ??
              "Settlement Distribution Percentage",
            value: formatPercent(
              financialMetrics.find((m) => m.id === "equitable-ratio")?.value ??
                34.5,
            ),
            hint: "After adjusting earlier returns",
            color: "#0ea5e9",
            soft: "#e0f2fe",
          },
        ],
        sectionTitle: "Earlier returns by fraudulent entity",
        sectionHint:
          "Estimated pre-CSMS returns attributed to each fraudulent entity.",
        rows,
      }
    }

    case "net-payable": {
      const rows = [...feCompanies]
        .sort((a, b) => b.liability - b.settled - (a.liability - a.settled))
        .map((c) => {
          const left = Math.max(0, c.liability - c.settled)
          const arranged = companyShare(metric.value, left || c.liability, liabilitySum)
          const share =
            metric.value > 0 ? (arranged / metric.value) * 100 : 0
          return {
            id: c.id,
            companyId: c.id,
            title: c.name,
            subtitle: `${formatINR(left)} still on liability books`,
            accent: c.accent,
            primary: formatINR(arranged),
            primaryLabel: "to arrange",
            secondary: formatINR(c.settled),
            secondaryLabel: "already paid",
            tertiary: formatPercent(share),
            tertiaryLabel: "of funding gap",
            barPercent: share,
          }
        })

      return {
        metric,
        eyebrow: "Settlement funds · Funding gap",
        description:
          "Additional funds required so approved depositors can be paid in full under the current settlement plan.",
        accent,
        soft,
        highlights: [
          {
            label: metric.label,
            value: formatINR(metric.value),
            hint: "Funding gap for approved payouts",
            color: accent,
            soft,
          },
          {
            label:
              financialMetrics.find((m) => m.id === "available-fund")?.label ??
              "Funds Available for Immediate Settlement",
            value: formatINR(
              financialMetrics.find((m) => m.id === "available-fund")?.value ??
                0,
            ),
            hint: "Can cover part of the gap today",
            color: "#16a34a",
            soft: "#dcfce7",
          },
          {
            label:
              financialMetrics.find((m) => m.id === "approved-liability")
                ?.label ?? "Total Approved Settlement Amount",
            value: formatINR(
              financialMetrics.find((m) => m.id === "approved-liability")
                ?.value ?? 0,
            ),
            hint: "Total approved for payment",
            color: "#3b82f6",
            soft: "#dbeafe",
          },
          {
            label: "Disbursement progress",
            value: disbursement,
            hint: "How far payouts have run",
            color: "#0ea5e9",
            soft: "#e0f2fe",
          },
        ],
        sectionTitle: "Funding gap by fraudulent entity",
        sectionHint:
          "Where additional funds are still required across  fraudulent entities.",
        rows,
      }
    }

    case "equitable-ratio": {
      const ratio = metric.value
      const rows = [...feCompanies]
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .map((c) => {
          const entitled = Math.round(c.totalAmount * (ratio / 100))
          const paidShare =
            entitled > 0 ? Math.min(100, (c.settled / entitled) * 100) : 0
          return {
            id: c.id,
            companyId: c.id,
            title: c.name,
            subtitle: `${formatPercent(ratio)} of ${formatINR(c.totalAmount)} deposits`,
            accent: c.accent,
            primary: formatINR(entitled),
            primaryLabel: "fair-share pool",
            secondary: formatINR(c.settled),
            secondaryLabel: "paid so far",
            tertiary: formatPercent(paidShare),
            tertiaryLabel: "of fair share paid",
            barPercent: Math.min(100, paidShare),
          }
        })

      return {
        metric,
        eyebrow: "Settlement funds · Equitable share",
        description:
          "Current equitable distribution percentage — share of deposits depositors receive from the recovery pool.",
        accent,
        soft,
        highlights: [
          {
            label: metric.label,
            value: formatPercent(ratio),
            hint: "Applied programme-wide today",
            color: accent,
            soft,
          },
          {
            label:
              financialMetrics.find((m) => m.id === "available-fund")?.label ??
              "Funds Available for Immediate Settlement",
            value: formatINR(
              financialMetrics.find((m) => m.id === "available-fund")?.value ??
                0,
            ),
            hint: "Funds supporting this ratio",
            color: "#16a34a",
            soft: "#dcfce7",
          },
          {
            label: "Eligible depositors",
            value: eligible,
            hint: "Receive this fair share",
            color: "#3b82f6",
            soft: "#dbeafe",
          },
          {
            label: kpiLabels.investments,
            value: formatINR(weightSum),
            hint: "Base for fair-share calculation",
            color: "#f59e0b",
            soft: "#fef3c7",
          },
        ],
        sectionTitle: "Equitable share by fraudulent entity",
        sectionHint:
          "Entitled settlement pool at the current ratio versus amounts already disbursed through CSMS.",
        rows,
      }
    }

    default:
      return null
  }
}
