import { asc, notIlike } from "drizzle-orm"

import { SummaryItem } from "@/lib/types"

import Instructions from "@/components/svgs/instructions.svg"
import ShieldCheck from "@/components/svgs/shield-check.svg"

import { Card, CardHeader, CardTitle } from "./ui/card"
import KPIs from "./KPIs"
import MachineTabs from "./MachineTabs"
import ProverAccordion from "./ProverAccordion"

import { db } from "@/db"
import { teamsSummary as teamsSummaryView } from "@/db/schema"
import { getActiveMachineCount } from "@/lib/api/clusters"
import { demoProverAccordionDetails } from "@/lib/dummy-data"

const ProversSection = async () => {
  const teamsSummary = await db
    .select()
    .from(teamsSummaryView)
    // hide test teams from the provers list
    .where(notIlike(teamsSummaryView.team_name, "%test%"))
    .orderBy(asc(teamsSummaryView.avg_proving_time))

  const machineCount = await getActiveMachineCount()

  const proversSummary: SummaryItem[] = [
    {
      key: "provers",
      label: "provers",
      value: teamsSummary.length,
      icon: <ShieldCheck />,
    },
    {
      key: "proving-machines",
      label: "proving machines",
      value: machineCount,
      icon: <Instructions />,
    },
    {
      key: "annual-proving-costs",
      label: "annual proving costs",
      value: new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        notation: "compact",
      }).format(100_000),
      icon: <></>,
    },
  ]

  return (
    <Card className="!p-0 !pb-6 md:!pb-8">
      <CardHeader className="space-y-3 p-6 pb-0 md:px-12 md:pt-8">
        <CardTitle className="text-2xl">provers</CardTitle>

        <KPIs items={proversSummary} />
      </CardHeader>

      <MachineTabs
        singleContent={
          <>
            <ProverAccordion provers={demoProverAccordionDetails} />
            TODO: Single machine provers list
          </>
        }
        multiContent={
          <>
            <ProverAccordion provers={demoProverAccordionDetails} />
            TODO: Multi-machine provers list
          </>
        }
      />
    </Card>
  )
}

export default ProversSection
