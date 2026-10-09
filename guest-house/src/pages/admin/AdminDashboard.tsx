import { useMemo, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  Activity,
  Bell,
  Building2,
  CalendarCheck,
  CircleAlert,
  CircleCheck,
  DoorOpen,
  Hotel,
  IndianRupee,
  LogIn,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  PieChart as PieChartIcon,
  Plus,
  Smartphone,
  Users,
} from "lucide-react"
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
import {
  fetchAdminActivities,
  fetchAdminChartData,
  fetchAdminDashboardStats,
  fetchAdminNotifications,
} from "@/services/adminApi"
import {
  AdminChartCard,
  AdminHeroMetric,
  AdminHorizontalMarquee,
  AdminSectionHeading,
  AdminStatChip,
  CHART_TOOLTIP_STYLE,
} from "@/components/admin/AdminAnalyticsUI"
import { ActivityTimeline } from "@/components/admin/ActivityTimeline"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/utils/format"
import { usePageTransition, useRevealEffect } from "@/hooks/useGsap"

const SITE_PIE_COLORS = [
  "var(--primary)",
  "color-mix(in oklch, var(--primary) 75%, var(--chart-2))",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "color-mix(in oklch, var(--primary) 55%, transparent)",
  "color-mix(in oklch, var(--chart-2) 70%, transparent)",
  "color-mix(in oklch, var(--chart-3) 70%, transparent)",
  "color-mix(in oklch, var(--chart-4) 70%, transparent)",
]

export function AdminDashboard() {
  const pageRef = usePageTransition()
  const chartsRef = useRef<HTMLDivElement>(null)

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: fetchAdminDashboardStats,
  })

  const { data: activities } = useQuery({
    queryKey: ["admin-activities"],
    queryFn: fetchAdminActivities,
  })

  const { data: charts } = useQuery({
    queryKey: ["admin-charts"],
    queryFn: fetchAdminChartData,
  })

  const { data: notifications } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: fetchAdminNotifications,
  })

  const notificationStats = useMemo(() => {
    const list = notifications ?? []
    return {
      sms: list.filter((n) => n.channel === "sms").length,
      email: list.filter((n) => n.channel === "email").length,
      push: list.filter((n) => n.channel === "push").length,
      whatsapp: list.filter((n) => n.channel === "whatsapp").length,
      sent: list.filter((n) => n.status === "sent").length,
      failed: list.filter((n) => n.status === "failed").length,
    }
  }, [notifications])

  useRevealEffect(chartsRef, ".chart-card", chartReveal, !!charts)

  const occupancyRate = stats
    ? Math.round((stats.occupiedRooms / Math.max(stats.totalRooms, 1)) * 100)
    : 0

  if (isLoading) {
    return (
      <div ref={pageRef}>
        <Skeleton className="mb-6 h-16 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Today"
        description="Overview of earnings, bookings, and guest activity"
        action={
          <Button className="rounded-full px-5" asChild>
            <Link to="/admin/sites?action=add">
              <Plus className="mr-1.5 size-4" />
              Add listing
            </Link>
          </Button>
        }
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminHeroMetric
          label="Earnings today"
          value={formatCurrency(stats?.revenueToday ?? 0)}
          trend="+8% vs yesterday"
          icon={IndianRupee}
          iconTone="green"
        />
        <AdminHeroMetric
          label="Active bookings"
          value={(stats?.activeBookings ?? 0).toLocaleString("en-IN")}
          trend="+12% this month"
          icon={CalendarCheck}
          iconTone="blue"
        />
        <AdminHeroMetric
          label="Occupancy rate"
          value={`${occupancyRate}%`}
          hint={`${stats?.occupiedRooms ?? 0} of ${stats?.totalRooms ?? 0} rooms`}
          icon={Hotel}
          iconTone="violet"
        />
        <AdminHeroMetric
          label="Arrivals today"
          value={stats?.todayCheckIns ?? 0}
          hint={`${stats?.todayCheckOuts ?? 0} departures`}
          icon={LogIn}
          iconTone="amber"
        />
      </div>

      <AdminSectionHeading
        title="Portfolio snapshot"
        description="Properties and capacity across all listings"
      />
      <AdminHorizontalMarquee duration={32}>
        <AdminStatChip label="Sites" value={stats?.totalSites ?? 0} icon={MapPin} iconTone="coral" />
        <AdminStatChip label="Buildings" value={stats?.totalBuildings ?? 0} icon={Building2} iconTone="blue" />
        <AdminStatChip label="Rooms" value={(stats?.totalRooms ?? 0).toLocaleString("en-IN")} icon={Hotel} iconTone="violet" />
        <AdminStatChip label="Available" value={stats?.availableRooms ?? 0} icon={DoorOpen} iconTone="green" />
        <AdminStatChip label="Check-ins" value={stats?.todayCheckIns ?? 0} icon={LogIn} iconTone="amber" />
        <AdminStatChip label="Check-outs" value={stats?.todayCheckOuts ?? 0} icon={LogOut} iconTone="rose" />
      </AdminHorizontalMarquee>

      <div ref={chartsRef} className="grid gap-4 lg:grid-cols-2">
        <AdminChartCard
          title="Occupancy"
          description="Monthly utilization across all sites"
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
          title="Revenue"
          description="Monthly earnings in ₹ lakhs"
          icon={IndianRupee}
          tone="green"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts?.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="Bookings"
          description="Weekly reservation volume"
          icon={CalendarCheck}
          tone="blue"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.bookingTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                <Bar dataKey="bookings" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="Earnings by site"
          description="Revenue share by location (₹ lakhs)"
          icon={PieChartIcon}
          tone="violet"
        >
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.revenueBySite}
                  dataKey="revenue"
                  nameKey="site"
                  cx="50%"
                  cy="46%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={2}
                  strokeWidth={2}
                  stroke="var(--background)"
                >
                  {charts?.revenueBySite?.map((_, i) => (
                    <Cell key={i} fill={SITE_PIE_COLORS[i % SITE_PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE.contentStyle}
                  formatter={(value) => [`₹${Number(value ?? 0)}L`, "Revenue"]}
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
      </div>

      <div className="mt-4">
        <AdminSectionHeading
          title="Notifications"
          description="Messages sent across SMS, email, push, and WhatsApp"
        />
        <AdminHorizontalMarquee duration={26}>
          <AdminStatChip label="SMS" value={notificationStats.sms} icon={MessageSquare} iconTone="blue" />
          <AdminStatChip label="Email" value={notificationStats.email} icon={Mail} iconTone="violet" />
          <AdminStatChip label="Push" value={notificationStats.push} icon={Bell} iconTone="coral" />
          <AdminStatChip label="WhatsApp" value={notificationStats.whatsapp} icon={Smartphone} iconTone="green" />
          <AdminStatChip label="Sent" value={notificationStats.sent} icon={CircleCheck} iconTone="teal" />
          <AdminStatChip label="Failed" value={notificationStats.failed} icon={CircleAlert} iconTone="rose" />
        </AdminHorizontalMarquee>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <AdminChartCard
          title="Guest flow"
          description="Daily check-ins and check-outs"
          className="lg:col-span-2"
          icon={Users}
          tone="amber"
        >
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={charts?.checkInTrend?.map((d, i) => ({
                  day: d.day,
                  checkIns: d.checkIns,
                  checkOuts: charts?.checkOutTrend?.[i]?.checkOuts ?? 0,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                <Line type="monotone" dataKey="checkIns" stroke="var(--primary)" strokeWidth={2} name="Check-ins" dot={false} />
                <Line type="monotone" dataKey="checkOuts" stroke="var(--chart-4)" strokeWidth={2} name="Check-outs" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="Recent activity"
          description="Latest updates across listings"
          icon={Activity}
          tone="slate"
        >
          <ActivityTimeline activities={activities ?? []} compact />
        </AdminChartCard>
      </div>
    </div>
  )
}
