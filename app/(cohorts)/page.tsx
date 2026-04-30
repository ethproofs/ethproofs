import type { Metadata } from "next"

import { CohortComposition } from "@/components/cohorts/cohort-composition"
import { CohortPerformance } from "@/components/cohorts/cohort-performance"
import { CohortTable } from "@/components/cohorts/cohort-table/cohort-table"
import { EmptyCohortBanner } from "@/components/cohorts/empty-cohort-banner"
import { ProofTimeDistribution } from "@/components/cohorts/proof-time-distribution"
import { RtpDetailsSection } from "@/components/rtp/rtp-details-section"

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
          <CohortTable rows={rtpCohortRows} />
        )}
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <CohortComposition data={compositionData} />
        <CohortPerformance data={performanceData} />
        <div className="lg:col-span-2 2xl:col-span-1">
          <ProofTimeDistribution data={distributionData} />
        </div>
      </section>
    </>
  )
}
