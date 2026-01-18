/**
 * Maps zkvm slugs to their corresponding verifier implementations.
 * This replaces the old hardcoded cluster ID approach in lib/provers.ts
 */
export type VerifiableZkvmSlug =
  | "zisk"
  | "pico"
  | "ziren"
  | "sp1-hypercube"
  | "openvm"
  | "airbender"

/**
 * Check if a zkvm slug has a corresponding verifier implementation
 */
export function isVerifiableZkvm(slug: string): slug is VerifiableZkvmSlug {
  return [
    "zisk",
    "pico",
    "ziren",
    "sp1-hypercube",
    "openvm",
    "airbender",
  ].includes(slug)
}

/**
 * Verifier handles vk internally
 */
export function isVerifiableZkvmWithoutVk(
  slug: string
): slug is VerifiableZkvmSlug {
  return ["airbender"].includes(slug)
}

/**
 * Get the verifier type for a given zkvm slug
 * Returns undefined if the zkvm doesn't have a verifier implementation
 */
export function getVerifierByZkvmSlug(
  slug: string
): VerifiableZkvmSlug | undefined {
  if (isVerifiableZkvm(slug)) {
    return slug
  }
  return undefined
}
