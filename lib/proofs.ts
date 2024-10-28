import { intervalToSeconds } from "./date"
import type { Proof } from "./types"

export const proofLatency = (proof: Proof): number =>
  intervalToSeconds(proof.prover_duration as string)

export const proofsAvgLatency = (proofs: Proof[]): number =>
  proofs.reduce((acc, proof) => acc + proofLatency(proof), 0) / proofs.length

// TODO: Confirm logic
export const proofsTotalCostPerMegaGas = (
  proofs: Proof[],
  gasUsed: number
): number =>
  proofs.reduce((acc, proof) => acc + (proof.proving_cost || 0), 0) /
  gasUsed /
  1e6
