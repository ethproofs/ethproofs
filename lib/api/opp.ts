import { sql } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import type {
  CohortPerformanceData,
  CohortRow,
  ProofTimeDistributionData,
} from "@/lib/types"

import {
  OPP_PARALYZER_CUTOFF_MINUTES,
  OPP_PERFORMANCE_TIME_THRESHOLD_MS,
  TAGS,
} from "@/lib/constants"

import { toCohortRow, toProofTimeBucket } from "./cohort.utils"

import { db } from "@/db"

const OPP_BUCKET_ORDER = [
  "0 - 30s",
  "30s - 1m",
  "1m - 2m",
  "2m - 3m",
  "3m - 5m",
  "+5m",
] as const

export const getOppCohortScores = cache(
  async (): Promise<CohortRow[]> => {
    const result = await db.execute(sql`
      WITH latest_snapshot AS (
        SELECT MAX(snapshot_week) AS week
        FROM opp_cohort_snapshots
      )
      SELECT
        s.cluster_id,
        c.name AS cluster_name,
        c.num_gpus,
        c.hardware_description,
        t.name AS team_name,
        t.slug AS team_slug,
        t.logo_url AS team_logo_url,
        z.name AS zkvm_name,
        gp.name AS guest_program_name,
        COALESCE(zsm.soundcalc_integration, false) AS soundcalc_integration,
        s.total_blocks,
        s.blocks_proven,
        s.sub_threshold_proofs AS sub_10s_proofs,
        s.over_threshold_proofs AS over_10s_proofs,
        s.paralyzed_blocks,
        s.performance_score,
        s.liveness_score,
        s.stunner_rate,
        s.paralyzer_rate,
        s.is_eligible,
        s.avg_cost_per_proof
      FROM opp_cohort_snapshots s
      INNER JOIN latest_snapshot ls ON s.snapshot_week = ls.week
      INNER JOIN clusters c ON s.cluster_id = c.id
      INNER JOIN teams t ON c.team_id = t.id
      INNER JOIN LATERAL (
        SELECT cv_inner.zkvm_version_id
        FROM cluster_versions cv_inner
        WHERE cv_inner.cluster_id = c.id
        ORDER BY cv_inner.created_at DESC
        LIMIT 1
      ) cv ON true
      INNER JOIN zkvm_versions zv ON cv.zkvm_version_id = zv.id
      INNER JOIN zkvms z ON zv.zkvm_id = z.id
      LEFT JOIN guest_programs gp ON c.guest_program_id = gp.id
      LEFT JOIN zkvm_security_metrics zsm ON zsm.zkvm_id = z.id
      ORDER BY s.performance_score DESC, s.liveness_score DESC
    `)

    const rows = Array.isArray(result) ? result : []
    return rows.map((row: Record<string, unknown>) => toCohortRow(row))
  },
  ["opp-cohort-scores"],
  {
    revalidate: 60 * 60,
    tags: [TAGS.OPP_COHORT],
  }
)

export const getOppCohortPerformance = async (
  days: number
): Promise<CohortPerformanceData> => {
  return cache(
    async (days: number) => {
      const result = await db.execute(sql`
        WITH evaluated_clusters AS (
          SELECT s.cluster_id
          FROM opp_cohort_snapshots s
          WHERE s.snapshot_week = (
              SELECT MAX(snapshot_week) FROM opp_cohort_snapshots
            )
        ),
        window_blocks AS (
          SELECT block_number, "timestamp"
          FROM blocks
          WHERE "timestamp" >= NOW() - make_interval(days => ${days})
            AND NOT is_downtime_block(block_number)
        ),
        total_block_count AS (
          SELECT COUNT(*)::integer AS cnt FROM window_blocks
        ),
        evaluated_count AS (
          SELECT COUNT(*)::integer AS cnt FROM evaluated_clusters
        ),
        cluster_stats AS (
          SELECT
            p.cluster_id,
            COUNT(DISTINCT CASE
              WHEN p.proof_status = 'proved' AND p.proving_time < ${OPP_PERFORMANCE_TIME_THRESHOLD_MS}
              THEN p.block_number
            END)::integer AS sub_threshold_proofs,
            COUNT(DISTINCT CASE
              WHEN p.proof_status = 'proved' AND p.proving_time >= ${OPP_PERFORMANCE_TIME_THRESHOLD_MS}
              THEN p.block_number
            END)::integer AS over_threshold_proofs,
            COUNT(DISTINCT CASE
              WHEN p.proof_status IN ('queued', 'proving')
                AND wb."timestamp" < NOW() - make_interval(mins => ${OPP_PARALYZER_CUTOFF_MINUTES})
              THEN p.block_number
            END)::integer AS paralyzed_blocks
          FROM proofs p
          INNER JOIN window_blocks wb ON p.block_number = wb.block_number
          INNER JOIN evaluated_clusters ec ON p.cluster_id = ec.cluster_id
          GROUP BY p.cluster_id
        )
        SELECT
          (tbc.cnt * ec.cnt)::integer AS total_block_slots,
          COALESCE(SUM(cs.sub_threshold_proofs), 0)::integer AS sub_10s_count,
          COALESCE(SUM(cs.over_threshold_proofs), 0)::integer AS stunned_count,
          COALESCE(SUM(cs.paralyzed_blocks), 0)::integer AS paralyzed_count
        FROM total_block_count tbc
        CROSS JOIN evaluated_count ec
        LEFT JOIN cluster_stats cs ON true
        GROUP BY tbc.cnt, ec.cnt
      `)

      const row =
        Array.isArray(result) && result.length > 0
          ? (result[0] as Record<string, unknown>)
          : null
      const totalBlockSlots = row ? Number(row.total_block_slots) : 0
      const sub10sCount = row ? Number(row.sub_10s_count) : 0
      const stunnedCount = row ? Number(row.stunned_count) : 0
      const paralyzedCount = row ? Number(row.paralyzed_count) : 0

      return {
        totalBlockSlots,
        sub10sCount,
        stunnedCount,
        paralyzedCount,
        offlineCount: Math.max(
          0,
          totalBlockSlots - sub10sCount - stunnedCount - paralyzedCount
        ),
      }
    },
    ["opp-cohort-performance", String(days)],
    {
      revalidate: 60 * 60,
      tags: [TAGS.OPP_COHORT],
    }
  )(days)
}

export const getOppProofTimeDistribution = async (
  days: number
): Promise<ProofTimeDistributionData> => {
  return cache(
    async (days: number) => {
      const result = await db.execute(sql`
        WITH evaluated_clusters AS (
          SELECT s.cluster_id
          FROM opp_cohort_snapshots s
          WHERE s.snapshot_week = (
              SELECT MAX(snapshot_week) FROM opp_cohort_snapshots
            )
        ),
        window_blocks AS (
          SELECT block_number
          FROM blocks
          WHERE "timestamp" >= NOW() - make_interval(days => ${days})
            AND NOT is_downtime_block(block_number)
        ),
        cohort_proofs AS (
          SELECT p.proving_time
          FROM proofs p
          INNER JOIN window_blocks wb ON p.block_number = wb.block_number
          INNER JOIN evaluated_clusters ec ON p.cluster_id = ec.cluster_id
          WHERE p.proof_status = 'proved'
            AND p.proving_time IS NOT NULL
        )
        SELECT
          CASE
            WHEN proving_time < 30000 THEN '0 - 30s'
            WHEN proving_time < 60000 THEN '30s - 1m'
            WHEN proving_time < ${OPP_PERFORMANCE_TIME_THRESHOLD_MS} THEN '1m - 2m'
            WHEN proving_time < 180000 THEN '2m - 3m'
            WHEN proving_time < 300000 THEN '3m - 5m'
            ELSE '+5m'
          END AS bucket,
          COUNT(*)::integer AS count
        FROM cohort_proofs
        GROUP BY bucket
      `)

      const rows = Array.isArray(result) ? result : []
      const total = rows.reduce(
        (sum, r: Record<string, unknown>) => sum + Number(r.count),
        0
      )
      const bucketMap = new Map(
        rows.map((r: Record<string, unknown>) => [
          String(r.bucket),
          toProofTimeBucket(r, total, OPP_BUCKET_ORDER),
        ])
      )

      const buckets = OPP_BUCKET_ORDER.map(
        (name) =>
          bucketMap.get(name) ?? {
            bucket: name,
            count: 0,
            percentage: 0,
            isEligible: OPP_BUCKET_ORDER.indexOf(name) < 3,
          }
      )

      const eligibleTotal = buckets
        .filter((b) => b.isEligible)
        .reduce((sum, b) => sum + b.count, 0)

      return {
        total,
        eligibleTotal,
        eligibleRate:
          total > 0 ? Math.round((eligibleTotal / total) * 1000) / 10 : 0,
        buckets,
      }
    },
    ["opp-proof-time-distribution", String(days)],
    {
      revalidate: 60 * 60,
      tags: [TAGS.OPP_COHORT],
    }
  )(days)
}
