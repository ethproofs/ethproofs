"use client"

import { useQuery } from "@tanstack/react-query"

import { ProofsDailyStats } from "@/lib/types"

import { CHART_RANGES } from "@/lib/constants"

import LineChartCard, { type ChartData } from "./LineChartCard"

const ProofsStats = () => {
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
    <section className="grid w-full max-w-screen-xl scroll-m-20 grid-cols-1 gap-8 md:grid-cols-2">
      <div className="w-full">
        <LineChartCard
          title="cost"
          format="currency"
          data={costData}
          isLoading={isLoading}
        />
      </div>
      <div className="w-full">
        <LineChartCard
          title="latency"
          format="ms"
          data={latencyData}
          isLoading={isLoading}
        />
      </div>
    </section>
  )
}

export default ProofsStats
