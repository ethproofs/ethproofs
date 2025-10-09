import type { Metadata } from "next"

import { BasicTabs } from "@/components/BasicTabs"
import ClusterAccordion from "@/components/ClusterAccordion"

import { getActiveClusters } from "@/lib/api/clusters"
import { getClusterSummary } from "@/lib/api/stats"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({ title: "Provers" })

export default async function ClustersPage() {
  const [clusterSummary, activeClusters] = await Promise.all([
    getClusterSummary(),
    getActiveClusters(),
  ])

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
    <>
      <div className="mb-24 mt-16 px-6 text-center text-3xl font-semibold md:mt-24 md:px-8">
        <h1 className="text-3xl">provers</h1>
      </div>

      <div className="mx-auto flex max-w-screen-xl flex-1 flex-col items-center gap-20 [&>section]:w-full">
        <section>
          <BasicTabs
            contentRight={<ClusterAccordion clusters={singleMachineClusters} />}
            contentLeft={<ClusterAccordion clusters={multiMachineClusters} />}
          />
        </section>
      </div>
    </>
  )
}
