import {
  BENCHMARK_LOWER_THRESHOLD,
  BENCHMARK_UPPER_THRESHOLD,
} from "./constants"
import { SeverityLevel } from "./types"

export const getBenchmarkColor = (
  timeMs: number | undefined
): SeverityLevel | undefined => {
  if (!timeMs) return undefined
  if (timeMs < BENCHMARK_LOWER_THRESHOLD) return "green"
  if (timeMs < BENCHMARK_UPPER_THRESHOLD) return "yellow"
  return "red"
}
