import { SummaryItem } from "@/lib/types"

import ClusterAccordion from "../ClusterAccordion"
import KPIs from "../KPIs"
import MachineTabs from "../MachineTabs"
import { ButtonLink } from "../ui/button"
import { Card, CardHeader, CardTitle } from "../ui/card"

import { getActiveClusters, getActiveMachineCount } from "@/lib/api/clusters"
import { getClusterSummary, getTeamsSummary } from "@/lib/api/stats"
import { transformClusters } from "@/lib/clusters"

const ProversSection = async () => {
  const teamsSummary = await getTeamsSummary()
  const clusterSummary = await getClusterSummary()
  const machineCount = await getActiveMachineCount()
  const activeClusters = await getActiveClusters()

  const proversSummary: SummaryItem[] = [
    {
      key: "provers",
      label: "provers",
      value: teamsSummary.length,
    },
    {
      key: "proving-machines",
      label: "proving machines",
      value: machineCount,
    },
  ]

  const clusters = transformClusters(activeClusters, clusterSummary)

  const singleMachineClusters = clusters.filter(
    (cluster) => !cluster.isMultiMachine
  )

  const multiMachineClusters = clusters.filter(
    (cluster) => cluster.isMultiMachine
  )

  return (
    <Card className="!p-0 !pb-6 md:!pb-8">
      <CardHeader className="space-y-3 p-6 pb-0 md:px-12 md:pt-8">
        <CardTitle className="text-2xl">provers</CardTitle>

        <KPIs items={proversSummary} />
      </CardHeader>

      <MachineTabs
        singleContent={<ClusterAccordion clusters={singleMachineClusters} />}
        multiContent={<ClusterAccordion clusters={multiMachineClusters} />}
      />

      <div className="flex justify-center">
        <ButtonLink variant="outline" href="/provers">
          See all
        </ButtonLink>
      </div>
    </Card>
  )
}

export default ProversSection
