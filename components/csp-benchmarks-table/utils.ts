import { Metrics } from "@/lib/api/csp-benchmarks"
import { formatBytes } from "@/lib/number"
import { prettyMs } from "@/lib/time"

export type MetricKey =
  | "proof_duration"
  | "peak_memory"
  | "proof_size"
  | "preprocessing_size"

export interface MetricConfig {
  key: MetricKey
  label: string
  format: (value: number) => string
  useLogScale?: boolean
}

export const METRIC_CONFIGS: Record<MetricKey, MetricConfig> = {
  proof_duration: {
    key: "proof_duration",
    label: "proof duration",
    format: (value) =>
      prettyMs(value / 1_000_000, {
        keepDecimalsOnWholeSeconds: false,
        unitCount: 1,
      }),
  },
  peak_memory: {
    key: "peak_memory",
    label: "peak memory",
    format: (value) => formatBytes(value, 0),
  },
  proof_size: {
    key: "proof_size",
    label: "proof size",
    format: (value) => formatBytes(value, 0),
  },
  preprocessing_size: {
    key: "preprocessing_size",
    label: "preprocessing size",
    format: (value) => formatBytes(value, 0),
    useLogScale: true,
  },
}

export const CHART_COLORS = [
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

export const RADAR_METRICS = [
  { key: "peak_memory" as const, label: "memory" },
  { key: "proof_size" as const, label: "proof size" },
  { key: "proof_duration" as const, label: "proving time" },
  { key: "preprocessing_size" as const, label: "preprocessing size" },
] as const

export const getProverKey = (benchmark: Metrics): string => {
  return `${benchmark.name}${benchmark.feat ? ` (${benchmark.feat})` : ""}`
}

export const getInputSizes = (
  benchmarks: Metrics[],
  target: string
): number[] => {
  const sizes = new Set<number>()
  benchmarks
    .filter((b) => b.target === target)
    .forEach((b) => sizes.add(b.input_size))
  return Array.from(sizes).sort((a, b) => a - b)
}

export const filterBenchmarks = (
  benchmarks: Metrics[],
  target: string,
  inputSize?: number
) => {
  return benchmarks.filter(
    (b) =>
      b.target === target &&
      (inputSize === undefined || b.input_size === inputSize)
  )
}
