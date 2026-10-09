import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/context/AuthContext"
import { fetchEmployeeBookings } from "@/services/api"
import { AirbnbTripCard } from "@/components/employee/AirbnbTripCard"
import { Skeleton } from "@/components/ui/skeleton"

export function MyBookingsPage() {
  const { user } = useAuth()

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["employee-bookings", user?.id],
    queryFn: () => fetchEmployeeBookings(user?.id ?? "emp-demo"),
  })

  const upcoming =
    bookings?.filter((b) => ["confirmed", "pending", "active", "checked_in"].includes(b.status)) ?? []
  const past = bookings?.filter((b) => ["completed", "cancelled"].includes(b.status)) ?? []

  return (
    <div>
      <h1 className="text-[32px] font-semibold tracking-tight">Trips</h1>
      <p className="mt-1 text-muted-foreground">Your guest house reservations and digital access</p>

      {isLoading ? (
        <div className="mt-8 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          <section>
            <h2 className="mb-4 text-xl font-semibold">Upcoming</h2>
            {upcoming.length > 0 ? (
              <div className="space-y-4">
                {upcoming.map((b) => (
                  <AirbnbTripCard
                    key={b.id}
                    booking={b}
                    linkTo={`/employee/access/${b.id}`}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
                No upcoming trips. Explore guest houses to book your next stay.
              </div>
            )}
          </section>

          {past.length > 0 && (
            <section>
              <h2 className="mb-4 text-xl font-semibold">Past trips</h2>
              <div className="space-y-4">
                {past.map((b) => (
                  <AirbnbTripCard key={b.id} booking={b} linkTo={`/employee/access/${b.id}`} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
