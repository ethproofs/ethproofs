import type { Slices, ZkvmMetrics } from "@/lib/types"

import { cn } from "@/lib/utils"

import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"
import LevelMeter from "./LevelMeter"
import Pizza from "./Pizza"

import {
  getZkvmMetricLabel,
  getZkvmMetricSeverityLevels,
  thresholds,
} from "@/lib/metrics"

type Props = {
  metrics: ZkvmMetrics
  className?: string
}

const SoftwareDetails = ({ metrics, className }: Props) => {
  const severityLevels = getZkvmMetricSeverityLevels(metrics)

  // order for the pizza chart
  const severityArray = [
    severityLevels.proofSize,
    severityLevels.securityTarget,
    severityLevels.quantumSecurity,
    severityLevels.maxBountyAmount,
    severityLevels.evmStfBytecode,
    severityLevels.implementationSoundness,
    severityLevels.protocolSoundness,
    severityLevels.verificationTime,
  ]

  return (
    <div
      className={cn(
        "grid grid-cols-[2fr,2fr,2fr,2fr,2fr] gap-8 p-8",
        className
      )}
    >
      <div className="col-span-2 col-start-1 row-start-1 flex-1 text-center">
        <MetricBox>
          <LevelMeter
            bestThreshold={thresholds.verification_ms.green}
            worstThreshold={thresholds.verification_ms.red}
            unit="ms"
            value={Number(metrics.verification_ms)}
          />
          <MetricLabel>
            <MetricInfo label="verification times">
              TODO: Popover details
            </MetricInfo>
          </MetricLabel>
        </MetricBox>
      </div>

      <div className="col-start-2 row-start-2 text-center">
        <MetricBox className="py-0">
          <MetricLabel>
            <MetricInfo label="protocol soundness">
              TODO: Popover details
            </MetricInfo>
          </MetricLabel>
          <div className="text-center font-sans text-base">
            {getZkvmMetricLabel(
              severityLevels.protocolSoundness,
              "protocol_soundness"
            )}
          </div>
        </MetricBox>
      </div>

      <div className="col-start-2 row-start-3 text-center">
        <MetricBox className="py-0">
          <MetricLabel>
            <MetricInfo
              label="implementation soundness"
              className="block overflow-visible text-nowrap"
            >
              TODO: Popover details
            </MetricInfo>
          </MetricLabel>
          <div className="text-center font-sans text-base">
            {getZkvmMetricLabel(
              severityLevels.implementationSoundness,
              "implementation_soundness"
            )}
          </div>
        </MetricBox>
      </div>

      <div className="col-start-2 row-start-4 text-center">
        <MetricBox className="py-0">
          <MetricLabel>
            <MetricInfo label="EVM STF bytecode">
              TODO: Popover details
            </MetricInfo>
          </MetricLabel>
          <div className="text-center font-sans text-base">
            {getZkvmMetricLabel(
              severityLevels.evmStfBytecode,
              "evm_stf_bytecode"
            )}
          </div>
        </MetricBox>
      </div>

      <div className="col-start-3 row-span-3 row-start-2 flex flex-col items-center text-[10rem]">
        <Pizza
          slices={
            severityArray.map((severity) => ({
              level: severity,
            })) as Slices
          }
        />
      </div>

      <div className="col-span-2 col-start-4 row-start-1 flex-1 text-center">
        <MetricBox>
          <LevelMeter
            bestThreshold={thresholds.size_bytes.green / 1024}
            worstThreshold={thresholds.size_bytes.red / 1024}
            unit="kB"
            value={Number(metrics.size_bytes) / 1024}
          />
          <MetricLabel>
            <MetricInfo label="proof size">TODO: Popover details</MetricInfo>
          </MetricLabel>
        </MetricBox>
      </div>

      <div className="col-start-4 row-start-2 text-center">
        <MetricBox className="py-0">
          <MetricLabel>
            <MetricInfo label="security target">
              TODO: Popover details
            </MetricInfo>
          </MetricLabel>
          <div className="text-center font-sans text-base">
            {getZkvmMetricLabel(
              severityLevels.securityTarget,
              "security_target_bits"
            )}
          </div>
        </MetricBox>
      </div>

      <div className="col-start-4 row-start-3 text-center">
        <MetricBox className="py-0">
          <MetricLabel>
            <MetricInfo label="quantum">TODO: Popover details</MetricInfo>
          </MetricLabel>
          <div className="text-center font-sans text-base">
            {getZkvmMetricLabel(
              severityLevels.quantumSecurity,
              "quantum_security"
            )}
          </div>
        </MetricBox>
      </div>

      <div className="col-start-4 row-start-4 text-center">
        <MetricBox className="py-0">
          <MetricLabel>
            <MetricInfo label="bounties">TODO: Popover details</MetricInfo>
          </MetricLabel>
          <div className="text-center font-sans text-base">
            {getZkvmMetricLabel(
              severityLevels.maxBountyAmount,
              "max_bounty_amount"
            )}
          </div>
        </MetricBox>
      </div>

      <div className="col-start-3 row-start-5 self-end text-center">
        <MetricBox className="py-0">
          <MetricLabel>
            <MetricInfo label="trusted setup">TODO: Popover details</MetricInfo>
          </MetricLabel>
          <div className="text-nowrap text-center font-sans text-base">
            {getZkvmMetricLabel(severityLevels.trustedSetup, "trusted_setup")}
          </div>
        </MetricBox>
      </div>
    </div>
  )
}

SoftwareDetails.displayName = "SoftwareDetails"

export default SoftwareDetails
