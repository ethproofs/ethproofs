import { type ReactNode } from "react"

import { LevelMeterProps } from "@/components/LevelMeter"

import { CHART_RANGES, ZKVM_THRESHOLDS } from "./constants"

import {
  blocks,
  clusters,
  clusterVersions,
  gpuPriceIndex,
  guestPrograms,
  proofs,
  proofsDailyStats,
  proverDailyStats,
  proverTypes,
  recentSummary,
  severityLevel,
  teams,
  teamsSummary,
  zkvmPerformanceMetrics,
  zkvms,
  zkvmSecurityMetrics,
  zkvmVersions,
} from "@/db/schema"

/**
 * Represents a row in the blocks table.
 */
export type BlockBase = typeof blocks.$inferSelect

/**
 * Represents a row in the clusters table.
 */
export type ClusterBase = typeof clusters.$inferSelect

/**
 * Represents a row in the cluster_versions table.
 */
export type ClusterVersionBase = typeof clusterVersions.$inferSelect

/**
 * Represents a row in the proofs table.
 */
export type ProofBase = typeof proofs.$inferSelect

/**
 * Represents a row in the gpu_price_index table.
 */
export type GpuPriceIndex = typeof gpuPriceIndex.$inferSelect

/**
 * Represents a row in the prover_types table.
 */
export type ProverType = typeof proverTypes.$inferSelect

/**
 * Represents a row in the teams table.
 */
export type Team = typeof teams.$inferSelect

/**
 * Represents a row in the guest_programs table.
 */
export type GuestProgram = typeof guestPrograms.$inferSelect

/**
 * Represents a row in the zkvms table.
 */
export type Zkvm = typeof zkvms.$inferSelect

/**
 * Represents a row in the zkvm_versions table.
 */
export type ZkvmVersion = typeof zkvmVersions.$inferSelect

/**
 * Represents a row in the teams_summary view.
 */
export type TeamSummary = typeof teamsSummary.$inferSelect

/**
 * Represents a row in the proofs_daily_stats table.
 */
export type ProofsDailyStats = typeof proofsDailyStats.$inferSelect

/**
 * Represents a row in the recent_summary view.
 */
export type RecentSummary = typeof recentSummary.$inferSelect

/**
 * Represents a row in the prover_daily_stats table.
 */
export type ProverDailyStats = typeof proverDailyStats.$inferSelect

/**
 * Represents a row in the zkvm_security_metrics table.
 */
export type ZkvmSecurityMetric = typeof zkvmSecurityMetrics.$inferSelect

/**
 * Represents a row in the zkvm_performance_metrics table.
 */
export type ZkvmPerformanceMetric = typeof zkvmPerformanceMetrics.$inferSelect

export type SeverityLevel = (typeof severityLevel.enumValues)[number]

export interface SecurityMetricsData {
  implementation_soundness: SeverityLevel
  evm_stf_bytecode: SeverityLevel
  quantum_security: SeverityLevel
  security_target_bits: number
  max_bounty_amount: number
  soundcalc_integration?: boolean
}

export interface PerformanceMetricsData {
  size_bytes: number
  verification_ms: number
}

export type UpdateStatus = "pending" | "rejected"

export interface ZkvmPendingUpdates {
  name?: string
  isa?: string
  repo_url?: string | null
  is_open_source?: boolean
  is_dual_licensed?: boolean
  is_proving_mainnet?: boolean
  version?: string
  security_metrics?: Partial<SecurityMetricsData>
  performance_metrics?: Partial<PerformanceMetricsData>
}

const PENDING_UPDATES_KEYS = new Set([
  "name",
  "isa",
  "repo_url",
  "is_open_source",
  "is_dual_licensed",
  "is_proving_mainnet",
  "version",
  "security_metrics",
  "performance_metrics",
])

export function isZkvmPendingUpdates(
  value: unknown
): value is ZkvmPendingUpdates {
  if (typeof value !== "object" || value === null) return false
  return Object.keys(value).every((key) => PENDING_UPDATES_KEYS.has(key))
}

export type ZkvmMetrics = ZkvmSecurityMetric & ZkvmPerformanceMetric

export type ZkvmMetric = keyof ZkvmMetrics

export type ClusterVersionExtensions = {
  cluster: ClusterBase
  zkvm_version: ZkvmVersion & {
    zkvm: Zkvm
  }
}

/**
 * Extensions for the Cluster type, adding optional clusterConfig property.
 */
export type ClusterVersion = ClusterVersionBase & ClusterVersionExtensions

/**
 * Represents a cluster, combining ClusterBase with ClusterExtensions.
 */
export type Cluster = ClusterBase & {
  cluster_version: ClusterVersion
}

/**
 * Extensions for the Proof type, adding optional block, cluster, team, and gpu_price_index properties.
 */
export type ProofExtensions = {
  block?: BlockBase
  team?: Team
  gpu_price_index?: GpuPriceIndex | null
}

/**
 * Represents a proof, combining ProofBase with ProofExtensions.
 */
export type Proof = ProofBase & ProofExtensions

export type ProofWithCluster = Proof & {
  cluster_version: ClusterVersion
}

/**
 * Represents an empty block, which is a partial BlockBase with a required block_number property.
 */
export type EmptyBlock = Partial<BlockBase> & Pick<BlockBase, "block_number">

/**
 * Extensions for the Block type, adding a proofs property which is an array of Proofs.
 */
export type BlockExtensions = { proofs: ProofWithCluster[] }

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
  value: ReactNode
  icon?: ReactNode
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
  bestProof: ProofWithCluster
}

export type SliceDetails = {
  level: SeverityLevel | undefined
}

export type Slices = [
  SliceDetails,
  SliceDetails,
  SliceDetails,
  SliceDetails,
  SliceDetails,
  SliceDetails,
  SliceDetails,
]

export type DayRange = (typeof CHART_RANGES)[number]

export type MetricThresholds = Record<SeverityLevel, number>

export type ZkvmThresholdMetric = keyof typeof ZKVM_THRESHOLDS

export interface ClusterSummary {
  id: string
  name: string
  team: {
    name: string
    slug: string
  }
}
