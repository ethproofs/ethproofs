import { notIlike } from "drizzle-orm"

import { SummaryItem } from "@/lib/types"

import { sumArray } from "@/lib/utils"

import ClusterAccordion from "../ClusterAccordion"
import KPIs from "../KPIs"
import MachineTabs from "../MachineTabs"
import { ButtonLink } from "../ui/button"
import { Card, CardHeader, CardTitle } from "../ui/card"

import { db } from "@/db"
import {
  clusterSummary as clusterSummaryView,
  teamsSummary as teamsSummaryView,
} from "@/db/schema"
import { getActiveClusters, getActiveMachineCount } from "@/lib/api/clusters"

const ProversSection = async () => {
  const teamsSummary = await db
    .select()
    .from(teamsSummaryView)
    // hide test teams from the provers list
    .where(notIlike(teamsSummaryView.team_name, "%test%"))

  const clusterSummary = await db.select().from(clusterSummaryView)

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

  const clusters = activeClusters.map((cluster) => {
    const stats = clusterSummary.find(
      (summary) => summary.cluster_id === cluster.id
    )

    return {
      clusterName: cluster.nickname,
      clusterVersionDate: cluster.version.createdAt,
      proverId: cluster.team.id,
      proverName: cluster.team.name,
      proverLogo: cluster.team.logoUrl,
      zkvmId: cluster.zkvm.id,
      zkvmName: cluster.zkvm.name,
      isOpenSource: cluster.isOpenSource,
      isMultiMachine: cluster.isMultiMachine,
      avgCost: stats?.avg_cost_per_proof ?? 0,
      avgTime: Number(stats?.avg_proving_time ?? 0),
      machines: cluster.machines.map((machine) => ({
        cpuModel: machine.cpuModel ?? "",
        gpuCount: sumArray(machine.gpuCount),
        cpuCount: machine.cpuCores ?? 0,
        gpuRam: sumArray(machine.gpuCount),
        cpuRam: sumArray(machine.memoryCount),
        count: machine.count ?? 1,
      })),
    }
  })

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
