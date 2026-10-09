import { differenceInDays, format, parseISO } from "date-fns"

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string): string {
  return format(parseISO(date), "dd MMM yyyy")
}

export function calculateNights(checkIn: string, checkOut: string): number {
  return Math.max(differenceInDays(parseISO(checkOut), parseISO(checkIn)), 1)
}

export function generateBookingId(): string {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `GHB-2026-${num}`
}

export function generateAccessId(): string {
  const num = Math.floor(100000 + Math.random() * 900000)
  return `UQ-2026-${num}`
}

export function buildQrPayload(bookingId: string, accessId: string): string {
  return `GHB:${bookingId}:${accessId}`
}

export function calculateBookingTotal(
  pricePerNight: number,
  nights: number,
  guests: number
): { roomCharges: number; taxes: number; total: number } {
  const roomCharges = pricePerNight * nights
  const guestCharge = guests > 1 ? (guests - 1) * 200 * nights : 0
  const subtotal = roomCharges + guestCharge
  const taxes = Math.round(subtotal * 0.18)
  return { roomCharges: subtotal, taxes, total: subtotal + taxes }
}
