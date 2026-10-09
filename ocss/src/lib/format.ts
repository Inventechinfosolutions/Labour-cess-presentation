const crore = 1_00_00_000
const lakh = 1_00_000

export function formatINR(value: number, compact = true): string {
  if (!compact) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value)
  }

  const abs = Math.abs(value)
  if (abs >= crore) {
    const cr = value / crore
    return `₹${cr.toLocaleString("en-IN", {
      maximumFractionDigits: cr >= 100 ? 0 : 2,
    })} Cr`
  }
  if (abs >= lakh) {
    const lk = value / lakh
    return `₹${lk.toLocaleString("en-IN", {
      maximumFractionDigits: lk >= 100 ? 0 : 2,
    })} L`
  }
  return `₹${value.toLocaleString("en-IN")}`
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-IN")
}

export function formatPercent(value: number): string {
  return `${value.toLocaleString("en-IN", { maximumFractionDigits: 1 })}%`
}

export function formatKpiValue(
  value: number,
  format: "number" | "currency" | "percent",
): string {
  if (format === "currency") return formatINR(value)
  if (format === "percent") return formatPercent(value)
  return formatNumber(value)
}

export function cnTrend(direction: "up" | "down" | "flat"): string {
  if (direction === "up") return "text-success"
  if (direction === "down") return "text-warning"
  return "text-muted-foreground"
}
