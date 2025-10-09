import type { Metadata } from "next"

import { BasicTabs } from "@/components/BasicTabs"
import KillersTable from "@/components/KillersTable"

import { getBenchmarks } from "@/lib/api/benchmarks"
import { getClustersBenchmarks } from "@/lib/api/clusters"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({ title: "Killers" })

export default async function KillersPage() {
  const [clusters, benchmarks] = await Promise.all([
    getClustersBenchmarks(),
    getBenchmarks(),
  ])

  const multiMachineBenchmarks = clusters.filter(
    (cluster) => cluster.is_multi_machine
  )

  const singleMachineBenchmarks = clusters.filter(
    (cluster) => !cluster.is_multi_machine
  )

  return (
    <>
      <div className="mb-24 mt-16 space-y-2 px-6 text-center font-semibold md:mt-24">
        <h1 className="text-3xl">killers</h1>
        <div className="mx-auto max-w-md font-sans text-sm font-normal">
          Prover killers are adversarially-crafted benchmarks to test zkVMs with
          worst-case blocks. The goal is to find performance bottlenecks,
          trigger edge cases, and push zkVMs to their limits.
        </div>
      </div>

      <div className="mx-auto mt-20 flex max-w-screen-xl flex-1 flex-col items-center gap-20 px-6 md:px-8 [&>section]:w-full">
        <section>
          <BasicTabs
            contentRight={
              <KillersTable
                benchmarks={benchmarks}
                clusters={singleMachineBenchmarks}
              />
            }
            contentLeft={
              <KillersTable
                benchmarks={benchmarks}
                clusters={multiMachineBenchmarks}
              />
            }
          />
        </section>
      </div>
    </>
  )
}
