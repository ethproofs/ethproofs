import type { Block, Proof } from "./types"

// Filters
export const isCompleted = (proof: Proof) => proof.proof_status === "proved"

export const costInfoAvailable = (p: Proof) =>
  !!p.proving_time && !!p.cluster_configurations?.[0]?.awsInstance?.hourly_price

/**
 * Determines if a proof has a proved timestamp.
 * @param {Proof} p - The proof object.
 * @returns {boolean} - True if the proof has a proved timestamp, false otherwise.
 */
export const provedTimestampAvailable = (p: Proof) => !!p.proved_timestamp

/**
 * Determines if a proof has a proving time (duration of time computing proof).
 * @param {Proof} p - The proof object.
 * @returns {boolean} - True if the proof has a proving time, false otherwise.
 */
export const provingTimeAvailable = (p: Proof) => !!p.proving_time

/**
 * Determines if a proof has a proved_timestamp, a block has a timestamp, and the block came first.
 * @param {Proof} p - The proof object.
 * @param {Block} b - The block object.
 * @returns {boolean} - True if the proof has a proved timestamp and the proof came after the block, false otherwise.
 */
export const timeToProofInfoAvailable = (p: Proof, b: Block) =>
  p.proved_timestamp &&
  new Date(p.proved_timestamp).getTime() > new Date(b.timestamp!).getTime()

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

export const getProofsAvgTimeToProof = (block: Block): number | null => {
  if (!block.timestamp || !block.proofs) return null

  const availableProofs = block.proofs
    .filter(isCompleted)
    .filter((p) => timeToProofInfoAvailable(p, block))
  if (!availableProofs.length) return null

  const blockTimestamp = new Date(block.timestamp).getTime()

  const averageProvedTime =
    availableProofs.reduce((acc, proof) => {
      const timestampTime = new Date(proof.proved_timestamp!).getTime()
      return acc + timestampTime
    }, 0) / availableProofs.length

  return averageProvedTime - blockTimestamp // In milliseconds
}

export const getProofBestProvingTime = (proofs: Proof[]): Proof | null => {
  const availableProofs = proofs
    .filter(isCompleted)
    .filter(provingTimeAvailable)

  if (!availableProofs.length) return null

  return availableProofs.reduce((a, b) => {
    if (!a.proving_time) return b
    if (!b.proving_time) return a
    return a.proving_time < b.proving_time ? a : b
  }, availableProofs[0])
}

export const getProofBestTimeToProof = (proofs: Proof[]): Proof | null => {
  const availableProofs = proofs
    .filter(isCompleted)
    .filter(provedTimestampAvailable)

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
export const getProvingCost = (proof: Proof): number => {
  const { proving_time, cluster_configurations } = proof
  const { hourly_price } = cluster_configurations?.[0]?.awsInstance || {}
  if (!proving_time || !hourly_price) return 0
  return (proving_time * hourly_price) / 1e3 / 60 / 60
}

/**
 * Calculates the total proving cost from an array of proofs.
 *
 * @param proofs - An array of Proof objects.
 * @returns The total proving cost as a number (USD).
 */
export const getSumProvingCost = (proofs: Proof[]): number =>
  proofs
    .filter(isCompleted)
    .reduce((acc, proof) => acc + getProvingCost(proof), 0)

/**
 * Calculates the average proving cost of an array of proofs.
 * Filters to completed proofs and those with proving time and price information
 *
 * @param {Proof[]} proofs - An array of proof objects.
 * @returns {number} - The average proving cost (USD) of the proofs.
 */
export const getAvgProvingCost = (proofs: Proof[]): number => {
  const availableProofs = proofs.filter(isCompleted).filter(costInfoAvailable)

  if (!availableProofs.length) return 0

  const totalCost = getSumProvingCost(availableProofs)

  return totalCost / availableProofs.length
}

export const getAvgCostPerMegaGas = (
  avgProofCost: number,
  gasUsed: number
): number => {
  const megaGasUsed = gasUsed / 1e6
  return avgProofCost / megaGasUsed
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
