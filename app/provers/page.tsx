import type { Metadata } from "next"

import ClusterAccordion from "@/components/ClusterAccordion"
import LineChartCard from "@/components/LineChartCard"
import MachineTabs from "@/components/MachineTabs"

import { sumArray } from "@/lib/utils"

import { getActiveClusters } from "@/lib/api/clusters"
import { getClusterSummary } from "@/lib/api/stats"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export default async function Provers() {
  const clusterSummary = await getClusterSummary()
  const activeClusters = await getActiveClusters()

  const clusters = activeClusters.map((cluster) => {
    const stats = clusterSummary.find(
      (summary) => summary.cluster_id === cluster.id
    )

    return {
      id: cluster.id,
      name: cluster.nickname,
      versionDate: cluster.version.createdAt,
      isOpenSource: cluster.isOpenSource,
      isMultiMachine: cluster.isMultiMachine,
      avgCost: stats?.avg_cost_per_proof ?? 0,
      avgTime: Number(stats?.avg_proving_time ?? 0),
      team: {
        id: cluster.team.id,
        name: cluster.team.name,
        logoUrl: cluster.team.logoUrl,
      },
      zkvm: {
        id: cluster.zkvm.id,
        name: cluster.zkvm.name,
      },
      machines: cluster.machines.map((machine) => ({
        id: machine.id,
        cpuModel: machine.cpuModel ?? "",
        cpuCount: machine.cpuCores ?? 0,
        cpuRam: sumArray(machine.memorySizeGb),
        gpuCount: machine.gpuCount ?? [],
        gpuModels: machine.gpuModels ?? [],
        gpuRam: machine.gpuRam ?? [],
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
    <>
      <div className="absolute top-16 w-full space-y-12 px-6 text-center font-mono font-semibold sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <h1
          className="text-3xl"
          style={{
            textShadow: `
              0 0 3rem hsla(var(--background-modal)),
              0 0 2rem hsla(var(--background-modal)),
              0 0 1rem hsla(var(--background-modal)),
              0 0 1rem hsla(var(--background-modal))`,
          }}
        >
          provers
        </h1>
        <div>Clusters or single machines</div>
      </div>
      <div className="flex flex-1 flex-col items-center gap-20 px-6 sm:px-8 md:w-[calc(100vw_-_var(--sidebar-width))] md:px-12 lg:px-16 xl:px-20">
        <section id="kpis" className="w-full max-w-screen-xl scroll-m-20">
          <LineChartCard
            id="cost-chart"
            className="w-full"
            title="cost"
            hideKPIs
            format="currency"
            data={[]}
            totalAvg={0}
            totalMedian={0}
          />
        </section>

        <section className="w-full max-w-screen-xl scroll-m-20">
          <MachineTabs
            singleContent={
              <ClusterAccordion clusters={singleMachineClusters} />
            }
            multiContent={<ClusterAccordion clusters={multiMachineClusters} />}
          />
        </section>
      </div>
    </>
  )
}
