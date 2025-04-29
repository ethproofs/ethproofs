import { notIlike } from "drizzle-orm"

import { SummaryItem } from "@/lib/types"

import Instructions from "@/components/svgs/instructions.svg"
import ShieldCheck from "@/components/svgs/shield-check.svg"

import { Card, CardHeader, CardTitle } from "./ui/card"
import ClusterAccordion from "./ClusterAccordion"
import KPIs from "./KPIs"
import MachineTabs from "./MachineTabs"

import { db } from "@/db"
import { teamsSummary as teamsSummaryView } from "@/db/schema"
import { getActiveClusters, getActiveMachineCount } from "@/lib/api/clusters"

const ProversSection = async () => {
  const teamsSummary = await db
    .select()
    .from(teamsSummaryView)
    // hide test teams from the provers list
    .where(notIlike(teamsSummaryView.team_name, "%test%"))

  const machineCount = await getActiveMachineCount()

  const activeClusters = await getActiveClusters()

  const proversSummary: SummaryItem[] = [
    {
      key: "provers",
      label: "provers",
      value: teamsSummary.length,
      icon: <ShieldCheck />,
    },
    {
      key: "proving-machines",
      label: "proving machines",
      value: machineCount,
      icon: <Instructions />,
    },
    {
      key: "annual-proving-costs",
      label: "annual proving costs",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
      }).format(100_000),
      icon: <></>,
    },
  ]

  const clusters = activeClusters.map((cluster) => {
    const team = teamsSummary.find((team) => team.team_id === cluster.teamId)

    return {
      clusterName: cluster.nickname,
      proverName: cluster.teamName,
      proverLogo: cluster.teamLogoUrl,
      zkvmName: cluster.zkvmName,
      // TODO: Add isOpenSource to clusters
      isOpenSource: false,
      avgCost: team?.avg_cost_per_proof ?? 0,
      avgTime: Number(team?.avg_proving_time ?? 0),
      // TODO: Add efficiency calculation
      efficiency: 0,
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
            <ClusterAccordion clusters={clusters} />
          </>
        }
        multiContent={
          <>
            <ClusterAccordion clusters={clusters} />
          </>
        }
      />
    </Card>
  )
}

export default ProversSection
