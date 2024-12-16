import { formatUsd } from "./number"
import { getTime, prettyMs } from "./time"
import type { Cluster, ClusterConfig, Proof, ProofSize, Stats } from "./types"

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
 * Requires proof proving_time, per-instance hourly_price, and instance_count
 *
 * @param {Proof} p - The proof object to check.
 * @returns {boolean} `true` if information to calculate costs are available, otherwise `false`.
 */
export const hasCostInfo = (p: Proof) => {
  if (!p.proving_time || !p.cluster?.cluster_configurations) return false
  return p.cluster.cluster_configurations.some(
    (config) =>
      !!config.aws_instance_pricing?.hourly_price && !!config.instance_count
  )
}

/**
 * Determines if a proof has a valid proved timestamp.
 * @param {Proof} p - The proof object.
 * @returns {boolean} - True if the proof has a valid proved timestamp, false otherwise.
 */
export const hasProvedTimestamp = (p: Proof) => {
  if (!p.proved_timestamp) return false
  const time = getTime(p.proved_timestamp)
  return !isNaN(time)
}

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
  p.proved_timestamp && getTime(p.proved_timestamp) > getTime(timestamp)

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
  proofs: Proof[] | undefined,
  timestamp: string | undefined
): number | null => {
  if (!timestamp || !proofs) return null

  const availableProofs = proofs
    .filter(isCompleted)
    .filter((p) => timeToProofInfoAvailable(p, timestamp))
  if (!availableProofs.length) return null

  const blockTimestamp = getTime(timestamp)

  const averageProvedTime =
    availableProofs.reduce((acc, proof) => {
      const timestampTime = getTime(proof.proved_timestamp!)
      return acc + timestampTime
    }, 0) / availableProofs.length

  return averageProvedTime - blockTimestamp // In milliseconds
}

export const getProofBestProvingTime = (
  proofs: Proof[] | undefined
): Proof | null => {
  if (!proofs || !proofs.length) return null

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
 * Calculates the total hourly price for a cluster based on its configuration.
 * Multiplies the hourly price of each instance type by the number of that
 * instance being used within the cluster, and sums the results to get total
 * hourly price per cluster.
 *
 * @param configs - An array of cluster configurations.
 * @returns The total hourly price for the cluster.
 */
export const getClusterHourlyPrice = (cluster: Cluster): number | null => {
  if (!cluster.cluster_configurations) return null
  return cluster.cluster_configurations.reduce((acc, config) => {
    const { instance_count, aws_instance_pricing } = config
    if (!aws_instance_pricing?.hourly_price || !instance_count) return acc
    return acc + instance_count * aws_instance_pricing.hourly_price
  }, 0)
}

/**
 * Calculates the cost of proving based on the provided proof object.
 * The cost is calculated as the product of the proving time (milliseconds) and
 * the total hourly price of the cluster configuration.
 *
 * @param proof - The proof object containing proving time and cluster info.
 * @example clusterHourlyPrice(USD/hr) * proving_time(ms) / 1e3(ms/s) / 60(s/min) / 60(min/hr) = provingCost(USD)
 * @returns The calculated proving cost in USD, as a number.
 */
export const getProvingCost = (proof: Proof): number | null => {
  const { proving_time, cluster } = proof

  if (!proving_time || !cluster) return null

  const clusterHourlyPrice = getClusterHourlyPrice(cluster)

  if (!clusterHourlyPrice) return null

  return (proving_time * clusterHourlyPrice) / 1e3 / 60 / 60
}

/**
 * Calculates the total proving cost from an array of proofs.
 *
 * @param proofs - An array of Proof objects.
 * @returns The total proving cost as a number (USD).
 */
export const getSumProvingCost = (proofs: Proof[]): number => {
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

const getMsTotalTTP = (completedProofTime: number, blockTimestamp: string) =>
  completedProofTime - getTime(blockTimestamp)

// Sorting functions

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
    return getTime(a.proving_timestamp) - getTime(b.proving_timestamp)
  }
  if (a.proof_status === "queued") {
    if (!a.queued_timestamp) return 1
    if (!b.queued_timestamp) return -1
    return getTime(a.queued_timestamp) - getTime(b.queued_timestamp)
  }
  return 0
}

export const mapProofSizes = (
  data: ProofSize[] | null
): Record<number, number> => {
  if (!data?.length) return {}

  return data
    .filter(({ proof_id, byte_size }) => !!proof_id && !!byte_size)
    .reduce(
      (acc, { proof_id, byte_size }) => ({
        ...acc,
        [proof_id!]: byte_size!,
      }),
      {}
    )
}

// Statistics exporters: avg (with formatting), best (with formatting), best proof (team info)

export const getCostPerProofStats = (
  proofs: Proof[] | undefined
): Stats | null => {
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

export const getCostPerMgasStats = (
  proofs: Proof[] | undefined,
  gasUsed: number | undefined
): Stats | null => {
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

export const getProvingTimeStats = (
  proofs: Proof[] | undefined
): Stats | null => {
  if (!proofs || !proofs.length) return null

  const availableProofs = proofs.filter(isCompleted).filter(hasProvingTime)

  if (!availableProofs.length) return null

  // Force-unwrap (!) since we've filtered out proofs without proving_time

  const avg = getProofsAvgProvingTime(availableProofs)!

  const bestProof = getProofBestProvingTime(availableProofs)!

  const best = bestProof.proving_time!

  if (!isFinite(best) || !isFinite(avg)) return null

  const avgFormatted = prettyMs(avg)

  const bestFormatted = prettyMs(best)

  return {
    avg,
    avgFormatted,
    best,
    bestFormatted,
    bestProof,
  }
}

export const getTotalTTPStats = (
  proofs: Proof[] | undefined,
  timestamp: string | undefined
): Stats | null => {
  if (!proofs || !proofs.length || !timestamp) return null

  const availableProofs = proofs.filter(isCompleted).filter(hasProvedTimestamp)

  if (!availableProofs.length) return null

  const bestProof = availableProofs.reduce((acc, p) => {
    const oldTime = getTime(acc.proved_timestamp!)
    const newTime = getTime(p.proved_timestamp!)
    if (newTime < oldTime) return p
    return acc
  }, availableProofs[0])

  if (bestProof.proved_timestamp === null) return null

  const avgTime = getProofsAvgTimeToProof(proofs, timestamp) as number

  const avg = getMsTotalTTP(avgTime, timestamp)

  const bestTime = getTime(bestProof.proved_timestamp)

  const best = getMsTotalTTP(bestTime, timestamp)

  const avgFormatted = prettyMs(avg)

  const bestFormatted = prettyMs(best)

  return {
    avg,
    avgFormatted,
    best,
    bestFormatted,
    bestProof,
  }
}
