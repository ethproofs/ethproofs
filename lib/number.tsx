import { ReactNode } from "react"

/**
 * Styles non-numeric characters in a given string by wrapping them in a span with passed className applied.
 * Numeric characters are returned as-is.
 *
 * @param numString - The string containing numeric and non-numeric characters.
 * @param className - Styling class names to apply to the span wrapping non-numeric characters.
 * @returns An array of ReactNode elements where non-numeric characters are wrapped in a span with
 *          the classes provided.
 */
export const stylePunctuation = (
  numString: string,
  className: string
): ReactNode[] =>
  numString.split("").map((char, i) => {
    if (/\d/g.test(char)) return char
    return (
      <span key={i} className={className}>
        {char}
      </span>
    )
  })

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

/**
 * Formats a number according to the specified locale and options, and hides punctuation.
 *
 * @param value - The number to format.
 * @param options - Optional formatting options for the number.
 * @param locale - The locale to use for formatting. Defaults to "en-US".
 * @returns The formatted number with hidden punctuation, or "-" if the value is negative.
 */
export const formatNumberHidePunctuation = (
  value: number,
  options?: Intl.NumberFormatOptions,
  locale = "en-US"
) => {
  if (value < 0) return "-"
  return stylePunctuation(
    formatNumber(value, options, locale),
    "invisible select-none text-[8px]"
  )
}
