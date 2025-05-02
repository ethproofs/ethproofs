import type {
  SeverityLevel,
  Slices,
  ZkvmMetric,
  ZkvmMetrics,
} from "@/lib/types"

import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"
import LevelMeter from "./LevelMeter"
import Pizza from "./Pizza"

import { thresholds } from "@/lib/metrics"
import { getZkvmMetricLabel } from "@/lib/metrics"

type Props = {
  metrics: Omit<ZkvmMetrics, "security_target_bits" | "max_bounty_amount"> & {
    security_target_bits: SeverityLevel
    max_bounty_amount: SeverityLevel
  }
  severityLevels: SeverityLevel[]
}

const SoftwareDetails = ({ metrics, severityLevels }: Props) => {
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
            {getZkvmMetricLabel(
              metrics.protocol_soundness,
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
            {getZkvmMetricLabel(metrics.evm_stf_bytecode, "evm_stf_bytecode")}
          </div>
        </MetricBox>
      </div>

      <div className="col-start-3 row-span-3 row-start-2 text-[10rem]">
        <Pizza slices={severityLevels.map((level) => ({ level })) as Slices} />
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
            {getZkvmMetricLabel(
              metrics.security_target_bits,
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
            {getZkvmMetricLabel(metrics.quantum_security, "quantum_security")}
          </div>
        </MetricBox>
      </div>

      <div className="col-start-4 row-start-4 text-center">
        <MetricBox className="py-0">
          <MetricLabel>
            <MetricInfo label="bounties">TODO: Popover details</MetricInfo>
          </MetricLabel>
          <div className="text-center font-sans text-base">
            {getZkvmMetricLabel(metrics.max_bounty_amount, "max_bounty_amount")}
          </div>
        </MetricBox>
      </div>

      <div className="col-start-3 row-start-5 self-end text-center">
        <MetricBox className="py-0">
          <MetricLabel>
            <MetricInfo label="trusted setup">TODO: Popover details</MetricInfo>
          </MetricLabel>
          <div className="text-nowrap text-center font-sans text-base">
            {metrics.trusted_setup ? "trusted setup" : "no trusted setup"}
          </div>
        </MetricBox>
      </div>
    </div>
  )
}

SoftwareDetails.displayName = "SoftwareDetails"

export default SoftwareDetails
