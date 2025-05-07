export const getBenchmarkColor = (timeMs: number | undefined) => {
  if (!timeMs) return undefined
  if (timeMs < 45 * 1000) return "green" as const
  if (timeMs < 90 * 1000) return "yellow" as const
  return "red" as const
}
