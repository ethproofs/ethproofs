import { type ReactNode } from "react"

import type { Tables } from "./database.types"

export type Proof = Tables<"proofs">
export type Block = Tables<"blocks">
export type EmptyBlock = Partial<Block> & Pick<Block, "block_number">

export type BlockWithProofs = (EmptyBlock | Block) & { proofs: Proof[] }
export type BlockWithProofsById = Record<number, BlockWithProofs>

export type Metric = {
  label: ReactNode
  description: string
  value: string
}

export type SummaryItem = {
  label: string
  icon: ReactNode
  value: string
}
