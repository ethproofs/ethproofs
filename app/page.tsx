import { Suspense } from "react"
import type { Metadata } from "next"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import type { SummaryItem } from "@/lib/types"

import BlocksTable from "@/components/BlocksTable"
import KPIs from "@/components/KPIs"
import MachineTabs from "@/components/MachineTabs"
import ProofsStats from "@/components/ProofsStats"
import ProversSection from "@/components/ProversSection"
import SoftwareAccordion from "@/components/SoftwareAccordion"
import Box from "@/components/svgs/box.svg"
import BoxDashed from "@/components/svgs/box-dashed.svg"
import Instructions from "@/components/svgs/instructions.svg"
import ShieldCheck from "@/components/svgs/shield-check.svg"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import { db } from "@/db"
import { recentSummary as recentSummaryView } from "@/db/schema"
import { fetchBlocksPaginated } from "@/lib/api/blocks"
import { getMetadata } from "@/lib/metadata"
import { prettyMs } from "@/lib/time"
import { getZkvmsStats } from "@/lib/zkvms"

export const metadata: Metadata = getMetadata()

export default async function Index() {
  const queryClient = new QueryClient()

  const [recentSummary] = await db.select().from(recentSummaryView).limit(1)

  const teams = await db.query.teams.findMany()

  await queryClient.prefetchQuery({
    queryKey: ["blocks", DEFAULT_PAGE_STATE],
    queryFn: () => fetchBlocksPaginated(DEFAULT_PAGE_STATE),
  })

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
    <>
      <div className="absolute top-16 w-full space-y-12 px-6 text-center font-mono font-semibold sm:px-8 md:px-12 lg:px-16 xl:px-20">
        <h1
          className="text-3xl"
          style={{
            textShadow: `
          0 0 3rem hsla(var(--background-modal)),
          0 0 2rem hsla(var(--background-modal)),
          0 0 1rem hsla(var(--background-modal)),
          0 0 1rem hsla(var(--background-modal))`,
          }}
        >
          Building a fully SNARKed{" "}
          <span className="text-primary">Ethereum</span>
        </h1>
      </div>

      <div className="flex flex-1 flex-col items-center gap-20 px-6 sm:px-8 md:w-[calc(100vw_-_var(--sidebar-width))] md:px-12 lg:px-16 xl:px-20">
        <ProofsStats recentSummary={recentSummary} />

        <section id="zkvms" className="w-full max-w-screen-xl scroll-m-20">
          <Card>
            <CardHeader className="space-y-3">
              <CardTitle className="text-2xl">zkVMs</CardTitle>

              <KPIs items={zkvmsSummary} />
            </CardHeader>

            <SoftwareAccordion />
          </Card>
        </section>

        <section id="provers" className="w-full max-w-screen-xl scroll-m-20">
          <Suspense fallback={null}>
            <ProversSection />
          </Suspense>
        </section>

        <section id="blocks" className="w-full max-w-screen-xl scroll-m-20">
          <Card className="!p-0 !pb-6 md:!pb-8">
            <CardHeader className="space-y-3 p-6 pb-0 md:px-12 md:pt-8">
              <CardTitle className="text-2xl">latest blocks</CardTitle>

              <KPIs items={demoBlocksSummary} />
            </CardHeader>

            <MachineTabs
              singleContent={<>TODO: Single machine blocks list</>}
              multiContent={
                <HydrationBoundary state={dehydrate(queryClient)}>
                  <BlocksTable teams={teams} className="px-6" />
                </HydrationBoundary>
              }
            />
          </Card>
        </section>
      </div>
    </>
  )
}
