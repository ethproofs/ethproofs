import { Suspense } from "react"
import type { Metadata } from "next"

import GrantsBanner from "@/components/banners/GrantsBanner"
import ProverCountdownBanner from "@/components/banners/ProverCountdownBanner"
import VerifierCountdownBanner from "@/components/banners/VerifierCountdownBanner"
import ProofsStats from "@/components/ProofsStats"
import BlocksSection from "@/components/sections/BlocksSection"
import ProversSection from "@/components/sections/ProversSection"
import ZkvmsSection from "@/components/sections/ZkvmsSection"

import { getRecentSummary } from "@/lib/api/stats"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export const dynamic = "force-dynamic"

export default async function Index() {
  const recentSummary = await getRecentSummary()

  return (
    <>
      <h1 className="text-shadow mb-24 mt-16 px-6 text-center text-3xl font-semibold md:mt-24 md:px-8">
        race to prove <span className="text-primary">Ethereum</span> in
        real-time
      </h1>

      <div className="mx-auto mb-4 flex max-w-screen-xl flex-col items-center px-6 md:px-8 [&>section]:w-full">
        <section id="countdown-banners">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-4">
            <VerifierCountdownBanner />
            <ProverCountdownBanner />
          </div>
        </section>
      </div>

      <div className="mx-auto mb-16 flex max-w-screen-xl flex-col items-center px-6 md:px-8 [&>section]:w-full">
        <section id="grants-banner">
          <GrantsBanner />
        </section>
      </div>

      <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-20 px-6 md:px-8 [&>section]:w-full">
        <ProofsStats recentSummary={recentSummary} />

        <section id="zkvms">
          <Suspense fallback={null}>
            <ZkvmsSection />
          </Suspense>
        </section>

        <section id="provers">
          <Suspense fallback={null}>
            <ProversSection />
          </Suspense>
        </section>

        <section id="blocks">
          <Suspense fallback={null}>
            <BlocksSection />
          </Suspense>
        </section>
      </div>
    </>
  )
}
