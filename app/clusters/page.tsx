import type { Metadata } from "next"

import ClusterAccordion from "@/components/ClusterAccordion"
import MachineTabs from "@/components/MachineTabs"

import { getActiveClusters } from "@/lib/api/clusters"
import { getClusterSummary } from "@/lib/api/stats"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export default async function ClustersPage() {
  const clusterSummary = await getClusterSummary()
  const activeClusters = await getActiveClusters()

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
      <div className="absolute top-0 h-40 w-full space-y-12 px-6 pt-24 text-center font-mono font-semibold">
        <h1 className="text-shadow text-3xl">provers</h1>
        <div>Clusters or single machines</div>
      </div>

      <div className="mx-auto mt-20 flex max-w-screen-xl flex-1 flex-col items-center gap-20 px-6 md:px-8 [&>section]:w-full">
        <section>
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
