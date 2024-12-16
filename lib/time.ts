import prettyMilliseconds, { type Options } from "pretty-ms"

/**
 * Formats a duration in milliseconds to a human-readable format.
 * Negative durations return a dash (positive durations only)
 * @param {number} milliseconds - The duration in milliseconds.
 * @returns {string} - The duration in a human-readable format.
 */
export const prettyMs = (milliseconds: number, options?: Options): string => {
  if (milliseconds < 0) return "-"

  const isSubMinute = milliseconds < 60_0000
  const isSubSecond = milliseconds < 1_000
  const isSubMillisecond = milliseconds < 1

  const defaultOptions: Options = {
    separateMilliseconds: isSubSecond,
    formatSubMilliseconds: isSubMillisecond,
    unitCount: isSubMinute ? 1 : 2,
    keepDecimalsOnWholeSeconds: true,
    secondsDecimalDigits: isSubMinute ? 1 : 0,
    millisecondsDecimalDigits: isSubMillisecond ? 1 : 0,
  }

  return prettyMilliseconds(milliseconds, { ...defaultOptions, ...options })
}

export const getTime = (d: string): number => new Date(d).getTime()
