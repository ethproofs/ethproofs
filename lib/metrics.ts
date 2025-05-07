import {
  getZkvmPerformanceMetrics,
  getZkvmPerformanceMetricsByZkvmId,
  getZkvmSecurityMetrics,
  getZkvmSecurityMetricsByZkvmId,
} from "./api/metrics"
import { ZKVM_THRESHOLDS } from "./constants"
import {
  SeverityLevel,
  SoftwareDetailItem,
  ZkvmMetrics,
  ZkvmThresholdMetric,
} from "./types"

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

export const getZkvmMetricSeverity = (
  value: number,
  metric: ZkvmThresholdMetric
) => {
  // Handle numeric metrics
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

export const getZkvmMetricSeverityLevels = (
  metrics: ZkvmMetrics
): Record<string, SeverityLevel> => {
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

export const getSoftwareDetailItems = (
  metrics: ZkvmMetrics
): SoftwareDetailItem[] => {
  const severityLevels = getZkvmMetricSeverityLevels(metrics)

  return [
    // Section 1 - Top charts
    {
      id: "verification-time",
      label: "verification times",
      className: "col-span-2 col-start-1 row-start-1 flex-1 pt-8 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.verificationTime,
      position: 7,
      chartInfo: {
        bestThreshold: ZKVM_THRESHOLDS.verification_ms.yellow,
        worstThreshold: ZKVM_THRESHOLDS.verification_ms.red,
        unit: "ms",
        value: Number(metrics.verification_ms),
      },
    },
    {
      id: "proof-size",
      label: "proof size",
      className: "col-span-2 col-start-4 row-start-1 flex-1 pt-8 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.proofSize,
      position: 0,
      chartInfo: {
        bestThreshold: ZKVM_THRESHOLDS.size_bytes.yellow / 1024,
        worstThreshold: ZKVM_THRESHOLDS.size_bytes.red / 1024,
        unit: "kB",
        value: Number(metrics.size_bytes) / 1024,
      },
    },
    // Section 2 - Left
    {
      id: "protocol-soundness",
      label: "protocol soundness",
      className: "col-start-2 row-start-2 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.protocolSoundness,
      position: 6,
      value: getZkvmMetricLabel(
        severityLevels.protocolSoundness,
        "protocol_soundness"
      ),
    },
    {
      id: "implementation-soundness",
      label: "implementation soundness",
      className: "col-start-2 row-start-3 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.implementationSoundness,
      position: 5,
      value: getZkvmMetricLabel(
        severityLevels.implementationSoundness,
        "implementation_soundness"
      ),
    },
    {
      id: "evm-stf-bytecode",
      label: "EVM STF bytecode",
      className: "col-start-2 row-start-4 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.evmStfBytecode,
      position: 4,
      value: getZkvmMetricLabel(
        severityLevels.evmStfBytecode,
        "evm_stf_bytecode"
      ),
    },
    // Section 3 - Right
    {
      id: "security-target",
      label: "security target",
      className: "col-start-4 row-start-2 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.securityTarget,
      position: 1,
      value: getZkvmMetricLabel(
        severityLevels.securityTarget,
        "security_target_bits"
      ),
    },
    {
      id: "quantum-security",
      label: "quantum security",
      className: "col-start-4 row-start-3 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.quantumSecurity,
      position: 2,
      value: getZkvmMetricLabel(
        severityLevels.quantumSecurity,
        "quantum_security"
      ),
    },
    {
      id: "max-bounty-amount",
      label: "bounties",
      className: "col-start-4 row-start-4 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.maxBountyAmount,
      position: 3,
      value: getZkvmMetricLabel(
        severityLevels.maxBountyAmount,
        "max_bounty_amount"
      ),
    },
  ]
}
