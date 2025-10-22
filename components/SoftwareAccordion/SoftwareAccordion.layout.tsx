import { Accordion } from "../ui/accordion"
import { MetricBox, MetricInfo, MetricLabel } from "../ui/metric"
import { TooltipContentHeader } from "../ui/tooltip"

function SoftwareAccordionLayout({ children }: { children: React.ReactNode }) {
  return (
    <Accordion
      type="multiple"
      className="grid w-full grid-cols-[1fr_repeat(7,_auto)]"
    >
      <div className="col-span-8 grid grid-cols-subgrid gap-4 text-center">
        <MetricBox className="col-start-2">
          <MetricLabel>verifier open source</MetricLabel>
        </MetricBox>
        <MetricBox className="col-start-3">
          <MetricLabel>dual license</MetricLabel>
        </MetricBox>
        <MetricBox className="col-start-4">
          <MetricLabel className="normal-case">mainnet capable</MetricLabel>
        </MetricBox>
        <MetricBox className="col-start-5">
          <MetricLabel>
            <MetricInfo label="latest version">
              <TooltipContentHeader>latest version</TooltipContentHeader>
              The most recent version of this zkVM being used by teams on
              ethproofs.org.
            </MetricInfo>
          </MetricLabel>
        </MetricBox>
        <MetricBox className="col-start-6">
          <MetricLabel>
            <MetricInfo label="ISA">
              <TooltipContentHeader>
                Instruction Set Architecture (ISA)
              </TooltipContentHeader>
              Defines the instruction set this zkVM implements to generate
              zero-knowledge proofs for Ethereum transactions. The ISA
              determines which EVM operations can be efficiently proven and
              verified on-chain.
            </MetricInfo>
          </MetricLabel>
        </MetricBox>
        <MetricBox className="col-start-7">
          <MetricLabel>
            <MetricInfo label="used by">
              <TooltipContentHeader>
                number of active clusters
              </TooltipContentHeader>
              Number of active clusters that use this zkVM on ethproofs.org.
            </MetricInfo>
          </MetricLabel>
        </MetricBox>
      </div>
      {children}
    </Accordion>
  )
}

SoftwareAccordionLayout.displayName = "SoftwareAccordionLayout"

export default SoftwareAccordionLayout
