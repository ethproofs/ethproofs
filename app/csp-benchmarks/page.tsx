import type { Metadata } from "next"

import { BenchmarkContext } from "@/components/csp-benchmarks/benchmark-context"
import { Selector } from "@/components/csp-benchmarks/selector"

import { fetchAllCspBenchmarks } from "@/lib/api/csp-benchmarks"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({
  title: "benchmarks",
})

export default async function CspBenchmarksPage() {
  const { benchmarks, failedCount } = await fetchAllCspBenchmarks()

  const sortedBenchmarks = benchmarks
    .filter((b) => b.data.length !== 0)
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0).getTime()
      const dateB = new Date(b.updatedAt || 0).getTime()
      return dateB - dateA
    })

  const lastUpdated = sortedBenchmarks[0]?.updatedAt ?? null

  return (
    <div className="mx-auto mt-2 flex max-w-screen-xl flex-1 flex-col items-center gap-8 [&>section]:w-full">
      <section className="px-4 sm:px-6">
        <h1 className="text-xl sm:text-2xl">client-side proving benchmarks</h1>
        <p className="mt-2 text-xs text-body-secondary sm:text-sm">
          proving systems and zkVMs performance on consumer hardware
        </p>
      </section>
      <section>
        <Selector benchmarks={sortedBenchmarks} />
      </section>
      <section>
        <BenchmarkContext
          lastUpdated={lastUpdated}
          failedCount={failedCount}
        />
      </section>
    </div>
  )
}
