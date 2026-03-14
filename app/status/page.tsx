import type { Metadata } from "next"

import { PageHeader } from "@/components/layout/page-header"
import { BlocksMissedSection } from "@/components/status/blocks-missed-section"
import { ClusterHealthChart } from "@/components/status/cluster-health-chart"
import { MissingProofsSection } from "@/components/status/missing-proofs-section"

import { fetchMissingProofsStatus } from "@/lib/api/status"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({ title: "status" })

export default async function StatusPage() {
  const statusData = await fetchMissingProofsStatus()

  const hasIssues = statusData.total_missing > 0

  return (
    <div className="mx-auto max-w-screen-2xl px-6">
      <PageHeader title="status" description="monitor the situation" />

      <section className="mb-8">
        <ClusterHealthChart
          perfect={statusData.perfect_by_prover_type}
          missing={statusData.missing_by_prover_type}
          totalBlocksMonitored={statusData.total_blocks_monitored}
          totalMissing={statusData.total_missing}
          blockRange={statusData.total_block_range}
        />
      </section>

      <section className="mb-8">
        <BlocksMissedSection
          misses={statusData.multi_cluster_misses}
          totalActiveClusters={statusData.total_active_clusters}
        />
      </section>

      {hasIssues && (
        <section className="mb-8">
          <MissingProofsSection
            groups={statusData.missing_by_prover_type}
            totalMissing={statusData.total_missing}
          />
        </section>
      )}
    </div>
  )
}
