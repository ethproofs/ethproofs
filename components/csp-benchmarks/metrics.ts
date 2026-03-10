import type { ChartConfig } from "@/components/ui/chart"

import type { Metrics } from "@/lib/api/csp-benchmarks"
import { formatBytes } from "@/lib/number"
import { prettyMs } from "@/lib/time"

export const nanosecondsPerMillisecond = 1_000_000

export const autoLogDomain: [string, string] = ["auto", "auto"]

export type MetricKey =
  | "proof_duration"
  | "verify_duration"
  | "peak_memory"
  | "proof_size"
  | "preprocessing_size"

export interface MetricConfig {
  label: string
  description: string
  unit: "duration" | "bytes"
  format(value: number): string
  shouldUseLogScale?: boolean
}

const formatDuration = (value: number) =>
  prettyMs(value / nanosecondsPerMillisecond, {
    keepDecimalsOnWholeSeconds: false,
    unitCount: 1,
  })

const formatBytesCompact = (value: number) => formatBytes(value, 0)

export const metricConfigs: Record<MetricKey, MetricConfig> = {
  proof_duration: {
    label: "proof generation",
    description: "proof generation time (lower is better)",
    unit: "duration",
    format: formatDuration,
  },
  verify_duration: {
    label: "proof verification",
    description: "proof verification time (lower is better)",
    unit: "duration",
    format: formatDuration,
  },
  peak_memory: {
    label: "memory consumption",
    description:
      "maximum RAM consumed during proof generation (lower is better)",
    unit: "bytes",
    format: formatBytesCompact,
  },
  proof_size: {
    label: "proof size",
    description: "generated proof size (lower is better)",
    unit: "bytes",
    format: formatBytesCompact,
  },
  preprocessing_size: {
    label: "preprocessing size",
    description:
      "preprocessed artifacts size, such as SRS or proving key (lower is better)",
    unit: "bytes",
    format: formatBytesCompact,
    shouldUseLogScale: true,
  },
}

export const chartMetrics: readonly MetricKey[] = [
  "proof_duration",
  "verify_duration",
  "proof_size",
  "preprocessing_size",
  "peak_memory",
]

export const chartColors = [
  "#f9a8d4",
  "#a3e635",
  "#4f46e5",
  "#facc15",
  "#a21caf",
  "#22c55e",
  "#e879f9",
  "#4d7c0f",
  "#3b82f6",
  "#f97316",
  "#38bdf8",
  "#ef4444",
  "#5eead4",
  "#db2777",
  "#0f766e",
  "#fb7185",
  "#0369a1",
  "#a16207",
  "#c4b5fd",
  "#fdba74",
] as const

const radarMetricOrder: readonly MetricKey[] = [
  "preprocessing_size",
  "proof_size",
  "proof_duration",
  "verify_duration",
  "peak_memory",
]

export const radarMetrics: ReadonlyArray<{ key: MetricKey; label: string }> =
  radarMetricOrder.map((key) => ({ key, label: metricConfigs[key].label }))

export function getProverKey(benchmark: Metrics): string {
  return `${benchmark.name}${benchmark.feat ? ` (${benchmark.feat})` : ""}`
}

export function buildChartConfig(provers: string[]): ChartConfig {
  return provers.reduce<ChartConfig>((acc, key, index) => {
    acc[key] = {
      label: key,
      color: chartColors[index % chartColors.length],
    }
    return acc
  }, {})
}

export function getAllProverKeys(benchmarks: Metrics[]): string[] {
  const keySet = new Set<string>()
  for (const b of benchmarks) {
    keySet.add(getProverKey(b))
  }
  return Array.from(keySet).sort()
}

export function getInputSizes(benchmarks: Metrics[]): number[] {
  const sizes = new Set<number>()
  for (const b of benchmarks) {
    sizes.add(b.input_size)
  }
  return Array.from(sizes).sort((a, b) => a - b)
}
