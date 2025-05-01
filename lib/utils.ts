import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isMobile = (): boolean => {
  if (typeof window === "undefined") return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  )
}

export const base64ToHex = (base64: string) => {
  return Buffer.from(base64, "base64").toString("hex")
}

export const sumArray = (arr?: number[] | null) => {
  if (!arr) return 0
  return arr.reduce((sum, count) => sum + count, 0)
}
