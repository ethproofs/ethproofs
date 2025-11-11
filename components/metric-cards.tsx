import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

import { getActiveClusters } from "@/lib/api/clusters"
import { getRecentSummary } from "@/lib/api/stats"
import { formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"
import { getZkvmsStats } from "@/lib/zkvms"

export async function MetricCards() {
  const recentSummary = await getRecentSummary()
  const zkvmsStats = await getZkvmsStats()
  const activeClusters = await getActiveClusters()

  const cards = [
    {
      title: "proven blocks",
      value: recentSummary.total_proven_blocks,
    },
    {
      title: "zkVMs",
      value: zkvmsStats.count,
    },
    {
      title: "provers",
      value: activeClusters.length,
    },
    {
      title: "avg cost per proof",
      value: formatUsd(Number(recentSummary.avg_cost_per_proof ?? 0)),
    },
    {
      title: "avg proving time",
      value: prettyMs(Number(recentSummary.avg_proving_time ?? 0)),
    },
  ]
  return (
    <div className="flex flex-wrap gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="min-w-0 flex-1 bg-secondary/60">
          <CardHeader>
            <CardTitle className="overflow-hidden text-ellipsis text-lg text-primary">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="break-words text-3xl font-bold">
            {card.value}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
