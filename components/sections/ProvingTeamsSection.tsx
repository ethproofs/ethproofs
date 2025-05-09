import { SummaryItem } from "@/lib/types"

import ClusterAccordion from "../ClusterAccordion"
import KPIs from "../KPIs"
import MachineTabs from "../MachineTabs"
import { ButtonLink } from "../ui/button"
import { Card, CardHeader, CardTitle } from "../ui/card"

import { getActiveClusters, getActiveMachineCount } from "@/lib/api/clusters"
import { getClusterSummary, getTeamsSummary } from "@/lib/api/stats"

const ProverTeamsSection = async () => {
  const teamsSummary = await getTeamsSummary()
  const clusterSummary = await getClusterSummary()
  const machineCount = await getActiveMachineCount()
  const activeClusters = await getActiveClusters()

  const proversSummary: SummaryItem[] = [
    {
      key: "teams",
      label: "teams",
      value: teamsSummary.length,
    },
    {
      key: "proving-machines",
      label: "proving machines",
      value: machineCount,
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

  const singleMachineClusters = clusters.filter(
    (cluster) => !cluster.is_multi_machine
  )

  const multiMachineClusters = clusters.filter(
    (cluster) => cluster.is_multi_machine
  )

  return (
    <Card className="!p-0 !pb-6 md:!pb-8">
      <CardHeader className="space-y-3 p-6 pb-0 md:px-12 md:pt-8">
        <CardTitle className="text-3xl font-normal tracking-[1px]">
          clusters
        </CardTitle>

        <div className="py-4">
          <KPIs items={proversSummary} />
        </div>
      </CardHeader>

      <MachineTabs
        singleContent={<ClusterAccordion clusters={singleMachineClusters} />}
        multiContent={<ClusterAccordion clusters={multiMachineClusters} />}
      />

      <div className="flex justify-center">
        <ButtonLink variant="outline" href="/teams">
          See all
        </ButtonLink>
      </div>
    </Card>
  )
}

export default ProverTeamsSection
