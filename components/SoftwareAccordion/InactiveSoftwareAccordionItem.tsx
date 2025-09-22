import { type AccordionItemProps } from "@radix-ui/react-accordion"

import type { Slices } from "@/lib/types"

import Pizza from "../Pizza"
import { AccordionTrigger } from "../ui/accordion"

import { InactiveZkvm } from "./InactiveSoftwareAccordion"
import SoftwareAccordionItemLayout from "./SoftwareAccordionItem.layout"

const disabledSlices: Slices = [
  { level: undefined },
  { level: undefined },
  { level: undefined },
  { level: undefined },
  { level: undefined },
  { level: undefined },
  { level: undefined },
  { level: undefined },
]

export const InactiveSoftwareAccordionItem = ({
  value,
  zkvm,
}: Pick<AccordionItemProps, "value"> & {
  zkvm: InactiveZkvm
}) => {
  return (
    <SoftwareAccordionItemLayout
      value={value}
      zkvm={zkvm}
      trigger={
        <AccordionTrigger
          disabled
          className="col-start-8 my-4 h-fit gap-2 rounded-full border p-0.5 pe-2 text-4xl text-border [&>svg]:size-6"
        >
          <Pizza slices={disabledSlices} disableEffects />
        </AccordionTrigger>
      }
    />
  )
}
