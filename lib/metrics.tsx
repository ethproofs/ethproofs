import ZkvmPopoverDetails from "@/components/ZkvmPopoverDetails"

import {
  getZkvmPerformanceMetricsByZkvmId,
  getZkvmSecurityMetricsByZkvmId,
  getZkvmsWithMetrics,
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
  severity: SeverityLevel | undefined,
  metricType: string
): string => {
  if (severity === undefined) return "no data"

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
  metrics: Partial<ZkvmMetrics>
): Record<string, SeverityLevel | undefined> => {
  // Get the severity levels for each numeric metric
  const proofSizeSeverity = metrics.size_bytes
    ? getZkvmMetricSeverity(metrics.size_bytes, "size_bytes")
    : undefined
  const verificationTimeSeverity = metrics.verification_ms
    ? getZkvmMetricSeverity(metrics.verification_ms, "verification_ms")
    : undefined
  const maxBountyAmountSeverity = metrics.max_bounty_amount
    ? getZkvmMetricSeverity(metrics.max_bounty_amount, "max_bounty_amount")
    : undefined
  const securityTargetSeverity = metrics.security_target_bits
    ? getZkvmMetricSeverity(
        metrics.security_target_bits,
        "security_target_bits"
      )
    : undefined

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

export const getZkvmsMetricsByZkvmId = async ({
  zkvmIds,
}: {
  zkvmIds: number[]
}) => {
  const zkvmsWithMetrics = await getZkvmsWithMetrics({ zkvmIds })

  const metricsByZkvmId = new Map<number, Partial<ZkvmMetrics>>()

  for (const zkvm of zkvmsWithMetrics) {
    metricsByZkvmId.set(zkvm.id, {
      ...zkvm.security_metrics,
      ...zkvm.performance_metrics,
    })
  }

  return metricsByZkvmId
}

export const getZkvmMetrics = async (zkvmId: number) => {
  const securityMetrics = await getZkvmSecurityMetricsByZkvmId(zkvmId)
  const performanceMetrics = await getZkvmPerformanceMetricsByZkvmId(zkvmId)

  return {
    ...securityMetrics,
    ...performanceMetrics,
  }
}

export const getSoftwareDetailItems = (
  metrics: Partial<ZkvmMetrics>
): SoftwareDetailItem[] => {
  const severityLevels = getZkvmMetricSeverityLevels(metrics)

  return [
    // Section 1 - Top charts / performance slices
    {
      id: "verification-time",
      label: "verification times",
      popoverDetails: (
        <ZkvmPopoverDetails
          breakdown={{ green: "< 1ms", yellow: "< 16ms", red: "≥ 16ms" }}
          activeSeverity={severityLevels.verificationTime}
        >
          Time required for a verifier to check the validity of proofs being
          generated by this zkVM, using a single iPhone 16 core.
        </ZkvmPopoverDetails>
      ),
      severity: severityLevels.verificationTime,
      position: 7,
      chartInfo: {
        bestThreshold: ZKVM_THRESHOLDS.verification_ms.yellow,
        worstThreshold: ZKVM_THRESHOLDS.verification_ms.red,
        unit: "ms",
        value: Number(metrics.verification_ms),
        disabled: !metrics.verification_ms,
      },
      className: "px-8",
    },
    {
      id: "proof-size",
      label: "proof size",
      popoverDetails: (
        <ZkvmPopoverDetails
          breakdown={{
            green: "< 32 KiB",
            yellow: "< 512 KiB",
            red: "≥ 512 KiB",
          }}
          activeSeverity={severityLevels.proofSize}
        >
          The size of the proof generated by this zkVM, measured in kilobytes
          (KiB).
        </ZkvmPopoverDetails>
      ),
      severity: severityLevels.proofSize,
      position: 0,
      chartInfo: {
        bestThreshold: ZKVM_THRESHOLDS.size_bytes.yellow / 1024,
        worstThreshold: ZKVM_THRESHOLDS.size_bytes.red / 1024,
        unit: "kB",
        value: Number(metrics.size_bytes) / 1024,
        disabled: !metrics.size_bytes,
      },
      className: "px-8",
    },
    // Section 2 - Left
    {
      id: "protocol-soundness",
      label: "protocol soundness",
      popoverDetails: (
        <ZkvmPopoverDetails
          breakdown={{
            green: "formally verified",
            yellow: "fully audited",
            red: "not fully audited",
          }}
          activeSeverity={severityLevels.protocolSoundness}
        >
          The level of assurance provided by the zkVM protocol, based on its
          audit and verification status.
        </ZkvmPopoverDetails>
      ),
      severity: severityLevels.protocolSoundness,
      position: 6,
      value: getZkvmMetricLabel(
        severityLevels.protocolSoundness,
        "protocol_soundness"
      ),
    },
    {
      id: "implementation-soundness",
      label: "implementation",
      popoverDetails: (
        <ZkvmPopoverDetails
          breakdown={{
            green: "formally verified",
            yellow: "fully audited",
            red: "not fully audited",
          }}
          activeSeverity={severityLevels.implementationSoundness}
        >
          The level of assurance provided by the zkVM implementation, based on
          its audit and verification status.
        </ZkvmPopoverDetails>
      ),
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
      popoverDetails: (
        <ZkvmPopoverDetails
          breakdown={{
            green: "formally verified",
            yellow: "fully audited",
            red: "not fully audited",
          }}
          activeSeverity={severityLevels.evmStfBytecode}
        >
          The level of assurance provided by the EVM STF bytecode, based on its
          audit and verification status.
        </ZkvmPopoverDetails>
      ),
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
      popoverDetails: (
        <ZkvmPopoverDetails
          breakdown={{
            green: "≥ 128 bits",
            yellow: "≥ 100 bits",
            red: "< 100 bits",
          }}
          activeSeverity={severityLevels.securityTarget}
        >
          The security target of the zkVM, measured in bits, represents the
          level of cryptographic security provided by the system.
        </ZkvmPopoverDetails>
      ),
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
      popoverDetails: (
        <ZkvmPopoverDetails
          breakdown={{
            green: "hash-based",
            yellow: "lattice-based",
            red: "curve-based",
          }}
          activeSeverity={severityLevels.quantumSecurity}
        >
          The quantum security level of the zkVM, indicating its resistance to
          attacks by quantum computers. Hash-based is post-quantum and indicates
          &ge; 64 bits of QROM-provable security.
        </ZkvmPopoverDetails>
      ),
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
      popoverDetails: (
        <ZkvmPopoverDetails
          breakdown={{
            green: "≥ $1M for critical bugs",
            yellow: "≥ $64k for critical bugs",
            red: "< $64k for critical bugs",
          }}
        >
          The maximum bounty amount offered for critical vulnerabilities in the
          zkVM, indicating the level of commitment to security.
        </ZkvmPopoverDetails>
      ),
      severity: severityLevels.maxBountyAmount,
      position: 3,
      value: getZkvmMetricLabel(
        severityLevels.maxBountyAmount,
        "max_bounty_amount"
      ),
    },
  ]
}
