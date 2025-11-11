import type { Metadata } from "next"

import { ProverCountdownBanner } from "@/components/banners/ProverCountdownBanner"
import { VerifierCountdownBanner } from "@/components/banners/VerifierCountdownBanner"
import { MetricCards } from "@/components/metric-cards"
import { RealtimeProofsDisplay } from "@/components/realtime/realtime-proofs-display"
import EthproofsLineworkIcon from "@/components/svgs/ethproofs-linework-icon.svg"

import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export const dynamic = "force-dynamic"

export default async function Index() {
  return (
    <>
      <div className="relative">
        {/* <div className="absolute inset-0 -z-10 mt-48 flex items-center justify-center sm:items-start md:items-center">
          <EthproofsLineworkIcon className="h-96 w-96 text-muted-foreground opacity-20 md:h-[36rem] md:w-[36rem] lg:h-[48rem] lg:w-[48rem]" />
        </div> */}

        <h1 className="relative z-10 mb-8 mt-8 px-0 text-center text-3xl font-semibold md:px-8">
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

        <div className="relative z-10 mx-auto mb-4 flex max-w-screen-xl flex-col items-center px-6 [&>section]:w-full">
          <section id="countdown-banners">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
              <VerifierCountdownBanner isSuccess />
              <ProverCountdownBanner />
            </div>
          </section>
        </div>

        <div className="relative z-10 mx-auto mb-8 flex max-w-screen-xl flex-col items-center px-6 [&>section]:w-full">
          <section id="countdown-banners">
            <MetricCards />
          </section>
        </div>
      </div>

      <div className="mx-auto mb-16 flex max-w-screen-xl flex-col items-center px-6 [&>section]:w-full">
        <section id="realtime-proofs">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
            <RealtimeProofsDisplay />
          </div>
        </section>
      </div>
    </>
  )
}
