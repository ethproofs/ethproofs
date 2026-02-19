import type { ChartConfig } from "@/components/ui/chart"

import type { Metrics } from "@/lib/api/csp-benchmarks"
import { formatBytes } from "@/lib/number"
import { prettyMs } from "@/lib/time"

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
      prettyMs(value / 1_000_000, {
        keepDecimalsOnWholeSeconds: false,
        unitCount: 1,
      }),
  },
  verify_duration: {
    key: "verify_duration",
    label: "proof verification",
    description: "proof verification time (lower is better)",
    format: (value) =>
      prettyMs(value / 1_000_000, {
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
    label: "preprocessing data size",
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
