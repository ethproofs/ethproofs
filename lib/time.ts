import prettyMilliseconds from "pretty-ms"

/**
 * Formats a duration in milliseconds to a human-readable format.
 * Negative durations return a dash (positive durations only)
 * @param {number} milliseconds - The duration in milliseconds.
 * @returns {string} - The duration in a human-readable format.
 */
export const prettyMs = (milliseconds: number): string => {
  if (milliseconds < 0) return "-"
  return prettyMilliseconds(milliseconds)
}

export const getTime = (d: string): number => new Date(d).getTime()
