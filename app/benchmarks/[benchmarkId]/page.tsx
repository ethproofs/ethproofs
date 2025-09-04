import BasicTabs from "@/components/BasicTabs"
import { BenchmarksTable } from "@/components/BenchmarksTable"
import { BenchmarksWithFailures } from "@/components/BenchmarksTable/BenchmarksWithFailures"

import { getBenchmarkData } from "@/lib/api/benchmarks"

export default async function BenchmarkPage() {
  const benchmarkData = await getBenchmarkData()
  const numberOfProverCrashes = benchmarkData.crashed.length
  const numberOfTotalBenchmarks = benchmarkData.benchmarks.length
  const numberOfSuccessfulBenchmarks = benchmarkData.benchmarks.filter(
    (benchmark) => benchmark.proving.success
  ).length

  return (
    <>
      <div className="mb-24 mt-16 space-y-2 px-6 text-center md:mt-24 md:px-8">
        <h1 className="text-shadow font-mono text-3xl font-semibold">
          EEST benchmarks
        </h1>
        <div className="mx-auto max-w-md font-sans text-sm font-normal">
          <div>performance analysis for SP1 v5.1.0</div>
          <div>gas used: 45M / proof size: 1.48MB</div>
          <div>CPU: AMD EPYC 7B13 64-Core Processor / 125GB RAM</div>
          <div>GPU: NVIDIA GeForce RTX 4090</div>
        </div>
      </div>
      <div className="mx-auto flex max-w-screen-xl flex-1 flex-col items-center gap-20 [&>section]:w-full">
        <section>
          <BasicTabs
            defaultTab="left"
            contentRight={<BenchmarksTable data={benchmarkData.crashed} />}
            contentRightTitle={`prover crashes [${numberOfProverCrashes}]`}
            contentLeft={
              <BenchmarksWithFailures data={benchmarkData.benchmarks} />
            }
            contentLeftTitle={`benchmarks [${numberOfSuccessfulBenchmarks}/${numberOfTotalBenchmarks}]`}
          />
        </section>
      </div>
    </>
  )
}
