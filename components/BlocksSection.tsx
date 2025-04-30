import { SummaryItem } from "@/lib/types"

import Box from "@/components/svgs/box.svg"
import BoxDashed from "@/components/svgs/box-dashed.svg"

import { ButtonLink } from "./ui/button"
import { Card, CardHeader, CardTitle } from "./ui/card"
import KPIs from "./KPIs"
import MachineTabs from "./MachineTabs"
import SimpleBlockTable from "./SimpleBlockTable"

import { prettyMs } from "@/lib/time"

const BlocksSection = async () => {
  // TODO: Use real data
  const demoBlocksSummary: SummaryItem[] = [
    {
      key: "proof-time",
      label: "since last proof",
      value: prettyMs(94_000), // TODO: Calculate
      icon: <BoxDashed className="text-body-secondary" />,
    },
    {
      key: "proving-count",
      label: "proving",
      value: 124,
      icon: <Box className="text-body-secondary" strokeWidth="1" />,
    },
    {
      key: "recent-proving-count",
      label: "proven in last 30 days",
      value: new Intl.NumberFormat("en-US", {
        notation: "compact",
      }).format(2147),
      icon: <Box className="text-primary" strokeWidth="1" />,
    },
  ]

  return (
    <Card className="!p-0 !pb-6 md:!pb-8">
      <CardHeader className="space-y-3 p-6 pb-0 md:px-12 md:pt-8">
        <CardTitle className="text-2xl">latest blocks</CardTitle>

        <KPIs items={demoBlocksSummary} />
      </CardHeader>

      <MachineTabs
        singleContent={
          <SimpleBlockTable machineType="single" className="px-6" />
        }
        multiContent={<SimpleBlockTable machineType="multi" className="px-6" />}
      />

      <div className="flex justify-center">
        <ButtonLink variant="outline" href="/blocks">
          See all
        </ButtonLink>
      </div>
    </Card>
  )
}

export default BlocksSection
