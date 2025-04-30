import { notIlike } from "drizzle-orm"

import { SummaryItem } from "@/lib/types"

import Instructions from "@/components/svgs/instructions.svg"
import ShieldCheck from "@/components/svgs/shield-check.svg"

import { ButtonLink } from "./ui/button"
import { Card, CardHeader, CardTitle } from "./ui/card"
import ClusterAccordion from "./ClusterAccordion"
import KPIs from "./KPIs"
import MachineTabs from "./MachineTabs"

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
      clusterVersionDate: cluster.clusterVersionDate,
      proverId: cluster.teamId,
      proverName: cluster.teamName,
      proverLogo: cluster.teamLogoUrl,
      zkvmId: cluster.zkvmId,
      zkvmName: cluster.zkvmName,
      isOpenSource: cluster.isOpenSource,
      avgCost: stats?.avg_cost_per_proof ?? 0,
      avgTime: Number(stats?.avg_proving_time ?? 0),
      machines: cluster.machines.map((machine) => ({
        cpuModel: machine.cpuModel ?? "",
        gpuCount: machine.gpuCount?.reduce((sum, count) => sum + count, 0) ?? 0,
        cpuCount: machine.cpuCores ?? 0,
        gpuRam: machine.gpuCount?.reduce((sum, count) => sum + count, 0) ?? 0,
        cpuRam:
          machine.memoryCount?.reduce((sum, count) => sum + count, 0) ?? 0,
        count: machine.count ?? 1,
      })),
    }
  })

  return (
    <Card className="!p-0 !pb-6 md:!pb-8">
      <CardHeader className="space-y-3 p-6 pb-0 md:px-12 md:pt-8">
        <CardTitle className="text-2xl">provers</CardTitle>

        <KPIs items={proversSummary} />
      </CardHeader>

      <MachineTabs
        singleContent={
          <>
            <ClusterAccordion
              clusters={clusters.filter(
                (cluster) =>
                  cluster.machines.length === 1 &&
                  cluster.machines[0].count === 1
              )}
            />
          </>
        }
        multiContent={
          <>
            <ClusterAccordion
              clusters={clusters.filter(
                (cluster) =>
                  cluster.machines.length > 1 || cluster.machines[0].count > 1
              )}
            />
          </>
        }
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
