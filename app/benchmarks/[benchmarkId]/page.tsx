import BasicTabs from "@/components/BasicTabs"
import { BenchmarksTable } from "@/components/BenchmarksTable"
import { BenchmarksWithFailures } from "@/components/BenchmarksTable/BenchmarksWithFailures"

import { getBenchmarkData } from "@/lib/api/benchmarks"

export default async function BenchmarkPage() {
  const benchmarkData = await getBenchmarkData()

  const benchmark = benchmarkData.benchmarks.find(
    (b) => b.proving.success && b.metadata?.block_used_gas !== 0
  )

  return (
    <>
      <div className="mb-24 mt-16 space-y-2 px-6 text-center md:mt-24 md:px-8">
        <h1 className="text-shadow font-mono text-3xl font-semibold">
          EEST benchmarks
        </h1>
        <div className="mx-auto max-w-md font-sans text-sm font-normal">
          <div>performance analysis for SP1 v5.1.0</div>
          <div>hardware: AMD EPYC 7B13 64-Core Processor</div>
          <div>gas used: 45M / proof size: 1.48MB</div>
          {/* <div>
            gas used: {benchmark?.metadata?.block_used_gas} / proof size:{" "}
            {benchmark?.proving.success?.proof_size}
          </div> */}
        </div>
      </div>
      <div className="mx-auto flex max-w-screen-xl flex-1 flex-col items-center gap-20 [&>section]:w-full">
        <section>
          <BasicTabs
            defaultTab="left"
            contentRight={<BenchmarksTable data={benchmarkData.crashed} />}
            contentRightTitle="prover killers"
            contentLeft={
              <BenchmarksWithFailures data={benchmarkData.benchmarks} />
            }
            contentLeftTitle="benchmarks"
          />
        </section>
      </div>
    </>
  )
}
