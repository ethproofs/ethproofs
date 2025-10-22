"use client"

import { useQuery } from "@tanstack/react-query"

import type { ProofsDailyStats, RecentSummary } from "@/lib/types"

import { CHART_RANGES } from "@/lib/constants"

import LineChartCard, { type ChartData } from "./LineChartCard"

import { formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"

const ProofsStats = ({ recentSummary }: { recentSummary: RecentSummary }) => {
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
    <section className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <LineChartCard
        className="w-full"
        title="cost"
        format="currency"
        data={costData}
        isLoading={isLoading}
        totalAvg={recentSummary.avg_cost_per_proof ?? 0}
        totalMedian={recentSummary.median_cost_per_proof ?? 0}
        formatValue={(value) => formatUsd(Number(value))}
      />
      <LineChartCard
        className="w-full"
        title="latency"
        format="ms"
        data={latencyData}
        isLoading={isLoading}
        totalAvg={Number(recentSummary.avg_proving_time ?? 0)}
        totalMedian={Number(recentSummary.median_proving_time ?? 0)}
        formatValue={(value) => prettyMs(Number(value))}
      />
    </section>
  )
}

export default ProofsStats
