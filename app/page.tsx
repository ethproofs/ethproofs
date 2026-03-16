import type { Metadata } from "next"

import { PageHeader } from "@/components/layout/page-header"
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner"
import { RtpCohortComposition } from "@/components/rtp/rtp-cohort-composition"
import { RtpCohortPerformance } from "@/components/rtp/rtp-cohort-performance"
import { RtpDetailsSection } from "@/components/rtp/rtp-details-section"
import { RtpProofTimeDistribution } from "@/components/rtp/rtp-proof-time-distribution"
import { RtpCohortTabbedTable } from "@/components/rtp-cohort-table/rtp-cohort-tabbed-table"

import {
  getRtpCohortComposition,
  getRtpCohortPerformance,
  getRtpCohortScores,
  getRtpProofTimeDistribution,
} from "@/lib/api/rtp"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export const dynamic = "force-dynamic"

const CURRENT_COHORT_DAYS = 7

export default async function Index() {
  const [rtpCohortRows, compositionData, performanceData, distributionData] =
    await Promise.all([
      getRtpCohortScores(),
      getRtpCohortComposition(),
      getRtpCohortPerformance(CURRENT_COHORT_DAYS),
      getRtpProofTimeDistribution(CURRENT_COHORT_DAYS),
    ])

  return (
    <div className="mx-auto max-w-screen-2xl px-6">
      <PageHeader
        title={
          <>
            race to{" "}
            <span className="font-heading text-primary">mainnet-grade</span> L1
            zkEVMs
          </>
        }
        description="learn about the rules to the race and watch it unfold in real-time"
      />

      <section className="mb-8">
        <RoadmapBanner />
      </section>

      <section className="mb-8">
        <RtpDetailsSection />
      </section>

      <section className="mb-8">
        <RtpCohortTabbedTable rows={rtpCohortRows} />
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <RtpCohortComposition data={compositionData} />
        <RtpCohortPerformance data={performanceData} />
        <div className="lg:col-span-2 2xl:col-span-1">
          <RtpProofTimeDistribution data={distributionData} />
        </div>
      </section>
    </div>
  )
}
