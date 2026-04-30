import type { Metadata } from "next"

import { CohortComposition } from "@/components/cohorts/cohort-composition"
import { CohortPerformance } from "@/components/cohorts/cohort-performance"
import { CohortTable } from "@/components/cohorts/cohort-table/cohort-table"
import { EmptyCohortBanner } from "@/components/cohorts/empty-cohort-banner"
import { ProofTimeDistribution } from "@/components/cohorts/proof-time-distribution"
import { PageHeader } from "@/components/layout/page-header"
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner"
import { RtpDetailsSection } from "@/components/rtp/rtp-details-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import {
  getRtpCohortComposition,
  getRtpCohortIneligibleScores,
  getRtpCohortPerformance,
  getRtpCohortScores,
  getRtpProofTimeDistribution,
} from "@/lib/api/rtp"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export const dynamic = "force-dynamic"

const CURRENT_COHORT_DAYS = 7

export default async function RtpCohortPage() {
  const [
    rtpCohortRows,
    ineligibleRows,
    compositionData,
    performanceData,
    distributionData,
  ] = await Promise.all([
    getRtpCohortScores(),
    getRtpCohortIneligibleScores(),
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
        <Tabs defaultValue="eligible">
          <TabsList className="w-fit grid-cols-2">
            <TabsTrigger value="eligible">RTP cohort</TabsTrigger>
            <TabsTrigger value="ineligible">
              evaluated, not eligible
            </TabsTrigger>
          </TabsList>
          <TabsContent value="eligible">
            {rtpCohortRows.length === 0 ? (
              <EmptyCohortBanner />
            ) : (
              <CohortTable rows={rtpCohortRows} />
            )}
          </TabsContent>
          <TabsContent value="ineligible">
            {ineligibleRows.length === 0 ? (
              <p className="px-1 py-4 text-sm text-muted-foreground">
                no evaluated provers fell short of eligibility this week
              </p>
            ) : (
              <CohortTable rows={ineligibleRows} />
            )}
          </TabsContent>
        </Tabs>
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <CohortComposition data={compositionData} />
        <CohortPerformance data={performanceData} />
        <div className="lg:col-span-2 2xl:col-span-1">
          <ProofTimeDistribution data={distributionData} />
        </div>
      </section>
    </div>
  )
}
