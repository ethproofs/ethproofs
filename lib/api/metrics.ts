import { eq } from "drizzle-orm"

import { db } from "@/db"
import { zkvmPerformanceMetrics, zkvmSecurityMetrics } from "@/db/schema"

export const getZkvmSecurityMetrics = async () => {
  const metrics = await db.query.zkvmSecurityMetrics.findMany()

  return metrics
}

export const getZkvmPerformanceMetrics = async () => {
  const metrics = await db.query.zkvmPerformanceMetrics.findMany()

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
