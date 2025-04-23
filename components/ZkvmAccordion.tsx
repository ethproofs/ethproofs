// TODO: Pass data as props

import { type AccordionItemProps } from "@radix-ui/react-accordion"

import SuccinctLogo from "@/components/svgs/succinct-logo.svg"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"
import { MetricBox, MetricInfo, MetricLabel } from "./ui/metric"
import Pizza from "./Pizza"
import ZkvmDetails, { DEMO_SLICES } from "./ZkvmDetails"

const ZkvmAccordionItem = ({ value }: Pick<AccordionItemProps, "value">) => (
  <AccordionItem value={value} className="col-span-5 grid grid-cols-subgrid">
    <div className="col-span-5 grid grid-cols-subgrid items-center gap-12 border-b">
      <div className="col-start-1 flex items-center gap-3">
        <span className="block font-mono text-2xl text-primary">SP1</span>
        <span className="block font-mono text-sm italic text-body-secondary">
          by
        </span>
        <SuccinctLogo />
      </div>
      <div id="version" className="col-start-2">
        4.20
      </div>
      <div id="isa" className="col-start-3">
        name
      </div>
      <div id="used-by" className="col-start-4">
        5/<span className="text-xs">12</span>
      </div>

      <AccordionTrigger className="col-start-5 my-2 h-fit gap-2 rounded-full border-2 border-primary-border bg-background-highlight p-0.5 text-primary [&>svg]:size-6">
        <Pizza slices={DEMO_SLICES} disableEffects />
      </AccordionTrigger>
    </div>
    <AccordionContent className="col-span-full border-b p-0">
      <ZkvmDetails />
    </AccordionContent>
  </AccordionItem>
)
const ZkvmAccordion = () => (
  <Accordion
    type="multiple"
    className="grid w-full grid-cols-[1fr_repeat(4,_auto)]"
  >
    <div className="col-span-5 grid grid-cols-subgrid text-center">
      <MetricBox className="col-start-2">
        <MetricLabel>
          <MetricInfo label="Version">TODO: Popover details</MetricInfo>
        </MetricLabel>
      </MetricBox>
      <MetricBox className="col-start-3">
        <MetricLabel>
          <MetricInfo label="ISA">
            Instruction set architecture
            <br />
            TODO: Popover details
          </MetricInfo>
        </MetricLabel>
      </MetricBox>
      <MetricBox className="col-start-4">
        <MetricLabel>
          <MetricInfo label="Used by">TODO: Popover details</MetricInfo>
        </MetricLabel>
      </MetricBox>
    </div>
    {Array.from({ length: 12 }, (_, i) => (
      <ZkvmAccordionItem key={i} value={"item-" + i} />
    ))}
  </Accordion>
)

ZkvmAccordion.displayName = "ZkvmAccordion"

export default ZkvmAccordion
