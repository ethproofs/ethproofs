import type { Metadata } from "next"

import { BasicTabs } from "@/components/BasicTabs"
import { ZkvmsTable } from "@/components/zkvms-table/zkvms-table"

import { getMetadata } from "@/lib/metadata"
import { getZkvmsMetricsByZkvmId } from "@/lib/metrics"
import { getZkvmsWithUsage } from "@/lib/zkvms"

export const metadata: Metadata = getMetadata({ title: "zkVMs" })

export default async function ZkvmsPage() {
  const zkvms = await getZkvmsWithUsage()
  const metricsByZkvmId = await getZkvmsMetricsByZkvmId({
    zkvmIds: zkvms.map((zkvm) => zkvm.id),
  })

  const sortedZkvms = zkvms.sort((a, b) => b.activeClusters - a.activeClusters)
  const activeZkvmsWithMetrics = sortedZkvms
    .filter((z) => z.activeClusters > 0)
    .map((zkvm) => ({
      ...zkvm,
      metrics: metricsByZkvmId.get(zkvm.id),
    }))
  const inactiveZkvms = sortedZkvms.filter((z) => z.activeClusters === 0)

  return (
    <div className="mx-auto mt-2 flex max-w-screen-xl flex-1 flex-col items-center gap-20 [&>section]:w-full">
      <section>
        <BasicTabs
          title="zkVMs"
          defaultTab={activeZkvmsWithMetrics.length === 0 ? "right" : "left"}
          contentLeft={
            <ZkvmsTable className="mt-4 px-6" zkvms={activeZkvmsWithMetrics} />
          }
          contentLeftTitle="active"
          contentRight={
            inactiveZkvms.length > 0 ? (
              <ZkvmsTable className="mt-4 px-6" zkvms={inactiveZkvms} />
            ) : null
          }
          contentRightTitle="coming soon"
        />
      </section>
    </div>
  )
}
