"use client"

import { useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { cn } from "@/lib/utils"

import { BarCharts } from "./bar-charts"
import { type CircuitTarget, inputSizeSearchParam, getInputSizeUnit, targetToDataKey } from "./circuits"
import { LineCharts } from "./line-charts"
import { buildChartConfig, getInputSizes, getProverKey } from "./metrics"
import { ChartLegend, EmptyState, useSeriesSelection } from "./shared"
import { Table } from "./table"

import type { Metrics } from "@/lib/api/csp-benchmarks"

function getAllProverKeys(benchmarks: Metrics[]): string[] {
  const keySet = new Set<string>()
  benchmarks.forEach((b) => keySet.add(getProverKey(b)))
  return Array.from(keySet).sort()
}

interface CircuitContentProps {
  target: CircuitTarget
  metrics: Metrics[]
}

export function CircuitContent({
  target,
  metrics,
}: CircuitContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const dataKey = targetToDataKey[target]
  const filteredMetrics = useMemo(
    () => metrics.filter((m) => m.target === dataKey),
    [metrics, dataKey]
  )

  const allProvers = useMemo(
    () => getAllProverKeys(filteredMetrics),
    [filteredMetrics]
  )

  const chartConfig = useMemo(
    () => buildChartConfig(allProvers),
    [allProvers]
  )

  const { hidden: hiddenProvers, onToggle: handleToggleProver } = useSeriesSelection(allProvers)

  const availableInputSizes = useMemo(
    () => getInputSizes(filteredMetrics),
    [filteredMetrics]
  )

  const inputSizeParam = searchParams.get(inputSizeSearchParam)
  const parsedInputSize = inputSizeParam !== null ? Number(inputSizeParam) : NaN

  const selectedInputSize =
    !Number.isNaN(parsedInputSize) && availableInputSizes.includes(parsedInputSize)
      ? parsedInputSize
      : availableInputSizes[0] ?? 0

  const handleInputSizeChange = (size: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(inputSizeSearchParam, String(size))
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  if (filteredMetrics.length === 0) {
    return <EmptyState message={`no benchmark data available for ${target}`} />
  }

  return (
    <div className="space-y-8 px-4 pt-4 sm:space-y-12 sm:px-6 sm:pt-6">
      <div className="flex min-h-10 items-center gap-3">
        <span className="shrink-0 text-sm font-medium text-muted-foreground">
          {target === "ecdsa" ? "input" : getInputSizeUnit(dataKey)}
        </span>
        {target === "ecdsa" ? (
          <span className="text-sm">single signature</span>
        ) : availableInputSizes.length > 1 ? (
          <div className="flex items-center gap-1 overflow-x-auto">
            {availableInputSizes.map((size) => (
              <button
                key={size}
                type="button"
                className={cn(
                  "rounded-md px-2.5 py-1 text-sm transition-colors",
                  size === selectedInputSize
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => handleInputSizeChange(size)}
              >
                {size}
              </button>
            ))}
          </div>
        ) : (
          <span className="text-sm">{availableInputSizes[0]}</span>
        )}
      </div>

      <section>
        <h2 className="mb-4 text-lg sm:text-xl">comparison</h2>
        <BarCharts
          benchmarks={filteredMetrics}
          selectedInputSize={selectedInputSize}
          target={dataKey}
          hiddenProvers={hiddenProvers}
          allProvers={allProvers}
          chartConfig={chartConfig}
        />
      </section>

      <ChartLegend
        keys={allProvers}
        chartConfig={chartConfig}
        hiddenKeys={hiddenProvers}
        onToggle={handleToggleProver}
      />

      {target !== "ecdsa" && (
        <section>
          <h2 className="mb-4 text-lg sm:text-xl">scaling</h2>
          <LineCharts
            benchmarks={filteredMetrics}
            target={dataKey}
            hiddenSeries={hiddenProvers}
            onToggleSeries={handleToggleProver}
            seriesKeys={allProvers}
            chartConfig={chartConfig}
          />
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg sm:text-xl">all results</h2>
        <Table benchmarks={filteredMetrics} allBenchmarks={metrics} />
      </section>
    </div>
  )
}
