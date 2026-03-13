import { CheckCheck } from "lucide-react"
import type { Metadata } from "next"

import { PageHeader } from "@/components/layout/page-header"
import { MissingProofsSection } from "@/components/status/missing-proofs-section"
import { MultiClusterMissesSection } from "@/components/status/multi-cluster-misses-section"
import { StatusSummaryCards } from "@/components/status/status-summary-cards"
import { UpToDateClustersSection } from "@/components/status/up-to-date-clusters-section"

import { fetchMissingProofsStatus } from "@/lib/api/status"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({ title: "status" })

export default async function StatusPage() {
  const statusData = await fetchMissingProofsStatus()

  const hasIssues = statusData.total_missing > 0
  const hasMultiClusterMisses = statusData.multi_cluster_misses.length > 0

  return (
    <div className="mx-auto max-w-screen-2xl px-6">
      <PageHeader title="status" description="monitor the situation" />

      <section className="mb-8">
        <StatusSummaryCards data={statusData} />
      </section>

      <div className="mb-4 text-xs text-muted-foreground">
        monitoring every 100th block from the last 6 hours
        {statusData.total_block_range.start &&
          statusData.total_block_range.end && (
            <span>
              {" "}
              &middot; block range #{statusData.total_block_range.start} - #
              {statusData.total_block_range.end}
            </span>
          )}
      </div>

      {hasIssues && (
        <section className="mb-8">
          <UpToDateClustersSection groups={statusData.perfect_by_prover_type} />
        </section>
      )}

      {!hasIssues && (
        <section className="mb-8">
          <div className="flex items-center gap-2 text-lg font-semibold text-primary">
            <CheckCheck className="size-5" />
            all clusters are up to date
          </div>
        </section>
      )}

      {hasMultiClusterMisses && (
        <section className="mb-8">
          <MultiClusterMissesSection
            misses={statusData.multi_cluster_misses}
            totalActiveClusters={statusData.total_active_clusters}
          />
        </section>
      )}

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
