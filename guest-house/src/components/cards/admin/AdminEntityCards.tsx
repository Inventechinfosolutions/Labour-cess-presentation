import type { LucideIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { Check, ChevronRight, Eye, X } from "lucide-react"
import { AdminEntityCard } from "@/components/admin/AdminEntityCard"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate } from "@/utils/format"
import {
  getAccessImage,
  getBookingImage,
  getBuildingImage,
  getFloorImage,
  getPaymentMethodImage,
  getQrCredentialImage,
  getRefundImage,
  getUserAvatar,
} from "@/utils/entityImages"
import type {
  AccessLog,
  AdminBooking,
  AdminBuilding,
  AdminFloor,
  AdminRoom,
  AdminUser,
  CheckInRecord,
  CheckOutRecord,
  RefundRequest,
  Transaction,
} from "@/types/admin"

export function BuildingEntityCard({ building }: { building: AdminBuilding }) {
  return (
    <AdminEntityCard
      image={getBuildingImage(building.id)}
      imageAlt={building.name}
      title={building.name}
      subtitle={building.siteName}
      code={building.buildingCode}
      status={building.status}
      metrics={[
        { label: "Floors", value: building.floors },
        { label: "Rooms", value: building.rooms.toLocaleString("en-IN") },
      ]}
      progress={{ label: "Occupancy", value: building.occupancy }}
      href={`/admin/buildings/${building.id}`}
      menuItems={[
        { label: "View details", icon: <Eye className="mr-2 size-4" />, href: `/admin/buildings/${building.id}` },
      ]}
    />
  )
}

export function FloorEntityCard({ floor }: { floor: AdminFloor }) {
  return (
    <AdminEntityCard
      image={getFloorImage(floor.id)}
      imageAlt={floor.name}
      title={floor.name}
      subtitle={`${floor.siteName} · ${floor.buildingName}`}
      code={`Floor ${floor.floorNumber}`}
      status={floor.status}
      metrics={[
        { label: "Rooms", value: floor.rooms },
        { label: "Occupancy", value: `${floor.occupancy}%` },
      ]}
      progress={{ label: "Utilization", value: floor.occupancy }}
    />
  )
}

export function RoomEntityCard({ room }: { room: AdminRoom }) {
  return (
    <AdminEntityCard
      image={room.image || getBookingImage(room.id)}
      imageAlt={room.name}
      title={`Room ${room.number}`}
      subtitle={`${room.siteName} · ${room.buildingName}`}
      code={room.type}
      status={room.status}
      metrics={[
        { label: "Price", value: formatCurrency(room.price) },
        { label: "Capacity", value: room.capacity },
      ]}
      progress={{ label: "Occupancy", value: room.occupancy }}
    />
  )
}

export function UserEntityCard({
  user,
  onApprove,
  onReject,
}: {
  user: AdminUser
  onApprove?: () => void
  onReject?: () => void
}) {
  return (
    <AdminEntityCard
      image={getUserAvatar(user.name, user.id)}
      imageAlt={user.name}
      title={user.name}
      subtitle={user.department}
      code={user.employeeId}
      status={user.status}
      extraBadge={
        <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          {user.verificationStatus}
        </span>
      }
      metrics={[
        { label: "Designation", value: user.designation },
        { label: "Bookings", value: user.bookingsCount },
      ]}
      href={`/admin/users/${user.id}`}
      footer={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 rounded-full" asChild>
            <Link to={`/admin/users/${user.id}`}>View profile</Link>
          </Button>
          {onApprove && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={onApprove}>
              <Check className="size-3.5" />
            </Button>
          )}
          {onReject && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={onReject}>
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      }
    />
  )
}

export function BookingEntityCard({
  booking,
  onApprove,
  onCancel,
}: {
  booking: AdminBooking
  onApprove?: () => void
  onCancel?: () => void
}) {
  return (
    <AdminEntityCard
      image={getBookingImage(booking.id)}
      imageAlt={booking.guest}
      title={booking.guest}
      subtitle={`${booking.site} · Room ${booking.room}`}
      code={booking.id}
      status={booking.status}
      extraBadge={
        <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-foreground shadow-sm">
          {booking.paymentStatus}
        </span>
      }
      metrics={[
        { label: "Check-in", value: formatDate(booking.checkIn) },
        { label: "Amount", value: formatCurrency(booking.amount) },
      ]}
      href={`/admin/bookings/${booking.id}`}
      footer={
        <div className="flex gap-2">
          <Button size="sm" className="flex-1 rounded-full" asChild>
            <Link to={`/admin/bookings/${booking.id}`}>View booking</Link>
          </Button>
          {onApprove && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={onApprove}>
              <Check className="size-3.5" />
            </Button>
          )}
          {onCancel && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={onCancel}>
              <X className="size-3.5" />
            </Button>
          )}
        </div>
      }
    />
  )
}

export function TransactionEntityCard({ transaction }: { transaction: Transaction }) {
  return (
    <AdminEntityCard
      image={getBookingImage(transaction.id)}
      imageAlt={transaction.guest}
      title={transaction.guest}
      subtitle={transaction.site}
      code={transaction.id}
      status={transaction.status}
      metrics={[
        { label: "Method", value: transaction.method.toUpperCase() },
        { label: "Amount", value: formatCurrency(transaction.amount) },
      ]}
    />
  )
}

export function AccessLogEntityCard({ log }: { log: AccessLog }) {
  return (
    <AdminEntityCard
      image={getAccessImage(log.id)}
      imageAlt={log.userName}
      title={log.userName}
      subtitle={`${log.site} · Room ${log.room}`}
      code={log.credentialType}
      status={log.eventType}
      metrics={[
        { label: "Event", value: log.eventType },
        { label: "IP", value: log.ipAddress },
      ]}
    />
  )
}

export function CheckInEntityCard({
  record,
  onVerify,
  onQr,
  onCheckIn,
}: {
  record: CheckInRecord
  onVerify?: () => void
  onQr?: () => void
  onCheckIn?: () => void
}) {
  return (
    <AdminEntityCard
      image={getBookingImage(record.bookingId)}
      imageAlt={record.guest}
      title={record.guest}
      subtitle={`${record.site} · Room ${record.room}`}
      code={record.bookingId}
      status={record.status}
      metrics={[
        { label: "Expected", value: record.expectedTime },
        { label: "Site", value: record.site },
      ]}
      footer={
        <div className="flex flex-wrap gap-2">
          {onVerify && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={onVerify}>
              Verify
            </Button>
          )}
          {onQr && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={onQr}>
              QR
            </Button>
          )}
          {onCheckIn && (
            <Button size="sm" className="rounded-full" onClick={onCheckIn}>
              Check in
            </Button>
          )}
        </div>
      }
    />
  )
}

export function CheckOutEntityCard({
  record,
  onInspect,
  onBill,
  onClose,
}: {
  record: CheckOutRecord
  onInspect?: () => void
  onBill?: () => void
  onClose?: () => void
}) {
  return (
    <AdminEntityCard
      image={getBookingImage(record.bookingId)}
      imageAlt={record.guest}
      title={record.guest}
      subtitle={`${record.site} · Room ${record.room}`}
      code={record.bookingId}
      status={record.status}
      metrics={[
        { label: "Expected", value: record.expectedTime },
        { label: "Site", value: record.site },
      ]}
      footer={
        <div className="flex flex-wrap gap-2">
          {onInspect && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={onInspect}>
              Inspect
            </Button>
          )}
          {onBill && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={onBill}>
              Bill
            </Button>
          )}
          {onClose && (
            <Button size="sm" className="rounded-full" onClick={onClose}>
              Close stay
            </Button>
          )}
        </div>
      }
    />
  )
}

export function InventoryRoomEntityCard({
  room,
  onBlock,
  onReserve,
}: {
  room: AdminRoom
  onBlock?: () => void
  onReserve?: () => void
}) {
  return (
    <AdminEntityCard
      image={room.image || getBookingImage(room.id)}
      imageAlt={room.name}
      title={`Room ${room.number}`}
      subtitle={room.siteName}
      code={room.type}
      status={room.status}
      footer={
        <div className="flex gap-2">
          {onBlock && (
            <Button size="sm" variant="outline" className="flex-1 rounded-full" onClick={onBlock}>
              Block
            </Button>
          )}
          {onReserve && (
            <Button size="sm" className="flex-1 rounded-full" onClick={onReserve}>
              Reserve
            </Button>
          )}
        </div>
      }
    />
  )
}

export function RefundEntityCard({
  refund,
  onApprove,
  onReject,
}: {
  refund: RefundRequest
  onApprove?: () => void
  onReject?: () => void
}) {
  return (
    <AdminEntityCard
      image={getRefundImage(refund.id)}
      imageAlt={refund.guest}
      title={refund.guest}
      subtitle={refund.reason}
      code={refund.bookingId}
      status={refund.status}
      metrics={[
        { label: "Requested", value: formatCurrency(refund.requestedAmount) },
        { label: "Total", value: formatCurrency(refund.amount) },
      ]}
      footer={
        refund.status === "pending" ? (
          <div className="flex gap-2">
            {onApprove && (
              <Button size="sm" className="flex-1 rounded-full" onClick={onApprove}>
                <Check className="mr-1 size-3.5" />
                Approve
              </Button>
            )}
            {onReject && (
              <Button size="sm" variant="outline" className="rounded-full" onClick={onReject}>
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        ) : undefined
      }
    />
  )
}

export function PaymentMethodEntityCard({
  method,
  label,
  description,
  active = true,
}: {
  method: string
  label: string
  description?: string
  active?: boolean
}) {
  return (
    <AdminEntityCard
      image={getPaymentMethodImage(method)}
      imageAlt={label}
      title={label}
      subtitle={description}
      status={active ? "active" : "inactive"}
      metrics={[
        { label: "Type", value: method.toUpperCase() },
        { label: "Status", value: active ? "Enabled" : "Disabled" },
      ]}
    />
  )
}

export function QrCredentialEntityCard({
  title,
  description,
  active = true,
}: {
  title: string
  description?: string
  active?: boolean
}) {
  return (
    <AdminEntityCard
      image={getQrCredentialImage(title)}
      imageAlt={title}
      title={title}
      subtitle={description}
      status={active ? "active" : "inactive"}
      metrics={[
        { label: "Type", value: title },
        { label: "Access", value: active ? "Granted" : "Revoked" },
      ]}
    />
  )
}

export function ReportEntityCard({
  title,
  description,
  image,
  icon: Icon,
  onGenerate,
}: {
  title: string
  description: string
  image: string
  icon: LucideIcon
  onGenerate: () => void
}) {
  return (
    <AdminEntityCard
      image={image}
      imageAlt={title}
      title={title}
      subtitle={description}
      footer={
        <div className="flex items-center gap-2">
          <Button size="sm" className="flex-1 rounded-full" onClick={onGenerate}>
            Generate
          </Button>
          <Button size="sm" variant="outline" className="rounded-full" asChild>
            <span className="cursor-pointer">
              <ChevronRight className="size-4" />
            </span>
          </Button>
        </div>
      }
      extraBadge={
        <span className="flex size-7 items-center justify-center rounded-full bg-white/95 shadow-sm">
          <Icon className="size-3.5 text-primary" />
        </span>
      }
    />
  )
}
