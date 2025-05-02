import {
  getZkvmPerformanceMetrics,
  getZkvmSecurityMetrics,
} from "./api/metrics"
import { SeverityLevel } from "./types"

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

export const getMetricLabel = (
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
    default:
      return ""
  }
}

export const getMetricSeverity = (value: number, metric: string) => {
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

export const getZkvmMetrics = async () => {
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
