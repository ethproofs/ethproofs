export const UNVERIFIABLE_ZKVM_SLUGS = new Set<string>([])

export function isUnverifiableZkvm(slug: string): boolean {
  return UNVERIFIABLE_ZKVM_SLUGS.has(slug)
}
