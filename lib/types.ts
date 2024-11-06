import { type ReactNode } from "react"

import type { Tables } from "./database.types"

export type Proof = Tables<"proofs">
export type Block = Tables<"blocks">

export type BlockWithProofsIds = Block & { proofs: number[] }
export type BlockWithProofs = Block & { proofs: Proof[] }

export type Metric = {
  label: string
  description: string
  value: string
}

export type SummaryItem = {
  label: string
  icon: ReactNode
  value: string
}

export type BlockWithProofsId = Block & { proofs: { id: number }[] }
