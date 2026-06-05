import { Suspense } from "react"
import type { Metadata } from "next"

import type { Team } from "@/lib/types"

import { BlockDifficultyDistributionChart } from "@/components/blocks/block-difficulty-distribution-chart"
import { ProvingTimeDistributionChart } from "@/components/blocks/proving-time-distribution-chart"
import { RecentBlocksBanner } from "@/components/blocks/recent-blocks-banner"
import { BlocksTabbedTable } from "@/components/blocks-table/blocks-tabbed-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { PageHeader } from "@/components/layout/page-header"

import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/lib/constants"

import { fetchBlocksPaginated, type MachineType } from "@/lib/api/blocks"
import { getTeams } from "@/lib/api/teams"
import { getMetadata } from "@/lib/metadata"

const BLOCKS_TABLE_COLUMN_COUNT = 7

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

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2 2xl:col-span-1">
          <ProvingTimeDistributionChart />
        </div>
        <div className="lg:col-span-2 2xl:col-span-1">
          <BlockDifficultyDistributionChart />
        </div>
      </section>

      <section className="mb-8">
        <Suspense
          fallback={
            <DataTableSkeleton
              columns={BLOCKS_TABLE_COLUMN_COUNT}
              rows={10}
              showPagination
            />
          }
        >
          <BlocksTableSection teams={teams} />
        </Suspense>
      </section>
    </div>
  )
}

interface BlocksTableSectionProps {
  teams: Team[]
}

async function BlocksTableSection({ teams }: BlocksTableSectionProps) {
  const machineTypes: MachineType[] = ["multi", "single"]
  const results = await Promise.all(
    machineTypes.map((machineType) =>
      fetchBlocksPaginated(
        { pageIndex: DEFAULT_PAGE_INDEX, pageSize: DEFAULT_PAGE_SIZE },
        machineType
      )
    )
  )

  const initialBlocksByMachine = Object.fromEntries(
    machineTypes.map((machineType, i) => [machineType, results[i]])
  ) as Record<MachineType, (typeof results)[number]>

  return (
    <BlocksTabbedTable
      teams={teams}
      initialBlocksByMachine={initialBlocksByMachine}
    />
  )
}
