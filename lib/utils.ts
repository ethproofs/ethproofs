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

export const isUUID = (value: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(value)
}

export function isUndefined(value: unknown): value is undefined {
  return typeof value === "undefined"
}

export function isFunction(value: unknown): value is () => void {
  return typeof value === "function"
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function truncateHash(hash: string, start = 6, end = 4): string {
  return `${hash.slice(0, start)}...${hash.slice(-end)}`
}

export function noop(): void {}

export async function noopAsync(): Promise<void> {
  return Promise.resolve()
}
