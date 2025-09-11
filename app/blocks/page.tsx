import type { Metadata } from "next"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import BasicTabs from "@/components/BasicTabs"
import BlocksTable from "@/components/BlocksTable"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import { fetchBlocksPaginated } from "@/lib/api/blocks"
import { getTeams } from "@/lib/api/teams"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata({ title: "Blocks" })

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
    <>
      <h1 className="text-shadow mb-24 mt-16 px-6 text-center text-3xl font-semibold md:mt-24 md:px-8">
        blocks
      </h1>
      <div className="mx-auto flex max-w-screen-xl flex-1 flex-col items-center gap-20 [&>section]:w-full">
        <section>
          <BasicTabs
            defaultTab="left"
            contentRight={
              <HydrationBoundary state={dehydrate(queryClient)}>
                <BlocksTable teams={teams} machineType="single" />
              </HydrationBoundary>
            }
            contentLeft={
              <HydrationBoundary state={dehydrate(queryClient)}>
                <BlocksTable teams={teams} machineType="multi" />
              </HydrationBoundary>
            }
          />
        </section>
      </div>
    </>
  )
}
