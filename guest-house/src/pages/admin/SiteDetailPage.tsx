import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarCheck,
  ChevronRight,
  IndianRupee,
  Layers,
  Mail,
  MapPin,
  Phone,
  Plus,
  Star,
  TrendingUp,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import {
  AdminChartCard,
  AdminHeroMetric,
  AdminOccupancyRow,
  AdminRankRow,
  AdminSectionHeading,
  CHART_TOOLTIP_STYLE,
} from "@/components/admin/AdminAnalyticsUI"
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge"
import { SiteHierarchyActions } from "@/components/admin/SiteHierarchyActions"
import { fetchAdminSite } from "@/services/adminApi"
import { getEnterpriseData } from "@/mock-data/enterprise"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/utils/format"
import { cn } from "@/lib/utils"
import { usePageTransition } from "@/hooks/useGsap"

function SiteDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-56 w-full rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-12 w-full max-w-md rounded-full" />
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  )
}

function guestInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function SiteDetailPage() {
  const { siteId } = useParams()
  const pageRef = usePageTransition()

  const { data: site, isLoading } = useQuery({
    queryKey: ["admin-site", siteId],
    queryFn: () => fetchAdminSite(siteId!),
    enabled: !!siteId,
  })

  const buildings = useMemo(
    () => (siteId ? getEnterpriseData().buildings.filter((b) => b.siteId === siteId) : []),
    [siteId],
  )

  const bookings = useMemo(
    () => (siteId ? getEnterpriseData().bookings.filter((b) => b.siteId === siteId).slice(0, 8) : []),
    [siteId],
  )

  const perfData = useMemo(
    () =>
      buildings.map((b) => ({
        name: b.name.replace("Building ", "Bldg "),
        occupancy: b.occupancy,
        revenue: Math.round(b.revenue / 100000),
      })),
    [buildings],
  )

  const occupiedRooms = site ? Math.round((site.roomsCount * site.occupancy) / 100) : 0

  if (isLoading) {
    return (
      <div ref={pageRef}>
        <SiteDetailSkeleton />
      </div>
    )
  }

  if (!site) {
    return (
      <div ref={pageRef} className="flex flex-col items-center justify-center py-20 text-center">
        <MapPin className="mb-4 size-12 text-muted-foreground/50" />
        <h2 className="text-lg font-semibold">Site not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">This guest house may have been removed.</p>
        <Button className="mt-6 rounded-full" asChild>
          <Link to="/admin/sites">Back to sites</Link>
        </Button>
      </div>
    )
  }

  const isActive = site.status === "active"
  const mapsUrl = `https://www.google.com/maps?q=${site.latitude},${site.longitude}`

  return (
    <div ref={pageRef} className="space-y-6">
      <Link
        to="/admin/sites"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All sites
      </Link>

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[var(--shadow-airbnb)]">
        <div className="relative h-44 sm:h-52 lg:h-60">
          <img
            src={site.image}
            alt={site.name}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm",
                    isActive ? "bg-white text-foreground" : "bg-black/50 text-white backdrop-blur-sm",
                  )}
                >
                  {isActive ? "Live" : site.status}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-sm">
                  <Star className="size-3 fill-foreground" />
                  {site.rating}
                </span>
                <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  {site.siteCode}
                </span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-[1.75rem]">
                {site.name}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{site.address}</span>
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="rounded-full bg-white/95 text-foreground hover:bg-white"
                asChild
              >
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                  <MapPin className="mr-1.5 size-3.5" />
                  View map
                </a>
              </Button>
              <Button size="sm" className="rounded-full" asChild>
                <Link to="/admin/buildings">
                  <Building2 className="mr-1.5 size-3.5" />
                  Manage buildings
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminHeroMetric
          label="Buildings"
          value={site.buildingsCount}
          hint={`${buildings.length} configured`}
          icon={Building2}
          iconTone="coral"
        />
        <AdminHeroMetric
          label="Rooms"
          value={site.roomsCount}
          hint={`${occupiedRooms} occupied now`}
          icon={BedDouble}
          iconTone="blue"
        />
        <AdminHeroMetric
          label="Occupancy"
          value={`${site.occupancy}%`}
          trend={site.occupancy >= 70 ? "+ Strong demand" : undefined}
          trendUp={site.occupancy >= 70}
          icon={TrendingUp}
          iconTone="green"
        />
        <AdminHeroMetric
          label="Revenue (MTD)"
          value={formatCurrency(site.revenue)}
          hint="Across all buildings"
          icon={IndianRupee}
          iconTone="amber"
        />
      </div>

      {/* Quick setup */}
      <div className="admin-card rounded-2xl border border-border/50 bg-card p-4 sm:p-5">
        <AdminSectionHeading
          title="Property setup"
          description="Manage the site → building → floor → room hierarchy"
        />
        <SiteHierarchyActions site={site} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-full bg-muted/60 p-1 sm:w-auto">
          <TabsTrigger value="overview" className="rounded-full px-4">
            Overview
          </TabsTrigger>
          <TabsTrigger value="buildings" className="rounded-full px-4">
            Buildings
            {buildings.length > 0 && (
              <span className="ml-1.5 rounded-full bg-background px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                {buildings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-full px-4">
            Bookings
            {bookings.length > 0 && (
              <span className="ml-1.5 rounded-full bg-background px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                {bookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="metrics" className="rounded-full px-4">
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="admin-card space-y-5 rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
              <AdminSectionHeading title="Contact & location" />

              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "State / District", value: `${site.state} · ${site.district}` },
                  { label: "City", value: site.city },
                  { label: "Pin code", value: site.pinCode },
                  {
                    label: "Coordinates",
                    value: `${site.latitude.toFixed(4)}, ${site.longitude.toFixed(4)}`,
                  },
                ].map((row) => (
                  <div key={row.label}>
                    <dt className="text-xs font-medium text-muted-foreground">{row.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-foreground">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col gap-2 border-t border-border/50 pt-4 sm:flex-row sm:gap-3">
                <a
                  href={`tel:${site.contactNumber.replace(/\s/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3.5 py-2.5 text-sm transition-colors hover:bg-muted/50"
                >
                  <Phone className="size-4 text-primary" />
                  {site.contactNumber}
                </a>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex min-w-0 items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3.5 py-2.5 text-sm transition-colors hover:bg-muted/50"
                >
                  <Mail className="size-4 shrink-0 text-primary" />
                  <span className="truncate">{site.email}</span>
                </a>
              </div>
            </div>

            <div className="admin-card space-y-5 rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
              <AdminSectionHeading
                title="Occupancy snapshot"
                description="Live fill rate across this site"
              />

              <div className="flex items-center gap-4">
                <div
                  className="relative flex size-20 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(var(--primary) ${site.occupancy}%, oklch(0.91 0.002 106) 0)`,
                  }}
                >
                  <div className="flex size-[3.75rem] flex-col items-center justify-center rounded-full bg-card">
                    <span className="text-lg font-semibold tabular-nums leading-none">
                      {site.occupancy}%
                    </span>
                    <span className="mt-0.5 text-[10px] text-muted-foreground">full</span>
                  </div>
                </div>
                <div className="min-w-0 text-sm">
                  <p className="font-medium text-foreground">
                    {occupiedRooms} of {site.roomsCount} rooms occupied
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    {site.roomsCount - occupiedRooms} available for booking
                  </p>
                </div>
              </div>

              {buildings.length > 0 ? (
                <div className="space-y-3 border-t border-border/50 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    By building
                  </p>
                  {buildings.map((b) => (
                    <AdminOccupancyRow
                      key={b.id}
                      label={b.name}
                      sublabel={`${b.rooms} rooms`}
                      value={b.occupancy}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Add buildings to see occupancy breakdown.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="buildings" className="mt-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <AdminSectionHeading
              title="Buildings at this site"
              description="Each building contains floors and guest rooms"
            />
            <Button size="sm" className="shrink-0 rounded-full" asChild>
              <Link to="/admin/buildings">
                <Plus className="mr-1.5 size-3.5" />
                Add building
              </Link>
            </Button>
          </div>

          {buildings.length === 0 ? (
            <div className="admin-card flex flex-col items-center rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-14 text-center">
              <Building2 className="mb-3 size-10 text-muted-foreground/60" />
              <p className="font-medium">No buildings yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create buildings, add floors, and assign rooms to start accepting bookings.
              </p>
              <Button className="mt-5 rounded-full" size="sm" asChild>
                <Link to="/admin/buildings">Create first building</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {buildings.map((b) => (
                <article
                  key={b.id}
                  className="group admin-card flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-airbnb)]"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-border/40 bg-muted/20 px-4 py-3.5">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                      <Building2 className="size-5 text-primary" />
                    </div>
                    <AdminStatusBadge status={b.status} />
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {b.buildingCode}
                    </p>
                    <h3 className="mt-0.5 text-base font-semibold text-foreground">{b.name}</h3>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      {[
                        { icon: Layers, label: "Floors", value: b.floors },
                        { icon: BedDouble, label: "Rooms", value: b.rooms },
                        { icon: TrendingUp, label: "Fill", value: `${b.occupancy}%` },
                      ].map(({ icon: Icon, label, value }) => (
                        <div
                          key={label}
                          className="rounded-xl border border-border/40 bg-muted/25 px-2 py-2.5"
                        >
                          <Icon className="mx-auto size-3.5 text-muted-foreground" />
                          <p className="mt-1 text-sm font-semibold tabular-nums">{value}</p>
                          <p className="text-[10px] text-muted-foreground">{label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${b.occupancy}%` }}
                      />
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 rounded-full"
                        asChild
                      >
                        <Link to={`/admin/buildings/${b.id}`}>View details</Link>
                      </Button>
                      <Button size="sm" className="flex-1 rounded-full" asChild>
                        <Link to="/admin/floors">
                          <Layers className="mr-1 size-3.5" />
                          Floors
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings" className="mt-5">
          <div className="admin-card overflow-hidden rounded-2xl border border-border/50 bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3.5 sm:px-5">
              <AdminSectionHeading
                title="Recent bookings"
                description="Latest reservations at this guest house"
              />
              <Button variant="outline" size="sm" className="shrink-0 rounded-full" asChild>
                <Link to="/admin/bookings">
                  View all
                  <ChevronRight className="ml-0.5 size-3.5" />
                </Link>
              </Button>
            </div>

            {bookings.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <CalendarCheck className="mb-3 size-10 text-muted-foreground/60" />
                <p className="font-medium">No bookings yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bookings will appear here once guests reserve rooms.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {bookings.map((b) => (
                  <li key={b.id}>
                    <Link
                      to={`/admin/bookings/${b.id}`}
                      className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/30 sm:px-5"
                    >
                      <Avatar className="size-10 shrink-0 ring-2 ring-border/50">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {guestInitials(b.guest)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{b.guest}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          Room {b.room} · Check-in {b.checkIn}
                        </p>
                      </div>
                      <AdminStatusBadge status={b.status} />
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <AdminChartCard
              title="Building occupancy"
              description="Fill rate by building this month"
              icon={TrendingUp}
              tone="coral"
            >
              {buildings.length === 0 ? (
                <p className="flex h-52 items-center justify-center text-sm text-muted-foreground">
                  Add buildings to see performance metrics.
                </p>
              ) : (
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={perfData} barSize={36}>
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
                        formatter={(value) => [`${Number(value ?? 0)}%`, "Occupancy"]}
                      />
                      <Bar dataKey="occupancy" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </AdminChartCard>

            <div className="admin-card rounded-2xl border border-border/50 bg-card p-5">
              <AdminSectionHeading
                title="Revenue ranking"
                description="Top buildings by contribution"
              />
              {buildings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              ) : (
                <div className="mt-2 divide-y divide-border/40">
                  {[...buildings]
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((b, i) => (
                      <AdminRankRow
                        key={b.id}
                        rank={i + 1}
                        title={b.name}
                        subtitle={`${b.occupancy}% occupancy`}
                        value={formatCurrency(b.revenue)}
                        barValue={Math.round((b.revenue / Math.max(site.revenue, 1)) * 100)}
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
