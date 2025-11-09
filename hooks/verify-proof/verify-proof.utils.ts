export const ziskVerifiableProvers = {
  type: "zisk",
  provers: [
    "efa90d57-3269-4d8d-8e9c-947d6c311420",
    "33f14a82-47b7-42d7-9bc1-b81a46eea4fe",
    "c759bbea-e1d7-462c-9fdc-2a47d979e495",
  ],
} as const

export const picoVerifiableProvers = {
  type: "pico",
  provers: ["4eb78a0b-61c1-464f-80f2-20f1f56aea73"],
} as const

export const picoPrismVerifiableProvers = {
  type: "pico-prism",
  provers: ["79041a5b-ee8d-49b3-8207-86c7debf8e13"],
} as const

export const zirenVerifiableProvers = {
  type: "ziren",
  provers: ["84a01f4b-8078-44cf-b463-90ddcd124960"],
} as const

export const verifiableProvers = [
  ...ziskVerifiableProvers.provers,
  ...picoVerifiableProvers.provers,
  ...picoPrismVerifiableProvers.provers,
  ...zirenVerifiableProvers.provers,
] as const

export const proverTypeMap = new Map<
  string,
  "zisk" | "pico" | "pico-prism" | "ziren"
>([
  ...ziskVerifiableProvers.provers.map((id) => [id, "zisk"] as const),
  ...picoVerifiableProvers.provers.map((id) => [id, "pico"] as const),
  ...picoPrismVerifiableProvers.provers.map(
    (id) => [id, "pico-prism"] as const
  ),
  ...zirenVerifiableProvers.provers.map((id) => [id, "ziren"] as const),
])

export function getProverType(
  id: string
): "zisk" | "pico" | "pico-prism" | "ziren" | undefined {
  return proverTypeMap.get(id)
}

export function isVerifiableProver(id: string): boolean {
  return proverTypeMap.has(id)
}

export async function handleBlobRead(blob: Blob): Promise<Uint8Array> {
  const buf = await blob.arrayBuffer()
  return new Uint8Array(buf)
}
