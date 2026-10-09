import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { fetchBuilding, fetchRoom, fetchSite } from "@/services/api"
import { saveSessionBooking } from "@/services/bookingStorage"
import {
  BookingRequestSummary,
} from "@/components/employee/BookingRequestSummary"
import { getBookingImage } from "@/utils/entityImages"
import { formatCurrency, generateAccessId, generateBookingId, buildQrPayload } from "@/utils/format"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export function PaymentPage() {
  const navigate = useNavigate()
  const { bookingDraft, setBookingDraft, setCompletedBookingId, setCompletedBookingAccess, user } =
    useAuth()
  const [processing, setProcessing] = useState(false)
  const [success, setSuccess] = useState(false)

  const { data: room } = useQuery({
    queryKey: ["room", bookingDraft?.roomId],
    queryFn: () => fetchRoom(bookingDraft!.roomId),
    enabled: !!bookingDraft?.roomId,
  })

  const { data: site } = useQuery({
    queryKey: ["site", bookingDraft?.siteId],
    queryFn: () => fetchSite(bookingDraft!.siteId),
    enabled: !!bookingDraft?.siteId,
  })

  const { data: building } = useQuery({
    queryKey: ["building", bookingDraft?.buildingId],
    queryFn: () => fetchBuilding(bookingDraft!.buildingId),
    enabled: !!bookingDraft?.buildingId,
  })

  useEffect(() => {
    if (!bookingDraft) {
      navigate("/employee/locations", { replace: true })
    }
  }, [bookingDraft, navigate])

  if (!bookingDraft) {
    return null
  }

  if (!room || !site || !building) {
    return (
      <div className="mx-auto w-full max-w-[1080px] space-y-6 pb-20 pt-2">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px]">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  const changeHref = `/employee/booking/${bookingDraft.roomId}?site=${bookingDraft.siteId}&building=${bookingDraft.buildingId}`
  const backHref = changeHref
  const imageSrc = getBookingImage(room.id)

  const handlePay = () => {
    setProcessing(true)
    setTimeout(() => {
      setProcessing(false)
      setSuccess(true)

      const bookingId = generateBookingId()
      const accessId = generateAccessId()
      const access = {
        bookingId,
        accessId,
        qrPayload: buildQrPayload(bookingId, accessId),
        userId: user?.id ?? "emp-demo",
        userName: user?.name ?? "Demo Employee",
        siteId: bookingDraft.siteId,
        siteName: site.name,
        buildingName: building.name,
        roomId: room.id,
        roomNumber: room.number,
        roomType: room.type,
        checkIn: bookingDraft.checkIn,
        checkOut: bookingDraft.checkOut,
        guests: bookingDraft.guests,
        totalAmount: bookingDraft.totalAmount,
        status: "confirmed" as const,
        createdAt: new Date().toISOString(),
      }

      saveSessionBooking(access)
      setCompletedBookingId(bookingId)
      setCompletedBookingAccess(access)
      setBookingDraft(null)

      setTimeout(() => {
        navigate(`/employee/access/${bookingId}?new=1`)
      }, 1200)
    }, 1800)
  }

  return (
    <div className="relative mx-auto w-full max-w-[1080px] pb-24 pt-2 sm:pb-20">
      <div className="mb-8 flex items-center gap-4">
        <Link
          to={backHref}
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/80 transition-colors hover:bg-muted/60"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-[22px] font-semibold tracking-tight text-foreground sm:text-[26px]">
          Request to book
        </h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
        <aside className="order-1 lg:order-2 lg:sticky lg:top-[calc(var(--explore-header-offset)+2rem)] lg:self-start">
          <BookingRequestSummary
            draft={bookingDraft}
            room={room}
            site={site}
            imageSrc={imageSrc}
            changeHref={changeHref}
          />
        </aside>

        <main className="order-2 lg:order-1">
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Proceed to payment</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You&apos;ll be directed to Razorpay to complete payment securely. Your booking is
              confirmed once payment is successful and employee verification is complete.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              If the guest house cannot accommodate your request, you&apos;ll be notified and
              receive a full refund per the cancellation policy.
            </p>
            <p className="text-xs text-muted-foreground">
              By selecting the button, I agree to the{" "}
              <button type="button" className="font-semibold text-foreground underline underline-offset-2">
                booking terms
              </button>
              .
            </p>

            <button
              type="button"
              onClick={handlePay}
              disabled={processing || success}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-6 py-3.5 text-base font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
                "sm:max-w-md"
              )}
            >
              {processing ? (
                "Processing..."
              ) : (
                <>
                  Continue to
                  <span className="font-bold tracking-tight">Razorpay</span>
                </>
              )}
            </button>
          </section>
        </main>
      </div>

      {success && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm">
          <CheckCircle2 className="size-16 text-emerald-500" />
          <p className="mt-4 text-lg font-semibold text-foreground">Payment successful</p>
          <p className="mt-1 text-sm text-muted-foreground">Generating your QR access pass...</p>
        </div>
      )}

      <div className="fixed bottom-[4.25rem] left-0 right-0 z-40 border-t border-border/80 bg-card px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-4">
          <div>
            <p className="text-base font-semibold text-foreground">
              {formatCurrency(bookingDraft.totalAmount)}
            </p>
            <p className="text-xs text-muted-foreground">Total · incl. taxes</p>
          </div>
          <button
            type="button"
            disabled={processing || success}
            onClick={handlePay}
            className="shrink-0 rounded-lg bg-foreground px-5 py-3 text-sm font-semibold text-background disabled:opacity-60"
          >
            {processing ? "Processing..." : "Continue"}
          </button>
        </div>
      </div>
    </div>
  )
}
