import { type ReactNode } from "react"

import {
  blocks,
  cloudInstances,
  clusterConfigurations,
  clusters,
  proofs,
  teams,
  teamsSummary,
} from "@/db/schema"

/**
 * Represents a row in the cloud_instances table.
 */
export type CloudInstance = typeof cloudInstances.$inferSelect

/**
 * Represents a row in the blocks table.
 */
export type BlockBase = typeof blocks.$inferSelect

/**
 * Represents a row in the clusters table.
 */
export type ClusterBase = typeof clusters.$inferSelect

/**
 * Represents a row in the cluster_configurations table.
 */
export type ClusterConfigBase = typeof clusterConfigurations.$inferSelect

/**
 * Represents a row in the proofs table.
 */
export type ProofBase = typeof proofs.$inferSelect

/**
 * Represents a row in the teams table.
 */
export type Team = typeof teams.$inferSelect

/**
 * Represents a row in the teams_summary view.
 */
export type TeamSummary = typeof teamsSummary.$inferSelect

/**
 * Extensions for the ClusterConfig type, adding optional cloudInstance property.
 */
export type ClusterConfigExtensions = {
  cloud_instance?: CloudInstance | null
}

/**
 * Represents a cluster configuration, combining ClusterConfigBase with ClusterConfigExtensions.
 */
export type ClusterConfig = ClusterConfigBase & ClusterConfigExtensions

/**
 * Extensions for the Cluster type, adding optional clusterConfig property.
 */
export type ClusterExtensions = {
  cluster_configuration?: ClusterConfig[]
}

/**
 * Represents a cluster, combining ClusterBase with ClusterExtensions.
 */
export type Cluster = ClusterBase & ClusterExtensions

/**
 * Extensions for the Proof type, adding optional block, cluster, and team properties.
 */
export type ProofExtensions = {
  block?: BlockBase
  cluster?: Cluster | null
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
 * Represents a metric with a label, description, and value, all of which are React nodes,
 * and a unique key for element array mapping.
 */
export type Metric = {
  key: string
  label: ReactNode
  description: ReactNode
  value: ReactNode
}

/**
 * Represents a summary item with a label, icon, and value,
 * with a unique key for element array mapping.
 */
export type SummaryItem = {
  key: string
  label: ReactNode
  icon: ReactNode
  value: ReactNode
}

/**
 * Basic statistical output for a metric
 * Includes average and best values, as well as proof (team) data for the best
 */
export type Stats = {
  avg: number
  avgFormatted: string
  best: number
  bestFormatted: string
  bestProof: Proof
}
