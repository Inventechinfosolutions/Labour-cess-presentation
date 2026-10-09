import { useEffect, useState, useCallback } from "react";
import { session, db } from "./mock-db";
import type { User, Role } from "./types";

export function useSession() {
  const [user, setUser] = useState<User | null>(() => session.get());
  useEffect(() => {
    const handler = () => setUser(session.get());
    window.addEventListener("pmis:session-changed", handler);
    return () => window.removeEventListener("pmis:session-changed", handler);
  }, []);
  return user;
}

export function useDbVersion() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const handler = () => setV((x) => x + 1);
    window.addEventListener("pmis:db-changed", handler);
    return () => window.removeEventListener("pmis:db-changed", handler);
  }, []);
  return v;
}

export function roleLabel(r: Role) {
  return ({ ipp: "IPP (Investor)", officer: "Officer", approver: "Approver", admin: "Admin", management: "Management" } as const)[r];
}

export function rolePath(r: Role) {
  return ({ ipp: "/ipp", officer: "/officer", approver: "/approver", admin: "/admin", management: "/management" } as const)[r];
}

export function useRequireRole(allowed: Role | Role[]) {
  const user = useSession();
  const allow = Array.isArray(allowed) ? allowed : [allowed];
  return { user, ok: !!user && allow.includes(user.role) };
}

export function relativeTime(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  const abs = Math.abs(diff);
  const sign = diff >= 0 ? "ago" : "from now";
  if (abs < 60) return "just now";
  if (abs < 3600) return `${Math.round(abs / 60)} min ${sign}`;
  if (abs < 86400) return `${Math.round(abs / 3600)} h ${sign}`;
  return `${Math.round(abs / 86400)} d ${sign}`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export function useLogout() {
  return useCallback(() => session.logout(), []);
}

export { db, session };
