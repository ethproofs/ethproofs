"use client"

import { useCallback, useMemo } from "react"
import { uniqueBy } from "remeda"

import { CircuitContent } from "./circuit-content"
import { CircuitTabs } from "./circuit-tabs"
import type { CircuitTarget } from "./circuits"
import { RadarComparison } from "./radar"
import { EmptyState, InfoPopover } from "./shared"

import type { BenchmarkCollection } from "@/lib/api/csp-benchmarks"

interface SelectorProps {
  benchmarks: BenchmarkCollection[]
}

export function Selector({
  benchmarks,
}: SelectorProps) {
  const allMetrics = useMemo(
    () => uniqueBy(
      benchmarks.flatMap((b) => b.data),
      (m) => `${m.name}\0${m.feat ?? ""}\0${m.target}\0${m.input_size}`
    ),
    [benchmarks]
  )

  const renderTabContent = useCallback(
    (target: CircuitTarget) => (
      <CircuitContent target={target} metrics={allMetrics} />
    ),
    [allMetrics]
  )

  if (allMetrics.length === 0) {
    return <EmptyState message="no benchmark data available" />
  }

  return (
    <div className="space-y-12">
      <CircuitTabs renderTabContent={renderTabContent} />

      <section className="px-4 sm:px-6">
        <div className="mb-4">
          <InfoPopover
            trigger={<h2 className="text-lg sm:text-xl">aggregated results</h2>}
          >
            <p>
              percentile-ranked comparison across all circuits and input sizes
              (larger area is better)
            </p>
          </InfoPopover>
        </div>
        <RadarComparison benchmarks={allMetrics} />
      </section>
    </div>
  )
}
