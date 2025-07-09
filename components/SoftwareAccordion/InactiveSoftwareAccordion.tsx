import { Vendor, Zkvm, ZkvmVersion } from "@/lib/types"

import { InactiveSoftwareAccordionItem } from "./InactiveSoftwareAccordionItem"
import SoftwareAccordionLayout from "./SoftwareAccordion.layout"

export type InactiveZkvm = Zkvm & {
  versions: ZkvmVersion[]
  vendor: Vendor
  totalClusters: number
  activeClusters: number
}

interface InactiveSoftwareAccordionProps {
  zkvms: InactiveZkvm[]
}

export const InactiveSoftwareAccordion = ({
  zkvms,
}: InactiveSoftwareAccordionProps) => {
  return (
    <SoftwareAccordionLayout>
      {zkvms.map((zkvm) => (
        <InactiveSoftwareAccordionItem
          key={zkvm.id}
          value={"item-" + zkvm.id}
          zkvm={zkvm}
        />
      ))}
    </SoftwareAccordionLayout>
  )
}

InactiveSoftwareAccordion.displayName = "InactiveSoftwareAccordion"

export default InactiveSoftwareAccordion
