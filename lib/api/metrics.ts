import { eq, inArray } from "drizzle-orm"

import { db } from "@/db"
import { zkvmPerformanceMetrics, zkvms, zkvmSecurityMetrics } from "@/db/schema"

export const getZkvmsWithMetrics = async ({
  zkvmIds,
}: {
  zkvmIds: number[]
}) => {
  const metrics = await db.query.zkvms.findMany({
    where: inArray(zkvms.id, zkvmIds),
    with: {
      security_metrics: true,
      performance_metrics: true,
    },
  })

  return metrics
}

export const getZkvmSecurityMetricsByZkvmId = async (zkvmId: number) => {
  const metrics = await db.query.zkvmSecurityMetrics.findFirst({
    where: eq(zkvmSecurityMetrics.zkvm_id, zkvmId),
  })

  return metrics
}

export const getZkvmPerformanceMetricsByZkvmId = async (zkvmId: number) => {
  const metrics = await db.query.zkvmPerformanceMetrics.findFirst({
    where: eq(zkvmPerformanceMetrics.zkvm_id, zkvmId),
  })

  return metrics
}
