import type { Metadata } from "next"

import SoftwareAccordion from "@/components/SoftwareAccordion"

import { getMetadata } from "@/lib/metadata"

export const metadata: Metadata = getMetadata()

export default async function ZkvmsPage() {
  return (
    <>
      <h1 className="text-shadow mb-24 mt-16 px-6 text-center font-mono text-3xl font-semibold md:mt-24 md:px-8">
        zkVMs
      </h1>

      <div className="mx-auto flex max-w-screen-xl flex-1 flex-col items-center gap-20 [&>section]:w-full">
        {/* <section id="kpis">
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

        <section className="overflow-x-auto">
          <SoftwareAccordion />
        </section>
      </div>
    </>
  )
}
