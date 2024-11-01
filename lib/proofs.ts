import { intervalToSeconds, timestampWithinDays } from "./date"
import type { Proof } from "./types"

export const getProofLatency = (proof: Proof): number =>
  intervalToSeconds(proof.prover_duration as string)

export const getProofsAvgLatency = (proofs: Proof[]): number =>
  proofs.reduce((acc, proof) => acc + getProofLatency(proof), 0) / proofs.length

export const getProofsAvgCost = (proofs: Proof[]): number =>
  proofs.reduce((acc, { proving_cost }) => acc + (proving_cost || 0), 0) /
  proofs.length

// TODO: Confirm logic
export const proofsTotalCostPerMegaGas = (
  proofs: Proof[],
  gasUsed: number
): number =>
  proofs.reduce((acc, proof) => acc + (proof.proving_cost || 0), 0) /
  gasUsed /
  1e6

export const proofIsRecent = ({ submission_time }: Proof): boolean =>
  timestampWithinDays(submission_time)

export const proofIsProven = ({ proof_status }: Proof): boolean =>
  proof_status === "proved"

export const filterRecentProven = (proofs: Proof[]): Proof[] =>
  proofs.filter(proofIsRecent).filter(proofIsProven)
