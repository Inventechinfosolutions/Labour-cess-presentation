import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Lang } from "@/lib/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export const external = (href: string) =>
  href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {};

export function dateParts(iso: string, lang: Lang) {
  const d = new Date(`${iso}T00:00:00`);
  const locale = lang === "kn" ? "kn-IN" : "en-IN";
  return {
    day: String(d.getDate()).padStart(2, "0"),
    monthYear: new Intl.DateTimeFormat(locale, { month: "short", year: "numeric" }).format(d),
    full: new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(d),
  };
}
