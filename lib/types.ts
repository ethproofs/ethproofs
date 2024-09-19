import type { Tables } from "./database.types"

export type Proof = Tables<"proofs">
export type Block = Tables<"blocks">

export type BlockWithProofsIds = Block & { proofs: number[] }
export type BlockWithProofs = Block & { proofs: Proof[] }
