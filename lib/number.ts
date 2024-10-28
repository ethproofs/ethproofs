export const formatNumber = (
  value: number,
  options?: Intl.NumberFormatOptions,
  locale = "en-US"
) => new Intl.NumberFormat(locale, options).format(value)
