import type { ChartConfig } from "@/components/ui/chart"

import type { Metrics } from "@/lib/api/csp-benchmarks"
import { formatBytes } from "@/lib/number"
import { prettyMs } from "@/lib/time"

const nanosecondsPerMillisecond = 1_000_000

export type MetricKey =
  | "proof_duration"
  | "verify_duration"
  | "peak_memory"
  | "proof_size"
  | "preprocessing_size"

export interface MetricConfig {
  key: MetricKey
  label: string
  description: string
  format: (value: number) => string
  shouldUseLogScale?: boolean
}

export const metricConfigs: Record<MetricKey, MetricConfig> = {
  proof_duration: {
    key: "proof_duration",
    label: "proof generation",
    description: "proof generation time (lower is better)",
    format: (value) =>
      prettyMs(value / nanosecondsPerMillisecond, {
        keepDecimalsOnWholeSeconds: false,
        unitCount: 1,
      }),
  },
  verify_duration: {
    key: "verify_duration",
    label: "proof verification",
    description: "proof verification time (lower is better)",
    format: (value) =>
      prettyMs(value / nanosecondsPerMillisecond, {
        keepDecimalsOnWholeSeconds: false,
        unitCount: 1,
      }),
  },
  peak_memory: {
    key: "peak_memory",
    label: "memory consumption",
    description:
      "maximum RAM consumed during proof generation (lower is better)",
    format: (value) => formatBytes(value, 0),
  },
  proof_size: {
    key: "proof_size",
    label: "proof size",
    description: "generated proof size in bytes (lower is better)",
    format: (value) => formatBytes(value, 0),
  },
  preprocessing_size: {
    key: "preprocessing_size",
    label: "preprocessing size",
    description:
      "preprocessed artifacts size, such as SRS or proving key (lower is better)",
    format: (value) => formatBytes(value, 0),
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

export const radarMetrics: ReadonlyArray<{ key: MetricKey; label: string }> = [
  { key: "preprocessing_size", label: "preprocessing size" },
  { key: "proof_size", label: "proof size" },
  { key: "proof_duration", label: "proof generation" },
  { key: "verify_duration", label: "proof verification" },
  { key: "peak_memory", label: "peak memory" },
]

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

export function getInputSizes(benchmarks: Metrics[]): number[] {
  const sizes = new Set<number>()
  benchmarks.forEach((b) => sizes.add(b.input_size))
  return Array.from(sizes).sort((a, b) => a - b)
}
