"use client"

import { useQuery } from "@tanstack/react-query"

import type { ProverSummaryData } from "@/lib/types"

import { MetricCard } from "@/components/metric-card"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { formatNumber } from "@/lib/number"

function formatCompact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return formatNumber(value)
}

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

export function ProverSummaryCards() {
  const { data, isLoading } = useQuery<ProverSummaryData>({
    queryKey: ["provers-summary"],
    queryFn: async () => {
      const response = await fetch("/api/provers/summary")
      return response.json()
    },
  })

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <MetricCard
        label="active provers"
        value={String(data.totalProvers).padStart(2, "0")}
        isIncreasePositive
      />
      <MetricCard
        label="RTP cohort (current)"
        value={String(data.rtpEligibleCount).padStart(2, "0")}
        isIncreasePositive
      />
      <MetricCard
        label="proofs (7d)"
        value={formatCompact(data.totalProofs)}
        isIncreasePositive
      />
      <MetricCard
        label="avg performance"
        value={`${data.avgPerformance.toFixed(1)}%`}
        isIncreasePositive
      />
    </div>
  )
}
