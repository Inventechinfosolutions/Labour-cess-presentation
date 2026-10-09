import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { AuthUser, BookingDraft, EmployeeBookingAccess } from "@/types"
import { getSessionBookingById } from "@/services/bookingStorage"
import { findRegisteredEmployee } from "@/services/employeeRegistrationStorage"
import { adminUser } from "@/mock-data/users"

interface AuthContextValue {
  user: AuthUser | null
  bookingDraft: BookingDraft | null
  loginEmployee: (mobile: string, otp: string) => boolean
  loginAdmin: (username: string, password: string) => boolean
  logout: () => void
  setBookingDraft: (draft: BookingDraft | null) => void
  completedBookingId: string | null
  setCompletedBookingId: (id: string | null) => void
  completedBookingAccess: EmployeeBookingAccess | null
  setCompletedBookingAccess: (access: EmployeeBookingAccess | null) => void
  getBookingAccess: (bookingId: string) => EmployeeBookingAccess | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

const DEMO_MOBILE = "9999999999"
const DEMO_OTP = "123456"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = sessionStorage.getItem("ghb_user")
    return stored ? (JSON.parse(stored) as AuthUser) : null
  })
  const [bookingDraft, setBookingDraft] = useState<BookingDraft | null>(null)
  const [completedBookingId, setCompletedBookingId] = useState<string | null>(null)
  const [completedBookingAccess, setCompletedBookingAccess] = useState<EmployeeBookingAccess | null>(
    null
  )

  const persistUser = useCallback((u: AuthUser | null) => {
    setUser(u)
    if (u) sessionStorage.setItem("ghb_user", JSON.stringify(u))
    else sessionStorage.removeItem("ghb_user")
  }, [])

  const loginEmployee = useCallback(
    (mobile: string, otp: string) => {
      if (otp !== DEMO_OTP) return false

      const normalizedMobile = mobile.replace(/\D/g, "").slice(0, 10)

      if (normalizedMobile === DEMO_MOBILE) {
        persistUser({
          id: "emp-demo",
          name: "Demo Employee",
          role: "employee",
          mobile: DEMO_MOBILE,
          email: "demo.employee@gov.in",
          employeeId: "DEMO-001",
        })
        return true
      }

      const registered = findRegisteredEmployee(normalizedMobile)
      if (registered) {
        persistUser({
          id: registered.employeeId,
          name: `Employee ${registered.employeeId}`,
          role: "employee",
          mobile: registered.mobile,
          employeeId: registered.employeeId,
        })
        return true
      }

      return false
    },
    [persistUser]
  )

  const loginAdmin = useCallback(
    (username: string, password: string) => {
      if (username === adminUser.username && password === adminUser.password) {
        persistUser({
          id: adminUser.id,
          name: adminUser.name,
          role: "admin",
          email: adminUser.email,
        })
        return true
      }
      return false
    },
    [persistUser]
  )

  const logout = useCallback(() => persistUser(null), [persistUser])

  const getBookingAccess = useCallback(
    (bookingId: string) => {
      if (completedBookingAccess?.bookingId === bookingId) return completedBookingAccess
      return getSessionBookingById(bookingId) ?? null
    },
    [completedBookingAccess]
  )

  const value = useMemo(
    () => ({
      user,
      bookingDraft,
      loginEmployee,
      loginAdmin,
      logout,
      setBookingDraft,
      completedBookingId,
      setCompletedBookingId,
      completedBookingAccess,
      setCompletedBookingAccess,
      getBookingAccess,
    }),
    [
      user,
      bookingDraft,
      loginEmployee,
      loginAdmin,
      logout,
      completedBookingId,
      completedBookingAccess,
      getBookingAccess,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
