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
  if (value < 0) return "-"
  return new Intl.NumberFormat(locale, options).format(value)
}

export const formatUsd = (value: number) =>
  formatNumber(value, {
    style: "currency",
    currency: "USD",
  })
