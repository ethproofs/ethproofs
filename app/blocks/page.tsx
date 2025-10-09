import type { Metadata } from "next"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import { BasicTabs } from "@/components/BasicTabs"
import BlocksTable from "@/components/blocks-table/blocks-table"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import { fetchBlocksPaginated } from "@/lib/api/blocks"
import { getTeams } from "@/lib/api/teams"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({ title: "blocks" })

export default async function BlocksPage() {
  const queryClient = new QueryClient()

  const [teams] = await Promise.all([
    getTeams(),
    queryClient.prefetchQuery({
      queryKey: ["blocks", "single", DEFAULT_PAGE_STATE],
      queryFn: () => fetchBlocksPaginated(DEFAULT_PAGE_STATE, "single"),
    }),
    queryClient.prefetchQuery({
      queryKey: ["blocks", "multi", DEFAULT_PAGE_STATE],
      queryFn: () => fetchBlocksPaginated(DEFAULT_PAGE_STATE, "multi"),
    }),
  ])

  return (
    <div className="mx-auto mt-2 flex max-w-screen-xl flex-1 flex-col items-center gap-20 [&>section]:w-full">
      <section>
        <BasicTabs
          title="blocks"
          contentLeft={
            <HydrationBoundary state={dehydrate(queryClient)}>
              <BlocksTable
                className="px-6"
                machineType="single"
                teams={teams}
              />
            </HydrationBoundary>
          }
          contentRight={
            <HydrationBoundary state={dehydrate(queryClient)}>
              <BlocksTable className="px-6" machineType="multi" teams={teams} />
            </HydrationBoundary>
          }
        />
      </section>
    </div>
  )
}
