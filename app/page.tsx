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
