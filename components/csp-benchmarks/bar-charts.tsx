"use client"

import { useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart"
import { ChartContainer } from "@/components/ui/chart"

import { dataKeyToTarget, type DataTarget, formatInputSizeWithUnit } from "./circuits"
import { chartColors, chartMetrics, getProverKey, metricConfigs } from "./metrics"
import { ChartCard, EmptyState } from "./shared"

import type { Metrics } from "@/lib/api/csp-benchmarks"

const barHeightPerProver = 40
const barChartMinHeight = 120
const barChartMaxHeight = 400
const barChartVerticalPadding = 40

function computeBarChartHeight(visibleCount: number): number {
  const contentHeight = visibleCount * barHeightPerProver + barChartVerticalPadding
  return Math.min(Math.max(contentHeight, barChartMinHeight), barChartMaxHeight)
}

interface BarChartsProps {
  benchmarks: Metrics[]
  selectedInputSize: number
  target?: DataTarget
  hiddenProvers: Set<string>
  allProvers: string[]
  chartConfig: ChartConfig
}

interface MetricChartData {
  prover: string
  value: number
  fill: string
}

interface CustomLabelProps {
  x: number
  y: number
  width: number
  height: number
  value: number
  formatValue(value: number): string
}

function CustomLabel({ x, y, width, height, value, formatValue }: CustomLabelProps) {
  return (
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
}

interface BarMetricChartProps {
  title: string
  description: string
  data: MetricChartData[]
  chartConfig: ChartConfig
  formatValue(value: number): string
  shouldUseLogScale?: boolean
  label?: string
  ariaLabel?: string
  totalProvers: number
}

function BarMetricChart({
  title,
  description,
  data,
  chartConfig,
  formatValue,
  shouldUseLogScale = false,
  label,
  ariaLabel,
  totalProvers,
}: BarMetricChartProps) {
  const chartHeight = computeBarChartHeight(totalProvers)

  return (
    <ChartCard
      title={title}
      description={description}
      height={chartHeight}
      label={label}
      ariaLabel={ariaLabel}
    >
      <ChartContainer config={chartConfig} className="h-full w-full [&_.recharts-cartesian-axis-tick_text]:fill-foreground">
        <BarChart
          accessibilityLayer
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 70, left: 10, bottom: 10 }}
        >
          <XAxis
            type="number"
            dataKey="value"
            hide
            scale={shouldUseLogScale ? "log" : "auto"}
            domain={shouldUseLogScale ? ["auto", "auto"] : undefined}
          />
          <YAxis
            dataKey="prover"
            type="category"
            tickLine={false}
            tickMargin={4}
            axisLine={false}
            tick={{ fontSize: 11 }}
            width={90}
          />
          <Bar
            dataKey="value"
            radius={5}
            maxBarSize={40}
            isAnimationActive={false}
            label={(props) => (
              <CustomLabel {...props} formatValue={formatValue} />
            )}
          />
        </BarChart>
      </ChartContainer>
    </ChartCard>
  )
}

export function BarCharts({
  benchmarks,
  selectedInputSize,
  target = "sha256",
  hiddenProvers,
  allProvers,
  chartConfig,
}: BarChartsProps) {
  const filteredData = useMemo(
    () => benchmarks.filter((b) => b.input_size === selectedInputSize),
    [benchmarks, selectedInputSize]
  )

  const metricsData = useMemo(() => {
    return chartMetrics.map((metricKey) => ({
      key: metricKey,
      config: metricConfigs[metricKey],
      data: filteredData
        .flatMap((b) => {
          const raw = b[metricKey]
          if (typeof raw !== "number" || raw <= 0) return []
          const prover = getProverKey(b)
          if (hiddenProvers.has(prover)) return []
          return [{ prover, value: raw, fill: chartConfig[prover]?.color ?? chartColors[0] }]
        })
        .sort((a, b) => a.value - b.value),
    }))
  }, [filteredData, chartConfig, hiddenProvers])

  if (filteredData.length === 0) {
    return (
      <EmptyState
        message={`no benchmark data available for input size ${selectedInputSize}`}
      />
    )
  }

  const visibleProverCount = allProvers.filter((p) => !hiddenProvers.has(p)).length

  const chartLabel = target === "ecdsa"
    ? "ecdsa"
    : `${dataKeyToTarget[target]} · ${formatInputSizeWithUnit(selectedInputSize, target)}`

  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
      {metricsData.map(({ key, config, data }, index) => (
        <div
          key={key}
          className={index === metricsData.length - 1 ? "sm:col-span-2" : undefined}
        >
          <BarMetricChart
            title={config.label}
            description={config.description}
            data={data}
            chartConfig={chartConfig}
            formatValue={config.format}
            shouldUseLogScale={config.shouldUseLogScale}
            label={chartLabel}
            ariaLabel={`${config.label} comparison`}
            totalProvers={visibleProverCount}
          />
        </div>
      ))}
    </div>
  )
}
