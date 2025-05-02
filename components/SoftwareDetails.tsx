import type { ZkvmPerformanceMetric, ZkvmSecurityMetric } from "@/lib/types"

import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"
import LevelMeter from "./LevelMeter"
import Pizza from "./Pizza"

import { getMetricSeverity, thresholds } from "@/lib/metrics"
import { getMetricLabel } from "@/lib/metrics"

const SoftwareDetails = ({
  metrics,
}: {
  metrics: ZkvmSecurityMetric & ZkvmPerformanceMetric
}) => {
  // Get the severity levels for each numeric metric
  const proofSizeSeverity = getMetricSeverity(metrics.size_bytes, "size_bytes")

  const verificationTimeSeverity = getMetricSeverity(
    metrics.verification_ms,
    "verification_ms"
  )

  const maxBountyAmountSeverity = getMetricSeverity(
    metrics.max_bounty_amount,
    "max_bounty_amount"
  )

  const securityTargetSeverity = getMetricSeverity(
    metrics.security_target_bits,
    "security_target_bits"
  )

  return (
    <div className="grid grid-cols-[1fr,4fr,2fr,4fr,1fr] gap-8 p-8">
      <div className="col-span-2 col-start-1 row-start-1 flex-1 text-center">
        <MetricBox>
          <LevelMeter
            bestThreshold={thresholds.verification_ms.green}
            worstThreshold={thresholds.verification_ms.red}
            unit="ms"
            value={metrics.verification_ms}
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
            {getMetricLabel(metrics.protocol_soundness, "protocol_soundness")}
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
            {getMetricLabel(
              metrics.implementation_soundness,
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
            {getMetricLabel(metrics.evm_stf_bytecode, "evm_stf_bytecode")}
          </div>
        </MetricBox>
      </div>

      <div className="col-start-3 row-span-3 row-start-2 text-[10rem]">
        <Pizza
          slices={[
            { level: proofSizeSeverity },
            { level: securityTargetSeverity },
            { level: metrics.quantum_security },
            { level: maxBountyAmountSeverity },
            { level: metrics.evm_stf_bytecode },
            { level: metrics.implementation_soundness },
            { level: metrics.protocol_soundness },
            { level: verificationTimeSeverity },
          ]}
        />
      </div>

      <div className="col-span-2 col-start-4 row-start-1 flex-1 text-center">
        <MetricBox>
          <LevelMeter
            bestThreshold={thresholds.size_bytes.green / 1024}
            worstThreshold={thresholds.size_bytes.red / 1024}
            unit="kB"
            value={metrics.size_bytes / 1024}
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
            {getMetricLabel(securityTargetSeverity, "security_target_bits")}
          </div>
        </MetricBox>
      </div>

      <div className="col-start-4 row-start-3 text-center">
        <MetricBox className="py-0">
          <MetricLabel>
            <MetricInfo label="quantum">TODO: Popover details</MetricInfo>
          </MetricLabel>
          <div className="text-center font-sans text-base">
            {getMetricLabel(metrics.quantum_security, "quantum_security")}
          </div>
        </MetricBox>
      </div>

      <div className="col-start-4 row-start-4 text-center">
        <MetricBox className="py-0">
          <MetricLabel>
            <MetricInfo label="bounties">TODO: Popover details</MetricInfo>
          </MetricLabel>
          <div className="text-center font-sans text-base">
            {getMetricLabel(maxBountyAmountSeverity, "max_bounty_amount")}
          </div>
        </MetricBox>
      </div>

      <div className="col-start-3 row-start-5 self-end text-center">
        <MetricBox className="py-0">
          <MetricLabel>
            <MetricInfo label="trusted setup">TODO: Popover details</MetricInfo>
          </MetricLabel>
          <div className="text-center font-sans text-base">trusted setup</div>
        </MetricBox>
      </div>
    </div>
  )
}

SoftwareDetails.displayName = "SoftwareDetails"

export default SoftwareDetails
