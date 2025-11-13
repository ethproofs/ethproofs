import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Null } from "./Null"

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
      subtitle: "median",
      value: prettyMs(Number(recentSummary.avg_proving_time ?? 0)),
      subValue: prettyMs(Number(recentSummary.median_proving_time ?? 0)),
      href: "/metrics",
    },
    {
      title: "avg cost per proof",
      subtitle: "median",
      value: formatUsd(Number(recentSummary.avg_cost_per_proof ?? 0)),
      subValue: formatUsd(Number(recentSummary.median_cost_per_proof ?? 0)),
      href: "/metrics",
    },
  ]
  return (
    <div className="flex flex-wrap gap-4">
      {cards.map((card) => (
        <Link key={card.title} href={card.href} className="min-w-0 flex-1">
          <Card className="h-full min-w-0 cursor-pointer bg-secondary/60 transition-colors hover:bg-secondary">
            <CardHeader>
              <CardTitle className="overflow-hidden text-ellipsis text-lg text-primary">
                {card.title}
              </CardTitle>
              {card.subtitle ? (
                <CardDescription>
                  {card.subtitle} {card.subValue}
                </CardDescription>
              ) : (
                <Null hidePlaceholder />
              )}
            </CardHeader>
            <CardContent className="break-words text-3xl font-bold">
              {card.value}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
