import type { Metadata } from "next"

import { PageHeader } from "@/components/layout/page-header"
import { DistributionMatrixChart } from "@/components/teams/distribution-matrix-chart"
import { ProofVolumeChart } from "@/components/teams/proof-volume-chart"
import { TeamsTabbedTable } from "@/components/teams/teams-tabbed-table"

import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({ title: "teams" })

export default function TeamsPage() {
  return (
    <div className="mx-auto max-w-screen-2xl px-6">
      <PageHeader
        title="teams"
        description="browse the teams that make up the Ethproofs ecosystem"
      />

      <section className="mb-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <DistributionMatrixChart />
          <ProofVolumeChart />
        </div>
      </section>

      <section className="mb-8">
        <TeamsTabbedTable />
      </section>
    </div>
  )
}
