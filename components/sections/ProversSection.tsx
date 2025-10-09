import type { SummaryItem } from "@/lib/types"

import { BasicTabs } from "../BasicTabs"
import ClusterAccordion from "../ClusterAccordion"
import KPIs from "../KPIs"
import { ButtonLink } from "../ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"

import { getActiveClusters } from "@/lib/api/clusters"
import { getClusterSummary } from "@/lib/api/stats"
import { getTeamsCount } from "@/lib/api/teams"

const ProversSection = async () => {
  const [teamsCount, clusterSummary, activeClusters] = await Promise.all([
    getTeamsCount(),
    getClusterSummary(),
    getActiveClusters(),
  ])

  const clustersSummary: SummaryItem[] = [
    {
      key: "teams",
      label: "teams",
      value: teamsCount,
    },
    {
      key: "clusters",
      label: "clusters",
      value: activeClusters.length,
    },
  ]

  const clusters = activeClusters.map((cluster) => {
    const stats = clusterSummary.find(
      (summary) => summary.cluster_id === cluster.id
    )

    return {
      ...cluster,
      avg_cost: stats?.avg_cost_per_proof ?? 0,
      avg_time: Number(stats?.avg_proving_time ?? 0),
    }
  })

  const singleMachineClusters = clusters
    .filter((cluster) => !cluster.is_multi_machine)
    .sort((a, b) => a.avg_time - b.avg_time)

  const multiMachineClusters = clusters
    .filter((cluster) => cluster.is_multi_machine)
    .sort((a, b) => a.avg_time - b.avg_time)

  return (
    <Card className="!p-0 !pb-6 md:!pb-8">
      <CardHeader className="flex flex-wrap items-center justify-between sm:flex-row md:px-12 max-sm:[&>div]:w-full">
        <CardTitle className="text-3xl font-normal tracking-[1px] max-sm:pt-8">
          provers
        </CardTitle>

        <div>
          <KPIs items={clustersSummary} />
        </div>
      </CardHeader>

      <CardContent className="px-0 pt-6">
        <BasicTabs
          contentRight={<ClusterAccordion clusters={singleMachineClusters} />}
          contentLeft={<ClusterAccordion clusters={multiMachineClusters} />}
        />
      </CardContent>

      <CardFooter className="justify-center">
        <ButtonLink variant="outline" href="/clusters" className="min-w-40">
          see all
        </ButtonLink>
      </CardFooter>
    </Card>
  )
}

export default ProversSection
