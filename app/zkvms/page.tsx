import type { Metadata } from "next"

import SoftwareAccordion from "@/components/SoftwareAccordion"

import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export default async function Index() {
  return (
    <>
      <div className="absolute top-0 h-40 w-full space-y-12 px-6 pt-24 text-center font-mono font-semibold md:px-8">
        <h1 className="text-shadow text-3xl">zkVMs</h1>
      </div>

      <div className="flex flex-1 flex-col items-center gap-20 px-6 md:px-8">
        {/* <section id="kpis" className="w-full max-w-screen-xl scroll-m-20">
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
          <SoftwareAccordion />
        </section>
      </div>
    </>
  )
}
