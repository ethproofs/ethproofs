import { sql } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import {
  RTP_PARALYZER_CUTOFF_MINUTES,
  RTP_PERFORMANCE_TIME_THRESHOLD_MS,
  TAGS,
} from "@/lib/constants"

import { db } from "@/db"

const RECENT_BLOCKS_LIMIT = 20
const PARALYZER_CUTOFF_MS = RTP_PARALYZER_CUTOFF_MINUTES * 60 * 1000

export interface RecentBlockMetrics {
  blockNumber: number
  gasUsed: number | null
  timestamp: string | null
  bestProvingTime: number | null
  proofCount: number
  provedCount: number
  status: "success" | "queued" | "proving" | "stunner" | "paralyzer"
  teamName: string | null
  clusterName: string | null
}

export interface RecentBlocksSummary {
  blocks: RecentBlockMetrics[]
  successRate: number
  avgProvingTime: number | null
  totalBlocks: number
}

export interface ProvingTimeBreakdown {
  blockNumber: number
  queueTime: number
  fetchTime: number
  proveTime: number
  verifyTime: number
  totalTime: number
  isStunner: boolean
}

export interface BlockDifficultyPoint {
  blockNumber: number
  gasUsed: number
  bestProvingTime: number
  proofCount: number
  category: "success" | "stunner" | "paralyzer"
}

export interface BlocksMetricsData {
  provingTimeBreakdown: ProvingTimeBreakdown[]
  blockDifficulty: BlockDifficultyPoint[]
  avgQueueTime: number
  avgFetchTime: number
  avgProveTime: number
  avgVerifyTime: number
}

function classifyBlock(
  bestProvingTime: number | null,
  hasProving: boolean,
  hasQueued: boolean
): "success" | "queued" | "proving" | "stunner" | "paralyzer" {
  if (bestProvingTime === null) {
    if (hasProving) return "proving"
    if (hasQueued) return "queued"
    return "paralyzer"
  }
  if (bestProvingTime < RTP_PERFORMANCE_TIME_THRESHOLD_MS) return "success"
  if (bestProvingTime < PARALYZER_CUTOFF_MS) return "stunner"
  return "paralyzer"
}

export async function fetchRecentBlocksSummary(): Promise<RecentBlocksSummary> {
  const rows = await db.execute<{
    block_number: number
    gas_used: number | null
    timestamp: string | null
    best_proving_time: number | null
    proof_count: number
    proved_count: number
    has_proving: boolean
    has_queued: boolean
    team_name: string | null
    cluster_name: string | null
  }>(sql`
      WITH recent_blocks AS (
        SELECT DISTINCT b.block_number, b.gas_used, b.timestamp
        FROM blocks b
        INNER JOIN proofs p ON p.block_number = b.block_number
        INNER JOIN cluster_versions cv ON cv.id = p.cluster_version_id
        INNER JOIN clusters c ON c.id = cv.cluster_id
        INNER JOIN prover_types pt ON pt.id = c.prover_type_id
        WHERE pt.gpu_configuration = 'multi-gpu'
          AND NOT is_downtime_block(b.block_number)
        ORDER BY b.block_number DESC
        LIMIT ${RECENT_BLOCKS_LIMIT}
      ),
      best_per_block AS (
        SELECT
          rb.block_number,
          rb.gas_used,
          rb.timestamp,
          p.proving_time,
          p.team_id,
          p.cluster_version_id,
          p.proof_status,
          ROW_NUMBER() OVER (
            PARTITION BY rb.block_number
            ORDER BY
              CASE WHEN p.proof_status = 'proved' AND p.proving_time IS NOT NULL THEN 0 ELSE 1 END,
              p.proving_time ASC NULLS LAST
          ) AS rn
        FROM recent_blocks rb
        INNER JOIN proofs p ON p.block_number = rb.block_number
        INNER JOIN cluster_versions cv ON cv.id = p.cluster_version_id
        INNER JOIN clusters c ON c.id = cv.cluster_id
        INNER JOIN prover_types pt ON pt.id = c.prover_type_id
        WHERE pt.gpu_configuration = 'multi-gpu'
      ),
      block_agg AS (
        SELECT
          rb.block_number,
          COUNT(p.proof_id)::int AS proof_count,
          COUNT(CASE WHEN p.proof_status = 'proved' THEN 1 END)::int AS proved_count,
          bool_or(p.proof_status = 'proving') AS has_proving,
          bool_or(p.proof_status = 'queued') AS has_queued
        FROM recent_blocks rb
        INNER JOIN proofs p ON p.block_number = rb.block_number
        INNER JOIN cluster_versions cv ON cv.id = p.cluster_version_id
        INNER JOIN clusters c ON c.id = cv.cluster_id
        INNER JOIN prover_types pt ON pt.id = c.prover_type_id
        WHERE pt.gpu_configuration = 'multi-gpu'
        GROUP BY rb.block_number
      )
      SELECT
        bp.block_number,
        bp.gas_used,
        bp.timestamp,
        CASE WHEN bp.proof_status = 'proved' THEN bp.proving_time END AS best_proving_time,
        ba.proof_count,
        ba.proved_count,
        ba.has_proving,
        ba.has_queued,
        t.name AS team_name,
        cl.name AS cluster_name
      FROM best_per_block bp
      INNER JOIN block_agg ba ON ba.block_number = bp.block_number
      LEFT JOIN cluster_versions cv ON cv.id = bp.cluster_version_id
      LEFT JOIN clusters cl ON cl.id = cv.cluster_id
      LEFT JOIN teams t ON t.id = bp.team_id
      WHERE bp.rn = 1
      ORDER BY bp.block_number DESC
    `)

  const blocks: RecentBlockMetrics[] = rows.map((row) => ({
    blockNumber: Number(row.block_number),
    gasUsed: row.gas_used !== null ? Number(row.gas_used) : null,
    timestamp: row.timestamp,
    bestProvingTime:
      row.best_proving_time !== null ? Number(row.best_proving_time) : null,
    proofCount: Number(row.proof_count),
    provedCount: Number(row.proved_count),
    status: classifyBlock(
      row.best_proving_time !== null ? Number(row.best_proving_time) : null,
      row.has_proving,
      row.has_queued
    ),
    teamName: row.team_name,
    clusterName: row.cluster_name,
  }))

  const provedBlocks = blocks.filter((b) => b.bestProvingTime !== null)
  const successBlocks = provedBlocks.filter((b) => b.status === "success")
  const successRate =
    provedBlocks.length > 0
      ? (successBlocks.length / provedBlocks.length) * 100
      : 0

  const provingTimes = provedBlocks
    .map((b) => b.bestProvingTime)
    .filter((t): t is number => t !== null)
  const avgProvingTime =
    provingTimes.length > 0
      ? provingTimes.reduce((a, b) => a + b, 0) / provingTimes.length
      : null

  return {
    blocks,
    successRate,
    avgProvingTime,
    totalBlocks: blocks.length,
  }
}

export const fetchBlocksChartData = cache(
  async (): Promise<BlocksMetricsData> => {
    const rows = await db.execute<{
      block_number: number
      gas_used: number
      best_proving_time: number
      proof_count: number
      queue_duration: number | null
      prove_duration: number | null
    }>(sql`
      WITH ranked AS (
        SELECT
          b.block_number,
          b.gas_used,
          p.proving_time AS best_proving_time,
          p.queued_timestamp,
          p.proving_timestamp,
          p.proved_timestamp,
          ROW_NUMBER() OVER (
            PARTITION BY b.block_number
            ORDER BY p.proving_time ASC
          ) AS rn
        FROM blocks b
        INNER JOIN proofs p ON p.block_number = b.block_number
        INNER JOIN cluster_versions cv ON cv.id = p.cluster_version_id
        INNER JOIN clusters c ON c.id = cv.cluster_id
        INNER JOIN prover_types pt ON pt.id = c.prover_type_id
        WHERE p.proof_status = 'proved'
          AND p.proving_time IS NOT NULL
          AND pt.gpu_configuration = 'multi-gpu'
          AND NOT is_downtime_block(b.block_number)
      ),
      best AS (
        SELECT * FROM ranked WHERE rn = 1
      ),
      block_counts AS (
        SELECT
          p.block_number,
          COUNT(p.proof_id)::int AS proof_count
        FROM proofs p
        INNER JOIN cluster_versions cv ON cv.id = p.cluster_version_id
        INNER JOIN clusters c ON c.id = cv.cluster_id
        INNER JOIN prover_types pt ON pt.id = c.prover_type_id
        WHERE pt.gpu_configuration = 'multi-gpu'
        GROUP BY p.block_number
      )
      SELECT
        best.block_number,
        best.gas_used,
        best.best_proving_time,
        bc.proof_count,
        CASE
          WHEN best.queued_timestamp IS NOT NULL AND best.proving_timestamp IS NOT NULL
          THEN EXTRACT(EPOCH FROM (best.proving_timestamp::timestamptz - best.queued_timestamp::timestamptz)) * 1000
        END::int AS queue_duration,
        CASE
          WHEN best.proving_timestamp IS NOT NULL AND best.proved_timestamp IS NOT NULL
          THEN EXTRACT(EPOCH FROM (best.proved_timestamp::timestamptz - best.proving_timestamp::timestamptz)) * 1000
        END::int AS prove_duration
      FROM best
      INNER JOIN block_counts bc ON bc.block_number = best.block_number
      ORDER BY best.block_number DESC
      LIMIT ${RECENT_BLOCKS_LIMIT}
    `)

    const provingTimeBreakdown: ProvingTimeBreakdown[] = rows.map((row) => {
      const queueTime = Math.max(Number(row.queue_duration ?? 0), 0)
      const proveTime = Math.max(Number(row.prove_duration ?? 0), 0)
      const totalTime = Number(row.best_proving_time)
      const fetchTime = 0
      const verifyTime = Math.max(totalTime - queueTime - proveTime, 0)

      return {
        blockNumber: Number(row.block_number),
        queueTime,
        fetchTime,
        proveTime,
        verifyTime,
        totalTime,
        isStunner: totalTime >= RTP_PERFORMANCE_TIME_THRESHOLD_MS,
      }
    })

    const blockDifficulty: BlockDifficultyPoint[] = rows.map((row) => {
      const bestProvingTime = Number(row.best_proving_time)
      let category: "success" | "stunner" | "paralyzer"
      if (bestProvingTime < RTP_PERFORMANCE_TIME_THRESHOLD_MS) {
        category = "success"
      } else if (bestProvingTime < PARALYZER_CUTOFF_MS) {
        category = "stunner"
      } else {
        category = "paralyzer"
      }

      return {
        blockNumber: Number(row.block_number),
        gasUsed: Number(row.gas_used),
        bestProvingTime,
        proofCount: Number(row.proof_count),
        category,
      }
    })

    const validBreakdowns = provingTimeBreakdown.filter((b) => b.totalTime > 0)
    const count = validBreakdowns.length || 1

    return {
      provingTimeBreakdown,
      blockDifficulty,
      avgQueueTime:
        validBreakdowns.reduce((a, b) => a + b.queueTime, 0) / count,
      avgFetchTime:
        validBreakdowns.reduce((a, b) => a + b.fetchTime, 0) / count,
      avgProveTime:
        validBreakdowns.reduce((a, b) => a + b.proveTime, 0) / count,
      avgVerifyTime:
        validBreakdowns.reduce((a, b) => a + b.verifyTime, 0) / count,
    }
  },
  ["blocks-chart-data"],
  {
    revalidate: 60,
    tags: [TAGS.BLOCKS],
  }
)
