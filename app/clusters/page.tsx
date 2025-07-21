import type { Metadata } from "next"

import BasicTabs from "@/components/BasicTabs"
import ClusterAccordion from "@/components/ClusterAccordion"

import { getActiveClusters } from "@/lib/api/clusters"
import { getClusterSummary } from "@/lib/api/stats"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

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
      <div className="mb-24 mt-16 space-y-12 text-center font-mono font-semibold md:mt-24">
        <h1 className="text-shadow text-3xl">provers</h1>
        <div>multi or single machine clusters</div>
      </div>

      <div className="mx-auto mt-20 flex max-w-screen-lg flex-1 flex-col items-center gap-20 [&>section]:w-full">
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
