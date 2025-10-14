import type { SummaryItem } from "@/lib/types"

import { BasicTabs } from "../BasicTabs"
import KPIs from "../KPIs"
import { ZkvmsTable } from "../zkvms-table/zkvms-table"
import { ButtonLink } from "../ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"

import { getZkvmsMetricsByZkvmId } from "@/lib/metrics"
import { getZkvmsStats, getZkvmsWithUsage } from "@/lib/zkvms"

const ZkvmsSection = async () => {
  const [zkvmsStats, zkvms] = await Promise.all([
    getZkvmsStats(),
    getZkvmsWithUsage(),
  ])

  const metricsByZkvmId = await getZkvmsMetricsByZkvmId({
    zkvmIds: zkvms.map((zkvm) => zkvm.id),
  })

  const zkvmsSummary: SummaryItem[] = [
    {
      key: "zkvms",
      label: "zkVMs",
      value: zkvmsStats.count,
    },
    {
      key: "isas",
      label: "ISAs",
      value: zkvmsStats.isas.length,
    },
  ]

  const sortedZkvms = zkvms.sort((a, b) => b.activeClusters - a.activeClusters)
  const activeZkvmsWithMetrics = sortedZkvms
    .filter((z) => z.activeClusters > 0)
    .map((zkvm) => ({
      ...zkvm,
      metrics: metricsByZkvmId.get(zkvm.id),
    }))
  const inactiveZkvms = sortedZkvms.filter((z) => z.activeClusters === 0)

  return (
    <Card className="!p-0 !pb-6 md:!pb-8">
      <CardHeader className="flex items-center justify-between sm:flex-row md:px-12 max-sm:[&>div]:w-full">
        <CardTitle className="text-3xl font-normal tracking-[1px] max-sm:pt-8">
          zkVMs
        </CardTitle>

        <div>
          <KPIs items={zkvmsSummary} />
        </div>
      </CardHeader>

      <CardContent className="px-0 pt-6">
        <BasicTabs
          defaultTab="left"
          contentLeft={<ZkvmsTable className="px-6" zkvms={activeZkvmsWithMetrics} />}
          contentLeftTitle="active"
          contentRight={
            inactiveZkvms.length > 0 ? (
              <ZkvmsTable className="px-6" zkvms={inactiveZkvms} />
            ) : null
          }
          contentRightTitle="coming soon"
        />
      </CardContent>

      <CardFooter className="justify-center">
        <ButtonLink variant="outline" href="/zkvms" className="min-w-40">
          see all
        </ButtonLink>
      </CardFooter>
    </Card>
  )
}

export default ZkvmsSection
