"use client"

import { useMemo, useState } from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import { ChartCard, EmptyState, InputSizeSelector } from "./shared"
import {
  filterBenchmarks,
  getInputSizes,
  getProverKey,
  METRIC_CONFIGS,
  MetricKey,
} from "./utils"

import { Metrics } from "@/lib/api/csp-benchmarks"

interface CspBenchmarksBarProps {
  benchmarks: Metrics[]
  target?: "sha256" | "ecdsa"
}

interface MetricChartData {
  prover: string
  value: number
  fill: string
}

const CHART_CONFIG: ChartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
}

const CustomLabel = ({
  x,
  y,
  width,
  height,
  value,
  formatValue,
}: {
  x: number
  y: number
  width: number
  height: number
  value: number
  formatValue: (value: number) => string
}) => (
  <text
    x={x + width + 5}
    y={y + height / 2}
    fill="hsl(var(--foreground))"
    fontSize={11}
    textAnchor="start"
    dominantBaseline="middle"
  >
    {formatValue(value)}
  </text>
)

const METRICS: MetricKey[] = [
  "proof_duration",
  "peak_memory",
  "proof_size",
  "preprocessing_size",
]

export function CspBenchmarksBar({
  benchmarks,
  target = "sha256",
}: CspBenchmarksBarProps) {
  const availableInputSizes = useMemo(
    () => getInputSizes(benchmarks, target),
    [benchmarks, target]
  )

  const [selectedInputSize, setSelectedInputSize] = useState<number>(
    availableInputSizes[0] || 1024
  )

  // Update selected size when available sizes change
  useMemo(() => {
    if (
      availableInputSizes.length > 0 &&
      !availableInputSizes.includes(selectedInputSize)
    ) {
      setSelectedInputSize(availableInputSizes[0])
    }
  }, [availableInputSizes, selectedInputSize])

  const filteredData = useMemo(
    () => filterBenchmarks(benchmarks, target, selectedInputSize),
    [benchmarks, target, selectedInputSize]
  )

  const metricsData = useMemo(() => {
    return METRICS.map((metricKey) => ({
      key: metricKey,
      config: METRIC_CONFIGS[metricKey],
      data: filteredData
        .map((b) => ({
          prover: getProverKey(b),
          value: b[metricKey] as number,
          fill: "hsl(var(--primary))",
        }))
        .sort((a, b) => a.value - b.value),
    }))
  }, [filteredData])

  if (availableInputSizes.length === 0) {
    return <EmptyState message={`no ${target} benchmark data available`} />
  }

  if (filteredData.length === 0) {
    return (
      <EmptyState
        message={`no ${target} benchmark data available for input size ${selectedInputSize}`}
      />
    )
  }

  const renderBarChart = (
    title: string,
    data: MetricChartData[],
    formatValue: (value: number) => string,
    useLogScale: boolean = false
  ) => {
    const chartHeight = Math.min(Math.max(data.length * 40, 180), 350)

    return (
      <ChartCard
        title={title}
        height={chartHeight}
        label={target === "sha256" ? "sha-256" : "ecdsa"}
      >
        <ChartContainer config={CHART_CONFIG} className="h-full w-full">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 80, left: 20, bottom: 20 }}
          >
            <XAxis
              type="number"
              dataKey="value"
              hide
              scale={useLogScale ? "log" : "auto"}
              domain={useLogScale ? ["auto", "auto"] : undefined}
            />
            <YAxis
              dataKey="prover"
              type="category"
              tickLine={false}
              tickMargin={6}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  hideLabel
                  formatter={(value) => formatValue(value as number)}
                />
              }
            />
            <Bar
              dataKey="value"
              radius={5}
              label={(props) => (
                <CustomLabel {...props} formatValue={formatValue} />
              )}
            />
          </BarChart>
        </ChartContainer>
      </ChartCard>
    )
  }

  return (
    <div className="space-y-6">
      <InputSizeSelector
        sizes={availableInputSizes}
        selected={selectedInputSize}
        onSelect={setSelectedInputSize}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-4">
        <div className="flex w-full flex-col gap-4 lg:w-1/2">
          {metricsData.slice(0, 2).map(({ key, config, data }) => (
            <div key={key}>
              {renderBarChart(
                config.label,
                data,
                config.format,
                config.useLogScale
              )}
            </div>
          ))}
        </div>
        <div className="flex w-full flex-col gap-4 lg:w-1/2">
          {metricsData.slice(2).map(({ key, config, data }) => (
            <div key={key}>
              {renderBarChart(
                config.label,
                data,
                config.format,
                config.useLogScale
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
