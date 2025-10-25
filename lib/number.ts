/**
 * Formats a positive number according to the specified locale and options.
 *
 * @param value - The number to format.
 * @param options - Optional. An object with properties that define how the number should be formatted.
 * @param locale - Optional. A string with a BCP 47 language tag, or an array of such strings. Defaults to "en-US".
 * @returns The formatted number as a string. If the value is negative, returns "-".
 */
export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions,
  locale = "en-US"
) => {
  if (value < 0 || isNaN(value)) return "-"
  return new Intl.NumberFormat(locale, options).format(value)
}

/**
 * Formats bytes with appropriate unit using binary multipliers (1024).
 * For values < 1 KB, displays as "bytes". For larger values, uses B, KB, MB, GB, TB.
 *
 * @param bytes - The number of bytes to format.
 * @param decimals - Number of decimal places to show (default: 2).
 * @returns The formatted byte size with unit.
 */
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 bytes"

  const k = 1024

  // For values less than 1 KB, display as bytes
  if (bytes < k) {
    return Math.floor(bytes) + " bytes"
  }

  const units = ["KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k)) - 1

  if (i >= units.length) {
    return (
      (bytes / Math.pow(k, units.length)).toFixed(decimals) +
      " " +
      units[units.length - 1]
    )
  }

  return (bytes / Math.pow(k, i + 1)).toFixed(decimals) + " " + units[i]
}

export const formatUsd = (
  value: number,
  options?: Intl.NumberFormatOptions,
  locale = "en-US"
) =>
  formatNumber(
    value,
    {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
      ...options,
    },
    locale
  )
