import { entries, fromEntries } from "remeda"

export const circuitTargets = [
  "sha-256",
  "keccak",
  "poseidon",
  "poseidon2",
  "ecdsa",
] as const
export type CircuitTarget = (typeof circuitTargets)[number]

export const defaultCircuitTarget: CircuitTarget = "sha-256"

const targetToDataKeyMap = {
  "sha-256": "sha256",
  keccak: "keccak",
  poseidon: "poseidon",
  poseidon2: "poseidon2",
  ecdsa: "ecdsa",
} as const satisfies Record<CircuitTarget, string>

export type DataTarget = (typeof targetToDataKeyMap)[CircuitTarget]

export const targetToDataKey: Record<CircuitTarget, DataTarget> = targetToDataKeyMap

export const dataKeyToTarget = fromEntries(
  entries(targetToDataKeyMap).map(([k, v]) => [v, k])
) as Record<DataTarget, CircuitTarget>

const fieldElementTargets: ReadonlyArray<CircuitTarget> = ["poseidon", "poseidon2"]

function isFieldElementTarget(target: string): boolean {
  return fieldElementTargets.some((t) => t === target)
}

export function getInputSizeUnit(target: string): string {
  return isFieldElementTarget(target) ? "input size, field elements" : "input size, bytes"
}

export function formatInputSizeWithUnit(size: number, target: string): string {
  if (isFieldElementTarget(target)) return `${size} f.e.`
  return `${size} B`
}

export const targetSearchParam = "target"
export const inputSizeSearchParam = "inputSize"

export function isValidCircuitTarget(
  value: string | null
): value is CircuitTarget {
  return value !== null && circuitTargets.some((target) => target === value)
}
