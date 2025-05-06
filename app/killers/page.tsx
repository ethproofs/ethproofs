import type { Metadata } from "next"

import MachineTabs from "@/components/MachineTabs"

import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export default async function KillersPage() {
  return (
    <>
      <div className="absolute top-0 h-40 w-full space-y-2 px-6 pt-24 text-center font-mono font-semibold">
        <h1 className="text-shadow text-3xl">killers</h1>
        <div className="mx-auto max-w-md font-sans text-sm font-normal">
          Prover killers are adversarially-crafted benchmarks to test zkVMs with
          worst-case blocks. The goal is to find performance bottlenecks,
          trigger edge cases, and push zkVMs to their limits.
        </div>
      </div>

      <div className="mx-auto mt-20 flex max-w-screen-xl flex-1 flex-col items-center gap-20 px-6 md:px-8 [&>section]:w-full">
        <section>
          {/* // TODO: Add row components for table */}
          <MachineTabs singleContent={<></>} multiContent={<></>} />
        </section>
      </div>
    </>
  )
}
