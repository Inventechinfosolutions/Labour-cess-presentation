export interface RegisteredEmployee {
  mobile: string
  employeeId: string
  registeredAt: string
}

const STORAGE_KEY = "ghb_registered_employees"

function normalizeMobile(mobile: string) {
  return mobile.replace(/\D/g, "").slice(0, 10)
}

function normalizeEmployeeId(employeeId: string) {
  return employeeId.trim().toUpperCase()
}

export function getRegisteredEmployees(): RegisteredEmployee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as RegisteredEmployee[]) : []
  } catch {
    return []
  }
}

export function findRegisteredEmployee(mobile: string): RegisteredEmployee | undefined {
  const normalized = normalizeMobile(mobile)
  return getRegisteredEmployees().find((entry) => entry.mobile === normalized)
}

export function isEmployeeIdTaken(employeeId: string): boolean {
  const normalized = normalizeEmployeeId(employeeId)
  return getRegisteredEmployees().some((entry) => entry.employeeId === normalized)
}

export function saveRegisteredEmployee(
  mobile: string,
  employeeId: string
): { ok: true; employee: RegisteredEmployee } | { ok: false; error: string } {
  const normalizedMobile = normalizeMobile(mobile)
  const normalizedEmployeeId = normalizeEmployeeId(employeeId)

  if (normalizedMobile.length !== 10) {
    return { ok: false, error: "Enter a valid 10-digit mobile number" }
  }

  if (!/^[A-Z0-9/-]{4,24}$/.test(normalizedEmployeeId)) {
    return {
      ok: false,
      error: "Employee ID must be 4–24 characters (letters, numbers, / or -)",
    }
  }

  if (findRegisteredEmployee(normalizedMobile)) {
    return { ok: false, error: "This mobile number is already registered" }
  }

  if (isEmployeeIdTaken(normalizedEmployeeId)) {
    return { ok: false, error: "This employee ID is already registered" }
  }

  const employee: RegisteredEmployee = {
    mobile: normalizedMobile,
    employeeId: normalizedEmployeeId,
    registeredAt: new Date().toISOString(),
  }

  const next = [employee, ...getRegisteredEmployees()]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return { ok: true, employee }
}
