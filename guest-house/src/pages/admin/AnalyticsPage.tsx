import { useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { chartReveal } from "@/animations/gsap"
import { fetchAdminChartData, fetchAdminDashboardStats } from "@/services/adminApi"
import { getEnterpriseData } from "@/mock-data/enterprise"
import {
  AdminChartCard,
  AdminHeroMetric,
  AdminInsightTile,
  AdminSectionHeading,
  CHART_TOOLTIP_STYLE,
} from "@/components/admin/AdminAnalyticsUI"
import { ExportMenu } from "@/components/admin/ExportMenu"
import { PageHeader } from "@/components/shared/PageHeader"
import { Building2, Clock, Hotel, MapPin, TrendingUp, Users } from "lucide-react"
import { formatCurrency } from "@/utils/format"
import { usePageTransition, useRevealEffect } from "@/hooks/useGsap"

const LOCATION_PIE_COLORS = [
  "var(--primary)",
  "color-mix(in oklch, var(--primary) 75%, var(--chart-2))",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
]

export function AnalyticsPage() {
  const pageRef = usePageTransition()
  const chartsRef = useRef<HTMLDivElement>(null)

  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: fetchAdminDashboardStats,
  })
  const { data: charts } = useQuery({
    queryKey: ["admin-charts"],
    queryFn: fetchAdminChartData,
  })

  const topSites = getEnterpriseData().sites.sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  const topLocationPieData = topSites.map((site) => ({
    name: site.city,
    revenue: site.revenue,
  }))
  const topBuildings = getEnterpriseData().buildings.sort((a, b) => b.revenue - a.revenue).slice(0, 5)
  const deptUsage = [
    { dept: "Finance", usage: 92 },
    { dept: "Defence", usage: 85 },
    { dept: "Railways", usage: 78 },
    { dept: "Home Affairs", usage: 74 },
    { dept: "Health", usage: 68 },
  ]
  const forecast = charts?.revenueTrend?.map((d, i) => ({
    month: d.month,
    actual: d.revenue,
    forecast: d.revenue + Math.floor(10 + i * 3),
  }))

  useRevealEffect(chartsRef, ".chart-card", chartReveal, !!charts)

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Insights"
        description="Revenue forecasts, top performers, and usage patterns"
        action={<ExportMenu />}
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminHeroMetric
          label="Monthly revenue"
          value={formatCurrency(stats?.revenueMonth ?? 0)}
          trend="+18% vs last year"
          icon={TrendingUp}
          iconTone="green"
        />
        <AdminHeroMetric
          label="Avg stay"
          value="3 nights"
          hint="Across all room types"
          icon={Clock}
          iconTone="blue"
        />
        <AdminHeroMetric
          label="Peak occupancy"
          value="88%"
          hint="Highest this quarter"
          icon={Building2}
          iconTone="coral"
        />
        <AdminHeroMetric
          label="Top location"
          value={topSites[0]?.city ?? "—"}
          hint={formatCurrency(topSites[0]?.revenue ?? 0)}
          icon={TrendingUp}
          iconTone="violet"
        />
      </div>

      <div ref={chartsRef} className="grid gap-4 lg:grid-cols-2">
        <AdminChartCard
          title="Revenue forecast"
          description="Actual vs projected earnings (₹ lakhs)"
          icon={TrendingUp}
          tone="green"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                <Line type="monotone" dataKey="actual" stroke="var(--primary)" strokeWidth={2} name="Actual" dot={false} />
                <Line type="monotone" dataKey="forecast" stroke="var(--chart-4)" strokeWidth={2} strokeDasharray="6 4" name="Forecast" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="Occupancy trend"
          description="Monthly utilization rate"
          icon={Hotel}
          tone="coral"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.occupancyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                <Area
                  type="monotone"
                  dataKey="occupancy"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="color-mix(in oklch, var(--primary) 15%, transparent)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="Top locations"
          description="Revenue share by city"
          icon={MapPin}
          tone="blue"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={topLocationPieData}
                  dataKey="revenue"
                  nameKey="name"
                  cx="50%"
                  cy="46%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  strokeWidth={2}
                  stroke="var(--background)"
                >
                  {topLocationPieData.map((_, i) => (
                    <Cell key={i} fill={LOCATION_PIE_COLORS[i % LOCATION_PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE.contentStyle}
                  formatter={(value) => [formatCurrency(Number(value ?? 0)), "Revenue"]}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="Department usage"
          description="Booking share by government department"
          icon={Users}
          tone="violet"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptUsage}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                <XAxis
                  dataKey="dept"
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                <Bar dataKey="usage" fill="var(--primary)" name="Usage %" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>
      </div>

      <div className="mt-4">
        <AdminSectionHeading title="Highlights" description="Key takeaways from your data" />
        <div className="admin-card grid gap-3 p-4 sm:grid-cols-3">
          <AdminInsightTile
            label="Peak booking month"
            value="March 2026"
            hint="+22% above average"
          />
          <AdminInsightTile
            label="Most booked room type"
            value="Standard"
            hint="42% of all reservations"
          />
          <AdminInsightTile
            label="Top building"
            value={topBuildings[0]?.name ?? "—"}
            hint={topBuildings[0]?.siteName}
          />
        </div>
      </div>
    </div>
  )
}
