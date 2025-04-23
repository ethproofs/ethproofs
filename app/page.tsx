import { asc, notIlike } from "drizzle-orm"
import type { Metadata } from "next"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import type { ClusterDetails, SummaryItem } from "@/lib/types"

import BlocksTable from "@/components/BlocksTable"
import KPIs from "@/components/KPIs"
import LineChartCard from "@/components/LineChartCard"
import MachineTabs from "@/components/MachineTabs"
import ProverAccordion from "@/components/ProverAccordion"
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

  const demoClusterDetails: ClusterDetails[] = [
    {
      gpuCount: 2,
      clusterName: "Cluster A",
      machines: [
        {
          machineName: "Machine A1",
          cpuCount: 4,
          gpuRam: 8 * 2 ** 30,
          cpuRam: 8 * 2 ** 30,
        },
        {
          machineName: "Machine A2",
          cpuCount: 8,
          gpuRam: 16 * 2 ** 30,
          cpuRam: 16 * 2 ** 30,
        },
      ],
    },
    {
      gpuCount: 8,
      clusterName: "Cluster B",
      machines: [
        {
          machineName: "Machine B1",
          cpuCount: 16,
          gpuRam: 32 * 2 ** 30,
          cpuRam: 32 * 2 ** 30,
        },
        {
          machineName: "Machine B2",
          cpuCount: 8,
          gpuRam: 24 * 2 ** 30,
          cpuRam: 24 * 2 ** 30,
        },
      ],
    },
    {
      gpuCount: 8,
      clusterName: "Cluster C",
      machines: [
        {
          machineName: "Machine C1",
          cpuCount: 4,
          gpuRam: 12 * 2 ** 30,
          cpuRam: 12 * 2 ** 30,
        },
        {
          machineName: "Machine C2",
          cpuCount: 6,
          gpuRam: 16 * 2 ** 30,
          cpuRam: 16 * 2 ** 30,
        },
      ],
    },
    {
      gpuCount: 4,
      clusterName: "Cluster D",
      machines: [
        {
          machineName: "Machine D1",
          cpuCount: 2,
          gpuRam: 4 * 2 ** 30,
          cpuRam: 4 * 2 ** 30,
        },
        {
          machineName: "Machine D2",
          cpuCount: 4,
          gpuRam: 8 * 2 ** 30,
          cpuRam: 8 * 2 ** 30,
        },
      ],
    },
    {
      gpuCount: 1,
      clusterName: "Cluster E",
      machines: [
        {
          machineName: "Machine E1",
          cpuCount: 1,
          gpuRam: 2 * 2 ** 30,
          cpuRam: 2 * 2 ** 30,
        },
      ],
    },
    {
      gpuCount: 16,
      clusterName: "Cluster F",
      machines: [
        {
          machineName: "Machine F1",
          cpuCount: 32,
          gpuRam: 64 * 2 ** 30,
          cpuRam: 64 * 2 ** 30,
        },
        {
          machineName: "Machine F2",
          cpuCount: 16,
          gpuRam: 48 * 2 ** 30,
          cpuRam: 48 * 2 ** 30,
        },
      ],
    },
    {
      gpuCount: 32,
      clusterName: "Cluster G",
      machines: [
        {
          machineName: "Machine G1",
          cpuCount: 64,
          gpuRam: 128 * 2 ** 30,
          cpuRam: 128 * 2 ** 30,
        },
        {
          machineName: "Machine G2",
          cpuCount: 32,
          gpuRam: 96 * 2 ** 30,
          cpuRam: 96 * 2 ** 30,
        },
      ],
    },
    {
      gpuCount: 8,
      clusterName: "Cluster H",
      machines: [
        {
          machineName: "Machine H1",
          cpuCount: 8,
          gpuRam: 16 * 2 ** 30,
          cpuRam: 16 * 2 ** 30,
        },
        {
          machineName: "Machine H2",
          cpuCount: 8,
          gpuRam: 16 * 2 ** 30,
          cpuRam: 16 * 2 ** 30,
        },
      ],
    },
    {
      gpuCount: 8,
      clusterName: "Cluster I",
      machines: [
        {
          machineName: "Machine I1",
          cpuCount: 12,
          gpuRam: 24 * 2 ** 30,
          cpuRam: 24 * 2 ** 30,
        },
        {
          machineName: "Machine I2",
          cpuCount: 16,
          gpuRam: 32 * 2 ** 30,
          cpuRam: 32 * 2 ** 30,
        },
      ],
    },
    {
      gpuCount: 4,
      clusterName: "Cluster J",
      machines: [
        {
          machineName: "Machine J1",
          cpuCount: 4,
          gpuRam: 8 * 2 ** 30,
          cpuRam: 8 * 2 ** 30,
        },
        {
          machineName: "Machine J2",
          cpuCount: 6,
          gpuRam: 12 * 2 ** 30,
          cpuRam: 12 * 2 ** 30,
        },
      ],
    },
  ]

  const demoProverAccordionDetails = Array(9).fill({
    clusterDetails: demoClusterDetails,
  })

  return (
    <div className="flex flex-1 flex-col items-center gap-20 px-20 md:w-[calc(100vw_-_var(--sidebar-width))]">
      <section
        id="kpis"
        className="grid w-full max-w-screen-xl scroll-m-20 grid-cols-1 gap-8 md:grid-cols-2"
      >
        <div id="latency-kpi" className="w-full">
          <LineChartCard title="latency" />
        </div>
        <div id="cost-kpi" className="w-full">
          <LineChartCard title="cost" />
        </div>
      </section>

      <section id="zkvms" className="w-full max-w-screen-xl scroll-m-20">
        <Card className="bg-white/10 dark:bg-black/10">
          <CardHeader className="space-y-3">
            <CardTitle className="text-2xl">zkVMs</CardTitle>

            <KPIs items={demoZkVmSummary} />
          </CardHeader>

          <ZkvmAccordion />
        </Card>
      </section>

      <section id="provers" className="w-full max-w-screen-xl scroll-m-20">
        <Card className="bg-white/10 !p-0 !pb-6 dark:bg-black/10 md:!pb-8">
          <CardHeader className="space-y-3 p-6 pb-0 md:px-12 md:pt-8">
            <CardTitle className="text-2xl">provers</CardTitle>

            <KPIs items={demoProversSummary} />
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
      </section>

      <section id="blocks" className="w-full max-w-screen-xl scroll-m-20">
        <Card className="bg-white/10 !p-0 !pb-6 dark:bg-black/10 md:!pb-8">
          <CardHeader className="space-y-3 p-6 pb-0 md:px-12 md:pt-8">
            <CardTitle className="text-2xl">latest blocks</CardTitle>

            <KPIs items={demoBlocksSummary} />
          </CardHeader>

          <MachineTabs
            singleContent={<>TODO: Single machine blocks list</>}
            multiContent={
              <div className="ps-6">
                <HydrationBoundary state={dehydrate(queryClient)}>
                  <BlocksTable teams={teams} />
                </HydrationBoundary>
              </div>
            }
          />
        </Card>
      </section>
    </div>
  )
}
