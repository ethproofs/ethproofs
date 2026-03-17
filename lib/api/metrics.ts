import { eq, inArray, sql } from "drizzle-orm"

import type {
  GpuPriceHistoryEntry,
  MetricsSummary,
  PerformanceMetricsData,
  PersonaComparisonData,
  ProverTypeMetrics,
  ReliabilityDailyStats,
  SecurityMetricsData,
} from "@/lib/types"

import {
  RTP_PARALYZER_CUTOFF_MINUTES,
  RTP_PERFORMANCE_TIME_THRESHOLD_MS,
} from "@/lib/constants"

import { db, type Transaction } from "@/db"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function getFirstRecord(result: unknown): Record<string, unknown> | null {
  if (!Array.isArray(result) || result.length === 0) return null
  const first: unknown = result[0]
  return isRecord(first) ? first : null
}
import { zkvmPerformanceMetrics, zkvms, zkvmSecurityMetrics } from "@/db/schema"

export async function getZkvmsWithMetrics({ zkvmIds }: { zkvmIds: number[] }) {
  if (!zkvmIds?.length) return []

  const metrics = await db.query.zkvms.findMany({
    where: inArray(zkvms.id, zkvmIds),
    with: {
      security_metrics: true,
      performance_metrics: true,
    },
  })
  return metrics
}

export async function getZkvmSecurityMetricsByZkvmId(
  zkvmId: number,
  tx?: Transaction
) {
  const executor = tx ?? db
  const metrics = await executor.query.zkvmSecurityMetrics.findFirst({
    where: eq(zkvmSecurityMetrics.zkvm_id, zkvmId),
  })
  return metrics
}

export async function getZkvmPerformanceMetricsByZkvmId(
  zkvmId: number,
  tx?: Transaction
) {
  const executor = tx ?? db
  const metrics = await executor.query.zkvmPerformanceMetrics.findFirst({
    where: eq(zkvmPerformanceMetrics.zkvm_id, zkvmId),
  })
  return metrics
}

export async function createOrUpdateZkvmSecurityMetrics(
  zkvmId: number,
  data: SecurityMetricsData,
  tx?: Transaction
) {
  const executor = tx ?? db
  const existing = await getZkvmSecurityMetricsByZkvmId(zkvmId, tx)

  if (existing) {
    const [metrics] = await executor
      .update(zkvmSecurityMetrics)
      .set({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .where(eq(zkvmSecurityMetrics.zkvm_id, zkvmId))
      .returning()
    return metrics
  }

  const [metrics] = await executor
    .insert(zkvmSecurityMetrics)
    .values({
      zkvm_id: zkvmId,
      ...data,
      soundcalc_integration: data.soundcalc_integration ?? false,
    })
    .returning()
  return metrics
}

export async function createOrUpdateZkvmPerformanceMetrics(
  zkvmId: number,
  data: PerformanceMetricsData,
  tx?: Transaction
) {
  const executor = tx ?? db
  const existing = await getZkvmPerformanceMetricsByZkvmId(zkvmId, tx)

  if (existing) {
    const [metrics] = await executor
      .update(zkvmPerformanceMetrics)
      .set({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .where(eq(zkvmPerformanceMetrics.zkvm_id, zkvmId))
      .returning()
    return metrics
  }

  const [metrics] = await executor
    .insert(zkvmPerformanceMetrics)
    .values({
      zkvm_id: zkvmId,
      ...data,
    })
    .returning()
  return metrics
}

function computeChange(current: number, previous: number): number {
  if (previous <= 0) return 0
  return ((current - previous) / previous) * 100
}

function extractProverTypeMetrics(
  currentRow: Record<string, unknown>,
  prevRow: Record<string, unknown> | null,
  prefix: string
): ProverTypeMetrics {
  const avgLatency = Number(currentRow[`${prefix}_avg_latency`] ?? 0)
  const avgCost = Number(currentRow[`${prefix}_avg_cost`] ?? 0)
  const prevLatency = prevRow
    ? Number(prevRow[`${prefix}_avg_latency`] ?? 0)
    : 0
  const prevCost = prevRow ? Number(prevRow[`${prefix}_avg_cost`] ?? 0) : 0

  return {
    avgLatency,
    avgCost,
    latencyChange: computeChange(avgLatency, prevLatency),
    costChange: computeChange(avgCost, prevCost),
  }
}

function toMetricsSummaryDynamic(
  currentRow: Record<string, unknown>,
  prevRow: Record<string, unknown> | null
): Pick<
  MetricsSummary,
  | "totalProvenBlocks"
  | "totalProofs"
  | "blocksChange"
  | "proofsChange"
  | "multiGpu"
  | "singleGpu"
> {
  const totalProvenBlocks = Number(currentRow.total_proven_blocks ?? 0)
  const totalProofs = Number(currentRow.total_proofs ?? 0)
  const prevBlocks = prevRow ? Number(prevRow.total_proven_blocks ?? 0) : 0
  const prevProofs = prevRow ? Number(prevRow.total_proofs ?? 0) : 0

  return {
    totalProvenBlocks,
    totalProofs,
    blocksChange: computeChange(totalProvenBlocks, prevBlocks),
    proofsChange: computeChange(totalProofs, prevProofs),
    multiGpu: extractProverTypeMetrics(currentRow, prevRow, "multi_gpu"),
    singleGpu: extractProverTypeMetrics(currentRow, prevRow, "single_gpu"),
  }
}

function toMetricsSummaryStatic(
  zkvmRow: Record<string, unknown>,
  guestRow: Record<string, unknown>,
  proverRow: Record<string, unknown>
): Pick<
  MetricsSummary,
  | "activeZkvmCount"
  | "activeGuestCount"
  | "multiGpuProverCount"
  | "singleGpuProverCount"
> {
  return {
    activeZkvmCount: Number(zkvmRow.cnt ?? 0),
    activeGuestCount: Number(guestRow.cnt ?? 0),
    multiGpuProverCount: Number(proverRow.multi_gpu_count ?? 0),
    singleGpuProverCount: Number(proverRow.single_gpu_count ?? 0),
  }
}

export async function fetchMetricsSummary(
  days: number
): Promise<MetricsSummary> {
  const safeDays = Number.isFinite(days) ? Math.max(1, Math.floor(days)) : 30

  const [
    currentResult,
    prevResult,
    zkvmResult,
    guestResult,
    proverCountResult,
  ] = await Promise.all([
    db.execute(sql`
        SELECT
          COUNT(DISTINCT p.block_number)::integer AS total_proven_blocks,
          COUNT(p.proof_id)::integer AS total_proofs,
          COALESCE(AVG(p.proving_time) FILTER (WHERE pt.gpu_configuration = 'multi-gpu'), 0) AS multi_gpu_avg_latency,
          COALESCE(AVG(c.num_gpus::double precision * gpi.hourly_price::double precision * p.proving_time::double precision / (1000.0 * 60 * 60)) FILTER (WHERE pt.gpu_configuration = 'multi-gpu'), 0) AS multi_gpu_avg_cost,
          COALESCE(AVG(p.proving_time) FILTER (WHERE pt.gpu_configuration = 'single-gpu'), 0) AS single_gpu_avg_latency,
          COALESCE(AVG(c.num_gpus::double precision * gpi.hourly_price::double precision * p.proving_time::double precision / (1000.0 * 60 * 60)) FILTER (WHERE pt.gpu_configuration = 'single-gpu'), 0) AS single_gpu_avg_cost
        FROM proofs p
        INNER JOIN blocks b ON p.block_number = b.block_number
        INNER JOIN cluster_versions cv ON p.cluster_version_id = cv.id
        INNER JOIN clusters c ON cv.cluster_id = c.id
        LEFT JOIN prover_types pt ON c.prover_type_id = pt.id
        LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
        WHERE p.proof_status = 'proved'
          AND b.timestamp >= NOW() - make_interval(days => ${safeDays})
      `),
    db.execute(sql`
        SELECT
          COUNT(DISTINCT p.block_number)::integer AS total_proven_blocks,
          COUNT(p.proof_id)::integer AS total_proofs,
          COALESCE(AVG(p.proving_time) FILTER (WHERE pt.gpu_configuration = 'multi-gpu'), 0) AS multi_gpu_avg_latency,
          COALESCE(AVG(c.num_gpus::double precision * gpi.hourly_price::double precision * p.proving_time::double precision / (1000.0 * 60 * 60)) FILTER (WHERE pt.gpu_configuration = 'multi-gpu'), 0) AS multi_gpu_avg_cost,
          COALESCE(AVG(p.proving_time) FILTER (WHERE pt.gpu_configuration = 'single-gpu'), 0) AS single_gpu_avg_latency,
          COALESCE(AVG(c.num_gpus::double precision * gpi.hourly_price::double precision * p.proving_time::double precision / (1000.0 * 60 * 60)) FILTER (WHERE pt.gpu_configuration = 'single-gpu'), 0) AS single_gpu_avg_cost
        FROM proofs p
        INNER JOIN blocks b ON p.block_number = b.block_number
        INNER JOIN cluster_versions cv ON p.cluster_version_id = cv.id
        INNER JOIN clusters c ON cv.cluster_id = c.id
        LEFT JOIN prover_types pt ON c.prover_type_id = pt.id
        LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
        WHERE p.proof_status = 'proved'
          AND b.timestamp >= NOW() - make_interval(days => ${safeDays * 2})
          AND b.timestamp < NOW() - make_interval(days => ${safeDays})
      `),
    db.execute(sql`
        SELECT COUNT(DISTINCT zv.zkvm_id)::integer AS cnt
        FROM cluster_versions cv
        INNER JOIN clusters c ON cv.cluster_id = c.id
        INNER JOIN zkvm_versions zv ON cv.zkvm_version_id = zv.id
        WHERE c.is_active = true AND cv.is_active = true
      `),
    db.execute(sql`
        SELECT COUNT(DISTINCT c.guest_program_id)::integer AS cnt
        FROM clusters c
        WHERE c.is_active = true AND c.guest_program_id IS NOT NULL
      `),
    db.execute(sql`
        SELECT
          COUNT(*) FILTER (WHERE pt.gpu_configuration = 'multi-gpu')::integer AS multi_gpu_count,
          COUNT(*) FILTER (WHERE pt.gpu_configuration = 'single-gpu')::integer AS single_gpu_count
        FROM clusters c
        INNER JOIN prover_types pt ON c.prover_type_id = pt.id
        WHERE c.is_active = true
      `),
  ])

  const currentRow = getFirstRecord(currentResult) ?? {}
  const prevRow = getFirstRecord(prevResult)
  const zkvmRow = getFirstRecord(zkvmResult) ?? {}
  const guestRow = getFirstRecord(guestResult) ?? {}
  const proverRow = getFirstRecord(proverCountResult) ?? {}

  return {
    ...toMetricsSummaryDynamic(currentRow, prevRow),
    ...toMetricsSummaryStatic(zkvmRow, guestRow, proverRow),
  }
}

function toReliabilityDailyStats(
  row: Record<string, unknown>
): ReliabilityDailyStats {
  const sub10sCount = Number(row.sub_10s_count ?? 0)
  const stunnerCount = Number(row.stunner_count ?? 0)
  const paralyzerCount = Number(row.paralyzer_count ?? 0)
  const totalCount = Number(row.total_count ?? 0)
  return {
    date: String(row.date ?? ""),
    sub10sCount,
    stunnerCount,
    paralyzerCount,
    totalCount,
    sub10sRate: totalCount > 0 ? (sub10sCount / totalCount) * 100 : 0,
    stunnerRate: totalCount > 0 ? (stunnerCount / totalCount) * 100 : 0,
    paralyzerRate: totalCount > 0 ? (paralyzerCount / totalCount) * 100 : 0,
  }
}

export async function fetchReliabilityDailyStats(
  days: number
): Promise<ReliabilityDailyStats[]> {
  const safeDays = Number.isFinite(days) ? Math.max(1, Math.floor(days)) : 30
  const paralyzerCutoffMs = RTP_PARALYZER_CUTOFF_MINUTES * 60 * 1000

  const result = await db.execute(sql`
    SELECT
      DATE(b.timestamp) AS date,
      COUNT(*) FILTER (WHERE p.proving_time < ${RTP_PERFORMANCE_TIME_THRESHOLD_MS})::integer AS sub_10s_count,
      COUNT(*) FILTER (WHERE p.proving_time >= ${RTP_PERFORMANCE_TIME_THRESHOLD_MS} AND p.proving_time < ${paralyzerCutoffMs})::integer AS stunner_count,
      COUNT(*) FILTER (WHERE p.proving_time >= ${paralyzerCutoffMs})::integer AS paralyzer_count,
      COUNT(*)::integer AS total_count
    FROM proofs p
    INNER JOIN blocks b ON p.block_number = b.block_number
    WHERE p.proof_status = 'proved'
      AND p.proving_time IS NOT NULL
      AND b.timestamp >= NOW() - make_interval(days => ${safeDays})
    GROUP BY DATE(b.timestamp)
    ORDER BY date
  `)

  const rows = Array.isArray(result) ? result : []
  return rows.map((row: Record<string, unknown>) =>
    toReliabilityDailyStats(row)
  )
}

function toGpuPriceHistoryEntry(
  row: Record<string, unknown>
): GpuPriceHistoryEntry {
  return {
    week: String(row.week ?? ""),
    avgGpuPrice: Number(row.avg_gpu_price ?? 0),
    avgProofCost:
      row.avg_proof_cost != null ? Number(row.avg_proof_cost) : null,
  }
}

export async function fetchGpuPriceHistory(
  weeks: number
): Promise<GpuPriceHistoryEntry[]> {
  const safeWeeks = Number.isFinite(weeks) ? Math.max(1, Math.floor(weeks)) : 32

  const result = await db.execute(sql`
    WITH weekly_gpu AS (
      SELECT
        date_trunc('week', gpi.created_at::timestamptz) AS week,
        AVG(gpi.hourly_price::double precision) AS avg_gpu_price
      FROM gpu_price_index gpi
      WHERE gpi.created_at >= NOW() - make_interval(weeks => ${safeWeeks})
      GROUP BY date_trunc('week', gpi.created_at::timestamptz)
    ),
    weekly_cost AS (
      SELECT
        date_trunc('week', pds.date::timestamptz) AS week,
        AVG(pds.avg_cost) AS avg_proof_cost
      FROM proofs_daily_stats pds
      WHERE pds.date >= NOW() - make_interval(weeks => ${safeWeeks})
      GROUP BY date_trunc('week', pds.date::timestamptz)
    )
    SELECT
      wg.week,
      wg.avg_gpu_price,
      wc.avg_proof_cost
    FROM weekly_gpu wg
    LEFT JOIN weekly_cost wc ON wg.week = wc.week
    ORDER BY wg.week
  `)

  const rows = Array.isArray(result) ? result : []
  return rows.map((row: Record<string, unknown>) => toGpuPriceHistoryEntry(row))
}

function toPersonaComparisonData(
  row: Record<string, unknown>
): PersonaComparisonData {
  const proofCount = Number(row.proof_count ?? 0)
  const sub10sCount = Number(row.sub_10s_count ?? 0)
  const blocksProven = Number(row.blocks_proven ?? 0)
  const totalBlocks = Number(row.total_blocks ?? 0)

  return {
    persona: String(row.persona ?? ""),
    gpuConfiguration: String(row.gpu_configuration ?? ""),
    deploymentType: String(row.deployment_type ?? ""),
    proverCount: Number(row.prover_count ?? 0),
    proofCount,
    avgLatency: Number(row.avg_latency ?? 0),
    avgCost: Number(row.avg_cost ?? 0),
    performanceScore: proofCount > 0 ? (sub10sCount / proofCount) * 100 : 0,
    livenessScore: totalBlocks > 0 ? (blocksProven / totalBlocks) * 100 : 0,
  }
}

export async function fetchPersonaComparison(
  days: number
): Promise<PersonaComparisonData[]> {
  const safeDays = Number.isFinite(days) ? Math.max(1, Math.floor(days)) : 7

  const result = await db.execute(sql`
    SELECT
      pt.name AS persona,
      pt.gpu_configuration,
      pt.deployment_type,
      COUNT(DISTINCT c.id)::integer AS prover_count,
      COUNT(p.proof_id)::integer AS proof_count,
      COALESCE(AVG(p.proving_time), 0) AS avg_latency,
      COALESCE(AVG(c.num_gpus::double precision * gpi.hourly_price::double precision * p.proving_time::double precision / (1000.0 * 60 * 60)), 0) AS avg_cost,
      COUNT(*) FILTER (WHERE p.proving_time < ${RTP_PERFORMANCE_TIME_THRESHOLD_MS})::integer AS sub_10s_count,
      COUNT(DISTINCT CASE WHEN p.proof_status = 'proved' THEN p.block_number END)::integer AS blocks_proven,
      (SELECT COUNT(DISTINCT block_number)::integer FROM blocks WHERE timestamp >= NOW() - make_interval(days => ${safeDays})) AS total_blocks
    FROM clusters c
    INNER JOIN prover_types pt ON c.prover_type_id = pt.id
    INNER JOIN proofs p ON p.cluster_id = c.id AND p.proof_status = 'proved'
    INNER JOIN blocks b ON p.block_number = b.block_number AND b.timestamp >= NOW() - make_interval(days => ${safeDays})
    LEFT JOIN cluster_versions cv ON p.cluster_version_id = cv.id
    LEFT JOIN gpu_price_index gpi ON p.gpu_price_index_id = gpi.id
    WHERE c.is_active = true
    GROUP BY pt.id, pt.name, pt.gpu_configuration, pt.deployment_type
    ORDER BY pt.name
  `)

  const rows = Array.isArray(result) ? result : []
  return rows.map((row: Record<string, unknown>) =>
    toPersonaComparisonData(row)
  )
}
