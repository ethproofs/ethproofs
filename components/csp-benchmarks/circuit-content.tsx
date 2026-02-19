"use client"

import { useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { BarCharts } from "./bar-charts"
import { type CircuitTarget, getInputSizeUnit, targetToDataKey } from "./circuits"
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

  const inputSizeParam = searchParams.get("inputSize")
  const parsedInputSize = inputSizeParam !== null ? Number(inputSizeParam) : NaN

  const selectedInputSize =
    !Number.isNaN(parsedInputSize) && availableInputSizes.includes(parsedInputSize)
      ? parsedInputSize
      : availableInputSizes[0] ?? 0

  const handleInputSizeChange = (size: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("inputSize", String(size))
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  if (filteredMetrics.length === 0) {
    return <EmptyState message={`no benchmark data available for ${target}`} />
  }

  return (
    <div className="space-y-8 px-4 sm:space-y-12 sm:px-6">
      {target === "ecdsa" ? (
        <span className="text-sm font-medium">single signature</span>
      ) : availableInputSizes.length > 1 ? (
        <Tabs value={String(selectedInputSize)} onValueChange={(v) => handleInputSizeChange(Number(v))}>
          <div className="relative flex items-center justify-center gap-4 sm:justify-between">
            <span className="hidden shrink-0 text-sm font-medium sm:block">{getInputSizeUnit(dataKey)}</span>
            <div className="overflow-x-auto">
              <TabsList className="h-auto p-0.5">
                {availableInputSizes.map((size) => (
                  <TabsTrigger
                    key={size}
                    className="px-3 py-1.5 text-sm data-[state=active]:text-primary"
                    value={String(size)}
                  >
                    {size}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
        </Tabs>
      ) : (
        <span className="text-sm font-medium">
          {getInputSizeUnit(dataKey)} {availableInputSizes[0]}
        </span>
      )}

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
