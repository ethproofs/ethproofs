import { Vendor, Zkvm, ZkvmMetrics, ZkvmVersion } from "@/lib/types"

import { ActiveSoftwareAccordionItem } from "./ActiveSoftwareAccordionItem"
import SoftwareAccordionLayout from "./SoftwareAccordion.layout"

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
    <SoftwareAccordionLayout>
      {zkvms.map((zkvm) => (
        <ActiveSoftwareAccordionItem
          key={zkvm.id}
          value={"item-" + zkvm.id}
          zkvm={zkvm}
          metrics={metrics.get(zkvm.id)}
        />
      ))}
    </SoftwareAccordionLayout>
  )
}

ActiveSoftwareAccordion.displayName = "ActiveSoftwareAccordion"

export default ActiveSoftwareAccordion
