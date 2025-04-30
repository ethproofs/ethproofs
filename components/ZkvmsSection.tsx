import { SummaryItem } from "@/lib/types"

import Instructions from "@/components/svgs/instructions.svg"
import ShieldCheck from "@/components/svgs/shield-check.svg"

import { ButtonLink } from "./ui/button"
import { Card, CardHeader, CardTitle } from "./ui/card"
import KPIs from "./KPIs"
import SoftwareAccordion from "./SoftwareAccordion"

import { getZkvmsStats } from "@/lib/zkvms"

const ZkvmsSection = async () => {
  const zkvmsStats = await getZkvmsStats()

  const zkvmsSummary: SummaryItem[] = [
    {
      key: "zkvms",
      label: "zkVMs",
      value: zkvmsStats.count,
      icon: <ShieldCheck />,
    },
    {
      key: "isas",
      label: "ISAs",
      value: zkvmsStats.isas.length,
      icon: <Instructions />,
    },
  ]

  return (
    <Card>
      <CardHeader className="space-y-3">
        <CardTitle className="text-2xl">zkVMs</CardTitle>

        <KPIs items={zkvmsSummary} />
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
