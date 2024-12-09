import type { BlockWithProofs, Proof } from "./types"

export const isCompleted = (proof: Proof) => proof.proof_status === "proved"

/**
 * Calculates the average proving time of an array of proofs.
 * Filters to completed proofs; other statuses do not yet have a proving time
 *
 * @param {Proof[]} proofs - An array of proof objects.
 * @returns {number} - The average proving time of the proofs.
 */
export const getProofsAvgProvingTime = (proofs: Proof[]): number | null => {
  const completedProofs = proofs.filter(isCompleted)
  if (!completedProofs.length) return null
  return (
    completedProofs.reduce((acc, proof) => acc + (proof.proving_time || 0), 0) /
    completedProofs.length
  )
}

export const getProofsAvgTimeToProof = (
  block: BlockWithProofs
): number | null => {
  if (!block.timestamp || !block.proofs) return null

  const completedProofs = block.proofs
    .filter(isCompleted)
    .filter(
      (p) =>
        p.proved_timestamp &&
        new Date(p.proved_timestamp).getTime() >
          new Date(block.timestamp!).getTime()
    )
  if (!completedProofs.length) return null

  const blockTimestamp = new Date(block.timestamp).getTime()

  const averageProvedTime =
    completedProofs.reduce((acc, proof) => {
      const timestampTime = new Date(proof.proved_timestamp!).getTime()
      return acc + timestampTime
    }, 0) / completedProofs.length

  return averageProvedTime - blockTimestamp // In milliseconds
}

export const getProofBestProvingTime = (proofs: Proof[]): Proof | null => {
  const completedProofs = proofs.filter(isCompleted)
  if (!completedProofs.length) return null
  return completedProofs.reduce((a, b) => {
    if (!a.proving_time) return b
    if (!b.proving_time) return a
    return a.proving_time < b.proving_time ? a : b
  }, completedProofs[0])
}

export const getProofBestTimeToProof = (proofs: Proof[]): Proof | null => {
  const completedProofs = proofs.filter(isCompleted)
  if (!completedProofs.length) return null
  return completedProofs.reduce((a, b) => {
    if (!a.proved_timestamp) return b
    if (!b.proved_timestamp) return a
    return a.proved_timestamp < b.proved_timestamp ? a : b
  }, completedProofs[0])
}

/**
 * Calculates the average proving cost of an array of proofs.
 *
 * @param {Proof[]} proofs - An array of proof objects.
 * @returns {number} - The average proving cost of the proofs.
 */
export const getProofsAvgCost = (proofs: Proof[]): number => {
  const completedProofs = proofs.filter(isCompleted)
  return (
    completedProofs.reduce(
      (acc, { proving_cost }) => acc + (proving_cost || 0),
      0
    ) / completedProofs.length
  )
}

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

export const getProofCheapestProvingCost = (proofs: Proof[]): Proof | null => {
  const completedProofs = proofs
    .filter(isCompleted)
    .filter((p) => !!p.proving_cost)
  if (!completedProofs.length) return null
  return completedProofs.reduce((a, b) => {
    if (!a.proving_cost) return b
    if (!b.proving_cost) return a
    return a.proving_cost < b.proving_cost ? a : b
  }, completedProofs[0])
}

// Primary sort by proof_status: proved, proving, then queued
// Secondary sorts (lower/earlier first)
// Within `proved` use `proving_time`
// Within `proving` use `proving_timestamp`
// Within `queued` use `queued_timestamp`
export const sortProofsStatusAndTimes = (a: Proof, b: Proof) => {
  if (a.proof_status === "proved" && b.proof_status !== "proved") return -1
  if (a.proof_status !== "proved" && b.proof_status === "proved") return 1
  if (a.proof_status === "proving" && b.proof_status !== "proving") return -1
  if (a.proof_status !== "proving" && b.proof_status === "proving") return 1
  if (a.proof_status === "queued" && b.proof_status !== "queued") return -1
  if (a.proof_status !== "queued" && b.proof_status === "queued") return 1
  if (a.proof_status === "proved") {
    if (!a.proving_time) return 1
    if (!b.proving_time) return -1
    return a.proving_time - b.proving_time
  }
  if (a.proof_status === "proving") {
    if (!a.proving_timestamp) return 1
    if (!b.proving_timestamp) return -1
    return (
      new Date(a.proving_timestamp).getTime() -
      new Date(b.proving_timestamp).getTime()
    )
  }
  if (a.proof_status === "queued") {
    if (!a.queued_timestamp) return 1
    if (!b.queued_timestamp) return -1
    return (
      new Date(a.queued_timestamp).getTime() -
      new Date(b.queued_timestamp).getTime()
    )
  }
  return 0
}
