"use client"

import { useCallback, useMemo } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { entries } from "remeda"

import type { ChartConfig } from "@/components/ui/chart"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"

import {
  dataKeyToTarget,
  type DataTarget,
  formatInputSizeWithUnit,
} from "./circuits"
import {
  autoLogDomain,
  chartMetrics,
  getProverKey,
  metricConfigs,
  nanosecondsPerMillisecond,
} from "./metrics"
import {
  ChartCard,
  ChartLegend,
  ChartTooltipBody,
  type ChartTooltipBodyEntry,
  EmptyState,
} from "./shared"

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
  inputSizeCount: number
}

interface ChartDataPoint {
  input_size: number
  [key: string]: number | string
}

const lineChartMargin = { top: 20, right: 20, left: 20, bottom: 20 }
const axisTickStyle = { fontSize: 12 }
const tooltipCursorStyle = { strokeDasharray: "3 3" }

function generateYAxisTicks(
  min: number,
  max: number,
  isBytes: boolean
): number[] {
  if (min === max) return [min]

  const kb = 1024
  const mb = kb * 1024
  const gb = mb * 1024
  const tb = gb * 1024

  const us = 1_000
  const ms = 1_000_000
  const sec = 1_000_000_000

  const magnitudes = isBytes
    ? [
        1,
        10,
        100,
        kb,
        10 * kb,
        100 * kb,
        mb,
        10 * mb,
        100 * mb,
        gb,
        10 * gb,
        100 * gb,
        tb,
      ]
    : [
        us,
        10 * us,
        100 * us,
        ms,
        10 * ms,
        100 * ms,
        sec,
        10 * sec,
        100 * sec,
        1000 * sec,
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
  const ticks = useMemo(() => {
    const allValues = data.flatMap((point) =>
      entries(point)
        .filter(([key]) => key !== "input_size")
        .flatMap(([, value]) =>
          typeof value === "number" && value > 0 ? [value] : []
        )
    )
    if (allValues.length === 0) return null
    const minValue = allValues.reduce((acc, v) => Math.min(acc, v), Infinity)
    const maxValue = allValues.reduce((acc, v) => Math.max(acc, v), -Infinity)
    return generateYAxisTicks(minValue, maxValue, isBytes)
  }, [data, isBytes])

  const tooltipFormatter = useCallback(
    (value: number) => {
      if (isBytes) {
        return formatBytes(value, 2)
      }
      return prettyMs(value / nanosecondsPerMillisecond, {
        keepDecimalsOnWholeSeconds: false,
        unitCount: 1,
      })
    },
    [isBytes]
  )

  const xAxisTickFormatter = useCallback(
    (value: unknown) =>
      typeof value === "number"
        ? formatInputSizeWithUnit(value, target)
        : String(value),
    [target]
  )

  const yAxisTickFormatter = useCallback(
    (value: unknown) =>
      typeof value === "number" ? formatValue(value) : String(value),
    [formatValue]
  )

  const tooltipContent = useCallback(
    ({
      active,
      payload,
    }: {
      active?: boolean
      payload?: ReadonlyArray<ChartTooltipBodyEntry>
    }) => {
      if (!active || !payload || payload.length === 0) return null
      return (
        <ChartTooltipBody entries={payload} formatValue={tooltipFormatter} />
      )
    },
    [tooltipFormatter]
  )

  if (ticks === null) return null

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
    <ChartCard
      title={title}
      description={description}
      height="auto"
      label={label}
      ariaLabel={ariaLabel}
      footer={legendFooter}
    >
      <ChartContainer
        config={chartConfig}
        className="h-[300px] w-full md:h-[400px]"
      >
        <LineChart accessibilityLayer data={data} margin={lineChartMargin}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="input_size"
            tick={axisTickStyle}
            tickMargin={6}
            tickFormatter={xAxisTickFormatter}
          />
          <YAxis
            scale="log"
            domain={autoLogDomain}
            tick={axisTickStyle}
            tickMargin={6}
            type="number"
            ticks={ticks}
            tickFormatter={yAxisTickFormatter}
          />
          <ChartTooltip cursor={tooltipCursorStyle} content={tooltipContent} />
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
  inputSizeCount,
}: LineChartsProps) {
  const metricsData = useMemo(() => {
    if (inputSizeCount <= 1) return []

    return chartMetrics.map((metricKey) => {
      const grouped = new Map<number, Map<string, number>>()

      for (const benchmark of benchmarks) {
        const inputSize = benchmark.input_size
        const metricValue = benchmark[metricKey]

        if (typeof metricValue !== "number" || metricValue <= 0) continue

        const key = getProverKey(benchmark)

        if (!grouped.has(inputSize)) {
          grouped.set(inputSize, new Map())
        }

        grouped.get(inputSize)?.set(key, metricValue)
      }

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
  }, [benchmarks, inputSizeCount])

  if (benchmarks.length === 0) {
    return <EmptyState message={`no benchmark data available for ${target}`} />
  }

  if (inputSizeCount <= 1) {
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
          isBytes={config.unit === "bytes"}
          label={dataKeyToTarget[target]}
          ariaLabel={`${config.label} trend`}
        />
      ))}
    </div>
  )
}
