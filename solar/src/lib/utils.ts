import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const basepath = import.meta.env.BASE_URL.replace(/\/$/, "") || "/"

/** For plain <a href> and window.location, which do not know the router basepath. */
export const appPath = (path: string) => `${import.meta.env.BASE_URL.replace(/\/$/, "")}${path}`
