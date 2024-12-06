import { type ReactNode } from "react"

import type { Tables } from "./database.types"

export type AwsInstance = Tables<"aws_instance_pricing">

export type Block = Tables<"blocks">

export type ClusterBase = Tables<"clusters">
export type ClusterExtensions = {
  clusterConfig?: ClusterConfiguration
  awsInstance?: AwsInstance
}
export type Cluster = ClusterBase & ClusterExtensions

export type ClusterConfiguration = Tables<"cluster_configurations">

export type Team = Tables<"teams">

export type ProofBase = Tables<"proofs">
export type ProofExtensions = {
  block?: Block
  cluster?: Cluster
  team?: Team
}
export type Proof = ProofBase & ProofExtensions

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
