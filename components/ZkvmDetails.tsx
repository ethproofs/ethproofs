import type { Slices } from "@/lib/types"

import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"
import LevelMeter from "./LevelMeter"
import Pizza from "./Pizza"

// TODO: Replace with real data
export const DEMO_SLICES: Slices = [
  { level: "middle" },
  { level: "best" },
  { level: "best" },
  { level: "worst" },
  { level: "best" },
  { level: "worst" },
  { level: "best" },
  { level: "middle" },
]

const ZkvmDetails = () => (
  <div className="grid grid-cols-[1fr,4fr,2fr,4fr,1fr] grid-rows-4 gap-8 bg-gradient-to-b from-background to-background-active p-8">
    <div className="col-span-2 col-start-1 row-start-1 flex-1 text-center">
      <MetricBox>
        <LevelMeter bestThreshold={1} worstThreshold={16} unit="ms" value={1} />
        <MetricLabel>
          <MetricInfo label="verification times">
            TODO: Popover details
          </MetricInfo>
        </MetricLabel>
      </MetricBox>
    </div>

    <div className="col-start-2 row-start-2 text-center">
      <MetricBox>
        <MetricLabel>
          <MetricInfo label="protocol soundness">
            TODO: Popover details
          </MetricInfo>
        </MetricLabel>
        <div className="text-center font-sans text-base">formally audited</div>
      </MetricBox>
    </div>

    <div className="col-start-2 row-start-3 text-center">
      <MetricBox>
        <MetricLabel>
          <MetricInfo
            label="implementation soundness"
            className="block overflow-visible text-nowrap"
          >
            TODO: Popover details
          </MetricInfo>
        </MetricLabel>
        <div className="text-center font-sans text-base">not fully audited</div>
      </MetricBox>
    </div>

    <div className="col-start-2 row-start-4 text-center">
      <MetricBox>
        <MetricLabel>
          <MetricInfo label="EVM STF bytecode">
            TODO: Popover details
          </MetricInfo>
        </MetricLabel>
        <div className="text-center font-sans text-base">formally audited</div>
      </MetricBox>
    </div>

    <div className="col-start-3 row-span-2 row-start-2 text-[10rem]">
      <Pizza slices={DEMO_SLICES} />
    </div>

    <div className="col-start-3 row-start-4 self-end text-center">
      <MetricBox>
        <MetricLabel>
          <MetricInfo label="trusted setup">TODO: Popover details</MetricInfo>
        </MetricLabel>
        <div className="text-center font-sans text-base">formally audited</div>
      </MetricBox>
    </div>

    <div className="col-span-2 col-start-4 row-start-1 flex-1 text-center">
      <MetricBox>
        <LevelMeter
          bestThreshold={5}
          worstThreshold={1000}
          unit="kB"
          value={3}
        />
        <MetricLabel>
          <MetricInfo label="proof size">TODO: Popover details</MetricInfo>
        </MetricLabel>
      </MetricBox>
    </div>

    <div className="col-start-4 row-start-2 text-center">
      <MetricBox>
        <MetricLabel>
          <MetricInfo label="security target">TODO: Popover details</MetricInfo>
        </MetricLabel>
        <div className="text-center font-sans text-base">80 bits</div>
      </MetricBox>
    </div>

    <div className="col-start-4 row-start-3 text-center">
      <MetricBox>
        <MetricLabel>
          <MetricInfo label="quantum">TODO: Popover details</MetricInfo>
        </MetricLabel>
        <div className="text-center font-sans text-base">hash based</div>
      </MetricBox>
    </div>

    <div className="col-start-4 row-start-4 text-center">
      <MetricBox>
        <MetricLabel>
          <MetricInfo label="bounties">TODO: Popover details</MetricInfo>
        </MetricLabel>
        <div className="text-center font-sans text-base">+$1M a crit</div>
      </MetricBox>
    </div>
  </div>
)

ZkvmDetails.displayName = "ZkvmDetails"

export default ZkvmDetails
