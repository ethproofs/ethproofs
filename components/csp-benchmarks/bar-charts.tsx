"use client"

import { useCallback, useMemo } from "react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart"
import { ChartContainer } from "@/components/ui/chart"

import { dataKeyToTarget, type DataTarget, formatInputSizeWithUnit } from "./circuits"
import { autoLogDomain, chartColors, chartMetrics, getProverKey, metricConfigs } from "./metrics"
import { ChartCard, EmptyState } from "./shared"

import type { Metrics } from "@/lib/api/csp-benchmarks"

const barHeightPerProver = 40
const barChartMinHeight = 120
const barChartMaxHeight = 400
const barChartVerticalPadding = 40
const barFontSize = 11
const barChartMargin = { top: 10, right: 70, left: 10, bottom: 10 }
const barYAxisTickStyle = { fontSize: barFontSize }

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

function isCustomLabelProps(props: Record<string, unknown>): props is Omit<CustomLabelProps, "formatValue"> {
  return (
    typeof props.x === "number" &&
    typeof props.y === "number" &&
    typeof props.width === "number" &&
    typeof props.height === "number" &&
    typeof props.value === "number"
  )
}

function CustomLabel({ x, y, width, height, value, formatValue }: CustomLabelProps) {
  return (
    <text
      x={x + width + 5}
      y={y + height / 2}
      fill="hsl(var(--foreground))"
      fontSize={barFontSize}
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

  const renderLabel = useCallback(
    (props: Record<string, unknown>) => {
      if (!isCustomLabelProps(props)) return <></>
      return <CustomLabel {...props} formatValue={formatValue} />
    },
    [formatValue]
  )

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
          margin={barChartMargin}
        >
          <XAxis
            type="number"
            dataKey="value"
            hide
            scale={shouldUseLogScale ? "log" : "auto"}
            domain={shouldUseLogScale ? autoLogDomain : undefined}
          />
          <YAxis
            dataKey="prover"
            type="category"
            tickLine={false}
            tickMargin={4}
            axisLine={false}
            tick={barYAxisTickStyle}
            width={90}
          />
          <Bar
            dataKey="value"
            radius={5}
            maxBarSize={40}
            isAnimationActive={false}
            label={renderLabel}
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

  const allMetricsData = useMemo(() => {
    return chartMetrics.map((metricKey) => ({
      key: metricKey,
      config: metricConfigs[metricKey],
      data: filteredData
        .flatMap((b) => {
          const raw = b[metricKey]
          if (typeof raw !== "number" || raw <= 0) return []
          const prover = getProverKey(b)
          return [{ prover, value: raw, fill: chartConfig[prover]?.color ?? chartColors[0] }]
        })
        .sort((a, b) => a.value - b.value),
    }))
  }, [filteredData, chartConfig])

  const metricsData = useMemo(() => {
    if (hiddenProvers.size === 0) return allMetricsData
    return allMetricsData.map((metric) => ({
      ...metric,
      data: metric.data.filter((d) => !hiddenProvers.has(d.prover)),
    }))
  }, [allMetricsData, hiddenProvers])

  if (filteredData.length === 0) {
    return (
      <EmptyState
        message={`no benchmark data available for input size ${selectedInputSize}`}
      />
    )
  }

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
            totalProvers={allProvers.length}
          />
        </div>
      ))}
    </div>
  )
}
