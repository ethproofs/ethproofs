"use client"

import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import type { MetricsSummary } from "@/lib/types"

import { MetricCard } from "@/components/metrics/metric-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { formatNumber, formatUsd } from "@/lib/number"
import { prettyMs } from "@/lib/time"

const SUMMARY_RANGE_OPTIONS = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
] as const

type SummaryRangeDays = (typeof SUMMARY_RANGE_OPTIONS)[number]["days"]

function MetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-2">
        <Skeleton className="h-7 w-20" />
      </CardContent>
    </Card>
  )
}

interface SmallMetricCardProps {
  label: string
  value: string
}

function SmallMetricCard({ label, value }: SmallMetricCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <span className="truncate text-xs text-muted-foreground">{label}</span>
      </CardHeader>
      <CardContent className="flex items-end">
        <span className="text-2xl font-semibold">{value}</span>
      </CardContent>
    </Card>
  )
}

function SmallMetricCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-16" />
      </CardHeader>
      <CardContent className="flex items-end">
        <Skeleton className="h-8 w-10" />
      </CardContent>
    </Card>
  )
}

export function MetricsSummaryCards() {
  const [rangeDays, setRangeDays] = useState<SummaryRangeDays>(30)

  const { data, isLoading, isFetching } = useQuery<MetricsSummary>({
    queryKey: ["metrics-summary", rangeDays],
    queryFn: async () => {
      const response = await fetch(`/api/metrics/summary?days=${rangeDays}`)
      return response.json()
    },
    placeholderData: keepPreviousData,
  })

  return (
    <div
      className="space-y-4 transition-opacity duration-200"
      style={{ opacity: isFetching && !isLoading ? 0.6 : 1 }}
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading || !data ? (
          <>
            <div className="order-3 lg:order-none">
              <MetricCardSkeleton />
            </div>
            <div className="order-3 lg:order-none">
              <MetricCardSkeleton />
            </div>
            <div className="order-1 lg:order-none">
              <MetricCardSkeleton />
            </div>
            <div className="order-1 lg:order-none">
              <MetricCardSkeleton />
            </div>
            <div className="order-4 col-span-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:order-none">
              <SmallMetricCardSkeleton />
              <SmallMetricCardSkeleton />
              <SmallMetricCardSkeleton />
              <SmallMetricCardSkeleton />
            </div>
            <div className="order-2 lg:order-none">
              <MetricCardSkeleton />
            </div>
            <div className="order-2 lg:order-none">
              <MetricCardSkeleton />
            </div>
          </>
        ) : (
          <>
            <div className="order-3 lg:order-none">
              <MetricCard
                label="proven blocks"
                value={formatNumber(data.totalProvenBlocks)}
                change={data.blocksChange}
                isIncreasePositive
              />
            </div>
            <div className="order-3 lg:order-none">
              <MetricCard
                label="proofs submitted"
                value={formatNumber(data.totalProofs)}
                change={data.proofsChange}
                isIncreasePositive
              />
            </div>
            <div className="order-1 lg:order-none">
              <MetricCard
                label="avg latency / proof"
                value={prettyMs(data.multiGpu.avgLatency)}
                change={data.multiGpu.latencyChange}
                tag="1:1"
              />
            </div>
            <div className="order-1 lg:order-none">
              <MetricCard
                label="avg cost / proof"
                value={formatUsd(data.multiGpu.avgCost)}
                change={data.multiGpu.costChange}
                tag="1:1"
              />
            </div>
            <div className="order-4 col-span-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:order-none">
              <SmallMetricCard
                label="zkVMs"
                value={String(data.activeZkvmCount)}
              />
              <SmallMetricCard
                label="guests"
                value={String(data.activeGuestCount)}
              />
              <SmallMetricCard
                label="1:1 provers"
                value={String(data.multiGpuProverCount)}
              />
              <SmallMetricCard
                label="1:100 provers"
                value={String(data.singleGpuProverCount)}
              />
            </div>
            <div className="order-2 lg:order-none">
              <MetricCard
                label="avg latency / proof"
                value={prettyMs(data.singleGpu.avgLatency)}
                change={data.singleGpu.latencyChange}
                tag="1:100"
              />
            </div>
            <div className="order-2 lg:order-none">
              <MetricCard
                label="avg cost / proof"
                value={formatUsd(data.singleGpu.avgCost)}
                change={data.singleGpu.costChange}
                tag="1:100"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end">
        <div className="flex gap-1 rounded-lg border border-border p-1">
          {SUMMARY_RANGE_OPTIONS.map((option) => (
            <Button
              key={option.days}
              onClick={() => setRangeDays(option.days)}
              size="sm"
              variant={rangeDays === option.days ? "default" : "ghost"}
              className="h-7 px-3 text-xs"
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
