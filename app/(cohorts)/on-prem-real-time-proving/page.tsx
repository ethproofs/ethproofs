import type { Metadata } from "next"

import { CohortPerformance } from "@/components/cohorts/cohort-performance"
import { ProofTimeDistribution } from "@/components/cohorts/proof-time-distribution"
import { RtpCohortTabs } from "@/components/cohorts/rtp-cohort-tabs"
import { PageHeader } from "@/components/layout/page-header"

import {
  getRtpCohortIneligibleScores,
  getRtpCohortPerformance,
  getRtpCohortScores,
  getRtpProofTimeDistribution,
} from "@/lib/api/rtp"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({
  title: "1:1 on-prem cohort",
})

export const dynamic = "force-dynamic"

const CURRENT_COHORT_DAYS = 7
const IS_ON_PREM_ONLY = true

export default async function OnPremRtpCohortPage() {
  const [eligibleRows, ineligibleRows, performanceData, distributionData] =
    await Promise.all([
      getRtpCohortScores(IS_ON_PREM_ONLY),
      getRtpCohortIneligibleScores(IS_ON_PREM_ONLY),
      getRtpCohortPerformance(CURRENT_COHORT_DAYS, IS_ON_PREM_ONLY),
      getRtpProofTimeDistribution(CURRENT_COHORT_DAYS, IS_ON_PREM_ONLY),
    ])

  return (
    <div className="mx-auto max-w-screen-2xl px-6">
      <PageHeader
        title="on-prem real-time proving"
        description="performance and liveness metrics for all 1:1 multi-GPU on-prem provers, scored on every block by the real-time proving rules"
      />

      <section className="mb-8">
        <RtpCohortTabs
          eligibleRows={eligibleRows}
          ineligibleRows={ineligibleRows}
        />
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <CohortPerformance
          data={performanceData}
          title="1:1 on-prem prover performance"
        />
        <ProofTimeDistribution data={distributionData} />
      </section>
    </div>
  )
}
