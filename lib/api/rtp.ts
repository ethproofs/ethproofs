import { sql } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import type { RtpCohortRow } from "@/lib/types"

import {
  RTP_LIVENESS_SCORE_THRESHOLD,
  RTP_PARALYZER_CUTOFF_MINUTES,
  RTP_PERFORMANCE_SCORE_THRESHOLD,
  RTP_PERFORMANCE_TIME_THRESHOLD_MS,
  RTP_WINDOW_DAYS,
  TAGS,
} from "@/lib/constants"

import { db } from "@/db"

function toRtpCohortRow(row: Record<string, unknown>): RtpCohortRow {
  return {
    cluster_id: String(row.cluster_id),
    cluster_name: String(row.cluster_name),
    num_gpus: Number(row.num_gpus),
    hardware_description: row.hardware_description
      ? String(row.hardware_description)
      : null,
    team_name: String(row.team_name),
    team_slug: String(row.team_slug),
    team_logo_url: row.team_logo_url ? String(row.team_logo_url) : null,
    zkvm_name: String(row.zkvm_name),
    guest_program_name: row.guest_program_name
      ? String(row.guest_program_name)
      : null,
    soundcalc_integration: Boolean(row.soundcalc_integration),
    total_blocks: Number(row.total_blocks),
    blocks_proven: Number(row.blocks_proven),
    sub_10s_proofs: Number(row.sub_10s_proofs),
    over_10s_proofs: Number(row.over_10s_proofs),
    paralyzed_blocks: Number(row.paralyzed_blocks),
    performance_score: Number(row.performance_score),
    liveness_score: Number(row.liveness_score),
    stunner_rate: Number(row.stunner_rate),
    paralyzer_rate: Number(row.paralyzer_rate),
    is_eligible: Boolean(row.is_eligible),
    avg_cost_per_proof:
      row.avg_cost_per_proof != null ? Number(row.avg_cost_per_proof) : null,
  }
}

export const getRtpCohortScores = cache(
  async (): Promise<RtpCohortRow[]> => {
    const result = await db.execute(sql`
      WITH window_blocks AS (
        SELECT block_number, "timestamp"
        FROM blocks
        WHERE "timestamp" >= NOW() - make_interval(days => ${RTP_WINDOW_DAYS})
      ),
      total_block_count AS (
        SELECT COUNT(*)::integer AS cnt FROM window_blocks
      ),
      cluster_stats AS (
        SELECT
          p.cluster_id,
          COUNT(DISTINCT CASE
            WHEN p.proof_status = 'proved' AND p.proving_time < ${RTP_PERFORMANCE_TIME_THRESHOLD_MS}
            THEN p.block_number
          END)::integer AS sub_10s_proofs,
          COUNT(DISTINCT CASE
            WHEN p.proof_status = 'proved'
            THEN p.block_number
          END)::integer AS blocks_proven,
          COUNT(DISTINCT CASE
            WHEN p.proof_status = 'proved' AND p.proving_time >= ${RTP_PERFORMANCE_TIME_THRESHOLD_MS}
            THEN p.block_number
          END)::integer AS over_10s_proofs,
          COUNT(DISTINCT CASE
            WHEN p.proof_status IN ('queued', 'proving')
              AND wb."timestamp" < NOW() - make_interval(mins => ${RTP_PARALYZER_CUTOFF_MINUTES})
            THEN p.block_number
          END)::integer AS paralyzed_blocks,
          COALESCE(
            SUM(
              CASE WHEN p.proof_status = 'proved' THEN
                c.num_gpus::double precision
                * gpi.hourly_price::double precision
                * p.proving_time::double precision
                / 3600000.0
              END
            ) / NULLIF(COUNT(CASE WHEN p.proof_status = 'proved' THEN 1 END), 0),
            NULL
          ) AS avg_cost_per_proof
        FROM proofs p
        INNER JOIN window_blocks wb ON p.block_number = wb.block_number
        INNER JOIN clusters c ON p.cluster_id = c.id
        LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
        GROUP BY p.cluster_id
      )
      SELECT
        c.id AS cluster_id,
        c.name AS cluster_name,
        c.num_gpus,
        c.hardware_description,
        t.name AS team_name,
        t.slug AS team_slug,
        t.logo_url AS team_logo_url,
        z.name AS zkvm_name,
        gp.name AS guest_program_name,
        COALESCE(zsm.soundcalc_integration, false) AS soundcalc_integration,
        tbc.cnt AS total_blocks,
        COALESCE(cs.blocks_proven, 0) AS blocks_proven,
        COALESCE(cs.sub_10s_proofs, 0) AS sub_10s_proofs,
        COALESCE(cs.over_10s_proofs, 0) AS over_10s_proofs,
        COALESCE(cs.paralyzed_blocks, 0) AS paralyzed_blocks,
        CASE WHEN tbc.cnt > 0
          THEN ROUND((COALESCE(cs.sub_10s_proofs, 0)::numeric / tbc.cnt * 100), 2)::double precision
          ELSE 0
        END AS performance_score,
        CASE WHEN tbc.cnt > 0
          THEN ROUND((COALESCE(cs.blocks_proven, 0)::numeric / tbc.cnt * 100), 2)::double precision
          ELSE 0
        END AS liveness_score,
        CASE WHEN tbc.cnt > 0
          THEN ROUND((COALESCE(cs.over_10s_proofs, 0)::numeric / tbc.cnt * 100), 2)::double precision
          ELSE 0
        END AS stunner_rate,
        CASE WHEN tbc.cnt > 0
          THEN ROUND((COALESCE(cs.paralyzed_blocks, 0)::numeric / tbc.cnt * 100), 2)::double precision
          ELSE 0
        END AS paralyzer_rate,
        cs.avg_cost_per_proof,
        (
          COALESCE(zsm.soundcalc_integration, false) = true
          AND CASE WHEN tbc.cnt > 0
            THEN (COALESCE(cs.sub_10s_proofs, 0)::numeric / tbc.cnt * 100) >= ${RTP_PERFORMANCE_SCORE_THRESHOLD}
            ELSE false
          END
          AND CASE WHEN tbc.cnt > 0
            THEN (COALESCE(cs.blocks_proven, 0)::numeric / tbc.cnt * 100) >= ${RTP_LIVENESS_SCORE_THRESHOLD}
            ELSE false
          END
        ) AS is_eligible
      FROM clusters c
      INNER JOIN teams t ON c.team_id = t.id
      INNER JOIN prover_types pt ON c.prover_type_id = pt.id
      INNER JOIN LATERAL (
        SELECT cv_inner.zkvm_version_id
        FROM cluster_versions cv_inner
        WHERE cv_inner.cluster_id = c.id
        ORDER BY cv_inner.created_at DESC
        LIMIT 1
      ) cv ON true
      INNER JOIN zkvm_versions zv ON cv.zkvm_version_id = zv.id
      INNER JOIN zkvms z ON zv.zkvm_id = z.id
      LEFT JOIN zkvm_security_metrics zsm ON zsm.zkvm_id = z.id
      LEFT JOIN guest_programs gp ON c.guest_program_id = gp.id
      CROSS JOIN total_block_count tbc
      LEFT JOIN cluster_stats cs ON cs.cluster_id = c.id
      WHERE c.is_active = true
        AND pt.gpu_configuration = 'multi-gpu'
        AND COALESCE(zsm.soundcalc_integration, false) = true
        AND CASE WHEN tbc.cnt > 0
          THEN (COALESCE(cs.sub_10s_proofs, 0)::numeric / tbc.cnt * 100) >= ${RTP_PERFORMANCE_SCORE_THRESHOLD}
          ELSE false
        END
        AND CASE WHEN tbc.cnt > 0
          THEN (COALESCE(cs.blocks_proven, 0)::numeric / tbc.cnt * 100) >= ${RTP_LIVENESS_SCORE_THRESHOLD}
          ELSE false
        END
      ORDER BY
        CASE WHEN tbc.cnt > 0 THEN COALESCE(cs.sub_10s_proofs, 0)::numeric / tbc.cnt ELSE 0 END DESC,
        CASE WHEN tbc.cnt > 0 THEN COALESCE(cs.blocks_proven, 0)::numeric / tbc.cnt ELSE 0 END DESC
    `)

    const rows = Array.isArray(result) ? result : []
    return rows.map((row: Record<string, unknown>) => toRtpCohortRow(row))
  },
  ["rtp-cohort-scores"],
  {
    revalidate: 60 * 60,
    tags: [TAGS.RTP_COHORT],
  }
)
