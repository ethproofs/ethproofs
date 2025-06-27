import { Vendor, Zkvm, ZkvmMetrics, ZkvmVersion } from "@/lib/types"

import { Accordion } from "../ui/accordion"
import { MetricBox, MetricInfo, MetricLabel } from "../ui/metric"
import { TooltipContentHeader } from "../ui/tooltip"

import { ActiveSoftwareAccordionItem } from "./ActiveSoftwareAccordionItem"

export type ActiveZkvm = Zkvm & {
  versions: ZkvmVersion[]
  vendor: Vendor
  totalClusters: number
  activeClusters: number
}

interface ActiveSoftwareAccordionProps {
  zkvms: ActiveZkvm[]
  metrics: Map<number, Partial<ZkvmMetrics>>
}

export const ActiveSoftwareAccordion = ({
  zkvms,
  metrics,
}: ActiveSoftwareAccordionProps) => {
  return (
    <Accordion
      type="multiple"
      className="grid w-full grid-cols-[1fr_repeat(4,_auto)]"
    >
      <div className="col-span-5 grid grid-cols-subgrid gap-4 text-center">
        <MetricBox className="col-start-2">
          <MetricLabel>
            <MetricInfo label="latest version">
              <TooltipContentHeader>latest version</TooltipContentHeader>
              The most recent version of this zkVM being used by teams on
              ethproofs.org
            </MetricInfo>
          </MetricLabel>
        </MetricBox>
        <MetricBox className="col-start-3">
          <MetricLabel>
            <MetricInfo label="ISA">
              <TooltipContentHeader>
                instruction set architecture
              </TooltipContentHeader>
              Defines the instruction set this zkVM implements to generate
              zero-knowledge proofs for Ethereum transactions. The ISA
              determines which EVM operations can be efficiently proven and
              verified on-chain
            </MetricInfo>
          </MetricLabel>
        </MetricBox>
        <MetricBox className="col-start-4">
          <MetricLabel>
            <MetricInfo label="used by">
              <TooltipContentHeader>
                number of active clusters
              </TooltipContentHeader>
              Number of active clusters that use this zkVM on ethproofs.org
            </MetricInfo>
          </MetricLabel>
        </MetricBox>
      </div>
      {zkvms.map((zkvm) => (
        <ActiveSoftwareAccordionItem
          key={zkvm.id}
          value={"item-" + zkvm.id}
          zkvm={zkvm}
          metrics={metrics.get(zkvm.id)}
        />
      ))}
    </Accordion>
  )
}

ActiveSoftwareAccordion.displayName = "ActiveSoftwareAccordion"

export default ActiveSoftwareAccordion
