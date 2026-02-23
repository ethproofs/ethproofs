"use client"

import { useMemo } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import type { ChartConfig } from "@/components/ui/chart"
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"

import { dataKeyToTarget, type DataTarget, formatInputSizeWithUnit } from "./circuits"
import { chartMetrics, getInputSizes, getProverKey, metricConfigs,type MetricKey } from "./metrics"
import { ChartCard, ChartLegend, ChartTooltipBody, EmptyState } from "./shared"

import type { Metrics } from "@/lib/api/csp-benchmarks"
import { formatBytes } from "@/lib/number"
import { prettyMs } from "@/lib/time"

interface LineChartsProps {
  benchmarks: Metrics[]
  target?: DataTarget
  hiddenSeries: Set<string>
  onToggleSeries(key: string): void
  seriesKeys: string[]
  chartConfig: ChartConfig
}

interface ChartDataPoint {
  input_size: number
  [key: string]: number | string
}

const durationMetrics: ReadonlySet<MetricKey> = new Set<MetricKey>([
  "proof_duration",
  "verify_duration",
])

function generateYAxisTicks(
  min: number,
  max: number,
  isBytes: boolean
): number[] {
  if (min === max) return [min]

  const KB = 1024
  const MB = KB * 1024
  const GB = MB * 1024
  const TB = GB * 1024

  const US = 1_000
  const MS = 1_000_000
  const S = 1_000_000_000

  const magnitudes = isBytes
    ? [
        1,
        10,
        100,
        KB,
        10 * KB,
        100 * KB,
        MB,
        10 * MB,
        100 * MB,
        GB,
        10 * GB,
        100 * GB,
        TB,
      ]
    : [
        US,
        10 * US,
        100 * US,
        MS,
        10 * MS,
        100 * MS,
        S,
        10 * S,
        100 * S,
        1000 * S,
      ]

  let valid = magnitudes.filter((m) => m >= min && m <= max)
  if (valid.length === 0) return [min, max]

  while (valid.length < 4) {
    const firstIdx = magnitudes.indexOf(valid[0])
    const lastIdx = magnitudes.indexOf(valid[valid.length - 1])

    if (firstIdx > 0) valid = [magnitudes[firstIdx - 1], ...valid]
    else if (lastIdx < magnitudes.length - 1)
      valid = [...valid, magnitudes[lastIdx + 1]]
    else break
  }

  if (valid.length <= 4) return valid

  const step = (valid.length - 1) / 3
  return [
    valid[0],
    valid[Math.round(step)],
    valid[Math.round(2 * step)],
    valid[valid.length - 1],
  ]
}

interface LineMetricChartProps {
  title: string
  description: string
  data: ChartDataPoint[]
  chartConfig: ChartConfig
  seriesKeys: string[]
  hiddenSeries: Set<string>
  onToggleSeries(key: string): void
  target: DataTarget
  formatValue(value: number): string
  isBytes: boolean
  label?: string
  ariaLabel?: string
}

function LineMetricChart({
  title,
  description,
  data,
  chartConfig,
  seriesKeys,
  hiddenSeries,
  onToggleSeries,
  target,
  formatValue,
  isBytes,
  label,
  ariaLabel,
}: LineMetricChartProps) {
  const allValues = data.flatMap((point) =>
    Object.entries(point)
      .filter(([key]) => key !== "input_size")
      .flatMap(([, value]) =>
        typeof value === "number" && value > 0 ? [value] : []
      )
  )
  if (allValues.length === 0) return null
  const minValue = allValues.reduce((acc, v) => Math.min(acc, v), Infinity)
  const maxValue = allValues.reduce((acc, v) => Math.max(acc, v), -Infinity)
  const ticks = generateYAxisTicks(minValue, maxValue, isBytes)

  const tooltipFormatter = (value: number) => {
    if (isBytes) {
      return formatBytes(value, 2)
    }
    return prettyMs(value / 1_000_000, {
      keepDecimalsOnWholeSeconds: false,
      unitCount: 1,
    })
  }

  const legendFooter = (
    <ChartLegend
      keys={seriesKeys}
      chartConfig={chartConfig}
      hiddenKeys={hiddenSeries}
      onToggle={onToggleSeries}
      className="mt-3"
    />
  )

  return (
    <ChartCard title={title} description={description} height="auto" label={label} ariaLabel={ariaLabel} footer={legendFooter}>
      <ChartContainer config={chartConfig} className="h-[300px] w-full md:h-[400px]">
        <LineChart
          accessibilityLayer
          data={data}
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="input_size"
            tick={{ fontSize: 12 }}
            tickMargin={6}
            tickFormatter={(value) =>
              typeof value === "number"
                ? formatInputSizeWithUnit(value, target)
                : String(value)
            }
          />
          <YAxis
            scale="log"
            domain={["auto", "auto"]}
            tick={{ fontSize: 12 }}
            tickMargin={6}
            type="number"
            ticks={ticks}
            tickFormatter={(value) =>
              typeof value === "number" ? formatValue(value) : String(value)
            }
          />
          <ChartTooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null
              return (
                <ChartTooltipBody
                  entries={payload}
                  formatValue={tooltipFormatter}
                />
              )
            }}
          />
          {seriesKeys
            .filter((key) => !hiddenSeries.has(key))
            .map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartConfig[key]?.color}
                dot={false}
                connectNulls
                isAnimationActive={false}
                strokeWidth={2.5}
              />
            ))}
        </LineChart>
      </ChartContainer>
    </ChartCard>
  )
}

export function LineCharts({
  benchmarks,
  target = "sha256",
  hiddenSeries,
  onToggleSeries,
  seriesKeys,
  chartConfig,
}: LineChartsProps) {
  const uniqueInputSizes = useMemo(
    () => getInputSizes(benchmarks).length,
    [benchmarks]
  )

  const metricsData = useMemo(() => {
    return chartMetrics.map((metricKey) => {
      const grouped = new Map<number, Map<string, number>>()

      benchmarks.forEach((benchmark) => {
        const inputSize = benchmark.input_size
        const metricValue = benchmark[metricKey]

        if (typeof metricValue !== "number" || metricValue <= 0) return

        const key = getProverKey(benchmark)

        if (!grouped.has(inputSize)) {
          grouped.set(inputSize, new Map())
        }

        grouped.get(inputSize)?.set(key, metricValue)
      })

      const data: ChartDataPoint[] = Array.from(grouped.entries())
        .sort(([sizeA], [sizeB]) => sizeA - sizeB)
        .map(([inputSize, metrics]) => ({
          input_size: inputSize,
          ...Object.fromEntries(metrics),
        }))

      return {
        key: metricKey,
        config: metricConfigs[metricKey],
        data,
      }
    })
  }, [benchmarks])

  if (benchmarks.length === 0) {
    return <EmptyState message={`no benchmark data available for ${target}`} />
  }

  if (uniqueInputSizes <= 1) {
    const message =
      target === "ecdsa"
        ? "ECDSA uses a single fixed input size of 32 bytes, trend comparison not applicable"
        : "trends require multiple input sizes"
    return <EmptyState message={message} />
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {metricsData.map(({ key, config, data }) => (
        <LineMetricChart
          key={key}
          title={config.label}
          description={config.description}
          data={data}
          chartConfig={chartConfig}
          seriesKeys={seriesKeys}
          hiddenSeries={hiddenSeries}
          onToggleSeries={onToggleSeries}
          target={target}
          formatValue={config.format}
          isBytes={!durationMetrics.has(key)}
          label={dataKeyToTarget[target]}
          ariaLabel={`${config.label} trend`}
        />
      ))}
    </div>
  )
}
