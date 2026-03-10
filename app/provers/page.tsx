import type { Metadata } from "next"

import { PageHeader } from "@/components/layout/page-header"
import { PerformanceCostChart } from "@/components/provers/performance-cost-chart"
import { ProverSummaryCards } from "@/components/provers/prover-summary-cards"
import { ProversTabbedTable } from "@/components/provers/provers-tabbed-table"
import { RtpCohortConsistency } from "@/components/provers/rtp-cohort-consistency"

import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({ title: "provers" })

export default function ProversPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-6">
      <PageHeader
        title="provers"
        description="track prover operations, RTP cohort eligibility, and real-time reliability"
      />

      <section className="mb-8">
        <ProverSummaryCards />
      </section>

      <section className="mb-8">
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <RtpCohortConsistency />
          <PerformanceCostChart />
        </div>
      </section>

      <section className="mb-8">
        <ProversTabbedTable />
      </section>
    </div>
  )
}
