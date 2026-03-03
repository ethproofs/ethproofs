import type { Metadata } from "next"
import dynamicImport from "next/dynamic"

import { PageHeader } from "@/components/layout/page-header"
import { ChartCardSkeleton } from "@/components/metrics/chart-card-skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

export default async function ZkvmsPage() {
  const zkvms = await getZkvmsWithUsage()
  const zkvmIds = zkvms.map((zkvm) => zkvm.id)

  const [
    metricsByZkvmId,
    clustersByZkvmId,
    summaryData,
    milestonesData,
    trajectoryData,
  ] = await Promise.all([
    getZkvmsMetricsByZkvmId({ zkvmIds }),
    getActiveClustersByZkvmIds(zkvmIds),
    fetchZkvmSummary(),
    fetchZkvmMilestones(),
    fetchZkvmPerformanceTrajectory(),
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
    <div className="mx-auto max-w-screen-2xl px-6">
      <PageHeader
        title="zkVMs"
        description="track which proving systems are race-ready for mainnet-grade security"
      />

      <section className="mb-8">
        <ZkvmSummaryCards data={summaryData} />
      </section>

      <section className="mb-8">
        <Tabs defaultValue="left">
          <div className="flex items-end justify-between gap-2">
            <TabsList className="border-none">
              <TabsTrigger
                className="flex-1 cursor-default border-none py-1 text-lg"
                value="left"
              >
                zkVMs, active
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 border-none py-1 text-lg"
                value="right"
              >
                inactive
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="left">
            <ZkvmsTable className="mt-4" zkvms={activeZkvmsWithMetrics} />

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <ZkvmSecurityMilestonesChart data={milestonesData} />
              <ZkvmPerformanceTrajectoryChart data={trajectoryData} />
            </div>
          </TabsContent>
          <TabsContent value="right">
            <ZkvmsTable className="mt-4" zkvms={inactiveZkvms} />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
