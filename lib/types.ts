import { type ReactNode } from "react"

import type { Tables } from "./database.types"

export type Block = Tables<"blocks">

export type Proof = Tables<"proofs">

export type Team = Tables<"teams">

export type ProverCluster = Tables<"clusters">

export type ProofExtended = Proof & {
  team?: Team
  cluster?: ProverCluster | null
  block?: Partial<Block> | null
}

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
