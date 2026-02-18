import type { Metadata } from "next"

import type {
  RtpCohortCompositionData,
  RtpCohortPerformanceData,
  RtpProofTimeDistributionData,
} from "@/lib/types"

import { PageHeader } from "@/components/layout/page-header"
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner"
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

const COMPOSITION_RANGES = [7, 30, 90] as const
const CHART_DAY_RANGES = [1, 7, 30, 90] as const

export default async function Index() {
  const [rtpCohortRows, ...rangeResults] = await Promise.all([
    getRtpCohortScores(),
    ...COMPOSITION_RANGES.map((d) => getRtpCohortComposition(d)),
    ...CHART_DAY_RANGES.map((d) => getRtpCohortPerformance(d)),
    ...CHART_DAY_RANGES.map((d) => getRtpProofTimeDistribution(d)),
  ])

  const compositionByRange = Object.fromEntries(
    COMPOSITION_RANGES.map((d, i) => [
      d,
      rangeResults[i] as RtpCohortCompositionData,
    ])
  ) as Record<number, RtpCohortCompositionData>

  const perfOffset = COMPOSITION_RANGES.length
  const performanceByRange = Object.fromEntries(
    CHART_DAY_RANGES.map((d, i) => [
      d,
      rangeResults[perfOffset + i] as RtpCohortPerformanceData,
    ])
  ) as Record<number, RtpCohortPerformanceData>

  const distOffset = perfOffset + CHART_DAY_RANGES.length
  const distributionByRange = Object.fromEntries(
    CHART_DAY_RANGES.map((d, i) => [
      d,
      rangeResults[distOffset + i] as RtpProofTimeDistributionData,
    ])
  ) as Record<number, RtpProofTimeDistributionData>

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
        <h2 className="mb-4 text-xl font-semibold">RTP cohort</h2>
        <RtpCohortTable rows={rtpCohortRows} />
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2 2xl:grid-cols-3">
        <RtpCohortComposition dataByRange={compositionByRange} />
        <RtpCohortPerformance dataByRange={performanceByRange} />
        <div className="lg:col-span-2 2xl:col-span-1">
          <RtpProofTimeDistribution dataByRange={distributionByRange} />
        </div>
      </section>
    </div>
  )
}
