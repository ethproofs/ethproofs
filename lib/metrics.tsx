import {
  getZkvmPerformanceMetricsByZkvmId,
  getZkvmSecurityMetricsByZkvmId,
  getZkvmsWithMetrics,
} from "./api/metrics"
import { ZkvmMetrics } from "./types"

export const getZkvmsMetricsByZkvmId = async ({
  zkvmIds,
}: {
  zkvmIds: number[]
}) => {
  const zkvmsWithMetrics = await getZkvmsWithMetrics({ zkvmIds })

  const metricsByZkvmId = new Map<number, Partial<ZkvmMetrics>>()

  for (const zkvm of zkvmsWithMetrics) {
    const securityMetricsUpdatedAt = zkvm.security_metrics?.updated_at
    const performanceMetricsUpdatedAt = zkvm.performance_metrics?.updated_at

    const lastUpdated =
      securityMetricsUpdatedAt > performanceMetricsUpdatedAt
        ? securityMetricsUpdatedAt
        : performanceMetricsUpdatedAt

    metricsByZkvmId.set(zkvm.id, {
      ...zkvm.security_metrics,
      ...zkvm.performance_metrics,
      updated_at: lastUpdated,
    })
  }

  return metricsByZkvmId
}

export const getZkvmMetrics = async (zkvmId: number) => {
  const securityMetrics = await getZkvmSecurityMetricsByZkvmId(zkvmId)
  const performanceMetrics = await getZkvmPerformanceMetricsByZkvmId(zkvmId)

  return {
    ...securityMetrics,
    ...performanceMetrics,
  }
}
