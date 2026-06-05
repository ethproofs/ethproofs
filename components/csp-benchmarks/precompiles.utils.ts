import { getProverKey } from "./metrics"

import type { Metrics } from "@/lib/api/csp-benchmarks"

export const precompileFootnoteText = "*uses precompiles"

export function getPrecompileProvers(benchmarks: Metrics[]): Set<string> {
  const result = new Set<string>()

  for (const benchmark of benchmarks) {
    if (benchmark.uses_precompile) {
      result.add(getProverKey(benchmark))
    }
  }

  return result
}

export function getPrecompileLabel(
  key: string,
  precompileProvers: Set<string>
): string {
  return precompileProvers.has(key) ? `${key}*` : key
}

export function hasPrecompileMeasurements(benchmarks: Metrics[]): boolean {
  return benchmarks.some((benchmark) => benchmark.uses_precompile)
}
