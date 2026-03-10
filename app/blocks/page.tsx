import type { Metadata } from "next"

import { BlockDifficultyDistributionChart } from "@/components/blocks/block-difficulty-distribution-chart"
import { ProvingTimeDistributionChart } from "@/components/blocks/proving-time-distribution-chart"
import { RecentBlocksBanner } from "@/components/blocks/recent-blocks-banner"
import { BlocksTabbedTable } from "@/components/blocks-table/blocks-tabbed-table"
import { PageHeader } from "@/components/layout/page-header"

import { getTeams } from "@/lib/api/teams"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({ title: "blocks" })

export default async function BlocksPage() {
  const teams = await getTeams()

  return (
    <div className="mx-auto max-w-screen-2xl px-6">
      <PageHeader
        title="blocks"
        description="track block-level proving coverage and identify performance edge cases"
      />

      <section className="mb-8">
        <RecentBlocksBanner />
      </section>

      <section className="mb-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <ProvingTimeDistributionChart />
          <BlockDifficultyDistributionChart />
        </div>
      </section>

      <section className="mb-8">
        <BlocksTabbedTable teams={teams} />
      </section>
    </div>
  )
}
