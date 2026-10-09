import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRightLeft,
  BedDouble,
  Building2,
  Calendar,
  CalendarCheck,
  ChevronRight,
  Clock,
  IndianRupee,
  MapPin,
  QrCode,
  ScrollText,
  Sparkles,
  XCircle,
} from "lucide-react"
import {
  AdminHeroMetric,
  AdminSectionHeading,
} from "@/components/admin/AdminAnalyticsUI"
import { ActivityTimeline } from "@/components/admin/ActivityTimeline"
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge"
import { QRCodeDisplay } from "@/components/shared/QRCodeDisplay"
import { fetchAdminBooking } from "@/services/adminApi"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateNights, formatCurrency, formatDate } from "@/utils/format"
import { getBookingImage, getUserAvatar } from "@/utils/entityImages"
import { toast } from "sonner"
import { usePageTransition } from "@/hooks/useGsap"

const TIMELINE = [
  {
    id: "1",
    type: "booking" as const,
    title: "Booking created",
    description: "Online booking submitted",
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "2",
    type: "payment" as const,
    title: "Payment received",
    description: "Payment confirmed",
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "3",
    type: "checkin" as const,
    title: "Confirmed",
    description: "Booking approved by admin",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
]

const BOOKING_ACTIONS = [
  { label: "Approve", icon: CalendarCheck, variant: "default" as const },
  { label: "Cancel", icon: XCircle, variant: "outline" as const },
  { label: "Move Room", icon: ArrowRightLeft, variant: "outline" as const },
  { label: "Upgrade", icon: Sparkles, variant: "outline" as const },
  { label: "Extend Stay", icon: Clock, variant: "outline" as const },
]

function BookingDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-10 w-full max-w-2xl rounded-full" />
      <Skeleton className="h-72 w-full rounded-2xl" />
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

export function BookingDetailPage() {
  const { bookingId } = useParams()
  const pageRef = usePageTransition()

  const { data: booking, isLoading } = useQuery({
    queryKey: ["admin-booking", bookingId],
    queryFn: () => fetchAdminBooking(bookingId!),
    enabled: !!bookingId,
  })

  const nights = useMemo(
    () => (booking ? calculateNights(booking.checkIn, booking.checkOut) : 0),
    [booking],
  )

  const nightlyRate = useMemo(
    () => (booking && nights > 0 ? Math.round(booking.amount / nights) : 0),
    [booking, nights],
  )

  if (isLoading) {
    return (
      <div ref={pageRef}>
        <BookingDetailSkeleton />
      </div>
    )
  }

  if (!booking) {
    return (
      <div ref={pageRef} className="flex flex-col items-center justify-center py-20 text-center">
        <CalendarCheck className="mb-4 size-12 text-muted-foreground/50" />
        <h2 className="text-lg font-semibold">Booking not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">This reservation may have been removed.</p>
        <Button className="mt-6 rounded-full" asChild>
          <Link to="/admin/bookings">Back to bookings</Link>
        </Button>
      </div>
    )
  }

  const bookingImage = getBookingImage(booking.id)
  const guestAvatar = getUserAvatar(booking.guest, booking.userId)

  return (
    <div ref={pageRef} className="space-y-6">
      <Link
        to="/admin/bookings"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All bookings
      </Link>

      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[var(--shadow-airbnb)]">
        <div className="relative h-40 sm:h-44 lg:h-48">
          <img src={bookingImage} alt={booking.site} className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />

          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <AdminStatusBadge status={booking.status} className="bg-white/95" />
                <AdminStatusBadge status={booking.paymentStatus} className="bg-white/90" />
              </div>
              <h1 className="font-mono text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {booking.id}
              </h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/85">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{booking.site}</span>
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-white/20 bg-black/25 px-3 py-2 backdrop-blur-sm">
              <Avatar className="size-10 ring-2 ring-white/30">
                <AvatarImage src={guestAvatar} alt={booking.guest} className="object-cover" />
                <AvatarFallback className="bg-primary/20 text-xs font-semibold text-white">
                  {guestInitials(booking.guest)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{booking.guest}</p>
                <Link
                  to={`/admin/users/${booking.userId}`}
                  className="text-xs text-white/75 transition-colors hover:text-white"
                >
                  View guest profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminHeroMetric
          label="Stay duration"
          value={`${nights} night${nights === 1 ? "" : "s"}`}
          hint={`${formatDate(booking.checkIn)} – ${formatDate(booking.checkOut)}`}
          icon={Calendar}
          iconTone="coral"
        />
        <AdminHeroMetric
          label="Total amount"
          value={formatCurrency(booking.amount)}
          hint={`≈ ${formatCurrency(nightlyRate)}/night`}
          icon={IndianRupee}
          iconTone="green"
        />
        <AdminHeroMetric
          label="Room"
          value={`Room ${booking.room}`}
          hint={booking.roomType}
          icon={BedDouble}
          iconTone="blue"
        />
        <AdminHeroMetric
          label="Building"
          value={booking.building}
          hint="Assigned property"
          icon={Building2}
          iconTone="violet"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {BOOKING_ACTIONS.map(({ label, icon: Icon, variant }) => (
          <Button
            key={label}
            size="sm"
            variant={variant}
            className="rounded-full"
            onClick={() => toast.success(`${label} (demo)`)}
          >
            <Icon className="mr-1.5 size-3.5" />
            {label}
          </Button>
        ))}
      </div>

      <Tabs defaultValue="details">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-full bg-muted/60 p-1 sm:w-auto">
          <TabsTrigger value="details" className="rounded-full px-4">
            Details
          </TabsTrigger>
          <TabsTrigger value="payment" className="rounded-full px-4">
            Payment
          </TabsTrigger>
          <TabsTrigger value="qr" className="rounded-full px-4">
            QR Code
          </TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-full px-4">
            Timeline
          </TabsTrigger>
          <TabsTrigger value="audit" className="rounded-full px-4">
            Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="admin-card rounded-2xl border border-border/50 bg-card p-5 sm:p-6 lg:col-span-1">
              <AdminSectionHeading title="Guest" />
              <div className="mt-4 flex items-center gap-3">
                <Avatar className="size-14 ring-2 ring-border/50">
                  <AvatarImage src={guestAvatar} alt={booking.guest} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {guestInitials(booking.guest)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{booking.guest}</p>
                  <Link
                    to={`/admin/users/${booking.userId}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    View profile
                  </Link>
                </div>
              </div>
              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Check-in</dt>
                  <dd className="mt-0.5 font-medium">{formatDate(booking.checkIn)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Check-out</dt>
                  <dd className="mt-0.5 font-medium">{formatDate(booking.checkOut)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Booked on</dt>
                  <dd className="mt-0.5 font-medium">{formatDate(booking.createdAt)}</dd>
                </div>
              </dl>
            </div>

            <div className="admin-card rounded-2xl border border-border/50 bg-card p-5 sm:p-6 lg:col-span-1">
              <AdminSectionHeading title="Stay location" />
              <div className="mt-4 overflow-hidden rounded-xl border border-border/40">
                <img src={bookingImage} alt="" className="h-28 w-full object-cover" />
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Guest house</dt>
                  <dd className="mt-0.5 font-medium">
                    <Link
                      to={`/admin/sites/${booking.siteId}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {booking.site}
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Building</dt>
                  <dd className="mt-0.5 font-medium">{booking.building}</dd>
                </div>
              </dl>
            </div>

            <div className="admin-card rounded-2xl border border-border/50 bg-card p-5 sm:p-6 lg:col-span-1">
              <AdminSectionHeading title="Room assignment" />
              <div className="mt-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <BedDouble className="size-7 text-primary" />
              </div>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Room number</dt>
                  <dd className="mt-0.5 text-lg font-semibold">{booking.room}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Room type</dt>
                  <dd className="mt-0.5 font-medium">{booking.roomType}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Duration</dt>
                  <dd className="mt-0.5 font-medium">
                    {nights} night{nights === 1 ? "" : "s"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="payment" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
            <div className="admin-card rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
              <AdminSectionHeading title="Payment summary" description="Charges for this reservation" />

              <div className="mt-5 rounded-xl border border-border/40 bg-muted/20 p-5">
                <p className="text-xs font-medium text-muted-foreground">Total paid</p>
                <p className="mt-1 text-4xl font-semibold tracking-tight text-foreground">
                  {formatCurrency(booking.amount)}
                </p>
                <div className="mt-3">
                  <AdminStatusBadge status={booking.paymentStatus} />
                </div>
              </div>

              <dl className="mt-5 divide-y divide-border/40 text-sm">
                {[
                  {
                    label: "Room charges",
                    value: formatCurrency(Math.round(booking.amount * 0.88)),
                  },
                  { label: "Taxes & fees", value: formatCurrency(Math.round(booking.amount * 0.12)) },
                  { label: "Nightly rate", value: `${formatCurrency(nightlyRate)} × ${nights} nights` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between py-3">
                    <dt className="text-muted-foreground">{row.label}</dt>
                    <dd className="font-medium tabular-nums">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="admin-card flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card p-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                <IndianRupee className="size-7" />
              </div>
              <p className="mt-4 text-sm font-medium text-foreground">Payment status</p>
              <p className="mt-1 capitalize text-muted-foreground">{booking.paymentStatus.replace("_", " ")}</p>
              <Button variant="outline" size="sm" className="mt-5 rounded-full" asChild>
                <Link to="/admin/payments">
                  View in payments
                  <ChevronRight className="ml-0.5 size-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="qr" className="mt-5">
          <div className="admin-card mx-auto max-w-md rounded-2xl border border-border/50 bg-card p-6 text-center sm:p-8">
            <AdminSectionHeading
              title="Digital access QR"
              description="Scan at guest house entry for room access"
            />
            <div className="mt-6 flex justify-center rounded-2xl border border-border/40 bg-muted/20 p-6">
              <QRCodeDisplay data={booking.id} size="lg" />
            </div>
            <p className="mt-4 font-mono text-xs text-muted-foreground">{booking.id}</p>
            <Button variant="outline" size="sm" className="mt-5 rounded-full" asChild>
              <Link to="/admin/access">
                <QrCode className="mr-1.5 size-3.5" />
                Access control
              </Link>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-5">
          <div className="admin-card rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
            <AdminSectionHeading title="Booking timeline" description="Key events for this reservation" />
            <div className="mt-4">
              <ActivityTimeline activities={TIMELINE} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-5">
          <div className="admin-card rounded-2xl border border-border/50 bg-card p-5 sm:p-8">
            <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-muted">
                <ScrollText className="size-7 text-muted-foreground" />
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-5">
                <AdminSectionHeading
                  title="Audit trail"
                  description={`Full change history for booking ${booking.id} is available in the activity log module.`}
                />
                <Button className="mt-4 rounded-full" size="sm" asChild>
                  <Link to="/admin/audit">
                    Open audit logs
                    <ChevronRight className="ml-0.5 size-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
