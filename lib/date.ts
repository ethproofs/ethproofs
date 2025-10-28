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

export function formatTimeAgoDetailed(date: Date | string): string {
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

  // Handle negative values (future dates)
  if (seconds < 0) {
    return "in the future"
  }

  // If less than a second, return "just now"
  if (seconds === 0) {
    return "just now"
  }

  // For timestamps older than 24 hours, use the simpler format
  if (seconds >= 86400) {
    return formatTimeAgo(date)
  }

  // Calculate hours, minutes, and remaining seconds
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts: string[] = []

  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

  return `${parts.slice(0, 2).join(" ")} ago`
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

export const renderTimestamp = (timestamp: string, timeZone?: string): string =>
  new Intl.DateTimeFormat("en-US", {
    dateStyle: "short",
    timeStyle: "long",
    timeZone,
  }).format(new Date(timestamp))

export function formatShortDate(date: Date | string): string {
  if (typeof date === "string") {
    date = new Date(date)
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  })
}
