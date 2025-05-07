import type { Slices, SoftwareItem, ZkvmMetrics } from "@/lib/types"

import { cn } from "@/lib/utils"

import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"
import LevelMeter from "./LevelMeter"
import Pizza from "./Pizza"

import {
  getZkvmMetricLabel,
  getZkvmMetricSeverityLevels,
  thresholds,
} from "@/lib/metrics"

const DetailItem = ({ item }: { item: SoftwareItem }) => (
  <div className={item.className} data-index={item.position}>
    <MetricBox className="py-0">
      {"chartInfo" in item && <LevelMeter {...item.chartInfo} />}
    </MetricBox>
    <MetricLabel>
      <MetricInfo label={item.label}>{item.popoverDetails}</MetricInfo>
    </MetricLabel>
    {"value" in item && (
      <div className="text-center font-sans text-base">{item.value}</div>
    )}
  </div>
)

DetailItem.displayName = "DetailItem"

type SoftwareDetailsProps = {
  metrics: ZkvmMetrics
  className?: string
}

const SoftwareDetails = ({ metrics, className }: SoftwareDetailsProps) => {
  const severityLevels = getZkvmMetricSeverityLevels(metrics)

  const items: SoftwareItem[] = [
    {
      id: "verification-time",
      label: "verification times",
      className: "col-span-2 col-start-1 row-start-1 flex-1 py-4 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.verificationTime,
      position: 7,
      chartInfo: {
        bestThreshold: thresholds.verification_ms.green,
        worstThreshold: thresholds.verification_ms.red,
        unit: "ms",
        value: Number(metrics.verification_ms),
      },
    },
    {
      id: "proof-size",
      label: "proof size",
      className: "col-span-2 col-start-4 row-start-1 flex-1 text-center",
      popoverDetails: "TODO: Popover details",
      severity: severityLevels.proofSize,
      position: 0,
      chartInfo: {
        bestThreshold: thresholds.size_bytes.green / 1024,
        worstThreshold: thresholds.size_bytes.red / 1024,
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

  return (
    <div
      className={cn(
        "group/software grid grid-cols-[1fr,4fr,auto,4fr,1fr] gap-8 p-8",
        className
      )}
    >
      {items.map((item) => (
        <DetailItem key={item.id} item={item} />
      ))}

      <div className="col-start-3 row-span-3 row-start-2 flex flex-col items-center text-[10rem]">
        <Pizza
          slices={items.map((item) => ({ level: item.severity })) as Slices}
        />
      </div>
    </div>
  )
}

SoftwareDetails.displayName = "SoftwareDetails"

export default SoftwareDetails
