import type { Report } from "@/types"

export const reports: Report[] = [
  {
    id: "rpt-daily",
    title: "Daily Report",
    type: "daily",
    description: "Today's bookings, check-ins, and occupancy snapshot",
    generatedAt: "2026-06-10T08:00:00Z",
    metrics: {
      newBookings: 12,
      checkIns: 8,
      checkOuts: 5,
      occupancy: "74%",
      revenue: "₹1,24,500",
    },
  },
  {
    id: "rpt-weekly",
    title: "Weekly Report",
    type: "weekly",
    description: "7-day performance across all guest house sites",
    generatedAt: "2026-06-09T00:00:00Z",
    metrics: {
      totalBookings: 86,
      avgOccupancy: "76%",
      topSite: "Bengaluru",
      revenue: "₹8,45,200",
      cancellations: 3,
    },
  },
  {
    id: "rpt-monthly",
    title: "Monthly Report",
    type: "monthly",
    description: "Comprehensive monthly analytics and trends",
    generatedAt: "2026-06-01T00:00:00Z",
    metrics: {
      totalBookings: 342,
      avgOccupancy: "78%",
      totalGuests: 512,
      revenue: "₹32,15,800",
      utilization: "82%",
    },
  },
  {
    id: "rpt-revenue",
    title: "Revenue Report",
    type: "revenue",
    description: "Financial breakdown by site and room category",
    generatedAt: "2026-06-10T08:00:00Z",
    metrics: {
      totalRevenue: "₹32,15,800",
      standardRooms: "₹12,40,000",
      deluxeRooms: "₹11,85,600",
      executiveSuites: "₹7,90,200",
      taxes: "₹5,78,400",
    },
  },
]
