import { type ReactNode } from "react"

import type { Tables } from "./database.types"

export type ProvingMachine = Tables<"prover_machines">

export type Proof = Tables<"proofs">
export type Block = Tables<"blocks">
export type EmptyBlock = Partial<Block> & Pick<Block, "block_number">

export type BlockWithProofs = (EmptyBlock | Block) & { proofs: Proof[] }
export type BlockWithProofsById = Record<number, BlockWithProofs>

export type Metric = {
  label: ReactNode
  description: ReactNode
  value: ReactNode
}

export type SummaryItem = {
  label: string
  icon: ReactNode
  value: string
}
