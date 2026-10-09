import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  BedDouble,
  Building2,
  ChevronRight,
  IndianRupee,
  Layers,
  MapPin,
  Plus,
  TrendingUp,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  AdminChartCard,
  AdminHeroMetric,
  AdminOccupancyRow,
  AdminRankRow,
  AdminSectionHeading,
  CHART_TOOLTIP_STYLE,
} from "@/components/admin/AdminAnalyticsUI"
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge"
import { fetchAdminBuilding } from "@/services/adminApi"
import { getEnterpriseData } from "@/mock-data/enterprise"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/utils/format"
import { getBuildingImage, getFloorImage } from "@/utils/entityImages"
import { cn } from "@/lib/utils"
import { usePageTransition } from "@/hooks/useGsap"

const FLOOR_CHART_COLORS = [
  "var(--primary)",
  "color-mix(in oklch, var(--primary) 70%, var(--chart-2))",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

function BuildingDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-52 w-full rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-12 w-full max-w-lg rounded-full" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  )
}

export function BuildingDetailPage() {
  const { buildingId } = useParams()
  const pageRef = usePageTransition()

  const { data: building, isLoading } = useQuery({
    queryKey: ["admin-building", buildingId],
    queryFn: () => fetchAdminBuilding(buildingId!),
    enabled: !!buildingId,
  })

  const floors = useMemo(
    () =>
      buildingId
        ? getEnterpriseData().floors.filter((f) => f.buildingId === buildingId)
        : [],
    [buildingId],
  )

  const rooms = useMemo(
    () =>
      buildingId
        ? getEnterpriseData().rooms.filter((r) => r.buildingId === buildingId)
        : [],
    [buildingId],
  )

  const floorChartData = useMemo(
    () =>
      floors.map((f) => ({
        name: f.name.replace("Floor ", "F"),
        fullName: f.name,
        rooms: f.rooms,
        occupancy: f.occupancy,
      })),
    [floors],
  )

  const revenueByFloor = useMemo(
    () =>
      floors.map((f) => ({
        name: f.name,
        value: Math.round((building?.revenue ?? 0) * (f.occupancy / 100) / Math.max(floors.length, 1)),
      })),
    [floors, building?.revenue],
  )

  if (isLoading) {
    return (
      <div ref={pageRef}>
        <BuildingDetailSkeleton />
      </div>
    )
  }

  if (!building) {
    return (
      <div ref={pageRef} className="flex flex-col items-center justify-center py-20 text-center">
        <Building2 className="mb-4 size-12 text-muted-foreground/50" />
        <h2 className="text-lg font-semibold">Building not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">This building may have been removed.</p>
        <Button className="mt-6 rounded-full" asChild>
          <Link to="/admin/buildings">Back to buildings</Link>
        </Button>
      </div>
    )
  }

  const isActive = building.status === "active"
  const occupiedRooms = Math.round((building.rooms * building.occupancy) / 100)
  const availableRooms = building.rooms - occupiedRooms
  const buildingImage = getBuildingImage(building.id)

  return (
    <div ref={pageRef} className="space-y-6">
      <Link
        to="/admin/buildings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All buildings
      </Link>

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[var(--shadow-airbnb)]">
        <div className="relative h-40 sm:h-48 lg:h-52">
          <img src={buildingImage} alt={building.name} className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm",
                    isActive ? "bg-white text-foreground" : "bg-black/50 text-white backdrop-blur-sm",
                  )}
                >
                  {isActive ? "Active" : building.status}
                </span>
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  {building.buildingCode}
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
                {building.name}
              </h1>
              <Link
                to={`/admin/sites/${building.siteId}`}
                className="mt-1 inline-flex items-center gap-1.5 text-sm text-white/85 transition-colors hover:text-white"
              >
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{building.siteName}</span>
                <ChevronRight className="size-3.5 shrink-0 opacity-70" />
              </Link>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full bg-white/95 text-foreground hover:bg-white"
                asChild
              >
                <Link to={`/admin/sites/${building.siteId}`}>
                  <MapPin className="mr-1.5 size-3.5" />
                  View site
                </Link>
              </Button>
              <Button size="sm" className="rounded-full" asChild>
                <Link to="/admin/floors">
                  <Layers className="mr-1.5 size-3.5" />
                  Manage floors
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminHeroMetric
          label="Floors"
          value={building.floors}
          hint={`${floors.length} configured`}
          icon={Layers}
          iconTone="coral"
        />
        <AdminHeroMetric
          label="Rooms"
          value={building.rooms}
          hint={`${availableRooms} available`}
          icon={BedDouble}
          iconTone="blue"
        />
        <AdminHeroMetric
          label="Occupancy"
          value={`${building.occupancy}%`}
          hint={`${occupiedRooms} rooms in use`}
          trend={building.occupancy >= 70 ? "High demand" : undefined}
          trendUp={building.occupancy >= 70}
          icon={TrendingUp}
          iconTone="green"
        />
        <AdminHeroMetric
          label="Revenue (MTD)"
          value={formatCurrency(building.revenue)}
          hint="This building"
          icon={IndianRupee}
          iconTone="amber"
        />
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="rounded-full" asChild>
          <Link to="/admin/floors">
            <Layers className="mr-1.5 size-3.5" />
            Floors
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="rounded-full" asChild>
          <Link to="/admin/rooms">
            <BedDouble className="mr-1.5 size-3.5" />
            Rooms
          </Link>
        </Button>
        <Button variant="outline" size="sm" className="rounded-full" asChild>
          <Link to="/admin/inventory">
            <Plus className="mr-1.5 size-3.5" />
            Inventory
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-full bg-muted/60 p-1 sm:w-auto">
          <TabsTrigger value="overview" className="rounded-full px-4">
            Overview
          </TabsTrigger>
          <TabsTrigger value="floors" className="rounded-full px-4">
            Floors
            {floors.length > 0 && (
              <span className="ml-1.5 rounded-full bg-background px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                {floors.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="revenue" className="rounded-full px-4">
            Revenue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="admin-card space-y-5 rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
              <AdminSectionHeading title="Building details" />

              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Building code", value: building.buildingCode },
                  { label: "Parent site", value: building.siteName },
                  { label: "Total floors", value: building.floors },
                  { label: "Total rooms", value: building.rooms },
                ].map((row) => (
                  <div key={row.label}>
                    <dt className="text-xs font-medium text-muted-foreground">{row.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-foreground">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="border-t border-border/50 pt-4">
                <p className="text-xs font-medium text-muted-foreground">Description</p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                  {building.description || "No description provided for this building."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-border/50 pt-4">
                <AdminStatusBadge status={building.status} />
                <span className="inline-flex items-center rounded-full border border-border/50 bg-muted/30 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  {rooms.length} rooms in system
                </span>
              </div>
            </div>

            <div className="admin-card space-y-5 rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
              <AdminSectionHeading
                title="Occupancy snapshot"
                description="Current fill rate for this building"
              />

              <div className="flex items-center gap-4">
                <div
                  className="relative flex size-20 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(var(--primary) ${building.occupancy}%, oklch(0.91 0.002 106) 0)`,
                  }}
                >
                  <div className="flex size-[3.75rem] flex-col items-center justify-center rounded-full bg-card">
                    <span className="text-lg font-semibold tabular-nums leading-none">
                      {building.occupancy}%
                    </span>
                    <span className="mt-0.5 text-[10px] text-muted-foreground">full</span>
                  </div>
                </div>
                <div className="min-w-0 text-sm">
                  <p className="font-medium text-foreground">
                    {occupiedRooms} of {building.rooms} rooms occupied
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    {availableRooms} rooms ready for booking
                  </p>
                </div>
              </div>

              {floors.length > 0 ? (
                <div className="space-y-3 border-t border-border/50 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    By floor
                  </p>
                  {floors.map((f) => (
                    <AdminOccupancyRow
                      key={f.id}
                      label={f.name}
                      sublabel={`${f.rooms} rooms`}
                      value={f.occupancy}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add floors to see occupancy breakdown.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="floors" className="mt-5 space-y-5">
          <div className="flex items-center justify-between gap-3">
            <AdminSectionHeading
              title="Floor distribution"
              description="Occupancy and room count per floor"
            />
            <Button size="sm" className="shrink-0 rounded-full" asChild>
              <Link to="/admin/floors">
                <Plus className="mr-1.5 size-3.5" />
                Add floor
              </Link>
            </Button>
          </div>

          {floors.length === 0 ? (
            <div className="admin-card flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
              <Layers className="mb-3 size-10 text-muted-foreground/60" />
              <p className="font-medium">No floors yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Add floors and assign rooms to start tracking occupancy.
              </p>
              <Button className="mt-5 rounded-full" size="sm" asChild>
                <Link to="/admin/floors">Create first floor</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {floors.map((f) => (
                  <article
                    key={f.id}
                    className="group admin-card overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-airbnb)]"
                  >
                    <div className="relative h-28 overflow-hidden">
                      <img
                        src={getFloorImage(f.id)}
                        alt={f.name}
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between gap-2">
                        <p className="text-sm font-semibold text-white">{f.name}</p>
                        <AdminStatusBadge status={f.status} className="bg-white/95" />
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="rounded-xl border border-border/40 bg-muted/25 px-2 py-2.5">
                          <BedDouble className="mx-auto size-3.5 text-muted-foreground" />
                          <p className="mt-1 text-sm font-semibold tabular-nums">{f.rooms}</p>
                          <p className="text-[10px] text-muted-foreground">Rooms</p>
                        </div>
                        <div className="rounded-xl border border-border/40 bg-muted/25 px-2 py-2.5">
                          <TrendingUp className="mx-auto size-3.5 text-muted-foreground" />
                          <p className="mt-1 text-sm font-semibold tabular-nums">{f.occupancy}%</p>
                          <p className="text-[10px] text-muted-foreground">Occupancy</p>
                        </div>
                      </div>

                      <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${f.occupancy}%` }}
                        />
                      </div>

                      {f.description && (
                        <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{f.description}</p>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4 w-full rounded-full"
                        asChild
                      >
                        <Link to="/admin/rooms">
                          View rooms
                          <ChevronRight className="ml-0.5 size-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </article>
                ))}
              </div>

              <AdminChartCard
                title="Floor occupancy chart"
                description="Compare fill rates across floors"
                icon={Layers}
                tone="coral"
              >
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={floorChartData} barSize={32}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.91 0.002 106)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "oklch(0.52 0.01 106)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "oklch(0.52 0.01 106)" }}
                        axisLine={false}
                        tickLine={false}
                        unit="%"
                      />
                      <Tooltip
                        {...CHART_TOOLTIP_STYLE}
                        labelFormatter={(_, payload) =>
                          payload?.[0]?.payload?.fullName ?? ""
                        }
                        formatter={(value) => [`${Number(value ?? 0)}%`, "Occupancy"]}
                      />
                      <Bar dataKey="occupancy" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </AdminChartCard>
            </>
          )}
        </TabsContent>

        <TabsContent value="revenue" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <AdminChartCard
              title="Revenue overview"
              description="Estimated contribution by floor"
              icon={IndianRupee}
              tone="amber"
            >
              {floors.length === 0 ? (
                <div className="flex h-52 flex-col items-center justify-center text-center">
                  <p className="text-3xl font-semibold tracking-tight text-foreground">
                    {formatCurrency(building.revenue)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Total building revenue</p>
                </div>
              ) : (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={revenueByFloor}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={2}
                      >
                        {revenueByFloor.map((_, i) => (
                          <Cell key={i} fill={FLOOR_CHART_COLORS[i % FLOOR_CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        {...CHART_TOOLTIP_STYLE}
                        formatter={(value) => [formatCurrency(Number(value ?? 0)), "Revenue"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </AdminChartCard>

            <div className="admin-card rounded-2xl border border-border/50 bg-card p-5">
              <AdminSectionHeading
                title="Revenue summary"
                description="Financial performance for this building"
              />

              <div className="mt-4 rounded-xl border border-border/40 bg-muted/20 p-4">
                <p className="text-xs font-medium text-muted-foreground">Total (MTD)</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                  {formatCurrency(building.revenue)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on {building.occupancy}% average occupancy
                </p>
              </div>

              {floors.length > 0 && (
                <div className="mt-4 divide-y divide-border/40">
                  {[...floors]
                    .map((f) => ({
                      floor: f,
                      revenue:
                        revenueByFloor.find((r) => r.name === f.name)?.value ?? 0,
                    }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .map(({ floor, revenue }, i) => (
                      <AdminRankRow
                        key={floor.id}
                        rank={i + 1}
                        title={floor.name}
                        subtitle={`${floor.rooms} rooms · ${floor.occupancy}% full`}
                        value={formatCurrency(revenue)}
                        barValue={floor.occupancy}
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
