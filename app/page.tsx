import { Suspense } from "react"
import type { Metadata } from "next"

import GrantsBanner from "@/components/banners/GrantsBanner"
import ProverCountdownBanner from "@/components/banners/ProverCountdownBanner"
import VerifierCountdownBanner from "@/components/banners/VerifierCountdownBanner"
import ProofsStats from "@/components/ProofsStats"
import BlocksSection from "@/components/sections/BlocksSection"
import ProversSection from "@/components/sections/ProversSection"
import ZkvmsSection from "@/components/sections/ZkvmsSection"
import EthproofsLineworkIcon from "@/components/svgs/ethproofs-linework-icon.svg"

import { getRecentSummary } from "@/lib/api/stats"
import { getMetadata } from "@/lib/metadata"
import { ZkvmsTable } from "@/components/zkvms-table/zkvms-table"
import { BasicTabs } from "@/components/BasicTabs"
import { getZkvmsMetricsByZkvmId } from "@/lib/metrics"
import { getZkvmsWithUsage } from "@/lib/zkvms"

export const metadata: Metadata = getMetadata()

export const dynamic = "force-dynamic"

export default async function Index() {
  // const recentSummary = await getRecentSummary()
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
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center sm:items-start md:items-center">
          <EthproofsLineworkIcon className="h-96 w-96 text-muted-foreground opacity-20 md:h-[36rem] md:w-[36rem] lg:h-[48rem] lg:w-[48rem]" />
        </div>

        <h1 className="relative z-10 mb-24 mt-16 px-0 text-center text-3xl font-semibold md:mt-24 md:px-8">
          <div className="flex flex-col items-center justify-center gap-0 sm:flex-row">
            <span>race to prove </span>
            <div className="flex items-center">
              <span className="pl-2 font-heading text-primary sm:pl-2">
                Eth
              </span>
              <span className="inline pr-2 font-heading text-primary">
                ereum
              </span>
            </div>
            <span> in real time</span>
          </div>
        </h1>

        <div className="relative z-10 mx-auto mb-4 flex max-w-screen-xl flex-col items-center px-6 md:px-8 [&>section]:w-full">
          <section id="countdown-banners">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
              <VerifierCountdownBanner />
              <ProverCountdownBanner />
            </div>
          </section>
        </div>
      </div>

      <div className="mx-auto mb-16 flex max-w-screen-xl flex-col items-center px-6 md:px-8 [&>section]:w-full">
        <section id="grants-banner">
          <GrantsBanner />
        </section>
      </div>

      <div className="mx-auto mt-2 flex max-w-screen-xl flex-1 flex-col items-center gap-20 [&>section]:w-full">
        {/* <ProofsStats recentSummary={recentSummary} /> */}
        {/* <section>
          <BasicTabs
            title="zkVMs"
            defaultTab="left"
            contentLeft={
              <ZkvmsTable className="px-6" zkvms={activeZkvmsWithMetrics} />
            }
            contentLeftTitle="active"
            contentRight={
              inactiveZkvms.length > 0 ? (
                <ZkvmsTable className="px-6" zkvms={inactiveZkvms} />
              ) : null
            }
            contentRightTitle="coming soon"
          />
        </section> */}
      </div>
    </>
  )
}
