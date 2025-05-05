import type { Metadata } from "next"
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import BlocksTable from "@/components/BlocksTable"
import MachineTabs from "@/components/MachineTabs"

import { DEFAULT_PAGE_STATE } from "@/lib/constants"

import { fetchBlocksPaginated } from "@/lib/api/blocks"
import { getTeams } from "@/lib/api/teams"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export default async function Index() {
  const queryClient = new QueryClient()

  const teams = await getTeams()

  await queryClient.prefetchQuery({
    queryKey: ["blocks", "single", DEFAULT_PAGE_STATE],
    queryFn: () => fetchBlocksPaginated(DEFAULT_PAGE_STATE, "single"),
  })

  await queryClient.prefetchQuery({
    queryKey: ["blocks", "multi", DEFAULT_PAGE_STATE],
    queryFn: () => fetchBlocksPaginated(DEFAULT_PAGE_STATE, "multi"),
  })

  return (
    <>
      <div className="absolute top-0 h-40 w-full space-y-12 px-6 pt-24 text-center font-mono font-semibold">
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
      <div className="flex flex-1 flex-col items-center gap-20">
        {/* <section id="chart" className="w-full max-w-screen-xl scroll-m-20">
          <LineChartCard
            id="cost-chart"
            className="w-full"
            title="cost"
            hideKPIs
            format="currency"
            data={[]}
            totalAvg={0}
            totalMedian={0}
          />
        </section> */}

        <section className="w-full max-w-screen-xl scroll-m-20">
          <MachineTabs
            singleContent={
              <HydrationBoundary state={dehydrate(queryClient)}>
                <BlocksTable
                  teams={teams}
                  className="px-6"
                  machineType="single"
                />
              </HydrationBoundary>
            }
            multiContent={
              <HydrationBoundary state={dehydrate(queryClient)}>
                <BlocksTable
                  teams={teams}
                  className="px-6"
                  machineType="multi"
                />
              </HydrationBoundary>
            }
          />
        </section>
      </div>
    </>
  )
}
