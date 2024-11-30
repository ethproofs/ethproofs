import type { Proof } from "./types"

export const isCompleted = (proof: Proof) => proof.proof_status === "proved"

/**
 * Calculates the average latency of an array of proofs.
 * Filters to completed proofs; other statuses do not yet have a latency
 *
 * @param {Proof[]} proofs - An array of proof objects.
 * @returns {number} - The average latency of the proofs.
 */
export const getProofsAvgLatency = (proofs: Proof[]): number =>
  proofs
    .filter(isCompleted)
    .reduce((acc, proof) => acc + (proof.proof_latency || 0), 0) / proofs.length

export const getProofBestLatency = (proofs: Proof[]): Proof => {
  const completedProofs = proofs.filter(isCompleted)
  return completedProofs.reduce((a, b) => {
    if (!a.proof_latency) return b
    if (!b.proof_latency) return a
    return a.proof_latency < b.proof_latency ? a : b
  }, completedProofs[0])
}

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

export const filterCompleted = (proofs: Proof[]) => ({
  completedProofs: proofs.filter(isCompleted),
})
