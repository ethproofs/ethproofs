import { type ReactNode } from "react"

import type { Tables } from "./database.types"

/**
 * Represents a row in the aws_instance_pricing table.
 */
export type AwsInstance = Tables<"aws_instance_pricing">

/**
 * Represents a row in the blocks table.
 */
export type BlockBase = Tables<"blocks">

/**
 * Represents a row in the clusters table.
 */
export type ClusterBase = Tables<"clusters">

/**
 * Represents a row in the cluster_configurations table.
 */
export type ClusterConfigBase = Tables<"cluster_configurations">

/**
 * Represents a row in the proofs table.
 */
export type ProofBase = Tables<"proofs">

/**
 * Represents a row in the teams table.
 */
export type Team = Tables<"teams">

/**
 * Extensions for the ClusterConfig type, adding optional awsInstance property.
 */
export type ClusterConfigExtensions = {
  awsInstance?: AwsInstance
}

/**
 * Represents a cluster configuration, combining ClusterConfigBase with ClusterConfigExtensions.
 */
export type ClusterConfig = ClusterConfigBase & ClusterConfigExtensions

/**
 * Extensions for the Cluster type, adding optional clusterConfig property.
 */
export type ClusterExtensions = {
  clusterConfig?: ClusterConfig
}

/**
 * Represents a cluster, combining ClusterBase with ClusterExtensions.
 */
export type Cluster = ClusterBase & ClusterExtensions

/**
 * Extensions for the Proof type, adding optional block, cluster, and team properties.
 */
export type ProofExtensions = {
  cluster_configurations?: ClusterConfig[]
  block?: BlockBase
  cluster?: Cluster
  team?: Team
}

/**
 * Represents a proof, combining ProofBase with ProofExtensions.
 */
export type Proof = ProofBase & ProofExtensions

/**
 * Represents an empty block, which is a partial BlockBase with a required block_number property.
 */
export type EmptyBlock = Partial<BlockBase> & Pick<BlockBase, "block_number">

/**
 * Extensions for the Block type, adding a proofs property which is an array of Proofs.
 */
export type BlockExtensions = { proofs: Proof[] }

/**
 * Represents a block, which can be either an EmptyBlock or BlockBase, combined with BlockExtensions.
 */
export type Block = (EmptyBlock | BlockBase) & BlockExtensions

/**
 * Represents a record of blocks indexed by their block number.
 */
export type BlocksById = Record<number, Block>

/**
 * Represents a metric with a label, description, and value, all of which are React nodes.
 */
export type Metric = {
  label: ReactNode
  description: ReactNode
  value: ReactNode
}

/**
 * Represents a summary item with a label, icon, and value.
 */
export type SummaryItem = {
  label: string
  icon: ReactNode
  value: string
}
