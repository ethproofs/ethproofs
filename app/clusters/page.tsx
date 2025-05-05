import type { Metadata } from "next"

import ClusterAccordion from "@/components/ClusterAccordion"
import MachineTabs from "@/components/MachineTabs"

import { getActiveClusters } from "@/lib/api/clusters"
import { getClusterSummary } from "@/lib/api/stats"
import { transformClusters } from "@/lib/clusters"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export default async function ClustersPage() {
  const clusterSummary = await getClusterSummary()
  const activeClusters = await getActiveClusters()

  const clusters = transformClusters(activeClusters, clusterSummary)

  const singleMachineClusters = clusters.filter(
    (cluster) => !cluster.isMultiMachine
  )

  const multiMachineClusters = clusters.filter(
    (cluster) => cluster.isMultiMachine
  )

  return (
    <>
      <div className="absolute top-0 h-40 w-full space-y-12 px-6 pt-24 text-center font-mono font-semibold md:px-8">
        <h1 className="text-shadow text-3xl">clusters</h1>
        <div>single or multiple machines</div>
      </div>

      <div className="mt-20 flex flex-1 flex-col items-center gap-20 px-6 md:px-8">
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
