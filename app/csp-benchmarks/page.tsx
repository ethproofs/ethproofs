import type { Metadata } from "next"

import { CspBenchmarksSelector } from "@/components/csp-benchmarks-table/csp-benchmarks-selector"

import { fetchAllCspBenchmarks } from "@/lib/api/csp-benchmarks"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({
  title: "CSP Benchmarks",
})

export default async function CspBenchmarksPage() {
  const cspBenchmarks = await fetchAllCspBenchmarks()

  return (
    <div className="mx-auto mt-2 max-w-screen-xl space-y-4 px-6">
      <section className="w-full">
        <CspBenchmarksSelector
          benchmarks={cspBenchmarks.filter((b) => b.data.length !== 0)}
        />
      </section>
    </div>
  )
}
