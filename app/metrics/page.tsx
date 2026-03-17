import type { Metadata } from "next"
import dynamic from "next/dynamic"

import { PageHeader } from "@/components/layout/page-header"
import { ChartCardSkeleton } from "@/components/metrics/chart-card-skeleton"
import { MetricsSummaryCards } from "@/components/metrics/metrics-summary-cards"

import { getMetadata } from "@/lib/metadata"

const ProvingEfficiencyChart = dynamic(
  () =>
    import("@/components/metrics/proving-efficiency-chart").then((mod) => ({
      default: mod.ProvingEfficiencyChart,
    })),
  { loading: () => <ChartCardSkeleton /> }
)

const ProvingReliabilityChart = dynamic(
  () =>
    import("@/components/metrics/proving-reliability-chart").then((mod) => ({
      default: mod.ProvingReliabilityChart,
    })),
  { loading: () => <ChartCardSkeleton /> }
)

const GpuPriceIndexChart = dynamic(
  () =>
    import("@/components/metrics/gpu-price-index-chart").then((mod) => ({
      default: mod.GpuPriceIndexChart,
    })),
  { loading: () => <ChartCardSkeleton /> }
)

const PersonaComparisonChart = dynamic(
  () =>
    import("@/components/metrics/persona-comparison-chart").then((mod) => ({
      default: mod.PersonaComparisonChart,
    })),
  { loading: () => <ChartCardSkeleton /> }
)

export const metadata: Metadata = getMetadata({
  title: "metrics",
})

export default function MetricsPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-6">
      <PageHeader
        title="metrics"
        description="ecosystem-wide observability and historic trends at a glance"
      />

      <section className="mb-8">
        <MetricsSummaryCards />
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2 2xl:col-span-1">
          <ProvingEfficiencyChart />
        </div>
        <div className="lg:col-span-2 2xl:col-span-1">
          <ProvingReliabilityChart />
        </div>
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2 2xl:col-span-1">
          <GpuPriceIndexChart />
        </div>
        <div className="lg:col-span-2 2xl:col-span-1">
          <PersonaComparisonChart />
        </div>
      </section>
    </div>
  )
}
