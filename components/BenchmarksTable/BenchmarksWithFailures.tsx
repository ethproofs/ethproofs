"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { BenchmarksTable } from "./index"

import { BenchmarkResult } from "@/lib/api/benchmarks"

interface BenchmarksWithFailuresProps {
  data: BenchmarkResult[]
}

export function BenchmarksWithFailures({ data }: BenchmarksWithFailuresProps) {
  // Separate successful and failed benchmarks
  const successfulBenchmarks = data.filter(
    (benchmark) => !!benchmark.proving.success
  )
  const failedBenchmarks = data.filter(
    (benchmark) => !benchmark.proving.success
  )
  // Sort successful benchmarks by gas throughput (slowest first)
  const sortedBenchmarks = successfulBenchmarks.sort((a, b) => {
    const aGasThroughput =
      a.proving.success && a.metadata?.block_used_gas
        ? (a.metadata.block_used_gas / a.proving.success.proving_time_ms) * 1000
        : 0
    const bGasThroughput =
      b.proving.success && b.metadata?.block_used_gas
        ? (b.metadata.block_used_gas / b.proving.success.proving_time_ms) * 1000
        : 0

    return aGasThroughput - bGasThroughput
  })

  return (
    <div className="space-y-6">
      {/* Failed benchmarks in accordion */}
      {failedBenchmarks.length > 0 && (
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="failed-tests">
            <AccordionTrigger className="px-6 py-6 text-left no-underline hover:no-underline">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  SDK reported crashes [{failedBenchmarks.length}]
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-0">
              <BenchmarksTable data={failedBenchmarks} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Successful benchmarks */}
      <div>
        <BenchmarksTable data={sortedBenchmarks} />
      </div>
    </div>
  )
}
