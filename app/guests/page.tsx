import type { Metadata } from "next"
import dynamicImport from "next/dynamic"

import { GuestProgramsTable } from "@/components/guest-programs-table/guest-programs-table"
import { GuestSummaryCard } from "@/components/guests/guest-summary-card"
import { PageHeader } from "@/components/layout/page-header"
import { ChartCardSkeleton } from "@/components/metrics/chart-card-skeleton"

import { getGuestProgramsWithUsage } from "@/lib/api/guest-programs"
import {
  fetchGuestDiversityTrend,
  fetchGuestSummary,
} from "@/lib/api/guests-metrics"
import { getMetadata } from "@/lib/metadata"

const GuestDiversityCurrentChart = dynamicImport(
  () =>
    import("@/components/guests/guest-diversity-current-chart").then((mod) => ({
      default: mod.GuestDiversityCurrentChart,
    })),
  { loading: () => <ChartCardSkeleton /> }
)

const GuestDiversityTrendChart = dynamicImport(
  () =>
    import("@/components/guests/guest-diversity-trend-chart").then((mod) => ({
      default: mod.GuestDiversityTrendChart,
    })),
  { loading: () => <ChartCardSkeleton /> }
)

export const metadata: Metadata = getMetadata({ title: "guests" })

export const dynamic = "force-dynamic"

export default async function GuestsPage() {
  const [guestPrograms, summaryData, trendData] = await Promise.all([
    getGuestProgramsWithUsage(),
    fetchGuestSummary(),
    fetchGuestDiversityTrend(),
  ])

  const totalActiveClusters = guestPrograms.reduce(
    (sum, program) => sum + program.activeClusters,
    0
  )

  const sortedPrograms = guestPrograms.sort((a, b) => {
    const clusterDiff = b.activeClusters - a.activeClusters
    if (clusterDiff !== 0) return clusterDiff
    return a.name.localeCompare(b.name)
  })

  const activePrograms = sortedPrograms.filter((p) => p.activeClusters > 0)
  const inactivePrograms = sortedPrograms.filter((p) => p.activeClusters === 0)

  return (
    <div className="mx-auto max-w-screen-2xl px-6">
      <PageHeader
        title="guests"
        description="track EVM implementation diversity for defense-in-depth resilience"
      />

      <section className="mb-8">
        <GuestSummaryCard data={summaryData} />
      </section>

      <section className="mb-8">
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <GuestDiversityCurrentChart data={summaryData.distribution} />
          <GuestDiversityTrendChart data={trendData} />
        </div>
      </section>

      <section className="mb-8">
        <span className="text-lg font-semibold">guests, active</span>
        <GuestProgramsTable
          className="mt-4"
          guestPrograms={activePrograms}
          totalActiveClusters={totalActiveClusters}
        />
      </section>

      {inactivePrograms.length > 0 && (
        <section className="mb-8">
          <span className="text-lg font-semibold">guests, inactive</span>
          <GuestProgramsTable
            className="mt-4"
            guestPrograms={inactivePrograms}
            totalActiveClusters={totalActiveClusters}
          />
        </section>
      )}
    </div>
  )
}
