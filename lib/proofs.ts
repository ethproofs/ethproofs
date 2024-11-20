import { intervalToSeconds, timestampWithinDays } from "./date"
import { formatNumber } from "./number"
import type { Proof } from "./types"

/**
 * Calculates the latency of a given proof in seconds.
 *
 * @param proof - The proof object containing the prover duration.
 * @returns The latency of the proof in seconds.
 */
export const getProofLatency = (proof: Proof): number =>
  intervalToSeconds(proof.prover_duration as string)

/**
 * Calculates the average latency of an array of proofs.
 *
 * @param {Proof[]} proofs - An array of proof objects.
 * @returns {number} - The average latency of the proofs.
 */
export const getProofsAvgLatency = (proofs: Proof[]): number =>
  proofs.reduce((acc, proof) => acc + getProofLatency(proof), 0) / proofs.length

/**
 * Calculates the average proving cost of an array of proofs.
 *
 * @param {Proof[]} proofs - An array of proof objects.
 * @returns {number} - The average proving cost of the proofs.
 */
export const getProofsAvgCost = (proofs: Proof[]): number =>
  proofs.reduce((acc, { proving_cost }) => acc + (proving_cost || 0), 0) /
  proofs.length

/**
 * Calculates the total proving cost per mega gas used and formats it as a currency string.
 *
 * @param {Proof[]} proofs - An array of proof objects.
 * @param {number} gasUsed - The total gas used.
 * @returns {string} - The total proving cost per mega gas, formatted as a currency string in USD.
 */
// TODO: Confirm logic
export const proofsTotalCostPerMegaGas = (
  proofs: Proof[],
  gasUsed: number
): string => {
  const value =
    proofs.reduce((acc, proof) => acc + (proof.proving_cost || 0), 0) /
    gasUsed /
    1e6
  return formatNumber(value, {
    style: "currency",
    currency: "USD",
  })
}
