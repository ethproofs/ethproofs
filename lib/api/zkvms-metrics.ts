import { sql } from "drizzle-orm"

import type {
  MilestoneStatus,
  ZkvmMilestoneEntry,
  ZkvmPerformancePoint,
  ZkvmSummaryData,
} from "@/lib/types"

import { SECURITY_MILESTONE_THRESHOLDS } from "@/lib/constants"

import { db } from "@/db"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getFirstRow(result: unknown): Record<string, unknown> {
  if (!Array.isArray(result) || result.length === 0) return {}
  const first: unknown = result[0]
  return isRecord(first) ? first : {}
}

export async function fetchZkvmSummary(): Promise<ZkvmSummaryData> {
  const [countsResult, rtpResult] = await Promise.all([
    db.execute(sql`
      SELECT
        COUNT(DISTINCT z.id)::integer AS total_zkvms,
        COUNT(DISTINCT z.id) FILTER (
          WHERE sm.quantum_security = 'green'
        )::integer AS pq_cryptography_count,
        COUNT(DISTINCT z.isa)::integer AS isa_count,
        COUNT(DISTINCT z.id) FILTER (
          WHERE sm.soundcalc_integration = true
        )::integer AS soundcalc_count,
        COUNT(DISTINCT z.id) FILTER (
          WHERE sm.security_target_bits >= ${SECURITY_MILESTONE_THRESHOLDS.M2A_SECURITY_BITS}
        )::integer AS security_100_bit_count,
        COUNT(DISTINCT z.id) FILTER (
          WHERE pm.size_bytes <= ${SECURITY_MILESTONE_THRESHOLDS.M2B_PROOF_SIZE_BYTES}
        )::integer AS proof_size_600_kib_count,
        COUNT(DISTINCT z.id) FILTER (
          WHERE sm.security_target_bits >= ${SECURITY_MILESTONE_THRESHOLDS.M3A_SECURITY_BITS}
        )::integer AS security_128_bit_count,
        COUNT(DISTINCT z.id) FILTER (
          WHERE pm.size_bytes <= ${SECURITY_MILESTONE_THRESHOLDS.M3B_PROOF_SIZE_BYTES}
        )::integer AS proof_size_300_kib_count
      FROM zkvms z
      INNER JOIN cluster_versions cv ON true
      INNER JOIN zkvm_versions zv ON cv.zkvm_version_id = zv.id AND zv.zkvm_id = z.id
      INNER JOIN clusters c ON cv.cluster_id = c.id AND c.is_active = true
      LEFT JOIN zkvm_security_metrics sm ON sm.zkvm_id = z.id
      LEFT JOIN zkvm_performance_metrics pm ON pm.zkvm_id = z.id
      WHERE z.approved = true
        AND cv.is_active = true
    `),
    db.execute(sql`
      SELECT COUNT(DISTINCT rcs.cluster_id)::integer AS rtp_eligible_count
      FROM rtp_cohort_snapshots rcs
      INNER JOIN clusters c ON rcs.cluster_id = c.id
      INNER JOIN cluster_versions cv ON cv.cluster_id = c.id AND cv.is_active = true
      INNER JOIN zkvm_versions zv ON cv.zkvm_version_id = zv.id
      WHERE rcs.is_eligible = true
        AND rcs.snapshot_week = (
          SELECT MAX(snapshot_week) FROM rtp_cohort_snapshots
        )
    `),
  ])

  const counts = getFirstRow(countsResult)
  const rtp = getFirstRow(rtpResult)

  return {
    totalZkvms: Number(counts.total_zkvms ?? 0),
    pqCryptographyCount: Number(counts.pq_cryptography_count ?? 0),
    rtpEligibleProverCount: Number(rtp.rtp_eligible_count ?? 0),
    isaCount: Number(counts.isa_count ?? 0),
    soundcalcCount: Number(counts.soundcalc_count ?? 0),
    security100BitCount: Number(counts.security_100_bit_count ?? 0),
    proofSize600KibCount: Number(counts.proof_size_600_kib_count ?? 0),
    security128BitCount: Number(counts.security_128_bit_count ?? 0),
    proofSize300KibCount: Number(counts.proof_size_300_kib_count ?? 0),
  }
}

function deriveMilestoneStatus(
  hasData: boolean,
  meetsThreshold: boolean
): MilestoneStatus {
  if (meetsThreshold) return "achieved"
  if (hasData) return "in_progress"
  return "not_yet"
}

export async function fetchZkvmMilestones(): Promise<ZkvmMilestoneEntry[]> {
  const result = await db.execute(sql`
    SELECT
      z.name AS zkvm_name,
      BOOL_OR(sm.soundcalc_integration) AS soundcalc_integration,
      MAX(sm.security_target_bits) AS security_target_bits,
      MIN(pm.size_bytes) AS size_bytes,
      BOOL_OR(sm.id IS NOT NULL) AS has_security_metrics,
      BOOL_OR(pm.id IS NOT NULL) AS has_performance_metrics
    FROM zkvms z
    INNER JOIN cluster_versions cv ON true
    INNER JOIN zkvm_versions zv ON cv.zkvm_version_id = zv.id AND zv.zkvm_id = z.id
    INNER JOIN clusters c ON cv.cluster_id = c.id AND c.is_active = true
    LEFT JOIN zkvm_security_metrics sm ON sm.zkvm_id = z.id
    LEFT JOIN zkvm_performance_metrics pm ON pm.zkvm_id = z.id
    WHERE z.approved = true
      AND cv.is_active = true
    GROUP BY z.id, z.name
    ORDER BY z.name
  `)

  const rows = Array.isArray(result) ? result : []

  const entries = rows.filter(isRecord).map((row) => {
    const hasSecurity = Boolean(row.has_security_metrics)
    const hasPerformance = Boolean(row.has_performance_metrics)
    const soundcalc = Boolean(row.soundcalc_integration)
    const securityBits = Number(row.security_target_bits ?? 0)
    const sizeBytes = Number(row.size_bytes ?? 0)
    const hasProofSize = hasPerformance && sizeBytes > 0

    const entry: ZkvmMilestoneEntry = {
      zkvmName: String(row.zkvm_name ?? ""),
      m1: deriveMilestoneStatus(hasSecurity, soundcalc),
      m2a: deriveMilestoneStatus(
        hasSecurity,
        securityBits >= SECURITY_MILESTONE_THRESHOLDS.M2A_SECURITY_BITS
      ),
      m2b: deriveMilestoneStatus(
        hasPerformance,
        hasProofSize &&
          sizeBytes <= SECURITY_MILESTONE_THRESHOLDS.M2B_PROOF_SIZE_BYTES
      ),
      m3a: deriveMilestoneStatus(
        hasSecurity,
        securityBits >= SECURITY_MILESTONE_THRESHOLDS.M3A_SECURITY_BITS
      ),
      m3b: deriveMilestoneStatus(
        hasPerformance,
        hasProofSize &&
          sizeBytes <= SECURITY_MILESTONE_THRESHOLDS.M3B_PROOF_SIZE_BYTES
      ),
    }

    return entry
  })

  return entries.sort((a, b) => {
    const countAchieved = (e: ZkvmMilestoneEntry) =>
      [e.m1, e.m2a, e.m2b, e.m3a, e.m3b].filter((s) => s === "achieved").length
    return countAchieved(b) - countAchieved(a)
  })
}

function toPerformancePoint(
  row: Record<string, unknown>
): ZkvmPerformancePoint {
  return {
    week: String(row.week ?? ""),
    zkvmName: String(row.zkvm_name ?? ""),
    avgProvingTimeMs: Number(row.avg_proving_time ?? 0),
  }
}

export async function fetchZkvmPerformanceTrajectory(): Promise<
  ZkvmPerformancePoint[]
> {
  const result = await db.execute(sql`
    SELECT
      z.name AS zkvm_name,
      date_trunc('week', b.timestamp::timestamptz) AS week,
      AVG(p.proving_time)::double precision AS avg_proving_time
    FROM proofs p
    INNER JOIN blocks b ON p.block_number = b.block_number
    INNER JOIN cluster_versions cv ON p.cluster_version_id = cv.id
    INNER JOIN clusters c ON cv.cluster_id = c.id AND c.is_active = true
    INNER JOIN zkvm_versions zv ON cv.zkvm_version_id = zv.id
    INNER JOIN zkvms z ON zv.zkvm_id = z.id
    WHERE p.proof_status = 'proved'
      AND p.proving_time IS NOT NULL
      AND cv.is_active = true
      AND b.timestamp >= NOW() - interval '6 months'
    GROUP BY z.name, date_trunc('week', b.timestamp::timestamptz)
    HAVING COUNT(*) >= 10
    ORDER BY z.name, week
  `)

  const rows = Array.isArray(result) ? result : []
  return rows.filter(isRecord).map(toPerformancePoint)
}
