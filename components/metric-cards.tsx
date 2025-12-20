import Link from "next/link"

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

import { getActiveClusters } from "@/lib/api/clusters"
import { getRecentSummary } from "@/lib/api/stats"
import { formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"
import { getActiveZkvms } from "@/lib/zkvms"

export async function MetricCards() {
  const recentSummary = await getRecentSummary()
  const zkvms = await getActiveZkvms()
  const activeClusters = await getActiveClusters()

  const cards = [
    {
      title: "proven blocks",
      value: recentSummary.total_proven_blocks,
      href: "/blocks",
    },
    {
      title: "zkVMs",
      value: zkvms.length,
      href: "/zkvms",
    },
    {
      title: "provers",
      value: activeClusters.length,
      href: "/provers",
    },
    {
      title: "avg proving time",
      value: prettyMs(Number(recentSummary.avg_proving_time ?? 0)),
      subValue: prettyMs(Number(recentSummary.median_proving_time ?? 0)),
      href: "/metrics",
    },
    {
      title: "avg cost per proof",
      value: formatUsd(Number(recentSummary.avg_cost_per_proof ?? 0)),
      subValue: formatUsd(Number(recentSummary.median_cost_per_proof ?? 0)),
      href: "/metrics",
    },
  ]
  return (
    <div className="grid grid-cols-6 gap-4 xl:grid-cols-5">
      {cards.map((card, index) => (
        <Link
          key={card.title}
          href={card.href}
          className={`min-w-0 ${index >= cards.length - 2 ? "col-span-3" : "col-span-2"} xl:col-span-1`}
        >
          <Card className="flex h-full min-w-0 cursor-pointer flex-col bg-secondary/60 transition-colors hover:bg-secondary">
            <CardHeader className="pb-2">
              <CardTitle className="overflow-hidden text-ellipsis text-base text-primary md:text-base lg:text-lg">
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 items-end overflow-hidden break-words text-xl font-bold md:text-lg lg:text-2xl">
              {card.value}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
