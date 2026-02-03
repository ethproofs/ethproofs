import type { Metadata } from "next"

import { MetricCards } from "@/components/metric-cards"
import { ProvableSecurityDisplay } from "@/components/provable-security/provable-security-display"

import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export const dynamic = "force-dynamic"

export default async function Index() {
  return (
    <>
      <div className="relative">
        <h1 className="relative z-10 mb-8 mt-8 px-0 text-center text-3xl font-semibold md:px-8">
          <div className="flex flex-col items-center justify-center gap-0 sm:flex-row">
            <span>race to </span>
            <div className="flex items-center">
              <span className="px-2 font-heading text-primary">
                mainnet-grade
              </span>
            </div>
            <span> L1 zkEVMs</span>
          </div>
        </h1>

        {/* section: countdown banners */}
        <div className="relative z-10 mx-auto mb-4 flex max-w-screen-xl flex-col items-center px-6 [&>section]:w-full">
          <section id="countdown-banners">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
              <></>
            </div>
          </section>
        </div>

        <div className="relative mx-auto mb-8 flex max-w-screen-xl flex-col items-center px-6 [&>section]:w-full">
          <section id="metrics">
            <MetricCards />
          </section>
        </div>
      </div>

      <div className="relative mx-auto mb-8 flex max-w-screen-xl flex-col items-center px-6 [&>section]:w-full">
        <section id="provable-security">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
            <ProvableSecurityDisplay />
          </div>
        </section>
      </div>
    </>
  )
}
