import type { Metadata } from "next"

import ClusterAccordion from "@/components/ClusterAccordion"
import LineChartCard from "@/components/LineChartCard"
import MachineTabs from "@/components/MachineTabs"

import { demoClusterDetails } from "@/lib/dummy-data"
import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export default async function Index() {
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
          provers
        </h1>
        <div>Clusters or single machines</div>
      </div>
      <div className="flex flex-1 flex-col items-center gap-20 px-6 sm:px-8 md:w-[calc(100vw_-_var(--sidebar-width))] md:px-12 lg:px-16 xl:px-20">
        <section id="kpis" className="w-full max-w-screen-xl scroll-m-20">
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
        </section>

        <section className="w-full max-w-screen-xl scroll-m-20">
          <MachineTabs
            singleContent={<ClusterAccordion clusters={demoClusterDetails} />}
            multiContent={<ClusterAccordion clusters={demoClusterDetails} />}
          />
        </section>
      </div>
    </>
  )
}
