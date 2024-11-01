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

/**
 * Checks if the proof submission time is within a certain number of days.
 *
 * @param {Proof} proof - The proof object containing the submission time.
 * @returns {boolean} - Returns true if the submission time is within the specified number of days, otherwise false.
 */
const proofIsRecent = ({ submission_time }: Proof): boolean =>
  timestampWithinDays(submission_time)

/**
 * Determines if a proof has been proven.
 *
 * @param proof - An object containing the proof status.
 * @returns A boolean indicating whether the proof status is "proved".
 */
const proofIsProven = ({ proof_status }: Proof): boolean =>
  proof_status === "proved"

/**
 * Filters the given array of proofs to include only those that are recent and proven.
 *
 * @param proofs - An array of Proof objects to be filtered.
 * @returns An array of Proof objects that are both recent and proven.
 */
const proofsFinalizedRecent = (proofs: Proof[]): Proof[] =>
  proofs.filter(proofIsRecent).filter(proofIsProven)

/**
 * Calculates the average cost per proof for recently finalized proofs and formats it as a string.
 *
 * @param proofs - An array of Proof objects.
 * @returns The formatted average cost per proof as a string with up to 2 decimal places.
 */
export const avgCostPerProofRecent = (proofs: Proof[]): string =>
  formatNumber(getProofsAvgCost(proofsFinalizedRecent(proofs)), {
    maximumFractionDigits: 2,
  })

/**
 * Calculates the average latency per proof for recent proofs and formats it as a string.
 *
 * @param proofs - An array of Proof objects.
 * @returns The formatted average latency per proof in seconds.
 */
export const avgLatencyPerProofRecent = (proofs: Proof[]): string =>
  formatNumber(getProofsAvgLatency(proofsFinalizedRecent(proofs)), {
    style: "unit",
    unit: "second",
    unitDisplay: "narrow",
    maximumFractionDigits: 0,
  })

/**
 * Calculates the average latency per proof for list of proofs and formats it as a string.
 *
 * @param proofs - An array of Proof objects.
 * @returns The formatted average latency per proof in seconds.
 */
export const avgLatencyPerProof = (proofs: Proof[]): string =>
  formatNumber(getProofsAvgLatency(proofs.filter(proofIsProven)), {
    style: "unit",
    unit: "second",
    unitDisplay: "narrow",
    maximumFractionDigits: 0,
  })
