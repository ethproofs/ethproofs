import type { Metadata } from "next"

import { CohortPerformance } from "@/components/cohorts/cohort-performance"
import { CohortTable } from "@/components/cohorts/cohort-table/cohort-table"
import { EmptyCohortBanner } from "@/components/cohorts/empty-cohort-banner"
import { ProofTimeDistribution } from "@/components/cohorts/proof-time-distribution"
import { PageHeader } from "@/components/layout/page-header"

import { OPP_PERFORMANCE_SCORE_THRESHOLD } from "@/lib/constants"

import {
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
  const [oppCohortRows, performanceData, distributionData] = await Promise.all([
    getOppCohortScores(),
    getOppCohortPerformance(CURRENT_COHORT_DAYS),
    getOppProofTimeDistribution(CURRENT_COHORT_DAYS),
  ])

  return (
    <div className="mx-auto max-w-screen-2xl px-6">
      <PageHeader
        title="on-prem proving initiative"
        description="performance and liveness metrics for all 1:10 multi-GPU on-prem provers"
      />

      <section className="mb-8">
        {oppCohortRows.length === 0 ? (
          <EmptyCohortBanner />
        ) : (
          <CohortTable rows={oppCohortRows} />
        )}
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <CohortPerformance
          data={performanceData}
          title="1:10 prover performance"
          performanceThreshold={OPP_PERFORMANCE_SCORE_THRESHOLD}
          thresholdLabel="sub-2m"
        />
        <ProofTimeDistribution
          data={distributionData}
          eligibleLabel={"≤2m (1:10 eligible)"}
          stunnerLabel=">2m (stunners)"
        />
      </section>
    </div>
  )
}
