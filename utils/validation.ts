export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "ValidationError"
  }
}

/**
 * Validates a filename to prevent path traversal attacks and ensure safe storage.
 * Only allows alphanumeric characters, underscores, and hyphens.
 *
 * @param filename - The filename to validate
 * @returns true if the filename is valid, false otherwise
 *
 * @example
 * isValidFilename("benchmarks_v1") // true
 * isValidFilename("../../../etc/passwd") // false
 * isValidFilename("file.with.dots") // false
 */
export function isValidFilename(filename: string): boolean {
  if (!filename || typeof filename !== "string") {
    return false
  }

  // Allow only alphanumeric, underscores, and hyphens
  // Prevents path traversal (../, /), dots, null bytes, and special chars
  const validFilenameRegex = /^[a-zA-Z0-9_-]+$/

  return validFilenameRegex.test(filename)
}

/**
 * Validates a filename and throws an error if invalid.
 * Useful for situations where you want to fail fast.
 *
 * @param filename - The filename to validate
 * @throws Error if the filename is invalid
 *
 * @example
 * validateFilename("safe-file") // passes
 * validateFilename("../unsafe") // throws Error
 * validateFilename("file.json") // throws Error
 */
export function validateFilename(filename: string): void {
  if (!isValidFilename(filename)) {
    throw new ValidationError(
      "Invalid filename format. Only alphanumeric characters, underscores, and hyphens are allowed."
    )
  }
}
