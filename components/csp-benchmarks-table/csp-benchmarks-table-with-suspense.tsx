import { Suspense } from "react"

import { CspBenchmarksTable } from "./csp-benchmarks-table"

import type { CspCollectedBenchmark } from "@/lib/api/csp-benchmarks"

interface CspBenchmarksTableWithSuspenseProps {
  className?: string
  benchmarks: CspCollectedBenchmark[]
}

export function CspBenchmarksTableWithSuspense({
  className,
  benchmarks,
}: CspBenchmarksTableWithSuspenseProps) {
  return (
    <Suspense fallback={<div>Loading table...</div>}>
      <CspBenchmarksTable className={className} benchmarks={benchmarks} />
    </Suspense>
  )
}
