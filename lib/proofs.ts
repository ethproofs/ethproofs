import prettyMilliseconds from "pretty-ms"

import { getTime } from "./date"
import { formatUsd } from "./number"
import type { Block, Proof } from "./types"

// Filters

/**
 * Checks if the given proof has been completed.
 *
 * @param proof - The proof object to check.
 * @returns `true` if the proof's status is "proved", otherwise `false`.
 */
export const isCompleted = (proof: Proof) => proof.proof_status === "proved"

/**
 * Checks if the cost information is available for a given proof.
 *
 * @param {Proof} p - The proof object to check.
 * @returns {boolean} `true` if information to calculate costs are available, otherwise `false`.
 */
export const hasCostInfo = (p: Proof) =>
  !!p.proving_time && !!p.cluster_configurations?.[0]?.awsInstance?.hourly_price

/**
 * Determines if a proof has a proved timestamp.
 * @param {Proof} p - The proof object.
 * @returns {boolean} - True if the proof has a proved timestamp, false otherwise.
 */
export const hasProvedTimestamp = (p: Proof) => !!p.proved_timestamp

/**
 * Determines if a proof has a proving time (duration of time computing proof).
 * @param {Proof} p - The proof object.
 * @returns {boolean} - True if the proof has a proving time, false otherwise.
 */
export const hasProvingTime = (p: Proof) => !!p.proving_time

/**
 * Determines if a proof has a proved_timestamp, a block has a timestamp, and the block came first.
 * @param {Proof} p - The proof object.
 * @param {Block} b - The block object.
 * @returns {boolean} - True if the proof has a proved timestamp and the proof came after the block, false otherwise.
 */
export const timeToProofInfoAvailable = (p: Proof, timestamp: string) =>
  p.proved_timestamp &&
  new Date(p.proved_timestamp).getTime() > new Date(timestamp).getTime()

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
  proofs?: Proof[],
  timestamp?: string
): number | null => {
  if (!timestamp || !proofs) return null

  const availableProofs = proofs
    .filter(isCompleted)
    .filter((p) => timeToProofInfoAvailable(p, timestamp))
  if (!availableProofs.length) return null

  const blockTimestamp = new Date(timestamp).getTime()

  const averageProvedTime =
    availableProofs.reduce((acc, proof) => {
      const timestampTime = new Date(proof.proved_timestamp!).getTime()
      return acc + timestampTime
    }, 0) / availableProofs.length

  return averageProvedTime - blockTimestamp // In milliseconds
}

export const getProofBestProvingTime = (proofs: Proof[]): Proof | null => {
  const availableProofs = proofs.filter(isCompleted).filter(hasProvingTime)

  if (!availableProofs.length) return null

  return availableProofs.reduce((a, b) => {
    if (!a.proving_time) return b
    if (!b.proving_time) return a
    return a.proving_time < b.proving_time ? a : b
  }, availableProofs[0])
}

export const getProofBestTimeToProof = (proofs: Proof[]): Proof | null => {
  const availableProofs = proofs.filter(isCompleted).filter(hasProvedTimestamp)

  if (!availableProofs.length) return null

  return availableProofs.reduce((a, b) => {
    if (!a.proved_timestamp) return b
    if (!b.proved_timestamp) return a
    return a.proved_timestamp < b.proved_timestamp ? a : b
  }, availableProofs[0])
}

/**
 * Calculates the cost of proving based on the provided proof object.
 * The cost is calculated as the product of the proving time (milliseconds) and
 * the hourly price of the cluster configuration.
 *
 * @param proof - The proof object containing proving time and cluster configurations.
 * @example hourly_price(USD/hr) * proving_time(ms) / 1e3(ms/s) / 60(s/min) / 60(min/hr) = proving_cost(USD)
 * @returns The calculated proving cost in USD.
 */
export const getProvingCost = (proof: Proof): number | null => {
  const { proving_time, cluster_configurations } = proof
  // TODO: Remove [0] when 1:1 cluster_id to instance_type_id established
  const { hourly_price } = cluster_configurations?.[0]?.awsInstance || {}
  if (!proving_time || !hourly_price) return null
  return (proving_time * hourly_price) / 1e3 / 60 / 60
}

/**
 * Calculates the total proving cost from an array of proofs.
 *
 * @param proofs - An array of Proof objects.
 * @returns The total proving cost as a number (USD).
 */
const getSumProvingCost = (proofs: Proof[]): number => {
  const availableProofs = proofs.filter(isCompleted).filter(hasCostInfo)

  if (!availableProofs.length) return 0

  return availableProofs.reduce(
    (acc, proof) => acc + (getProvingCost(proof) || 0),
    0
  )
}

/**
 * Calculates the average proving cost of an array of proofs.
 * Filters to completed proofs and those with proving time and price information
 *
 * @param {Proof[]} proofs - An array of proof objects.
 * @returns {number} - The average proving cost (USD) of the proofs.
 */
export const getAvgCostPerProof = (proofs: Proof[]): number => {
  const availableProofs = proofs.filter(isCompleted).filter(hasCostInfo)

  if (!availableProofs.length) return 0

  const totalCost = getSumProvingCost(availableProofs)

  return totalCost / availableProofs.length
}

export const getCostPerMgas = (cost: number, gasUsed: number): number => {
  const megaGasUsed = gasUsed / 1e6
  return cost / megaGasUsed
}

const getSumProvingCycles = (proofs: Proof[]): number =>
  proofs.reduce((acc, { proving_cycles }) => acc + (proving_cycles || 0), 0)

export const getAvgCostPerMegaCycle = (proofs: Proof[]): number => {
  return getSumProvingCost(proofs) / getSumProvingCycles(proofs)
}

export const getAvgCostPerTx = (
  avgProofCost: number,
  transactionCount: number
): number => avgProofCost / transactionCount

export const getProofBestProvingCost = (proofs: Proof[]): Proof | null => {
  const availableProofs = proofs.filter(isCompleted).filter(hasCostInfo)

  if (!availableProofs.length) return null

  return availableProofs.reduce((a, b) => {
    const costA = getProvingCost(a) || Infinity
    const costB = getProvingCost(b) || Infinity
    return costA < costB ? a : b
  }, availableProofs[0])
}

/**
 * Sorting function for proofs
 *
 * Primary sort by proof_status: proved, proving, then queued
 * Secondary sorts (lower/earlier first)
 * Within `proved` use `proving_time`
 * Within `proving` use `proving_timestamp`
 * Within `queued` use `queued_timestamp`
 */
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

export const downloadProof = (proof: Proof) => {
  const { proof: binary, proof_id, block_number, team, cluster_id } = proof

  if (!binary) {
    console.warn("Download failed - no proof binary found")
    console.warn(`Block: ${block_number}, Proof ID: ${proof_id}`)
    return
  }

  const teamName = team?.team_name ? team.team_name : cluster_id.split("-")[0]
  const suggestedFilename = `${block_number}_${teamName}_${proof_id}.bin`

  const blob = new Blob([binary], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = suggestedFilename
  a.click()
  URL.revokeObjectURL(url)
}

export const getCostPerProofStats = (proofs?: Proof[]) => {
  if (!proofs || !proofs.length) return null

  const availableProofs = proofs.filter(isCompleted).filter(hasCostInfo)

  if (!availableProofs.length) return null

  const avg = getAvgCostPerProof(availableProofs)

  const bestProof = getProofBestProvingCost(availableProofs) as Proof

  const best = getProvingCost(bestProof) as number

  return {
    avg,
    avgFormatted: formatUsd(avg),
    best,
    bestFormatted: formatUsd(best),
    bestProof,
  }
}

export const getCostPerMgasStats = (proofs?: Proof[], gasUsed?: number) => {
  if (!proofs || !proofs.length || !gasUsed) return null

  const costPerProofStats = getCostPerProofStats(proofs)

  if (!costPerProofStats) return null

  const { avg, best, bestProof } = costPerProofStats

  const avgPerMgas = getCostPerMgas(avg, gasUsed)
  const bestPerMgas = getCostPerMgas(best, gasUsed)

  return {
    avg: avgPerMgas,
    avgFormatted: formatUsd(avgPerMgas),
    best: bestPerMgas,
    bestFormatted: formatUsd(bestPerMgas),
    bestProof,
  }
}

export const getProvingTimeStats = (proofs?: Proof[]) => {
  if (!proofs || !proofs.length) return null

  const availableProofs = proofs.filter(isCompleted).filter(hasProvingTime)

  if (!availableProofs.length) return null

  const avg = getProofsAvgProvingTime(availableProofs) as number

  const bestProof = availableProofs.reduce((acc, p) => {
    const oldTime = getTime(acc.proved_timestamp!)
    const newTime = getTime(p.proved_timestamp!)
    if (newTime < oldTime) return p
    return acc
  }, availableProofs[0])

  const best = bestProof.proving_time as number

  const avgFormatted = avg ? prettyMilliseconds(avg) : null

  if (!isFinite(best)) return null

  const bestFormatted = prettyMilliseconds(best)

  return {
    avg,
    avgFormatted,
    best,
    bestFormatted,
    bestProof,
  }
}

export const getTotalTTPStats = (proofs?: Proof[], timestamp?: string) => {
  if (!proofs || !proofs.length || !timestamp) return null

  const availableProofs = proofs.filter(isCompleted).filter(hasProvedTimestamp)

  const bestProof = availableProofs?.reduce((acc, p) => {
    const oldTime = getTime(acc.proved_timestamp!)
    const newTime = getTime(p.proved_timestamp!)
    if (newTime < oldTime) return p
    return acc
  }, availableProofs[0])

  const msAfterBlock = (submissionTime: number) =>
    submissionTime - getTime(timestamp)

  const avgTime = getProofsAvgTimeToProof(proofs, timestamp) as number

  const avg = msAfterBlock(avgTime)

  const bestTime = getTime(bestProof.proved_timestamp as string)

  const best = msAfterBlock(bestTime)

  const formatted = (ms: number) => {
    if (ms < 0) return "-"
    prettyMilliseconds(ms)
  }

  const avgFormatted = formatted(avg)

  const bestFormatted = formatted(best)

  return {
    avg,
    avgFormatted,
    best,
    bestFormatted,
    bestProof,
  }
}
