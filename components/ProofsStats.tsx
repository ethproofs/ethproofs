import { CHART_RANGES } from "@/lib/constants"

import LineChartCard, { type ChartData } from "./LineChartCard"

import { fetchProofsDailyStats } from "@/lib/api/stats"

const ProofsStats = async () => {
  const dailyData = await fetchProofsDailyStats(Math.max(...CHART_RANGES))

  const [costData, latencyData] = dailyData.reduce(
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
        <LineChartCard title="cost" format="currency" data={costData} />
      </div>
      <div className="w-full">
        <LineChartCard title="latency" format="ms" data={latencyData} />
      </div>
    </section>
  )
}

export default ProofsStats
