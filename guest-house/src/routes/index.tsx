import { createBrowserRouter, Navigate } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoute"
import { EmployeeLayout } from "@/layouts/EmployeeLayout"
import { AdminLayout } from "@/layouts/AdminLayout"
import { LandingPage } from "@/pages/LandingPage"
import { LoginPage } from "@/pages/login/LoginPage"
import { EmployeeDashboard } from "@/pages/employee/EmployeeDashboard"
import { LocationsPage } from "@/pages/employee/LocationsPage"
import { BuildingViewPage } from "@/pages/employee/BuildingViewPage"
import { FloorViewPage } from "@/pages/employee/FloorViewPage"
import { RoomListingPage } from "@/pages/employee/RoomListingPage"
import { BookingPage } from "@/pages/employee/BookingPage"
import { PaymentPage } from "@/pages/employee/PaymentPage"
import { BookingSuccessPage } from "@/pages/employee/BookingSuccessPage"
import { DigitalAccessPage } from "@/pages/employee/DigitalAccessPage"
import { CheckInPage } from "@/pages/employee/CheckInPage"
import { MyBookingsPage } from "@/pages/employee/MyBookingsPage"
import { AdminDashboard } from "@/pages/admin/AdminDashboard"
import { SiteManagementPage } from "@/pages/admin/SiteManagementPage"
import { SiteDetailPage } from "@/pages/admin/SiteDetailPage"
import { BuildingManagementPage } from "@/pages/admin/BuildingManagementPage"
import { BuildingDetailPage } from "@/pages/admin/BuildingDetailPage"
import { FloorManagementPage } from "@/pages/admin/FloorManagementPage"
import { RoomManagementPage } from "@/pages/admin/RoomManagementPage"
import { RoomInventoryPage } from "@/pages/admin/RoomInventoryPage"
import { BookingManagementPage } from "@/pages/admin/BookingManagementPage"
import { BookingDetailPage } from "@/pages/admin/BookingDetailPage"
import { BookingOverridePage } from "@/pages/admin/BookingOverridePage"
import { UserManagementPage } from "@/pages/admin/UserManagementPage"
import { UserDetailPage } from "@/pages/admin/UserDetailPage"
import { CheckInManagementPage } from "@/pages/admin/CheckInManagementPage"
import { CheckOutManagementPage } from "@/pages/admin/CheckOutManagementPage"
import { OccupancyPage } from "@/pages/admin/OccupancyPage"
import { AccessControlPage } from "@/pages/admin/AccessControlPage"
import { PaymentManagementPage } from "@/pages/admin/PaymentManagementPage"
import { ReportsPage } from "@/pages/admin/ReportsPage"
import { AuditLogsPage } from "@/pages/admin/AuditLogsPage"
import { RolesPermissionsPage } from "@/pages/admin/RolesPermissionsPage"
import { SettingsPage } from "@/pages/admin/SettingsPage"
import { AnalyticsPage } from "@/pages/admin/AnalyticsPage"

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/login/employee", element: <Navigate to="/login" replace /> },
  { path: "/login/admin", element: <Navigate to="/login" replace /> },
  {
    path: "/employee",
    element: (
      <ProtectedRoute role="employee">
        <EmployeeLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <EmployeeDashboard /> },
      { path: "locations", element: <LocationsPage /> },
      { path: "locations/:locationId", element: <BuildingViewPage /> },
      {
        path: "locations/:locationId/buildings/:buildingId",
        element: <FloorViewPage />,
      },
      {
        path: "locations/:locationId/buildings/:buildingId/floors/:floorId",
        element: <RoomListingPage />,
      },
      { path: "booking/:roomId", element: <BookingPage /> },
      { path: "payment", element: <PaymentPage /> },
      { path: "booking-success", element: <BookingSuccessPage /> },
      { path: "access", element: <DigitalAccessPage /> },
      { path: "access/:bookingId", element: <DigitalAccessPage /> },
      { path: "check-in/:bookingId", element: <CheckInPage /> },
      { path: "bookings", element: <MyBookingsPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute role="admin">
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "sites", element: <SiteManagementPage /> },
      { path: "sites/:siteId", element: <SiteDetailPage /> },
      { path: "buildings", element: <BuildingManagementPage /> },
      { path: "buildings/:buildingId", element: <BuildingDetailPage /> },
      { path: "floors", element: <FloorManagementPage /> },
      { path: "rooms", element: <RoomManagementPage /> },
      { path: "inventory", element: <RoomInventoryPage /> },
      { path: "users", element: <UserManagementPage /> },
      { path: "users/:userId", element: <UserDetailPage /> },
      { path: "bookings", element: <BookingManagementPage /> },
      { path: "bookings/:bookingId", element: <BookingDetailPage /> },
      { path: "booking-override", element: <BookingOverridePage /> },
      { path: "checkin", element: <CheckInManagementPage /> },
      { path: "checkout", element: <CheckOutManagementPage /> },
      { path: "occupancy", element: <OccupancyPage /> },
      { path: "access", element: <AccessControlPage /> },
      { path: "payments", element: <PaymentManagementPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "audit", element: <AuditLogsPage /> },
      { path: "roles", element: <RolesPermissionsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
], { basename: import.meta.env.BASE_URL })
