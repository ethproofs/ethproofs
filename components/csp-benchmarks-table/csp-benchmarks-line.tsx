"use client"

import { useCallback, useMemo } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"

import { ChartCard, EmptyState } from "./shared"
import {
  CHART_COLORS,
  filterBenchmarks,
  getProverKey,
  METRIC_CONFIGS,
  MetricKey,
} from "./utils"

import { Metrics } from "@/lib/api/csp-benchmarks"
import { formatBytes } from "@/lib/number"
import { prettyMs } from "@/lib/time"

interface CspBenchmarksLineProps {
  benchmarks: Metrics[]
  target?: "sha256" | "ecdsa"
}

interface ChartDataPoint {
  input_size: number
  [key: string]: number | string
}

const METRICS: MetricKey[] = [
  "proof_duration",
  "peak_memory",
  "proof_size",
  "preprocessing_size",
]

const generateYAxisTicks = (
  min: number,
  max: number,
  isBytes: boolean
): number[] => {
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

export function CspBenchmarksLine({
  benchmarks,
  target = "sha256",
}: CspBenchmarksLineProps) {
  const filteredBenchmarks = useMemo(
    () => filterBenchmarks(benchmarks, target),
    [benchmarks, target]
  )

  const createChartData = useCallback(
    (metricKey: MetricKey): ChartDataPoint[] => {
      if (filteredBenchmarks.length === 0) return []

      const grouped = new Map<number, Map<string, number>>()

      filteredBenchmarks.forEach((benchmark) => {
        const inputSize = benchmark.input_size
        const metricValue = benchmark[metricKey]

        if (typeof metricValue !== "number") return

        const key = getProverKey(benchmark)

        if (!grouped.has(inputSize)) {
          grouped.set(inputSize, new Map())
        }

        grouped.get(inputSize)?.set(key, metricValue)
      })

      return Array.from(grouped.entries())
        .sort(([sizeA], [sizeB]) => sizeA - sizeB)
        .map(([inputSize, metrics]) => ({
          input_size: inputSize,
          ...Object.fromEntries(metrics),
        }))
    },
    [filteredBenchmarks]
  )

  const metricsData = useMemo(() => {
    return METRICS.map((metricKey) => ({
      key: metricKey,
      config: METRIC_CONFIGS[metricKey],
      data: createChartData(metricKey),
    }))
  }, [createChartData])

  const seriesKeys = useMemo(() => {
    if (metricsData[0]?.data.length === 0) return []
    return Object.keys(metricsData[0].data[0])
      .filter((key) => key !== "input_size")
      .sort()
  }, [metricsData])

  const chartConfig = useMemo(() => {
    return seriesKeys.reduce((acc, key, index) => {
      acc[key] = {
        label: key,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }
      return acc
    }, {} as ChartConfig)
  }, [seriesKeys])

  if (filteredBenchmarks.length === 0) {
    return <EmptyState message={`no ${target} benchmark data available`} />
  }

  const renderLineChart = (
    title: string,
    data: ChartDataPoint[],
    formatValue: (value: number) => string,
    isBytes: boolean
  ) => {
    const allValues = data.flatMap((point) =>
      Object.entries(point)
        .filter(([key]) => key !== "input_size")
        .map(([_, value]) => value as number)
    )
    const minValue = Math.min(...allValues)
    const maxValue = Math.max(...allValues)
    const ticks = generateYAxisTicks(minValue, maxValue, isBytes)

    const tooltipFormatter = (value: number) => {
      if (isBytes) {
        return formatBytes(value, 2)
      } else {
        return prettyMs(value / 1_000_000, {
          keepDecimalsOnWholeSeconds: true,
          unitCount: 2,
        })
      }
    }

    return (
      <ChartCard
        title={title}
        height="auto"
        label={target === "sha256" ? "sha-256" : "ecdsa"}
      >
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <LineChart
            data={data}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="input_size"
              tick={{ fontSize: 12 }}
              tickMargin={6}
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

                const sortedPayload = [...payload].sort(
                  (a, b) => (b.value as number) - (a.value as number)
                )

                return (
                  <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
                    {sortedPayload.map((entry, index) => (
                      <div
                        key={index}
                        className="flex w-full items-center gap-2"
                      >
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-sm"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="flex-1">{entry.name}</span>
                        <span className="font-medium">
                          {tooltipFormatter(entry.value as number)}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
            {seriesKeys.map((key) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartConfig[key]?.color}
                dot={false}
                connectNulls
                isAnimationActive={false}
                strokeWidth={1}
              />
            ))}
          </LineChart>
        </ChartContainer>
        <div className="flex flex-wrap justify-center gap-1.5 pt-4 md:gap-2">
          {seriesKeys.map((seriesKey) => (
            <div
              key={seriesKey}
              className="flex items-center gap-1.5 px-1.5 py-0.5 text-xs md:gap-2 md:px-2 md:py-1 md:text-sm"
            >
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-sm md:h-3 md:w-3"
                style={{ backgroundColor: chartConfig[seriesKey].color }}
              />
              <span className="whitespace-nowrap">{seriesKey}</span>
            </div>
          ))}
        </div>
      </ChartCard>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {metricsData.map(({ key, config, data }) => (
        <div key={key}>
          {renderLineChart(
            config.label,
            data,
            config.format,
            key !== "proof_duration"
          )}
        </div>
      ))}
    </div>
  )
}
