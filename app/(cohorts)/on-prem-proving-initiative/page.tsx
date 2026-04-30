import type { Metadata } from "next"

import { CohortComposition } from "@/components/cohorts/cohort-composition"
import { CohortPerformance } from "@/components/cohorts/cohort-performance"
import { CohortTable } from "@/components/cohorts/cohort-table/cohort-table"
import { EmptyCohortBanner } from "@/components/cohorts/empty-cohort-banner"
import { ProofTimeDistribution } from "@/components/cohorts/proof-time-distribution"
import { OppDetailsSection } from "@/components/opp/opp-details-section"

import { OPP_PERFORMANCE_SCORE_THRESHOLD } from "@/lib/constants"

import {
  getOppCohortComposition,
  getOppCohortPerformance,
  getOppCohortScores,
  getOppProofTimeDistribution,
} from "@/lib/api/opp"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({
  title: "1:10 cohort",
})

export const dynamic = "force-dynamic"

const CURRENT_COHORT_DAYS = 7

export default async function OppCohortPage() {
  const [oppCohortRows, compositionData, performanceData, distributionData] =
    await Promise.all([
      getOppCohortScores(),
      getOppCohortComposition(),
      getOppCohortPerformance(CURRENT_COHORT_DAYS),
      getOppProofTimeDistribution(CURRENT_COHORT_DAYS),
    ])

  return (
    <>
      <section className="mb-8">
        <OppDetailsSection />
      </section>

      <section className="mb-8">
        {oppCohortRows.length === 0 ? (
          <EmptyCohortBanner />
        ) : (
          <CohortTable rows={oppCohortRows} />
        )}
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <CohortComposition
          data={compositionData}
          description="weekly eligibility for all evaluated 1:10 on-prem provers"
        />
        <CohortPerformance
          data={performanceData}
          title="1:10 prover performance"
          performanceThreshold={OPP_PERFORMANCE_SCORE_THRESHOLD}
          thresholdLabel="sub-2m"
        />
        <div className="lg:col-span-2 2xl:col-span-1">
          <ProofTimeDistribution
            data={distributionData}
            eligibleLabel={"\u22642m (1:10 eligible)"}
            stunnerLabel=">2m (stunners)"
          />
        </div>
      </section>
    </>
  )
}
