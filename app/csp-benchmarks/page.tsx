import type { Metadata } from "next"

import { CspBenchmarksSelector } from "@/components/csp-benchmarks-table/csp-benchmarks-selector"

import { fetchAllCspBenchmarks } from "@/lib/api/csp-benchmarks"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({
  title: "CSP Benchmarks",
})

export default async function CspBenchmarksPage() {
  const cspBenchmarks = await fetchAllCspBenchmarks()

  const sortedBenchmarks = cspBenchmarks
    .filter((b) => b.data.length !== 0)
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0).getTime()
      const dateB = new Date(b.updatedAt || 0).getTime()
      return dateB - dateA // Most recent first
    })

  return (
    <div className="mx-auto mt-2 max-w-screen-xl space-y-4 px-6">
      <section className="w-full">
        <CspBenchmarksSelector benchmarks={sortedBenchmarks} />
      </section>
    </div>
  )
}
