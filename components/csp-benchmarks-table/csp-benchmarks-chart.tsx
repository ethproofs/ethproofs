"use client"

import { useMemo, useState } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { CspCollectedBenchmark } from "@/lib/api/csp-benchmarks"
import { formatBytes } from "@/lib/number"
import { prettyMs } from "@/lib/time"

type MetricKey = "proof_duration" | "peak_memory" | "proof_size"

interface MetricConfig {
  key: MetricKey
  label: string
  unit: string
  format: (value: number) => string
}

const METRIC_CONFIGS: Record<MetricKey, MetricConfig> = {
  proof_duration: {
    key: "proof_duration",
    label: "proof duration",
    unit: "ms",
    format: (value) => prettyMs(value / 1_000_000),
  },
  peak_memory: {
    key: "peak_memory",
    label: "peak memory",
    unit: "bytes",
    format: (value) => formatBytes(value),
  },
  proof_size: {
    key: "proof_size",
    label: "proof size",
    unit: "bytes",
    format: (value) => formatBytes(value),
  },
}

interface CspBenchmarksChartProps {
  benchmarks: CspCollectedBenchmark[]
}

interface ChartDataPoint {
  input_size: number
  [key: string]: number | string
}

export function CspBenchmarksChart({ benchmarks }: CspBenchmarksChartProps) {
  const [selectedMetric, setSelectedMetric] =
    useState<MetricKey>("proof_duration")

  const chartData = useMemo(() => {
    if (benchmarks.length === 0) return []

    // Group by input_size and create a data point for each combination
    const grouped = new Map<number, Map<string, number>>()

    benchmarks.forEach((benchmark) => {
      const inputSize = benchmark.input_size
      const metricValue = benchmark[selectedMetric]

      if (typeof metricValue !== "number") return

      const key = `${benchmark.name}${benchmark.feat ? ` (${benchmark.feat})` : ""}`

      if (!grouped.has(inputSize)) {
        grouped.set(inputSize, new Map())
      }

      grouped.get(inputSize)?.set(key, metricValue)
    })

    // Convert to array format for Recharts
    const data: ChartDataPoint[] = Array.from(grouped.entries())
      .sort(([sizeA], [sizeB]) => sizeA - sizeB)
      .map(([inputSize, metrics]) => ({
        input_size: inputSize,
        ...Object.fromEntries(metrics),
      }))

    return data
  }, [benchmarks, selectedMetric])

  // Use semantic chart tokens from CSS
  const chartTokens = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
    "hsl(var(--chart-7))",
    "hsl(var(--chart-8))",
    "hsl(var(--chart-9))",
    "hsl(var(--chart-10))",
    "hsl(var(--chart-11))",
    "hsl(var(--chart-12))",
    "hsl(var(--chart-13))",
    "hsl(var(--chart-14))",
    "hsl(var(--chart-15))",
    "hsl(var(--chart-16))",
    "hsl(var(--chart-17))",
  ]

  // Get unique series (name + feat combinations)
  const seriesKeys = useMemo(() => {
    if (chartData.length === 0) return []
    const keys = Object.keys(chartData[0]).filter((key) => key !== "input_size")
    return keys.sort()
  }, [chartData])

  const metric = METRIC_CONFIGS[selectedMetric]

  if (benchmarks.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No benchmark data available
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex gap-4">
        <div className="w-full sm:w-[250px]">
          <Select
            value={selectedMetric}
            onValueChange={(value) => setSelectedMetric(value as MetricKey)}
          >
            <SelectTrigger className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(METRIC_CONFIGS).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border bg-card p-4">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--chart-border))"
            />
            <XAxis
              dataKey="input_size"
              tick={{ fontSize: 12 }}
              label={{
                value: "input size",
                position: "insideBottomRight",
                fontSize: 12,
              }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              label={{
                value: metric.label,
                angle: -90,
                position: "insideLeft",
                fontSize: 12,
                offset: -10,
              }}
              tickFormatter={(value) => {
                if (typeof value === "number") {
                  return metric.format(value)
                }
                return String(value)
              }}
            />
            <Tooltip
              formatter={(value) => metric.format(value as number)}
              labelFormatter={(label) => `Input Size: ${label}`}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "calc(var(--radius) - 2px)",
                color: "hsl(var(--foreground))",
                fontSize: 12,
                padding: "8px 12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{
                color: "hsl(var(--muted-foreground))",
                marginBottom: "4px",
                fontWeight: 500,
              }}
            />
            <Legend
              wrapperStyle={{
                fontSize: 12,
                color: "hsl(var(--foreground))",
                paddingTop: "16px",
              }}
            />
            {seriesKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={chartTokens[index % chartTokens.length]}
                dot={false}
                connectNulls
                isAnimationActive={false}
                strokeWidth={1}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
