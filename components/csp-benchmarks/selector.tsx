"use client"

import { Suspense, useMemo } from "react"

import { CircuitContent } from "./circuit-content"
import { CircuitTabs } from "./circuit-tabs"
import type { CircuitTarget } from "./circuits"
import { RadarComparison } from "./radar"
import { EmptyState, InfoPopover } from "./shared"

import type { BenchmarkCollection, Metrics } from "@/lib/api/csp-benchmarks"

function deduplicateMetrics(metrics: Metrics[]): Metrics[] {
  const seen = new Set<string>()
  const result: Metrics[] = []
  for (const m of metrics) {
    const key = `${m.name}\0${m.feat ?? ""}\0${m.target}\0${m.input_size}`
    if (seen.has(key)) continue
    seen.add(key)
    result.push(m)
  }
  return result
}

interface SelectorProps {
  benchmarks: BenchmarkCollection[]
}

function SelectorInner({
  benchmarks,
}: SelectorProps) {
  const allMetrics = useMemo(
    () => deduplicateMetrics(benchmarks.flatMap((b) => b.data)),
    [benchmarks]
  )

  if (allMetrics.length === 0) {
    return <EmptyState message="no benchmark data available" />
  }

  return (
    <div className="space-y-12">
      <CircuitTabs
        renderTabContent={(target: CircuitTarget) => (
          <CircuitContent target={target} metrics={allMetrics} />
        )}
      />

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

export function Selector({
  benchmarks,
}: SelectorProps) {
  return (
    <Suspense fallback={null}>
      <SelectorInner benchmarks={benchmarks} />
    </Suspense>
  )
}
