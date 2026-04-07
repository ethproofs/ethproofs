import type { Metadata } from "next"

import { EmptyCohortBanner } from "@/components/cohorts/empty-cohort-banner"
import { RtpCohortComposition } from "@/components/rtp/rtp-cohort-composition"
import { RtpCohortPerformance } from "@/components/rtp/rtp-cohort-performance"
import { RtpDetailsSection } from "@/components/rtp/rtp-details-section"
import { RtpProofTimeDistribution } from "@/components/rtp/rtp-proof-time-distribution"
import { RtpCohortTable } from "@/components/rtp-cohort-table/rtp-cohort-table"

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

export default async function RtpCohortPage() {
  const [rtpCohortRows, compositionData, performanceData, distributionData] =
    await Promise.all([
      getRtpCohortScores(),
      getRtpCohortComposition(),
      getRtpCohortPerformance(CURRENT_COHORT_DAYS),
      getRtpProofTimeDistribution(CURRENT_COHORT_DAYS),
    ])

  return (
    <>
      <section className="mb-8">
        <RtpDetailsSection />
      </section>

      <section className="mb-8">
        {rtpCohortRows.length === 0 ? (
          <EmptyCohortBanner />
        ) : (
          <RtpCohortTable rows={rtpCohortRows} />
        )}
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <RtpCohortComposition data={compositionData} />
        <RtpCohortPerformance data={performanceData} />
        <div className="lg:col-span-2 2xl:col-span-1">
          <RtpProofTimeDistribution data={distributionData} />
        </div>
      </section>
    </>
  )
}
