"use client"

import { memo, useCallback, useLayoutEffect, useMemo, useState } from "react"

import type { ChartConfig } from "@/components/ui/chart"

import { cn } from "@/lib/utils"

import { SystemDrawer } from "./system/drawer"
import type { SystemProperties } from "./system/properties"
import { BarCharts } from "./bar-charts"
import {
  type CircuitTarget,
  getInputSizeUnit,
  inputSizeSearchParam,
  targetToDataKey,
} from "./circuits"
import { LineCharts } from "./line-charts"
import { buildChartConfig, getAllProverKeys, getInputSizes } from "./metrics"
import { ChartLegend, EmptyState, useSeriesSelection } from "./shared"
import { SystemPropertiesTable } from "./system-properties-table"
import { Table } from "./table"

import type { Metrics } from "@/lib/api/csp-benchmarks"

interface ComparisonSectionProps {
  target: CircuitTarget
  filteredMetrics: Metrics[]
  hiddenProvers: Set<string>
  allProvers: string[]
  chartConfig: ChartConfig
  availableInputSizes: number[]
}

function ComparisonSection({
  target,
  filteredMetrics,
  hiddenProvers,
  allProvers,
  chartConfig,
  availableInputSizes,
}: ComparisonSectionProps) {
  const dataKey = targetToDataKey[target]
  const [selectedInputSize, setSelectedInputSize] = useState(
    availableInputSizes[0] ?? 0
  )

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get(inputSizeSearchParam)
    if (raw === null) return
    const parsed = Number(raw)
    if (!Number.isNaN(parsed) && availableInputSizes.includes(parsed)) {
      setSelectedInputSize(parsed)
    }
  }, [availableInputSizes])

  const isSelectedSizeValid = availableInputSizes.includes(selectedInputSize)
  const effectiveInputSize = isSelectedSizeValid
    ? selectedInputSize
    : (availableInputSizes[0] ?? 0)

  const handleSizeChange = useCallback((size: number) => {
    setSelectedInputSize(size)
    const params = new URLSearchParams(window.location.search)
    params.set(inputSizeSearchParam, String(size))
    window.history.replaceState(null, "", `?${params.toString()}`)
  }, [])

  return (
    <>
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
                  size === effectiveInputSize
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => handleSizeChange(size)}
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
          selectedInputSize={effectiveInputSize}
          target={dataKey}
          hiddenProvers={hiddenProvers}
          allProvers={allProvers}
          chartConfig={chartConfig}
        />
      </section>
    </>
  )
}

interface CircuitContentProps {
  target: CircuitTarget
  metrics: Metrics[]
}

export const CircuitContent = memo(function CircuitContent({
  target,
  metrics,
}: CircuitContentProps) {
  const dataKey = targetToDataKey[target]
  const filteredMetrics = useMemo(
    () => metrics.filter((m) => m.target === dataKey),
    [metrics, dataKey]
  )

  const allProvers = useMemo(
    () => getAllProverKeys(filteredMetrics),
    [filteredMetrics]
  )

  const chartConfig = useMemo(() => buildChartConfig(allProvers), [allProvers])

  const { hidden: hiddenProvers, onToggle: handleToggleProver } =
    useSeriesSelection(allProvers)

  const availableInputSizes = useMemo(
    () => getInputSizes(filteredMetrics),
    [filteredMetrics]
  )

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedSystem, setSelectedSystem] = useState<SystemProperties | null>(
    null
  )

  const handleOpenDrawer = useCallback((system: SystemProperties) => {
    setSelectedSystem(system)
    setDrawerOpen(true)
  }, [])

  if (filteredMetrics.length === 0) {
    return <EmptyState message={`no benchmark data available for ${target}`} />
  }

  return (
    <div className="space-y-8 px-4 pt-4 sm:space-y-12 sm:px-6 sm:pt-6">
      <ComparisonSection
        target={target}
        filteredMetrics={filteredMetrics}
        hiddenProvers={hiddenProvers}
        allProvers={allProvers}
        chartConfig={chartConfig}
        availableInputSizes={availableInputSizes}
      />

      <ChartLegend
        keys={allProvers}
        chartConfig={chartConfig}
        hiddenKeys={hiddenProvers}
        onToggle={handleToggleProver}
      />

      <section>
        <h2 className="mb-4 text-lg sm:text-xl">system properties</h2>
        <SystemPropertiesTable benchmarks={filteredMetrics} />
      </section>

      {target !== "ecdsa" && (
        <section>
          <h2 className="mb-4 text-lg sm:text-xl">trends</h2>
          <LineCharts
            benchmarks={filteredMetrics}
            target={dataKey}
            hiddenSeries={hiddenProvers}
            onToggleSeries={handleToggleProver}
            seriesKeys={allProvers}
            chartConfig={chartConfig}
            inputSizeCount={availableInputSizes.length}
          />
        </section>
      )}

      <section>
        <h2 className="mb-4 text-lg sm:text-xl">all results</h2>
        <Table
          benchmarks={filteredMetrics}
          allBenchmarks={metrics}
          onOpenDrawer={handleOpenDrawer}
        />
      </section>

      <SystemDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        system={selectedSystem}
      />
    </div>
  )
})
