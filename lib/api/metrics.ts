import { db } from "@/db"

export const getZkvmSecurityMetrics = async () => {
  const metrics = await db.query.zkvmSecurityMetrics.findMany()

  return metrics
}

export const getZkvmPerformanceMetrics = async () => {
  const metrics = await db.query.zkvmPerformanceMetrics.findMany()

  return metrics
}
