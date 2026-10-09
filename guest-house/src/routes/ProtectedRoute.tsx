import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import type { UserRole } from "@/types"

interface ProtectedRouteProps {
  children: React.ReactNode
  role: UserRole
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/employee"} replace />
  }

  return <>{children}</>
}
