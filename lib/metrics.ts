import {
  getZkvmPerformanceMetrics,
  getZkvmPerformanceMetricsByZkvmId,
  getZkvmSecurityMetrics,
  getZkvmSecurityMetricsByZkvmId,
} from "./api/metrics"
import { SeverityLevel, ZkvmMetrics } from "./types"

const protocolLabels: Record<SeverityLevel, string> = {
  red: "not fully audited",
  yellow: "fully audited",
  green: "formally verified",
}

const quantumLabels: Record<SeverityLevel, string> = {
  red: "curve-based",
  yellow: "lattice-based",
  green: "hash-based",
}

const sizeLabels: Record<SeverityLevel, string> = {
  red: "≥ 512 KiB",
  yellow: "< 512 KiB",
  green: "< 32 KiB",
}

const verificationLabels: Record<SeverityLevel, string> = {
  red: "≥ 16ms",
  yellow: "< 16ms",
  green: "< 1ms",
}

const securityTargetLabels: Record<SeverityLevel, string> = {
  red: "< 100 bits",
  yellow: "≥ 100 bits",
  green: "≥ 128 bits",
}

const bountyLabels: Record<SeverityLevel, string> = {
  red: "< $64k",
  yellow: "≥ $64k",
  green: "≥ $1M",
}

const trustedSetupLabels: Record<SeverityLevel, string> = {
  red: "no trusted setup",
  yellow: "no trusted setup",
  green: "trusted setup",
}

type MetricThresholds = {
  red: number
  yellow: number
  green: number
}

export const thresholds: Record<string, MetricThresholds> = {
  size_bytes: {
    red: 512 * 1024, // 512 KiB
    yellow: 32 * 1024, // 32 KiB
    green: 0,
  },
  verification_ms: {
    red: 16, // 16ms
    yellow: 1, // 1ms
    green: 0,
  },
  security_target_bits: {
    red: 100,
    yellow: 128,
    green: Number.MAX_SAFE_INTEGER,
  },
  max_bounty_amount: {
    red: 64000, // $64k
    yellow: 1000000, // $1M
    green: Number.MAX_SAFE_INTEGER,
  },
}

export const getZkvmMetricLabel = (
  severity: SeverityLevel,
  metricType: string
): string => {
  switch (metricType) {
    case "protocol_soundness":
    case "implementation_soundness":
    case "evm_stf_bytecode":
      return protocolLabels[severity]
    case "quantum_security":
      return quantumLabels[severity]
    case "size_bytes":
      return sizeLabels[severity]
    case "verification_ms":
      return verificationLabels[severity]
    case "security_target_bits":
      return securityTargetLabels[severity]
    case "max_bounty_amount":
      return bountyLabels[severity]
    case "trusted_setup":
      return trustedSetupLabels[severity]
    default:
      return ""
  }
}

export const getZkvmMetricSeverity = (value: number, metric: string) => {
  let severity: SeverityLevel = "red"

  // Handle numeric metrics
  const threshold = thresholds[metric]

  if (!threshold) {
    return severity
  }

  if (metric === "size_bytes" || metric === "verification_ms") {
    if (value >= threshold.red) severity = "red"
    else if (value >= threshold.yellow) severity = "yellow"
    else severity = "green"
  } else {
    if (value < threshold.red) severity = "red"
    else if (value < threshold.yellow) severity = "yellow"
    else severity = "green"
  }

  return severity
}

export const getZkvmMetricSeverityLevels = (metrics: ZkvmMetrics) => {
  // Get the severity levels for each numeric metric
  const proofSizeSeverity = getZkvmMetricSeverity(
    metrics.size_bytes,
    "size_bytes"
  )
  const verificationTimeSeverity = getZkvmMetricSeverity(
    metrics.verification_ms,
    "verification_ms"
  )
  const maxBountyAmountSeverity = getZkvmMetricSeverity(
    metrics.max_bounty_amount,
    "max_bounty_amount"
  )
  const securityTargetSeverity = getZkvmMetricSeverity(
    metrics.security_target_bits,
    "security_target_bits"
  )

  return {
    proofSize: proofSizeSeverity,
    securityTarget: securityTargetSeverity,
    quantumSecurity: metrics.quantum_security,
    maxBountyAmount: maxBountyAmountSeverity,
    evmStfBytecode: metrics.evm_stf_bytecode,
    implementationSoundness: metrics.implementation_soundness,
    protocolSoundness: metrics.protocol_soundness,
    verificationTime: verificationTimeSeverity,
    trustedSetup: metrics.trusted_setup ? ("green" as const) : ("red" as const),
  }
}

export const getZkvmsMetrics = async () => {
  const securityMetrics = await getZkvmSecurityMetrics()
  const performanceMetrics = await getZkvmPerformanceMetrics()

  const metricsByZkvmId = new Map()

  for (const metric of securityMetrics) {
    metricsByZkvmId.set(metric.zkvm_id, {
      ...metric,
    })
  }

  for (const metric of performanceMetrics) {
    const existing = metricsByZkvmId.get(metric.zkvm_id) || {}

    metricsByZkvmId.set(metric.zkvm_id, {
      ...existing,
      ...metric,
    })
  }

  return Object.fromEntries(metricsByZkvmId)
}

export const getZkvmMetrics = async (zkvmId: number) => {
  const securityMetrics = await getZkvmSecurityMetricsByZkvmId(zkvmId)
  const performanceMetrics = await getZkvmPerformanceMetricsByZkvmId(zkvmId)

  if (!securityMetrics || !performanceMetrics) {
    throw new Error("No metrics found for zkvm")
  }

  return {
    ...securityMetrics,
    ...performanceMetrics,
  }
}
