import type { Metadata } from "next"

import { CspBenchmarksTable } from "@/components/csp-benchmarks-table/csp-benchmarks-table"
import { CspBenchmarkRow } from "@/components/csp-benchmarks-table/columns"

import { fetchAllCspBenchmarks } from "@/lib/api/csp-benchmarks"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({
  title: "CSP Benchmarks",
})

export default async function CspBenchmarksPage() {
  const benchmarkFiles = await fetchAllCspBenchmarks()

  const benchmarkRows: CspBenchmarkRow[] = benchmarkFiles.flatMap((file) => {
    const { benchmarkId, data } = file

    if (Array.isArray(data)) {
      return data.map((item) => ({
        benchmarkId,
        ...item,
      })) as CspBenchmarkRow[]
    }

    // Fallback: if data is a single object, wrap it in an array
    console.warn(`Expected array but got object for ${benchmarkId}`)
    return [
      {
        benchmarkId,
        ...data,
      },
    ] as CspBenchmarkRow[]
  })

  return (
    <div className="mx-auto mt-2 max-w-screen-xl space-y-4 px-6">
      <span className="text-2xl">CSP benchmarks</span>
      <section className="w-full">
        {benchmarkRows.length === 0 ? (
          <div className="py-12 text-center text-body-secondary">
            No benchmark data available
          </div>
        ) : (
          <CspBenchmarksTable benchmarks={benchmarkRows} />
        )}
      </section>
    </div>
  )
}
