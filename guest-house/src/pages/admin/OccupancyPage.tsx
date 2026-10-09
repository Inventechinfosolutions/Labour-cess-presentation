import { useMemo, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { ArrowUpRight, Building2, Hotel, MapPin } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { chartReveal } from "@/animations/gsap"
import { fetchOccupancyByBuilding, fetchOccupancyBySite } from "@/services/adminApi"
import {
  AdminChartCard,
  AdminHeroMetric,
  AdminOccupancyRow,
  AdminSectionHeading,
  CHART_TOOLTIP_STYLE,
} from "@/components/admin/AdminAnalyticsUI"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePageTransition, useRevealEffect } from "@/hooks/useGsap"

function occupancyBarColor(value: number) {
  const opacity = 0.35 + (value / 100) * 0.65
  return `color-mix(in oklch, var(--primary) ${Math.round(opacity * 100)}%, transparent)`
}

export function OccupancyPage() {
  const pageRef = usePageTransition()
  const chartsRef = useRef<HTMLDivElement>(null)

  const { data: siteData, isLoading: siteLoading } = useQuery({
    queryKey: ["occupancy-sites"],
    queryFn: fetchOccupancyBySite,
  })

  const { data: buildingData, isLoading: buildingLoading } = useQuery({
    queryKey: ["occupancy-buildings"],
    queryFn: () => fetchOccupancyByBuilding(),
  })

  const summary = useMemo(() => {
    if (!siteData?.length) {
      return { avg: 0, high: 0, totalRooms: 0, sites: 0 }
    }
    const avg = Math.round(
      siteData.reduce((sum, s) => sum + s.occupancy, 0) / siteData.length
    )
    const high = siteData.filter((s) => s.occupancy >= 80).length
    const totalRooms = siteData.reduce((sum, s) => sum + s.rooms, 0)
    return { avg, high, totalRooms, sites: siteData.length }
  }, [siteData])

  useRevealEffect(chartsRef, ".chart-card", chartReveal, !!siteData)

  return (
    <div ref={pageRef}>
      <PageHeader
        variant="admin"
        title="Occupancy"
        description="Live utilization across sites and buildings"
        action={
          <Button variant="outline" className="rounded-full" asChild>
            <Link to="/admin/analytics">
              View insights
              <ArrowUpRight className="ml-1 size-4" />
            </Link>
          </Button>
        }
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <AdminHeroMetric
          label="Average occupancy"
          value={`${summary.avg}%`}
          hint="Across all monitored sites"
          icon={Hotel}
          iconTone="coral"
        />
        <AdminHeroMetric
          label="High-demand sites"
          value={summary.high}
          hint="Above 80% utilization"
          icon={MapPin}
          iconTone="rose"
        />
        <AdminHeroMetric
          label="Total rooms tracked"
          value={summary.totalRooms.toLocaleString("en-IN")}
          icon={Building2}
          iconTone="violet"
        />
        <AdminHeroMetric
          label="Sites monitored"
          value={summary.sites}
          icon={MapPin}
          iconTone="teal"
        />
      </div>

      <div ref={chartsRef} className="grid gap-4 lg:grid-cols-2">
        <AdminChartCard
          title="By site"
          description="Occupancy percentage per location"
          icon={MapPin}
          tone="coral"
        >
          <div className="h-64">
            {siteLoading ? (
              <Skeleton className="h-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={siteData?.slice(0, 12)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border/60" />
                  <XAxis dataKey="site" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" height={50} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                  <Bar dataKey="occupancy" name="Occupancy %" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {siteData?.slice(0, 12).map((entry, i) => (
                      <Cell key={i} fill={occupancyBarColor(entry.occupancy)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </AdminChartCard>

        <AdminChartCard
          title="By building"
          description="Top buildings by utilization"
          icon={Building2}
          tone="blue"
        >
          <div className="h-64">
            {buildingLoading ? (
              <Skeleton className="h-full rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buildingData?.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/60" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    dataKey="building"
                    type="category"
                    width={96}
                    tick={{ fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={CHART_TOOLTIP_STYLE.contentStyle} />
                  <Bar dataKey="occupancy" fill="var(--primary)" radius={[0, 6, 6, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </AdminChartCard>
      </div>

      <div className="mt-4">
        <AdminSectionHeading
          title="Site breakdown"
          description="Detailed occupancy for your top locations"
        />
        <div className="admin-card divide-y divide-border/40 px-5 py-2">
          {siteLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="my-3 h-10 w-full" />
            ))
          ) : (
            siteData?.slice(0, 10).map((site) => (
              <div key={site.site} className="py-3">
                <AdminOccupancyRow
                  label={site.site}
                  value={site.occupancy}
                  sublabel={`${site.rooms} rooms`}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
