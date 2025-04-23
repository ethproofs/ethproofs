import { asc, notIlike } from "drizzle-orm"
import type { Metadata } from "next"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import { SummaryItem } from "@/lib/types"

import BlocksTable from "@/components/BlocksTable"
import KPIs from "@/components/KPIs"
import LineChartCard from "@/components/LineChartCard"
import MachineTabs from "@/components/MachineTabs"
import ProverDetails from "@/components/ProverDetails"
import Box from "@/components/svgs/box.svg"
import BoxDashed from "@/components/svgs/box-dashed.svg"
import Instructions from "@/components/svgs/instructions.svg"
import ShieldCheck from "@/components/svgs/shield-check.svg"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import ZkvmAccordion from "@/components/ZkvmAccordion"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import { db } from "@/db"
import { teamsSummary as teamsSummaryView } from "@/db/schema"
import { fetchBlocksPaginated } from "@/lib/api/blocks"
import { getMetadata } from "@/lib/metadata"
import { prettyMs } from "@/lib/time"

export const metadata: Metadata = getMetadata()

export default async function Index() {
  const queryClient = new QueryClient()

  const teamsSummary = await db
    .select()
    .from(teamsSummaryView)
    // hide test teams from the provers list
    .where(notIlike(teamsSummaryView.team_name, "%test%"))
    .orderBy(asc(teamsSummaryView.avg_proving_time))

  const teams = await db.query.teams.findMany()

  await queryClient.prefetchQuery({
    queryKey: ["blocks", DEFAULT_PAGE_STATE],
    queryFn: () => fetchBlocksPaginated(DEFAULT_PAGE_STATE),
  })

  // TODO: Use real data
  const demoZkVmSummary: SummaryItem[] = [
    {
      key: "zkvms",
      label: "zkVMs",
      value: 12,
      icon: <ShieldCheck />,
    },
    {
      key: "isas",
      label: "ISAs",
      value: 5,
      icon: <Instructions />,
    },
    {
      key: "count",
      label: "0000",
      value: 0,
      icon: <></>,
    },
  ]

  // TODO: Use real data
  const demoProversSummary: SummaryItem[] = [
    {
      key: "provers",
      label: "provers",
      value: 9,
      icon: <ShieldCheck />,
    },
    {
      key: "proving-machines",
      label: "proving machines",
      value: 124,
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
    <div className="flex flex-1 flex-col items-center gap-20 px-20 md:w-[calc(100vw_-_var(--sidebar-width))]">
      <section
        id="kpis"
        className="grid w-full max-w-screen-lg scroll-m-20 grid-cols-1 gap-8 md:grid-cols-2"
      >
        <div id="latency-kpi" className="w-full">
          <LineChartCard title="latency" />
        </div>
        <div id="cost-kpi" className="w-full">
          <LineChartCard title="cost" />
        </div>
      </section>

      <section id="zkvms" className="w-full max-w-screen-lg scroll-m-20">
        <Card className="bg-white/10 dark:bg-black/10">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">zkVMs</CardTitle>

            <KPIs items={demoZkVmSummary} />
          </CardHeader>

          <ZkvmAccordion />
        </Card>
      </section>

      <section id="provers" className="w-full max-w-screen-lg scroll-m-20">
        <Card className="bg-white/10 dark:bg-black/10">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">provers</CardTitle>

            <KPIs items={demoProversSummary} />
          </CardHeader>

          <MachineTabs
            singleContent={
              <>
                <ProverDetails />
                TODO: Single machine provers list
              </>
            }
            multiContent={
              <>
                <ProverDetails />
                TODO: Multi-machine provers list
              </>
            }
          />
        </Card>
      </section>

      <section id="blocks" className="w-full max-w-screen-lg scroll-m-20">
        <Card className="bg-white/10 dark:bg-black/10">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">latest blocks</CardTitle>

            <KPIs items={demoBlocksSummary} />
          </CardHeader>

          <MachineTabs
            singleContent={<>TODO: Single machine blocks list</>}
            multiContent={
              <HydrationBoundary state={dehydrate(queryClient)}>
                <BlocksTable teams={teams} />
              </HydrationBoundary>
            }
          />
        </Card>
      </section>
    </div>
  )
}
