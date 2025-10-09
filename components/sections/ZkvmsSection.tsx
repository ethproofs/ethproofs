import type { SummaryItem } from "@/lib/types"

import { BasicTabs } from "../BasicTabs"
import KPIs from "../KPIs"
import SoftwareAccordion from "../SoftwareAccordion"
import { ButtonLink } from "../ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card"

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
          contentLeft={<SoftwareAccordion type="active" />}
          contentLeftTitle="active"
          contentRight={<SoftwareAccordion type="inactive" />}
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
