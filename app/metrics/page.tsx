import type { Metadata } from "next"

import { ProofMetrics } from "@/components/proof-metrics"

import { getRecentSummary } from "@/lib/api/stats"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({
  title: "Metrics",
})

export const dynamic = "force-dynamic"

export default async function MetricsPage() {
  const recentSummary = await getRecentSummary()

  return (
    <div className="mx-auto mb-16 mt-2 flex max-w-screen-xl flex-col items-center px-6 [&>section]:w-full">
      <section id="proof-metrics">
        <span className="text-2xl">proof metrics</span>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
          <ProofMetrics recentSummary={recentSummary} />
        </div>
      </section>
    </div>
  )
}
