import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  CalendarCheck,
  ChevronRight,
  CreditCard,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react"
import {
  AdminHeroMetric,
  AdminSectionHeading,
} from "@/components/admin/AdminAnalyticsUI"
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge"
import { fetchAdminUser } from "@/services/adminApi"
import { getEnterpriseData } from "@/mock-data/enterprise"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency, formatDate } from "@/utils/format"
import { getBookingImage, getUserAvatar } from "@/utils/entityImages"
import { cn } from "@/lib/utils"
import { usePageTransition } from "@/hooks/useGsap"

function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-12 w-full max-w-xl rounded-full" />
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

export function UserDetailPage() {
  const { userId } = useParams()
  const pageRef = usePageTransition()

  const { data: user, isLoading } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => fetchAdminUser(userId!),
    enabled: !!userId,
  })

  const bookings = useMemo(
    () =>
      userId
        ? getEnterpriseData().bookings.filter((b) => b.userId === userId).slice(0, 10)
        : [],
    [userId],
  )

  const transactions = useMemo(
    () =>
      user
        ? getEnterpriseData().transactions.filter((t) => t.guest === user.name).slice(0, 8)
        : [],
    [user],
  )

  const accessLogs = useMemo(
    () =>
      userId
        ? getEnterpriseData().accessLogs.filter((l) => l.userId === userId).slice(0, 8)
        : [],
    [userId],
  )

  const totalSpent = useMemo(
    () => transactions.reduce((sum, t) => sum + (t.status === "success" ? t.amount : 0), 0),
    [transactions],
  )

  if (isLoading) {
    return (
      <div ref={pageRef}>
        <UserDetailSkeleton />
      </div>
    )
  }

  if (!user) {
    return (
      <div ref={pageRef} className="flex flex-col items-center justify-center py-20 text-center">
        <User className="mb-4 size-12 text-muted-foreground/50" />
        <h2 className="text-lg font-semibold">Guest not found</h2>
        <p className="mt-1 text-sm text-muted-foreground">This user may have been removed.</p>
        <Button className="mt-6 rounded-full" asChild>
          <Link to="/admin/users">Back to guests</Link>
        </Button>
      </div>
    )
  }

  const avatarUrl = getUserAvatar(user.name, user.id)
  const isVerified = user.verificationStatus === "verified"

  return (
    <div ref={pageRef} className="space-y-6">
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        All guests
      </Link>

      {/* Profile hero */}
      <section className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-[var(--shadow-airbnb)]">
        <div className="relative bg-gradient-to-br from-primary/10 via-muted/30 to-background px-5 py-6 sm:px-6 sm:py-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-20 shrink-0 ring-4 ring-background shadow-[var(--shadow-airbnb)] sm:size-24">
                <AvatarImage src={avatarUrl} alt={user.name} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-xl font-semibold text-primary">
                  {guestInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <AdminStatusBadge status={user.status} />
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                      isVerified
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isVerified ? (
                      <BadgeCheck className="size-3" />
                    ) : (
                      <ShieldCheck className="size-3" />
                    )}
                    {user.verificationStatus}
                  </span>
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                  {user.name}
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">{user.employeeId}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {user.designation} · {user.department}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-full" asChild>
                <a href={`mailto:${user.email}`}>
                  <Mail className="mr-1.5 size-3.5" />
                  Email
                </a>
              </Button>
              <Button size="sm" className="rounded-full" asChild>
                <a href={`tel:${user.mobile.replace(/\s/g, "")}`}>
                  <Phone className="mr-1.5 size-3.5" />
                  Call
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminHeroMetric
          label="Total bookings"
          value={user.bookingsCount}
          hint={`${bookings.length} recent shown`}
          icon={CalendarCheck}
          iconTone="coral"
        />
        <AdminHeroMetric
          label="Total spent"
          value={formatCurrency(totalSpent)}
          hint="Successful payments"
          icon={CreditCard}
          iconTone="green"
        />
        <AdminHeroMetric
          label="Department"
          value={user.department}
          hint={user.designation}
          icon={Building2}
          iconTone="blue"
        />
        <AdminHeroMetric
          label="Access events"
          value={accessLogs.length}
          hint="Recent door logs"
          icon={KeyRound}
          iconTone="violet"
        />
      </div>

      <Tabs defaultValue="profile">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-full bg-muted/60 p-1 sm:w-auto">
          <TabsTrigger value="profile" className="rounded-full px-4">
            Profile
          </TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-full px-4">
            Bookings
            {bookings.length > 0 && (
              <span className="ml-1.5 rounded-full bg-background px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                {bookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="payments" className="rounded-full px-4">
            Payments
            {transactions.length > 0 && (
              <span className="ml-1.5 rounded-full bg-background px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
                {transactions.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="access" className="rounded-full px-4">
            Access
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-5">
          <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="admin-card space-y-5 rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
              <AdminSectionHeading title="Contact & identity" />

              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: "Email", value: user.email, icon: Mail },
                  { label: "Mobile", value: user.mobile, icon: Phone },
                  { label: "Department", value: user.department },
                  { label: "Designation", value: user.designation },
                  { label: "Government ID", value: user.governmentId },
                  { label: "Employee ID", value: user.employeeId },
                ].map((row) => (
                  <div key={row.label}>
                    <dt className="text-xs font-medium text-muted-foreground">{row.label}</dt>
                    <dd className="mt-0.5 text-sm font-medium text-foreground">{row.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col gap-2 border-t border-border/50 pt-4 sm:flex-row">
                <a
                  href={`mailto:${user.email}`}
                  className="inline-flex flex-1 items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3.5 py-2.5 text-sm transition-colors hover:bg-muted/50"
                >
                  <Mail className="size-4 text-primary" />
                  <span className="truncate">{user.email}</span>
                </a>
                <a
                  href={`tel:${user.mobile.replace(/\s/g, "")}`}
                  className="inline-flex flex-1 items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3.5 py-2.5 text-sm transition-colors hover:bg-muted/50"
                >
                  <Phone className="size-4 text-primary" />
                  {user.mobile}
                </a>
              </div>
            </div>

            <div className="admin-card space-y-4 rounded-2xl border border-border/50 bg-card p-5 sm:p-6">
              <AdminSectionHeading
                title="Verification status"
                description="Government employee credentials"
              />

              <div
                className={cn(
                  "rounded-xl border p-4",
                  isVerified
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20"
                    : "border-border/50 bg-muted/20",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl",
                      isVerified ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isVerified ? (
                      <BadgeCheck className="size-5" />
                    ) : (
                      <ShieldCheck className="size-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold capitalize text-foreground">
                      {user.verificationStatus}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isVerified
                        ? "ID verified against government records"
                        : "Verification pending or incomplete"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
                <p className="text-xs font-medium text-muted-foreground">Account status</p>
                <div className="mt-2">
                  <AdminStatusBadge status={user.status} />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="mt-5">
          <div className="admin-card overflow-hidden rounded-2xl border border-border/50 bg-card">
            <div className="border-b border-border/50 px-4 py-3.5 sm:px-5">
              <AdminSectionHeading
                title="Booking history"
                description="Past and upcoming stays"
              />
            </div>

            {bookings.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <CalendarCheck className="mb-3 size-10 text-muted-foreground/60" />
                <p className="font-medium">No bookings yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This guest has not made any reservations.
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
                      <div className="size-12 shrink-0 overflow-hidden rounded-xl border border-border/40">
                        <img
                          src={getBookingImage(b.id)}
                          alt=""
                          className="size-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{b.site}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          Room {b.room} · {formatDate(b.checkIn)} – {formatDate(b.checkOut)}
                        </p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <p className="text-sm font-semibold tabular-nums">{formatCurrency(b.amount)}</p>
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

        <TabsContent value="payments" className="mt-5">
          <div className="admin-card overflow-hidden rounded-2xl border border-border/50 bg-card">
            <div className="border-b border-border/50 px-4 py-3.5 sm:px-5">
              <AdminSectionHeading title="Payment history" description="Transactions linked to this guest" />
            </div>

            {transactions.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <CreditCard className="mb-3 size-10 text-muted-foreground/60" />
                <p className="font-medium">No payments yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {transactions.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-muted-foreground">{t.id}</p>
                      <p className="mt-0.5 text-sm font-medium capitalize text-foreground">
                        {t.method} · {t.site}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(t.timestamp)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums">{formatCurrency(t.amount)}</p>
                      <AdminStatusBadge status={t.status} className="mt-1" />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="access" className="mt-5">
          <div className="admin-card overflow-hidden rounded-2xl border border-border/50 bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-3.5 sm:px-5">
              <AdminSectionHeading title="Access history" description="Door entry and exit events" />
              <Button variant="outline" size="sm" className="shrink-0 rounded-full" asChild>
                <Link to="/admin/access">
                  View all
                  <ChevronRight className="ml-0.5 size-3.5" />
                </Link>
              </Button>
            </div>

            {accessLogs.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-14 text-center">
                <KeyRound className="mb-3 size-10 text-muted-foreground/60" />
                <p className="font-medium">No access events</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Digital key usage will appear here after check-in.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border/50">
                {accessLogs.map((log) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between gap-4 px-4 py-3.5 sm:px-5"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium capitalize text-foreground">
                        {log.eventType.replace("_", " ")}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {log.site} · Room {log.room} · {log.credentialType.toUpperCase()}
                      </p>
                    </div>
                    <p className="shrink-0 text-xs text-muted-foreground">
                      {formatDate(log.timestamp)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
