import { ZKVM_THRESHOLDS } from "../../lib/constants"
import type {
  SeverityLevel,
  Slices,
  ZkvmMetrics,
  ZkvmThresholdMetric,
} from "../../lib/types"

const getZkvmMetric = (
  value: number,
  metric: ZkvmThresholdMetric
): SeverityLevel => {
  const threshold = ZKVM_THRESHOLDS[metric]
  const lowerBetter: ZkvmThresholdMetric[] = ["size_bytes", "verification_ms"]

  if (lowerBetter.includes(metric)) {
    if (value >= threshold.red) return "red"
    if (value >= threshold.yellow) return "yellow"
    return "green"
  }

  if (value < threshold.red) return "red"
  if (value < threshold.yellow) return "yellow"
  return "green"
}

export const getSlicesFromMetrics = (
  metrics: Partial<ZkvmMetrics> = {}
): Slices => {
  const proofSizeMetric = metrics.size_bytes
    ? getZkvmMetric(metrics.size_bytes, "size_bytes")
    : undefined
  const securityTargetMetric = metrics.security_target_bits
    ? getZkvmMetric(metrics.security_target_bits, "security_target_bits")
    : undefined
  const maxBountyAmountMetric = metrics.max_bounty_amount
    ? getZkvmMetric(metrics.max_bounty_amount, "max_bounty_amount")
    : undefined
  const verificationTimeMetric = metrics.verification_ms
    ? getZkvmMetric(metrics.verification_ms, "verification_ms")
    : undefined

  return [
    { level: proofSizeMetric },
    { level: securityTargetMetric },
    { level: metrics.quantum_security },
    { level: maxBountyAmountMetric },
    { level: metrics.evm_stf_bytecode },
    { level: metrics.implementation_soundness },
    { level: verificationTimeMetric },
  ]
}
