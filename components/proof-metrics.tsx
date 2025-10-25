"use client"

import { useQuery } from "@tanstack/react-query"

import type { ProofsDailyStats, RecentSummary } from "@/lib/types"

import { CHART_RANGES } from "@/lib/constants"

import { type ChartData, ProofMetricChart } from "./proof-metric-chart"

import { formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"

export function ProofMetrics({
  recentSummary,
}: {
  recentSummary: RecentSummary
}) {
  const { data: dailyData, isLoading } = useQuery<ProofsDailyStats[]>({
    queryKey: ["proofs-daily-stats"],
    queryFn: async () => {
      const response = await fetch(
        `/api/stats/proofs/daily?days=${Math.max(...CHART_RANGES)}`
      )
      return response.json()
    },
  })

  const [costData, latencyData] = (dailyData ?? []).reduce(
    (acc, item) => {
      acc[0].push({
        date: item.date,
        avg: item.avg_cost,
        median: item.median_cost,
      })
      acc[1].push({
        date: item.date,
        avg: item.avg_latency,
        median: item.median_latency,
      })
      return acc
    },
    [[], []] as ChartData[][]
  )

  return (
    <>
      <ProofMetricChart
        title="latency"
        data={latencyData}
        isLoading={isLoading}
        totalAvg={Number(recentSummary.avg_proving_time ?? 0)}
        totalMedian={Number(recentSummary.median_proving_time ?? 0)}
        formatValue={(value) => prettyMs(Number(value))}
      />
      <ProofMetricChart
        title="cost"
        data={costData}
        isLoading={isLoading}
        totalAvg={recentSummary.avg_cost_per_proof ?? 0}
        totalMedian={recentSummary.median_cost_per_proof ?? 0}
        formatValue={(value) => formatUsd(Number(value))}
      />
    </>
  )
}
