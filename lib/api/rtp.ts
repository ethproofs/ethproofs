import { sql } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import type {
  CohortCompositionData,
  CohortPerformanceData,
  CohortRow,
  ProofTimeDistributionData,
} from "@/lib/types"

import {
  RTP_PARALYZER_CUTOFF_MINUTES,
  RTP_PERFORMANCE_TIME_THRESHOLD_MS,
  TAGS,
} from "@/lib/constants"

import {
  buildCompositionData,
  toCohortRow,
  toProofTimeBucket,
} from "./cohort.utils"

import { db } from "@/db"

const RTP_BUCKET_ORDER = [
  "0 - 5s",
  "5 - 8s",
  "8 - 10s",
  "10 - 12s",
  "12 - 14s",
  "+14s",
] as const

function buildRtpCohortScoresQuery(isEligible: boolean) {
  return sql`
    WITH latest_snapshot AS (
      SELECT MAX(snapshot_week) AS week
      FROM rtp_cohort_snapshots
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
      s.sub_10s_proofs,
      s.over_10s_proofs,
      s.paralyzed_blocks,
      s.performance_score,
      s.liveness_score,
      s.stunner_rate,
      s.paralyzer_rate,
      s.is_eligible,
      s.avg_cost_per_proof
    FROM rtp_cohort_snapshots s
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
    WHERE s.is_eligible = ${isEligible}
    ORDER BY s.performance_score DESC, s.liveness_score DESC
  `
}

export const getRtpCohortScores = cache(
  async (): Promise<CohortRow[]> => {
    const result = await db.execute(buildRtpCohortScoresQuery(true))
    const rows = Array.isArray(result) ? result : []
    return rows.map((row: Record<string, unknown>) => toCohortRow(row))
  },
  ["rtp-cohort-scores"],
  {
    revalidate: 60 * 60,
    tags: [TAGS.RTP_COHORT],
  }
)

export const getRtpCohortIneligibleScores = cache(
  async (): Promise<CohortRow[]> => {
    const result = await db.execute(buildRtpCohortScoresQuery(false))
    const rows = Array.isArray(result) ? result : []
    return rows.map((row: Record<string, unknown>) => toCohortRow(row))
  },
  ["rtp-cohort-ineligible-scores"],
  {
    revalidate: 60 * 60,
    tags: [TAGS.RTP_COHORT],
  }
)

const COMPOSITION_MAX_WEEKS = 26

export const getRtpCohortComposition = cache(
  async (): Promise<CohortCompositionData> => {
    const result = await db.execute(sql`
      WITH all_weeks AS (
        SELECT DISTINCT snapshot_week AS week
        FROM rtp_cohort_snapshots
        ORDER BY snapshot_week DESC
        LIMIT ${COMPOSITION_MAX_WEEKS}
      ),
      snapshot_range AS (
        SELECT
          (SELECT COUNT(*)::integer FROM all_weeks) AS total_weeks,
          (SELECT MAX(week) FROM all_weeks) AS latest_week
      ),
      cluster_tenure AS (
        SELECT
          s.cluster_id,
          c.name AS cluster_name,
          t.name AS team_name,
          t.logo_url AS team_logo_url,
          COUNT(DISTINCT s.snapshot_week) FILTER (WHERE s.is_eligible)::integer AS weeks_eligible,
          sr.total_weeks,
          EXISTS (
            SELECT 1
            FROM rtp_cohort_snapshots latest
            WHERE latest.cluster_id = s.cluster_id
              AND latest.snapshot_week = sr.latest_week
          ) AS is_currently_evaluated
        FROM rtp_cohort_snapshots s
        INNER JOIN clusters c ON s.cluster_id = c.id
        INNER JOIN teams t ON c.team_id = t.id
        CROSS JOIN snapshot_range sr
        WHERE s.snapshot_week IN (SELECT week FROM all_weeks)
        GROUP BY s.cluster_id, c.name, t.name, t.logo_url, sr.total_weeks, sr.latest_week
      ),
      cluster_timelines AS (
        SELECT
          ct.cluster_id,
          json_agg(
            json_build_object('week', aw.week, 'isEligible', COALESCE(s.is_eligible, false))
            ORDER BY aw.week
          ) AS weekly_timeline
        FROM cluster_tenure ct
        CROSS JOIN all_weeks aw
        LEFT JOIN rtp_cohort_snapshots s
          ON s.cluster_id = ct.cluster_id AND s.snapshot_week = aw.week
        GROUP BY ct.cluster_id
      )
      SELECT
        ct.cluster_name,
        ct.team_name,
        ct.team_logo_url,
        ct.weeks_eligible AS weeks_in_cohort,
        ct.total_weeks,
        ct.is_currently_evaluated AS is_currently_eligible,
        ctl.weekly_timeline
      FROM cluster_tenure ct
      INNER JOIN cluster_timelines ctl ON ctl.cluster_id = ct.cluster_id
      WHERE ct.is_currently_evaluated = true
      ORDER BY ct.weeks_eligible DESC, ct.team_name ASC
    `)

    const rows = Array.isArray(result) ? result : []
    return buildCompositionData(rows as Record<string, unknown>[])
  },
  ["rtp-cohort-composition"],
  {
    revalidate: 60 * 60,
    tags: [TAGS.RTP_COHORT],
  }
)

export const getRtpCohortPerformance = async (
  days: number
): Promise<CohortPerformanceData> => {
  return cache(
    async (days: number) => {
      const result = await db.execute(sql`
        WITH evaluated_clusters AS (
          SELECT s.cluster_id
          FROM rtp_cohort_snapshots s
          WHERE s.snapshot_week = (
              SELECT MAX(snapshot_week) FROM rtp_cohort_snapshots
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
              WHEN p.proof_status = 'proved' AND p.proving_time < ${RTP_PERFORMANCE_TIME_THRESHOLD_MS}
              THEN p.block_number
            END)::integer AS sub_10s_proofs,
            COUNT(DISTINCT CASE
              WHEN p.proof_status = 'proved' AND p.proving_time >= ${RTP_PERFORMANCE_TIME_THRESHOLD_MS}
              THEN p.block_number
            END)::integer AS over_10s_proofs,
            COUNT(DISTINCT CASE
              WHEN p.proof_status IN ('queued', 'proving')
                AND wb."timestamp" < NOW() - make_interval(mins => ${RTP_PARALYZER_CUTOFF_MINUTES})
              THEN p.block_number
            END)::integer AS paralyzed_blocks
          FROM proofs p
          INNER JOIN window_blocks wb ON p.block_number = wb.block_number
          INNER JOIN evaluated_clusters ec ON p.cluster_id = ec.cluster_id
          GROUP BY p.cluster_id
        )
        SELECT
          (tbc.cnt * ec.cnt)::integer AS total_block_slots,
          COALESCE(SUM(cs.sub_10s_proofs), 0)::integer AS sub_10s_count,
          COALESCE(SUM(cs.over_10s_proofs), 0)::integer AS stunned_count,
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
    ["rtp-cohort-performance", String(days)],
    {
      revalidate: 60 * 60,
      tags: [TAGS.RTP_COHORT],
    }
  )(days)
}

export const getRtpProofTimeDistribution = async (
  days: number
): Promise<ProofTimeDistributionData> => {
  return cache(
    async (days: number) => {
      const result = await db.execute(sql`
        WITH evaluated_clusters AS (
          SELECT s.cluster_id
          FROM rtp_cohort_snapshots s
          WHERE s.snapshot_week = (
              SELECT MAX(snapshot_week) FROM rtp_cohort_snapshots
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
            WHEN proving_time < 5000 THEN '0 - 5s'
            WHEN proving_time < 8000 THEN '5 - 8s'
            WHEN proving_time < ${RTP_PERFORMANCE_TIME_THRESHOLD_MS} THEN '8 - 10s'
            WHEN proving_time < 12000 THEN '10 - 12s'
            WHEN proving_time < 14000 THEN '12 - 14s'
            ELSE '+14s'
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
          toProofTimeBucket(r, total, RTP_BUCKET_ORDER),
        ])
      )

      const buckets = RTP_BUCKET_ORDER.map(
        (name) =>
          bucketMap.get(name) ?? {
            bucket: name,
            count: 0,
            percentage: 0,
            isEligible: RTP_BUCKET_ORDER.indexOf(name) < 3,
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
    ["rtp-proof-time-distribution", String(days)],
    {
      revalidate: 60 * 60,
      tags: [TAGS.RTP_COHORT],
    }
  )(days)
}
