export function formatTimeAgo(date: Date | string): string {
  // Initialize a default date as the current date
  let _date: Date = new Date()

  // Check if the input is a string and convert it to a Date object
  if (typeof date === "string") {
    _date = new Date(date)
  } else {
    _date = date
  }

  // Calculate the time difference in seconds
  const seconds: number = Math.floor(
    (new Date().getTime() - _date.getTime()) / 1000
  )

  // Define intervals for different time units in seconds
  const intervals: Record<string, number> = {
    year: 31536000,
    month: 2628000,
    day: 86400,
    hour: 3600,
    minute: 60,
  }

  // Iterate through the intervals and determine the appropriate unit
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval: number = Math.floor(seconds / secondsInUnit)
    if (interval > 1) {
      return `${interval} ${unit}s ago`
    } else if (interval === 1) {
      return `${interval} ${unit} ago`
    }
  }

  // If no larger unit is found, return "just now"
  return "just now"
}

export function intervalToSeconds(interval: string): number {
  const [hours, minutes, seconds] = interval.split(":").map(Number)

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    throw new Error('Invalid interval format. Expected "HH:MM:SS"')
  }

  return hours * 3600 + minutes * 60 + seconds
}

export function intervalToReadable(interval: string): string {
  const [hours, minutes, seconds] = interval.split(":").map(Number)

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    throw new Error('Invalid interval format. Expected "HH:MM:SS"')
  }

  return `${hours}h ${minutes}m ${seconds}s`
}

/**
 * Checks if a given timestamp is within a specified number of days from the current date.
 *
 * @param {string | null} [timestamp] - The timestamp to check. If not provided or null, the function returns false.
 * @param {number} [days=30] - The number of days to compare against. Defaults to 30 days.
 * @returns {boolean} - Returns true if the timestamp is within the specified number of days from the current date, otherwise false.
 */
export function timestampWithinDays(
  timestamp?: string | null,
  days = 5 * 365 // TODO: Change back to 30-day default for production
): boolean {
  if (!timestamp) return false
  return Date.now() - new Date(timestamp).getTime() < days * 24 * 60 * 60 * 1000
}

export const renderTimestamp = (timestamp: string): string =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "long",
    timeZone: "UTC",
  }).format(new Date(timestamp))
