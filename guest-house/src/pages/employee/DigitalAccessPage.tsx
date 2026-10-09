import { useMemo, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { gsap } from "@/animations/gsap"
import { useAuth } from "@/context/AuthContext"
import { DigitalAccessCard } from "@/components/employee/DigitalAccessCard"
import { fetchBookings } from "@/services/api"
import { getSessionBookingById } from "@/services/bookingStorage"
import type { EmployeeBookingAccess } from "@/types"
import { buildQrPayload } from "@/utils/format"
import { Button } from "@/components/ui/button"

function mockAccessFromBooking(booking: {
  id: string
  userId: string
  userName: string
  siteId: string
  siteName: string
  buildingName: string
  roomId: string
  roomNumber: string
  roomType: EmployeeBookingAccess["roomType"]
  checkIn: string
  checkOut: string
  guests: number
  totalAmount: number
  status: EmployeeBookingAccess["status"]
  createdAt: string
}): EmployeeBookingAccess {
  const accessId = `UQ-2026-${booking.id.slice(-6).replace(/\D/g, "") || "100001"}`
  return {
    bookingId: booking.id,
    accessId,
    qrPayload: buildQrPayload(booking.id, accessId),
    userId: booking.userId,
    userName: booking.userName,
    siteId: booking.siteId,
    siteName: booking.siteName,
    buildingName: booking.buildingName,
    roomId: booking.roomId,
    roomNumber: booking.roomNumber,
    roomType: booking.roomType,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    guests: booking.guests,
    totalAmount: booking.totalAmount,
    status: booking.status,
    createdAt: booking.createdAt,
  }
}

export function DigitalAccessPage() {
  const { bookingId } = useParams<{ bookingId: string }>()
  const [searchParams] = useSearchParams()
  const isNew = searchParams.get("new") === "1"
  const { getBookingAccess, completedBookingAccess } = useAuth()
  const [accessGranted, setAccessGranted] = useState(false)

  const { data: bookings } = useQuery({
    queryKey: ["bookings"],
    queryFn: fetchBookings,
  })

  const access = useMemo(() => {
    if (bookingId) {
      const sessionAccess = getBookingAccess(bookingId) ?? getSessionBookingById(bookingId)
      if (sessionAccess) return sessionAccess
    }

    if (completedBookingAccess) return completedBookingAccess

    const booking = bookings?.find((item) => item.id === bookingId) ?? bookings?.[0]
    return booking ? mockAccessFromBooking(booking) : null
  }, [bookingId, bookings, completedBookingAccess, getBookingAccess])

  const handleScan = () => {
    setAccessGranted(true)
    gsap.from(".access-granted", {
      scale: 0.8,
      opacity: 0,
      duration: 0.5,
      ease: "back.out(1.7)",
    })
  }

  if (!access) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-lg font-semibold text-foreground">Access pass not found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete a booking to receive your QR code and unique access ID.
        </p>
        <Button asChild className="mt-6">
          <Link to="/employee/locations">Browse guest houses</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-lg pb-20 pt-2">
      <div className="mb-6 flex items-center gap-4">
        <Link
          to="/employee/bookings"
          className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border/80 transition-colors hover:bg-muted/60"
          aria-label="Go back"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground sm:text-[26px]">
            Digital access
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Use your QR code and unique ID to enter the guest house
          </p>
        </div>
      </div>

      <DigitalAccessCard
        access={access}
        isNew={isNew}
        accessGranted={accessGranted}
        onSimulateScan={handleScan}
      />

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="outline" asChild>
          <Link to="/employee/bookings">View my trips</Link>
        </Button>
        <Button asChild>
          <Link to="/employee">Back to explore</Link>
        </Button>
      </div>
    </div>
  )
}
