// TODO: PAss data as props

import Pizza from "./Pizza"
import ZkvmDetails, { DEMO_SLICES } from "./ZkvmDetails"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion"

import SuccinctLogo from "@/components/svgs/succinct-logo.svg"

const ZkvmAccordion = () => (
  <Accordion type="multiple">
    <AccordionItem value="item-1 w-full">
      <div className="flex justify-between border-b">
        <div className="flex items-center gap-3">
          <span className="block font-mono text-2xl text-primary">SP1</span>
          <span className="block font-mono text-sm italic text-body-secondary">
            by
          </span>
          <SuccinctLogo />
        </div>
        <AccordionTrigger className="my-2 h-fit gap-2 rounded-full border-2 border-primary-border bg-background-highlight p-0.5 text-primary [&>svg]:size-6">
          <Pizza slices={DEMO_SLICES} disableEffects />
        </AccordionTrigger>
      </div>
      <AccordionContent className="border-b p-0">
        <ZkvmDetails />
      </AccordionContent>
    </AccordionItem>
  </Accordion>
)

ZkvmAccordion.displayName = "ZkvmAccordion"

export default ZkvmAccordion
