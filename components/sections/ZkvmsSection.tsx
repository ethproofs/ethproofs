import { SummaryItem } from "@/lib/types"

import KPIs from "../KPIs"
import SoftwareAccordion from "../SoftwareAccordion"
import { ButtonLink } from "../ui/button"
import { Card, CardHeader, CardTitle } from "../ui/card"

import { getZkvmsStats } from "@/lib/zkvms"

const ZkvmsSection = async () => {
  const zkvmsStats = await getZkvmsStats()

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

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl font-normal tracking-[1px]">
          zkVMs
        </CardTitle>

        <div className="py-4">
          <KPIs items={zkvmsSummary} />
        </div>
      </CardHeader>

      <SoftwareAccordion />

      <div className="flex justify-center">
        <ButtonLink variant="outline" href="/zkvms">
          See all
        </ButtonLink>
      </div>
    </Card>
  )
}

export default ZkvmsSection
