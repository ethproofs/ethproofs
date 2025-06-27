import { ActiveSoftwareAccordion } from "./ActiveSoftwareAccordian"
import { InactiveSoftwareAccordion } from "./InactiveSoftwareAccordion"

import { getZkvmsMetricsByZkvmId } from "@/lib/metrics"
import { getZkvmsWithUsage } from "@/lib/zkvms"

interface SoftwareAccordionProps {
  type: "active" | "inactive"
}

const SoftwareAccordion = async ({ type }: SoftwareAccordionProps) => {
  const zkvms = await getZkvmsWithUsage()
  const metricsByZkvmId = await getZkvmsMetricsByZkvmId({
    zkvmIds: zkvms.map((zkvm) => zkvm.id),
  })
  console.log("zkvms", zkvms)
  // sort active zkvms by usage
  const sortedZkvmsActive = zkvms
    .filter((z) => z.is_active)
    .sort((a, b) => b.activeClusters - a.activeClusters)

  // sort inactive zkvms?
  const sortedZkvmsInactive = zkvms.filter((z) => !z.is_active)
  // .sort((a, b) => b.activeClusters - a.activeClusters)

  return type === "active" ? (
    <ActiveSoftwareAccordion
      zkvms={sortedZkvmsActive}
      metrics={metricsByZkvmId}
    />
  ) : (
    <InactiveSoftwareAccordion
      zkvms={sortedZkvmsInactive}
      metrics={metricsByZkvmId}
    />
  )
}

SoftwareAccordion.displayName = "SoftwareAccordion"

export default SoftwareAccordion
