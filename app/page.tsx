import { Suspense } from "react"
import type { Metadata } from "next"

import ProofsStats from "@/components/ProofsStats"
import BlocksSection from "@/components/sections/BlocksSection"
import ProversSection from "@/components/sections/ProversSection"
import ZkvmsSection from "@/components/sections/ZkvmsSection"

import { getRecentSummary } from "@/lib/api/stats"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export default async function Index() {
  const recentSummary = await getRecentSummary()

  return (
    <>
      <div className="absolute top-0 h-40 w-full space-y-12 px-6 pt-24 text-center font-mono font-semibold md:px-8">
        <h1 className="text-shadow text-3xl">
          Building a fully SNARKed{" "}
          <span className="text-primary">Ethereum</span>
        </h1>
      </div>

      <div className="flex flex-1 flex-col items-center gap-20 px-6 md:px-8">
        <ProofsStats recentSummary={recentSummary} />

        <section id="zkvms" className="w-full max-w-screen-xl scroll-m-20">
          <Suspense fallback={null}>
            <ZkvmsSection />
          </Suspense>
        </section>

        <section id="provers" className="w-full max-w-screen-xl scroll-m-20">
          <Suspense fallback={null}>
            <ProversSection />
          </Suspense>
        </section>

        <section id="blocks" className="w-full max-w-screen-xl scroll-m-20">
          <Suspense fallback={null}>
            <BlocksSection />
          </Suspense>
        </section>
      </div>
    </>
  )
}
