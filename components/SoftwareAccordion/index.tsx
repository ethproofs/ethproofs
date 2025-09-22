import { ActiveSoftwareAccordion } from "./ActiveSoftwareAccordion"
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

  const sortedZkvms = zkvms.sort((a, b) => b.activeClusters - a.activeClusters)
  const activeZkvms = sortedZkvms.filter((z) => z.activeClusters > 0)
  const inactiveZkvms = sortedZkvms.filter((z) => z.activeClusters === 0)
  const hasInactiveZkvms = inactiveZkvms.length > 0

  return type === "active" ? (
    <ActiveSoftwareAccordion zkvms={activeZkvms} metrics={metricsByZkvmId} />
  ) : hasInactiveZkvms ? (
    <InactiveSoftwareAccordion zkvms={inactiveZkvms} />
  ) : null
}

SoftwareAccordion.displayName = "SoftwareAccordion"

export default SoftwareAccordion
