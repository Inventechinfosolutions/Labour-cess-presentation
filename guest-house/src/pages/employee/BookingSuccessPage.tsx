import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"

export function BookingSuccessPage() {
  const navigate = useNavigate()
  const { completedBookingId, completedBookingAccess } = useAuth()

  useEffect(() => {
    const bookingId = completedBookingAccess?.bookingId ?? completedBookingId
    if (bookingId) {
      navigate(`/employee/access/${bookingId}?new=1`, { replace: true })
      return
    }
    navigate("/employee/locations", { replace: true })
  }, [completedBookingAccess, completedBookingId, navigate])

  return null
}
