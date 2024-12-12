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

export const shouldUseCents = (value: number | null) => value && value < 1

export const formatUsd = (
  value: number,
  options?: Intl.NumberFormatOptions,
  locale = "en-US"
) => {
  const useCents = shouldUseCents(value)

  const adjustedValue = value * (useCents ? 100 : 1)
  const formatted = formatNumber(
    adjustedValue,
    {
      style: "currency",
      currency: "USD",
      maximumSignificantDigits: useCents ? 3 : undefined,
      ...options,
    },
    locale
  )
  return useCents ? formatted.replace("$", "¢") : formatted
}
