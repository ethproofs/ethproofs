import type { SystemProperties } from "./properties"

const securityBitsThresholds = {
  green: 128,
  yellow: 96,
} as const

export type CspSeverityLevel = "green" | "yellow" | "red" | "none"

export interface CspSlice {
  level: CspSeverityLevel
  label: string
  statusLabel: string
}

export type CspSlices = readonly CspSlice[]

interface CspMetricInfo {
  label: string
  statusLabels: Partial<Record<CspSeverityLevel, string>>
}

type CspMetricId =
  | "is_zk"
  | "is_pq"
  | "is_maintained"
  | "is_audited"
  | "security_bits"

const cspMetricInfo: Record<CspMetricId, CspMetricInfo> = {
  is_zk: {
    label: "zero-knowledge",
    statusLabels: { green: "ZK", red: "not ZK", none: "unknown" },
  },
  is_pq: {
    label: "post-quantum",
    statusLabels: {
      green: "PQ-sound",
      red: "not PQ-sound",
      none: "unknown",
    },
  },
  is_maintained: {
    label: "maintained",
    statusLabels: {
      green: "maintained",
      red: "not maintained",
      none: "unknown",
    },
  },
  is_audited: {
    label: "audited",
    statusLabels: {
      green: "audited",
      yellow: "partially audited",
      red: "not audited",
      none: "unknown",
    },
  },
  security_bits: {
    label: "security bits",
    statusLabels: {
      green: `≥ ${securityBitsThresholds.green} bits`,
      yellow: `≥ ${securityBitsThresholds.yellow} bits`,
      red: `< ${securityBitsThresholds.yellow} bits`,
      none: "unknown",
    },
  },
}

export function getBooleanSeverity(
  value: boolean | undefined
): CspSeverityLevel {
  if (typeof value !== "boolean") return "none"
  return value ? "green" : "red"
}

export function getAuditSeverity(
  value: "audited" | "not_audited" | "partially_audited" | undefined
): CspSeverityLevel {
  if (value === undefined) return "none"
  if (value === "audited") return "green"
  if (value === "partially_audited") return "yellow"
  return "red"
}

export function getSecurityBitsSeverity(
  value: number | undefined
): CspSeverityLevel {
  if (typeof value !== "number") return "none"
  if (value === 0) return "none"
  if (value >= securityBitsThresholds.green) return "green"
  if (value >= securityBitsThresholds.yellow) return "yellow"
  return "red"
}

function buildSlice(level: CspSeverityLevel, info: CspMetricInfo): CspSlice {
  return {
    level,
    label: info.label,
    statusLabel: info.statusLabels[level] ?? "unknown",
  }
}

export function getSlicesFromSystemProperties(
  props: SystemProperties
): CspSlices {
  return [
    buildSlice(getBooleanSeverity(props.is_zk), cspMetricInfo.is_zk),
    buildSlice(getBooleanSeverity(props.is_pq), cspMetricInfo.is_pq),
    buildSlice(
      getBooleanSeverity(props.is_maintained),
      cspMetricInfo.is_maintained
    ),
    buildSlice(getAuditSeverity(props.is_audited), cspMetricInfo.is_audited),
    {
      level: getSecurityBitsSeverity(props.security_bits),
      label: cspMetricInfo.security_bits.label,
      statusLabel:
        typeof props.security_bits === "number" && props.security_bits > 0
          ? `${props.security_bits} bits`
          : "unknown",
    },
  ]
}
