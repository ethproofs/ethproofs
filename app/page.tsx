import type { Metadata } from "next"

import GrantsBanner from "@/components/banners/GrantsBanner"
import { ProverCountdownBanner } from "@/components/banners/ProverCountdownBanner"
import { VerifierCountdownBanner } from "@/components/banners/VerifierCountdownBanner"
import { ProofMetrics } from "@/components/proof-metrics"
import EthproofsLineworkIcon from "@/components/svgs/ethproofs-linework-icon.svg"

import { getRecentSummary } from "@/lib/api/stats"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export const dynamic = "force-dynamic"

export default async function Index() {
  const recentSummary = await getRecentSummary()

  return (
    <>
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center sm:items-start md:items-center">
          <EthproofsLineworkIcon className="h-96 w-96 text-muted-foreground opacity-20 md:h-[36rem] md:w-[36rem] lg:h-[48rem] lg:w-[48rem]" />
        </div>

        <h1 className="relative z-10 mb-24 mt-16 px-0 text-center text-3xl font-semibold md:mt-20 md:px-8">
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
              <VerifierCountdownBanner isSuccess />
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

      <div className="mx-auto mb-16 flex max-w-screen-xl flex-col items-center px-6 md:px-8 [&>section]:w-full">
        <section id="proof-metrics">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
            <ProofMetrics recentSummary={recentSummary} />
          </div>
        </section>
      </div>
    </>
  )
}
