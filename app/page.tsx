import type { Metadata } from "next"

import { PageHeader } from "@/components/layout/page-header"
import { RoadmapBanner } from "@/components/roadmap/roadmap-banner"
import { RtpDetailsSection } from "@/components/rtp/rtp-details-section"

import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export const dynamic = "force-dynamic"

export default async function Index() {
  return (
    <div className="mx-auto max-w-screen-2xl px-6">
      <PageHeader
        title={
          <>
            race to{" "}
            <span className="font-heading text-primary">mainnet-grade</span> L1
            zkEVMs
          </>
        }
        description="learn about the rules to the race and watch it unfold in real-time"
      />

      <section className="mb-8">
        <RoadmapBanner />
      </section>

      <section className="mb-8">
        <RtpDetailsSection />
      </section>
    </div>
  )
}
