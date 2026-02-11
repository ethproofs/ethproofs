import { eq, inArray } from "drizzle-orm"

import type { PerformanceMetricsData, SecurityMetricsData } from "@/lib/types"

import { db, type Transaction } from "@/db"
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
