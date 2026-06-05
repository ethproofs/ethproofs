import { Suspense } from "react"
import type { Metadata } from "next"
import dynamicImport from "next/dynamic"

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { PageHeader } from "@/components/layout/page-header"
import { ChartCardSkeleton } from "@/components/metrics/chart-card-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { ZkvmSummaryCards } from "@/components/zkvms/zkvm-summary-cards"
import { ZkvmsTable } from "@/components/zkvms-table/zkvms-table"

import { getActiveClustersByZkvmIds } from "@/lib/api/clusters-by-zkvm"
import {
  fetchZkvmMilestones,
  fetchZkvmPerformanceTrajectory,
  fetchZkvmSummary,
} from "@/lib/api/zkvms-metrics"
import { getMetadata } from "@/lib/metadata"
import { getZkvmsMetricsByZkvmId } from "@/lib/metrics"
import { getZkvmsWithUsage } from "@/lib/zkvms"

const ZKVMS_TABLE_COLUMN_COUNT = 9

const ZkvmSecurityMilestonesChart = dynamicImport(
  () =>
    import("@/components/zkvms/zkvm-security-milestones-chart").then((mod) => ({
      default: mod.ZkvmSecurityMilestonesChart,
    })),
  { loading: () => <ChartCardSkeleton /> }
)

const ZkvmPerformanceTrajectoryChart = dynamicImport(
  () =>
    import("@/components/zkvms/zkvm-performance-trajectory-chart").then(
      (mod) => ({
        default: mod.ZkvmPerformanceTrajectoryChart,
      })
    ),
  { loading: () => <ChartCardSkeleton /> }
)

export const metadata: Metadata = getMetadata({ title: "zkVMs" })

export const dynamic = "force-dynamic"

export default function ZkvmsPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-6">
      <PageHeader
        title="zkVMs"
        description="track which proving systems are race-ready for mainnet-grade security"
      />

      <section className="mb-8">
        <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
          <ZkvmSummarySection />
        </Suspense>
      </section>

      <section className="mb-8 mt-8 grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2 2xl:col-span-1">
          <Suspense fallback={<ChartCardSkeleton />}>
            <ZkvmMilestonesSection />
          </Suspense>
        </div>
        <div className="lg:col-span-2 2xl:col-span-1">
          <Suspense fallback={<ChartCardSkeleton />}>
            <ZkvmTrajectorySection />
          </Suspense>
        </div>
      </section>

      <Suspense
        fallback={
          <>
            <section className="mb-8">
              <span className="text-lg font-semibold">zkVMs, active</span>
              <DataTableSkeleton
                className="mt-4"
                columns={ZKVMS_TABLE_COLUMN_COUNT}
                rows={8}
              />
            </section>
            <section className="mb-8">
              <span className="text-lg font-semibold">zkVMs, inactive</span>
              <DataTableSkeleton
                className="mt-4"
                columns={ZKVMS_TABLE_COLUMN_COUNT}
                rows={4}
              />
            </section>
          </>
        }
      >
        <ZkvmTablesSection />
      </Suspense>
    </div>
  )
}

async function ZkvmSummarySection() {
  const summaryData = await fetchZkvmSummary()
  return <ZkvmSummaryCards data={summaryData} />
}

async function ZkvmMilestonesSection() {
  const milestonesData = await fetchZkvmMilestones()
  return <ZkvmSecurityMilestonesChart data={milestonesData} />
}

async function ZkvmTrajectorySection() {
  const trajectoryData = await fetchZkvmPerformanceTrajectory()
  return <ZkvmPerformanceTrajectoryChart data={trajectoryData} />
}

async function ZkvmTablesSection() {
  const zkvms = await getZkvmsWithUsage()
  const zkvmIds = zkvms.map((zkvm) => zkvm.id)

  const [metricsByZkvmId, clustersByZkvmId] = await Promise.all([
    getZkvmsMetricsByZkvmId({ zkvmIds }),
    getActiveClustersByZkvmIds(zkvmIds),
  ])

  const sortedZkvms = zkvms.sort((a, b) => {
    const clusterDiff = b.activeClusters - a.activeClusters
    if (clusterDiff !== 0) return clusterDiff
    return a.name.localeCompare(b.name)
  })
  const activeZkvmsWithMetrics = sortedZkvms
    .filter((z) => z.activeClusters > 0)
    .map((zkvm) => ({
      ...zkvm,
      metrics: metricsByZkvmId.get(zkvm.id),
      clusters: clustersByZkvmId[zkvm.id] ?? [],
    }))
  const inactiveZkvms = sortedZkvms
    .filter((z) => z.activeClusters === 0)
    .map((zkvm) => ({
      ...zkvm,
      metrics: metricsByZkvmId.get(zkvm.id),
      clusters: [],
    }))

  return (
    <>
      <section className="mb-8">
        <span className="text-lg font-semibold">zkVMs, active</span>
        <ZkvmsTable className="mt-4" zkvms={activeZkvmsWithMetrics} />
      </section>

      <section className="mb-8">
        <span className="text-lg font-semibold">zkVMs, inactive</span>
        <ZkvmsTable className="mt-4" zkvms={inactiveZkvms} />
      </section>
    </>
  )
}
