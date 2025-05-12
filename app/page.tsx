import { Suspense } from "react"
import type { Metadata } from "next"

import ProofsStats from "@/components/ProofsStats"
import BlocksSection from "@/components/sections/BlocksSection"
import ProverTeamsSection from "@/components/sections/ProvingTeamsSection"
import ZkvmsSection from "@/components/sections/ZkvmsSection"

import { getRecentSummary } from "@/lib/api/stats"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export default async function Index() {
  const recentSummary = await getRecentSummary()

  return (
    <>
      <h1 className="text-shadow my-12 px-6 text-center font-mono text-3xl font-semibold md:my-24 md:px-8">
        Building a fully SNARKed <span className="text-primary">Ethereum</span>
      </h1>

      <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-20 px-6 md:px-8 [&>section]:w-full">
        <ProofsStats recentSummary={recentSummary} />

        <section id="zkvms">
          <Suspense fallback={null}>
            <ZkvmsSection />
          </Suspense>
        </section>

        <section id="provers">
          <Suspense fallback={null}>
            <ProverTeamsSection />
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
