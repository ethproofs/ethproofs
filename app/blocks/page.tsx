import type { Metadata } from "next"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import BlocksTable from "@/components/BlocksTable"
import LineChartCard from "@/components/LineChartCard"
import MachineTabs from "@/components/MachineTabs"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import { db } from "@/db"
import { fetchBlocksPaginated } from "@/lib/api/blocks"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export default async function Index() {
  const queryClient = new QueryClient()

  const teams = await db.query.teams.findMany()

  await queryClient.prefetchQuery({
    queryKey: ["blocks", DEFAULT_PAGE_STATE],
    queryFn: () => fetchBlocksPaginated(DEFAULT_PAGE_STATE),
  })

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
          blocks
        </h1>
      </div>
      <div className="flex flex-1 flex-col items-center gap-20 px-6 sm:px-8 md:w-[calc(100vw_-_var(--sidebar-width))] md:px-12 lg:px-16 xl:px-20">
        <section id="kpis" className="w-full max-w-screen-xl scroll-m-20">
          <LineChartCard
            id="cost-chart"
            className="w-full"
            title="cost"
            hideKPIs
          />
        </section>

        <section className="w-full max-w-screen-xl scroll-m-20">
          <MachineTabs
            singleContent={
              <HydrationBoundary state={dehydrate(queryClient)}>
                <BlocksTable teams={teams} className="px-6" />
              </HydrationBoundary>
            }
            multiContent={
              <HydrationBoundary state={dehydrate(queryClient)}>
                <BlocksTable teams={teams} className="px-6" />
              </HydrationBoundary>
            }
          />
        </section>
      </div>
    </>
  )
}
