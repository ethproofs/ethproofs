import { sql } from "drizzle-orm"
import { unstable_cache as cache } from "next/cache"

import type {
  ProverScatterPoint,
  ProverSummaryData,
  RtpCohortConsistencyData,
  RtpCohortConsistencyMember,
  RtpConsistencyWeekEntry,
} from "@/lib/types"

import { RTP_PERFORMANCE_TIME_THRESHOLD_MS, TAGS } from "@/lib/constants"

import { db } from "@/db"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getFirstRow(result: unknown): Record<string, unknown> {
  if (!Array.isArray(result) || result.length === 0) return {}
  const first: unknown = result[0]
  return isRecord(first) ? first : {}
}

export async function fetchProverSummary(): Promise<ProverSummaryData> {
  const [summaryResult, rtpResult] = await Promise.all([
    db.execute(sql`
      WITH active_clusters AS (
        SELECT c.id, c.team_id, cv.id AS cv_id
        FROM clusters c
        INNER JOIN cluster_versions cv ON cv.cluster_id = c.id AND cv.is_active = true
        WHERE c.is_active = true AND c.is_approved = true
      ),
      recent_proofs AS (
        SELECT p.cluster_version_id, p.proof_status, p.proving_time
        FROM proofs p
        INNER JOIN blocks b ON p.block_number = b.block_number
        WHERE b.timestamp >= NOW() - interval '7 days'
      )
      SELECT
        (SELECT COUNT(DISTINCT id)::integer FROM active_clusters) AS total_provers,
        COALESCE(SUM(
          CASE WHEN rp.proof_status = 'proved' THEN 1 ELSE 0 END
        ), 0)::integer AS total_proofs,
        CASE
          WHEN COUNT(CASE WHEN rp.proof_status = 'proved' THEN 1 END) > 0
          THEN (
            COUNT(CASE WHEN rp.proof_status = 'proved' AND rp.proving_time < ${RTP_PERFORMANCE_TIME_THRESHOLD_MS} THEN 1 END)::double precision /
            COUNT(CASE WHEN rp.proof_status = 'proved' THEN 1 END)::double precision
          ) * 100
          ELSE 0
        END AS avg_performance
      FROM active_clusters ac
      LEFT JOIN recent_proofs rp ON rp.cluster_version_id = ac.cv_id
    `),
    db.execute(sql`
      SELECT COUNT(DISTINCT s.cluster_id)::integer AS rtp_eligible_count
      FROM rtp_cohort_snapshots s
      WHERE s.is_eligible = true
        AND s.snapshot_week = (
          SELECT MAX(snapshot_week) FROM rtp_cohort_snapshots
        )
    `),
  ])

  const summary = getFirstRow(summaryResult)
  const rtp = getFirstRow(rtpResult)

  return {
    totalProvers: Number(summary.total_provers ?? 0),
    rtpEligibleCount: Number(rtp.rtp_eligible_count ?? 0),
    totalProofs: Number(summary.total_proofs ?? 0),
    avgPerformance: Number(summary.avg_performance ?? 0),
  }
}

export async function fetchProverScatterData(): Promise<ProverScatterPoint[]> {
  const result = await db.execute(sql`
    WITH latest_snapshot AS (
      SELECT MAX(snapshot_week) AS week
      FROM rtp_cohort_snapshots
    ),
    cluster_data AS (
      SELECT
        t.name AS team_name,
        c.name AS cluster_name,
        pt.name AS persona,
        s.performance_score,
        s.liveness_score,
        s.avg_cost_per_proof,
        s.is_eligible,
        (s.sub_10s_proofs + s.over_10s_proofs)::integer AS proof_count
      FROM rtp_cohort_snapshots s
      INNER JOIN latest_snapshot ls ON s.snapshot_week = ls.week
      INNER JOIN clusters c ON s.cluster_id = c.id
      INNER JOIN teams t ON c.team_id = t.id
      INNER JOIN prover_types pt ON c.prover_type_id = pt.id
      WHERE c.is_active = true AND c.is_approved = true
    )
    SELECT * FROM cluster_data
    WHERE proof_count > 0
    ORDER BY performance_score DESC
  `)

  const rows = Array.isArray(result) ? result : []
  return rows
    .filter(isRecord)
    .filter((row) => row.avg_cost_per_proof != null)
    .map((row) => ({
      teamName: String(row.team_name ?? ""),
      clusterName: String(row.cluster_name ?? ""),
      persona: String(row.persona ?? ""),
      avgCost: Number(row.avg_cost_per_proof),
      performanceScore: Number(row.performance_score ?? 0),
      livenessScore: Number(row.liveness_score ?? 0),
      proofCount: Number(row.proof_count ?? 0),
      isRtpEligible: Boolean(row.is_eligible),
    }))
}

function isConsistencyWeekEntry(
  value: unknown
): value is RtpConsistencyWeekEntry {
  if (!isRecord(value)) return false
  const entry = value
  return (
    typeof entry.week === "string" &&
    typeof entry.isEligible === "boolean" &&
    typeof entry.hasData === "boolean"
  )
}

function parseConsistencyTimeline(raw: unknown): RtpConsistencyWeekEntry[] {
  let parsed: unknown = raw
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw)
    } catch {
      return []
    }
  }
  if (!Array.isArray(parsed)) return []
  return parsed.filter(isConsistencyWeekEntry)
}

function toConsistencyMember(
  row: Record<string, unknown>
): RtpCohortConsistencyMember {
  const totalWeeks = Number(row.total_weeks)
  const weeksIncluded = Number(row.weeks_included)
  const timeline = parseConsistencyTimeline(row.weekly_timeline)
  const trackedWeeks = timeline.filter((e) => e.hasData).length
  return {
    clusterName: String(row.cluster_name),
    teamName: String(row.team_name),
    teamLogoUrl: row.team_logo_url ? String(row.team_logo_url) : null,
    weeksIncluded,
    totalWeeks,
    trackedWeeks,
    inclusionRate:
      trackedWeeks > 0 ? Math.round((weeksIncluded / trackedWeeks) * 100) : 0,
    isCurrentlyIncluded: Boolean(row.is_currently_included),
    weeklyTimeline: timeline,
  }
}

export async function fetchRtpCohortConsistency(
  days: number
): Promise<RtpCohortConsistencyData> {
  return cache(
    async (days: number) => {
      const result = await db.execute(sql`
        WITH all_weeks AS (
          SELECT week::timestamptz
          FROM generate_series(
            date_trunc('week', NOW() - make_interval(days => ${days})),
            date_trunc('week', NOW()),
            '1 week'::interval
          ) AS week
        ),
        tracked_weeks AS (
          SELECT DISTINCT snapshot_week AS week
          FROM rtp_cohort_snapshots
          WHERE snapshot_week >= NOW() - make_interval(days => ${days})
        ),
        snapshot_range AS (
          SELECT
            (SELECT COUNT(*)::integer FROM all_weeks) AS total_weeks,
            (SELECT MAX(snapshot_week) FROM rtp_cohort_snapshots
              WHERE snapshot_week >= NOW() - make_interval(days => ${days})
            ) AS latest_week
        ),
        multi_gpu_clusters AS (
          SELECT
            c.id AS cluster_id,
            c.name AS cluster_name,
            t.name AS team_name,
            t.logo_url AS team_logo_url
          FROM clusters c
          INNER JOIN teams t ON c.team_id = t.id
          INNER JOIN prover_types pt ON c.prover_type_id = pt.id
          WHERE c.is_active = true AND c.is_approved = true
            AND pt.gpu_configuration = 'multi-gpu'
        ),
        cluster_tenure AS (
          SELECT
            mgc.cluster_id,
            mgc.cluster_name,
            mgc.team_name,
            mgc.team_logo_url,
            COALESCE(COUNT(DISTINCT s.snapshot_week) FILTER (WHERE s.is_eligible), 0)::integer AS weeks_included,
            sr.total_weeks,
            EXISTS (
              SELECT 1
              FROM rtp_cohort_snapshots latest
              WHERE latest.cluster_id = mgc.cluster_id
                AND latest.snapshot_week = sr.latest_week
                AND latest.is_eligible = true
            ) AS is_currently_included
          FROM multi_gpu_clusters mgc
          CROSS JOIN snapshot_range sr
          LEFT JOIN rtp_cohort_snapshots s
            ON s.cluster_id = mgc.cluster_id
            AND s.snapshot_week >= NOW() - make_interval(days => ${days})
          GROUP BY mgc.cluster_id, mgc.cluster_name, mgc.team_name, mgc.team_logo_url, sr.total_weeks, sr.latest_week
        ),
        cluster_timelines AS (
          SELECT
            ct.cluster_id,
            json_agg(
              json_build_object(
                'week', aw.week,
                'isEligible', COALESCE(s.is_eligible, false),
                'hasData', tw.week IS NOT NULL
              )
              ORDER BY aw.week
            ) AS weekly_timeline
          FROM cluster_tenure ct
          CROSS JOIN all_weeks aw
          LEFT JOIN tracked_weeks tw ON tw.week = aw.week
          LEFT JOIN rtp_cohort_snapshots s
            ON s.cluster_id = ct.cluster_id AND s.snapshot_week = aw.week
          GROUP BY ct.cluster_id
        )
        SELECT
          ct.cluster_name,
          ct.team_name,
          ct.team_logo_url,
          ct.weeks_included,
          ct.total_weeks,
          ct.is_currently_included,
          ctl.weekly_timeline
        FROM cluster_tenure ct
        INNER JOIN cluster_timelines ctl ON ctl.cluster_id = ct.cluster_id
        ORDER BY ct.weeks_included DESC, ct.team_name ASC
      `)

      const rows = Array.isArray(result) ? result : []
      const members = rows.filter(isRecord).map(toConsistencyMember)

      const currentMembers = members.filter((m) => m.isCurrentlyIncluded)
      const trackedPeriodWeeks = members.length > 0 ? members[0].totalWeeks : 0
      const avgTenureWeeks =
        currentMembers.length > 0
          ? Math.round(
              currentMembers.reduce((sum, m) => sum + m.weeksIncluded, 0) /
                currentMembers.length
            )
          : 0

      return {
        currentIncludedCount: currentMembers.length,
        avgTenureWeeks,
        trackedPeriodWeeks,
        members,
      }
    },
    ["rtp-cohort-consistency", String(days)],
    {
      revalidate: 60 * 60,
      tags: [TAGS.RTP_COHORT],
    }
  )(days)
}
