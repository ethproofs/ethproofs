import { Suspense } from "react"
import type { Metadata } from "next"

import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { PageHeader } from "@/components/layout/page-header"
import { DistributionMatrixChart } from "@/components/teams/distribution-matrix-chart"
import { ProofVolumeChart } from "@/components/teams/proof-volume-chart"
import { TeamsTabbedTable } from "@/components/teams/teams-tabbed-table"

import { fetchTeamsTableData } from "@/lib/api/teams-metrics"
import { getMetadata } from "@/lib/metadata"

const TEAMS_TABLE_COLUMN_COUNT = 9

export const metadata: Metadata = getMetadata({ title: "teams" })

export default function TeamsPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-6">
      <PageHeader
        title="teams"
        description="browse the teams that make up the Ethproofs ecosystem"
      />

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="min-w-0 lg:col-span-2 2xl:col-span-1">
          <DistributionMatrixChart />
        </div>
        <div className="min-w-0 lg:col-span-2 2xl:col-span-1">
          <ProofVolumeChart />
        </div>
      </section>

      <section className="mb-8">
        <Suspense
          fallback={
            <DataTableSkeleton columns={TEAMS_TABLE_COLUMN_COUNT} rows={10} />
          }
        >
          <TeamsTableSection />
        </Suspense>
      </section>
    </div>
  )
}

async function TeamsTableSection() {
  const data = await fetchTeamsTableData()
  return <TeamsTabbedTable data={data} />
}
