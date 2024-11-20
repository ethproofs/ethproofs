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

export const getAvgCostPerMegaGas = (
  avgProofCost: number,
  gasUsed: number
): number => {
  const megaGasUsed = gasUsed / 1e6
  return avgProofCost / megaGasUsed
}

const getSumProvingCost = (proofs: Proof[]): number =>
  proofs.reduce((acc, { proving_cost }) => acc + (proving_cost || 0), 0)

const getSumProvingCycles = (proofs: Proof[]): number =>
  proofs.reduce((acc, { proving_cycles }) => acc + (proving_cycles || 0), 0)

export const getAvgCostPerMegaCycle = (proofs: Proof[]): number => {
  return getSumProvingCost(proofs) / getSumProvingCycles(proofs)
}

export const getAvgCostPerTx = (
  avgProofCost: number,
  transactionCount: number
): number => avgProofCost / transactionCount
